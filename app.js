const ateliers = [
  {
    id: "dessin-court",
    nom: "Atelier dessin",
    descriptionCourte: "Description courte",
    descriptionLongue:
      "Un atelier encadré pour découvrir les bases du dessin : lignes, formes, ombres et mise en page. Chacun repart avec une réalisation finale.",
    ages: "18–20 ans",
    prix: "5 €",
    aApporter: "Crayons, feuilles",
    lieu: "12 Rue de Paris",
    seances: [
      { id: "s1", label: "Mer. 12 juin — 14 h", resume: "Mer. 12 juin à 14 h" },
      { id: "s2", label: "Sam. 15 juin — 10 h", resume: "Sam. 15 juin à 10 h" },
    ],
  },
  {
    id: "dessin-long",
    nom: "Atelier dessin",
    descriptionCourte: "Description long",
    descriptionLongue:
      "Un accompagnement sur plusieurs séances, adapté aux plus jeunes : observation, couleur et créativité, avec un suivi personnalisé tout au long de l'atelier.",
    ages: "8–12 ans",
    prix: "5 €",
    aApporter: "Crayons, feutres, cahier",
    lieu: "12 Rue de Paris",
    seances: [
      { id: "s3", label: "Mer. 12 juin — 14 h", resume: "Mer. 12 juin à 14 h" },
      { id: "s4", label: "Sam. 15 juin — 10 h", resume: "Sam. 15 juin à 10 h" },
    ],
  },
];

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

function navHtml() {
  return `
    <nav class="nav" id="nav">
      <button type="button" data-action="back-list">Nos ateliers</button>
    </nav>
    <button type="button" class="menu-toggle" data-action="menu" aria-expanded="false" aria-controls="nav">Menu</button>`;
}

function renderTopbar() {
  let left = "";
  let title = "";
  if (state.vue === "liste") {
    left = `<span class="brand">Logo</span>`;
  } else if (state.vue === "fiche") {
    left = `<button type="button" data-action="back-list">Retour</button>`;
  } else if (state.vue === "reservation") {
    left = `<button type="button" data-action="back-detail">Retour</button>`;
    title = `<span class="reserv-title">Réservation</span>`;
  } else {
    left = `<span class="brand">Réservation</span>`;
  }
  topbar.innerHTML = `${left}<div class="topbar-right">${title}${navHtml()}</div>`;
}

function closeMenu() {
  const nav = document.getElementById("nav");
  const toggle = topbar.querySelector(".menu-toggle");
  if (nav) nav.classList.remove("open");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
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
    <div class="sessions">
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

  if (state.reservation) {
    form.prenom.value = state.reservation.prenom;
    form.nom.value = state.reservation.nom;
    form.age.value = state.reservation.age;
    form.email.value = state.reservation.email;
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

function clearErrors() {
  const form = document.getElementById("reservation-form");
  form.querySelectorAll("input").forEach((i) => i.classList.remove("invalid"));
  document.getElementById("form-error").hidden = true;
}

function validateForm() {
  const form = document.getElementById("reservation-form");
  clearErrors();

  const values = {
    prenom: form.prenom.value.trim(),
    nom: form.nom.value.trim(),
    age: form.age.value.trim(),
    email: form.email.value.trim(),
  };

  const problems = [];
  ["prenom", "nom", "age", "email"].forEach((name) => {
    if (!values[name]) {
      form[name].classList.add("invalid");
      problems.push("champ manquant");
    }
  });

  const age = Number(values.age);
  if (values.age && (!Number.isInteger(age) || age < 1 || age > 120)) {
    form.age.classList.add("invalid");
    problems.push("âge invalide");
  }

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    form.email.classList.add("invalid");
    problems.push("e-mail invalide");
  }

  const errorEl = document.getElementById("form-error");
  if (problems.length) {
    errorEl.textContent = "Merci de corriger les champs en rouge.";
    errorEl.hidden = false;
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
  if (e.target.matches("input")) e.target.classList.remove("invalid");
});

document.getElementById("btn-back-home").addEventListener("click", () => {
  state.reservation = null;
  state.seanceId = null;
  navigate("liste");
});

navigate("liste");
