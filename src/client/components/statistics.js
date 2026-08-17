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

        const statDefinitions = {
            'Named Entities': 'A named entity is a “real-world object” that’s assigned a name – for example, a person, a country, a product or a book title.',
            'Noun Phrases': 'Groups of words containing a noun and functioning like a noun.',
            'ORG': 'Companies, agencies, institutions, etc.',
            'GPE': 'Geo-political entity: countries, cities, states.',
            'DATE': 'Absolute or relative dates or periods.',
            'PERSON': 'People, including fictional.',
            'NORP': 'Nationalities or religious or political groups.',
            'CARDINAL': 'Numerals that do not fall under another type.',
            'LAW': 'Named documents made into laws.',
            'LOC': 'Non-GPE locations, mountain ranges, bodies of water.',
            'ORDINAL': '"first", "second", etc.',
            'MONEY': 'Monetary values, including unit.',
            'PERCENT': 'Percentage, including "%".',
            'TIME': 'Times smaller than a day.',
            'WORK_OF_ART': 'Titles of books, songs, etc.',
            'EVENT': 'Named hurricanes, battles, wars, sports events, etc.',
            'PRODUCT': 'Objects, vehicles, foods, etc. (not services).',
            'QUANTITY': 'Measurements, as of weight or distance.',
            'FAC': 'Buildings, airports, highways, bridges, etc.',
            'LANGUAGE': 'Any named language.',
            'MISC': 'Miscellaneous named entities that do not fall into the ORG, LOC or PERSON categories. The France and Italy corpora use this coarser-grained entity scheme instead of the more granular categories (GPE, NORP, DATE, etc.) used for the UK, Netherlands and Belgium corpora, so entity-type counts are not directly comparable across all five countries.',
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
                                        statDefinitions[stat] ?
                                            h('i', {
                                                class: 'fas fa-info-circle',
                                                style: {paddingRight: '1px', marginLeft: '6px', marginBottom: '2px', color: '#888', cursor: 'pointer'},
                                                title: statDefinitions[stat]
                                            }) :
                                            null,
                                    ]),
                                ...this.countries.map((country) => {
                                    const hasValue = statistics[country][stat] !== undefined;
                                    return h('td', { class: hasValue ? '' : 'na' }, hasValue ? statistics[country][stat] : 'N/A');
                                })
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
