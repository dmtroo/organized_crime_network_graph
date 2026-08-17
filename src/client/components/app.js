import { h, Component } from 'preact';
import { Controller } from '../controller';
import Cytoscape from 'cytoscape';
import { elements, style } from '../cy-conf';
import CytoscapeComponent from './cytoscape';
import { isDev } from '../env';
import { NodeInfo } from './node-info';
import { Menu } from './menu';
import { LeftMenu } from './left-menu';
import Loader from './loader';
import pako from 'pako';

const countryNameMap = {
  'GB': 'United Kingdom',
  'FR': 'France',
  'IT': 'Italy',
  'NL': 'Netherlands',
  'BE': 'Belgium',
};

const graphFiles = {
  'GB': { preview: 'src/files/gb-preview.json', full: 'src/files/gb.json', gz: false },
  'FR': { preview: 'src/files/fr-preview.json', full: 'src/files/fr.json', gz: false },
  'IT': { preview: 'src/files/it-preview.json', full: 'src/files/it.json.gz', gz: true },
  'NL': { preview: 'src/files/nl-preview.json', full: 'src/files/nl.json', gz: false },
  'BE': { preview: 'src/files/be-preview.json', full: 'src/files/be.json', gz: false },
};

async function fetchGraphFile(path, gz) {
  if (gz) {
    const buffer = await fetch(path).then(response => response.arrayBuffer());
    const jsonString = pako.inflate(buffer, { to: 'string' });
    return JSON.parse(jsonString);
  }

  return fetch(path).then(response => response.json());
}

class AppComponent extends Component {
  constructor(props){
    super(props);

    const cy = new Cytoscape({
      elements,
      style,
      layout: { name: 'preset' },
      selectionType: 'single',
      boxSelectionEnabled: false
    });

    cy.nodes().panify().ungrabify();

    const controller = new Controller({ cy });
    const bus = controller.bus;

    if( isDev ){
      window.cy = cy;
      window.controller = controller;
    }

    this.state = {
      controller,
      cy,
      country: countryNameMap['GB'],
      node_types: ["ORG", "GPE", "PERSON", "NORP", "NP"],
      graphCode: 'GB',
      preview: null,
      isFullGraph: false,
      loadingFull: false
    };

    bus.on('showInfo', this.onShowInfo = (node => {
      this.setState({ infoNode: node });
    }));

    bus.on('hideInfo', this.onHideInfo = (() => {
      this.setState({ infoNode: null });
    }));
  }

  componentDidMount(){
    const bus = this.state.controller.bus;

    bus.on('showInfo', this.onShowInfo = (node => {
      this.setState({ infoNode: node });
    }));

    bus.on('hideInfo', this.onHideInfo = (() => {
      this.setState({ infoNode: null });
    }));

    this.loadGraph(this.state.graphCode, false);
  }

  componentWillUnmount(){
    const bus = this.state.controller.bus;

    bus.removeListener('showInfo', this.onShowInfo);
    bus.removeListener('hideInfo', this.onHideInfo);
    this.state.cy.removeListener('zoom');
  }

  // Recomputes the "top 2% of nodes get a zoom-scaled font" behavior for
  // whatever nodes are currently loaded. Needs to re-run after every graph
  // load (initial, country switch, or full-graph load), not just once,
  // since the node set changes each time.
  setupZoomFontScaling(){
    const { cy } = this.state;

    cy.removeListener('zoom');

    const strengths = cy.nodes().map(node => node.data('Strength'));

    if (strengths.length === 0) {
      return;
    }

    strengths.sort((a, b) => a - b);

    // Get the threshold for top 2% nodes
    const threshold = strengths[Math.floor(strengths.length * 0.98)];

    const scaleFactor = 160;

    cy.on('zoom', () => {
      const zoom = cy.zoom();

      cy.nodes(`[Strength >= ${threshold}]`).forEach(node => {
        const fontSize = node.data('FontSize');
        const minFontSize = node.data('FontSize');
        let calculatedFontSize = ((12 / zoom) * fontSize) / scaleFactor;

        if (calculatedFontSize < minFontSize) {
          calculatedFontSize = minFontSize;
        }
        node.style('font-size', calculatedFontSize);
      });
    });

    cy.trigger('zoom');
  }

  async loadGraph(graphName, full) {
    const files = graphFiles[graphName];
    const data = await fetchGraphFile(full ? files.full : files.preview, full ? files.gz : false);

    data.nodes.forEach((n) => {
      const nodeData = n.data;

      nodeData.translated_name = nodeData.translated;
      nodeData.NodeTypeFormatted = nodeData.NodeType;
      nodeData.occur = nodeData.cooccurrence;
      nodeData.occur_doc = nodeData.occur_in_documents;
      nodeData.occur_sent = nodeData.occur_in_sentences;
      nodeData.sentencesToShow = nodeData.sentences;

      n.data.orgPos = {
        x: n.position.x,
        y: n.position.y
      };

      nodeData.name = nodeData.name.replace(/[-]/g, '-​');
    });

    const { cy, controller } = this.state;

    cy.elements().remove();
    const addedElements = cy.add(data);
    cy.layout({ name: 'preset', fit: true, padding: 40 }).run();

    controller.initialElements = addedElements.jsons();
    controller.invalidateWordCache();

    this.setState({
      graphCode: graphName,
      country: countryNameMap[graphName],
      node_types: data.node_types,
      preview: data.preview || null,
      isFullGraph: full || !data.preview
    }, () => this.setupZoomFontScaling());
  }

  async switchGraph(graphName) {
    await this.loadGraph(graphName, false);
  }

  loadFullGraph() {
    this.setState({ loadingFull: true }, async () => {
      await this.loadGraph(this.state.graphCode, true);
      this.setState({ loadingFull: false });
    });
  }

  render(){
    const { cy, controller, infoNode, country, node_types, preview, isFullGraph, loadingFull } = this.state;

    return h('div', { class: 'app' }, [
      h(CytoscapeComponent, { cy, controller }),

      infoNode ? (
          h('div', { class: 'app-node-info' }, [
            h(NodeInfo, { node: infoNode })
          ])
      ) : null,

      h(Menu, { controller }),
      h(LeftMenu, { controller, switchGraph: this.switchGraph.bind(this), node_types }),

      preview && !isFullGraph ? (
        h('div', { class: 'app-preview-banner' }, [
          h('span', {},
            `Showing top ${preview.shownEdges.toLocaleString()} of ${preview.totalEdges.toLocaleString()} connections (${preview.shownNodes.toLocaleString()} of ${preview.totalNodes.toLocaleString()} entities), ranked by strength — a fast preview for this demo.`
          ),
          h('button', {
            onClick: () => this.loadFullGraph(),
            disabled: loadingFull
          }, loadingFull ? 'Loading full network…' : 'Load full network')
        ])
      ) : null,

      loadingFull ? h(Loader) : null,

      h('div', { class: 'app-country' }, country)
    ]);
  }
}

export default AppComponent;
export { AppComponent };