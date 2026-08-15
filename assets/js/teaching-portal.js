(() => {
  "use strict";

  const LANGUAGE_KEY = "portfolio-language";
  const LANGUAGES = ["fr", "en"];
  const MAX_FILES = 5;
  const MAX_FILE_BYTES = 6 * 1024 * 1024;
  const ALLOWED_UPLOADS = Object.freeze({
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    odt: "application/vnd.oasis.opendocument.text",
    txt: "text/plain",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg"
  });
  let languageLockCount = 0;

  const copy = {
    fr: {
      meta: {
        landingTitle: "Espace étudiant — Koessivi Jean HONOU",
        landingDescription: "Portail pédagogique pour accéder aux travaux, ressources, dépôts et échanges après authentification.",
        loginTitle: "Connexion à l’espace étudiant — Koessivi Jean HONOU",
        loginDescription: "Connexion sécurisée à l’espace étudiant.",
        dashboardTitle: "Tableau de bord étudiant — Koessivi Jean HONOU",
        dashboardDescription: "Espace privé réservé aux étudiants authentifiés."
      },
      a11y: { skip: "Aller au contenu", language: "Choix de la langue", navigation: "Navigation de l’espace étudiant" },
      header: { portal: "Espace étudiant", portfolio: "Retour au portfolio", portalHome: "Accueil du portail", signOut: "Se déconnecter" },
      footer: { label: "Espace étudiant de Koessivi Jean HONOU", privacy: "Accès privé protégé par le service d’authentification." },
      common: {
        checking: "Vérification de la configuration…",
        configured: "Service configuré",
        configuredText: "Le service sécurisé est disponible. Vous pouvez accéder à la page de connexion.",
        sessionActive: "Session active",
        sessionActiveText: "Une session authentifiée est disponible sur cet appareil.",
        notConfigured: "Portail non configuré",
        notConfiguredText: "La connexion sera disponible après configuration sécurisée du service. Aucune donnée privée n’est exposée.",
        serviceError: "Le service est momentanément indisponible.",
        required: "Champ obligatoire",
        loading: "Chargement…",
        retry: "Réessayer"
      },
      landing: {
        eyebrow: "Transmission & accompagnement",
        title: "Un espace de travail clair pour suivre les activités pédagogiques.",
        lead: "Ce portail est préparé pour centraliser les travaux à faire, les ressources, les dépôts et les questions dans un environnement privé.",
        login: "Accéder à la connexion",
        dashboard: "Reprendre mon espace",
        stateLabel: "État du portail",
        privacyEyebrow: "Confidentialité",
        privacyTitle: "Aucune information étudiante sur la page publique.",
        privacyText: "Les contenus individuels ne sont demandés qu’après authentification. Aucun nom, devoir ou échange privé n’est intégré à cette interface publique.",
        featureEyebrow: "Fonctionnement",
        featureTitle: "L’essentiel, sans distraction.",
        feature1Title: "À faire",
        feature1Text: "Retrouver les consignes et échéances communiquées dans l’espace privé.",
        feature2Title: "Ressources",
        feature2Text: "Consulter les supports pédagogiques autorisés pour votre compte.",
        feature3Title: "Dépôts & questions",
        feature3Text: "Transmettre un travail ou une question lorsque le backend authentifié l’autorise."
      },
      login: {
        eyebrow: "Accès privé",
        title: "Connexion à l’espace étudiant",
        lead: "Utilisez uniquement les identifiants fournis pour cet espace. Aucun mot de passe n’est conservé par cette page.",
        email: "Adresse e-mail",
        emailPlaceholder: "votre.adresse@exemple.fr",
        password: "Mot de passe",
        passwordPlaceholder: "Votre mot de passe",
        submit: "Se connecter",
        pending: "Connexion en cours…",
        back: "Retour à l’accueil du portail",
        unavailable: "La connexion n’est pas encore disponible : le service sécurisé doit d’abord être configuré.",
        capabilityUnavailable: "Le service est configuré, mais la fonction de connexion n’est pas disponible.",
        failed: "Connexion impossible. Vérifiez vos informations puis réessayez.",
        authenticated: "Connexion réussie. Ouverture du tableau de bord…"
      },
      dashboard: {
        eyebrow: "Espace privé",
        title: "Mon espace de travail",
        lead: "Retrouvez ici les informations accessibles à votre session authentifiée.",
        checking: "Vérification de votre session…",
        loginRequired: "Authentification requise",
        loginRequiredText: "Connectez-vous pour accéder au contenu privé de ce tableau de bord.",
        goToLogin: "Aller à la connexion",
        notConfiguredText: "Le tableau de bord restera verrouillé tant que le backend sécurisé ne sera pas configuré.",
        teacherTitle: "Espace enseignant à venir",
        teacherText: "Cette session enseignant est autorisée, mais cette interface est réservée au parcours étudiant. Aucun contenu étudiant n’est affiché ici.",
        greeting: "Bonjour, {name}.",
        rlsNote: "Le masquage de cette interface est une protection d’usage. L’autorisation réelle des données doit toujours être appliquée par les politiques RLS du backend.",
        loadingData: "Chargement de votre espace…",
        loadFailed: "Impossible de charger les données autorisées pour cette session.",
        dataUnavailable: "La lecture du tableau de bord n’est pas encore disponible sur le service.",
        todo: "À faire",
        todoEmpty: "Aucun travail à afficher pour le moment.",
        resources: "Ressources",
        resourcesEmpty: "Aucune ressource n’est disponible pour le moment.",
        submissions: "Mes dépôts",
        submissionsEmpty: "Aucun dépôt à afficher pour le moment.",
        questions: "Mes questions",
        questionsEmpty: "Aucune question à afficher pour le moment.",
        due: "Échéance",
        instructions: "Consignes",
        submitted: "Déposé le",
        asked: "Envoyée le",
        answer: "Réponse",
        openResource: "Ouvrir la ressource",
        openSubmissionFile: "Ouvrir le fichier : {name}",
        assignment: "Activité concernée",
        selectAssignment: "Sélectionner une activité",
        submissionTitle: "Déposer un travail",
        submissionIntro: "Le dépôt est activé uniquement avec une session valide et un backend authentifié.",
        files: "Fichiers",
        filesHelp: "PDF, DOCX, ODT, TXT, PNG ou JPEG. 5 fichiers maximum et 6 Mo chacun. Le serveur doit refaire ces contrôles.",
        message: "Message facultatif",
        messagePlaceholder: "Ajouter une précision utile…",
        upload: "Envoyer le dépôt",
        uploading: "Envoi en cours…",
        uploadUnavailable: "Le dépôt de fichiers n’est pas disponible pour cette session.",
        uploadSuccess: "Le dépôt a été transmis au service sécurisé.",
        uploadFailed: "Le dépôt n’a pas pu être transmis. Réessayez plus tard.",
        noFile: "Sélectionnez au moins un fichier.",
        tooManyFiles: "Vous pouvez sélectionner au maximum 5 fichiers.",
        invalidFile: "Un fichier utilise un format non autorisé.",
        emptyFile: "Les fichiers vides ne peuvent pas être envoyés.",
        fileTooLarge: "Chaque fichier doit peser au maximum 6 Mo.",
        questionTitle: "Poser une question",
        questionIntro: "Votre question sera envoyée uniquement au service authentifié.",
        questionMessage: "Question",
        questionPlaceholder: "Formulez votre question sans inclure de donnée sensible inutile…",
        sendQuestion: "Envoyer la question",
        sendingQuestion: "Envoi en cours…",
        questionUnavailable: "L’envoi de questions n’est pas disponible pour cette session.",
        questionSuccess: "Votre question a été transmise au service sécurisé.",
        questionFailed: "La question n’a pas pu être transmise. Réessayez plus tard.",
        signedOut: "Votre session est terminée.",
        signOutFailed: "La déconnexion n’a pas abouti. Votre session reste active."
      }
    },
    en: {
      meta: {
        landingTitle: "Student portal — Koessivi Jean HONOU",
        landingDescription: "A learning portal for accessing tasks, resources, submissions and discussions after authentication.",
        loginTitle: "Student portal sign-in — Koessivi Jean HONOU",
        loginDescription: "Secure sign-in to the student portal.",
        dashboardTitle: "Student dashboard — Koessivi Jean HONOU",
        dashboardDescription: "A private area reserved for authenticated students."
      },
      a11y: { skip: "Skip to content", language: "Language selection", navigation: "Student portal navigation" },
      header: { portal: "Student portal", portfolio: "Back to portfolio", portalHome: "Portal home", signOut: "Sign out" },
      footer: { label: "Koessivi Jean HONOU student portal", privacy: "Private access protected by the authentication service." },
      common: {
        checking: "Checking configuration…",
        configured: "Service configured",
        configuredText: "The secure service is available. You can continue to the sign-in page.",
        sessionActive: "Active session",
        sessionActiveText: "An authenticated session is available on this device.",
        notConfigured: "Portal not configured",
        notConfiguredText: "Sign-in will become available after the service is configured securely. No private data is exposed.",
        serviceError: "The service is temporarily unavailable.",
        required: "Required field",
        loading: "Loading…",
        retry: "Try again"
      },
      landing: {
        eyebrow: "Teaching & support",
        title: "A clear workspace for keeping track of learning activities.",
        lead: "This portal is prepared to bring tasks, resources, submissions and questions together in a private environment.",
        login: "Go to sign-in",
        dashboard: "Resume my workspace",
        stateLabel: "Portal status",
        privacyEyebrow: "Privacy",
        privacyTitle: "No student information on the public page.",
        privacyText: "Individual content is requested only after authentication. No name, assignment or private discussion is embedded in this public interface.",
        featureEyebrow: "How it works",
        featureTitle: "The essentials, without distraction.",
        feature1Title: "To do",
        feature1Text: "Find instructions and deadlines shared in the private area.",
        feature2Title: "Resources",
        feature2Text: "Access learning materials authorised for your account.",
        feature3Title: "Submissions & questions",
        feature3Text: "Submit work or a question when the authenticated backend permits it."
      },
      login: {
        eyebrow: "Private access",
        title: "Sign in to the student portal",
        lead: "Use only the credentials provided for this space. This page never stores your password.",
        email: "Email address",
        emailPlaceholder: "your.address@example.com",
        password: "Password",
        passwordPlaceholder: "Your password",
        submit: "Sign in",
        pending: "Signing in…",
        back: "Back to the portal home",
        unavailable: "Sign-in is not available yet: the secure service must be configured first.",
        capabilityUnavailable: "The service is configured, but the sign-in capability is unavailable.",
        failed: "Unable to sign in. Check your details and try again.",
        authenticated: "Signed in successfully. Opening the dashboard…"
      },
      dashboard: {
        eyebrow: "Private area",
        title: "My workspace",
        lead: "Find the information made available to your authenticated session here.",
        checking: "Checking your session…",
        loginRequired: "Authentication required",
        loginRequiredText: "Sign in to access the private content in this dashboard.",
        goToLogin: "Go to sign-in",
        notConfiguredText: "The dashboard will remain locked until the secure backend is configured.",
        teacherTitle: "Teacher workspace coming later",
        teacherText: "This teacher session is authorised, but this interface is limited to the student journey. No student content is shown here.",
        greeting: "Hello, {name}.",
        rlsNote: "Hiding this interface is only a usability safeguard. Actual data authorisation must always be enforced by backend RLS policies.",
        loadingData: "Loading your workspace…",
        loadFailed: "Unable to load the data authorised for this session.",
        dataUnavailable: "Dashboard data access is not available on the service yet.",
        todo: "To do",
        todoEmpty: "No work to display at the moment.",
        resources: "Resources",
        resourcesEmpty: "No resource is available at the moment.",
        submissions: "My submissions",
        submissionsEmpty: "No submission to display at the moment.",
        questions: "My questions",
        questionsEmpty: "No question to display at the moment.",
        due: "Due",
        instructions: "Instructions",
        submitted: "Submitted",
        asked: "Sent",
        answer: "Answer",
        openResource: "Open resource",
        openSubmissionFile: "Open file: {name}",
        assignment: "Related activity",
        selectAssignment: "Select an activity",
        submissionTitle: "Submit work",
        submissionIntro: "Submission is enabled only with a valid session and an authenticated backend.",
        files: "Files",
        filesHelp: "PDF, DOCX, ODT, TXT, PNG or JPEG. Up to 5 files and 6 MB each. The server must repeat these checks.",
        message: "Optional message",
        messagePlaceholder: "Add a useful note…",
        upload: "Send submission",
        uploading: "Uploading…",
        uploadUnavailable: "File submission is unavailable for this session.",
        uploadSuccess: "The submission was sent to the secure service.",
        uploadFailed: "The submission could not be sent. Try again later.",
        noFile: "Select at least one file.",
        tooManyFiles: "You may select up to 5 files.",
        invalidFile: "A file uses an unsupported format.",
        emptyFile: "Empty files cannot be submitted.",
        fileTooLarge: "Each file must be no larger than 6 MB.",
        questionTitle: "Ask a question",
        questionIntro: "Your question will be sent only to the authenticated service.",
        questionMessage: "Question",
        questionPlaceholder: "Write your question without adding unnecessary sensitive information…",
        sendQuestion: "Send question",
        sendingQuestion: "Sending…",
        questionUnavailable: "Question submission is unavailable for this session.",
        questionSuccess: "Your question was sent to the secure service.",
        questionFailed: "The question could not be sent. Try again later.",
        signedOut: "Your session has ended.",
        signOutFailed: "Sign-out did not complete. Your session remains active."
      }
    }
  };

  const state = {
    language: "fr",
    page: document.body.dataset.portalPage || "landing",
    backend: null,
    configured: false,
    session: null,
    dashboardData: null,
    dashboardLoading: false,
    dashboardError: false,
    dashboardRequestId: 0
  };

  function readLanguage() {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_KEY);
      return LANGUAGES.includes(stored) ? stored : "fr";
    } catch (error) {
      return "fr";
    }
  }

  function storeLanguage(language) {
    try {
      window.localStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      // Language switching remains available without persistent storage.
    }
  }

  function lockLanguageControls(locked) {
    languageLockCount = Math.max(0, languageLockCount + (locked ? 1 : -1));
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.disabled = languageLockCount > 0;
    });
  }

  function getCopy(path, language = state.language) {
    return path.split(".").reduce((value, key) => value?.[key], copy[language]);
  }

  function localize(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (typeof value === "object") return String(value[state.language] ?? value.fr ?? value.en ?? "");
    return "";
  }

  function limitedText(value, limit = 3000) {
    return localize(value).trim().slice(0, limit);
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value || "";
  }

  function setMessage(element, message, tone = "neutral", copyKey = "") {
    if (!element) return;
    element.textContent = message || "";
    element.dataset.tone = tone;
    if (copyKey) element.dataset.portalMessageKey = copyKey;
    else delete element.dataset.portalMessageKey;
    element.hidden = !message;
  }

  function setCopyMessage(element, copyKey, tone = "neutral") {
    setMessage(element, copyKey ? getCopy(copyKey) : "", tone, copyKey);
  }

  function refreshDynamicMessages() {
    document.querySelectorAll("[data-portal-message-key]").forEach((element) => {
      const value = getCopy(element.dataset.portalMessageKey);
      if (typeof value === "string") element.textContent = value;
    });
  }

  function updateMetadata() {
    const key = state.page === "dashboard" ? "dashboard" : state.page === "login" ? "login" : "landing";
    document.title = getCopy(`meta.${key}Title`);
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = getCopy(`meta.${key}Description`);
  }

  function applyLanguage(language, persist = true) {
    state.language = LANGUAGES.includes(language) ? language : "fr";
    document.documentElement.lang = state.language;
    if (persist) storeLanguage(state.language);

    document.querySelectorAll("[data-portal-i18n]").forEach((element) => {
      const value = getCopy(element.dataset.portalI18n);
      if (typeof value === "string") element.textContent = value;
    });
    document.querySelectorAll("[data-portal-i18n-aria]").forEach((element) => {
      const value = getCopy(element.dataset.portalI18nAria);
      if (typeof value === "string") element.setAttribute("aria-label", value);
    });
    document.querySelectorAll("[data-portal-i18n-placeholder]").forEach((element) => {
      const value = getCopy(element.dataset.portalI18nPlaceholder);
      if (typeof value === "string") element.setAttribute("placeholder", value);
    });
    document.querySelectorAll("[data-lang]").forEach((button) => {
      const active = button.dataset.lang === state.language;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    updateMetadata();
    renderPortalState();
    if (state.page === "dashboard" && state.session) renderDashboardData();
    refreshDynamicMessages();
  }

  function hasBackendMethod(name) {
    return Boolean(state.backend && typeof state.backend[name] === "function");
  }

  function unwrapSession(result) {
    if (!result) return null;
    if (result.error) return null;
    if (result.data?.session) return result.data.session;
    if (result.session) return result.session;
    if (result.user) return result;
    return null;
  }

  function sessionUserId(session) {
    return limitedText(session?.user?.id, 200);
  }

  function clearPrivateDashboard() {
    state.dashboardData = null;
    ["#todo-list", "#resources-list", "#submissions-list", "#questions-list"].forEach((selector) => {
      document.querySelector(selector)?.replaceChildren();
    });
    ["#submission-form", "#question-form"].forEach((selector) => {
      const form = document.querySelector(selector);
      if (!form) return;
      form.reset();
      setFormEnabled(form, false);
    });
    const greeting = document.querySelector("#dashboard-greeting");
    if (greeting) {
      greeting.textContent = "";
      greeting.hidden = true;
    }
  }

  function invalidateDashboard() {
    state.dashboardRequestId += 1;
    state.dashboardLoading = false;
    state.dashboardError = false;
    clearPrivateDashboard();
  }

  async function detectBackend() {
    state.backend = window.TEACHING_PORTAL_BACKEND || null;
    if (!hasBackendMethod("isConfigured")) {
      state.configured = false;
      state.session = null;
      return;
    }

    try {
      const result = await state.backend.isConfigured();
      state.configured = result === true || result?.configured === true;
    } catch (error) {
      state.configured = false;
    }

    if (!state.configured || !hasBackendMethod("getSession")) {
      state.session = null;
      return;
    }

    try {
      state.session = unwrapSession(await state.backend.getSession());
    } catch (error) {
      state.session = null;
    }
  }

  function subscribeToAuthChanges() {
    if (!state.configured || !hasBackendMethod("onAuthStateChange")) return;
    try {
      state.backend.onAuthStateChange((...args) => {
        const candidate = args.length > 1 ? args[1] : args[0];
        const nextSession = unwrapSession(candidate);
        const identityChanged = sessionUserId(state.session) !== sessionUserId(nextSession);
        state.session = nextSession;
        if (state.page === "dashboard" && identityChanged) invalidateDashboard();
        if (state.page === "dashboard") {
          updateDashboardAccess();
        } else if (state.page === "landing") {
          renderLandingState();
        }
      });
    } catch (error) {
      // Session checks still run on initial page load.
    }
  }

  function stateCard(status, title, description) {
    const card = document.querySelector("#portal-config-state");
    if (!card) return;
    card.dataset.state = status;
    setText("#portal-config-title", title);
    setText("#portal-config-description", description);
  }

  function renderLandingState() {
    const action = document.querySelector("#portal-primary-action");
    if (state.configured && state.session) {
      stateCard("ready", getCopy("common.sessionActive"), getCopy("common.sessionActiveText"));
      if (action) {
        action.href = "dashboard.html";
        action.textContent = getCopy("landing.dashboard");
      }
      return;
    }
    if (state.configured) {
      stateCard("ready", getCopy("common.configured"), getCopy("common.configuredText"));
    } else {
      stateCard("unconfigured", getCopy("common.notConfigured"), getCopy("common.notConfiguredText"));
    }
    if (action) {
      action.href = "login.html";
      action.textContent = getCopy("landing.login");
    }
  }

  function setFormEnabled(form, enabled) {
    if (!form) return;
    form.querySelectorAll("input, select, textarea, button").forEach((control) => {
      control.disabled = !enabled;
    });
  }

  function renderLoginState() {
    const form = document.querySelector("#portal-login-form");
    const status = document.querySelector("#login-service-status");
    const capable = state.configured && hasBackendMethod("signIn") && hasBackendMethod("getSession");
    setFormEnabled(form, capable);

    if (!state.configured) {
      setCopyMessage(status, "login.unavailable", "warning");
    } else if (!capable) {
      setCopyMessage(status, "login.capabilityUnavailable", "warning");
    } else {
      setCopyMessage(status, "", "neutral");
    }
  }

  function renderPortalState() {
    if (state.page === "landing") renderLandingState();
    if (state.page === "login") renderLoginState();
    if (state.page === "dashboard") renderDashboardAccessState();
  }

  async function handleLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.querySelector("#login-form-message");
    if (!state.configured || !hasBackendMethod("signIn") || !hasBackendMethod("getSession")) {
      renderLoginState();
      return;
    }
    if (!form.reportValidity()) return;

    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    const submit = form.querySelector('button[type="submit"]');
    form.setAttribute("aria-busy", "true");
    lockLanguageControls(true);
    submit.disabled = true;
    submit.textContent = getCopy("login.pending");
    setCopyMessage(message, "", "neutral");

    try {
      const result = await state.backend.signIn({ email, password });
      if (result?.error) throw new Error("sign-in-failed");
      state.session = unwrapSession(result) || unwrapSession(await state.backend.getSession());
      if (!state.session) throw new Error("session-unavailable");
      form.elements.password.value = "";
      setCopyMessage(message, "login.authenticated", "success");
      window.location.replace("dashboard.html");
    } catch (error) {
      setCopyMessage(message, "login.failed", "error");
      submit.disabled = false;
      submit.textContent = getCopy("login.submit");
    } finally {
      form.removeAttribute("aria-busy");
      lockLanguageControls(false);
    }
  }

  function normalizeDashboardData(result) {
    if (!result || result.error) throw new Error("dashboard-data-unavailable");
    const payload = result.data && !Array.isArray(result.data) ? result.data : result;
    const array = (value) => Array.isArray(value) ? value.slice(0, 100) : [];
    const role = limitedText(payload.role ?? payload.profile?.role, 30).toLowerCase();
    if (!["student", "teacher"].includes(role)) throw new Error("dashboard-role-unavailable");
    const configuredAssignments = array(payload.assignments);
    const assignmentSource = configuredAssignments.length
      ? configuredAssignments
      : array(payload.todo ?? payload.tasks);
    const todo = array(payload.todo ?? payload.tasks ?? assignmentSource).filter((item) => {
      const status = limitedText(item?.status, 30).toLowerCase();
      return status === "published";
    });
    const assignmentTitleById = new Map(assignmentSource.map((assignment) => [
      limitedText(assignment?.id ?? assignment?.assignmentId ?? assignment?.assignment_id, 200),
      limitedText(firstValue(assignment, ["title", "assignmentTitle", "name"]), 240)
    ]).filter(([id, title]) => id && title));
    const withAssignmentTitle = (item) => {
      if (!item || typeof item !== "object" || limitedText(item.assignmentTitle, 240)) return item;
      const assignmentId = limitedText(item.assignmentId ?? item.assignment_id, 200);
      const assignmentTitle = assignmentTitleById.get(assignmentId);
      return assignmentTitle ? { ...item, assignmentTitle } : item;
    };
    return {
      role,
      profile: { fullName: limitedText(payload.profile?.full_name ?? payload.profile?.fullName, 240) },
      todo,
      resources: array(payload.resources),
      submissions: array(payload.submissions).map(withAssignmentTitle),
      questions: array(payload.questions).map(withAssignmentTitle),
      assignments: assignmentSource
    };
  }

  function safeUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const url = new URL(value, window.location.href);
      if (url.protocol === "https:" || (url.protocol === "http:" && url.origin === window.location.origin)) {
        return url.href;
      }
    } catch (error) {
      return "";
    }
    return "";
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(state.language === "fr" ? "fr-FR" : "en-GB", { dateStyle: "medium" }).format(date);
  }

  function firstValue(item, keys) {
    for (const key of keys) {
      const value = item?.[key];
      if (value !== null && value !== undefined && limitedText(value)) return value;
    }
    return "";
  }

  function appendMeta(container, label, value) {
    const rendered = limitedText(value, 300);
    if (!rendered) return;
    const meta = document.createElement("p");
    meta.className = "portal-item-meta";
    const strong = document.createElement("strong");
    strong.textContent = `${label} : `;
    const span = document.createElement("span");
    span.textContent = rendered;
    meta.append(strong, span);
    container.append(meta);
  }

  function renderItems(selector, items, type, emptyKey) {
    const container = document.querySelector(selector);
    if (!container) return;
    container.replaceChildren();
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "portal-empty";
      empty.textContent = getCopy(emptyKey);
      container.append(empty);
      return;
    }

    items.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const article = document.createElement("article");
      article.className = "portal-list-item";
      const title = document.createElement("h3");
      title.textContent = limitedText(firstValue(item, ["title", "assignmentTitle", "subject", "fileName", "name"]), 240) || "—";
      article.append(title);

      const description = limitedText(firstValue(item, ["description", "summary", "message"]));
      if (description) {
        const paragraph = document.createElement("p");
        paragraph.textContent = description;
        article.append(paragraph);
      }

      if (type === "todo") {
        const instructions = limitedText(item.instructions, 12000);
        if (instructions && instructions !== description) {
          const instructionsBlock = document.createElement("div");
          instructionsBlock.className = "portal-instructions";
          const label = document.createElement("strong");
          label.textContent = getCopy("dashboard.instructions");
          const text = document.createElement("p");
          text.textContent = instructions;
          instructionsBlock.append(label, text);
          article.append(instructionsBlock);
        }
        appendMeta(article, getCopy("dashboard.due"), formatDate(item.dueAt ?? item.due_at ?? item.deadline));
      }
      if (type === "submission") {
        appendMeta(article, getCopy("dashboard.submitted"), formatDate(item.submittedAt ?? item.submitted_at ?? item.createdAt ?? item.created_at));
        const fileList = document.createElement("div");
        fileList.className = "portal-file-list";
        (Array.isArray(item.files) ? item.files.slice(0, 5) : []).forEach((file, index) => {
          const href = safeUrl(file?.url ?? file?.href ?? file?.signedUrl ?? file?.signed_url);
          if (!href) return;
          const rawName = limitedText(file?.name ?? file?.fileName, 180)
            .replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-/i, "");
          const name = rawName || `${index + 1}`;
          const link = document.createElement("a");
          link.className = "portal-resource-link";
          link.href = href;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = getCopy("dashboard.openSubmissionFile").replace("{name}", name);
          fileList.append(link);
        });
        if (fileList.children.length) article.append(fileList);
      }
      if (type === "question") {
        appendMeta(article, getCopy("dashboard.asked"), formatDate(item.createdAt ?? item.created_at));
        const answer = limitedText(item.answer ?? item.response);
        if (answer) {
          const answerBlock = document.createElement("div");
          answerBlock.className = "portal-answer";
          const label = document.createElement("strong");
          label.textContent = getCopy("dashboard.answer");
          const text = document.createElement("p");
          text.textContent = answer;
          answerBlock.append(label, text);
          article.append(answerBlock);
        }
      }
      if (type === "resource") {
        const href = safeUrl(item.url ?? item.href ?? item.signedUrl ?? item.signed_url);
        if (href) {
          const link = document.createElement("a");
          link.className = "portal-resource-link";
          link.href = href;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = getCopy("dashboard.openResource");
          article.append(link);
        }
      }
      container.append(article);
    });

    if (!container.children.length) {
      const empty = document.createElement("p");
      empty.className = "portal-empty";
      empty.textContent = getCopy(emptyKey);
      container.append(empty);
    }
  }

  function assignmentOptions(publishedOnly = false) {
    return (state.dashboardData?.assignments || []).filter((item) => {
      const status = limitedText(item?.status, 30).toLowerCase();
      return publishedOnly ? status === "published" : ["published", "closed"].includes(status);
    }).map((item) => ({
      id: limitedText(item?.id ?? item?.assignmentId ?? item?.assignment_id, 200),
      title: limitedText(firstValue(item, ["title", "assignmentTitle", "name"]), 240)
    })).filter((item) => item.id && item.title);
  }

  function populateAssignmentSelect(selector, publishedOnly = false) {
    const select = document.querySelector(selector);
    if (!select) return false;
    const previous = select.value;
    select.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = getCopy("dashboard.selectAssignment");
    placeholder.disabled = true;
    placeholder.selected = true;
    select.append(placeholder);
    assignmentOptions(publishedOnly).forEach((assignment) => {
      const option = document.createElement("option");
      option.value = assignment.id;
      option.textContent = assignment.title;
      if (assignment.id === previous) {
        option.selected = true;
        placeholder.selected = false;
      }
      select.append(option);
    });
    return select.options.length > 1;
  }

  function configurePrivateForms() {
    const studentSession = state.dashboardData?.role === "student";
    const canUpload = Boolean(studentSession && state.session && hasBackendMethod("uploadSubmission") && populateAssignmentSelect("#submission-assignment", true));
    const uploadForm = document.querySelector("#submission-form");
    setFormEnabled(uploadForm, canUpload);
    setCopyMessage(document.querySelector("#submission-status"), canUpload ? "" : "dashboard.uploadUnavailable", canUpload ? "neutral" : "warning");
    if (uploadForm) {
      uploadForm.querySelector('button[type="submit"]').disabled = true;
      if (canUpload) updateUploadButton();
    }

    const canAsk = Boolean(studentSession && state.session && hasBackendMethod("submitQuestion") && populateAssignmentSelect("#question-assignment"));
    const questionForm = document.querySelector("#question-form");
    setFormEnabled(questionForm, canAsk);
    setCopyMessage(document.querySelector("#question-status"), canAsk ? "" : "dashboard.questionUnavailable", canAsk ? "neutral" : "warning");
  }

  function renderDashboardData() {
    const data = state.dashboardData;
    if (!data || data.role !== "student") {
      renderDashboardAccessState();
      return;
    }
    renderItems("#todo-list", data.todo, "todo", "dashboard.todoEmpty");
    renderItems("#resources-list", data.resources, "resource", "dashboard.resourcesEmpty");
    renderItems("#submissions-list", data.submissions, "submission", "dashboard.submissionsEmpty");
    renderItems("#questions-list", data.questions, "question", "dashboard.questionsEmpty");
    configurePrivateForms();
  }

  function renderDashboardAccessState() {
    const gate = document.querySelector("#dashboard-gate");
    const content = document.querySelector("#dashboard-content");
    const signOut = document.querySelector("#portal-sign-out");
    const action = document.querySelector("#dashboard-gate-action");
    const retry = document.querySelector("#dashboard-retry");
    const greeting = document.querySelector("#dashboard-greeting");
    if (!gate || !content) return;
    if (greeting) greeting.hidden = true;
    if (retry) retry.hidden = true;

    if (!state.configured) {
      gate.hidden = false;
      content.hidden = true;
      if (signOut) signOut.hidden = true;
      if (action) action.hidden = false;
      setText("#dashboard-gate-title", getCopy("common.notConfigured"));
      setText("#dashboard-gate-text", getCopy("dashboard.notConfiguredText"));
      return;
    }
    if (!state.session) {
      gate.hidden = false;
      content.hidden = true;
      if (signOut) signOut.hidden = true;
      if (action) action.hidden = false;
      setText("#dashboard-gate-title", getCopy("dashboard.loginRequired"));
      setText("#dashboard-gate-text", getCopy("dashboard.loginRequiredText"));
      return;
    }
    if (state.dashboardError) {
      gate.hidden = false;
      content.hidden = true;
      if (signOut) signOut.hidden = false;
      if (action) action.hidden = true;
      if (retry) retry.hidden = false;
      setText("#dashboard-gate-title", getCopy("dashboard.loadFailed"));
      setText("#dashboard-gate-text", getCopy("dashboard.dataUnavailable"));
      return;
    }
    if (!state.dashboardData) {
      gate.hidden = false;
      content.hidden = true;
      if (signOut) signOut.hidden = false;
      if (action) action.hidden = true;
      setText("#dashboard-gate-title", getCopy("dashboard.checking"));
      setText("#dashboard-gate-text", getCopy("dashboard.loadingData"));
      return;
    }
    if (state.dashboardData?.role === "teacher") {
      gate.hidden = false;
      content.hidden = true;
      if (signOut) signOut.hidden = false;
      if (action) action.hidden = true;
      setText("#dashboard-gate-title", getCopy("dashboard.teacherTitle"));
      setText("#dashboard-gate-text", getCopy("dashboard.teacherText"));
      return;
    }
    if (state.dashboardData.role !== "student") {
      gate.hidden = false;
      content.hidden = true;
      if (signOut) signOut.hidden = false;
      if (action) action.hidden = true;
      if (retry) retry.hidden = false;
      setText("#dashboard-gate-title", getCopy("dashboard.loadFailed"));
      setText("#dashboard-gate-text", getCopy("dashboard.dataUnavailable"));
      return;
    }

    gate.hidden = true;
    content.hidden = false;
    if (signOut) signOut.hidden = false;
    if (action) action.hidden = false;
    const fullName = limitedText(state.dashboardData?.profile?.fullName, 240);
    if (greeting && fullName) {
      greeting.textContent = getCopy("dashboard.greeting").replace("{name}", fullName);
      greeting.hidden = false;
    }
  }

  async function loadDashboard() {
    if (!state.session || state.dashboardLoading) return;
    const status = document.querySelector("#dashboard-data-status");
    if (!hasBackendMethod("getDashboardData")) {
      clearPrivateDashboard();
      state.dashboardError = true;
      setCopyMessage(status, "dashboard.dataUnavailable", "warning");
      renderDashboardAccessState();
      return;
    }

    const requestId = ++state.dashboardRequestId;
    const requestedUserId = sessionUserId(state.session);
    state.dashboardLoading = true;
    state.dashboardError = false;
    setCopyMessage(status, "dashboard.loadingData", "neutral");
    renderDashboardAccessState();
    try {
      const dashboardData = normalizeDashboardData(await state.backend.getDashboardData());
      if (requestId !== state.dashboardRequestId || requestedUserId !== sessionUserId(state.session)) return;
      state.dashboardData = dashboardData;
      setCopyMessage(status, "", "neutral");
      renderDashboardAccessState();
      renderDashboardData();
    } catch (error) {
      if (requestId !== state.dashboardRequestId) return;
      clearPrivateDashboard();
      state.dashboardError = true;
      setCopyMessage(status, "dashboard.loadFailed", "error");
      renderDashboardAccessState();
    } finally {
      if (requestId === state.dashboardRequestId) state.dashboardLoading = false;
    }
  }

  async function updateDashboardAccess() {
    renderDashboardAccessState();
    if (state.session) await loadDashboard();
  }

  function validateFiles(files) {
    const values = Array.from(files || []);
    if (!values.length) return "dashboard.noFile";
    if (values.length > MAX_FILES) return "dashboard.tooManyFiles";
    for (const file of values) {
      const fileName = typeof file?.name === "string" ? file.name : "";
      const extensionIndex = fileName.lastIndexOf(".");
      const extension = extensionIndex > 0 ? fileName.slice(extensionIndex + 1).toLowerCase() : "";
      const expectedType = ALLOWED_UPLOADS[extension];
      const actualType = typeof file?.type === "string" ? file.type.trim().toLowerCase() : "";
      if (!expectedType) return "dashboard.invalidFile";
      if (actualType && actualType !== "application/octet-stream" && actualType !== expectedType) return "dashboard.invalidFile";
      if (!file.size) return "dashboard.emptyFile";
      if (file.size > MAX_FILE_BYTES) return "dashboard.fileTooLarge";
    }
    return "";
  }

  function updateUploadButton() {
    const form = document.querySelector("#submission-form");
    if (!form) return;
    const fileInput = form.elements.files;
    const errorKey = validateFiles(fileInput.files);
    const ready = Boolean(state.dashboardData?.role === "student" && state.session && hasBackendMethod("uploadSubmission") && form.elements.assignmentId.value && !errorKey);
    form.querySelector('button[type="submit"]').disabled = !ready;
    setCopyMessage(document.querySelector("#submission-status"), fileInput.files.length ? errorKey : "", errorKey ? "error" : "neutral");
  }

  async function ensureSession() {
    if (!state.configured || !hasBackendMethod("getSession")) return null;
    const previousUserId = sessionUserId(state.session);
    let nextSession = null;
    try {
      nextSession = unwrapSession(await state.backend.getSession());
    } catch (error) {
      nextSession = null;
    }
    const identityChanged = previousUserId !== sessionUserId(nextSession);
    state.session = nextSession;
    if (identityChanged && state.page === "dashboard") {
      invalidateDashboard();
      await updateDashboardAccess();
      return null;
    }
    if (!state.session && state.page === "dashboard") {
      invalidateDashboard();
      renderDashboardAccessState();
    }
    return state.session;
  }

  async function handleSubmission(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = document.querySelector("#submission-status");
    const errorKey = validateFiles(form.elements.files.files);
    if (errorKey) {
      setCopyMessage(status, errorKey, "error");
      return;
    }
    if (!await ensureSession() || !hasBackendMethod("uploadSubmission")) {
      setCopyMessage(status, "dashboard.uploadUnavailable", "warning");
      return;
    }

    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.textContent = getCopy("dashboard.uploading");
    form.setAttribute("aria-busy", "true");
    lockLanguageControls(true);
    let uploaded = false;
    try {
      const result = await state.backend.uploadSubmission({
        assignmentId: form.elements.assignmentId.value,
        files: Array.from(form.elements.files.files),
        message: form.elements.message.value.trim().slice(0, 1000)
      });
      if (result?.error) throw new Error("upload-failed");
      form.reset();
      await loadDashboard();
      uploaded = true;
    } catch (uploadError) {
      setCopyMessage(status, "dashboard.uploadFailed", "error");
    } finally {
      form.removeAttribute("aria-busy");
      lockLanguageControls(false);
      submit.textContent = getCopy("dashboard.upload");
      updateUploadButton();
      if (uploaded) setCopyMessage(status, "dashboard.uploadSuccess", "success");
    }
  }

  async function handleQuestion(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = document.querySelector("#question-status");
    if (!form.reportValidity()) return;
    if (!await ensureSession() || !hasBackendMethod("submitQuestion")) {
      setCopyMessage(status, "dashboard.questionUnavailable", "warning");
      return;
    }

    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.textContent = getCopy("dashboard.sendingQuestion");
    form.setAttribute("aria-busy", "true");
    lockLanguageControls(true);
    try {
      const result = await state.backend.submitQuestion({
        assignmentId: form.elements.assignmentId.value,
        message: form.elements.message.value.trim().slice(0, 1500)
      });
      if (result?.error) throw new Error("question-failed");
      form.reset();
      await loadDashboard();
      setCopyMessage(status, "dashboard.questionSuccess", "success");
    } catch (questionError) {
      setCopyMessage(status, "dashboard.questionFailed", "error");
    } finally {
      form.removeAttribute("aria-busy");
      lockLanguageControls(false);
      submit.textContent = getCopy("dashboard.sendQuestion");
      submit.disabled = false;
    }
  }

  async function handleSignOut() {
    const button = document.querySelector("#portal-sign-out");
    if (!hasBackendMethod("signOut")) return;
    if (button) button.disabled = true;
    try {
      const result = await state.backend.signOut();
      if (result?.error) throw new Error("sign-out-failed");
      if (hasBackendMethod("getSession") && unwrapSession(await state.backend.getSession())) {
        throw new Error("session-still-active");
      }
      state.session = null;
      state.dashboardData = null;
      window.location.replace("login.html?signed-out=1");
    } catch (error) {
      if (button) button.disabled = false;
      const content = document.querySelector("#dashboard-content");
      if (content?.hidden) {
        setText("#dashboard-gate-text", getCopy("dashboard.signOutFailed"));
      } else {
        setCopyMessage(document.querySelector("#dashboard-data-status"), "dashboard.signOutFailed", "error");
      }
    }
  }

  async function handleDashboardRetry() {
    if (!state.session || state.dashboardLoading) return;
    state.dashboardError = false;
    await updateDashboardAccess();
  }

  function bindEvents() {
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.addEventListener("click", () => applyLanguage(button.dataset.lang));
    });
    document.querySelector("#portal-login-form")?.addEventListener("submit", handleLogin);
    document.querySelector("#portal-sign-out")?.addEventListener("click", handleSignOut);
    document.querySelector("#dashboard-retry")?.addEventListener("click", handleDashboardRetry);
    document.querySelector("#submission-form")?.addEventListener("submit", handleSubmission);
    document.querySelector("#submission-file")?.addEventListener("change", updateUploadButton);
    document.querySelector("#submission-assignment")?.addEventListener("change", updateUploadButton);
    document.querySelector("#question-form")?.addEventListener("submit", handleQuestion);
  }

  async function init() {
    state.language = readLanguage();
    applyLanguage(state.language, false);
    setText("#portal-year", new Date().getFullYear());
    bindEvents();
    await detectBackend();
    subscribeToAuthChanges();

    if (state.page === "login" && state.session) {
      window.location.replace("dashboard.html");
      return;
    }
    if (state.page === "dashboard") {
      await updateDashboardAccess();
    } else {
      renderPortalState();
      if (state.page === "login" && new URLSearchParams(window.location.search).get("signed-out") === "1") {
        setCopyMessage(document.querySelector("#login-form-message"), "dashboard.signedOut", "success");
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
