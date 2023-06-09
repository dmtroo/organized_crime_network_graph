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
            requestAnimationFrame(() => {
                const {controller} = this.props;
                const percentage = document.getElementById('menu-filter-input').value;
                const nodeType1 = document.getElementById('menu-filter-node-type1').value;
                const nodeType2 = document.getElementById('menu-filter-node-type2').value;
                const nodeType3 = document.getElementById('menu-filter-node-type3').value;
                const nodeType4 = document.getElementById('menu-filter-node-type4').value;
                const edgeColor1 = document.getElementById('menu-filter-edge-color1').value;
                const edgeColor2 = document.getElementById('menu-filter-edge-color2').value;

                const edgeColors = [edgeColor1, edgeColor2].filter(color => color !== '');
                const nodeTypes = [nodeType1, nodeType2, nodeType3, nodeType4].filter(color => color !== '');

                controller.applyFilter(percentage, nodeTypes, edgeColors).then(() => {
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
        document.getElementById('menu-filter-node-type1').value = '';
        document.getElementById('menu-filter-node-type2').value = '';
        document.getElementById('menu-filter-node-type3').value = '';
        document.getElementById('menu-filter-node-type4').value = '';
        document.getElementById('menu-filter-edge-color1').value = '';
        document.getElementById('menu-filter-edge-color2').value = '';
    }

    resetFilter() {
        this.setState({ loading: true }, () => {
            requestAnimationFrame(() => {
                this.clearFields();
                const {controller} = this.props;
                controller.unhighlight();
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
                console.log(graphName);
                this.props.switchGraph(graphName).then(() => {
                    this.setState({loading: false});
                });
            });
        });
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
                    h('label', {for: 'menu-filter-node-types'}, 'Node types:'),
                    h('div', {id: 'menu-filter-node-types'}, [
                        h('select', {
                            id: 'menu-filter-node-type1',
                            name: 'menu-filter-node-type1',
                        }, [
                            h('option', {value: ''}, ''),
                            node_types.map(entity =>
                                h('option', {value: entity}, entity)
                            ),
                        ]),
                        h('select', {
                            id: 'menu-filter-node-type2',
                            name: 'menu-filter-node-type2',
                        }, [
                            h('option', {value: ''}, ''),
                            node_types.map(entity =>
                                h('option', {value: entity}, entity)
                            ),
                        ]),
                        h('select', {
                            id: 'menu-filter-node-type3',
                            name: 'menu-filter-node-type3',
                        }, [
                            h('option', {value: ''}, ''),
                            node_types.map(entity =>
                                h('option', {value: entity}, entity)
                            ),
                        ]),
                        h('select', {
                            id: 'menu-filter-node-type4',
                            name: 'menu-filter-node-type4',
                        }, [
                            h('option', {value: ''}, ''),
                            node_types.map(entity =>
                                h('option', {value: entity}, entity)
                            ),
                        ]),
                    ]),
                ]),
                h('div', {class: 'menu-filter'}, [
                    h('label', {for: 'menu-filter-edge-colors'}, 'Edge colors:'),
                    h('div', {id: 'menu-filter-edge-colors'}, [
                        h('select', {
                            id: 'menu-filter-edge-color1',
                            name: 'menu-filter-edge-color1',
                        }, [
                            h('option', {value: ''}, ''),
                            h('option', {value: 'green'}, 'Green'),
                            h('option', {value: 'yellow'}, 'Yellow'),
                            h('option', {value: 'red'}, 'Red'),
                        ]),
                        h('select', {
                            id: 'menu-filter-edge-color2',
                            name: 'menu-filter-edge-color2',
                        }, [
                            h('option', {value: ''}, ''),
                            h('option', {value: 'green'}, 'Green'),
                            h('option', {value: 'yellow'}, 'Yellow'),
                            h('option', {value: 'red'}, 'Red'),
                        ]),
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
