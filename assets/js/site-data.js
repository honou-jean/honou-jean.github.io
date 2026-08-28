/*
 * Central portfolio content.
 * Edit verified personal information here; never store passwords or secrets.
 * A document action is public only when `available` is set to true.
 */
window.SITE_DATA = {
  profile: {
    portraitCandidates: [
      "assets/images/profile/portrait-koessivi-jean-honou.png"
    ]
  },

  contact: {
    email: "honou84@gmail.com",
    phone: { display: "07 53 72 99 62", href: "+33753729962" },
    location: { fr: "Metz, Grand Est, France", en: "Metz, Grand Est, France" },
    linkedin: "https://www.linkedin.com/in/koessivi-jean-honou/",
    github: "https://github.com/honou-jean"
  },

  applicationDomains: [
    { fr: "Banque", en: "Banking" },
    { fr: "Assurance", en: "Insurance" },
    { fr: "Vision par ordinateur", en: "Computer Vision" },
    { fr: "Machine Learning", en: "Machine Learning" }
  ],

  documents: {
    cv: { path: "assets/documents/cv/cv-koessivi-jean-honou.pdf", available: true }
  },

  icons: {
    technologies: {
      "Python": "assets/icons/technologies/python.svg",
      "NumPy": "assets/icons/technologies/numpy.svg",
      "pandas": "assets/icons/technologies/pandas.svg",
      "SciPy": "assets/icons/technologies/scipy.svg",
      "Matplotlib": "assets/icons/technologies/matplotlib.svg",
      "MATLAB": "assets/icons/technologies/matlab.svg",
      "R": "assets/icons/technologies/r.svg",
      "Power BI": "assets/icons/technologies/power-bi.svg",
      "Git": "assets/icons/technologies/git.svg",
      "GitHub": "assets/icons/technologies/github.svg",
      "LaTeX": "assets/icons/technologies/latex.svg"
    },
    socials: {
      linkedin: "assets/icons/socials/linkedin.svg",
      github: "assets/icons/socials/github.svg"
    }
  },

  /*
   * Reusable project presentation themes.
   * A project only needs a `theme` key; unknown keys fall back to `default`.
   * Visual elements are declarative so cards and detail pages share the same
   * abstract fallback without project-specific JavaScript branches.
   */
  projectThemes: {
    default: {
      visual: {
        className: "visual-generic",
        label: "DATA · MODEL · RESULT",
        elements: [
          { tag: "span", className: "generic-orbit orbit-one" },
          { tag: "span", className: "generic-orbit orbit-two" },
          { tag: "i", className: "generic-point point-one" },
          { tag: "i", className: "generic-point point-two" },
          { tag: "i", className: "generic-point point-three" }
        ]
      }
    },
    biometrics: {
      visual: {
        className: "visual-biometrics",
        label: "FACE · VOICE · OCR",
        elements: [
          { tag: "span", className: "face-outline" },
          { tag: "span", className: "scan-line" },
          { tag: "i", className: "node n1" },
          { tag: "i", className: "node n2" },
          { tag: "i", className: "node n3" }
        ]
      }
    },
    poisson: {
      visual: {
        className: "visual-poisson",
        label: "λ(t)",
        generator: "poisson-scatter",
        elements: [
          { tag: "span", className: "axis x" },
          { tag: "span", className: "axis y" }
        ]
      }
    },
    scientific: {
      visual: {
        className: "visual-numerical",
        label: "u(x,t)",
        generator: "damped-sine",
        elements: [
          { tag: "span", className: "mesh" }
        ]
      }
    }
  },

  expertise: [
    {
      number: "01",
      title: { fr: "Statistiques & Modélisation", en: "Statistics & Modelling" },
      description: {
        fr: "Étudier l’incertitude par l’inférence, les tests statistiques, les modèles stochastiques et l’optimisation, puis interpréter les résultats avec rigueur.",
        en: "Studying uncertainty through inference, statistical testing, stochastic models and optimisation, then interpreting results with rigour."
      },
      keywords: ["Probability", "Inference", "Stochastic models"]
    },
    {
      number: "02",
      title: { fr: "Data Science & Machine Learning", en: "Data Science & Machine Learning" },
      description: {
        fr: "Préparer et explorer des données réelles, construire des modèles, les valider et communiquer leurs enseignements par des visualisations lisibles.",
        en: "Preparing and exploring real-world data, building and validating models, and communicating their insights through clear visualisations."
      },
      keywords: ["Data preparation", "Machine Learning", "Visualisation"]
    },
    {
      number: "03",
      title: { fr: "Intelligence Artificielle & Vision", en: "Artificial Intelligence & Computer Vision" },
      description: {
        fr: "Concevoir des systèmes fondés sur les réseaux de neurones, la vision par ordinateur, la reconnaissance faciale et vocale, l’OCR et la biométrie multimodale.",
        en: "Designing systems based on neural networks, computer vision, facial and voice recognition, OCR and multimodal biometrics."
      },
      keywords: ["Deep Learning", "Computer Vision", "Biometrics"]
    },
    {
      number: "04",
      title: { fr: "Calcul scientifique & Programmation", en: "Scientific Computing & Programming" },
      description: {
        fr: "Traduire des modèles mathématiques en simulations et méthodes numériques reproductibles avec Python, MATLAB et R.",
        en: "Translating mathematical models into reproducible simulations and numerical methods with Python, MATLAB and R."
      },
      keywords: ["Simulation", "Numerical methods", "Scientific programming"]
    }
  ],

  technologies: ["Python", "SQL", "NumPy", "pandas", "SciPy", "Matplotlib", "MATLAB", "R", "Power BI", "Git", "GitHub", "LaTeX"],

  experience: [
    {
      role: { fr: "Intervenant pédagogique en mathématiques", en: "Mathematics Tutor" },
      organisation: "Complétude",
      period: { fr: "Nov. 2025 – aujourd'hui", en: "Nov. 2025 – Present" },
      location: { fr: "Metz, France", en: "Metz, France" },
      description: {
        fr: "Accompagnement individualisé d'élèves du secondaire en mathématiques, avec adaptation des méthodes pédagogiques, préparation aux évaluations et suivi de la progression.",
        en: "Individual mathematics tutoring for secondary-school students, with adapted teaching methods, assessment preparation and progress monitoring."
      }
    },
    {
      role: { fr: "Superviseur TIC — Identification biométrique", en: "ICT Supervisor — Biometric Identification" },
      organisation: "INSEED / Projet national d'identification biométrique",
      period: { fr: "Déc. 2024 – Juin 2025", en: "Dec. 2024 – Jun. 2025" },
      location: { fr: "Togo", en: "Togo" },
      description: {
        fr: "Supervision du déploiement de dispositifs d'enrôlement biométrique sur plus de 15 sites, support technique, contrôle qualité des données et gestion des incidents liés aux équipements biométriques.",
        en: "Supervision of biometric enrolment deployments across more than 15 sites, technical support, data quality control and management of biometric-device incidents."
      }
    },
    {
      role: { fr: "Stagiaire en intelligence artificielle — Biométrie multimodale", en: "Artificial Intelligence Intern — Multimodal Biometrics" },
      organisation: "LPMCS & LARSI",
      period: { fr: "Mars 2024 – Sept. 2024", en: "Mar. 2024 – Sep. 2024" },
      location: { fr: "Région Maritime, Togo", en: "Maritime Region, Togo" },
      description: {
        fr: "Conception d'un système d'identification biométrique multimodal combinant reconnaissance faciale, authentification vocale, OCR et fusion de scores.",
        en: "Design of a multimodal biometric identification system combining facial recognition, voice authentication, OCR and score fusion."
      },
      relatedProject: "multimodal-biometrics"
    }
  ],

  education: [
    {
      institution: "Université de Lorraine",
      period: "2025–2026",
      degree: { fr: "Master 1 Mathématiques et Applications", en: "Master 1 Mathematics and Applications" },
      focus: { fr: "Probabilités • Statistiques • Modélisation • Calcul scientifique", en: "Probability • Statistics • Modelling • Scientific Computing" }
    },
    {
      institution: "UTBM & Université de Lomé",
      period: "2022–2025",
      degree: { fr: "Master Intelligence Artificielle & Big Data", en: "Master’s in Artificial Intelligence & Big Data" },
      focus: { fr: "Machine Learning • Vision par ordinateur • Big Data", en: "Machine Learning • Computer Vision • Big Data" }
    },
    {
      institution: "Université de Lomé",
      period: "2016–2020",
      degree: { fr: "Licence fondamentale en Mathématiques", en: "Bachelor’s degree in Mathematics" },
      focus: { fr: "Mathématiques • Probabilités • Analyse numérique", en: "Mathematics • Probability • Numerical Analysis" }
    }
  ],

  filters: [
    { id: "all", fr: "Tous", en: "All" },
    { id: "ai", fr: "Intelligence artificielle", en: "Artificial Intelligence" },
    { id: "statistics", fr: "Statistiques", en: "Statistics" },
    { id: "bi", fr: "Business Intelligence", en: "Business Intelligence" },
    { id: "scientific-computing", fr: "Calcul scientifique", en: "Scientific Computing" }
  ],

  projects: [
    {
      slug: "multimodal-biometrics",
      number: "01",
      featured: true,
      theme: "biometrics",
      coverImage: { src: "assets/images/projects/biometrics/cover.jpg", alt: { fr: "Gros plan macro sur un iris humain, illustrant l’identification biométrique.", en: "Macro close-up of a human iris, illustrating biometric identification." } },
      media: [],
      category: { fr: "Intelligence artificielle • Biométrie", en: "Artificial Intelligence • Biometrics" },
      title: { fr: "Conception et développement d’un système d’identification biométrique multimodal", en: "Design and Development of a Multimodal Biometric Identification System" },
      subtitle: { fr: "Reconnaissance faciale • Reconnaissance vocale • OCR", en: "Facial Recognition • Voice Recognition • OCR" },
      description: { fr: "Une architecture réunissant plusieurs modalités biométriques et une logique de fusion dans une interface dédiée.", en: "An architecture combining multiple biometric modalities and fusion logic within a dedicated interface." },
      technologies: ["Python", "FaceNet", "Wav2Vec2.0", "EasyOCR", "Tkinter"],
      year: "2025",
      status: "completed",
      categories: ["ai"],
      href: "projects/multimodal-biometrics.html"
    },
    {
      slug: "poisson-processes",
      number: "02",
      featured: false,
      theme: "poisson",
      coverImage: { src: "assets/images/projects/poisson/cover.jpg", alt: { fr: "Câble de recharge branché sur une borne de recharge pour véhicule électrique.", en: "Charging cable plugged into an electric-vehicle charging station." } },
      media: [],
      category: { fr: "Probabilités • Statistiques", en: "Probability • Statistics" },
      title: { fr: "Modélisation stochastique des flux d’événements par processus de Poisson", en: "Stochastic Modelling of Event Flows with the Poisson Process" },
      subtitle: { fr: "Applications à la recharge de véhicules électriques et aux demandes de services urbains", en: "Applications to electric-vehicle charging and urban service requests" },
      description: { fr: "Théorie, simulation R/Python et confrontation du processus de Poisson à deux jeux de données réels : sessions de recharge de véhicules électriques (ACN-Data, Caltech) et signalements municipaux (NYC 311, Bronx).", en: "Theory, R/Python simulation, and testing the Poisson process against two real-world datasets: electric-vehicle charging sessions (ACN-Data, Caltech) and municipal service reports (NYC 311, Bronx)." },
      technologies: ["Python", "R", "NumPy", "pandas", "SciPy", "Matplotlib"],
      year: "2025-2026",
      status: "completed",
      categories: ["statistics"],
      href: "projects/poisson-processes.html"
    },
    {
      slug: "dashboard-prets-immobiliers",
      number: "03",
      featured: false,
      theme: "default",
      coverImage: { src: "assets/images/projects/dashboard-prets-immobiliers/cover.jpg", alt: { fr: "Capture d’écran du dashboard Power BI : historique des demandes de prêts et taux d’acceptation par année.", en: "Screenshot of the Power BI dashboard: loan request history and acceptance rate by year." } },
      media: [],
      category: { fr: "Business Intelligence • Power BI", en: "Business Intelligence • Power BI" },
      title: { fr: "Dashboard de pilotage des prêts immobiliers", en: "Real-Estate Loan Portfolio Dashboard" },
      subtitle: { fr: "Modélisation de données et DAX pour un réseau d’agences bancaires", en: "Data modelling and DAX for a bank branch network" },
      description: { fr: "Dashboard Power BI pilotant l’activité de prêts immobiliers d’un réseau d’agences (Crédit Breton) : demandes, taux d’acceptation, performance par agence, et un score emprunteur calculé en DAX.", en: "A Power BI dashboard steering a bank branch network’s (Crédit Breton) real-estate loan activity: requests, acceptance rate, branch performance, and a DAX-calculated borrower score." },
      technologies: ["Power BI", "DAX"],
      year: "2026",
      status: "completed",
      categories: ["bi"],
      href: "projects/dashboard-prets-immobiliers.html"
    },
    {
      slug: "scientific-computing",
      number: "04",
      featured: false,
      theme: "scientific",
      coverImage: { src: "assets/images/projects/scientific-computing/cover.jpg", alt: { fr: "Vagues déferlant sur des rochers, une image du phénomène ondulatoire modélisé.", en: "Waves breaking over rocks, a real-world instance of the wave phenomenon being modelled." } },
      media: [],
      category: { fr: "Mathématiques appliquées", en: "Applied Mathematics" },
      title: { fr: "Calcul scientifique & modélisation numérique", en: "Scientific Computing & Numerical Modelling" },
      subtitle: null,
      description: { fr: "Étude de méthodes numériques pour les EDP : schéma de Lax-Wendroff, stabilité CFL, éléments finis et maillages DistMesh.", en: "Study of numerical methods for PDEs: Lax–Wendroff scheme, CFL stability, finite elements and DistMesh meshes." },
      technologies: ["MATLAB", "DistMesh"],
      year: null,
      status: "progress",
      categories: ["scientific-computing"],
      href: "projects/scientific-computing.html"
    }
  ],

  presentations: [],
  certifications: [],

  projectDetails: {
    "multimodal-biometrics": {
      number: "01",
      coverImage: { src: "assets/images/projects/biometrics/cover.jpg", alt: { fr: "Gros plan macro sur un iris humain, illustrant l’identification biométrique.", en: "Macro close-up of a human iris, illustrating biometric identification." } },
      media: [],
      category: { fr: "Intelligence artificielle • Biométrie", en: "Artificial Intelligence • Biometrics" },
      title: { fr: "Conception et développement d’un système d’identification biométrique multimodal", en: "Design and Development of a Multimodal Biometric Identification System" },
      subtitle: { fr: "Reconnaissance faciale • Reconnaissance vocale • OCR", en: "Facial Recognition • Voice Recognition • OCR" },
      lead: { fr: "Projet de mémoire associant l’analyse du visage, de la voix et de documents dans une architecture de décision multimodale.", en: "A thesis project combining facial, voice and document analysis in a multimodal decision architecture." },
      year: "2025",
      status: "completed",
      technologies: ["Python", "FaceNet", "Wav2Vec2.0", "EasyOCR", "Tkinter"],
      sections: [
        { title: { fr: "Contexte & objectif", en: "Context & objective" }, body: { fr: "Concevoir un système capable d’exploiter plusieurs signaux biométriques complémentaires dans une même application d’identification.", en: "Design a system capable of using several complementary biometric signals within one identification application." } },
        { title: { fr: "Architecture", en: "Architecture" }, body: { fr: "FaceNet est mobilisé pour la représentation faciale, Wav2Vec2.0 pour la modalité vocale et EasyOCR pour la reconnaissance optique de caractères. Une interface Tkinter rassemble le parcours utilisateur.", en: "FaceNet provides facial representations, Wav2Vec2.0 handles the voice modality and EasyOCR performs optical character recognition. A Tkinter interface brings the user journey together." } },
        { title: { fr: "Fusion multimodale", en: "Multimodal fusion" }, body: { fr: "Le système combine les trois modalités pour la décision finale. Sur l’échantillon de validation du mémoire (10 sujets, 500 images par test facial, 30 échantillons vocaux, documents d’identité pour l’OCR), la précision mesurée est de 85 % pour la reconnaissance faciale en conditions normales, 93,3 % pour la reconnaissance vocale en environnement silencieux (70 % en environnement bruyant), et 88 % pour l’extraction OCR sur documents d’identité.", en: "The system combines the three modalities for the final decision. On the thesis's validation sample (10 subjects, 500 images per facial test, 30 voice samples, ID documents for OCR), measured accuracy was 85% for facial recognition under normal conditions, 93.3% for voice recognition in a quiet environment (70% in a noisy one), and 88% for OCR extraction on identity documents." } },
        { title: { fr: "Simulateur de fusion", en: "Fusion simulator" }, type: "interactive", component: "fusion-simulator", body: { fr: "Ajustez trois scores de confiance illustratifs et un seuil d’acceptation pour voir la fusion pondérée et la courbe ROC se recalculer en direct.", en: "Adjust three illustrative confidence scores and an acceptance threshold to watch the weighted fusion and ROC curve recompute live." }, note: { fr: "Scores et courbe ROC synthétiques, à visée pédagogique — pas les résultats réels du mémoire (voir la section précédente et le PDF ci-dessous pour les chiffres mesurés).", en: "Synthetic scores and ROC curve, for teaching purposes — not the thesis's real results (see the previous section and the PDF below for the measured figures)." } },
        { title: { fr: "Limites & suite", en: "Limitations & next steps" }, body: { fr: "La précision chute avec des accessoires occultant le visage (70 %), en faible luminosité (65 %) ou au-delà de 2 m de la caméra (60 %) ; la reconnaissance vocale se dégrade en environnement bruyant (70 % contre 93,3 % en silence) ; l’OCR interprète mal certains caractères spéciaux ou italiques. Pistes retenues dans le mémoire : seuils adaptatifs et prétraitement d’image pour le visage, filtrage du bruit et meilleurs microphones pour la voix, modèles OCR spécialisés pour les documents d’identité.", en: "Accuracy drops with face-occluding accessories (70%), low light (65%), or a camera distance beyond 2 m (60%); voice recognition degrades in noisy environments (70% vs. 93.3% in silence); OCR misreads some special or italic characters. Next steps identified in the thesis: adaptive thresholds and image pre-processing for facial recognition, noise filtering and better microphones for voice, and OCR models specialised for identity documents." } }
      ],
      documents: [
        { type: "pdf", label: { fr: "Mémoire de master (PDF)", en: "Master's thesis (PDF)" }, href: "assets/documents/thesis/memoire-koessivi-jean-honou.pdf", available: true },
        { type: "pptx", label: { fr: "Support de soutenance (PPTX)", en: "Defence presentation (PPTX)" }, href: "assets/documents/presentations/soutenance-koessivi-jean-honou.pptx", available: true },
        { type: "repository", label: { fr: "Code source (GitHub)", en: "Source code (GitHub)" }, href: "https://github.com/honou-jean/Projet_de_soutenance", available: true }
      ]
    },
    "poisson-processes": {
      number: "02",
      coverImage: { src: "assets/images/projects/poisson/cover.jpg", alt: { fr: "Câble de recharge branché sur une borne de recharge pour véhicule électrique.", en: "Charging cable plugged into an electric-vehicle charging station." } },
      media: [],
      category: { fr: "Probabilités • Statistiques", en: "Probability • Statistics" },
      title: { fr: "Modélisation stochastique des flux d’événements par processus de Poisson", en: "Stochastic Modelling of Event Flows with the Poisson Process" },
      subtitle: { fr: "Applications à la recharge de véhicules électriques et aux demandes de services urbains", en: "Applications to electric-vehicle charging and urban service requests" },
      lead: { fr: "Théorie, simulation et confrontation du processus de Poisson à deux jeux de données réels.", en: "Theory, simulation and testing the Poisson process against two real-world datasets." },
      status: "completed",
      technologies: ["Python", "R", "NumPy", "pandas", "SciPy", "Matplotlib"],
      sections: [
        { title: { fr: "Problématique", en: "Research question" }, body: { fr: "Dans quelle mesure un processus de Poisson homogène décrit-il les événements observés, et comment détecter une intensité variable ou de la surdispersion ?", en: "To what extent can a homogeneous Poisson process describe the observed events, and how can varying intensity or overdispersion be detected?" } },
        { title: { fr: "Données", en: "Data" }, body: { fr: "ACN-Data documente des sessions de recharge de véhicules électriques sur un parking du campus Caltech (1 218 sessions retenues après filtrage) ; NYC 311 rassemble les signalements « Traffic Signal Condition » dans le Bronx sur janvier-février 2020 (664 signalements).", en: "ACN-Data documents electric-vehicle charging sessions on a Caltech campus parking lot (1,218 sessions retained after filtering); NYC 311 gathers “Traffic Signal Condition” reports in the Bronx over January–February 2020 (664 reports)." } },
        { title: { fr: "Méthodologie", en: "Methodology" }, items: [{ fr: "Théorie et simulation des processus de comptage (validée sous R et Python)", en: "Counting-process theory and simulation (validated under both R and Python)" }, { fr: "Estimation de l’intensité et analyse temporelle", en: "Intensity estimation and temporal analysis" }, { fr: "Comparaison des comportements homogènes et non homogènes", en: "Comparison of homogeneous and non-homogeneous behaviour" }, { fr: "Diagnostic de surdispersion", en: "Overdispersion diagnostics" }] },
        { title: { fr: "Simulateur interactif", en: "Interactive simulator" }, type: "interactive", component: "poisson-simulator", body: { fr: "Générez une réalisation d’un processus de Poisson homogène ou non homogène et observez ses statistiques se recalculer en direct.", en: "Generate a realization of a homogeneous or non-homogeneous Poisson process and watch its statistics recompute live." }, note: { fr: "Illustration interactive de la méthode, avec des paramètres libres — les résultats réels d’ACN-Data et de NYC 311 sont présentés dans la section suivante.", en: "An interactive illustration of the method with free parameters — the real ACN-Data and NYC 311 results are presented in the next section." } },
        { title: { fr: "Résultats", en: "Results" }, body: { fr: "Le modèle de Poisson homogène est rejeté au seuil de 5 % pour les deux jeux de données : λ̂ ≈ 5,46 sessions/jour actif pour ACN-Data (indice de dispersion ≈ 1,57) et λ̂ ≈ 0,46 signalement/heure pour NYC 311. La stratification par un processus de Poisson non homogène améliore nettement l’ajustement : réduction de la surdispersion de 29,5 % pour ACN-Data (par jour de semaine) et de 10,7 % pour NYC 311 (par heure de la journée, test du chi-deux non rejeté, p ≈ 0,058).", en: "The homogeneous Poisson model is rejected at the 5% level for both datasets: λ̂ ≈ 5.46 sessions per active day for ACN-Data (dispersion index ≈ 1.57) and λ̂ ≈ 0.46 reports per hour for NYC 311. Stratifying with a non-homogeneous Poisson process clearly improves the fit: a 29.5% reduction in overdispersion for ACN-Data (by weekday) and 10.7% for NYC 311 (by hour of day, chi-square test not rejected, p ≈ 0.058)." }, images: [
          { src: "assets/images/projects/poisson/resultat-acn-data.jpg", alt: { fr: "ACN-Data : distribution empirique comparée aux modèles de Poisson homogène et non homogène, et estimation du taux d’arrivée par jour de la semaine.", en: "ACN-Data: empirical distribution compared to the homogeneous and non-homogeneous Poisson models, and arrival-rate estimate by weekday." }, caption: { fr: "ACN-Data : ajustement du modèle et λ par jour de semaine", en: "ACN-Data: model fit and λ by weekday" } },
          { src: "assets/images/projects/poisson/resultat-nyc311.jpg", alt: { fr: "NYC 311 : distribution empirique comparée aux modèles de Poisson, et profil horaire des signalements.", en: "NYC 311: empirical distribution compared to the Poisson models, and hourly report profile." }, caption: { fr: "NYC 311 : ajustement du modèle et profil horaire", en: "NYC 311: model fit and hourly profile" } }
        ] }
      ],
      documents: [
        { type: "pdf", label: { fr: "Rapport complet (PDF)", en: "Full report (PDF)" }, href: "assets/documents/ter-poisson/memoire-ter-processus-poisson-honou-koessivi-jean.pdf", available: true },
        { type: "pdf", label: { fr: "Support de soutenance (PDF)", en: "Presentation slides (PDF)" }, href: "assets/documents/ter-poisson/presentation-ter-processus-poisson.pdf", available: true },
        { type: "repository", label: { fr: "Code source (GitHub)", en: "Source code (GitHub)" }, href: "https://github.com/honou-jean/Modelisation-processus-poisson", available: true }
      ]
    },
    "dashboard-prets-immobiliers": {
      number: "03",
      coverImage: { src: "assets/images/projects/dashboard-prets-immobiliers/cover.jpg", alt: { fr: "Capture d’écran du dashboard Power BI : historique des demandes de prêts et taux d’acceptation par année.", en: "Screenshot of the Power BI dashboard: loan request history and acceptance rate by year." } },
      media: [
        { src: "assets/images/projects/dashboard-prets-immobiliers/01-accueil.jpg", alt: { fr: "Page d’accueil du dashboard, avec le mode d’emploi des 4 autres pages.", en: "Dashboard home page, with usage guidance for the other four pages." }, caption: { fr: "Accueil : mode d’emploi", en: "Home: usage guide" } },
        { src: "assets/images/projects/dashboard-prets-immobiliers/02-demande-de-prets.jpg", alt: { fr: "Historique des demandes de prêts, taux d’acceptation par année et montant moyen des opérations.", en: "Loan request history, yearly acceptance rate and average operation amount." }, caption: { fr: "Demande de prêts", en: "Loan requests" } },
        { src: "assets/images/projects/dashboard-prets-immobiliers/04-performance-agences.jpg", alt: { fr: "Carte des agences du réseau et comparaison de leur performance.", en: "Map of the branch network and comparison of branch performance." }, caption: { fr: "Performance agences", en: "Branch performance" } },
        { src: "assets/images/projects/dashboard-prets-immobiliers/03-indicateurs-clients.jpg", alt: { fr: "Synthèse des indicateurs clients.", en: "Client indicators summary." }, caption: { fr: "Indicateurs clients", en: "Client indicators" } },
        { src: "assets/images/projects/dashboard-prets-immobiliers/05-liste-des-clients.jpg", alt: { fr: "Recherche et fiche d’un client particulier.", en: "Search and record for an individual client." }, caption: { fr: "Liste des clients", en: "Client list" } }
      ],
      category: { fr: "Business Intelligence • Power BI", en: "Business Intelligence • Power BI" },
      title: { fr: "Dashboard de pilotage des prêts immobiliers", en: "Real-Estate Loan Portfolio Dashboard" },
      subtitle: { fr: "Modélisation de données et DAX pour un réseau d’agences bancaires", en: "Data modelling and DAX for a bank branch network" },
      lead: { fr: "Dashboard Power BI pilotant l’activité de prêts immobiliers du réseau d’agences Crédit Breton, avec un score emprunteur calculé en DAX pour aider les conseillers à statuer sur l’accord ou le refus d’un prêt.", en: "A Power BI dashboard steering the Crédit Breton branch network’s real-estate loan activity, with a DAX-calculated borrower score to help advisors decide whether to approve a loan." },
      year: "2026",
      status: "completed",
      technologies: ["Power BI", "DAX"],
      sections: [
        { title: { fr: "Contexte & objectif", en: "Context & objective" }, body: { fr: "Piloter l’activité de prêts immobiliers d’un réseau de 6 agences : demandes reçues, taux d’acceptation, montants, performance comparée des agences, et suivi individuel des clients. Le dashboard s’ouvre sur une page d’accueil qui sert de mode d’emploi pour les 4 pages d’analyse.", en: "Steer a 6-branch network’s real-estate loan activity: requests received, acceptance rate, amounts, compared branch performance, and individual client tracking. The dashboard opens on a home page that doubles as a usage guide for the four analysis pages." } },
        { title: { fr: "Résultats", en: "Results" }, body: { fr: "Sur les 200 demandes suivies, 21 991 097 € de montant total d’opérations. Le taux d’acceptation varie de 64,71 % (Quimper) à 81,48 % (Rennes) selon les agences, un écart que le dashboard rend immédiatement visible sur la carte et le graphique de comparaison.", en: "Across the 200 tracked requests, €21,991,097 in total operation amount. The acceptance rate ranges from 64.71% (Quimper) to 81.48% (Rennes) across branches, a gap the dashboard surfaces immediately on the map and the comparison chart." }, images: [
          { src: "assets/images/projects/dashboard-prets-immobiliers/resultat-score-emprunteur.jpg", alt: { fr: "Table des demandes avec le score emprunteur calculé : accord ou refus par demande.", en: "Requests table with the calculated borrower score: approved or rejected per request." }, caption: { fr: "Décision accord/refus calculée automatiquement", en: "Approve/reject decision, calculated automatically" } }
        ], note: { fr: "Le score emprunteur calculé en DAX affecte automatiquement ACCEPTE ou REFUS à chaque demande, visible directement dans le tableau de suivi.", en: "The DAX-calculated borrower score automatically assigns ACCEPTE or REFUS to each request, visible directly in the tracking table." } },
        { title: { fr: "Modèle de données", en: "Data model" }, body: { fr: "Un modèle relationnel de 5 tables :", en: "A relational model with 5 tables:" }, items: [
          { fr: "Demandes de prêt : table de faits (date, montant de l’opération, montant prêté, durée, décision, score emprunteur)", en: "Loan requests: fact table (date, operation amount, loan amount, duration, decision, borrower score)" },
          { fr: "Situation famille : âge, date de naissance, nombre d’enfants à charge", en: "Family situation: age, date of birth, number of dependent children" },
          { fr: "Situation pro : régularité des revenus, revenu mensuel moyen", en: "Employment situation: income regularity, average monthly income" },
          { fr: "Agences : ville, localisation géographique", en: "Branches: city, geographic location" },
          { fr: "Apport : apport personnel associé à chaque demande", en: "Down payment: personal contribution tied to each request" }
        ], note: { fr: "Une hiérarchie de dates (Année → Trimestre → Mois → Jour) structure toute l’analyse temporelle.", en: "A date hierarchy (Year → Quarter → Month → Day) structures all time-based analysis." } },
        { title: { fr: "Score emprunteur calculé en DAX", en: "DAX-calculated borrower score" }, body: { fr: "Une colonne calculée combine 3 critères en cascade pour donner aux conseillers une recommandation immédiate (accord ou refus) sur chaque demande :", en: "A calculated column combines 3 cascading criteria to give advisors an immediate recommendation (approve or reject) on each request:" }, items: [
          { fr: "Espérance de vie : âge de l’emprunteur ≥ 82 ans → refus", en: "Life expectancy: borrower age ≥ 82 → reject" },
          { fr: "Régularité des revenus : revenus déclarés « très irréguliers » → refus", en: "Income regularity: income declared “very irregular” → reject" },
          { fr: "Capacité de remboursement : mensualité du prêt supérieure au revenu mensuel réparti sur le foyer → refus", en: "Repayment capacity: loan instalment exceeding monthly income spread across the household → reject" }
        ], note: { fr: "La formule combine 3 IF imbriqués et la fonction LOOKUPVALUE pour aller chercher, pour chaque demande, les données du client dans deux tables sans relation active avec la table des demandes.", en: "The formula nests 3 IFs and uses LOOKUPVALUE to fetch, for each request, the client’s data from two tables with no active relationship to the requests table." } },
        { title: { fr: "Pages du dashboard", en: "Dashboard pages" }, items: [
          { fr: "Demande de prêts : historique, taux d’acceptation, montant moyen des opérations, dossiers en cours", en: "Loan requests: history, acceptance rate, average operation amount, pending files" },
          { fr: "Performance agences : carte du réseau, volume et taux d’acceptation par agence", en: "Branch performance: network map, volume and acceptance rate per branch" },
          { fr: "Indicateurs clients : synthèse par typologie de clients", en: "Client indicators: summary by client type" },
          { fr: "Liste des clients : recherche et fiche individuelle", en: "Client list: search and individual record" }
        ], images: [
          { src: "assets/images/projects/dashboard-prets-immobiliers/02-demande-de-prets.jpg", alt: { fr: "Page Demande de prêts : historique, taux d’acceptation, montant moyen des opérations.", en: "Loan requests page: history, acceptance rate, average operation amount." }, caption: { fr: "Demande de prêts", en: "Loan requests" } },
          { src: "assets/images/projects/dashboard-prets-immobiliers/04-performance-agences.jpg", alt: { fr: "Page Performance agences : carte du réseau et comparaison des agences.", en: "Branch performance page: network map and branch comparison." }, caption: { fr: "Performance agences", en: "Branch performance" } },
          { src: "assets/images/projects/dashboard-prets-immobiliers/03-indicateurs-clients.jpg", alt: { fr: "Page Indicateurs clients : synthèse par typologie de clients.", en: "Client indicators page: summary by client type." }, caption: { fr: "Indicateurs clients", en: "Client indicators" } },
          { src: "assets/images/projects/dashboard-prets-immobiliers/05-liste-des-clients.jpg", alt: { fr: "Page Liste des clients : recherche et fiche individuelle.", en: "Client list page: search and individual record." }, caption: { fr: "Liste des clients", en: "Client list" } }
        ] }
      ],
      documents: [
        { type: "repository", label: { fr: "Code source (GitHub)", en: "Source code (GitHub)" }, href: "https://github.com/honou-jean/Dashboard-Prets-Immobiliers", available: true }
      ]
    },
    "scientific-computing": {
      number: "04",
      coverImage: { src: "assets/images/projects/scientific-computing/cover.jpg", alt: { fr: "Vagues déferlant sur des rochers, une image du phénomène ondulatoire modélisé.", en: "Waves breaking over rocks, a real-world instance of the wave phenomenon being modelled." } },
      media: [],
      category: { fr: "Mathématiques appliquées", en: "Applied Mathematics" },
      title: { fr: "Calcul scientifique & modélisation numérique", en: "Scientific Computing & Numerical Modelling" },
      lead: { fr: "Travaux autour de la résolution numérique d’équations aux dérivées partielles et de la stabilité des schémas.", en: "Work on numerical solutions of partial differential equations and numerical-scheme stability." },
      status: "progress",
      technologies: ["MATLAB", "DistMesh"],
      sections: [
        { title: { fr: "Axes étudiés", en: "Topics studied" }, items: [{ fr: "Schéma de Lax-Wendroff", en: "Lax–Wendroff scheme" }, { fr: "Condition de stabilité CFL", en: "CFL stability condition" }, { fr: "Méthode des éléments finis", en: "Finite-element method" }, { fr: "Génération de maillages avec DistMesh", en: "Mesh generation with DistMesh" }] },
        { title: { fr: "Approche", en: "Approach" }, body: { fr: "Mettre en relation formulation mathématique, discrétisation, implémentation MATLAB et analyse du comportement numérique.", en: "Connecting mathematical formulation, discretisation, MATLAB implementation and analysis of numerical behaviour." } },
        { title: { fr: "Démonstration de la stabilité CFL", en: "CFL stability demonstration" }, type: "interactive", component: "cfl-stability", body: { fr: "Une équation d’advection intégrée par le schéma de Lax-Wendroff, calculée dans le navigateur. Augmentez ν au-delà de 1 pour observer une vraie divergence numérique.", en: "An advection equation integrated with the Lax-Wendroff scheme, computed in the browser. Push ν above 1 to watch a genuine numerical blow-up." } },
        { title: { fr: "Résultats", en: "Results" }, body: { fr: "Les résultats, figures et comparaisons seront ajoutés uniquement à partir des travaux validés.", en: "Results, figures and comparisons will only be added from verified work." } }
      ],
      documents: [
        { type: "pdf", label: { fr: "Rapport du projet", en: "Project report" }, href: "assets/documents/reports/scientific-computing-report.pdf", available: false }
      ]
    }
  }
};
