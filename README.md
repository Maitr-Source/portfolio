# Mara Voss — Video Editor / Post-Production

> Portfolio vidéo — Showreel, archive filtrable, fiche technique par projet.

### 🌐 Voir le site en ligne

**👉 https://maitr-source.github.io/portfolio/**

[![Voir le site](https://img.shields.io/badge/▶-Voir_le_site_en_ligne-e05a2b?style=for-the-badge)](https://maitr-source.github.io/portfolio/)

---

## ✨ Aperçu

Site one-page immersif pour monteuse vidéo / post-production :

- **01 — Featured** : showreel avec player YouTube / Vimeo / MP4, timecode live, specs techniques
- **02 — Archive** : grille + vue index, filtres par catégorie, compteurs automatiques
- **03 — About** : profil, services (Edit / Color / Sound / Motion)
- **04 — Contact** : email, réseaux, CV, fuseau horaire

Petits plus : curseur custom, shimmer d'étoiles, mode grid/index, modale projet avec hook / pacing / software, toasts, responsive mobile.

## 🛠️ Stack

- HTML5 / CSS3 / Vanilla JS — **zéro dépendance**
- Data-driven via `js/data.js` (`CONFIG` + `PROJECTS`)
- Hébergé sur **GitHub Pages**

## 📁 Structure

```
portfolio/
├── index.html          # structure + sections
├── css/style.css       # tout le design
├── js/
│   ├── data.js         # ← édite SEULEMENT ce fichier pour ton contenu
│   └── app.js          # moteur (ne pas toucher)
└── assets/
    ├── cv.pdf
    └── stills/         # still-01.jpg ... still-06.jpg + still-reel.jpg
```

## 🚀 Lancer en local

Double-clic sur `index.html`, ou serveur local :

```powershell
# PowerShell — depuis le dossier portfolio/
python -m http.server 8000
# puis http://localhost:8000
```

## ✏️ Personnaliser

Tout se passe dans `js/data.js` :

```js
const CONFIG = {
  name: "Mara Voss",
  role: "Video Editor / Post-Production",
  email: "hello@maravoss.studio",
  // ...
}

const PROJECTS = [
  {
    title: "Cards Combat",
    videoUrl: "https://youtu.be/-JloIxDOgcs",
    thumbnail: "assets/stills/still-01.jpg",
    // ...
  }
]
```

- `videoUrl` accepte : YouTube, Shorts, Vimeo, MP4 local, ou iframe (Bunny / Mux)
- `thumbnail` : `1600x900` idéal, fallback `.svg` automatique si le `.jpg` manque
- `letterbox: true` pour les formats verticaux 9:16 / carrés (pas de crop)

## 📦 Déploiement

Déployé automatiquement sur GitHub Pages depuis la branche `main` :

1. `git add .` + `git commit` + `git push`
2. `Settings > Pages > Deploy from a branch > main / (root)`
3. Live sur **https://maitr-source.github.io/portfolio/**

## 📬 Contact

- **Email :** hello@maravoss.studio
- **Localisation :** Lisbon, PT — UTC+01:00
- **Dispo :** Available — Q4 2026
- Vimeo / LinkedIn / YouTube — liens dans le site

---

© 2026 Mara Voss. Tous droits réservés.
