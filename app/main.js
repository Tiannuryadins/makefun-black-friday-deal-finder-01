// A deal finder: the list, with search and filters, and a page for each deal,
// on hash routes. The deals live in data.js, so the site needs no network
// to show them; each deal links out to its store.
//
//   #/            the board, with search and filters
//   #/deal/<id>   one deal, with its prices and its check
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { CHECKED_LABEL, deals } from "./data.js";
import { dealPage, listPage, missingPage, percentOff, saved } from "./views.js";

const app = document.getElementById("app");
const countLine = () => document.getElementById("result-line");

const state = {
  q: "",
  category: "All categories",
  store: "All stores",
  mindisc: 0,
  sort: "discount",
  lows: false,
};

function applyFilters() {
  const q = state.q.trim().toLowerCase();
  let list = deals.filter((d) => {
    if (state.category !== "All categories" && d.category !== state.category) return false;
    if (state.store !== "All stores" && d.store !== state.store) return false;
    if (percentOff(d) < state.mindisc) return false;
    if (state.lows && d.verdict !== "low") return false;
    if (q && !(d.title + " " + d.store + " " + d.category).toLowerCase().includes(q)) return false;
    return true;
  });
  const by = {
    discount: (a, b) => percentOff(b) - percentOff(a) || saved(b) - saved(a),
    saved: (a, b) => saved(b) - saved(a) || percentOff(b) - percentOff(a),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    az: (a, b) => a.title.localeCompare(b.title),
  };
  return list.sort(by[state.sort] || by.discount);
}

function updateCount(list) {
  const line = countLine();
  if (!line) return;
  const totalSaved = list.reduce((s, d) => s + saved(d), 0);
  line.textContent =
    list.length === deals.length
      ? `Showing all ${list.length} deals · $${totalSaved.toLocaleString("en-US")} combined savings · last checked ${CHECKED_LABEL}`
      : `Showing ${list.length} of ${deals.length} deals · $${totalSaved.toLocaleString("en-US")} combined savings`;
}

function wireControls() {
  const q = document.getElementById("q");
  if (q) q.addEventListener("input", () => { state.q = q.value; rerenderList(); });
  const store = document.getElementById("store");
  if (store) store.addEventListener("change", () => { state.store = store.value; rerenderList(); });
  const mindisc = document.getElementById("mindisc");
  if (mindisc) mindisc.addEventListener("change", () => { state.mindisc = Number(mindisc.value); rerenderList(); });
  const sort = document.getElementById("sort");
  if (sort) sort.addEventListener("change", () => { state.sort = sort.value; rerenderList(); });
  const lows = document.getElementById("lows");
  if (lows) lows.addEventListener("change", () => { state.lows = lows.checked; rerenderList(); });
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.category = chip.dataset.cat;
      document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("chip-on", c === chip));
      rerenderList();
    });
  });
  const clear = document.getElementById("clear-filters");
  if (clear) clear.addEventListener("click", () => {
    Object.assign(state, { q: "", category: "All categories", store: "All stores", mindisc: 0, sort: "discount", lows: false });
    render();
  });
}

function rerenderList() {
  renderListOnly(applyFilters());
}

function renderListOnly(list) {
  // Replace only the deals grid and the count line, keeping focus in the
  // search box when the user is typing.
  const box = document.getElementById("deals");
  const active = document.activeElement;
  const wasTyping = active && active.id === "q";
  const caret = wasTyping ? active.selectionStart : null;
  import("./views.js").then(({ dealCard }) => {
    box.innerHTML = list.length
      ? list.map(dealCard).join("")
      : `<p class="empty">No deals match those filters. <button type="button" id="clear-filters" class="linklike">Clear all filters</button></p>`;
    const clear = document.getElementById("clear-filters");
    if (clear) clear.addEventListener("click", () => {
      Object.assign(state, { q: "", category: "All categories", store: "All stores", mindisc: 0, sort: "discount", lows: false });
      render();
    });
    updateCount(list);
    if (wasTyping) {
      const q = document.getElementById("q");
      if (q) { q.focus(); q.setSelectionRange(caret, caret); }
    }
  });
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = `${found ? found.title : "Deal not found"} | DealSleuth — Black Friday 2026`;
    app.innerHTML = found ? dealPage(found) : missingPage();
  } else {
    document.title = "DealSleuth — Black Friday 2026 Deal Finder";
    app.innerHTML = listPage(state, applyFilters());
    wireControls();
    updateCount(applyFilters());
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener("hashchange", render);

// Masthead shortcut links jump to the board with a category pre-selected.
document.querySelectorAll("[data-nav-cat]").forEach((link) => {
  link.addEventListener("click", () => {
    state.category = link.dataset.navCat;
    if (location.hash !== "#/") location.hash = "#/";
    render();
  });
});

render();
