import {h, Component} from 'preact';
import classNames from 'classnames';
import {Loader} from "./loader";

class LeftMenu extends Component {
    constructor(props) {
        super(props);

        const {controller} = props;
        const {bus} = controller;

        this.state = {
            open: false,
            loading: false,
        };

        bus.on('openLeftMenu', this.onOpenLeftMenu = (() => {
            this.setState({open: true});
        }));

        bus.on('closeLeftMenu', this.onCloseLeftMenu = (() => {
            this.setState({open: false});
        }));
    }

    applyFilter() {
        this.setState({ loading: true }, () => {
            requestAnimationFrame(async () => {
                const {controller} = this.props;
                await controller.unhighlight();
                const percentage = document.getElementById('menu-filter-input').value;
                const connectedNodeType = document.getElementById('menu-filter-connected-node-type').value;
                const edgeColor = document.getElementById('menu-filter-edge-color').value;

                controller.applyFilter(percentage, connectedNodeType, edgeColor).then(() => {
                    this.setState({loading: false});
                });
            });
        });
    }

    componentWillUnmount() {
        const {bus} = this.props.controller;
        bus.removeListener('openLeftMenu', this.onOpenLeftMenu);
        bus.removeListener('closeLeftMenu', this.onCloseLeftMenu);
    }

    clearFields() {
        document.getElementById('menu-filter-input').value = '';
        document.getElementById('menu-filter-target-node').value = '';
        document.getElementById('menu-filter-connected-node-type').value = '';
        document.getElementById('menu-filter-edge-color').value = '';
    }

    resetFilter() {
        this.setState({ loading: true }, () => {
            requestAnimationFrame(() => {
                this.clearFields();
                const {controller} = this.props;
                controller.unhighlight();
                controller.hideInfo();
                controller.restoreInitialElements().then(() => {
                    this.setState({loading: false});
                });
            });
        });
    }

    handleGraphChange(event) {
        this.setState({ loading: true }, () => {
            requestAnimationFrame(() => {
                this.clearFields();
                const graphName = event.target.value;
                const {controller} = this.props;
                controller.unhighlight();
                console.log(graphName);
                this.props.switchGraph(graphName).then(() => {
                    this.setState({loading: false});
                });
            });
        });
    }

    handleTargetNodeType(event) {
        const targetNode = event.target.value;
        const {controller} = this.props;
        controller.setTargetNodeType(targetNode);
    }

    render() {
        const {controller, node_types} = this.props;
        const {open, loading} = this.state;
        const closed = !open;

        return h('div', {class: 'left-menu-parent'}, [
            h('div', {
                class: classNames({'left-menu-toggle': true, 'menu-open': open}),
                onClick: () => controller.toggleLeftMenu()
            }),
            h('div', {class: classNames({'left-menu': true, 'menu-closed': closed})}, [
                h('div', {class: 'menu-filter'}, [
                    h('label', {for: 'menu-graph-selector'}, 'Corpora:'),
                    h('select', {
                        id: 'menu-graph-selector',
                        name: 'menu-graph-selector',
                        onChange: this.handleGraphChange.bind(this)
                    }, [
                        h('option', {value: 'GB'}, 'GB'),
                        h('option', {value: 'FR'}, 'FR'),
                        h('option', {value: 'IT'}, 'IT'),
                        h('option', {value: 'NL'}, 'NL'),
                        h('option', {value: 'BE'}, 'BE'),
                    ]),
                ]),
                h('div', {class: 'divider'}, ''),
                h('div', {class: 'menu-filter'}, [
                    h('label', {for: 'menu-filter-input'}, 'Percentage:'),
                    h('input', {
                        type: 'number',
                        id: 'menu-filter-input',
                        name: 'menu-filter-input',
                        min: '0',
                        max: '100',
                        step: '1',
                    }),
                ]),
                h('div', {class: 'menu-filter'}, [
                    h('label', {for: 'menu-filter-target-node'}, 'Target node type:'),
                    h('select', {
                        id: 'menu-filter-target-node',
                        name: 'menu-filter-target-node',
                        onChange: this.handleTargetNodeType.bind(this)
                    }, [
                        h('option', {value: ''}, ''),
                        node_types.map(entity =>
                            h('option', {value: entity}, entity)
                        ),
                    ]),
                ]),
                h('div', {class: 'menu-filter'}, [
                    h('label', {for: 'menu-filter-connected-node-type'}, 'Connected node type:'),
                    h('select', {
                        id: 'menu-filter-connected-node-type',
                        name: 'menu-filter-connected-node-type',
                    }, [
                        h('option', {value: ''}, ''),
                        node_types.map(entity =>
                            h('option', {value: entity}, entity)
                        ),
                    ]),
                ]),
                h('div', {class: 'menu-filter'}, [
                    h('label', {for: 'menu-filter-edge-color'}, 'Edge Type:'),
                    h('select', {
                        id: 'menu-filter-edge-color',
                        name: 'menu-filter-edge-color',
                    }, [
                        h('option', {value: ''}, ''),
                        h('option', {value: 'green'}, 'New'),
                        h('option', {value: 'yellow'}, 'Middle'),
                        h('option', {value: 'red'}, 'Old'),
                    ]),
                ]),
                h('div', {class: 'menu-buttons'}, [
                    h('button', {
                        type: 'button',
                        onClick: () => this.resetFilter(),
                    }, 'Reset Filter'),
                    h('button', {
                        type: 'button',
                        onClick: () => this.applyFilter(),
                    }, 'Apply Filter')
                ]),
            ]),
            loading && h(Loader),
        ]);
    }
}

export default LeftMenu;
export {LeftMenu};
