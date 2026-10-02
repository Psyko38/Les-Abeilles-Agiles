# Audit d'accessibilité — Les Abeilles Agiles

Périmètre : [index.html](index.html), [atelier.html](atelier.html), [reservation.html](reservation.html), [styles.css](styles.css), [js/commun.js](js/commun.js), [js/liste.js](js/liste.js), [js/atelier.js](js/atelier.js), [js/reservation.js](js/reservation.js).
Référentiel : WCAG 2.2 (niveaux A et AA). Audit manuel du code (pas de test utilisateur).

## Résumé

Le socle est bon : lien d'évitement, `lang="fr"`, labels explicites, gestion du focus du menu, états d'erreur annoncés. Les principales lacunes sont **visuelles** (contrastes insuffisants sur le texte secondaire, les bordures de champs et les radios) et **structurels** (absence de `<h1>`, titre de l'atelier rendu en `span`).

## Constats bloquants / majeurs

### 1. Contraste du texte secondaire — WCAG 1.4.3 (AA)
`.hint` utilise `--muted: #8a8a8a` en 14 px :
- sur fond blanc : **3,45:1** (minimum requis : 4,5:1) ;
- sur la carte grise `#d9d9d9` : **2,45:1**.

Concerné : l'indice d'âge dans [reservation.html](reservation.html).

### 2. Bordure des champs de formulaire — WCAG 1.4.11 (AA, non-texte)
`.card input` : bordure `#c8c8c8` sur fond blanc → **1,67:1** (minimum : 3:1). Le champ est difficile à distinguer pour les personnes malvoyantes.

### 3. Radios personnalisées — WCAG 1.4.11 (AA, non-texte)
`.session-option input` : bordure `#bdbdbd` sur la carte `#d9d9d9` → **1,33:1**. L'état non-coché est à peine visible ; seul l'état coché (anneau noir) ressort.

### 4. Nom accessible du lien de marque — WCAG 2.5.3 (A)
[index.html](index.html) : le lien affiche le texte visible **« Logo »** mais son `aria-label` est « Les Abeilles Agiles, accueil ». Le nom accessible doit contenir le texte visible. De plus, « Logo » n'est pas un intitulé informatif.

### 5. Structure des titres — WCAG 1.3.1 / 2.4.6 (A/AA)
- Aucun `<h1>` sur [atelier.html](atelier.html) ni [reservation.html](reservation.html).
- Le titre de l'atelier est rendu en `<span class="title">` dans [js/atelier.js](js/atelier.js) : impossible de naviguer par titres jusqu'à l'information principale.

## Constats modérés

### 6. Messages d'état dynamiques — WCAG 4.1.3 (AA)
`erreurChargement()` / `erreurPage()` dans [js/commun.js](js/commun.js) remplacent le contenu de `<main>` sans déplacement de focus ni région live : un lecteur d'écran n'est pas informé de l'échec de chargement.

### 7. Contraste des boutons pleins — WCAG 1.4.11 (limite)
`.btn` / `.card-btn` en `#d9d9d9` sur cadre blanc → **1,41:1**. Le repérage du composant repose uniquement sur un fond très pâle ; un liseré ou un fond plus soutenu serait plus sûr.

### 8. Mouvement réduit — bonnes pratiques (2.3.3)
Aucune règle `prefers-reduced-motion` pour les transitions de `.skip-link`, `.btn`, `.card-btn` (mineur, transitions courtes de 0,15 s).

## Points conformes (à conserver)

- Lien d'évitement `.skip-link` visible au focus, cible `#app` avec `tabindex="-1"` ✅
- `lang="fr"` sur toutes les pages ✅
- `<label for>` explicites + `autocomplete` sur tous les champs ✅
- Validation : `aria-invalid`, `aria-describedby`, `role="alert"`, focus sur le premier champ en erreur ✅
- Menu : `aria-expanded`, `aria-controls`, focus sur le premier lien à l'ouverture, fermeture par Échap avec retour du focus ✅
- Confirmation : `role="status"`, `tabindex="-1"` + focus + remontée en haut de page ✅
- Indicateurs de focus visibles (`:focus-visible`, outline 3 px) ✅
- Zoom/refluidification : pas de largeur fixe bloquante, media queries jusqu'à 360 px ✅
- Cibles tactiles : radios de 20 px incluses dans un `<label>` cliquable (exception de taille) ✅

## Recommandations priorisées

1. Remonter `--muted` à un gris plus foncé (ex. `#5f5f5f` ≈ 4,6:1 sur blanc) ou passer `.hint` en `--text`.
2. Épaissir/assombrir les bordures de champs (`#767676` minimum) et des radios (3:1 minimum).
3. Remplacer le texte « Logo » par « Les Abeilles Agiles » (supprimer l'`aria-label` redondant) ou masquer le texte décoratif.
4. Ajouter un `<h1>` sur chaque page (titre de l'atelier en `<h1>`, « Séance choisie » en `<h2>`).
5. Annoncer les erreurs de chargement : focus sur le message ou `role="alert"` sur le bloc d'erreur.
