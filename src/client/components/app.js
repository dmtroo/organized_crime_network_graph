import { h, Component } from 'preact';
import { Controller } from '../controller';
import Cytoscape from 'cytoscape';
import { elements, style } from '../cy-conf';
import CytoscapeComponent from './cytoscape';
import { isDev } from '../env';
import { NodeInfo } from './node-info';
import { Menu } from './menu';
import { LeftMenu } from './left-menu';
import pako from 'pako';

const countryNameMap = {
  'GB': 'United Kingdom',
  'FR': 'France',
  'IT': 'Italy',
  'NL': 'Netherlands',
  'BE': 'Belgium',
};

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

    this.state = { controller, cy, country: countryNameMap['GB'], node_types: ["ORG", "GPE", "PERSON", "NORP", "NP"] };


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

    this.state.cy.ready(() => {
      const strengths = this.state.cy.nodes().map(node => node.data('Strength'));

      strengths.sort((a, b) => a - b);

      // Get the threshold for top 2% nodes
      const threshold = strengths[Math.floor(strengths.length * 0.98)];

      const scaleFactor = 59;

      this.state.cy.on('zoom', () => {
        const zoom = this.state.cy.zoom();

        this.state.cy.nodes(`[Strength >= ${threshold}]`).forEach(node => {
          const fontSize = node.data('FontSize');

          node.style('font-size', ((12 / zoom) * fontSize) / scaleFactor);
        });
      });
      this.state.cy.trigger('zoom');
    });
  }

  componentWillUnmount(){
    const bus = this.state.controller.bus;

    bus.removeListener('showInfo', this.onShowInfo);
    bus.removeListener('hideInfo', this.onHideInfo);
    this.state.cy.removeListener('zoom');
  }

  async switchGraph(graphName) {
    let elements;

    switch(graphName) {
      case 'GB':
        elements = await fetch('src/files/gb.json').then(response => response.json());
        break;
      case 'FR':
        elements = await fetch('src/files/fr.json').then(response => response.json());
        break;
      case 'IT':
        elements = await fetch('src/files/it.json.gz')
            .then(response => response.arrayBuffer())
            .then(buffer => pako.inflate(buffer, { to: 'string' }))
            .then(jsonString => JSON.parse(jsonString));
        break;
      case 'NL':
        elements = await fetch('src/files/nl.json').then(response => response.json());
        break;
      case 'BE':
        elements = await fetch('src/files/be.json').then(response => response.json());
        break;
    }

    elements.nodes.forEach((n) => {
      const data = n.data;

      data.NodeTypeFormatted = data.NodeType;
      data.occur = data.cooccurrence;
      data.occur_doc = data.occur_in_documents;
      data.occur_sent = data.occur_in_sentences;
      data.sentencesToShow = data.sentences;

      n.data.orgPos = {
        x: n.position.x,
        y: n.position.y
      };

      data.name = data.name.replace(/[-]/g, '-\u200B');
    });

    this.state.cy.elements().remove();
    const addedElements = this.state.cy.add(elements);
    this.state.cy.layout({ name: 'preset' }).run();

    this.state.controller.initialElements = addedElements.jsons();
    const node_types = elements.node_types;

    // Invalidate the word cache
    this.state.controller.invalidateWordCache();

    this.setState({
      country: countryNameMap[graphName],
      node_types
    });
  }

  render(){
    const { cy, controller, infoNode, country, node_types } = this.state;

    return h('div', { class: 'app' }, [
      h(CytoscapeComponent, { cy, controller }),

      infoNode ? (
          h('div', { class: 'app-node-info' }, [
            h(NodeInfo, { node: infoNode })
          ])
      ) : null,

      h(Menu, { controller }),
      h(LeftMenu, { controller, switchGraph: this.switchGraph.bind(this), node_types }),

      h('div', { class: 'app-country' }, country)
    ]);
  }
}

export default AppComponent;
export { AppComponent };
