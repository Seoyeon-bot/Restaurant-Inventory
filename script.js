//
const seed = {
  inventory: [
    {
      id: 1,
      name: 'Chicken breast',
      quantity: 12,
      unit: 'lb',
      cost: 4.8,
      threshold: 6
    },
    {
      id: 2,
      name: 'Jasmine rice',
      quantity: 5,
      unit: 'lb',
      cost: 1.2,
      threshold: 8
    },
    {
      id: 3,
      name: 'Tomatoes',
      quantity: 10,
      unit: 'lb',
      cost: 2.5,
      threshold: 5
    },
    {
      id: 4,
      name: 'Avocado',
      quantity: 7,
      unit: 'each',
      cost: 1.4,
      threshold: 4
    },
    {
      id: 5,
      name: 'Limes',
      quantity: 20,
      unit: 'each',
      cost: 0.35,
      threshold: 12
    }
  ],

  recipes: [
    {
      id: 1,
      name: 'Chicken Rice Bowl',
      price: 14,
      ingredients: [
        { name: 'Chicken breast', qty: 0.5 },
        { name: 'Jasmine rice', qty: 0.3 },
        { name: 'Tomatoes', qty: 0.15 },
        { name: 'Avocado', qty: 0.25 }
      ]
    },
    {
      id: 2,
      name: 'Tomato Rice Bowl',
      price: 11,
      ingredients: [
        { name: 'Jasmine rice', qty: 0.35 },
        { name: 'Tomatoes', qty: 0.5 },
        { name: 'Avocado', qty: 0.25 },
        { name: 'Limes', qty: 1 }
      ]
    }
  ],

  purchases: [
    {
      id: 1,
      date: new Date().toISOString().slice(0, 10),
      item: 'Chicken breast',
      quantity: 8,
      cost: 4.6,
      supplier: 'Fresh Fields'
    }
  ]
};


// -------------------------
// APP STATE
// -------------------------

let state =
  JSON.parse(localStorage.getItem('pantryPilotData')) ||
  structuredClone(seed);

let activeFilter = 'all';


// -------------------------
// HELPER FUNCTIONS
// -------------------------

const money = n => `$${Number(n || 0).toFixed(2)}`;

const save = () => {
  localStorage.setItem(
    'pantryPilotData',
    JSON.stringify(state)
  );
};

const findItem = name => {
  return state.inventory.find(
    i => i.name.toLowerCase() === name.toLowerCase()
  );
};


function recipeCost(recipe) {
  return recipe.ingredients.reduce((sum, part) => {
    const item = findItem(part.name);

    return sum + ((item?.cost || 0) * part.qty);
  }, 0);
}


// -------------------------
// RENDER APPLICATION
// -------------------------

function render() {

  // Find low-stock items
  const low = state.inventory.filter(
    i => i.quantity <= i.threshold
  );


  // Inventory value
  document.querySelector('#inventoryValue').textContent =
    money(
      state.inventory.reduce(
        (sum, i) => sum + i.quantity * i.cost,
        0
      )
    );


  // Low-stock count
  document.querySelector('#lowStockCount').textContent =
    low.length;


  // Average recipe food cost
  const avg = state.recipes.length
    ? state.recipes.reduce(
        (sum, r) =>
          sum + recipeCost(r) / r.price * 100,
        0
      ) / state.recipes.length
    : 0;

  document.querySelector('#averageFoodCost').textContent =
    `${avg.toFixed(1)}%`;


  // Monthly purchase total
  const month = new Date()
    .toISOString()
    .slice(0, 7);

  document.querySelector('#purchaseTotal').textContent =
    money(
      state.purchases
        .filter(p => p.date.startsWith(month))
        .reduce(
          (sum, p) => sum + p.quantity * p.cost,
          0
        )
    );


  // -------------------------
  // INVENTORY TABLE
  // -------------------------

  const query =
    document
      .querySelector('#inventorySearch')
      .value
      .toLowerCase();


  const items = state.inventory.filter(i => {
    const matchesFilter =
      activeFilter === 'all' ||
      i.quantity <= i.threshold;

    const matchesSearch =
      i.name.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });


  document.querySelector('#inventoryRows').innerHTML =
    items.map(i => `
      <tr>

        <td>
          ${i.name}
        </td>

        <td>
          ${i.quantity} ${i.unit}
        </td>

        <td>
          ${money(i.cost)}
        </td>

        <td>
          <span
            class="badge ${
              i.quantity <= i.threshold
                ? 'low'
                : ''
            }"
          >
            ${
              i.quantity <= i.threshold
                ? 'Low stock'
                : 'In stock'
            }
          </span>
        </td>

        <td>

          <!-- EDIT BUTTON -->
          <button
            class="icon-button"
            title="Edit ${i.name}"
            data-edit="${i.id}"
          >
            Edit
          </button>

          <!-- DELETE BUTTON -->
          <button
            class="icon-button"
            title="Delete ${i.name}"
            data-delete="${i.id}"
          >
            ×
          </button>

        </td>

      </tr>
    `).join('') ||

    `
      <tr>
        <td
          colspan="5"
          class="empty"
        >
          No matching ingredients.
        </td>
      </tr>
    `;


  // -------------------------
  // RECIPE CARDS
  // -------------------------

  document.querySelector('#recipeCards').innerHTML =
    state.recipes.map(r => {

      const cost = recipeCost(r);
      const food = cost / r.price * 100;

      return `
        <article class="recipe">

          <div class="recipe-title">

            <h3>
              ${r.name}
            </h3>

            <button
              class="icon-button"
              title="Remove ${r.name}"
              data-delete-recipe="${r.id}"
            >
              ×
            </button>

          </div>

          <span class="cost">
            ${money(cost)}
          </span>

          <small>
            per serving
          </small>

          <p>
            Menu price ${money(r.price)}
            · Food cost ${food.toFixed(1)}%
          </p>

          <div class="meter">
            <i
              style="width:${Math.min(food, 100)}%"
            ></i>
          </div>

          <p>
            ${
              r.ingredients
                .map(x =>
                  `${x.qty} ${
                    findItem(x.name)?.unit || ''
                  } ${x.name}`
                )
                .join(' · ')
            }
          </p>

        </article>
      `;
    }).join('') ||

    `
      <p class="empty">
        No recipes yet.
      </p>
    `;


  // -------------------------
  // PURCHASE HISTORY
  // -------------------------

  document.querySelector('#purchaseList').innerHTML =
    state.purchases
      .slice()
      .reverse()
      .map(p => `
        <article class="purchase">

          <span class="purchase-date">
            ${p.date}
          </span>

          <div>

            <b>
              ${p.item}
              ·
              ${p.quantity}
              ${findItem(p.item)?.unit || 'units'}
            </b>

            <small>
              ${p.supplier}
              ·
              ${money(p.cost)}
              per unit
            </small>

          </div>

          <span class="amount">
            ${money(p.quantity * p.cost)}
          </span>

        </article>
      `).join('') ||

    `
      <p class="empty">
        No purchases logged.
      </p>
    `;


  // Purchase item dropdown
  document.querySelector('#purchaseItem').innerHTML =
    state.inventory
      .map(i =>
        `<option>${i.name}</option>`
      )
      .join('');
}


// -------------------------
// CHAT ASSISTANT
// -------------------------

function addChat(text, type = 'bot') {

  const el = document.createElement('div');

  el.className = `${type}-message`;
  el.textContent = text;

  document
    .querySelector('#chatLog')
    .append(el);

  el.parentElement.scrollTop =
    el.parentElement.scrollHeight;
}


function handleAssistant(raw) {

  const text = raw.trim();
  const lower = text.toLowerCase();

  if (!text) return;

  addChat(text, 'user');


  // LOW STOCK
  if (
    /low stock|low-stock|needs attention/.test(lower)
  ) {

    const low = state.inventory.filter(
      i => i.quantity <= i.threshold
    );

    addChat(
      low.length
        ? `Low stock: ${
            low.map(
              i =>
                `${i.name} (${i.quantity} ${i.unit}, reorder at ${i.threshold})`
            ).join('; ')
          }.`
        : 'Everything is above its reorder level.'
    );

    return;
  }


  // RECIPE COST
  if (/cost|food cost/.test(lower)) {

    const requested = lower
      .replace(
        /calculate|what(?:'s| is)|the|cost|of|food/gi,
        ''
      )
      .trim()
      .split(/\s+/)
      .filter(Boolean);


    const match = state.recipes.find(
      r =>
        requested.every(
          word =>
            r.name
              .toLowerCase()
              .includes(word)
        )
    );


    if (match) {

      const cost = recipeCost(match);

      addChat(
        `${match.name} costs ${money(cost)} per serving. ` +
        `At a ${money(match.price)} menu price, ` +
        `food cost is ${(cost / match.price * 100).toFixed(1)}%.`
      );

    } else {

      addChat(
        `I couldn't match a recipe. Available recipes: ` +
        `${state.recipes.map(r => r.name).join(', ')}.`
      );
    }

    return;
  }


  // ADD INVENTORY / PURCHASE
  const purchase = lower.match(
    /(?:record )?purchase\s+(\d+(?:\.\d+)?)\s+(\w+)\s+(.+?)\s+at\s+\$?(\d+(?:\.\d+)?)(?:\s+from\s+(.+))?$/
  );


  const add = lower.match(
    /add\s+(\d+(?:\.\d+)?)\s+(\w+)\s+(.+?)\s+at\s+\$?(\d+(?:\.\d+)?)$/
  );


  const parsed = purchase || add;


  if (parsed) {

    const [
      ,
      quantity,
      unit,
      name,
      cost,
      supplier
    ] = parsed;


    let item = findItem(name);


    if (!item) {

      item = {
        id: Date.now(),

        name: name.replace(
          /\b\w/g,
          c => c.toUpperCase()
        ),

        quantity: 0,

        unit,

        cost: Number(cost),

        threshold:
          Number(quantity) / 2
      };


      state.inventory.push(item);
    }


    item.quantity += Number(quantity);

    item.cost = Number(cost);


    if (purchase) {

      state.purchases.push({
        id: Date.now(),

        date: new Date()
          .toISOString()
          .slice(0, 10),

        item: item.name,

        quantity: Number(quantity),

        cost: Number(cost),

        supplier:
          supplier ||
          'Unspecified supplier'
      });
    }


    save();
    render();


    addChat(
      `${
        purchase
          ? 'Purchase recorded'
          : 'Inventory updated'
      }: ${quantity} ${unit} ${item.name} at ${money(cost)} each.`
    );

    return;
  }


  addChat(
    'I can help with low stock, recipe costs, adding inventory, and recording purchases. Try one of the example commands below.'
  );
}


// -------------------------
// OPEN DIALOG BUTTONS
// -------------------------

document
  .querySelectorAll('[data-open]')
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        document
          .querySelector(
            `#${button.dataset.open}`
          )
          .showModal();
      }
    );
  });


// -------------------------
// INVENTORY SEARCH
// -------------------------

document
  .querySelector('#inventorySearch')
  .addEventListener(
    'input',
    render
  );


// -------------------------
// INVENTORY FILTER
// -------------------------

document
  .querySelectorAll('.chip')
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        activeFilter =
          button.dataset.filter;


        document
          .querySelectorAll('.chip')
          .forEach(x =>
            x.classList.toggle(
              'active',
              x === button
            )
          );


        render();
      }
    );
  });


// =========================================
// INVENTORY EDIT + DELETE
// ISSUE #14
// =========================================

document
  .querySelector('#inventoryRows')
  .addEventListener(
    'click',
    event => {


      // -------------------------
      // EDIT ITEM
      // -------------------------

      if (event.target.dataset.edit) {

        const id =
          Number(
            event.target.dataset.edit
          );


        const item =
          state.inventory.find(
            i => i.id === id
          );


        if (!item) return;


        const form =
          document.querySelector(
            '#editInventoryForm'
          );


        // Put current item information
        // into the edit form
        form.elements.id.value =
          item.id;

        form.elements.name.value =
          item.name;

        form.elements.quantity.value =
          item.quantity;

        form.elements.unit.value =
          item.unit;

        form.elements.cost.value =
          item.cost;

        form.elements.threshold.value =
          item.threshold;


        // Open edit window
        document
          .querySelector(
            '#editInventoryDialog'
          )
          .showModal();

        return;
      }


      // -------------------------
      // DELETE ITEM
      // -------------------------

      if (event.target.dataset.delete) {

        const id =
          Number(
            event.target.dataset.delete
          );


        state.inventory =
          state.inventory.filter(
            i => i.id !== id
          );


        save();
        render();
      }
    }
  );


// =========================================
// SAVE EDITED INVENTORY ITEM
// ISSUE #14
// =========================================

document
  .querySelector('#editInventoryForm')
  .addEventListener(
    'submit',
    event => {

      event.preventDefault();


      const form = event.target;


      const id =
        Number(
          form.elements.id.value
        );


      const item =
        state.inventory.find(
          i => i.id === id
        );


      if (!item) return;


      // Update existing item
      item.name =
        form.elements.name.value.trim();

      item.quantity =
        Number(
          form.elements.quantity.value
        );

      item.unit =
        form.elements.unit.value.trim();

      item.cost =
        Number(
          form.elements.cost.value
        );

      item.threshold =
        Number(
          form.elements.threshold.value
        );


      // Save changes
      save();

      // Refresh screen
      render();


      // Close edit dialog
      document
        .querySelector(
          '#editInventoryDialog'
        )
        .close();
    }
  );


// -------------------------
// ADD NEW INVENTORY ITEM
// -------------------------

document
  .querySelector('#inventoryForm')
  .addEventListener(
    'submit',
    event => {

      event.preventDefault();


      const d =
        Object.fromEntries(
          new FormData(event.target)
        );


      state.inventory.push({
        id: Date.now(),

        name: d.name,

        quantity:
          Number(d.quantity),

        unit: d.unit,

        cost:
          Number(d.cost),

        threshold:
          Number(d.threshold)
      });


      save();
      render();


      event.target
        .closest('dialog')
        .close();


      event.target.reset();
    }
  );


// -------------------------
// ADD RECIPE
// -------------------------

document
  .querySelector('#recipeForm')
  .addEventListener(
    'submit',
    event => {

      event.preventDefault();


      const d =
        Object.fromEntries(
          new FormData(event.target)
        );


      const ingredients =
        d.ingredients
          .split(',')
          .map(value => {

            const [name, qty] =
              value
                .trim()
                .split(':');


            return {
              name: name.trim(),
              qty: Number(qty)
            };
          })
          .filter(
            x =>
              x.name &&
              !Number.isNaN(x.qty)
          );


      const missing =
        ingredients
          .filter(
            x =>
              !findItem(x.name)
          )
          .map(
            x => x.name
          );


      if (!ingredients.length) {

        alert(
          'Add at least one ingredient using the format Item name:quantity.'
        );

        return;
      }


      if (missing.length) {

        alert(
          `Add these items to Inventory Counts first, or correct their spelling: ${missing.join(', ')}.`
        );

        return;
      }


      state.recipes.push({
        id: Date.now(),

        name: d.name,

        price:
          Number(d.price),

        ingredients
      });


      save();
      render();


      event.target
        .closest('dialog')
        .close();


      event.target.reset();
    }
  );


// -------------------------
// DELETE RECIPE
// -------------------------

document
  .querySelector('#recipeCards')
  .addEventListener(
    'click',
    event => {

      if (
        event.target.dataset.deleteRecipe
      ) {

        const id =
          Number(
            event.target.dataset.deleteRecipe
          );


        state.recipes =
          state.recipes.filter(
            r => r.id !== id
          );


        save();
        render();
      }
    }
  );


// -------------------------
// RECORD PURCHASE
// -------------------------

document
  .querySelector('#purchaseForm')
  .addEventListener(
    'submit',
    event => {

      event.preventDefault();


      const d =
        Object.fromEntries(
          new FormData(event.target)
        );


      const item =
        findItem(d.item);


      item.quantity +=
        Number(d.quantity);

      item.cost =
        Number(d.cost);


      state.purchases.push({
        id: Date.now(),

        date:
          new Date()
            .toISOString()
            .slice(0, 10),

        item: d.item,

        quantity:
          Number(d.quantity),

        cost:
          Number(d.cost),

        supplier:
          d.supplier
      });


      save();
      render();


      event.target
        .closest('dialog')
        .close();


      event.target.reset();
    }
  );


// -------------------------
// ASSISTANT FORM
// -------------------------

document
  .querySelector('#assistantForm')
  .addEventListener(
    'submit',
    event => {

      event.preventDefault();


      const input =
        document.querySelector(
          '#assistantInput'
        );


      handleAssistant(
        input.value
      );


      input.value = '';
    }
  );


// -------------------------
// ASSISTANT PROMPT BUTTONS
// -------------------------

document
  .querySelectorAll('[data-prompt]')
  .forEach(button => {

    button.addEventListener(
      'click',
      () =>
        handleAssistant(
          button.dataset.prompt
        )
    );
  });


// -------------------------
// RESET DEMO DATA
// -------------------------

document
  .querySelector('#resetButton')
  .addEventListener(
    'click',
    () => {

      if (
        confirm(
          'Restore the original demo data?'
        )
      ) {

        state =
          structuredClone(seed);

        save();
        render();
      }
    }
  );


// -------------------------
// INITIAL RENDER
// -------------------------

render();