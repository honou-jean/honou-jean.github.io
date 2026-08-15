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

  documents: {
    cv: { path: "assets/documents/cv/cv-koessivi-jean-honou.pdf", available: true },
    thesis: { path: "assets/documents/thesis/memoire-koessivi-jean-honou.pdf", available: true },
    thesisPresentation: { path: "assets/documents/presentations/soutenance-koessivi-jean-honou.pptx", available: true },
    thesisPresentationPdf: { path: "assets/documents/presentations/soutenance-koessivi-jean-honou.pdf", available: false }
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
    { id: "scientific-computing", fr: "Calcul scientifique", en: "Scientific Computing" }
  ],

  projects: [
    {
      slug: "multimodal-biometrics",
      number: "01",
      featured: true,
      theme: "biometrics",
      coverImage: null,
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
      coverImage: null,
      media: [],
      category: { fr: "Probabilités • Statistiques", en: "Probability • Statistics" },
      title: { fr: "Processus de Poisson & données réelles", en: "Poisson Processes & Real-World Data" },
      subtitle: null,
      description: { fr: "Modélisation stochastique appliquée aux sessions de recharge de véhicules électriques et aux flux urbains.", en: "Stochastic modelling applied to electric-vehicle charging sessions and urban service-request flows." },
      technologies: ["Python", "NumPy", "pandas", "SciPy", "Matplotlib"],
      year: null,
      status: "progress",
      categories: ["statistics"],
      href: "projects/poisson-processes.html"
    },
    {
      slug: "scientific-computing",
      number: "03",
      featured: false,
      theme: "scientific",
      coverImage: null,
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

  thesis: {
    technologies: ["Python", "FaceNet", "Wav2Vec2.0", "EasyOCR", "Multimodal Fusion", "Tkinter"],
    relatedProject: "multimodal-biometrics"
  },

  presentations: [],
  certifications: [],

  projectDetails: {
    "multimodal-biometrics": {
      number: "01",
      coverImage: null,
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
        { title: { fr: "Fusion multimodale", en: "Multimodal fusion" }, body: { fr: "Le projet prépare une décision à partir de plusieurs modalités. Les règles détaillées, seuils et résultats chiffrés seront documentés uniquement à partir du mémoire validé.", en: "The project combines evidence from multiple modalities. Detailed rules, thresholds and quantitative results will only be documented from the verified thesis." } },
        { title: { fr: "Limites & suite", en: "Limitations & next steps" }, body: { fr: "Les limites expérimentales, conditions d’utilisation et pistes d’amélioration seront ajoutées avec les éléments validés du projet.", en: "Experimental limitations, operating conditions and future improvements will be added with verified project material." } }
      ],
      documents: [
        { type: "pdf", label: { fr: "Rapport du projet", en: "Project report" }, href: "assets/documents/reports/multimodal-biometrics-report.pdf", available: false }
      ]
    },
    "poisson-processes": {
      number: "02",
      coverImage: null,
      media: [],
      category: { fr: "Probabilités • Statistiques", en: "Probability • Statistics" },
      title: { fr: "Processus de Poisson & données réelles", en: "Poisson Processes & Real-World Data" },
      lead: { fr: "Modélisation stochastique de données d’événements issues de la recharge électrique et de services urbains.", en: "Stochastic modelling of event data from electric-vehicle charging and urban services." },
      status: "progress",
      technologies: ["Python", "NumPy", "pandas", "SciPy", "Matplotlib"],
      sections: [
        { title: { fr: "Problématique", en: "Research question" }, body: { fr: "Dans quelle mesure un processus de Poisson homogène décrit-il les événements observés, et comment détecter une intensité variable ou de la surdispersion ?", en: "To what extent can a homogeneous Poisson process describe the observed events, and how can varying intensity or overdispersion be detected?" } },
        { title: { fr: "Données", en: "Data" }, body: { fr: "ACN-Data documente des sessions de recharge de véhicules électriques ; NYC 311 rassemble des demandes de service urbaines horodatées.", en: "ACN-Data documents electric-vehicle charging sessions; NYC 311 contains timestamped urban service requests." } },
        { title: { fr: "Méthodologie", en: "Methodology" }, items: [{ fr: "Théorie et simulation des processus de comptage", en: "Counting-process theory and simulation" }, { fr: "Estimation de l’intensité et analyse temporelle", en: "Intensity estimation and temporal analysis" }, { fr: "Comparaison des comportements homogènes et non homogènes", en: "Comparison of homogeneous and non-homogeneous behaviour" }, { fr: "Diagnostic de surdispersion", en: "Overdispersion diagnostics" }] },
        { title: { fr: "Simulateur interactif", en: "Interactive simulator" }, type: "interactive", component: "poisson-simulator", body: { fr: "Générez une réalisation d’un processus de Poisson homogène ou non homogène et observez ses statistiques se recalculer en direct.", en: "Generate a realization of a homogeneous or non-homogeneous Poisson process and watch its statistics recompute live." }, note: { fr: "Illustration interactive de la méthode, avec des paramètres libres — pas les résultats réels d’ACN-Data ou de NYC 311, qui seront publiés après validation de l’analyse.", en: "An interactive illustration of the method with free parameters — not the real ACN-Data or NYC 311 results, which will be published once the analysis is verified." } },
        { title: { fr: "État du travail", en: "Current state" }, body: { fr: "Les conclusions et résultats seront publiés après finalisation et validation de l’analyse.", en: "Findings and conclusions will be published after the analysis is completed and verified." } }
      ],
      documents: [
        { type: "pdf", label: { fr: "Rapport du projet", en: "Project report" }, href: "assets/documents/reports/poisson-processes-report.pdf", available: false }
      ]
    },
    "scientific-computing": {
      number: "03",
      coverImage: null,
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
