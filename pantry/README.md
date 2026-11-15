# Pantry Playground — The Cupboard Cookbook

Eight original pantry-oriented recipe ideas, drawn as CSS plates and designed around a practical loop: pick what you have, find a dish, collect what is missing, then cook it.

## Run

Serve the extracted project root (the directory containing `shared/` and `pantry/`) with an HTTP server:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/pantry/`. There are no packages, API keys, remote assets, analytics, or backend services.

## What is included

- Eight recipes: shakshuka, kimchi rice, tomato and caper pasta, smashed cucumbers, lemony white beans, garlic mushroom toast, scallion eggs over rice, and tomato rice soup.
- Pantry selections grouped into tins/jars, fresh ingredients, and cupboard staples. The optional basics switch means exactly olive oil, neutral oil, salt, pepper, and sugar. Water is always assumed available.
- Matching based on every unique ingredient, not just headline tags. Results sort by the fraction of ingredients available, then the number missing.
- Search by recipe or ingredient, a preparation-time filter, meals/sides filter, and saved favorites.
- Serving sizes of 1, 2, 4, or 6, with exact internal quantities and readable kitchen fractions. Water quantities scale too. Dish cooking times do not automatically multiply with serving size.
- A dinner draw: it respects filters and favors the best pantry matches when explicit ingredients are selected. It avoids the last selection when its candidate pool has alternatives.
- A combined shopping list. Repeated ingredients with the same units are summed across dishes; available ingredients are omitted. Recipe selections, serving changes, and pantry changes update the list.
- Shopping-list checkboxes, clipboard copy, and a plain-text download fallback.
- Recipe prep checkboxes, completed cooking steps, and optional step timers. A timer uses a wall-clock deadline so backgrounding does not slow its countdown. Timers are silent and are not retained on reload; keep the page open and follow the recipe’s doneness cues.
- A focused recipe print layout, with serving size, quantities, instructions, and notes. Checked-off items and completed steps still print at full contrast.

## Accessibility and mobile behavior

The collection has labelled search/filter controls. Pantry and favorite buttons expose their pressed state. Recipes use a native modal dialog with a labelled heading, Escape support, an explicit close button, and focus restoration. If a collection rerender removes the opening element, focus returns to the dinner-draw button. The recipe dialog is a direct child of the document body so print styles cannot hide its ancestor. The timer moves into the modal while it is open to remain interactive, then returns to the page after close. Touch targets and layout adapt down to 320-pixel viewports; reduced-motion preferences disable decorative motion.

## Local data

The app stores pantry choices, the basics toggle, favorite recipe IDs, shopping recipe IDs, shopping checkboxes, and servings in `localStorage` under `brandon-pantry-v2`. Restored values are validated against known ingredients and recipes. Invalid saved data falls back to defaults. If storage is unavailable, the app keeps working for that visit and shows a notice; export the shopping list before leaving.

Prep checkboxes, completed recipe steps, search/filter state, and timers are temporary. This is not a synced meal planner or an inventory quantity tracker: marking a pantry ingredient means “I have it,” not “I have enough for every selected dish.” All planned dishes use the selected serving size.

## Tests

From the repository/source-package root:

```sh
node --test tests/pantry.test.mjs
```

Nine tests cover recipe-data completeness, fractions and serving quantities, full-ingredient matching, exact basics behavior, search/time/favorites filters, shopping-list aggregation, corrupted persisted state, non-repeating dinner selection, and wall-clock timer arithmetic. Pure logic lives in `logic.js`; recipes and ingredient metadata live in `recipes.js`. `app.js` owns DOM behavior and `app.css` owns visuals/print styles.

## Validation limits

These are original recipe drafts, not recipes claimed to have been kitchen-tested. Ingredient brands, pan size, heat, and batch size change results. Timings are approximate; use the written cooking cues and ingredient-label directions. Portion scaling changes amounts, not cooking vessel capacity. Pantry matching is availability-based and does not infer substitutions, dietary suitability, or allergens. Food illustrations are decorative CSS rather than photos of a tested finished dish.

No redistribution license has been selected. Choose one before publishing an open-source repository.
