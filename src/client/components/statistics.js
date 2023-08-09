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

        const orderedKeys = ['Documents', 'Sentences', 'Noun Phrases', 'Named Entities'].concat(
            this.state.allKeys.filter(
                key => !['Documents', 'Sentences', 'Noun Phrases', 'Named Entities'].includes(key)
            )
        );

        const startIndex = orderedKeys.indexOf('Named Entities');

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
                    orderedKeys.map((stat, index) =>
                        h('tr', {},
                            [
                                h('td', {
                                        class: 'first-col' +
                                            (index > startIndex ? ' indent' : '')
                                    },
                                    [
                                        stat,
                                        stat === 'Named Entities' || stat === 'Noun Phrases' ?
                                            h('i', {
                                                class: 'fas fa-info-circle',
                                                style: {paddingRight: '1px', marginLeft: '6px', marginBottom: '2px', color: '#888', cursor: 'pointer'},
                                                title: stat === 'Named Entities' ?
                                                    'A named entity is a “real-world object” that’s assigned a name – for example, a person, a country, a product or a book title.' :
                                                    'Groups of words containing a noun and functioning like a noun.'
                                            }) :
                                            null,
                                    ]),
                                ...this.countries.map((country) =>
                                    h('td', { class: statistics[country][stat] ? '' : 'na' }, statistics[country][stat] || 'N/A')
                                )
                            ]
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
