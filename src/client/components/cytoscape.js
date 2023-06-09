import { h, Component } from 'preact';
import Loader from "./loader";

class CytoscapeComponent extends Component {
  constructor(props){
    super(props);
    this.state = {
      loading: false
    };
  }

  render() {
    return h('div', { id: 'cy' }, this.state.loading ? h(Loader) : null);
  }

  componentDidMount(){
    const { cy, controller } = this.props;
    const container = document.getElementById('cy');

    cy.mount(container);
    cy.fit(10);

    cy.on('tap', this.onTap = e => {
      this.setState({ loading: true }, () => {
        setTimeout(() => {
          if( e.target === cy ) {
            controller.unhighlight();
            controller.hideInfo();
            controller.closeMenu();
          } else {
            controller.highlight(e.target);
            controller.showInfo(e.target);
            controller.closeMenu();
          }
          this.setState({ loading: false });
        }, 0);
      });
    });
  }

  componentWillUnmount(){
    const { cy } = this.props;

    cy.removeListener('tap', this.onTap);
  }
}

export default CytoscapeComponent;
export { CytoscapeComponent };