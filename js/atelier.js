(async () => {
  const id = getParam("id");
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

  document.title = `${atelier.nom} — Les Abeilles Agiles`;

  document.getElementById("detail-cards").innerHTML = `
    <div class="card">
      <div class="details">
        <h1 class="title">${atelier.nom}</h1>
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
    <input type="hidden" name="id" value="${atelier.id}">
    <h2>Séance</h2>
    <div class="sessions" role="radiogroup" aria-label="Choix de la séance">
      ${atelier.seances
        .map(
          (s, i) => `
        <label class="session-option">
          <input type="radio" name="seance" value="${s.id}" ${i === 0 ? "checked" : ""}>
          <span>${s.label}</span>
        </label>`
        )
        .join("")}
    </div>`;
})();

initMenu();
initSkipLinks();
