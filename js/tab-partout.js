/**
 * Tab partout — rend chaque élément du contenu atteignable au clavier (Tab).
 *
 * Demande explicite : les titres (h1, h2, …), les paragraphes, les div, les
 * spans, etc. doivent pouvoir être "sélectionnés" avec la touche Tab.
 *
 * AVERTISSEMENT (voir audit-complet.md, R8) : c'est un écart volontaire aux
 * bonnes pratiques d'accessibilité (WCAG 2.4.3 — l'ordre de focus doit rester
 * court et prévisible). Chaque élément devient un arrêt de tabulation : la
 * séquence passe d'une vingtaine à plusieurs dizaines de stops par page.
 *
 * Pour revenir à l'ordre de tabulation natif, il suffit de :
 *   1. passer TOUT_FOCUSABLE à false ci-dessous, ou
 *   2. supprimer la balise <script src="js/tab-partout.js"> des pages.
 */

const TOUT_FOCUSABLE = true;

// Nativement atteignables au clavier (ou déjà gérés) : on n'y touche pas.
// [tabindex] couvre les tabindex="-1" posés volontairement (#app, #success-card).
const DEJA_FOCUSABLES =
  "a[href], button, input, select, textarea, summary, audio[controls], video[controls], iframe, [tabindex]";

// Le "chrome" du site reste hors tabulation, sinon l'ordre demandé
// (1. titre → 2. nav → 3. lien d'évitement) deviendrait 3 → 6 → 7 puisque
// les conteneurs (wrapper, topbar, bloc de nav) passeraient entre les deux.
// Passe CHROME_FOCUSABLE à true pour les rendre focusables aussi.
const CHROME_FOCUSABLE = false;
const HORS_TABULATION = ".phone, .topbar, .topbar-right, nav";

function rendreFocusable(el) {
  if (el.nodeType !== Node.ELEMENT_NODE) return;
  if (el === document.body || el === document.documentElement) return;
  if (el.matches(DEJA_FOCUSABLES)) return;
  if (!CHROME_FOCUSABLE && el.matches(HORS_TABULATION)) return;
  el.setAttribute("tabindex", "0");
}

function traiter(noeud) {
  if (!TOUT_FOCUSABLE || !noeud) return;
  rendreFocusable(noeud);
  if (noeud.querySelectorAll) noeud.querySelectorAll("*").forEach(rendreFocusable);
}

// État initial : <body> et <html> ne sont pas des contenus, ils restent hors
// de la séquence de tabulation.
traiter(document.body);

// Contenu injecté après coup : liste des cartes, fiche atelier, messages
// d'erreur, confirmation de réservation…
if ("MutationObserver" in window) {
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(traiter);
    }
  }).observe(document.body, { childList: true, subtree: true });
}
