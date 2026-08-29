$ErrorActionPreference = "Stop"

$workspace = "C:\M2\portfolio-jean"
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$profilePath = Join-Path $workspace ".audit-browser-profile"
$chromeOut = Join-Path $workspace ".audit-browser-stdout.log"
$chromeErr = Join-Path $workspace ".audit-browser-stderr.log"
$serverPort = 8765
$debugPort = 9333
$baseUrl = "http://127.0.0.1:$serverPort/"

$script:Socket = $null
$script:CdpId = 0
$script:LoadSeen = $false
$script:ConsoleErrors = New-Object System.Collections.Generic.List[object]
$script:ConsoleWarnings = New-Object System.Collections.Generic.List[object]
$script:NetworkErrors = New-Object System.Collections.Generic.List[object]
$script:PageConsoleErrors = New-Object System.Collections.Generic.List[object]
$script:PageConsoleWarnings = New-Object System.Collections.Generic.List[object]
$script:PageNetworkErrors = New-Object System.Collections.Generic.List[object]
$script:CurrentAuditPage = ""

function Add-CdpEvent {
  param($Message)
  if (-not $Message.method) { return }
  if ($Message.method -eq "Page.loadEventFired") {
    $script:LoadSeen = $true
    return
  }
  if ($Message.method -eq "Runtime.exceptionThrown") {
    $details = $Message.params.exceptionDetails
    $text = $details.exception.description
    if (-not $text) { $text = $details.text }
    $item = [pscustomobject]@{ page = $script:CurrentAuditPage; kind = "exception"; text = [string]$text }
    $script:ConsoleErrors.Add($item)
    $script:PageConsoleErrors.Add($item)
    return
  }
  if ($Message.method -eq "Runtime.consoleAPICalled") {
    $type = [string]$Message.params.type
    $parts = @($Message.params.args | ForEach-Object {
      if ($null -ne $_.value) { [string]$_.value }
      elseif ($_.description) { [string]$_.description }
      else { "[unserializable console value]" }
    })
    $item = [pscustomobject]@{ page = $script:CurrentAuditPage; kind = $type; text = ($parts -join " ") }
    if ($type -in @("error", "assert")) {
      $script:ConsoleErrors.Add($item)
      $script:PageConsoleErrors.Add($item)
    } elseif ($type -eq "warning") {
      $script:ConsoleWarnings.Add($item)
      $script:PageConsoleWarnings.Add($item)
    }
    return
  }
  if ($Message.method -eq "Log.entryAdded") {
    $entry = $Message.params.entry
    $item = [pscustomobject]@{ page = $script:CurrentAuditPage; kind = [string]$entry.level; text = [string]$entry.text }
    if ($entry.level -eq "error") {
      $script:ConsoleErrors.Add($item)
      $script:PageConsoleErrors.Add($item)
    } elseif ($entry.level -eq "warning") {
      $script:ConsoleWarnings.Add($item)
      $script:PageConsoleWarnings.Add($item)
    }
    return
  }
  if ($Message.method -eq "Network.responseReceived") {
    $response = $Message.params.response
    if ([int]$response.status -ge 400) {
      $item = [pscustomobject]@{ page = $script:CurrentAuditPage; kind = "http"; status = [int]$response.status; url = [string]$response.url; text = [string]$response.statusText }
      $script:NetworkErrors.Add($item)
      $script:PageNetworkErrors.Add($item)
    }
    return
  }
  if ($Message.method -eq "Network.loadingFailed") {
    $params = $Message.params
    if (-not $params.canceled) {
      $item = [pscustomobject]@{ page = $script:CurrentAuditPage; kind = "loadingFailed"; status = 0; url = [string]$params.requestId; text = [string]$params.errorText }
      $script:NetworkErrors.Add($item)
      $script:PageNetworkErrors.Add($item)
    }
  }
}

function Receive-CdpMessage {
  param([int]$TimeoutMs = 15000)
  $buffer = New-Object byte[] 1048576
  $builder = New-Object System.Text.StringBuilder
  do {
    $segment = New-Object System.ArraySegment[byte] -ArgumentList @(,$buffer)
    $cancel = New-Object System.Threading.CancellationTokenSource
    $cancel.CancelAfter($TimeoutMs)
    try {
      $task = $script:Socket.ReceiveAsync($segment, $cancel.Token)
      $result = $task.GetAwaiter().GetResult()
    } finally {
      $cancel.Dispose()
    }
    if ($result.MessageType -eq [System.Net.WebSockets.WebSocketMessageType]::Close) { throw "CDP WebSocket closed unexpectedly." }
    [void]$builder.Append([System.Text.Encoding]::UTF8.GetString($buffer, 0, $result.Count))
  } until ($result.EndOfMessage)
  return ($builder.ToString() | ConvertFrom-Json)
}

function Send-CdpMessage {
  param([string]$Json)
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Json)
  $segment = New-Object System.ArraySegment[byte] -ArgumentList @(,$bytes)
  $task = $script:Socket.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None)
  $task.GetAwaiter().GetResult()
}

function Invoke-Cdp {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [hashtable]$Params = @{},
    [int]$TimeoutMs = 15000
  )
  $script:CdpId++
  $id = $script:CdpId
  $payload = [ordered]@{ id = $id; method = $Method; params = $Params } | ConvertTo-Json -Depth 30 -Compress
  Send-CdpMessage -Json $payload
  while ($true) {
    $message = Receive-CdpMessage -TimeoutMs $TimeoutMs
    if ($message.method) { Add-CdpEvent -Message $message }
    if ($message.id -eq $id) {
      if ($message.error) { throw ("CDP " + $Method + " failed: " + ($message.error | ConvertTo-Json -Compress)) }
      return $message.result
    }
  }
}

function Wait-CdpLoad {
  param([int]$TimeoutMs = 15000)
  if ($script:LoadSeen) { return }
  $started = [DateTime]::UtcNow
  while (-not $script:LoadSeen) {
    $elapsed = ([DateTime]::UtcNow - $started).TotalMilliseconds
    if ($elapsed -ge $TimeoutMs) { throw "Timed out waiting for Page.loadEventFired on $($script:CurrentAuditPage)." }
    $remaining = [Math]::Max(250, [int]($TimeoutMs - $elapsed))
    $message = Receive-CdpMessage -TimeoutMs $remaining
    if ($message.method) { Add-CdpEvent -Message $message }
  }
}

function Evaluate-JavaScript {
  param([Parameter(Mandatory = $true)][string]$Expression, [int]$TimeoutMs = 15000)
  $result = Invoke-Cdp -Method "Runtime.evaluate" -Params @{
    expression = $Expression
    awaitPromise = $true
    returnByValue = $true
    userGesture = $true
  } -TimeoutMs $TimeoutMs
  if ($result.exceptionDetails) { throw ("Runtime evaluation failed: " + ($result.exceptionDetails | ConvertTo-Json -Depth 10 -Compress)) }
  return $result.result.value
}

function Clear-PageEvents {
  $script:PageConsoleErrors.Clear()
  $script:PageConsoleWarnings.Clear()
  $script:PageNetworkErrors.Clear()
}

function Navigate-AuditPage {
  param([Parameter(Mandatory = $true)][string]$RelativeUrl)
  $script:CurrentAuditPage = $RelativeUrl
  Clear-PageEvents
  $script:LoadSeen = $false
  [void](Invoke-Cdp -Method "Page.navigate" -Params @{ url = ($baseUrl + $RelativeUrl) })
  Wait-CdpLoad
  [void](Evaluate-JavaScript -Expression "new Promise(resolve => setTimeout(() => resolve(true), 220))")
}

function Set-Viewport {
  param([int]$Width, [int]$Height, [bool]$Mobile)
  [void](Invoke-Cdp -Method "Emulation.setDeviceMetricsOverride" -Params @{
    width = $Width
    height = $Height
    deviceScaleFactor = 1
    mobile = $Mobile
    screenWidth = $Width
    screenHeight = $Height
  })
}

function Get-PageSnapshot {
  return Evaluate-JavaScript -Expression @'
(() => {
  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('[data-layout-header], #site-header');
  const footer = document.querySelector('[data-layout-footer], #site-footer');
  const toggle = document.querySelector('#layout-menu-toggle');
  const active = document.querySelector('#nav-links a[aria-current="page"]');
  const width = Math.max(root.scrollWidth, body ? body.scrollWidth : 0);
  const rightOverflow = [...document.querySelectorAll('body *')].filter((element) => {
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.position === 'fixed' || style.position === 'absolute') return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && (rect.right > innerWidth + 1 || rect.left < -1);
  }).slice(0, 6).map((element) => ({ tag: element.tagName, id: element.id, cls: String(element.className || '').slice(0, 100), left: Math.round(element.getBoundingClientRect().left), right: Math.round(element.getBoundingClientRect().right) }));
  return {
    url: location.href,
    page: body ? body.dataset.page || '' : '',
    lang: document.documentElement.lang,
    title: document.title,
    h1Count: document.querySelectorAll('h1').length,
    main: !!document.querySelector('#main'),
    mainTextLength: (document.querySelector('#main')?.innerText || '').trim().length,
    headerReady: !!header && (header.innerText || '').trim().length > 0,
    footerReady: !!footer && (footer.innerText || '').trim().length > 0,
    activeHref: active ? active.getAttribute('href') : '',
    menuDisplay: toggle ? getComputedStyle(toggle).display : 'missing',
    innerWidth,
    scrollWidth: width,
    overflow: Math.max(0, Math.round(width - innerWidth)),
    overflowElements: rightOverflow,
    bodyHeight: Math.round(Math.max(root.scrollHeight, body ? body.scrollHeight : 0)),
    projectCards: document.querySelectorAll('.project-card').length,
    expertiseItems: document.querySelectorAll('.expertise-item').length,
    backgroundItems: document.querySelectorAll('.background-item').length,
    thesisActions: document.querySelectorAll('#thesis-actions a, #thesis-actions button').length,
    thesisResearchItems: document.querySelectorAll('#thesis-research-sections > *').length,
    thesisRelatedCards: document.querySelectorAll('#thesis-related-project .project-card').length,
    contactRows: document.querySelectorAll('#contact-links > *').length,
    socialLinks: document.querySelectorAll('#contact-socials a').length,
    cvActions: document.querySelectorAll('.cv-action-mount a, .cv-action-mount button').length
  };
})()
'@
}

function Get-PortraitSnapshot {
  return Evaluate-JavaScript -Expression @'
(() => {
  const image = document.querySelector('#profile-image');
  const placeholder = document.querySelector('#portrait-placeholder');
  const wrap = document.querySelector('.portrait-wrap');
  if (!image || !placeholder || !wrap) return { missing: true };
  const ir = image.getBoundingClientRect();
  const wr = wrap.getBoundingClientRect();
  const hit = document.elementFromPoint(ir.left + ir.width / 2, ir.top + ir.height / 2);
  return {
    missing: false,
    complete: image.complete,
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    imageHidden: image.hidden,
    imageDisplay: getComputedStyle(image).display,
    placeholderHidden: placeholder.hidden,
    placeholderDisplay: getComputedStyle(placeholder).display,
    objectFit: getComputedStyle(image).objectFit,
    objectPosition: getComputedStyle(image).objectPosition,
    imageRect: { width: Math.round(ir.width), height: Math.round(ir.height), top: Math.round(ir.top), left: Math.round(ir.left) },
    wrapRect: { width: Math.round(wr.width), height: Math.round(wr.height) },
    intrinsicRatio: image.naturalHeight ? +(image.naturalWidth / image.naturalHeight).toFixed(4) : 0,
    renderedRatio: ir.height ? +(ir.width / ir.height).toFixed(4) : 0,
    centerHit: hit ? { tag: hit.tagName, id: hit.id, cls: String(hit.className || '') } : null
  };
})()
'@
}

function Get-BackToTopSnapshot {
  return Evaluate-JavaScript -Expression @'
(() => {
  const button = document.querySelector('#back-to-top');
  if (!button) return { missing: true };
  const rect = button.getBoundingClientRect();
  const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
  return {
    missing: false,
    hidden: button.hidden,
    display: getComputedStyle(button).display,
    position: getComputedStyle(button).position,
    rect: { left: Math.round(rect.left), top: Math.round(rect.top), right: Math.round(rect.right), bottom: Math.round(rect.bottom), width: Math.round(rect.width), height: Math.round(rect.height) },
    inViewport: rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight,
    centerHit: !!hit && !!hit.closest('#back-to-top'),
    scrollY: Math.round(scrollY)
  };
})()
'@
}

function Get-FreePort {
  $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, 0)
  $listener.Start()
  $port = ([System.Net.IPEndPoint]$listener.LocalEndpoint).Port
  $listener.Stop()
  return $port
}

$serverJob = $null
$chrome = $null
$results = [ordered]@{
  environment = [ordered]@{}
  pages = New-Object System.Collections.Generic.List[object]
  portraits = New-Object System.Collections.Generic.List[object]
  interactions = [ordered]@{}
  links = [ordered]@{}
  detailPages = New-Object System.Collections.Generic.List[object]
  portalPages = New-Object System.Collections.Generic.List[object]
  consoleErrors = @()
  consoleWarnings = @()
  networkErrors = @()
}

try {
  if (-not (Test-Path $chromePath)) { throw "Chrome executable not found." }
  New-Item -ItemType Directory -Path $profilePath -Force | Out-Null
  $serverPort = Get-FreePort
  $debugPort = Get-FreePort
  $baseUrl = "http://127.0.0.1:$serverPort/"

  $serverJob = Start-Job -ArgumentList $workspace, $serverPort -ScriptBlock {
    param($Root, $Port)
    $rootFull = [System.IO.Path]::GetFullPath($Root).TrimEnd('\') + '\'
    $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
    $listener.Start()
    try {
      while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
          $stream = $client.GetStream()
          $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII, $false, 4096, $true)
          $requestLine = $reader.ReadLine()
          if (-not $requestLine) { continue }
          do { $line = $reader.ReadLine() } while ($null -ne $line -and $line -ne '')
          $parts = $requestLine.Split(' ')
          $method = $parts[0]
          $target = $parts[1].Split('?')[0]
          $decoded = [System.Uri]::UnescapeDataString($target).TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
          if (-not $decoded) { $decoded = 'index.html' }
          $path = [System.IO.Path]::GetFullPath((Join-Path $rootFull $decoded))
          $allowed = $path.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)
          if ($allowed -and (Test-Path $path -PathType Container)) { $path = Join-Path $path 'index.html' }
          if (-not $allowed -or -not (Test-Path $path -PathType Leaf)) {
            $body = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
            $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
          } else {
            $body = [System.IO.File]::ReadAllBytes($path)
            $extension = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
            $mime = switch ($extension) {
              '.html' { 'text/html; charset=utf-8' }
              '.css' { 'text/css; charset=utf-8' }
              '.js' { 'text/javascript; charset=utf-8' }
              '.svg' { 'image/svg+xml' }
              '.png' { 'image/png' }
              '.pdf' { 'application/pdf' }
              '.pptx' { 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }
              '.json' { 'application/json; charset=utf-8' }
              default { 'application/octet-stream' }
            }
            $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
          }
          $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
          $stream.Write($headerBytes, 0, $headerBytes.Length)
          if ($method -ne 'HEAD') { $stream.Write($body, 0, $body.Length) }
          $stream.Flush()
        } catch {
        } finally {
          $client.Close()
        }
      }
    } finally {
      $listener.Stop()
    }
  }

  $serverReady = $false
  for ($attempt = 0; $attempt -lt 50; $attempt++) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $baseUrl -TimeoutSec 2
      if ($response.StatusCode -eq 200) { $serverReady = $true; break }
    } catch {
      Start-Sleep -Milliseconds 100
    }
  }
  if (-not $serverReady) { throw "Local HTTP server did not start." }

  $chromeArgs = @(
    "--headless=new",
    "--remote-debugging-port=$debugPort",
    "--remote-allow-origins=*",
    "--user-data-dir=$profilePath",
    "--disable-gpu",
    "--disable-gpu-sandbox",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-default-apps",
    "--disable-sync",
    "--metrics-recording-only",
    "--mute-audio",
    "--window-size=1440,900",
    "about:blank"
  )
  $chrome = Start-Process -FilePath $chromePath -ArgumentList $chromeArgs -PassThru -WindowStyle Hidden -RedirectStandardOutput $chromeOut -RedirectStandardError $chromeErr

  $version = $null
  for ($attempt = 0; $attempt -lt 100; $attempt++) {
    if ($chrome.HasExited) { throw "Chrome exited before opening its debugging endpoint." }
    try {
      $version = Invoke-RestMethod -Uri "http://127.0.0.1:$debugPort/json/version" -TimeoutSec 2
      if ($version.webSocketDebuggerUrl) { break }
    } catch {
      Start-Sleep -Milliseconds 100
    }
  }
  if (-not $version.webSocketDebuggerUrl) { throw "Chrome debugging endpoint did not become available." }
  $targets = Invoke-RestMethod -Uri "http://127.0.0.1:$debugPort/json/list" -TimeoutSec 5
  $target = @($targets | Where-Object { $_.type -eq 'page' })[0]
  if (-not $target.webSocketDebuggerUrl) { throw "No Chrome page target was available." }

  $script:Socket = New-Object System.Net.WebSockets.ClientWebSocket
  $connectTask = $script:Socket.ConnectAsync([Uri]$target.webSocketDebuggerUrl, [System.Threading.CancellationToken]::None)
  $connectTask.GetAwaiter().GetResult()

  [void](Invoke-Cdp -Method "Page.enable")
  [void](Invoke-Cdp -Method "Runtime.enable")
  [void](Invoke-Cdp -Method "Network.enable")
  [void](Invoke-Cdp -Method "Log.enable")
  [void](Invoke-Cdp -Method "Network.setCacheDisabled" -Params @{ cacheDisabled = $true })

  $results.environment.chrome = [string]$version.Browser
  $results.environment.protocol = [string]$version.'Protocol-Version'
  $results.environment.baseUrl = $baseUrl
  $results.environment.cacheDisabled = $true

  $viewports = @(
    [pscustomobject]@{ name = 'mobile-390'; width = 390; height = 844; mobile = $true },
    [pscustomobject]@{ name = 'mobile-430'; width = 430; height = 932; mobile = $true },
    [pscustomobject]@{ name = 'tablet'; width = 768; height = 1024; mobile = $true },
    [pscustomobject]@{ name = 'laptop'; width = 1280; height = 800; mobile = $false },
    [pscustomobject]@{ name = 'wide-1440'; width = 1440; height = 900; mobile = $false }
  )
  $rootPages = @('index.html','profile.html','expertise.html','background.html','projects.html','thesis.html','teaching.html','contact.html')

  foreach ($viewport in $viewports) {
    Set-Viewport -Width $viewport.width -Height $viewport.height -Mobile $viewport.mobile
    foreach ($page in $rootPages) {
      Navigate-AuditPage -RelativeUrl $page
      $snapshot = Get-PageSnapshot
      $results.pages.Add([pscustomobject]@{
        viewport = $viewport.name
        file = $page
        page = $snapshot.page
        lang = $snapshot.lang
        h1 = $snapshot.h1Count
        header = $snapshot.headerReady
        footer = $snapshot.footerReady
        active = $snapshot.activeHref
        menu = $snapshot.menuDisplay
        overflow = $snapshot.overflow
        overflowElements = @($snapshot.overflowElements)
        bodyHeight = $snapshot.bodyHeight
        mainTextLength = $snapshot.mainTextLength
        cards = $snapshot.projectCards
        expertiseItems = $snapshot.expertiseItems
        backgroundItems = $snapshot.backgroundItems
        thesisActions = $snapshot.thesisActions
        thesisResearch = $snapshot.thesisResearchItems
        thesisRelated = $snapshot.thesisRelatedCards
        contactRows = $snapshot.contactRows
        socialLinks = $snapshot.socialLinks
        cvActions = $snapshot.cvActions
        consoleErrors = $script:PageConsoleErrors.Count
        networkErrors = $script:PageNetworkErrors.Count
      })
      if ($page -eq 'index.html') {
        $portrait = Get-PortraitSnapshot
        $results.portraits.Add([pscustomobject]@{ viewport = $viewport.name; result = $portrait })
      }
    }
  }

  Set-Viewport -Width 430 -Height 932 -Mobile $true
  Navigate-AuditPage -RelativeUrl 'index.html'
  $menuOpen = Evaluate-JavaScript -Expression @'
(() => {
  const button = document.querySelector('#layout-menu-toggle');
  button.click();
  const menu = document.querySelector('#nav-links');
  const rect = menu.getBoundingClientRect();
  return {
    expanded: button.getAttribute('aria-expanded'),
    bodyOpen: document.body.classList.contains('menu-open'),
    menuOpen: menu.classList.contains('open'),
    display: getComputedStyle(menu).display,
    inViewport: rect.left >= 0 && rect.right <= innerWidth + 1,
    focusedIsFirstLink: document.activeElement === menu.querySelector('a')
  };
})()
'@
  [void](Evaluate-JavaScript -Expression "new Promise(resolve => requestAnimationFrame(() => resolve(true)))")
  $menuFocus = Evaluate-JavaScript -Expression "document.activeElement === document.querySelector('#nav-links a')"
  $menuClose = Evaluate-JavaScript -Expression @'
(() => {
  document.querySelector('#layout-menu-toggle').click();
  return { expanded: document.querySelector('#layout-menu-toggle').getAttribute('aria-expanded'), bodyOpen: document.body.classList.contains('menu-open'), menuOpen: document.querySelector('#nav-links').classList.contains('open') };
})()
'@
  $menuOpen.focusedIsFirstLink = [bool]$menuFocus
  $results.interactions.mobileMenu = [pscustomobject]@{ open = $menuOpen; close = $menuClose }

  $languageEnglish = Evaluate-JavaScript -Expression @'
(() => {
  document.querySelector('[data-layout-lang="en"]').click();
  return new Promise(resolve => requestAnimationFrame(() => resolve({
    htmlLang: document.documentElement.lang,
    stored: localStorage.getItem('portfolio-language'),
    enPressed: document.querySelector('[data-layout-lang="en"]').getAttribute('aria-pressed'),
    heading: document.querySelector('h1')?.innerText || ''
  })));
})()
'@
  Navigate-AuditPage -RelativeUrl 'projects.html'
  [void](Invoke-Cdp -Method "Page.reload" -Params @{ ignoreCache = $true })
  $script:LoadSeen = $false
  Wait-CdpLoad
  [void](Evaluate-JavaScript -Expression "new Promise(resolve => setTimeout(() => resolve(true), 150))")
  $languagePersisted = Evaluate-JavaScript -Expression @'
({ htmlLang: document.documentElement.lang, stored: localStorage.getItem('portfolio-language'), enPressed: document.querySelector('[data-layout-lang="en"]')?.getAttribute('aria-pressed'), heading: document.querySelector('h1')?.innerText || '' })
'@
  $languageFrench = Evaluate-JavaScript -Expression @'
(() => {
  document.querySelector('[data-layout-lang="fr"]').click();
  return { htmlLang: document.documentElement.lang, stored: localStorage.getItem('portfolio-language'), frPressed: document.querySelector('[data-layout-lang="fr"]').getAttribute('aria-pressed'), heading: document.querySelector('h1')?.innerText || '' };
})()
'@
  $results.interactions.language = [pscustomobject]@{ english = $languageEnglish; persistedAfterNavigationAndHardReload = $languagePersisted; restoredFrench = $languageFrench }

  [void](Invoke-Cdp -Method "Network.setBlockedURLs" -Params @{ urls = @('*portrait-koessivi-jean-honou.png*') })
  $script:CurrentAuditPage = 'index.html (intentional portrait block)'
  Clear-PageEvents
  $script:LoadSeen = $false
  [void](Invoke-Cdp -Method "Page.navigate" -Params @{ url = ($baseUrl + 'index.html?portrait-fallback-audit=1') })
  Wait-CdpLoad
  [void](Evaluate-JavaScript -Expression "new Promise(resolve => setTimeout(() => resolve(true), 250))")
  $portraitFallback = Get-PortraitSnapshot
  [void](Invoke-Cdp -Method "Network.setBlockedURLs" -Params @{ urls = @() })
  $script:ConsoleErrors.Clear()
  $script:ConsoleWarnings.Clear()
  $script:NetworkErrors.Clear()
  Navigate-AuditPage -RelativeUrl 'index.html'
  [void](Invoke-Cdp -Method "Page.reload" -Params @{ ignoreCache = $true })
  $script:LoadSeen = $false
  Wait-CdpLoad
  [void](Evaluate-JavaScript -Expression "new Promise(resolve => setTimeout(() => resolve(true), 200))")
  $portraitRecovered = Get-PortraitSnapshot
  $results.interactions.portraitFallback = [pscustomobject]@{ blocked = $portraitFallback; recoveredAfterUnblockHardReload = $portraitRecovered }

  $backToTopResults = New-Object System.Collections.Generic.List[object]
  foreach ($backViewport in @(
    [pscustomobject]@{ name = 'mobile-390'; width = 390; height = 844; mobile = $true },
    [pscustomobject]@{ name = 'wide-1440'; width = 1440; height = 900; mobile = $false }
  )) {
    Set-Viewport -Width $backViewport.width -Height $backViewport.height -Mobile $backViewport.mobile
    Navigate-AuditPage -RelativeUrl 'index.html'
    $atTop = Get-BackToTopSnapshot
    [void](Evaluate-JavaScript -Expression "window.scrollTo(0, Math.max(700, document.documentElement.scrollHeight * 0.55)); new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))")
    $midPage = Get-BackToTopSnapshot
    [void](Evaluate-JavaScript -Expression "window.scrollTo(0, document.documentElement.scrollHeight); new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))")
    $deep = Get-BackToTopSnapshot
    [void](Invoke-Cdp -Method "Emulation.setEmulatedMedia" -Params @{ media = ''; features = @() })
    $normalClick = Evaluate-JavaScript -Expression @'
(() => {
  const original = window.scrollTo.bind(window);
  window.__auditScrollCalls = [];
  window.scrollTo = (...args) => { window.__auditScrollCalls.push(args); return original(...args); };
  document.querySelector('#back-to-top').click();
  return new Promise(resolve => setTimeout(() => resolve({ calls: window.__auditScrollCalls, scrollY: Math.round(scrollY) }), 650));
})()
'@
    [void](Invoke-Cdp -Method "Emulation.setEmulatedMedia" -Params @{ media = ''; features = @(@{ name = 'prefers-reduced-motion'; value = 'reduce' }) })
    [void](Evaluate-JavaScript -Expression "window.scrollTo = window.__auditScrollOriginal || window.scrollTo; window.scrollTo(0, document.documentElement.scrollHeight); new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))")
    $reducedClick = Evaluate-JavaScript -Expression @'
(() => {
  const original = window.scrollTo.bind(window);
  window.__auditReducedCalls = [];
  window.scrollTo = (...args) => { window.__auditReducedCalls.push(args); return original(...args); };
  document.querySelector('#back-to-top').click();
  return new Promise(resolve => setTimeout(() => resolve({ calls: window.__auditReducedCalls, scrollY: Math.round(scrollY), mediaMatches: matchMedia('(prefers-reduced-motion: reduce)').matches }), 120));
})()
'@
    [void](Invoke-Cdp -Method "Emulation.setEmulatedMedia" -Params @{ media = ''; features = @() })
    $backToTopResults.Add([pscustomobject]@{ viewport = $backViewport.name; atTop = $atTop; midPage = $midPage; deep = $deep; normalClick = $normalClick; reducedClick = $reducedClick })
  }
  $results.interactions.backToTop = $backToTopResults

  Set-Viewport -Width 1280 -Height 800 -Mobile $false
  Navigate-AuditPage -RelativeUrl 'thesis.html'
  $results.links.thesisActions = Evaluate-JavaScript -Expression @'
[...document.querySelectorAll('#thesis-actions a, #thesis-actions button')].map(element => ({ tag: element.tagName, text: element.innerText.trim(), rawHref: element.getAttribute('href'), href: element.href || '', target: element.getAttribute('target'), rel: element.getAttribute('rel'), download: element.hasAttribute('download'), disabled: element.disabled === true }))
'@
  $results.links.localAssets = Evaluate-JavaScript -Expression @'
(async () => {
  const paths = [
    'assets/images/profile/portrait-koessivi-jean-honou.png',
    'assets/documents/cv/cv-koessivi-jean-honou.pdf',
    'assets/documents/reports/multimodal-biometrics-report.pdf',
    'assets/documents/presentations/multimodal-biometrics-presentation.pptx'
  ];
  return Promise.all(paths.map(async path => {
    const response = await fetch(path, { cache: 'no-store' });
    const buffer = await response.arrayBuffer();
    return { path, status: response.status, ok: response.ok, contentType: response.headers.get('content-type'), bytes: buffer.byteLength };
  }));
})()
'@ -TimeoutMs 30000

  Navigate-AuditPage -RelativeUrl 'index.html'
  $results.links.homeCv = Evaluate-JavaScript -Expression @'
(() => { const a = document.querySelector('#hero-cv-action a'); return a ? { rawHref: a.getAttribute('href'), href: a.href, download: a.hasAttribute('download') } : null; })()
'@
  Navigate-AuditPage -RelativeUrl 'contact.html'
  $results.links.contact = Evaluate-JavaScript -Expression @'
({
  cv: (() => { const a = document.querySelector('#contact-cv-action a'); return a ? { rawHref: a.getAttribute('href'), href: a.href, download: a.hasAttribute('download') } : null; })(),
  socials: [...document.querySelectorAll('#contact-socials a')].map(a => ({ text: a.innerText.trim(), rawHref: a.getAttribute('href'), target: a.target, rel: a.rel })),
  footerCv: (() => { const a = [...document.querySelectorAll('footer a')].find(a => a.hasAttribute('download')); return a ? { rawHref: a.getAttribute('href'), href: a.href, download: a.hasAttribute('download') } : null; })()
})
'@
  Navigate-AuditPage -RelativeUrl 'teaching.html'
  $results.links.portal = Evaluate-JavaScript -Expression @'
(() => { const a = [...document.querySelectorAll('a')].find(a => a.getAttribute('href') === 'teaching/index.html'); return a ? { rawHref: a.getAttribute('href'), href: a.href, text: a.innerText.trim() } : null; })()
'@
  Navigate-AuditPage -RelativeUrl 'projects.html'
  $projectLinks = Evaluate-JavaScript -Expression @'
[...document.querySelectorAll('#projects-list a.project-link')].map(a => ({ rawHref: a.getAttribute('href'), href: a.href, text: a.innerText.trim() }))
'@
  $results.links.projects = $projectLinks
  foreach ($link in @($projectLinks)) {
    $relative = [Uri]::UnescapeDataString(([Uri]$link.href).AbsolutePath.TrimStart('/'))
    Navigate-AuditPage -RelativeUrl $relative
    $detailSnapshot = Get-PageSnapshot
    $detailSpecific = Evaluate-JavaScript -Expression @'
({ project: document.body.dataset.project || '', heading: document.querySelector('h1')?.innerText || '', sections: document.querySelectorAll('.detail-section').length, technologies: document.querySelectorAll('.detail-tag-list li').length, unavailable: !!document.querySelector('.detail-unavailable') })
'@
    $results.detailPages.Add([pscustomobject]@{ file = $relative; snapshot = $detailSnapshot; detail = $detailSpecific; consoleErrors = $script:PageConsoleErrors.Count; networkErrors = $script:PageNetworkErrors.Count })
  }

  foreach ($portalPage in @('teaching/index.html','teaching/login.html','teaching/dashboard.html')) {
    Navigate-AuditPage -RelativeUrl $portalPage
    $portalSnapshot = Evaluate-JavaScript -Expression @'
({ title: document.title, h1: document.querySelector('h1')?.innerText || '', mainTextLength: (document.querySelector('main')?.innerText || '').trim().length, configNotice: (document.body.innerText || '').includes('configuration') || (document.body.innerText || '').includes('Configuration'), bodyHiddenDashboard: document.querySelector('[data-dashboard-content]') ? getComputedStyle(document.querySelector('[data-dashboard-content]')).display : null })
'@
    $results.portalPages.Add([pscustomobject]@{ file = $portalPage; snapshot = $portalSnapshot; consoleErrors = $script:PageConsoleErrors.Count; networkErrors = $script:PageNetworkErrors.Count })
  }

  $results.consoleErrors = @($script:ConsoleErrors)
  $results.consoleWarnings = @($script:ConsoleWarnings)
  $results.networkErrors = @($script:NetworkErrors)
  $results | ConvertTo-Json -Depth 20 -Compress
} finally {
  if ($script:Socket) {
    try {
      if ($script:Socket.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
        $closeTask = $script:Socket.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "audit complete", [System.Threading.CancellationToken]::None)
        $closeTask.GetAwaiter().GetResult()
      }
    } catch {
    }
    $script:Socket.Dispose()
  }
  if ($chrome -and -not $chrome.HasExited) {
    try { Stop-Process -Id $chrome.Id -Force -ErrorAction SilentlyContinue } catch {}
  }
  if ($serverJob) {
    Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job -Job $serverJob -Force -ErrorAction SilentlyContinue
  }
}
