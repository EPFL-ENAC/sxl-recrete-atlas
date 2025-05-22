# Atlas of reused concrete projects
An interactive database on concrete structural reuse in construction

## Data source

- The main data is comming from [this file](https://github.com/EPFL-ENAC/sxl-recrete-atlas/blob/main/src/assets/data/data.csv) (which is directly used by the app for the table, map)
   - You can replace it directly on github by uploading a new data.csv file in [this directory](https://github.com/EPFL-ENAC/sxl-recrete-atlas/blob/main/src/assets/data)
- The images defined in the data.csv should be placed in [this directory](https://github.com/EPFL-ENAC/sxl-recrete-atlas/blob/main/public/images)
- The filters and their behavior is define here in [this file](https://github.com/EPFL-ENAC/sxl-recrete-atlas/blob/main/src/assets/data/keys.csv)
- The references is define here in  [this file](https://github.com/EPFL-ENAC/sxl-recrete-atlas/blob/main/src/assets/data/references.csv)


## Configuration

Two external json files to load configuration in [`.env`](.env) :

- **VITE_PARAMETERS_URL**: Webmap parameters following [this JSON Schema](schema/parameters.schema.json)
- **VITE_STYLE_URL**: [MapLibre style](https://maplibre.org/maplibre-style-spec)


## Project Dependencies Overview

This project is built with [Vue.js](https://vuejs.org/) (v3) and utilizes [Vuetify](https://vuetifyjs.com/) as its primary UI component framework.

*   **Core Vue Ecosystem:**
    *   [Pinia](https://pinia.vuejs.org/): For reactive state management.
    *   [Vue Router](https://router.vuejs.org/): For client-side navigation.
    *   [Vue I18n](https://vue-i18n.intlify.dev/): For internationalization.
    *   [@vueuse/core](https://vueuse.org/): A collection of essential Vue Composition API utilities.
    *   [Floating Vue](https://floating-vue.starpad.dev/): For tooltips and popovers.
*   **Mapping & Data Visualization:**
    *   [MapLibre GL JS](https://maplibre.org/): For rendering interactive vector maps.
*   **Data Handling & Utilities:**
    *   [Axios](https://axios-http.com/): For making HTTP requests to fetch data.
    *   [Marked](https://marked.js.org/): For parsing Markdown content, with [marked-emoji](https://github.com/UziTech/marked-emoji) for emoji support.
    *   [DOMPurify](https://github.com/cure53/DOMPurify): For sanitizing HTML to prevent XSS attacks.
    *   [JSZip](https://stuk.github.io/jszip/): For creating and managing .zip files, used for data bundling.
    *   [csvtojson](https://github.com/Keyang/node-csvtojson): Used in the convert.js script to convert CSV data files into JSON format during the pre-build/pre-development steps.
    *   [vue3-cookies](https://github.com/KanHarI/vue3-cookies): For managing browser cookies.
*   **Development & Build Tooling:**
    *   [Vite](https://vitejs.dev/): As the frontend build tool and development server.
    *   [Vitest](https://vitest.dev/): For running unit tests.
    *   [TypeScript](https://www.typescriptlang.org/): For adding static types to JavaScript.
    *   [ESLint](https://eslint.org/): For code linting to maintain code quality.
    *   [Prettier](https://prettier.io/): For code formatting.
    *   [Stylelint](https://stylelint.io/): For linting CSS and SCSS styles.
    *   ImageMagick: Utilized via the optimize-images.sh script to optimize images by resizing and converting them to WebP format.
    *   [Rimraf](https://github.com/isaacs/rimraf): Used in the `clean-optimize-images` script for deleting files and folders.
    *   [npm-run-all](https://github.com/mysticatea/npm-run-all): To run multiple npm scripts in parallel or sequentially (e.g., in the `build` script).
    *   [Lefthook](https://github.com/evilmartians/lefthook): For managing Git hooks.
    *   [Commitlint](https://commitlint.js.org/): For linting commit messages.


## Development Guidelines

### Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for standardized commit messages. The format helps with automated versioning and changelog generation:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types include: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, and `chore`.

A commit template is available (`.gitmessage`) with examples of correctly formatted commit messages.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
