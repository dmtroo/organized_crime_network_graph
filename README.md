# Organized Crime Map

This is a dashboard of the HCSS Parliament corpus developed for five countries: the United Kingdom, Italy, France, the Netherlands, and Belgium.

The dashboard consists of 3 tabs: 
### - Statistics
The tabular format there presents the corpora's raw statistics (number of documents and sentences) and its NLP findings (number of Noun Phrases and Named Entities).
### - Visualized Statistics
The statistics of the same corpora are visually presented through charts. Filters include country, date range, type of statistic, chart format, and data view (raw, accumulated, normalized).
### - Network Graph
A network graph visualizes the concurrences of Named Entities (NE) and Noun Phrases (NP) in each sentence of the corpora for the selected country. The tab has interactive tools including a search tool in the right menu and a filter designed specifically for the task on the left. To use the filter type percentage (optional), select "Target node type" then search the node of the selected type through the search tool in the right menu, after that select "Connected node type" from the available on that graph visualization and "Edge type" - new, middle or old, depending on the calculated average age of two connected nodes.


The code includes a Cytoscape.js-powered demo app at https://github.com/cytoscape/wineandcheesemap. The repository is MIT-licensed, just like Cytoscape.js.

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

