const MAX_LENGTH = 100;

function getParam(nom) {
  return new URLSearchParams(window.location.search).get(nom);
}

async function chargerAteliers() {
  const res = await fetch("./ateliers.json");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function plagesAge(ages) {
  const text = String(ages || "");
  const range = text.match(/(\d+)\s*[–—-]\s*(\d+)/);
  if (range) return { min: Number(range[1]), max: Number(range[2]) };
  const single = text.match(/\d+/);
  if (single) return { min: Number(single[0]), max: Number(single[0]) };
  return { min: 1, max: 120 };
}

function erreurPage(message) {
  const app = document.getElementById("app");
  app.innerHTML =
    `<section class="page">
      <div class="card error-card" tabindex="0">${message}</div>
      <a class="btn" href="index.html">Voir la liste des ateliers</a>
    </section>`;
  // Le contenu de <main> est remplacé : on y place le focus pour que les
  // utilisateurs clavier et lecteurs d'écran ne se retrouvent pas sur <body>.
  // tabindex="0" (et non -1) : le message n'a aucun enfant focusable, il doit
  // rester atteignable au Tab même après qu'on en soit sorti.
  app.querySelector(".error-card").focus();
}

function erreurChargement(err) {
  erreurPage(
    `Impossible de charger les ateliers (${err.message}). ` +
    `Servez le site via un serveur local : <code>python3 -m http.server 8000</code>.`
  );
}

function closeNav() {
  const nav = document.getElementById("nav");
  const toggle = document.querySelector(".menu-toggle");
  if (nav) nav.classList.remove("open");
  if (toggle) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Ouvrir le menu");
  }
}

function initMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    if (open) {
      const first = nav.querySelector("a, button");
      if (first) first.focus();
    }
  });

  nav.addEventListener("focusout", (e) => {
    if (nav.classList.contains("open") && !nav.contains(e.relatedTarget) && e.relatedTarget !== toggle) {
      closeNav();
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".topbar")) closeNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      closeNav();
      toggle.focus();
    }
  });
}
