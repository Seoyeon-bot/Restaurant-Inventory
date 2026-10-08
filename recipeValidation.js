// Shared by the browser app and Jest. The lookup uses the caller's current inventory.
(function () {
function validateRecipeIngredients(
  ingredients,
  findItem
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

  const api = { validateRecipeIngredients };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    globalThis.RecipeValidation = api;
  }
})();
