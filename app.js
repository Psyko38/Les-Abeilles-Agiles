let ateliers = [];

const state = {
  vue: "liste",
  atelierId: null,
  seanceId: null,
  reservation: null,
};

const topbar = document.getElementById("topbar");
const views = {
  liste: document.getElementById("view-list"),
  fiche: document.getElementById("view-detail"),
  reservation: document.getElementById("view-reservation"),
  confirmation: document.getElementById("view-success"),
};

function getAtelier() {
  return ateliers.find((a) => a.id === state.atelierId) || null;
}

function getSeance() {
  const atelier = getAtelier();
  if (!atelier) return null;
  return atelier.seances.find((s) => s.id === state.seanceId) || atelier.seances[0];
}

function plagesAge(ages) {
  const text = String(ages || "");
  const range = text.match(/(\d+)\s*[–—-]\s*(\d+)/);
  if (range) return { min: Number(range[1]), max: Number(range[2]) };
  const single = text.match(/\d+/);
  if (single) return { min: Number(single[0]), max: Number(single[0]) };
  return { min: 1, max: 120 };
}

function navHtml() {
  return `
    <nav class="nav" id="nav" aria-label="Navigation principale">
      <button type="button" data-action="back-list">Nos ateliers</button>
    </nav>
    <button type="button" class="menu-toggle" data-action="menu" aria-expanded="false" aria-controls="nav" aria-label="Ouvrir le menu">Menu</button>`;
}

function renderTopbar() {
  let left = "";
  let title = "";
  if (state.vue === "liste") {
    left = `<span class="brand" aria-label="Les Abeilles Agiles, accueil">Logo</span>`;
  } else if (state.vue === "fiche") {
    left = `<button type="button" data-action="back-list" aria-label="Retour à la liste des ateliers">Retour</button>`;
  } else if (state.vue === "reservation") {
    left = `<button type="button" data-action="back-detail" aria-label="Retour à la fiche atelier">Retour</button>`;
    title = `<span class="reserv-title">Réservation</span>`;
  } else {
    left = `<span class="brand" aria-label="Les Abeilles Agiles, réservation en cours">Réservation</span>`;
  }
  topbar.innerHTML = `${left}<div class="topbar-right">${title}${navHtml()}</div>`;
}

function closeMenu() {
  const nav = document.getElementById("nav");
  const toggle = topbar.querySelector(".menu-toggle");
  if (nav) nav.classList.remove("open");
  if (toggle) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Ouvrir le menu");
  }
}

function renderListe() {
  const container = document.getElementById("list-cards");
  container.innerHTML = ateliers
    .map(
      (a) => `
      <button class="card-btn" type="button" data-atelier="${a.id}">
        <span class="title">${a.nom}</span>
        <span>${a.descriptionCourte}</span>
        <span>Âges : ${a.ages}</span>
        <span>Prix : ${a.prix}</span>
      </button>`
    )
    .join("");
}

function renderFiche() {
  const atelier = getAtelier();
  if (!atelier) return;
  const seance = getSeance();

  document.getElementById("detail-cards").innerHTML = `
    <div class="card">
      <div class="details">
        <span class="title">${atelier.nom}</span>
        <span>${atelier.descriptionLongue}</span>
        <span>Âges : ${atelier.ages}</span>
        <span>Prix : ${atelier.prix}</span>
        <span>Durée : ${atelier.duree}</span>
        <span>Places : ${atelier.places}</span>
      </div>
    </div>
    <div class="card">
      <h2>À apporter</h2>
      <p>${atelier.aApporter}</p>
    </div>
    <div class="card">
      <h2>Lieu</h2>
      <p>${atelier.lieu}</p>
    </div>`;

  document.getElementById("session-card").innerHTML = `
    <h2>Séance</h2>
    <div class="sessions" role="radiogroup" aria-label="Choix de la séance">
      ${atelier.seances
        .map(
          (s) => `
        <label class="session-option">
          <input type="radio" name="seance" value="${s.id}" ${s.id === seance.id ? "checked" : ""}>
          <span>${s.label}</span>
        </label>`
        )
        .join("")}
    </div>`;
}

function renderReservation() {
  const atelier = getAtelier();
  const seance = getSeance();
  if (!atelier || !seance) return;

  document.getElementById("chosen-session").textContent = seance.resume;

  const form = document.getElementById("reservation-form");
  form.reset();
  clearErrors();

  const bornes = plagesAge(atelier.ages);
  const ageInput = form.elements.age;
  ageInput.min = bornes.min;
  ageInput.max = bornes.max;
  document.getElementById("age-hint").textContent =
    `Cet atelier accepte les âges de ${bornes.min} à ${bornes.max} ans.`;

  if (state.reservation) {
    form.elements.prenom.value = state.reservation.prenom;
    form.elements.nom.value = state.reservation.nom;
    form.elements.age.value = state.reservation.age;
    form.elements.email.value = state.reservation.email;
  }
}

function renderConfirmation() {
  const r = state.reservation;
  if (!r) return;
  document.getElementById("success-summary").textContent =
    `${r.prenom} ${r.nom}, votre séance du ${r.seance} est réservée. Une confirmation a été envoyée à ${r.email}.`;
}

function navigate(vue) {
  state.vue = vue;
  Object.entries(views).forEach(([name, el]) => {
    el.hidden = name !== vue;
  });
  renderTopbar();

  if (vue === "liste") renderListe();
  if (vue === "fiche") renderFiche();
  if (vue === "reservation") renderReservation();
  if (vue === "confirmation") renderConfirmation();

  window.scrollTo(0, 0);
}

const FIELDS = ["prenom", "nom", "age", "email"];
const MAX_LENGTH = 100;

function setError(name, message) {
  const input = document.getElementById(name);
  const err = document.getElementById(`err-${name}`);
  if (!input || !err) return;
  if (message) {
    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
    err.textContent = message;
    err.hidden = false;
  } else {
    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
    err.textContent = "";
    err.hidden = true;
  }
}

function clearErrors() {
  FIELDS.forEach((name) => setError(name, null));
}

function validateForm() {
  const form = document.getElementById("reservation-form");
  clearErrors();

  const values = {
    prenom: form.elements.prenom.value.trim(),
    nom: form.elements.nom.value.trim(),
    age: form.elements.age.value.trim(),
    email: form.elements.email.value.trim(),
  };

  if (!values.prenom) {
    setError("prenom", "Le prénom est obligatoire.");
  } else if (values.prenom.length > MAX_LENGTH) {
    setError("prenom", `${MAX_LENGTH} caractères maximum.`);
  }

  if (!values.nom) {
    setError("nom", "Le nom est obligatoire.");
  } else if (values.nom.length > MAX_LENGTH) {
    setError("nom", `${MAX_LENGTH} caractères maximum.`);
  }

  const atelier = getAtelier();
  const bornes = atelier ? plagesAge(atelier.ages) : { min: 1, max: 120 };

  if (!values.age) {
    setError("age", "L'âge est obligatoire.");
  } else {
    const age = Number(values.age);
    if (!Number.isInteger(age) || age < bornes.min || age > bornes.max) {
      setError("age", `L'âge doit être compris entre ${bornes.min} et ${bornes.max} ans.`);
    }
  }

  if (!values.email) {
    setError("email", "L'e-mail est obligatoire.");
  } else if (values.email.length > MAX_LENGTH) {
    setError("email", `${MAX_LENGTH} caractères maximum.`);
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    setError("email", "Format d'e-mail invalide (ex. prenom@exemple.fr).");
  }

  const firstInvalid = form.querySelector("input.invalid");
  if (firstInvalid) {
    firstInvalid.focus();
    return null;
  }
  return values;
}

topbar.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "menu") {
    const nav = document.getElementById("nav");
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    return;
  }
  if (action === "back-list") navigate("liste");
  if (action === "back-detail") navigate("fiche");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".topbar")) closeMenu();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

document.getElementById("list-cards").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-atelier]");
  if (!btn) return;
  state.atelierId = btn.dataset.atelier;
  state.seanceId = null;
  navigate("fiche");
});

document.getElementById("session-card").addEventListener("change", (e) => {
  if (e.target.name === "seance") state.seanceId = e.target.value;
});

document.getElementById("btn-reserve-session").addEventListener("click", () => {
  const atelier = getAtelier();
  if (!atelier) return;
  if (!state.seanceId) state.seanceId = atelier.seances[0].id;
  navigate("reservation");
});

document.getElementById("btn-confirm").addEventListener("click", () => {
  const values = validateForm();
  if (!values) return;

  const seance = getSeance();
  state.reservation = { ...values, seance: seance.resume, atelierId: state.atelierId };
  navigate("confirmation");
});

document.getElementById("reservation-form").addEventListener("input", (e) => {
  if (e.target.matches("input")) setError(e.target.name, null);
});

document.getElementById("btn-back-home").addEventListener("click", () => {
  state.reservation = null;
  state.seanceId = null;
  navigate("liste");
});

async function chargerAteliers() {
  const res = await fetch("./ateliers.json");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function init() {
  try {
    ateliers = await chargerAteliers();
  } catch (err) {
    document.getElementById("app").innerHTML =
      `<div class="card">Impossible de charger les ateliers (${err.message}). ` +
      `Servez le site via un serveur local : <code>python3 -m http.server 8000</code>.</div>`;
    return;
  }
  navigate("liste");
}

init();
