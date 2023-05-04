import {h, Component} from 'preact';
import classNames from 'classnames';

class LeftMenu extends Component {
    constructor(props) {
        super(props);

        const {controller} = props;
        const {bus} = controller;

        this.state = {
            open: false,
        };

        bus.on('openLeftMenu', this.onOpenLeftMenu = (() => {
            this.setState({open: true});
        }));

        bus.on('closeLeftMenu', this.onCloseLeftMenu = (() => {
            this.setState({open: false});
        }));
    }

    applyFilter() {
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

        controller.applyFilter(percentage, nodeTypes, edgeColors);
    }

    componentWillUnmount() {
        const {bus} = this.props.controller;
        bus.removeListener('openLeftMenu', this.onOpenLeftMenu);
        bus.removeListener('closeLeftMenu', this.onCloseLeftMenu);
    }

    resetFilter() {
        console.log("resetFilter called");
        const {controller} = this.props;
        controller.unhighlight();
        controller.restoreInitialElements();
    }

    render() {
        const {controller} = this.props;
        const {open} = this.state;
        const closed = !open;

        return h('div', {class: 'left-menu-parent'}, [
            h('div', {
                class: classNames({'left-menu-toggle': true, 'menu-open': open}),
                onClick: () => controller.toggleLeftMenu()
            }),
            h('div', {class: classNames({'left-menu': true, 'menu-closed': closed})}, [
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
                            h('option', {value: 'PERSON'}, 'PERSON'),
                            h('option', {value: 'ORG'}, 'ORG'),
                            h('option', {value: 'GPE'}, 'GPE'),
                            h('option', {value: 'NORP'}, 'NORP'),
                            h('option', {value: 'NP'}, 'NP'),
                        ]),
                        h('select', {
                            id: 'menu-filter-node-type2',
                            name: 'menu-filter-node-type2',
                        }, [
                            h('option', {value: ''}, ''),
                            h('option', {value: 'PERSON'}, 'PERSON'),
                            h('option', {value: 'ORG'}, 'ORG'),
                            h('option', {value: 'GPE'}, 'GPE'),
                            h('option', {value: 'NORP'}, 'NORP'),
                            h('option', {value: 'NP'}, 'NP'),
                        ]),
                        h('select', {
                            id: 'menu-filter-node-type3',
                            name: 'menu-filter-node-type3',
                        }, [
                            h('option', {value: ''}, ''),
                            h('option', {value: 'PERSON'}, 'PERSON'),
                            h('option', {value: 'ORG'}, 'ORG'),
                            h('option', {value: 'GPE'}, 'GPE'),
                            h('option', {value: 'NORP'}, 'NORP'),
                            h('option', {value: 'NP'}, 'NP'),
                        ]),
                        h('select', {
                            id: 'menu-filter-node-type4',
                            name: 'menu-filter-node-type4',
                        }, [
                            h('option', {value: ''}, ''),
                            h('option', {value: 'PERSON'}, 'PERSON'),
                            h('option', {value: 'ORG'}, 'ORG'),
                            h('option', {value: 'GPE'}, 'GPE'),
                            h('option', {value: 'NORP'}, 'NORP'),
                            h('option', {value: 'NP'}, 'NP'),
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
            ])
        ]);
    }
}

export default LeftMenu;
export {LeftMenu};
