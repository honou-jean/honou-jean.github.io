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
    { id: "statistics", fr: "Statistiques", en: "Statistics" }
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
      title: { fr: "Modélisation statistique des flux d’événements par processus de Poisson", en: "Statistical Modelling of Event Flows with the Poisson Process" },
      subtitle: { fr: "Applications à la recharge de véhicules électriques et aux demandes de services urbains", en: "Applications to electric-vehicle charging and urban service requests" },
      description: { fr: "Théorie, simulation R/Python et confrontation du processus de Poisson à deux jeux de données réels : sessions de recharge de véhicules électriques (ACN-Data, Caltech) et signalements municipaux (NYC 311, Bronx).", en: "Theory, R/Python simulation, and testing the Poisson process against two real-world datasets: electric-vehicle charging sessions (ACN-Data, Caltech) and municipal service reports (NYC 311, Bronx)." },
      technologies: ["Python", "R", "NumPy", "pandas", "SciPy", "Matplotlib"],
      year: "2025-2026",
      status: "completed",
      categories: ["statistics"],
      href: "projects/poisson-processes.html"
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
      title: { fr: "Modélisation statistique des flux d’événements par processus de Poisson", en: "Statistical Modelling of Event Flows with the Poisson Process" },
      subtitle: { fr: "Applications à la recharge de véhicules électriques et aux demandes de services urbains", en: "Applications to electric-vehicle charging and urban service requests" },
      lead: { fr: "Théorie, simulation et confrontation du processus de Poisson à deux jeux de données réels.", en: "Theory, simulation and testing the Poisson process against two real-world datasets." },
      status: "completed",
      technologies: ["Python", "R", "NumPy", "pandas", "SciPy", "Matplotlib"],
      sections: [
        { title: { fr: "Problématique", en: "Research question" }, body: { fr: "Dans quelle mesure un processus de Poisson homogène décrit-il les événements observés, et comment détecter une intensité variable ou de la surdispersion ?", en: "To what extent can a homogeneous Poisson process describe the observed events, and how can varying intensity or overdispersion be detected?" } },
        { title: { fr: "Données", en: "Data" }, body: { fr: "ACN-Data documente des sessions de recharge de véhicules électriques sur un parking du campus Caltech (1 218 sessions retenues après filtrage) ; NYC 311 rassemble les signalements « Traffic Signal Condition » dans le Bronx sur janvier-février 2020 (664 signalements).", en: "ACN-Data documents electric-vehicle charging sessions on a Caltech campus parking lot (1,218 sessions retained after filtering); NYC 311 gathers “Traffic Signal Condition” reports in the Bronx over January–February 2020 (664 reports)." } },
        { title: { fr: "Méthodologie", en: "Methodology" }, items: [{ fr: "Théorie et simulation des processus de comptage (validée sous R et Python)", en: "Counting-process theory and simulation (validated under both R and Python)" }, { fr: "Estimation de l’intensité et analyse temporelle", en: "Intensity estimation and temporal analysis" }, { fr: "Comparaison des comportements homogènes et non homogènes", en: "Comparison of homogeneous and non-homogeneous behaviour" }, { fr: "Diagnostic de surdispersion", en: "Overdispersion diagnostics" }] },
        { title: { fr: "Simulateur interactif", en: "Interactive simulator" }, type: "interactive", component: "poisson-simulator", body: { fr: "Générez une réalisation d’un processus de Poisson homogène ou non homogène et observez ses statistiques se recalculer en direct.", en: "Generate a realization of a homogeneous or non-homogeneous Poisson process and watch its statistics recompute live." }, note: { fr: "Illustration interactive de la méthode, avec des paramètres libres — les résultats réels d’ACN-Data et de NYC 311 sont présentés dans la section suivante.", en: "An interactive illustration of the method with free parameters — the real ACN-Data and NYC 311 results are presented in the next section." } },
        { title: { fr: "Résultats", en: "Results" }, body: { fr: "Le modèle de Poisson homogène est rejeté au seuil de 5 % pour les deux jeux de données : λ̂ ≈ 5,46 sessions/jour actif pour ACN-Data (indice de dispersion ≈ 1,57) et λ̂ ≈ 0,46 signalement/heure pour NYC 311. La stratification par un processus de Poisson non homogène améliore nettement l’ajustement : réduction de la surdispersion de 29,5 % pour ACN-Data (par jour de semaine) et de 10,7 % pour NYC 311 (par heure de la journée, test du chi-deux non rejeté, p ≈ 0,058).", en: "The homogeneous Poisson model is rejected at the 5% level for both datasets: λ̂ ≈ 5.46 sessions per active day for ACN-Data (dispersion index ≈ 1.57) and λ̂ ≈ 0.46 reports per hour for NYC 311. Stratifying with a non-homogeneous Poisson process clearly improves the fit: a 29.5% reduction in overdispersion for ACN-Data (by weekday) and 10.7% for NYC 311 (by hour of day, chi-square test not rejected, p ≈ 0.058)." } }
      ],
      documents: [
        { type: "pdf", label: { fr: "Rapport complet (PDF)", en: "Full report (PDF)" }, href: "assets/documents/ter-poisson/memoire-ter-processus-poisson-honou-koessivi-jean.pdf", available: true },
        { type: "pdf", label: { fr: "Support de soutenance (PDF)", en: "Presentation slides (PDF)" }, href: "assets/documents/ter-poisson/presentation-ter-processus-poisson.pdf", available: true },
        { type: "repository", label: { fr: "Code source (GitHub)", en: "Source code (GitHub)" }, href: "https://github.com/honou-jean/Modelisation-processus-poisson", available: true }
      ]
    }
  }
};
