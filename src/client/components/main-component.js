import { h, Component } from 'preact';
import AppComponent from './app';
import StatisticsPage from './statistics';
import VisualizedStats from './visualizedStats';
import Loader from './loader';

class MainComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: 'statistics',
            loading: false
        };

        this.switchPage = this.switchPage.bind(this);
    }

    switchPage(page) {
        this.setState({
            currentPage: page,
            loading: true
        }, () => {
            setTimeout(() => {
                this.setState({loading: false});
            }, 0);
        });
    }

    render() {
        const { loading, currentPage } = this.state;

        if (loading) {
            return h(Loader);
        }

        let currentPageComponent;
        switch (currentPage) {
            case 'graph':
                currentPageComponent = h(AppComponent);
                break;
            case 'statistics':
                currentPageComponent = h(StatisticsPage);
                break;
            case 'visualizedStats':
                currentPageComponent = h(VisualizedStats);
                break;
            default:
                currentPageComponent = null;
        }

        return h('div', {}, [
            h('div', {class: 'switch-btn-container'}, [
                h('button', {class: 'switch-btn', onClick: () => this.switchPage('statistics')}, 'Statistics'),
                h('button', {class: 'switch-btn', onClick: () => this.switchPage('visualizedStats')}, 'Visualized Statistics'),
                h('button', {class: 'switch-btn', onClick: () => this.switchPage('graph')}, 'Network Graph'),
            ]),
            currentPageComponent
        ]);
    }
}

export default MainComponent;
