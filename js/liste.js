(async () => {
  let ateliers;
  try {
    ateliers = await chargerAteliers();
  } catch (err) {
    erreurChargement(err);
    return;
  }

  document.getElementById("list-cards").innerHTML = ateliers
    .map(
      (a) => `
      <a class="card-btn" href="atelier.html?id=${encodeURIComponent(a.id)}">
        <span class="title">${a.nom}</span>
        <span>${a.descriptionCourte}</span>
        <span>Âges : ${a.ages}</span>
        <span>Prix : ${a.prix}</span>
      </a>`
    )
    .join("");
})();

initMenu();
