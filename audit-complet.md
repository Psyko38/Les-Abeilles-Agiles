# Audit complet — Les Abeilles Agiles

**Date** : 2026-10-02
**Périmètre** : `index.html`, `atelier.html`, `reservation.html`, `styles.css`, `js/commun.js`, `js/liste.js`, `js/atelier.js`, `js/reservation.js`, `ateliers.json`, `README.md`, `favicon.svg`.
**Référentiels** : WCAG 2.2 (A + AA), bonnes pratiques code / performance / sécurité / SEO / ergonomie.
**Méthode** : revue de code statique, calcul des ratios de contraste (formule WCAG), vérification de l'ordre de focus élément par élément, test de servi sur `python3 -m http.server` (toutes les ressources répondent 200). Pas de test utilisateur, pas d'outil automatisé (axe/Lighthouse) ni de lecteur d'écran : à prévoir en complément.

---

## 0. Point de départ : les « tabulations »

Aucune tabulation (caractère `\t`) n'existe dans le projet : indentation en **2 espaces homogène**, aucun mélange tab/espace, aucune espace insécable (U+00A0), aucun CRLF, aucune espace en fin de ligne. La demande a donc été interprétée comme **« l'ordre de tabulation » (navigation clavier Tab / Shift+Tab)**, corrigé en section 1.

---

## 1. Ordre de tabulation — 3 défauts corrigés + arbitrage d'ordre

### 1.1 Menu déroulant : le bouton venait *après* le menu qu'il ouvre (corrigé)

**Constat** — Dans les 3 pages, le DOM était `… <nav> puis <button class="menu-toggle">`, alors que visuellement le bouton « Menu » est **au-dessus** du déroulant (`top: 100%`, ancré sur le `topbar`). Sur mobile, avec le menu ouvert :

| | Ordre du focus |
|---|---|
| **Avant** | … → « Menu » (activation → focus déplacé sur le 1ᵉʳ lien) → lien du menu → **retour sur « Menu »** → contenu *(le focus remonte vers le haut pour redescendre)* |
| **Après** | … → « Menu » → lien(s) du menu → contenu |

**Correction** : `<button class="menu-toggle">` déplacé **avant** `<nav>` dans `index.html`, `atelier.html` et `reservation.html`. Aucun impact visuel (le `nav` est en `position: absolute` sur mobile et le bouton est masqué en `display: none` ≥ 768 px). Critère **WCAG 2.4.3 (A) — Ordre de focus**.

### 1.2 Impossible de valider la réservation avec la touche Entrée (corrigé)

**Constat** : `#btn-confirm` était un `type="button"` **extérieur** au `<form>`, et le formulaire ne contient aucun bouton de soumission. Or, l'envoi implicite (touche Entrée) n'a lieu que s'il existe un bouton de soumission appartenant au formulaire : avec 4 champs et aucun bouton, **Entrée ne faisait rien**. Un utilisateur clavier devait obligatoirement aller chercher le bouton.

**Correction** :
- `reservation.html` : `type="submit" form="reservation-form"` sur `#btn-confirm` ;
- `js/reservation.js` : écoute `form` → `submit` avec `e.preventDefault()` (plus d'écoute `click`), la validation et la confirmation sont donc déclenchées **Entrée ou clic**. Critères **2.1.1 (A)** et **3.2.2 (A)**.

### 1.3 Focus perdu après remplacement du contenu en cas d'erreur (corrigé)

**Constat** : `erreurPage()` remplace tout le contenu de `<main>` sans déplacer le focus → l'utilisateur clavier se retrouve sur `<body>` (en haut de page, rien de visible qui explique l'échec).

**Correction** : `js/commun.js` — la carte d'erreur reçoit `tabindex="-1"` et le focus lui est posé (`app.querySelector(".error-card").focus()`), l'announcement suit automatiquement. Critère **2.4.3 (A)** + **4.1.3 (AA)**.

### 1.4 Le lien d'évitement placé en 3ᵉ position (demande explicite)

**Demande** : 1. le titre « Les Abeilles Agiles », 2. la nav « Nos ateliers », 3. le lien d'évitement, puis le reste.

**Correction** : `<a class="skip-link">` déplacé dans le DOM **après `</header>`** (avant `<main>`) dans les 3 pages. Comme il est en `position: fixed` (`top: -70px`, remonté à `top: 12px` au focus), **sa position à l'écran ne change pas** ; seul son rang dans l'ordre de tabulation bouge.

**Effet** :
- **Desktop (≥ 768 px)** : `1. Les Abeilles Agiles → 2. Nos ateliers → 3. Aller au contenu principal → 4+.` — exactement la séquence demandée.
- **Mobile (menu replié)** : `1. Les Abeilles Agiles → 2. Menu → 3. Aller au contenu principal → 4+` — la nav est en `display: none` tant que le menu n'est pas ouvert : elle ne *peut* pas être focalisable en position 2. Menu ouvert : `… → Menu → Nos ateliers → Aller au contenu principal → …` (le lien d'évitement reste donc en 3ᵉ rang une fois le menu déplié).

**Arbitrage à connaître** (non bloquant, WCAG non violation) : le lien d'évitement sert justement à *sauter* la navigation ; le placer après le titre et la nav oblige à tabuler ces deux éléments avant de pouvoir sauter le contenu. Sur ce site l'en-tête ne compte que 2 focusables, le coût est donc minime — mais si l'en-tête grandit (plusieurs liens de nav), remettre le lien d'évitement en 1ʳᵉ position sera plus rentable. Voir aussi R7 ci-dessous.

### 1.5 Ordre de tabulation vérifié après corrections

| Page | Ordre du focus (desktop ≥ 768 px) | Ordre du focus (mobile, menu replié) |
|---|---|---|
| `index.html` | « Les Abeilles Agiles » → « Nos ateliers » → **lien d'évitement** → 6 cartes d'ateliers | « Les Abeilles Agiles » → « Menu » → **lien d'évitement** → cartes *(ouvert : … → « Menu » → « Nos ateliers » → lien d'évitement → cartes)* |
| `atelier.html` | « Retour » → « Nos ateliers » → **lien d'évitement** → *(3 cartes non focalisables)* → radios « Séance » → « Réserver cette séance » | « Retour » → « Menu » → **lien d'évitement** → radios → bouton |
| `reservation.html` | « Retour » → « Nos ateliers » → **lien d'évitement** → Prénom → Nom → Âge → E-mail → « Confirmer la réservation » | « Retour » → « Menu » → **lien d'évitement** → Prénom → Nom → Âge → E-mail → « Confirmer la réservation » |
| Après confirmation | Focus posé sur la carte `#success-card` (`role="status"`, `tabindex="-1"`), remontée en haut de page | idem |

- « Menu » est `display: none` ≥ 768 px → non focalisable, d'où le décalage entre les deux colonnes.
- Aucun `tabindex` positif, aucun piège à focus, aucun élément masqué restant focalisable (`display: none` sur `nav` fermé, `hidden` sur la carte de succès et sur `.reserv-main`/`.reserv-aside`).
- Ordre visuel = ordre du DOM partout (le déroulant mobile et le lien d'évitement fixe sont les deux seules discordances, traités au §1.1 et §1.4).

---

## 2. Accessibilité (WCAG 2.2 A/AA)

### 2.1 Constats corrigés

| # | Constat | Critère | Correction | Résultat |
|---|---|---|---|---|
| 1 | `.hint` en `#8a8a8a` : **2,45:1** sur la carte grise | 1.4.3 AA (4,5:1) | `--muted` → `#575757` | **5,12:1** sur `#d9d9d9`, **7,23:1** sur blanc |
| 2 | Bordure des champs `#c8c8c8` : **1,19:1** / **1,52:1** | 1.4.11 AA (3:1) | → `#767676` | **3,22:1** vs carte, **4,13:1** vs fond de champ |
| 3 | Radios `#bdbdbd` : **1,33:1** (état non coché invisible) | 1.4.11 AA (3:1) | → `#767676` | **3,22:1** vs carte, **3,95:1** vs `#efefef` |
| 4 | Lien de marque : texte visible « Logo », `aria-label` différent (« Logo » non informatif) | 2.5.3 A | Texte visible = « Les Abeilles Agiles », `aria-label` supprimé | Nom accessible = texte visible et informatif |
| 5 | Aucun `<h1>` sur `atelier.html` / `reservation.html` ; titre d'atelier en `<span>` | 1.3.1 A / 2.4.6 AA | `<h1 class="title">` pour le nom d'atelier (`js/atelier.js`), `<h1 class="reserv-h1">Réservation</h1>` dans la page réservation | 1 `<h1>` par page, navigation par titres possible |
| 6 | Erreurs de chargement annoncées nulle part, focus perdu | 4.1.3 AA / 2.4.3 A | Focus posé sur la carte d'erreur (§1.3) | Focus + annonce |
| 7 | Pas de `prefers-reduced-motion` | 2.3.3 (AAA, bonnes pratiques) | Bloc `@media (prefers-reduced-motion: reduce)` (transitions `.skip-link`, `.btn`, `.card-btn`) | Mouvement réduit respecté |

### 2.2 Points restants (non bloquants, à arbitrer)

| # | Constat | Impact | Proposition |
|---|---|---|---|
| R1 | Fond des boutons `.btn` / `.card-btn` `#d9d9d9` sur blanc : **1,41:1** | Limite 1.4.11 : le composant est repéré par son texte et son padding, pas par son contour | Ajouter `1px solid #767676` (décision de design, non appliqué) |
| R2 | Contour du menu déroulant `#e5e5e5` sur blanc : **1,26:1** | Faible : le panneau est identifiable par son ombre et son espacement | Passer à `#c8c8c8` ou `#767676` si besoin |
| R3 | `role="radiogroup"` sur `.sessions` alors que le groupement natif `name="seance"` suffit | Redondance inoffensive | Retirer le `role` ou passer par `<fieldset>/<legend>` |
| R4 | Deux intitulés « Réservation » visibles sur mobile (topbar `.reserv-title` + `<h1>`) | Gênant sans être une violation | Supprimer le `span.reserv-title` de la topbar |
| R5 | Sans JavaScript, la page reste vide (aucun `<noscript>`) | 1.3.1 / ergonomie | Message `<noscript>` |
| R6 | Aucun test automatisé (axe-core) ni test lecteur d'écran | Couverture | Ajouter axe + test NVDA/VoiceOver |
| R7 | Lien d'évitement en **3ᵉ** position (demande du client, §1.4) au lieu de la 1ʳᵉ | Faible : 2 focusables seulement dans l'en-tête, mais on saute la nav *après* l'avoir tabulée | Remettre le lien d'évitement avant le `</header>` si l'en-tête gagne des liens |

### 2.3 Points conformes (à conserver)

- Lien d'évitement `.skip-link` visible au focus, cible `#app` avec `tabindex="-1"` ✅
- `lang="fr"` sur les 3 pages ✅
- `<label for>` explicites, `autocomplete` sur les 4 champs, `aria-describedby` (indices + erreurs) ✅
- Validation : `aria-invalid`, `role="alert"` sur les messages (déjà dans le DOM → annoncés à l'apparition), focus sur le premier champ en erreur ✅
- Menu : `aria-expanded` / `aria-controls`, focus au 1ᵉʳ lien à l'ouverture, fermeture par Échap **avec retour du focus sur le bouton**, fermeture au `focusout` ✅
- Confirmation : `role="status"`, `tabindex="-1"` + focus + `scrollTo(0,0)` ✅
- Indicateurs de focus : `:focus-visible` avec outline 3 px sur liens, boutons, champs et `[tabindex]` ; `.card input:focus` neutralise l'outline au clic mais `.card input:focus-visible` le restaure (règle postérieure, même spécificité) ✅
- Zoom/refluidification : pas de largeur fixe bloquante, `viewport` correct, `env(safe-area-inset-*)`, media queries jusqu'à 360 px ✅
- Cibles tactiles : radios de 20 px incluses dans un `<label>` cliquable (exception WCAG 2.5.8), liens d'en-tête ≈ 28 px ✅
- Contraste du texte principal **13,38:1** et des messages d'erreur **5,19:1** (carte) / **7,33:1** (blanc) ✅

---

## 3. Code et maintenabilité

### 3.1 Points forts
- Vanilla JS sans dépendance, scripts en `defer` (non bloquants), code partagé (`commun.js`) bien découpé en fonctions pures testables (`getParam`, `plagesAge`, `validateForm`, `setError`).
- `const`/`let`, `async/await`, `URLSearchParams`, `encodeURIComponent` sur les identifiants interpolés dans les URL.
- CSS unique, variables CSS, `box-sizing` global, `[hidden] { display: none !important }` cohérent avec les `display: grid/flex` en media query.
- HTML bien imbriqué (vérifié : aucune balise non fermée, aucun `id` dupliqué).

### 3.2 Constats

| # | Constat | Sévérité | Recommandation |
|---|---|---|---|
| C1 | `innerHTML` interpolé avec les données de `ateliers.json` (`js/liste.js`, `js/atelier.js`) | Moyenne | Schéma XSS stocké si le JSON devient modifiable/externe : typer/échapper les champs (`textContent`, ou assainissement) |
| C2 | `erreurPage()` injecte `err.message` en HTML | Faible | Message issu du navigateur/locale, risque quasi nul ; utiliser `textContent` pour être propre |
| C3 | En-tête dupliqué (3×) + `initMenu()` rappelé en fin de chaque script | Faible | Générer via un composant commun ou une fonction d'initialisation unique |
| C4 | Aucun `.editorconfig` / Prettier / linter (d'où la question des tabulations) | Faible | Ajouter `.editorconfig` (`indent_style = space`, `indent_size = 2`) pour verrouiller la convention |
| C5 | `#app` déclaré 2 fois dans `styles.css` (flex/padding + `scroll-margin-top`) | Très faible | Fusionner les deux blocs |
| C6 | Aucun test unitaire ni CI | Moyenne | Tester `plagesAge` / `validateForm` (purs) en priorité |
| C7 | `js/atelier.js` : `seances[0]` jamais validé si `seances` est vide (`reservation.js` fait pareil) | Faible | Garde-fou (`seances?.[0]`) |

---

## 4. Performance

| Ressource | Brut | Gzip |
|---|---|---|
| `styles.css` | 8,6 Ko | **2,2 Ko** |
| JS total (`commun` + `liste`/`atelier`/`reservation`) | 6,5 Ko | **2,7 Ko** |
| `ateliers.json` | 4,0 Ko | 1,2 Ko |
| HTML (par page) | 1,5 – 3,3 Ko | 0,7 – 1,2 Ko |

- **Tout le JS/CSS d'une page ≈ 6 Ko gzip** : excellente empreinte.
- Aucune police tierce, aucune librairie, aucune image dans les pages HTML → pas de requête bloquante ; LCP = texte du `.hero` (immédiat).
- `defer` sur les 4 scripts, une seule requête JSON partagée et mis en cache par le navigateur.
- **Corrigé** : `/favicon.ico` renvoyait **404** à chaque chargement → `favicon.svg` (+ `<link rel="icon">` sur les 3 pages).
- Restant : `README.md` référence `asset/p1.png`, `p2.png`, `p3.png` **inexistants** (3 × 404 sur GitHub) — screenshots à ajouter ou liens à retirer.
- À surveiller si le catalogue grandit : injeter le JSON à la construction ou le mettre en cache (`Cache-Control`) plutôt que de le re-fetcher à chaque visite.

---

## 5. Sécurité et vie privée

| # | Point | Évaluation |
|---|---|---|
| S1 | Pas de back-end, pas d'envoi réseau du formulaire : prénom/nom/âge/e-mail ne quittent jamais le navigateur | ✅ Pas de fuite de données personnelles (mais la réservation n'est donc **pas persistée** — voir §7) |
| S2 | XSS potentiel via `innerHTML` + JSON (C1) | ⚠️ À durcir si les données deviennent éditables |
| S3 | Pas de `Content-Security-Policy` | ⚠️ Ajouter `Content-Security-Policy: default-src 'self'; img-src 'self' data:` à la livraison (hébergeur ou `<meta http-equiv>`) |
| S4 | Pas de `X-Content-Type-Options` / `Referrer-Policy` | ℹ️ Headers serveur, à configurer à la livraison |
| S5 | `method="get"` sur le formulaire atelier : `id` et `seance` dans l'URL | ✅ Aucune donnée sensible (pas de `token`, pas d'e-mail dans l'URL) |
| S6 | Aucune dépendance tierce → pas de risque de supply chain, pas de SRI nécessaire | ✅ |

---

## 6. SEO

| Point | État |
|---|---|
| `<title>` unique et descriptif par page (dynamique sur fiche/réservation) | ✅ |
| `<meta name="description">` | ✅ **ajouté** sur les 3 pages (absent) |
| Un seul `<h1>` par page, hiérarchie `h1 → h2` | ✅ **corrigé** (§2.1 n°5) |
| `lang="fr"` | ✅ |
| Favicon | ✅ **ajouté** (404 auparavant) |
| Open Graph / Twitter Card (`og:title`, `og:image`, `og:description`) | ❌ à ajouter pour le partage social |
| `<link rel="canonical">`, `robots.txt`, `sitemap.xml` | ❌ absents (site de 3 pages : priorité basse) |
| Balises structurées (`schema.org` : `Event` / `Course` pour les ateliers) | ❌ opportunité |
| Contenu rendu en JavaScript uniquement (liste de cartes) | ⚠️ Le contenu indexable dépend du JS : le JSON est bien récupérable, mais un rendu serveur ou un `<noscript>` serait plus sûr |

---

## 7. Ergonomie, contenu et critères d'acceptation

### 7.1 Critères d'acceptation du README

| Critère | État | Commentaire |
|---|---|---|
| Voir l'adresse exacte du rendez-vous | ✅ | Carte « Lieu » sur la fiche atelier (`12 Rue de Paris`) |
| Voir la date et l'heure | ✅ | Libellés de séance sur la fiche, la réservation et la confirmation |
| Voir le **nombre de places restantes** | ❌ | `places` affiche la **capacité totale** ; aucun état de stock, aucune décroissance après réservation. **Fonctionnalité à implémenter** (champ `placesRestantes` + décrément côté serveur) |

### 7.2 Autres constats UX / contenu

| # | Constat | Proposition |
|---|---|---|
| U1 | `ateliers.json` : deux ateliers nommés « Atelier dessin » et la description « Description long » (texte témoin) | Distinguer (« Dessin — cours découverte » / « Dessin — parcours ») et rédiger |
| U2 | Aucun état de chargement pendant le `fetch` (liste vide puis apparition) | Skeleton ou message « Chargement… » |
| U3 | `reservation.html` atteignable sans `id`/`seance` → bascule silencieusement sur le 1ᵉʳ atelier | Rediriger vers la liste ou afficher un choix |
| U4 | Aucun lien retour discret depuis la liste vers la fiche précédente, pas de fil d'Ariane | Breadcrumb si le catalogue grandit |
| U5 | Les horaires sont codés en dur en juin (« Mer. 12 juin ») dans le JSON | Passer à des dates ISO et formatter côté JS |
| U6 | Pas de mention légale / politique de confidentialité (formulaire collectant des données, même en local) | Obligatoire en production (RGPD) |

---

## 8. Corrections appliquées (récapitulatif)

| Fichier | Modification |
|---|---|
| `index.html` | Bouton `Menu` déplacé avant `<nav>` ; lien de marque « Les Abeilles Agiles » (texte visible = nom accessible) ; `<a class="skip-link">` déplacé après `</header>` (rang 3) ; `<meta name="description">` ; `<link rel="icon">` |
| `atelier.html` | Bouton `Menu` avant `<nav>` ; `<a class="skip-link">` après `</header>` (rang 3) ; `<meta name="description">` ; `<link rel="icon">` |
| `reservation.html` | Bouton `Menu` avant `<nav>` ; `<a class="skip-link">` après `</header>` (rang 3) ; `<h1 class="reserv-h1">` ajouté ; `#btn-confirm` → `type="submit" form="reservation-form"` ; `<meta name="description">` ; `<link rel="icon">` |
| `styles.css` | `--muted` `#8a8a8a` → `#575757` ; bordures de champs `#c8c8c8` → `#767676` ; bordures de radios `#bdbdbd` → `#767676` ; règles `.details h1` et `.reserv-h1` (+ déclinaison 360 px) ; `@media (prefers-reduced-motion: reduce)` |
| `js/atelier.js` | Titre d'atelier `<span class="title">` → `<h1 class="title">` |
| `js/commun.js` | `erreurPage()` : `tabindex="-1"` + focus sur la carte d'erreur |
| `js/reservation.js` | Soumission par `submit` (Entrée **et** clic) au lieu d'un `click` sur le bouton |
| `favicon.svg` | Nouveau : icône SVG (supprime le 404 `/favicon.ico`) |
| `audit-complet.md` | Ce rapport |

Vérifications après corrections : `node --check` OK sur les 4 scripts, `ateliers.json` valide, HTML bien imbriqué (aucune balise orpheline, aucun `id` dupliqué), serveur local → 200 sur toutes les ressources.

---

## 9. Plan d'action restant (priorisé)

**Haute priorité**
1. Implémenter les **places restantes** (critère d'acceptation non couvert) — décision produit.
2. Durcir l'injection de données (C1) et ajouter un `<noscript>` (R5).
3. Test automatisé d'accessibilité (axe-core) + test lecteur d'écran (R6).

**Moyenne priorité**
4. Arbitrage visuel des boutons/contours (R1, R2) : ajouter un liseré `#767676`.
5. Open Graph + `canonical` (§6), mentions légales/RGPD (U6).
6. États de chargement et redirection sans paramètre (U2, U3).

**Basse priorité**
7. Nettoyage : `role="radiogroup"` (R3), `span.reserv-title` (R4), position du lien d'évitement (R7), double bloc `#app` (C5), `.editorconfig` (C4).
8. Captures manquantes du README (`asset/p1.png`, `p2.png`, `p3.png`), contenus de `ateliers.json` (U1, U5).
