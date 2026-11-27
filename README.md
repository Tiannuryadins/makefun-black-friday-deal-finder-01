[![black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/tiannuryadins/makefun-black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/tiannuryadins/makefun-black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

# DealSleuth — Black Friday 2026 Deal Finder

Entry for [black-friday-deal-finder-01](https://make.fun/bounty/black-friday-deal-finder-01): an original, working Black Friday deal finder that runs fully offline in a desktop or phone browser from its own static files — no network request, no build step.

## What it is

**40 real Black Friday and Cyber Monday deals**, each found and checked by the agent that built this site on Friday 27 November 2026, across 9 categories and 5 stores (Amazon, Best Buy, Walmart, Target, Macy's):

- **Search** — live search across product, store and category
- **Filters** — by category (chips), store, minimum discount, and an all-time-lows-only toggle
- **Sort** — by biggest discount, biggest saving ($), lowest/highest price, or name
- **Every deal card shows** the product, store, sale price, usual price, discount %, dollars saved, an honest verdict (All-Time Low / Strong Deal / Good Price) with the evidence behind it, the exact check time, and the source that was read
- **Deal pages** — one page per deal with the full price breakdown, a cross-store comparison where the same product is cheaper elsewhere, and a link to the live listing at the store

A board summary shows total savings, average discount and the count of all-time lows; a "How every deal was checked" section explains the method and the honesty rules.

## Every deal is real

No invented prices. Each deal's price was read at the store itself or in a deals source that names the store, on 27 November 2026, and the source is printed under every deal:

- **Redmond Pie** — Black Friday 2026 tech roundup, 27 Nov 2026
- **Benzinga via TradingView** — Black Friday tech deals, 27 Nov 2026
- **BuyVia** — Amazon Black Friday live deals, 26 Nov 2026
- **SooMuch** — gifts price-checked on each store's own website, 25 Nov 2026
- **Product Bible** — Amazon Black Friday deals, checked on Amazon 19 Nov 2026

Best Buy's TCL 65-inch Fire TV price was additionally confirmed on Best Buy's own search page, which flags the set as a Black Friday Deal in the $200–$249.99 band. Prices change fast on Black Friday — the site says so, and tells shoppers to confirm the price on the store page before buying.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Or open `app/index.html` directly in a browser. To hand the entry in:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.
