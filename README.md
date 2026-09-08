# Restaurant-Inventory

Restaurant-Inventory is a small, original restaurant inventory-management toy project. It runs entirely in the browser—no server, database, build step, or API key is required. Data is stored in the browser's `localStorage`.

## Features

- **Inventory counts:** add, search, filter, and delete ingredients; low-stock status is calculated from reorder thresholds.
- **Recipe costing and food-cost tracking:** enter recipes with ingredients and quantities; the app calculates cost per serving and food-cost percentage against the menu price.
- **Supplier invoices/purchasing:** record a delivery with supplier, quantity, and unit cost. This updates on-hand inventory and appears in the purchase log.
- **Local assistant:** a small rule-based, AI-agent-style interface that interprets a few natural-language commands and performs supported local actions.

Example assistant requests:

- `show low stock`
- `calculate cost of chicken rice bowl`
- `add 5 lb tomatoes at 2.50`
- `record purchase 10 lb jasmine rice at 1.20 from Fresh Farms`

## Run it

1. Download or open this project folder.
2. Double-click `index.html`, or open it in any modern browser.
3. Use **Reset demo** to restore the initial example data.

## Project files

- `index.html` — semantic UI structure and forms
- `style.css` — responsive visual design
- `script.js` — state, calculations, local storage, purchase handling, and assistant command parsing

## Open-source reference and attribution

This project was informed by the product scope of [OpenKitchen](https://github.com/clawnify/OpenKitchen), an open-source restaurant back-of-house application that includes restaurant inventory, food-cost, and purchasing-related workflows.

**No OpenKitchen source code was copied, adapted, or incorporated.** PantryPilot is an independently written, intentionally smaller course project using plain HTML, CSS, and JavaScript.

ChatGPT was used as an AI development assistant to help plan and generate this original educational project. The in-app “Pantry Pilot AI” is not a hosted AI model; it is a transparent local rule-based command parser, so it works offline and does not send user data anywhere.

## Limits

This is a learning project, not production software. It has no authentication, multi-user sync, real invoice file upload, tax handling, or live supplier integrations.
