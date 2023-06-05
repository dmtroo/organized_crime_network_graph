import { h, Component } from 'preact';
import { Controller } from '../controller';
import Cytoscape from 'cytoscape';
import { elements, style } from '../cy-conf';
import CytoscapeComponent from './cytoscape';
import { isDev } from '../env';
import { NodeInfo } from './node-info';
import { Menu } from './menu';
import { LeftMenu } from './left-menu';
import gb_graph from '../../files/gb.json';
import fr_graph from '../../files/fr.json';
import it_graph from '../../files/it.json';
import nl_graph from '../../files/nl.json';
import be_graph from '../../files/be.json';

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

    this.state = { controller, cy, country: countryNameMap['GB'] };

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

  switchGraph(graphName) {
    let elements;
    switch(graphName) {
      case 'GB':
        elements = gb_graph;
        break;
      case 'FR':
        elements = fr_graph;
        break;
      case 'IT':
        elements = it_graph;
        break;
      case 'NL':
        elements = nl_graph;
        break;
      case 'BE':
        elements = be_graph;
        break;
    }

    this.setState({ country: countryNameMap[graphName] });

    elements.nodes.forEach((n) => {
      const data = n.data;

      data.NodeTypeFormatted = data.NodeType;
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
  }


  render(){
    const { cy, controller, infoNode, country } = this.state;

    return h('div', { class: 'app' }, [
      h(CytoscapeComponent, { cy, controller }),

      infoNode ? (
          h('div', { class: 'app-node-info' }, [
            h(NodeInfo, { node: infoNode })
          ])
      ) : null,

      h(Menu, { controller }),
      h(LeftMenu, { controller, switchGraph: this.switchGraph.bind(this) }),

      h('div', { class: 'app-country' }, country)
    ]);
  }
}

export default AppComponent;
export { AppComponent };
