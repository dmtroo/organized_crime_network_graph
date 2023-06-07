import { h, Component } from 'preact';
import { Controller } from '../controller';
import Cytoscape from 'cytoscape';
import { elements, style } from '../cy-conf';
import CytoscapeComponent from './cytoscape';
import { isDev } from '../env';
import { NodeInfo } from './node-info';
import { Menu } from './menu';
import { LeftMenu } from './left-menu';

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

  componentWillUnmount(){
    const bus = this.state.controller.bus;

    bus.removeListener('showInfo', this.onShowInfo);
    bus.removeListener('hideInfo', this.onHideInfo);
  }

  async switchGraph(graphName) {
    let elements;

    switch(graphName) {
      case 'GB':
        elements = await fetch('/files/gb.json').then(response => response.json());
        break;
      case 'FR':
        elements = await fetch('/files/fr.json').then(response => response.json());
        break;
      case 'IT':
        elements = await fetch('/files/it.json').then(response => response.json());
        break;
      case 'NL':
        elements = await fetch('/files/nl.json').then(response => response.json());
        break;
      case 'BE':
        elements = await fetch('/files/be.json').then(response => response.json());
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
