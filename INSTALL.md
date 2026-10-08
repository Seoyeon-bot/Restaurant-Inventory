# Install the recipe validation fix

This package was prepared from your actual Restaurant-Inventory project. Your original project was not modified.

1. Back up your current script.js, index.html, and tests/recipeValidation.test.js outside the project.
2. Copy script.js, recipeValidation.js, index.html, and jest.config.cjs from this package into your existing project root. Replace script.js and index.html when prompted.
3. Replace tests/recipeValidation.test.js with the supplied file. Do not keep the old test under another .test.js name: Jest would run it too.
4. Keep your existing style.css, package.json, and package-lock.json. The package copies of the latter two are unchanged references; your package.json already specifies Jest 29.7 and the test command.
5. In a terminal, open your existing project directory and run:

```bash
npm install
npm test
```

All 17 tests should pass. The verified module line coverage is 94.11%, above 70%. For the assignment, take your own screenshot of the passing output and coverage table. Open coverage/index.html for the detailed HTML report.

## Browser loading

The supplied index.html adds this one line immediately before the existing script tag:

```html
<script src="recipeValidation.js"></script>
<script src="script.js"></script>
```

Keep that order and do not add async. Both files must be next to index.html. Refresh the app at its usual URL; keep using the same browser and URL so its existing localStorage remains available.

Try adding a recipe with an existing ingredient in an exact available quantity, then try an excessive quantity and a missing ingredient. The exact quantity should succeed; the others should show the original error messages. Existing inventory, purchases, editing, expiry tracking, and rendering code is unchanged.

## What changed

script.js keeps its original one-argument validateRecipeIngredients wrapper and passes the existing findItem lookup into the shared module. That lookup reads the current inventory, including after edits and resets. The validation rules, error text, and validation order are unchanged. Tests import only recipeValidation.js, so they do not execute browser storage or DOM code. There is no duplicate validation implementation.

The unit tests cover sufficient, insufficient, missing, exact, invalid, and multiple ingredients, empty lists, case-insensitive lookup, and inventory updates. Jest coverage is scoped to recipeValidation.js, not the whole browser app. Its only uncovered line in the Jest run is the browser export. The validation function's executable lines are all covered. No coverage exclusions were added.

The Jest configuration uses the installed Node test environment and a 71% line threshold. Watchman is disabled so these one-off tests do not depend on a separate filesystem-watching service.

Configuration reference: https://jestjs.io/docs/29.7/configuration

## Verification performed

- Jest 29.7: 17 tests passed; module lines/statements 94.11%, branches 91.66%, functions 100%.
- Original and corrected app compared with a simulated DOM: matching initial render, seven recipe submissions, persisted state, and reset.
- This is not a full interactive browser test; perform the browser checks above after installation.

The included test-results.txt and coverage folder record the local verification. You do not need to copy them into the project; npm test generates fresh coverage.

For the later intentional-bug assignment step, change the comparison in recipeValidation.js, where the shared implementation now lives. Keep the tests unchanged. This package contains the working version only.
