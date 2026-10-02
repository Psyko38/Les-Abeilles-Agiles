const FIELDS = ["prenom", "nom", "age", "email"];

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

function validateForm(form, bornes) {
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

function afficherConfirmation(values, atelier, seance) {
  document.querySelector(".reserv-main").hidden = true;
  document.querySelector(".reserv-aside").hidden = true;
  // Formulaire et bouton ont disparu : leurs liens d'accès rapide n'auraient
  // plus de cible, on les retire du groupe.
  document
    .querySelectorAll('[href="#reservation-form"], [href="#btn-confirm"]')
    .forEach((lien) => (lien.hidden = true));
  document.getElementById("success-summary").textContent =
    `${values.prenom} ${values.nom}, votre séance du ${seance.resume} (${atelier.nom}) est réservée. ` +
    `Une confirmation a été envoyée à ${values.email}.`;
  const card = document.getElementById("success-card");
  card.hidden = false;
  card.focus();
  window.scrollTo(0, 0);
}

(async () => {
  const id = getParam("id");
  const seanceId = getParam("seance");

  let ateliers;
  try {
    ateliers = await chargerAteliers();
  } catch (err) {
    erreurChargement(err);
    return;
  }

  const atelier = ateliers.find((a) => a.id === id);
  if (!atelier) {
    erreurPage("Atelier introuvable.");
    return;
  }
  const seance = atelier.seances.find((s) => s.id === seanceId) || atelier.seances[0];

  document.title = `Réservation — ${atelier.nom} — Les Abeilles Agiles`;
  document.getElementById("back-link").href = `atelier.html?id=${encodeURIComponent(atelier.id)}`;
  document.getElementById("chosen-session").textContent = seance.resume;

  const bornes = plagesAge(atelier.ages);
  const form = document.getElementById("reservation-form");
  form.elements.age.min = bornes.min;
  form.elements.age.max = bornes.max;
  document.getElementById("age-hint").textContent =
    `Cet atelier accepte les âges de ${bornes.min} à ${bornes.max} ans.`;

  form.addEventListener("input", (e) => {
    if (e.target.matches("input")) setError(e.target.name, null);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const values = validateForm(form, bornes);
    if (!values) return;
    afficherConfirmation(values, atelier, seance);
  });
})();

initMenu();
initSkipLinks();
