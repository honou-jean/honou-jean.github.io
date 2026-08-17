# Portfolio professionnel — Koessivi Jean HONOU

Portfolio public statique, responsive et bilingue consacré à la Data Science, l’intelligence artificielle, les statistiques et les mathématiques appliquées. Une fondation Supabase séparée est préparée pour le futur espace élèves privé, mais elle reste inactive tant que le projet Supabase n’est pas configuré.

## Prévisualiser le site

Vous pouvez ouvrir `index.html` directement. Pour tester les chemins et documents dans de meilleures conditions, ouvrez PowerShell dans ce dossier puis lancez, lorsque Python est installé :

```powershell
python -m http.server 8000
```

Ouvrez ensuite `http://localhost:8000`.

## Fichiers à modifier régulièrement

- `assets/js/site-data.js` : coordonnées, parcours, expertise, technologies, projets, documents et contenus détaillés des projets.
- `assets/js/i18n.js` : textes d’interface français et anglais.
- `assets/css/style.css` : thème visuel et responsive.
- `index.html` : structure sémantique générale et métadonnées SEO.
- `assets/js/supabase-config.js` : configuration publique de l’espace élèves, à laisser vide tant que Supabase n’est pas prêt.

Les textes français et anglais d’un même contenu structuré utilisent la forme :

```javascript
title: {
  fr: "Titre français",
  en: "English title"
}
```

## Portrait

Le portrait actif est configuré sous ce nom exact :

```text
assets/images/profile/portrait-koessivi-jean-honou.png
```

Le monogramme reste affiché uniquement si ce PNG ne peut pas être chargé. Pour remplacer le portrait, conservez ce chemin ou mettez à jour `profile.portraitCandidates` dans `assets/js/site-data.js` après avoir vérifié le nouveau fichier.

## CV

Le CV actif se trouve sous `assets/documents/cv/cv-koessivi-jean-honou.pdf` et `documents.cv.available` vaut `true` dans `assets/js/site-data.js`.

Pour le remplacer, conservez ce chemin. Les appels à l’action du Hero, du Contact et du pied de page restent visibles mais désactivés, sans lien cassé, si cette valeur repasse à `false`.

## Ajouter le mémoire et la soutenance

Fichiers actifs :

```text
assets/documents/thesis/memoire-koessivi-jean-honou.pdf
assets/documents/presentations/soutenance-koessivi-jean-honou.pptx
```

Leurs drapeaux sont actifs dans `assets/js/site-data.js` :

- mémoire PDF : `documents.thesis.available: true` ;
- soutenance PPTX : `documents.thesisPresentation.available: true`.

La variante PDF facultative `assets/documents/presentations/soutenance-koessivi-jean-honou.pdf` n’existe pas encore et `documents.thesisPresentationPdf.available` reste donc à `false`.

- Le PDF du mémoire est ouvert dans le navigateur ou téléchargé.
- Une présentation `.pptx` est uniquement téléchargée.
- Si une version PDF de la soutenance existe, elle est utilisée pour la consultation dans le navigateur.

## Ajouter une présentation

1. Placez les fichiers dans `assets/documents/presentations/`.
2. Ajoutez un objet au tableau `presentations` de `assets/js/site-data.js` avec titre bilingue, année, catégorie, description et objets `pdf`/`pptx`.
3. Marquez uniquement les fichiers réellement présents comme `available: true`.

Ce tableau est réservé à la gestion future des documents : il n’est pas rendu comme section autonome sur la page d’accueil.

## Ajouter les rapports de projets

Les chemins préparés sont :

```text
assets/documents/reports/poisson-processes-report.pdf
```

Après avoir ajouté le vrai PDF, recherchez son entrée dans `projectDetails.<slug>.documents` dans `assets/js/site-data.js`, puis passez uniquement son champ `available` de `false` à `true`. Ne changez jamais cette valeur avant que le fichier existe réellement.

## Ajouter un nouveau projet

L’ajout d’un projet utilise les données et le moteur communs : il ne nécessite ni nouveau JavaScript, ni nouveau filtre codé en dur, ni nouvelle mise en page CSS si vous réutilisez un thème existant.

1. Dans `assets/js/site-data.js`, dupliquez une entrée du tableau `projects`.
2. Donnez-lui un `slug` unique, par exemple `analyse-series-temporelles`, puis renseignez le numéro, l’année, le statut et les textes `fr` / `en`.
3. Choisissez ses `categories` parmi les identifiants présents dans `filters`. Pour une nouvelle catégorie, ajoutez simplement son libellé bilingue à ce tableau.
4. Choisissez un thème existant : `biometrics`, `poisson`, `scientific` ou `default`. Le thème `default` fournit une illustration abstraite neutre.
5. Ajoutez les technologies principales dans `technologies`. Les icônes connues sont trouvées automatiquement ; les autres restent des badges texte.
6. Placez une éventuelle image de couverture dans `assets/images/projects/future-projects/`, puis configurez-la sans inventer de résultat :

```javascript
coverImage: {
  src: "assets/images/projects/future-projects/analyse-series-temporelles-cover.webp",
  alt: {
    fr: "Description factuelle de l’image",
    en: "Factual image description"
  },
  available: true
},
media: []
```

Si `coverImage` vaut `null`, si `available` vaut `false` ou si l’image échoue au chargement, l’illustration abstraite du thème reste affichée.

Pour ajouter des captures secondaires, des graphiques ou un schéma d’architecture, utilisez le tableau `media` avec le même format. Chaque légende doit décrire un élément réel, sans inventer de résultat :

```javascript
media: [
  {
    src: "assets/images/projects/future-projects/analyse-series-temporelles-chart.webp",
    alt: {
      fr: "Graphique descriptif validé du projet",
      en: "Verified descriptive chart from the project"
    },
    caption: {
      fr: "Légende factuelle facultative",
      en: "Optional factual caption"
    },
    available: true
  }
]
```

7. Ajoutez sous `projectDetails` une clé exactement identique au `slug`. Renseignez `lead`, `technologies`, `sections` et `documents`.
8. Pour un dépôt GitHub ou un PDF, préparez la ressource avec `available: false`, puis remplacez le marqueur et passez à `true` uniquement quand la vraie ressource existe :

```javascript
documents: [
  {
    type: "repository",
    label: { fr: "Voir le dépôt", en: "View repository" },
    href: "YOUR_REAL_GITHUB_REPOSITORY_URL",
    available: false
  },
  {
    type: "pdf",
    label: { fr: "Consulter le rapport", en: "View report" },
    href: "assets/documents/reports/analyse-series-temporelles-report.pdf",
    available: false
  }
]
```

9. Dupliquez `projects/_project-template.html`, renommez la copie avec le slug, remplacez `data-project`, les métadonnées de secours et retirez la balise `noindex` quand la page est prête.
10. Reportez le chemin de cette page dans `projects[].href`, ajoutez son URL à `sitemap.xml` quand elle est publiée, puis vérifiez FR, EN, les filtres, les images, les ressources et l’affichage mobile.

Les statuts disponibles sont `completed`, `progress` et `upcoming`. N’ajoutez aucun résultat chiffré avant validation.
Une ressource de page détaillée n’est rendue comme lien que si elle possède un `href` réel et `available: true`.

## Ajouter une expérience ou une formation

Ajoutez une entrée dans `experience` ou `education` dans `assets/js/site-data.js`. Gardez la version publique concise : rôle/diplôme, structure, période et une courte description. Les détails exhaustifs appartiennent au CV.

Le tableau `certifications` est prêt pour de futures certifications vérifiées.

## Modifier les coordonnées

Les coordonnées et les URL vérifiées de LinkedIn et GitHub se trouvent dans `SITE_DATA.contact` dans `assets/js/site-data.js`. Le téléphone n’est rendu que dans la section Contact. Les liens sociaux alimentent automatiquement la section Contact, le pied de page et les métadonnées structurées.

## Icônes locales

Les correspondances entre technologies et fichiers SVG sont centralisées dans `SITE_DATA.icons`. Les technologies sans identité visuelle canonique restent volontairement affichées comme texte. Les sources, versions et licences des fichiers locaux sont consignées dans `assets/icons/NOTICE.md`.

## Modifier le thème

Les propriétés CSS au début de `assets/css/style.css` contrôlent l’ensemble du thème :

- `--navy`, `--teal`, `--paper` et `--tint` pour les couleurs ;
- `--line` et `--shadow` pour les séparations et ombres ;
- `--radius` pour les arrondis ;
- `--max` pour la largeur maximale ;
- `--serif` et `--sans` pour les deux familles typographiques.

Les identités visuelles des projets sont déclarées dans `SITE_DATA.projectThemes`, puis appliquées avec l’attribut `data-project-theme`. Un nouveau projet peut réutiliser `biometrics`, `poisson`, `scientific` ou `default` sans modifier le CSS. La création d’une toute nouvelle palette demande seulement une nouvelle clé de thème et le bloc de variables CSS correspondant.

## Configurer l’espace élèves avec Supabase

L’interface publique et les trois pages de `teaching/` fonctionnent dès maintenant, mais la connexion, les données et les dépôts restent volontairement inactifs tant qu’un vrai projet Supabase n’est pas configuré. L’état non configuré ne contient aucun faux compte et n’expose aucune donnée élève.

Ordre de mise en service :

1. Créez un projet Supabase destiné à cet espace privé.
2. Relisez puis appliquez `supabase/migrations/202608140001_student_portal.sql`. Cette migration crée les tables, les rôles, les contraintes, les politiques RLS et les deux buckets privés.
3. Créez les comptes individuels dans Supabase Auth. Ne partagez pas un mot de passe commun entre plusieurs élèves.
4. Promouvez uniquement le compte enseignant depuis un contexte administrateur de confiance, puis rattachez chaque élève à cet enseignant. Les commandes d’exemple commentées se trouvent dans `supabase/seed.example.sql`.
5. Dans `assets/js/supabase-config.js`, collez uniquement l’URL réelle du projet et sa clé **publishable** publique. N’ajoutez jamais de clé secrète, `service_role`, mot de passe de base de données ou secret JWT au code du navigateur.
6. Configurez dans Supabase les URL autorisées du site publié, les règles de mot de passe, la confirmation des e-mails et les limites d’authentification adaptées.
7. Testez avec au moins deux enseignants et deux élèves distincts : un élève ne doit jamais lire les lignes ou fichiers d’un autre élève, même en appelant directement l’API.
8. Publiez le portail uniquement en HTTPS et vérifiez les politiques avec le Security Advisor de Supabase avant d’y déposer des données réelles.

Le guide complet, les chemins Storage, le contrat JavaScript, les exemples de création d’affectations et la liste des tests RLS sont détaillés dans `docs/student-portal-setup.md`.

Les fichiers principaux sont :

- `teaching/index.html` : présentation publique du portail ;
- `teaching/login.html` : connexion Supabase Auth ;
- `teaching/dashboard.html` : tableau de bord élève, vide tant que la session n’est pas autorisée ;
- `assets/js/teaching-portal.js` : interface bilingue, validation et états d’accès ;
- `assets/js/supabase-client.js` : couche d’intégration authentifiée ;
- `assets/js/supabase-config.js` : deux valeurs publiques à renseigner ;
- `supabase/migrations/202608140001_student_portal.sql` : schéma, RLS et politiques Storage ;
- `supabase/tests/adapter-contract.cjs` : test du contrat, du mode non configuré et des principales barrières du client.

Lorsque Node.js est installé, lancez le test d’adaptateur depuis la racine avec `node supabase/tests/adapter-contract.cjs`. Ce test ne remplace pas les essais RLS avec plusieurs comptes authentifiés sur le vrai projet Supabase.

## Domaine et SEO

Le site est publié sur GitHub Pages à l’adresse `https://honou-jean.github.io/`. Les balises `og:url`, `canonical`, `robots.txt` et `sitemap.xml` pointent vers ce domaine.

## Architecture

```text
portfolio-jean/
├── index.html
├── 404.html
├── favicon.svg
├── robots.txt
├── sitemap.xml
├── teaching/
│   ├── index.html
│   ├── login.html
│   └── dashboard.html
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   └── teaching.css
│   ├── js/
│   │   ├── main.js
│   │   ├── project-detail.js
│   │   ├── site-data.js
│   │   ├── i18n.js
│   │   ├── teaching-portal.js
│   │   ├── supabase-client.js
│   │   └── supabase-config.js
│   ├── icons/{technologies,socials}/
│   ├── images/
│   │   ├── profile/
│   │   └── projects/{biometrics,poisson,future-projects}/
│   └── documents/{cv,thesis,reports,presentations}/
├── projects/
│   ├── _project-template.html
│   ├── multimodal-biometrics.html
│   └── poisson-processes.html
├── supabase/
│   ├── migrations/202608140001_student_portal.sql
│   ├── seed.example.sql
│   └── tests/adapter-contract.cjs
└── docs/student-portal-setup.md
```

## Déploiement

Le site est hébergé sur GitHub Pages, servi depuis la branche `master` du dépôt `honou-jean/honou-jean.github.io`. Toute modification poussée sur `master` est republiée automatiquement par GitHub (en général en 1 à 2 minutes).
