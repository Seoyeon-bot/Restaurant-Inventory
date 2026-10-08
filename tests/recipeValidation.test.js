const { validateRecipeIngredients } = require('../recipeValidation');

describe('Recipe ingredient validation', () => {
  let inventory;
  let findItem;
  beforeEach(() => {
    inventory = [
      { name: 'Eggs', quantity: 5, unit: 'pieces' },
      { name: 'Milk', quantity: 2, unit: 'liters' },
      { name: 'Flour', quantity: 10, unit: 'cups' }
    ];
    findItem = name => inventory.find(item => item.name.toLowerCase() === name.toLowerCase());
  });
  const insufficient = 'Not enough Eggs. Recipe needs 10 pieces, but inventory only has 5 pieces.';
  test('accepts sufficient inventory', () => {
    expect(validateRecipeIngredients([{ name: 'Eggs', qty: 2 }, { name: 'Milk', qty: 1 }], findItem)).toEqual([]);
  });
  test('reports insufficient inventory', () => {
    expect(validateRecipeIngredients([{ name: 'Eggs', qty: 10 }], findItem)).toEqual([insufficient]);
  });
  test('reports a missing ingredient', () => {
    expect(validateRecipeIngredients([{ name: 'Butter', qty: 2 }], findItem)).toEqual(['Butter is not in inventory.']);
  });
  test('accepts an exact quantity', () => {
    expect(validateRecipeIngredients([{ name: 'Eggs', qty: 5 }], findItem)).toEqual([]);
  });
  test.each([0, -2, NaN, Infinity, -Infinity, '2', undefined, null])('rejects invalid quantity %p', qty => {
    expect(validateRecipeIngredients([{ name: 'Milk', qty }], findItem)).toEqual(['Milk must have a quantity greater than 0.']);
  });
  test('returns all problems in ingredient order', () => {
    expect(validateRecipeIngredients([
      { name: 'Eggs', qty: 10 }, { name: 'Butter', qty: 2 }, { name: 'Milk', qty: 0 }, { name: 'Flour', qty: 1 }
    ], findItem)).toEqual([insufficient, 'Butter is not in inventory.', 'Milk must have a quantity greater than 0.']);
  });
  test('checks missing ingredients before quantity, as the original does', () => {
    expect(validateRecipeIngredients([{ name: 'Butter', qty: 0 }], findItem)).toEqual(['Butter is not in inventory.']);
  });
  test('accepts an empty list, as the original does', () => {
    expect(validateRecipeIngredients([], findItem)).toEqual([]);
  });
  test('supports the existing case-insensitive inventory lookup', () => {
    expect(validateRecipeIngredients([{ name: 'eGgS', qty: 5 }], findItem)).toEqual([]);
  });
  test('reads updated inventory and does not consume ingredients', () => {
    inventory[0].quantity = 10;
    const ingredients = [{ name: 'Eggs', qty: 10 }];
    expect(validateRecipeIngredients(ingredients, findItem)).toEqual([]);
    expect(inventory[0].quantity).toBe(10);
    expect(ingredients).toEqual([{ name: 'Eggs', qty: 10 }]);
  });
});
