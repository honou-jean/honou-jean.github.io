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
        showPassword: "Afficher le mot de passe",
        hidePassword: "Masquer le mot de passe",
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
      },
      teacher: {
        studentsTitle: "Mes élèves",
        studentsEmpty: "Aucun élève pour le moment.",
        studentEmail: "E-mail de l’élève",
        studentName: "Nom complet",
        studentCohort: "Groupe / niveau (facultatif)",
        inviteTitle: "Ajouter un élève",
        inviteIntro: "Un compte est créé avec un mot de passe temporaire à transmettre vous-même à l’élève — il n’est jamais envoyé par e-mail depuis cette page.",
        inviteSubmit: "Créer le compte",
        inviteUnavailable: "La création de comptes n’est pas disponible pour cette session.",
        invitePending: "Création en cours…",
        inviteSuccess: "Compte créé. Transmettez ces identifiants à l’élève par un canal sûr — ils ne seront plus affichés ensuite.",
        inviteFailed: "Le compte n’a pas pu être créé. Vérifiez l’adresse e-mail puis réessayez.",
        credentialEmail: "E-mail",
        credentialPassword: "Mot de passe temporaire",
        credentialNote: "Conseillez à l’élève de changer ce mot de passe dès sa première connexion.",
        cohortLabel: "Groupe",
        activeLabel: "Actif",
        inactiveLabel: "Inactif",
        activate: "Réactiver",
        deactivate: "Désactiver",
        studentUpdateFailed: "Le statut de l’élève n’a pas pu être modifié.",
        deleteStudent: "Supprimer l’élève",
        deleteStudentConfirm: "Supprimer {name} ? Cette action supprimera aussi, de façon définitive, {assignments} activité(s), {resources} document(s), {submissions} dépôt(s) et {questions} question(s) liés à cet élève. Le compte de connexion de l’élève lui-même n’est pas supprimé.",
        studentDeleteFailed: "L’élève n’a pas pu être supprimé.",
        assignmentsTitle: "Mes activités",
        assignmentsEmpty: "Aucune activité créée pour le moment.",
        assignmentCreateTitle: "Créer une activité",
        assignmentCreateIntro: "Visible par l’élève uniquement une fois publiée.",
        assignmentStudent: "Élève concerné",
        selectStudent: "Sélectionner un élève",
        assignmentTitleLabel: "Titre",
        assignmentDescriptionLabel: "Description courte (facultatif)",
        assignmentInstructionsLabel: "Consignes détaillées (facultatif)",
        assignmentDueLabel: "Échéance (facultatif)",
        assignmentPublishNow: "Publier immédiatement (visible par l’élève)",
        assignmentSubmit: "Créer l’activité",
        assignmentUnavailable: "La création d’activités n’est pas disponible pour cette session.",
        assignmentPending: "Création en cours…",
        assignmentSuccess: "Activité créée.",
        assignmentFailed: "L’activité n’a pas pu être créée.",
        assignmentFor: "Pour",
        publish: "Publier",
        close: "Clôturer",
        reopen: "Republier",
        statusUpdateFailed: "Le statut n’a pas pu être modifié.",
        deleteAssignment: "Supprimer",
        deleteAssignmentConfirm: "Supprimer l’activité « {title} » ? Cette action supprimera aussi, de façon définitive, {resources} document(s), {submissions} dépôt(s) et {questions} question(s) liés à cette activité.",
        assignmentDeleteFailed: "L’activité n’a pas pu être supprimée.",
        resourcesTitle: "Documents & ressources",
        resourcesEmpty: "Aucun document ajouté pour le moment.",
        resourceAddTitle: "Ajouter un document",
        resourceAddIntro: "Un fichier ou un lien externe — jamais les deux à la fois.",
        resourceTitleLabel: "Titre",
        resourceFileLabel: "Fichier (facultatif)",
        resourceUrlLabel: "Ou lien externe (facultatif)",
        resourceSubmit: "Ajouter le document",
        resourceUnavailable: "L’ajout de documents n’est pas disponible pour cette session.",
        resourcePending: "Envoi en cours…",
        resourceSuccess: "Document ajouté.",
        resourceFailed: "Le document n’a pas pu être ajouté. Vérifiez le fichier ou le lien puis réessayez.",
        resourceBoth: "Choisissez un fichier ou un lien, pas les deux.",
        resourceNeither: "Choisissez un fichier ou indiquez un lien.",
        deleteResource: "Supprimer",
        deleteResourceConfirm: "Supprimer le document « {title} » ?",
        resourceDeleteFailed: "Le document n’a pas pu être supprimé.",
        submissionsTitle: "Dépôts à corriger",
        submissionsEmpty: "Aucun dépôt à corriger pour le moment.",
        feedbackLabel: "Retour à l’élève",
        gradeLabel: "Note sur 20 (facultatif)",
        saveReview: "Enregistrer la correction",
        reviewSaved: "Correction enregistrée.",
        reviewFailed: "La correction n’a pas pu être enregistrée.",
        questionsTitle: "Questions des élèves",
        questionsEmpty: "Aucune question pour le moment.",
        answerLabel: "Votre réponse",
        sendAnswer: "Envoyer la réponse",
        answerSaved: "Réponse envoyée.",
        answerFailed: "La réponse n’a pas pu être envoyée.",
        alreadyAnswered: "Déjà répondu",
        statusDraft: "Brouillon",
        statusPublished: "Publiée",
        statusClosed: "Clôturée",
        statusSubmitted: "Déposé",
        statusLate: "Déposé en retard",
        statusReviewed: "Corrigé",
        statusOpen: "En attente",
        statusAnswered: "Répondu"
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
        showPassword: "Show password",
        hidePassword: "Hide password",
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
      },
      teacher: {
        studentsTitle: "My students",
        studentsEmpty: "No student yet.",
        studentEmail: "Student email",
        studentName: "Full name",
        studentCohort: "Group / level (optional)",
        inviteTitle: "Add a student",
        inviteIntro: "An account is created with a temporary password you relay to the student yourself — it is never emailed from this page.",
        inviteSubmit: "Create account",
        inviteUnavailable: "Account creation is unavailable for this session.",
        invitePending: "Creating…",
        inviteSuccess: "Account created. Share these credentials with the student through a safe channel — they will not be shown again.",
        inviteFailed: "The account could not be created. Check the email address and try again.",
        credentialEmail: "Email",
        credentialPassword: "Temporary password",
        credentialNote: "Advise the student to change this password on first sign-in.",
        cohortLabel: "Group",
        activeLabel: "Active",
        inactiveLabel: "Inactive",
        activate: "Reactivate",
        deactivate: "Deactivate",
        studentUpdateFailed: "The student's status could not be changed.",
        deleteStudent: "Remove student",
        deleteStudentConfirm: "Remove {name}? This will also permanently delete {assignments} assignment(s), {resources} document(s), {submissions} submission(s) and {questions} question(s) linked to this student. The student's own sign-in account is not deleted.",
        studentDeleteFailed: "The student could not be removed.",
        assignmentsTitle: "My assignments",
        assignmentsEmpty: "No assignment created yet.",
        assignmentCreateTitle: "Create an assignment",
        assignmentCreateIntro: "Visible to the student only once published.",
        assignmentStudent: "Student",
        selectStudent: "Select a student",
        assignmentTitleLabel: "Title",
        assignmentDescriptionLabel: "Short description (optional)",
        assignmentInstructionsLabel: "Detailed instructions (optional)",
        assignmentDueLabel: "Due date (optional)",
        assignmentPublishNow: "Publish immediately (visible to the student)",
        assignmentSubmit: "Create assignment",
        assignmentUnavailable: "Creating assignments is unavailable for this session.",
        assignmentPending: "Creating…",
        assignmentSuccess: "Assignment created.",
        assignmentFailed: "The assignment could not be created.",
        assignmentFor: "For",
        publish: "Publish",
        close: "Close",
        reopen: "Republish",
        statusUpdateFailed: "The status could not be changed.",
        deleteAssignment: "Delete",
        deleteAssignmentConfirm: "Delete the assignment “{title}”? This will also permanently delete {resources} document(s), {submissions} submission(s) and {questions} question(s) linked to it.",
        assignmentDeleteFailed: "The assignment could not be deleted.",
        resourcesTitle: "Documents & resources",
        resourcesEmpty: "No document added yet.",
        resourceAddTitle: "Add a document",
        resourceAddIntro: "A file or an external link — never both at once.",
        resourceTitleLabel: "Title",
        resourceFileLabel: "File (optional)",
        resourceUrlLabel: "Or external link (optional)",
        resourceSubmit: "Add document",
        resourceUnavailable: "Adding documents is unavailable for this session.",
        resourcePending: "Sending…",
        resourceSuccess: "Document added.",
        resourceFailed: "The document could not be added. Check the file or link and try again.",
        resourceBoth: "Choose a file or a link, not both.",
        resourceNeither: "Choose a file or provide a link.",
        deleteResource: "Delete",
        deleteResourceConfirm: "Delete the document “{title}”?",
        resourceDeleteFailed: "The document could not be deleted.",
        submissionsTitle: "Submissions to review",
        submissionsEmpty: "No submission to review yet.",
        feedbackLabel: "Feedback to the student",
        gradeLabel: "Grade out of 20 (optional)",
        saveReview: "Save review",
        reviewSaved: "Review saved.",
        reviewFailed: "The review could not be saved.",
        questionsTitle: "Student questions",
        questionsEmpty: "No question yet.",
        answerLabel: "Your answer",
        sendAnswer: "Send answer",
        answerSaved: "Answer sent.",
        answerFailed: "The answer could not be sent.",
        alreadyAnswered: "Already answered"
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
    [
      "#todo-list", "#resources-list", "#submissions-list", "#questions-list",
      "#teacher-students-list", "#teacher-assignments-list", "#teacher-resources-list",
      "#teacher-submissions-list", "#teacher-questions-list"
    ].forEach((selector) => {
      document.querySelector(selector)?.replaceChildren();
    });
    ["#submission-form", "#question-form", "#invite-student-form", "#create-assignment-form", "#add-resource-form"].forEach((selector) => {
      const form = document.querySelector(selector);
      if (!form) return;
      form.reset();
      setFormEnabled(form, false);
    });
    const credential = document.querySelector("#invite-credential");
    if (credential) { credential.hidden = true; credential.replaceChildren(); }
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
      assignments: assignmentSource,
      students: array(payload.students)
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

  const ASSIGNMENT_STATUS_KEY = { draft: "statusDraft", published: "statusPublished", closed: "statusClosed" };
  const SUBMISSION_STATUS_KEY = { submitted: "statusSubmitted", late: "statusLate", reviewed: "statusReviewed" };
  const QUESTION_STATUS_KEY = { open: "statusOpen", answered: "statusAnswered", closed: "statusClosed" };

  function statusLabel(map, status) {
    const key = map[status];
    return key ? getCopy(`teacher.${key}`) : (status || "—");
  }

  function statusPill(status, map) {
    const pill = document.createElement("span");
    pill.className = "portal-status-pill";
    pill.dataset.status = status || "";
    pill.textContent = statusLabel(map, status);
    return pill;
  }

  function actionButton(action, label, extraClass = "secondary") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `button ${extraClass}`;
    button.dataset.action = action;
    return Object.assign(button, { textContent: label });
  }

  function studentRecordId(student) {
    return limitedText(student?.user_id ?? student?.userId, 200);
  }

  function studentDisplayName(student) {
    const name = limitedText(student?.profile?.full_name ?? student?.profile?.fullName, 240);
    return name || studentRecordId(student).slice(0, 8);
  }

  function teacherStudentsById() {
    const map = new Map();
    (state.dashboardData?.students || []).forEach((student) => {
      const id = studentRecordId(student);
      if (id) map.set(id, studentDisplayName(student));
    });
    return map;
  }

  function renderStudentsRoster() {
    const students = state.dashboardData?.students || [];
    const container = document.querySelector("#teacher-students-list");
    if (!container) return;
    container.replaceChildren();
    if (!students.length) {
      const empty = document.createElement("p");
      empty.className = "portal-empty";
      empty.textContent = getCopy("teacher.studentsEmpty");
      container.append(empty);
      return;
    }
    students.forEach((student) => {
      const article = document.createElement("article");
      article.className = "portal-list-item";
      article.dataset.studentId = studentRecordId(student);
      const head = document.createElement("div");
      head.className = "portal-item-head";
      const title = document.createElement("h3");
      title.textContent = studentDisplayName(student);
      head.append(title);
      const pill = document.createElement("span");
      pill.className = "portal-status-pill";
      pill.dataset.status = student.active ? "published" : "closed";
      pill.textContent = student.active ? getCopy("teacher.activeLabel") : getCopy("teacher.inactiveLabel");
      head.append(pill);
      article.append(head);
      if (limitedText(student.cohort, 120)) appendMeta(article, getCopy("teacher.cohortLabel"), student.cohort);

      const actions = document.createElement("div");
      actions.className = "portal-item-actions";
      actions.append(actionButton(
        student.active ? "student-deactivate" : "student-activate",
        student.active ? getCopy("teacher.deactivate") : getCopy("teacher.activate")
      ));
      actions.append(actionButton("student-delete", getCopy("teacher.deleteStudent"), "danger"));
      article.append(actions);

      container.append(article);
    });
  }

  function renderTeacherAssignments() {
    const assignments = state.dashboardData?.assignments || [];
    const container = document.querySelector("#teacher-assignments-list");
    if (!container) return;
    container.replaceChildren();
    if (!assignments.length) {
      const empty = document.createElement("p");
      empty.className = "portal-empty";
      empty.textContent = getCopy("teacher.assignmentsEmpty");
      container.append(empty);
      return;
    }
    const studentsById = teacherStudentsById();
    assignments.forEach((assignment) => {
      const article = document.createElement("article");
      article.className = "portal-list-item";
      article.dataset.assignmentId = limitedText(assignment.id, 200);
      const head = document.createElement("div");
      head.className = "portal-item-head";
      const title = document.createElement("h3");
      title.textContent = limitedText(assignment.title, 240) || "—";
      head.append(title, statusPill(assignment.status, ASSIGNMENT_STATUS_KEY));
      article.append(head);

      const studentName = studentsById.get(limitedText(assignment.student_id, 200));
      if (studentName) appendMeta(article, getCopy("teacher.assignmentFor"), studentName);
      const description = limitedText(assignment.description);
      if (description) {
        const paragraph = document.createElement("p");
        paragraph.textContent = description;
        article.append(paragraph);
      }
      const due = formatDate(assignment.due_at);
      if (due) appendMeta(article, getCopy("dashboard.due"), due);

      const actions = document.createElement("div");
      actions.className = "portal-item-actions";
      if (assignment.status === "draft") actions.append(actionButton("assignment-publish", getCopy("teacher.publish"), "primary"));
      else if (assignment.status === "published") actions.append(actionButton("assignment-close", getCopy("teacher.close")));
      else if (assignment.status === "closed") actions.append(actionButton("assignment-reopen", getCopy("teacher.reopen")));
      actions.append(actionButton("assignment-delete", getCopy("teacher.deleteAssignment"), "danger"));
      article.append(actions);

      container.append(article);
    });
  }

  function renderTeacherResources() {
    const resources = state.dashboardData?.resources || [];
    const container = document.querySelector("#teacher-resources-list");
    if (!container) return;
    container.replaceChildren();
    if (!resources.length) {
      const empty = document.createElement("p");
      empty.className = "portal-empty";
      empty.textContent = getCopy("teacher.resourcesEmpty");
      container.append(empty);
      return;
    }
    const assignmentTitles = new Map((state.dashboardData?.assignments || []).map((assignment) => [
      limitedText(assignment.id, 200), limitedText(assignment.title, 240)
    ]));
    resources.forEach((resource) => {
      const article = document.createElement("article");
      article.className = "portal-list-item";
      article.dataset.resourceId = limitedText(resource.id, 200);
      const title = document.createElement("h3");
      title.textContent = limitedText(resource.title, 240) || "—";
      article.append(title);
      const assignmentTitle = assignmentTitles.get(limitedText(resource.assignment_id, 200));
      if (assignmentTitle) appendMeta(article, getCopy("dashboard.assignment"), assignmentTitle);
      const description = limitedText(resource.description);
      if (description) {
        const paragraph = document.createElement("p");
        paragraph.textContent = description;
        article.append(paragraph);
      }
      const href = safeUrl(resource.url ?? resource.href ?? resource.signed_url ?? resource.external_url);
      if (href) {
        const link = document.createElement("a");
        link.className = "portal-resource-link";
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = getCopy("dashboard.openResource");
        article.append(link);
      }
      const actions = document.createElement("div");
      actions.className = "portal-item-actions";
      actions.append(actionButton("resource-delete", getCopy("teacher.deleteResource"), "danger"));
      article.append(actions);
      container.append(article);
    });
  }

  function submissionFileLinks(item) {
    const fileList = document.createElement("div");
    fileList.className = "portal-file-list";
    (Array.isArray(item.files) ? item.files.slice(0, 5) : []).forEach((file, index) => {
      const href = safeUrl(file?.url ?? file?.href ?? file?.signedUrl ?? file?.signed_url);
      if (!href) return;
      const rawName = limitedText(file?.name ?? file?.fileName, 180)
        .replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-/i, "");
      const link = document.createElement("a");
      link.className = "portal-resource-link";
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = getCopy("dashboard.openSubmissionFile").replace("{name}", rawName || `${index + 1}`);
      fileList.append(link);
    });
    return fileList;
  }

  function renderTeacherSubmissions() {
    const submissions = state.dashboardData?.submissions || [];
    const container = document.querySelector("#teacher-submissions-list");
    if (!container) return;
    container.replaceChildren();
    if (!submissions.length) {
      const empty = document.createElement("p");
      empty.className = "portal-empty";
      empty.textContent = getCopy("teacher.submissionsEmpty");
      container.append(empty);
      return;
    }
    submissions.forEach((submission) => {
      const article = document.createElement("article");
      article.className = "portal-list-item";
      article.dataset.submissionId = limitedText(submission.id, 200);
      const head = document.createElement("div");
      head.className = "portal-item-head";
      const title = document.createElement("h3");
      title.textContent = limitedText(submission.assignmentTitle, 240) || "—";
      head.append(title, statusPill(submission.status, SUBMISSION_STATUS_KEY));
      article.append(head);

      const submitted = formatDate(submission.submittedAt ?? submission.submitted_at);
      if (submitted) appendMeta(article, getCopy("dashboard.submitted"), submitted);
      const message = limitedText(submission.message);
      if (message) {
        const paragraph = document.createElement("p");
        paragraph.textContent = message;
        article.append(paragraph);
      }
      const fileList = submissionFileLinks(submission);
      if (fileList.children.length) article.append(fileList);

      if (limitedText(submission.feedback)) {
        const block = document.createElement("div");
        block.className = "portal-answer";
        const label = document.createElement("strong");
        label.textContent = getCopy("teacher.feedbackLabel");
        const text = document.createElement("p");
        text.textContent = submission.feedback;
        block.append(label, text);
        article.append(block);
      }

      const form = document.createElement("form");
      form.className = "portal-inline-form portal-review-form";
      const feedbackField = document.createElement("div");
      feedbackField.className = "portal-field";
      const feedbackLabel = document.createElement("label");
      feedbackLabel.textContent = getCopy("teacher.feedbackLabel");
      const feedbackInput = document.createElement("textarea");
      feedbackInput.name = "feedback";
      feedbackInput.rows = 3;
      feedbackInput.maxLength = 8000;
      feedbackInput.value = limitedText(submission.feedback);
      feedbackField.append(feedbackLabel, feedbackInput);

      const gradeField = document.createElement("div");
      gradeField.className = "portal-field";
      const gradeLabel = document.createElement("label");
      gradeLabel.textContent = getCopy("teacher.gradeLabel");
      const gradeInput = document.createElement("input");
      gradeInput.type = "number";
      gradeInput.name = "grade";
      gradeInput.min = "0";
      gradeInput.max = "20";
      gradeInput.step = "0.5";
      if (submission.grade !== null && submission.grade !== undefined) gradeInput.value = String(submission.grade);
      gradeField.append(gradeLabel, gradeInput);

      const submit = document.createElement("button");
      submit.type = "submit";
      submit.className = "button primary";
      submit.textContent = getCopy("teacher.saveReview");
      const status = document.createElement("p");
      status.className = "portal-form-message";
      status.hidden = true;

      form.append(feedbackField, gradeField, submit, status);
      article.append(form);
      container.append(article);
    });
  }

  function renderTeacherQuestions() {
    const questions = state.dashboardData?.questions || [];
    const container = document.querySelector("#teacher-questions-list");
    if (!container) return;
    container.replaceChildren();
    if (!questions.length) {
      const empty = document.createElement("p");
      empty.className = "portal-empty";
      empty.textContent = getCopy("teacher.questionsEmpty");
      container.append(empty);
      return;
    }
    questions.forEach((question) => {
      const article = document.createElement("article");
      article.className = "portal-list-item";
      article.dataset.questionId = limitedText(question.id, 200);
      const head = document.createElement("div");
      head.className = "portal-item-head";
      const title = document.createElement("h3");
      title.textContent = limitedText(question.assignmentTitle, 240) || "—";
      head.append(title, statusPill(question.status, QUESTION_STATUS_KEY));
      article.append(head);

      const asked = formatDate(question.createdAt ?? question.created_at);
      if (asked) appendMeta(article, getCopy("dashboard.asked"), asked);
      const message = limitedText(question.message);
      if (message) {
        const paragraph = document.createElement("p");
        paragraph.textContent = message;
        article.append(paragraph);
      }

      const answered = limitedText(question.answer);
      if (answered) {
        const block = document.createElement("div");
        block.className = "portal-answer";
        const label = document.createElement("strong");
        label.textContent = getCopy("dashboard.answer");
        const text = document.createElement("p");
        text.textContent = answered;
        block.append(label, text);
        article.append(block);
      } else {
        const form = document.createElement("form");
        form.className = "portal-inline-form portal-answer-form";
        const field = document.createElement("div");
        field.className = "portal-field";
        const label = document.createElement("label");
        label.textContent = getCopy("teacher.answerLabel");
        const textarea = document.createElement("textarea");
        textarea.name = "answer";
        textarea.rows = 3;
        textarea.maxLength = 8000;
        textarea.required = true;
        field.append(label, textarea);
        const submit = document.createElement("button");
        submit.type = "submit";
        submit.className = "button primary";
        submit.textContent = getCopy("teacher.sendAnswer");
        const status = document.createElement("p");
        status.className = "portal-form-message";
        status.hidden = true;
        form.append(field, submit, status);
        article.append(form);
      }
      container.append(article);
    });
  }

  function populateStudentSelect() {
    const select = document.querySelector("#assignment-student");
    if (!select) return false;
    const previous = select.value;
    select.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = getCopy("teacher.selectStudent");
    placeholder.disabled = true;
    placeholder.selected = true;
    select.append(placeholder);
    (state.dashboardData?.students || []).filter((student) => student.active).forEach((student) => {
      const id = studentRecordId(student);
      if (!id) return;
      const option = document.createElement("option");
      option.value = id;
      option.textContent = studentDisplayName(student);
      if (id === previous) { option.selected = true; placeholder.selected = false; }
      select.append(option);
    });
    return select.options.length > 1;
  }

  function populateTeacherAssignmentSelect() {
    const select = document.querySelector("#resource-assignment");
    if (!select) return false;
    const previous = select.value;
    select.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = getCopy("dashboard.selectAssignment");
    placeholder.disabled = true;
    placeholder.selected = true;
    select.append(placeholder);
    (state.dashboardData?.assignments || []).forEach((assignment) => {
      const id = limitedText(assignment.id, 200);
      const title = limitedText(assignment.title, 240);
      if (!id || !title) return;
      const option = document.createElement("option");
      option.value = id;
      option.textContent = title;
      if (id === previous) { option.selected = true; placeholder.selected = false; }
      select.append(option);
    });
    return select.options.length > 1;
  }

  function configureTeacherForms() {
    const teacherSession = state.dashboardData?.role === "teacher" && Boolean(state.session);

    const inviteForm = document.querySelector("#invite-student-form");
    setFormEnabled(inviteForm, Boolean(teacherSession && hasBackendMethod("inviteStudent")));

    const hasStudents = populateStudentSelect();
    const assignmentForm = document.querySelector("#create-assignment-form");
    setFormEnabled(assignmentForm, Boolean(teacherSession && hasBackendMethod("createAssignment") && hasStudents));
    setCopyMessage(document.querySelector("#assignment-form-status"), teacherSession && !hasStudents ? "teacher.assignmentUnavailable" : "", teacherSession && !hasStudents ? "warning" : "neutral");

    const hasAssignments = populateTeacherAssignmentSelect();
    const resourceForm = document.querySelector("#add-resource-form");
    setFormEnabled(resourceForm, Boolean(teacherSession && hasBackendMethod("addResource") && hasAssignments));
    setCopyMessage(document.querySelector("#resource-form-status"), teacherSession && !hasAssignments ? "teacher.resourceUnavailable" : "", teacherSession && !hasAssignments ? "warning" : "neutral");
  }

  function renderTeacherDashboardData() {
    renderStudentsRoster();
    renderTeacherAssignments();
    renderTeacherResources();
    renderTeacherSubmissions();
    renderTeacherQuestions();
    configureTeacherForms();
  }

  async function handleInviteStudent(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = document.querySelector("#invite-status");
    const credentialBox = document.querySelector("#invite-credential");
    if (credentialBox) { credentialBox.hidden = true; credentialBox.replaceChildren(); }
    if (!await ensureSession() || !hasBackendMethod("inviteStudent")) {
      setCopyMessage(status, "teacher.inviteUnavailable", "warning");
      return;
    }
    if (!form.reportValidity()) return;

    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    const originalLabel = submit.textContent;
    submit.textContent = getCopy("teacher.invitePending");
    form.setAttribute("aria-busy", "true");
    lockLanguageControls(true);
    try {
      const result = await state.backend.inviteStudent({
        email: form.elements.email.value.trim(),
        fullName: form.elements.fullName.value.trim(),
        cohort: form.elements.cohort.value.trim()
      });
      if (result?.error) throw new Error("invite-failed");
      form.reset();
      setCopyMessage(status, "teacher.inviteSuccess", "success");
      if (credentialBox && result) {
        const dl = document.createElement("dl");
        const emailTerm = document.createElement("dt");
        emailTerm.textContent = getCopy("teacher.credentialEmail");
        const emailValue = document.createElement("dd");
        emailValue.textContent = limitedText(result.email, 254);
        const passwordTerm = document.createElement("dt");
        passwordTerm.textContent = getCopy("teacher.credentialPassword");
        const passwordValue = document.createElement("dd");
        passwordValue.textContent = limitedText(result.temporaryPassword, 200);
        dl.append(emailTerm, emailValue, passwordTerm, passwordValue);
        const note = document.createElement("p");
        note.textContent = getCopy("teacher.credentialNote");
        credentialBox.replaceChildren(dl, note);
        credentialBox.hidden = false;
      }
      await loadDashboard();
    } catch (error) {
      setCopyMessage(status, "teacher.inviteFailed", "error");
    } finally {
      form.removeAttribute("aria-busy");
      lockLanguageControls(false);
      submit.disabled = false;
      submit.textContent = originalLabel;
    }
  }

  function relatedCountsForAssignments(assignmentIds) {
    const ids = new Set(assignmentIds);
    const matches = (item) => ids.has(limitedText(item?.assignment_id, 200));
    return {
      resources: (state.dashboardData?.resources || []).filter(matches).length,
      submissions: (state.dashboardData?.submissions || []).filter(matches).length,
      questions: (state.dashboardData?.questions || []).filter(matches).length
    };
  }

  async function handleStudentAction(button) {
    const article = button.closest("[data-student-id]");
    const userId = article?.dataset.studentId;
    const action = button.dataset.action;
    if (!userId) return;
    const status = document.querySelector("#invite-status");

    if (action === "student-activate" || action === "student-deactivate") {
      if (!hasBackendMethod("setStudentActive")) return;
      button.disabled = true;
      try {
        const result = await state.backend.setStudentActive({ userId, active: action === "student-activate" });
        if (result?.error) throw new Error("student-update-failed");
        await loadDashboard();
      } catch (error) {
        setCopyMessage(status, "teacher.studentUpdateFailed", "error");
        button.disabled = false;
      }
      return;
    }

    if (action === "student-delete") {
      if (!hasBackendMethod("deleteStudent")) return;
      const student = (state.dashboardData?.students || []).find((item) => studentRecordId(item) === userId);
      const name = studentDisplayName(student || {});
      const assignmentIds = (state.dashboardData?.assignments || [])
        .filter((assignment) => limitedText(assignment.student_id, 200) === userId)
        .map((assignment) => limitedText(assignment.id, 200));
      const counts = relatedCountsForAssignments(assignmentIds);
      const message = getCopy("teacher.deleteStudentConfirm")
        .replace("{name}", name)
        .replace("{assignments}", String(assignmentIds.length))
        .replace("{resources}", String(counts.resources))
        .replace("{submissions}", String(counts.submissions))
        .replace("{questions}", String(counts.questions));
      if (!window.confirm(message)) return;
      button.disabled = true;
      try {
        const result = await state.backend.deleteStudent({ userId });
        if (result?.error) throw new Error("student-delete-failed");
        await loadDashboard();
      } catch (error) {
        setCopyMessage(status, "teacher.studentDeleteFailed", "error");
        button.disabled = false;
      }
    }
  }

  async function handleResourceAction(button) {
    const article = button.closest("[data-resource-id]");
    const id = article?.dataset.resourceId;
    const action = button.dataset.action;
    if (!id || action !== "resource-delete" || !hasBackendMethod("deleteResource")) return;
    const resource = (state.dashboardData?.resources || []).find((item) => limitedText(item.id, 200) === id);
    const title = limitedText(resource?.title, 240);
    const message = getCopy("teacher.deleteResourceConfirm").replace("{title}", title);
    if (!window.confirm(message)) return;
    button.disabled = true;
    try {
      const result = await state.backend.deleteResource({ id });
      if (result?.error) throw new Error("resource-delete-failed");
      await loadDashboard();
    } catch (error) {
      setCopyMessage(document.querySelector("#resource-form-status"), "teacher.resourceDeleteFailed", "error");
      button.disabled = false;
    }
  }

  async function handleCreateAssignment(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = document.querySelector("#assignment-form-status");
    if (!await ensureSession() || !hasBackendMethod("createAssignment")) {
      setCopyMessage(status, "teacher.assignmentUnavailable", "warning");
      return;
    }
    if (!form.reportValidity()) return;

    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    const originalLabel = submit.textContent;
    submit.textContent = getCopy("teacher.assignmentPending");
    form.setAttribute("aria-busy", "true");
    lockLanguageControls(true);
    try {
      const result = await state.backend.createAssignment({
        studentId: form.elements.studentId.value,
        title: form.elements.title.value.trim(),
        description: form.elements.description.value.trim(),
        instructions: form.elements.instructions.value.trim(),
        dueAt: form.elements.dueAt.value || null,
        publish: form.elements.publish.checked
      });
      if (result?.error) throw new Error("assignment-failed");
      form.reset();
      form.elements.publish.checked = true;
      setCopyMessage(status, "teacher.assignmentSuccess", "success");
      await loadDashboard();
    } catch (error) {
      setCopyMessage(status, "teacher.assignmentFailed", "error");
    } finally {
      form.removeAttribute("aria-busy");
      lockLanguageControls(false);
      submit.disabled = false;
      submit.textContent = originalLabel;
    }
  }

  async function handleAssignmentAction(button) {
    const article = button.closest("[data-assignment-id]");
    const id = article?.dataset.assignmentId;
    const action = button.dataset.action;
    if (!id) return;

    if (action === "assignment-delete") {
      if (!hasBackendMethod("deleteAssignment")) return;
      const assignment = (state.dashboardData?.assignments || []).find((item) => limitedText(item.id, 200) === id);
      const title = limitedText(assignment?.title, 240);
      const counts = relatedCountsForAssignments([id]);
      const message = getCopy("teacher.deleteAssignmentConfirm")
        .replace("{title}", title)
        .replace("{resources}", String(counts.resources))
        .replace("{submissions}", String(counts.submissions))
        .replace("{questions}", String(counts.questions));
      if (!window.confirm(message)) return;
      button.disabled = true;
      try {
        const result = await state.backend.deleteAssignment({ id });
        if (result?.error) throw new Error("assignment-delete-failed");
        await loadDashboard();
      } catch (error) {
        setCopyMessage(document.querySelector("#assignment-form-status"), "teacher.assignmentDeleteFailed", "error");
        button.disabled = false;
      }
      return;
    }

    const nextStatus = action === "assignment-publish" ? "published" : action === "assignment-close" ? "closed" : action === "assignment-reopen" ? "published" : null;
    if (!nextStatus || !hasBackendMethod("setAssignmentStatus")) return;
    button.disabled = true;
    try {
      const result = await state.backend.setAssignmentStatus({ id, status: nextStatus });
      if (result?.error) throw new Error("status-failed");
      await loadDashboard();
    } catch (error) {
      setCopyMessage(document.querySelector("#assignment-form-status"), "teacher.statusUpdateFailed", "error");
      button.disabled = false;
    }
  }

  async function handleAddResource(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = document.querySelector("#resource-form-status");
    if (!await ensureSession() || !hasBackendMethod("addResource")) {
      setCopyMessage(status, "teacher.resourceUnavailable", "warning");
      return;
    }
    const fileInput = form.elements.file;
    const urlValue = form.elements.externalUrl.value.trim();
    const hasFile = fileInput.files.length > 0;
    if (hasFile && urlValue) { setCopyMessage(status, "teacher.resourceBoth", "error"); return; }
    if (!hasFile && !urlValue) { setCopyMessage(status, "teacher.resourceNeither", "error"); return; }
    if (!form.elements.assignmentId.value || !form.elements.title.value.trim()) { form.reportValidity(); return; }

    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    const originalLabel = submit.textContent;
    submit.textContent = getCopy("teacher.resourcePending");
    form.setAttribute("aria-busy", "true");
    lockLanguageControls(true);
    try {
      const result = await state.backend.addResource({
        assignmentId: form.elements.assignmentId.value,
        title: form.elements.title.value.trim(),
        file: hasFile ? fileInput.files[0] : null,
        externalUrl: hasFile ? null : urlValue
      });
      if (result?.error) throw new Error("resource-failed");
      form.reset();
      setCopyMessage(status, "teacher.resourceSuccess", "success");
      await loadDashboard();
    } catch (error) {
      setCopyMessage(status, "teacher.resourceFailed", "error");
    } finally {
      form.removeAttribute("aria-busy");
      lockLanguageControls(false);
      submit.disabled = false;
      submit.textContent = originalLabel;
    }
  }

  async function handleReviewSubmission(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const article = form.closest("[data-submission-id]");
    const id = article?.dataset.submissionId;
    const status = form.querySelector(".portal-form-message");
    if (!id || !await ensureSession() || !hasBackendMethod("reviewSubmission")) {
      setMessage(status, getCopy("teacher.reviewFailed"), "error");
      return;
    }
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    try {
      const result = await state.backend.reviewSubmission({
        id,
        feedback: form.elements.feedback.value.trim(),
        grade: form.elements.grade.value
      });
      if (result?.error) throw new Error("review-failed");
      setMessage(status, getCopy("teacher.reviewSaved"), "success");
      await loadDashboard();
    } catch (error) {
      setMessage(status, getCopy("teacher.reviewFailed"), "error");
      submit.disabled = false;
    } finally {
      form.removeAttribute("aria-busy");
    }
  }

  async function handleAnswerQuestion(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const article = form.closest("[data-question-id]");
    const id = article?.dataset.questionId;
    const status = form.querySelector(".portal-form-message");
    if (!form.reportValidity()) return;
    if (!id || !await ensureSession() || !hasBackendMethod("answerQuestion")) {
      setMessage(status, getCopy("teacher.answerFailed"), "error");
      return;
    }
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    try {
      const result = await state.backend.answerQuestion({ id, answer: form.elements.answer.value.trim() });
      if (result?.error) throw new Error("answer-failed");
      setMessage(status, getCopy("teacher.answerSaved"), "success");
      await loadDashboard();
    } catch (error) {
      setMessage(status, getCopy("teacher.answerFailed"), "error");
      submit.disabled = false;
    } finally {
      form.removeAttribute("aria-busy");
    }
  }

  function renderDashboardData() {
    const data = state.dashboardData;
    if (!data || !["student", "teacher"].includes(data.role)) {
      renderDashboardAccessState();
      return;
    }
    if (data.role === "teacher") {
      renderTeacherDashboardData();
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
    if (!["student", "teacher"].includes(state.dashboardData.role)) {
      gate.hidden = false;
      content.hidden = true;
      if (signOut) signOut.hidden = false;
      if (action) action.hidden = true;
      if (retry) retry.hidden = false;
      setText("#dashboard-gate-title", getCopy("dashboard.loadFailed"));
      setText("#dashboard-gate-text", getCopy("dashboard.dataUnavailable"));
      return;
    }

    const teacherContent = document.querySelector("#dashboard-content-teacher");
    const isTeacher = state.dashboardData.role === "teacher";
    gate.hidden = true;
    content.hidden = isTeacher;
    if (teacherContent) teacherContent.hidden = !isTeacher;
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

  function togglePasswordVisibility(event) {
    const button = event.currentTarget;
    const input = document.querySelector("#login-password");
    if (!input) return;
    const willShow = input.type === "password";
    input.type = willShow ? "text" : "password";
    const key = willShow ? "login.hidePassword" : "login.showPassword";
    button.dataset.portalI18nAria = key;
    button.setAttribute("aria-label", getCopy(key));
    button.setAttribute("aria-pressed", String(willShow));
    button.querySelector("[data-eye-open]")?.toggleAttribute("hidden", willShow);
    button.querySelector("[data-eye-closed]")?.toggleAttribute("hidden", !willShow);
  }

  function bindEvents() {
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.addEventListener("click", () => applyLanguage(button.dataset.lang));
    });
    document.querySelector("#login-password-toggle")?.addEventListener("click", togglePasswordVisibility);
    document.querySelector("#portal-login-form")?.addEventListener("submit", handleLogin);
    document.querySelector("#portal-sign-out")?.addEventListener("click", handleSignOut);
    document.querySelector("#dashboard-retry")?.addEventListener("click", handleDashboardRetry);
    document.querySelector("#submission-form")?.addEventListener("submit", handleSubmission);
    document.querySelector("#submission-file")?.addEventListener("change", updateUploadButton);
    document.querySelector("#submission-assignment")?.addEventListener("change", updateUploadButton);
    document.querySelector("#question-form")?.addEventListener("submit", handleQuestion);

    document.querySelector("#invite-student-form")?.addEventListener("submit", handleInviteStudent);
    document.querySelector("#create-assignment-form")?.addEventListener("submit", handleCreateAssignment);
    document.querySelector("#add-resource-form")?.addEventListener("submit", handleAddResource);
    document.querySelector("#teacher-students-list")?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (button) handleStudentAction(button);
    });
    document.querySelector("#teacher-assignments-list")?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (button) handleAssignmentAction(button);
    });
    document.querySelector("#teacher-resources-list")?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (button) handleResourceAction(button);
    });
    document.querySelector("#teacher-submissions-list")?.addEventListener("submit", (event) => {
      if (event.target.classList.contains("portal-review-form")) handleReviewSubmission(event);
    });
    document.querySelector("#teacher-questions-list")?.addEventListener("submit", (event) => {
      if (event.target.classList.contains("portal-answer-form")) handleAnswerQuestion(event);
    });
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
