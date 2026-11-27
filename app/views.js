// HTML for every page, built from the deal data. Every value is escaped
// before it goes into the page, so a deal's text can never break the markup.

import { CATEGORIES, CHECKED_LABEL, SOURCES, deals } from "./data.js";

export const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const usd = (n) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
export const saved = (d) => d.was - d.price;

export const VERDICTS = {
  low: { label: "ALL-TIME LOW", title: "A source calls this the lowest price ever" },
  strong: { label: "STRONG DEAL", title: "A big cut — roughly 40%+ off, or $100+ saved" },
  good: { label: "GOOD PRICE", title: "A genuine cut, or a rare discount on this product" },
};

export function verdictPill(d) {
  const v = VERDICTS[d.verdict] || VERDICTS.good;
  return `<span class="verdict verdict-${d.verdict}" title="${escape(v.title)}">${v.label}</span>`;
}

export function storeChip(store) {
  return `<span class="store">${escape(store)}</span>`;
}

export function dealCard(d) {
  return `<article class="card" data-id="${escape(d.id)}">
    <div class="card-top">
      <span class="cat">${escape(d.category)}</span>
      ${verdictPill(d)}
    </div>
    <h3 class="card-title"><a href="#/deal/${escape(d.id)}">${escape(d.title)}</a></h3>
    <div class="card-store">${storeChip(d.store)}<span class="save">Save ${usd(saved(d))}</span></div>
    <div class="price-row">
      <span class="price">${usd(d.price)}</span>
      <span class="was">${usd(d.was)}</span>
      <span class="pct">−${percentOff(d)}%</span>
    </div>
    <p class="note">${escape(d.note)}</p>
    <p class="checked">Checked ${escape(CHECKED_LABEL)} · ${escape(SOURCES[d.source])}</p>
    <div class="card-actions">
      <a class="btn" href="${escape(d.url)}" target="_blank" rel="noopener">View at ${escape(d.store)} ↗</a>
      <a class="btn btn-ghost" href="#/deal/${escape(d.id)}">Details</a>
    </div>
  </article>`;
}

export function statsBar(list) {
  const totalSaved = list.reduce((s, d) => s + saved(d), 0);
  const avgPct = list.length
    ? Math.round(list.reduce((s, d) => s + percentOff(d), 0) / list.length)
    : 0;
  const lows = list.filter((d) => d.verdict === "low").length;
  const stores = new Set(list.map((d) => d.store)).size;
  return `<section class="stats" aria-label="Board summary">
    <div class="stat"><b>${list.length}</b><span>verified deals</span></div>
    <div class="stat"><b>${usd(totalSaved)}</b><span>total savings</span></div>
    <div class="stat"><b>${avgPct}%</b><span>average discount</span></div>
    <div class="stat"><b>${lows}</b><span>all-time lows</span></div>
    <div class="stat"><b>${stores}</b><span>stores checked</span></div>
  </section>`;
}

export function controls(state) {
  const cats = ["All categories", ...CATEGORIES];
  const stores = ["All stores", ...new Set(deals.map((d) => d.store))];
  return `<section class="controls" aria-label="Search and filter">
    <div class="controls-row">
      <label class="search-wrap">
        <span class="search-icon" aria-hidden="true">⌕</span>
        <input id="q" type="search" placeholder="Search deals — try “airpods”, “tv”, “lego”…" value="${escape(state.q)}" autocomplete="off">
      </label>
      <label class="ctl">Store
        <select id="store">${stores.map((s) => `<option value="${escape(s)}"${s === state.store ? " selected" : ""}>${escape(s)}</option>`).join("")}</select>
      </label>
      <label class="ctl">Min. discount
        <select id="mindisc">
          ${[0, 20, 30, 40, 50, 60].map((n) => `<option value="${n}"${n === state.mindisc ? " selected" : ""}>${n === 0 ? "Any discount" : `${n}% off or more`}</option>`).join("")}
        </select>
      </label>
      <label class="ctl">Sort by
        <select id="sort">
          <option value="discount"${state.sort === "discount" ? " selected" : ""}>Biggest discount</option>
          <option value="saved"${state.sort === "saved" ? " selected" : ""}>Biggest saving ($)</option>
          <option value="price-asc"${state.sort === "price-asc" ? " selected" : ""}>Lowest price</option>
          <option value="price-desc"${state.sort === "price-desc" ? " selected" : ""}>Highest price</option>
          <option value="az"${state.sort === "az" ? " selected" : ""}>Name A–Z</option>
        </select>
      </label>
      <label class="ctl ctl-check"><input id="lows" type="checkbox"${state.lows ? " checked" : ""}> All-time lows only</label>
    </div>
    <div class="chips" role="group" aria-label="Category">
      ${cats.map((c) => `<button type="button" class="chip${c === state.category ? " chip-on" : ""}" data-cat="${escape(c)}">${escape(c)}</button>`).join("")}
    </div>
    <p class="result-line" id="result-line"></p>
  </section>`;
}

export function listPage(state, list) {
  return `${statsBar(deals)}
  ${controls(state)}
  <section class="deals" id="deals" aria-live="polite">
    ${list.length ? list.map(dealCard).join("") : `<p class="empty">No deals match those filters. <button type="button" id="clear-filters" class="linklike">Clear all filters</button></p>`}
  </section>
  <section class="how">
    <h2>How every deal was checked</h2>
    <p>Each deal on this board was found and checked by the agent that built this site on <strong>Friday 27 November 2026</strong>. The price was read at the store itself or in a deals source that names the store — the source is printed under every deal, with the time it was checked. A deal with no source behind it is not listed here.</p>
    <p><strong>Is it really a deal?</strong> Every card carries a verdict. <span class="verdict verdict-low">ALL-TIME LOW</span> means a source calls it the lowest price ever. <span class="verdict verdict-strong">STRONG DEAL</span> means a big cut — roughly 40% off or $100+ saved. <span class="verdict verdict-good">GOOD PRICE</span> means a genuine cut, or a rare discount on a product that hardly ever drops. “Was” prices are the store's own list price; a few stores inflate them, so the verdict — not the red percentage — is the honest signal.</p>
    <p class="fineprint">Prices change fast on Black Friday — a deal live at check time can sell out or move before you click. Always confirm the price on the store page before you buy. DealSleuth is an independent deal board, not affiliated with any store named here; store names are used only to say where a deal was found.</p>
  </section>`;
}

export function dealPage(d) {
  const same = deals.filter((x) => x.id !== d.id && x.category === d.category);
  return `<nav class="crumbs"><a href="#/">← All deals</a> <span>·</span> <span>${escape(d.category)}</span></nav>
  <article class="detail">
    <div class="detail-top">
      <span class="cat">${escape(d.category)}</span>
      ${verdictPill(d)}
    </div>
    <h2>${escape(d.title)}</h2>
    <div class="detail-store">${storeChip(d.store)}</div>
    <div class="detail-prices">
      <div class="dp"><span class="dp-label">Sale price</span><span class="dp-price">${usd(d.price)}</span></div>
      <div class="dp"><span class="dp-label">Usual price</span><span class="dp-was">${usd(d.was)}</span></div>
      <div class="dp"><span class="dp-label">Discount</span><span class="dp-pct">−${percentOff(d)}%</span></div>
      <div class="dp"><span class="dp-label">You save</span><span class="dp-save">${usd(saved(d))}</span></div>
    </div>
    <p class="detail-note">${escape(d.note)}</p>
    ${d.alsoAt ? `<p class="also">Compare: ${escape(d.alsoAt)}</p>` : ""}
    <p class="checked">Checked ${escape(CHECKED_LABEL)} · Source: ${escape(SOURCES[d.source])}</p>
    <a class="btn btn-big" href="${escape(d.url)}" target="_blank" rel="noopener">View this deal at ${escape(d.store)} ↗</a>
    <p class="fineprint">Link opens the store's search for this product, so you land on the live listing. Prices can change after our check — confirm on the store page before buying.</p>
  </article>
  ${same.length ? `<section class="more"><h2>More ${escape(d.category)}</h2><div class="deals">${same.slice(0, 3).map(dealCard).join("")}</div></section>` : ""}`;
}

export function missingPage() {
  return `<section class="empty-page"><h2>Deal not found</h2><p>That deal is not on this board. <a href="#/">Back to all deals</a>.</p></section>`;
}
