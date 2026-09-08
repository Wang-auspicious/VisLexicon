# Evidence-backed coverage notes

Date: 2026-09-08

## Official component-system evidence

| Source | What it proves | Atlas gap it motivates |
|---|---|---|
| https://base-ui.com/ | Modern headless systems emphasize composability, accessibility, Combobox/Autocomplete, input scrubbing, nested dialogs, hover menus, WCAG 2.2 | command/combobox, nested overlays, input formatting, advanced focus behavior |
| https://www.radix-ui.com/themes/docs/components | Component inventories include alert dialog, aspect ratio, avatar, badge, callout, checkbox cards and other production primitives | feedback surfaces, media ratio, multi-select cards, status messaging |
| https://mui.com/material-ui/all-components/ | Current inventory separates inputs, data display and complex controls, including autocomplete, transfer list, rating, select, slider, table and pagination | table, transfer, rating, pagination, autocomplete and data-display states |
| https://react-aria.adobe.com/ | Style-free components expose interaction behavior for custom design systems | keyboard, focus, selection, internationalisation and state variants |
| https://developer.blackbaud.com/skyux/components/data-grid | Data grids need multiselect, context actions, sortable columns, row/column reordering and resizing | data management behaviors beyond a static table |
| https://design-patterns.service.justice.gov.uk/components/date-picker/ | Date selection must support direct typing, keyboard use, excluded dates, min/max and validation errors | calendar/date validation and recoverable errors |

## Editorial conclusions

1. The first expansion batch should not be more visual effects. It should cover stateful component behavior: focus, keyboard, selection, validation, async, filtering, bulk actions, undo/redo, and error recovery.
2. A component name alone is insufficient. Each entry should describe an observable behavior and distinguish its trigger, state, feedback, and recovery path.
3. The current duplicate-title report (141 groups) is a review queue, not an automatic deletion list. The same title can remain when its scope, state, or implementation contract differs; otherwise it should be merged.
4. Real website screenshots should be collected from official product pages or identifiable live sites and attached to a style entry with URL, capture date, viewport and evidence note. The 14 anonymous ZIP images are not automatically attributable.
