import { h, Component } from 'preact';
import Loader from "./loader";
import { loadStatistics } from './loadStatistics.js';

class Statistics extends Component {
    constructor(props) {
        super(props);

        this.state = {
            statistics: null
        };

        this.countries = ['GB', 'FR', 'IT', 'NL', 'BE'];
    }

    async componentDidMount() {
        const { statistics, allKeys } = await loadStatistics();
        this.setState({ statistics, allKeys });
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
