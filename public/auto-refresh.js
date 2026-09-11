const AUTO_REFRESH_MS = 5 * 60 * 1000;

function refreshOffersIfVisible() {
  if (!document.hidden && typeof loadOffers === "function") {
    loadOffers();
  }
}

setInterval(refreshOffersIfVisible, AUTO_REFRESH_MS);

window.addEventListener("focus", refreshOffersIfVisible);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refreshOffersIfVisible();
});
