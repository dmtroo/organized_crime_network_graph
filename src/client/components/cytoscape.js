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

    cy.on('tap', this.onTap = async e => {
      this.setState({ loading: true }, () => {
        setTimeout(async () => {
            if (e.target === cy) {
              await controller.unhighlight();
              await controller.hideInfo();
              await controller.closeMenu();
            } else {
              await controller.highlight(e.target);
              await controller.showInfo(e.target);
              await controller.closeMenu();
            }
            this.setState({loading: false});
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