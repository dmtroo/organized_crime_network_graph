import { h, Component } from 'preact';
import pako from 'pako';
import Loader from "./loader";

class Statistics extends Component {
    constructor(props) {
        super(props);

        this.state = {
            statistics: null
        };

        this.countries = ['GB', 'FR', 'IT', 'NL', 'BE'];
    }

    async componentDidMount() {
        this.loadStatistics();
    }

    async fetchStatistics(countryCode) {
        let path;

        if(countryCode === 'IT') {
            path = `src/files/${countryCode.toLowerCase()}.json.gz`;
        } else {
            path = `src/files/${countryCode.toLowerCase()}.json`;
        }

        const response = await fetch(path);

        if(path.endsWith('.gz')) {
            const buffer = await response.arrayBuffer();
            const jsonString = pako.inflate(buffer, { to: 'string' });
            return JSON.parse(jsonString).statistics;
        } else {
            const data = await response.json();
            return data.statistics;
        }
    }

    async loadStatistics() {
        const statsPromises = this.countries.map(country => this.fetchStatistics(country));
        const statsArray = await Promise.all(statsPromises);

        const stats = statsArray.reduce((acc, currentStats, index) => {
            acc[this.countries[index]] = currentStats;
            return acc;
        }, {});

        this.setState({ statistics: stats });
    }

    renderStatistics(country, stats) {
        const countryNameMap = {
            'GB': 'United Kingdom',
            'FR': 'France',
            'IT': 'Italy',
            'NL': 'Netherlands',
            'BE': 'Belgium',
        };

        return h('div', { style: {border: '1px solid black', margin: '10px', padding: '10px'} }, [
            h('h2', {}, countryNameMap[country]),
            ...Object.keys(stats).map(key => h('p', { key: key }, `${key}: ${stats[key]}`))
        ]);
    }

    render() {
        const { statistics } = this.state;

        if (!statistics) {
            return h(Loader);
        }

        return h('div', { style: {display: 'flex', flexWrap: 'wrap', justifyContent: 'center'} },
            this.countries.map(country => this.renderStatistics(country, statistics[country]))
        );
    }
}

export default Statistics;
