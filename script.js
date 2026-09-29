const seed = {

  inventory: [

    {
      id: 1,
      name: 'Chicken breast',
      quantity: 12,
      unit: 'lb',
      cost: 4.8,
      threshold: 6,
      expiryDate: '2026-10-05'
    },

    {
      id: 2,
      name: 'Jasmine rice',
      quantity: 5,
      unit: 'lb',
      cost: 1.2,
      threshold: 8,
      expiryDate: '2027-03-15'
    },

    {
      id: 3,
      name: 'Tomatoes',
      quantity: 10,
      unit: 'lb',
      cost: 2.5,
      threshold: 5,
      expiryDate: '2026-10-02'
    },

    {
      id: 4,
      name: 'Avocado',
      quantity: 7,
      unit: 'each',
      cost: 1.4,
      threshold: 4,
      expiryDate: '2026-10-01'
    },

    {
      id: 5,
      name: 'Limes',
      quantity: 20,
      unit: 'each',
      cost: 0.35,
      threshold: 12,
      expiryDate: '2026-10-10'
    }

  ],


  recipes: [

    {
      id: 1,
      name: 'Chicken Rice Bowl',
      price: 14,

      ingredients: [
        {
          name: 'Chicken breast',
          qty: 0.5
        },
        {
          name: 'Jasmine rice',
          qty: 0.3
        },
        {
          name: 'Tomatoes',
          qty: 0.15
        },
        {
          name: 'Avocado',
          qty: 0.25
        }
      ]
    },

    {
      id: 2,
      name: 'Tomato Rice Bowl',
      price: 11,

      ingredients: [
        {
          name: 'Jasmine rice',
          qty: 0.35
        },
        {
          name: 'Tomatoes',
          qty: 0.5
        },
        {
          name: 'Avocado',
          qty: 0.25
        },
        {
          name: 'Limes',
          qty: 1
        }
      ]
    }

  ],


  purchases: [

    {
      id: 1,

      date:
        new Date()
          .toISOString()
          .slice(0, 10),

      item: 'Chicken breast',

      quantity: 8,

      cost: 4.6,

      supplier: 'Fresh Fields'
    }

  ]

};


// ======================================
// STATE
// ======================================

let state =
  JSON.parse(
    localStorage.getItem(
      'pantryPilotData'
    )
  ) || structuredClone(seed);


let activeFilter = 'all';


// ======================================
// HELPERS
// ======================================

const money = number =>
  `$${Number(number || 0).toFixed(2)}`;


const save = () => {

  localStorage.setItem(
    'pantryPilotData',
    JSON.stringify(state)
  );

};


const findItem = name => {

  return state.inventory.find(
    item =>
      item.name.toLowerCase() ===
      name.toLowerCase()
  );

};


function recipeCost(recipe) {

  return recipe.ingredients.reduce(
    (sum, part) =>

      sum +
      (
        (
          findItem(part.name)?.cost ||
          0
        ) *
        part.qty
      ),

    0
  );

}


// ======================================
// #15 EXPIRY TRACKING
// ======================================

function getExpiryStatus(expiryDate) {

  if (!expiryDate) {

    return 'No expiry date';

  }


  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );


  const expiry =
    new Date(
      `${expiryDate}T00:00:00`
    );


  const millisecondsPerDay =
    1000 * 60 * 60 * 24;


  const daysLeft =
    Math.ceil(
      (expiry - today) /
      millisecondsPerDay
    );


  if (daysLeft < 0) {

    return '⚠ Expired';

  }


  if (daysLeft === 0) {

    return '⚠ Expires today';

  }


  if (daysLeft <= 3) {

    return (
      `⚠ Expires in ${daysLeft} ` +
      `${daysLeft === 1 ? 'day' : 'days'}`
    );

  }


  return expiryDate;

}


// ======================================
// #16 RECIPE INGREDIENT VALIDATION
// ======================================

function validateRecipeIngredients(
  ingredients
) {

  const problems = [];


  ingredients.forEach(
    ingredient => {

      const item =
        findItem(
          ingredient.name
        );


      // Ingredient does not exist
      if (!item) {

        problems.push(
          `${ingredient.name} is not in inventory.`
        );

        return;
      }


      // Quantity must be greater than 0
      if (
        !Number.isFinite(
          ingredient.qty
        ) ||
        ingredient.qty <= 0
      ) {

        problems.push(
          `${ingredient.name} must have a quantity greater than 0.`
        );

        return;
      }


      // Check whether enough inventory exists
      if (
        ingredient.qty >
        item.quantity
      ) {

        problems.push(
          `Not enough ${item.name}. ` +
          `Recipe needs ${ingredient.qty} ${item.unit}, ` +
          `but inventory only has ${item.quantity} ${item.unit}.`
        );

      }

    }
  );


  return problems;

}


// ======================================
// RENDER
// ======================================

function render() {

  const low =
    state.inventory.filter(
      item =>
        item.quantity <=
        item.threshold
    );


  document
    .querySelector(
      '#inventoryValue'
    )
    .textContent =

      money(
        state.inventory.reduce(
          (sum, item) =>
            sum +
            item.quantity *
            item.cost,

          0
        )
      );


  document
    .querySelector(
      '#lowStockCount'
    )
    .textContent =
      low.length;


  const avg =
    state.recipes.length

      ? state.recipes.reduce(
          (sum, recipe) =>

            sum +
            recipeCost(recipe) /
            recipe.price *
            100,

          0
        ) /
        state.recipes.length

      : 0;


  document
    .querySelector(
      '#averageFoodCost'
    )
    .textContent =
      `${avg.toFixed(1)}%`;


  const month =
    new Date()
      .toISOString()
      .slice(0, 7);


  document
    .querySelector(
      '#purchaseTotal'
    )
    .textContent =

      money(

        state.purchases

          .filter(
            purchase =>
              purchase.date
                .startsWith(month)
          )

          .reduce(
            (sum, purchase) =>

              sum +
              purchase.quantity *
              purchase.cost,

            0
          )

      );


  // ====================================
  // INVENTORY
  // ====================================

  const query =
    document
      .querySelector(
        '#inventorySearch'
      )
      .value
      .toLowerCase();


  const items =
    state.inventory.filter(
      item =>

        (
          activeFilter === 'all' ||
          item.quantity <=
            item.threshold
        )

        &&

        item.name
          .toLowerCase()
          .includes(query)

    );


  document
    .querySelector(
      '#inventoryRows'
    )
    .innerHTML =

      items.map(
        item => `

          <tr>

            <td>
              ${item.name}
            </td>

            <td>
              ${item.quantity}
              ${item.unit}
            </td>

            <td>
              ${money(item.cost)}
            </td>

            <td>
              ${getExpiryStatus(
                item.expiryDate
              )}
            </td>

            <td>

              <span
                class="badge ${
                  item.quantity <=
                  item.threshold
                    ? 'low'
                    : ''
                }"
              >

                ${
                  item.quantity <=
                  item.threshold
                    ? 'Low stock'
                    : 'In stock'
                }

              </span>

            </td>

            <td>

              <button
                class="icon-button"
                title="Edit ${item.name}"
                data-edit="${item.id}"
              >
                Edit
              </button>

              <button
                class="icon-button"
                title="Delete ${item.name}"
                data-delete="${item.id}"
              >
                ×
              </button>

            </td>

          </tr>

        `
      )
      .join('')

      ||

      `

        <tr>

          <td
            colspan="6"
            class="empty"
          >
            No matching ingredients.
          </td>

        </tr>

      `;


  // ====================================
  // RECIPES
  // ====================================

  document
    .querySelector(
      '#recipeCards'
    )
    .innerHTML =

      state.recipes.map(
        recipe => {

          const cost =
            recipeCost(recipe);


          const food =
            cost /
            recipe.price *
            100;


          return `

            <article class="recipe">

              <div class="recipe-title">

                <h3>
                  ${recipe.name}
                </h3>

                <button
                  class="icon-button"
                  title="Remove ${recipe.name}"
                  data-delete-recipe="${recipe.id}"
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

                Menu price
                ${money(recipe.price)}
                ·
                Food cost
                ${food.toFixed(1)}%

              </p>


              <div class="meter">

                <i
                  style="
                    width:
                    ${Math.min(food, 100)}%
                  "
                ></i>

              </div>


              <p>

                ${
                  recipe.ingredients

                    .map(
                      ingredient =>

                        `${ingredient.qty} ${
                          findItem(
                            ingredient.name
                          )?.unit || ''
                        } ${ingredient.name}`

                    )

                    .join(' · ')
                }

              </p>

            </article>

          `;

        }
      )
      .join('')

      ||

      `

        <p class="empty">
          No recipes yet.
        </p>

      `;


  // ====================================
  // PURCHASES
  // ====================================

  document
    .querySelector(
      '#purchaseList'
    )
    .innerHTML =

      state.purchases

        .slice()

        .reverse()

        .map(
          purchase => `

            <article class="purchase">

              <span class="purchase-date">
                ${purchase.date}
              </span>

              <div>

                <b>

                  ${purchase.item}
                  ·
                  ${purchase.quantity}
                  ${
                    findItem(
                      purchase.item
                    )?.unit ||
                    'units'
                  }

                </b>

                <small>

                  ${purchase.supplier}
                  ·
                  ${money(
                    purchase.cost
                  )}
                  per unit

                </small>

              </div>

              <span class="amount">

                ${money(
                  purchase.quantity *
                  purchase.cost
                )}

              </span>

            </article>

          `
        )
        .join('')

      ||

      `

        <p class="empty">
          No purchases logged.
        </p>

      `;


  document
    .querySelector(
      '#purchaseItem'
    )
    .innerHTML =

      state.inventory
        .map(
          item =>
            `<option>${item.name}</option>`
        )
        .join('');

}


// ======================================
// CHAT
// ======================================

function addChat(
  text,
  type = 'bot'
) {

  const element =
    document.createElement(
      'div'
    );


  element.className =
    `${type}-message`;


  element.textContent =
    text;


  document
    .querySelector(
      '#chatLog'
    )
    .append(element);


  element.parentElement.scrollTop =
    element.parentElement
      .scrollHeight;

}


function handleAssistant(raw) {

  const text =
    raw.trim();


  const lower =
    text.toLowerCase();


  if (!text) return;


  addChat(
    text,
    'user'
  );


  if (
    /low stock|low-stock|needs attention/
      .test(lower)
  ) {

    const low =
      state.inventory.filter(
        item =>
          item.quantity <=
          item.threshold
      );


    addChat(

      low.length

        ? `Low stock: ${
            low.map(
              item =>
                `${item.name} (${item.quantity} ${item.unit}, reorder at ${item.threshold})`
            )
            .join('; ')
          }.`

        : 'Everything is above its reorder level.'

    );


    return;

  }


  if (
    /cost|food cost/
      .test(lower)
  ) {

    const requested =
      lower

        .replace(
          /calculate|what(?:'s| is)|the|cost|of|food/gi,
          ''
        )

        .trim()

        .split(/\s+/)

        .filter(Boolean);


    const match =
      state.recipes.find(
        recipe =>

          requested.every(
            word =>
              recipe.name
                .toLowerCase()
                .includes(word)
          )

      );


    if (match) {

      const cost =
        recipeCost(match);


      addChat(

        `${match.name} costs ` +
        `${money(cost)} per serving. ` +
        `At a ${money(match.price)} menu price, ` +
        `food cost is ` +
        `${(
          cost /
          match.price *
          100
        ).toFixed(1)}%.`

      );

    } else {

      addChat(

        `I couldn't match a recipe. ` +
        `Available recipes: ` +
        `${state.recipes
          .map(
            recipe =>
              recipe.name
          )
          .join(', ')}.`

      );

    }


    return;

  }


  const purchase =
    lower.match(
      /(?:record )?purchase\s+(\d+(?:\.\d+)?)\s+(\w+)\s+(.+?)\s+at\s+\$?(\d+(?:\.\d+)?)(?:\s+from\s+(.+))?$/
    );


  const add =
    lower.match(
      /add\s+(\d+(?:\.\d+)?)\s+(\w+)\s+(.+?)\s+at\s+\$?(\d+(?:\.\d+)?)$/
    );


  const parsed =
    purchase || add;


  if (parsed) {

    const [
      ,
      quantity,
      unit,
      name,
      cost,
      supplier
    ] = parsed;


    let item =
      findItem(name);


    if (!item) {

      item = {

        id: Date.now(),

        name:
          name.replace(
            /\b\w/g,
            character =>
              character.toUpperCase()
          ),

        quantity: 0,

        unit,

        cost:
          Number(cost),

        threshold:
          Number(quantity) / 2,

        expiryDate: ''

      };


      state.inventory.push(
        item
      );

    }


    item.quantity +=
      Number(quantity);


    item.cost =
      Number(cost);


    if (purchase) {

      state.purchases.push({

        id: Date.now(),

        date:
          new Date()
            .toISOString()
            .slice(0, 10),

        item:
          item.name,

        quantity:
          Number(quantity),

        cost:
          Number(cost),

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
      }: ` +
      `${quantity} ${unit} ` +
      `${item.name} at ` +
      `${money(cost)} each.`

    );


    return;

  }


  addChat(
    'I can help with low stock, recipe costs, adding inventory, and recording purchases.'
  );

}


// ======================================
// OPEN DIALOGS
// ======================================

document
  .querySelectorAll(
    '[data-open]'
  )
  .forEach(
    button => {

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

    }
  );


// ======================================
// SEARCH
// ======================================

document
  .querySelector(
    '#inventorySearch'
  )
  .addEventListener(
    'input',
    render
  );


// ======================================
// FILTER
// ======================================

document
  .querySelectorAll(
    '.chip'
  )
  .forEach(
    button => {

      button.addEventListener(
        'click',
        () => {

          activeFilter =
            button.dataset.filter;


          document
            .querySelectorAll(
              '.chip'
            )
            .forEach(
              chip =>

                chip.classList.toggle(
                  'active',
                  chip === button
                )

            );


          render();

        }
      );

    }
  );


// ======================================
// #14 EDIT / DELETE INVENTORY
// ======================================

document
  .querySelector(
    '#inventoryRows'
  )
  .addEventListener(
    'click',
    event => {


      if (
        event.target.dataset.edit
      ) {

        const id =
          Number(
            event.target.dataset.edit
          );


        const item =
          state.inventory.find(
            item =>
              item.id === id
          );


        if (!item) return;


        const form =
          document.querySelector(
            '#editInventoryForm'
          );


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


        form.elements.expiryDate.value =
          item.expiryDate || '';


        document
          .querySelector(
            '#editInventoryDialog'
          )
          .showModal();


        return;

      }


      if (
        event.target.dataset.delete
      ) {

        const id =
          Number(
            event.target.dataset.delete
          );


        state.inventory =
          state.inventory.filter(
            item =>
              item.id !== id
          );


        save();

        render();

      }

    }
  );


// ======================================
// SAVE INVENTORY EDIT
// ======================================

document
  .querySelector(
    '#editInventoryForm'
  )
  .addEventListener(
    'submit',
    event => {

      event.preventDefault();


      const form =
        event.target;


      const id =
        Number(
          form.elements.id.value
        );


      const item =
        state.inventory.find(
          item =>
            item.id === id
        );


      if (!item) return;


      item.name =
        form.elements.name
          .value
          .trim();


      item.quantity =
        Number(
          form.elements.quantity
            .value
        );


      item.unit =
        form.elements.unit
          .value
          .trim();


      item.cost =
        Number(
          form.elements.cost
            .value
        );


      item.threshold =
        Number(
          form.elements.threshold
            .value
        );


      item.expiryDate =
        form.elements.expiryDate
          .value;


      save();

      render();


      document
        .querySelector(
          '#editInventoryDialog'
        )
        .close();

    }
  );


// ======================================
// ADD INVENTORY
// ======================================

document
  .querySelector(
    '#inventoryForm'
  )
  .addEventListener(
    'submit',
    event => {

      event.preventDefault();


      const data =
        Object.fromEntries(
          new FormData(
            event.target
          )
        );


      state.inventory.push({

        id: Date.now(),

        name:
          data.name.trim(),

        quantity:
          Number(
            data.quantity
          ),

        unit:
          data.unit.trim(),

        cost:
          Number(
            data.cost
          ),

        threshold:
          Number(
            data.threshold
          ),

        expiryDate:
          data.expiryDate

      });


      save();

      render();


      event.target
        .closest('dialog')
        .close();


      event.target.reset();

    }
  );


// ======================================
// ISSUE #16
// ADD RECIPE + VALIDATE INGREDIENTS
// ======================================

document
  .querySelector(
    '#recipeForm'
  )
  .addEventListener(
    'submit',
    event => {

      event.preventDefault();


      const data =
        Object.fromEntries(
          new FormData(
            event.target
          )
        );


      // Convert the ingredient text
      // into ingredient objects.
      //
      // Example:
      // Chicken breast:0.5, Tomatoes:0.2

      const ingredients =
        data.ingredients

          .split(',')

          .map(
            value => {

              const parts =
                value
                  .trim()
                  .split(':');


              // Invalid format
              if (
                parts.length !== 2
              ) {

                return {
                  name: '',
                  qty: NaN
                };

              }


              return {

                name:
                  parts[0]
                    .trim(),

                qty:
                  Number(
                    parts[1]
                      .trim()
                  )

              };

            }
          );


      // Check formatting first.

      const invalidFormat =
        ingredients.some(
          ingredient =>

            !ingredient.name ||

            !Number.isFinite(
              ingredient.qty
            )

        );


      if (
        !ingredients.length ||
        invalidFormat
      ) {

        alert(

          'Please enter ingredients using this format:\n\n' +
          'Chicken breast:0.5, Tomatoes:0.2'

        );


        return;

      }


      // ==================================
      // VALIDATE AGAINST INVENTORY
      // ==================================

      const problems =
        validateRecipeIngredients(
          ingredients
        );


      // If anything is wrong,
      // do not create the recipe.

      if (
        problems.length > 0
      ) {

        alert(

          'Recipe cannot be added:\n\n' +
          problems.join('\n')

        );


        return;

      }


      // All validation passed.
      // Save recipe.

      state.recipes.push({

        id: Date.now(),

        name:
          data.name.trim(),

        price:
          Number(
            data.price
          ),

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


// ======================================
// DELETE RECIPE
// ======================================

document
  .querySelector(
    '#recipeCards'
  )
  .addEventListener(
    'click',
    event => {

      if (
        event.target.dataset
          .deleteRecipe
      ) {

        const id =
          Number(
            event.target.dataset
              .deleteRecipe
          );


        state.recipes =
          state.recipes.filter(
            recipe =>
              recipe.id !== id
          );


        save();

        render();

      }

    }
  );


// ======================================
// PURCHASE
// ======================================

document
  .querySelector(
    '#purchaseForm'
  )
  .addEventListener(
    'submit',
    event => {

      event.preventDefault();


      const data =
        Object.fromEntries(
          new FormData(
            event.target
          )
        );


      const item =
        findItem(
          data.item
        );


      if (!item) return;


      item.quantity +=
        Number(
          data.quantity
        );


      item.cost =
        Number(
          data.cost
        );


      state.purchases.push({

        id: Date.now(),

        date:
          new Date()
            .toISOString()
            .slice(0, 10),

        item:
          data.item,

        quantity:
          Number(
            data.quantity
          ),

        cost:
          Number(
            data.cost
          ),

        supplier:
          data.supplier

      });


      save();

      render();


      event.target
        .closest('dialog')
        .close();


      event.target.reset();

    }
  );


// ======================================
// ASSISTANT
// ======================================

document
  .querySelector(
    '#assistantForm'
  )
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


document
  .querySelectorAll(
    '[data-prompt]'
  )
  .forEach(
    button => {

      button.addEventListener(
        'click',
        () =>

          handleAssistant(
            button.dataset.prompt
          )

      );

    }
  );


// ======================================
// RESET
// ======================================

document
  .querySelector(
    '#resetButton'
  )
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


// ======================================
// START
// ======================================

render();