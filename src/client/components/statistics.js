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

        const allKeys = new Set();
        Object.values(stats).forEach(countryStats => {
            Object.keys(countryStats).forEach(key => allKeys.add(key));
        });

        this.setState({ statistics: stats, allKeys: Array.from(allKeys) });
    }

    renderStatistics() {
        const countryNameMap = {
            'GB': 'United Kingdom',
            'FR': 'France',
            'IT': 'Italy',
            'NL': 'Netherlands',
            'BE': 'Belgium',
        };

        const { statistics } = this.state;

        const orderedKeys = ['N of documents', 'N of sentences', 'N of NPs', 'N of NEs'].concat(
            this.state.allKeys.filter(
                key => !['N of documents', 'N of sentences', 'N of NPs', 'N of NEs'].includes(key)
            )
        );

        return h('table', { class: 'stats-table' },
            [
                h('thead', {},
                    h('tr', {},
                        ['Statistic', ...this.countries].map((country, i) =>
                            h('th', { class: i === 0 ? 'first-col' : '' }, i === 0 ? country : countryNameMap[country])
                        )
                    )
                ),
                h('tbody', {},
                    orderedKeys.map((stat) =>
                        h('tr', {},
                            [h('td', { class: 'first-col' }, stat), ...this.countries.map((country) =>
                                h('td', { class: statistics[country][stat] ? '' : 'na' }, statistics[country][stat] || 'N/A')
                            )]
                        )
                    )
                )
            ]
        );
    }

    render() {
        const { statistics } = this.state;

        if (!statistics) {
            return h(Loader);
        }

        return h('div', { class: 'container' },
            [
                h('a', { href: "https://hcss.nl/", target: "_blank", rel: "noopener noreferrer" },
                    h('div', { class: 'logo' })
                ),
                h('div', { class: 'table-container' },
                    this.renderStatistics()
                )
            ]
        );
    }
}

export default Statistics;
