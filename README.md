# Organized Crime Map

This is an app of all Named Entities' and Noun Phrases' cooccurrences in HCSS Team Ukraine Parlamint corpora.

Countries presented: United Kingdom, Italy, France, Netherlands, Belgium.

The code includes parts Cytoscape.js-powered demo app at https://github.com/cytoscape/wineandcheesemap (repository is MIT-licensed, like Cytoscape.js itself.)


## Project organisation

The technologies used for this project include:

- Building
  - Webpack: Bundle JS
  - PostCSS: Bundle CSS
  - Babel: Compile newer JS to older JS to support older browsers
  - CSSNext: Compile newer CSS to older CSS to support older browsers
- UI
  - Preact: Basic component support
  - Cytoscape: Graph/network visualisation
- Linting
  - ESLint: Identify common problems in JS
  - Stylelint: Identify common problems in CSS

## Building the project

The project's build targets are specified as npm scripts.  Use `npm run <target>` for one of the following targets:

- `watch` : Do a debug build of the app, which automatically rebuilds and reloads as the code changes
- `prod` : Do a production build of the app
- `clean` : Delete all files under the dist directory
- `lint` : Run linters on the JS and CSS files

