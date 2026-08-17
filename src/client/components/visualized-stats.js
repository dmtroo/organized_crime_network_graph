import { h, Component } from 'preact';
import Plotly from 'plotly.js-dist';

class VisualizedStats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            selectedCountry: 'All',
            selectedStatistic: 'Documents',
            selectedView: 'total',
            selectedStyle: 'bar',
            selectedDataView: 'Raw',
            fromDate: null,
            toDate: null,
            dateMin: null,
            dateMax: null,
            allKeys: [],
            statistics: null
        };
        this.countries = ['GB', 'FR', 'IT', 'NL', 'BE'];
        this.views = {'Total': 'total', 'Over Time': 'timeseries'};
        this.viewLabels = ['Total', 'Over Time'];
        this.styles = {'Bar': 'bar', 'Line': 'line'};
        this.styleLabels = ['Bar', 'Line'];
        this.dataViews = ['Raw', 'Accumulated', 'Normalized'];
    }

    async componentDidMount() {
        const response = await fetch('src/files/all_stats.json');
        const statistics = await response.json();
        const allKeys = Array.from(new Set(
            Object.values(statistics).flatMap(countryStats =>
                countryStats.flatMap(record =>
                    Object.keys(record).filter(key => key !== 'date')
                )
            )
        ));

        const { min, max } = this.getMinMaxDates(statistics, this.state.selectedCountry);

        this.setState({
            statistics,
            allKeys,
            fromDate: min,
            toDate: max,
            dateMin: min,
            dateMax: max
        }, this.plotData);
    }

    applyDataView(yData) {
        const { selectedDataView } = this.state;

        if (selectedDataView === 'Accumulated') {
            return yData.map((val, idx) => yData.slice(0, idx + 1).reduce((a, b) => a + b, 0));
        }

        if (selectedDataView === 'Normalized') {
            const max = Math.max(...yData, 0);
            return max ? yData.map(v => (v / max) * 100) : yData.map(() => 0);
        }

        return yData;
    }

    buildLayout() {
        const { selectedCountry, selectedStatistic, selectedView, selectedDataView } = this.state;

        if (selectedView === 'total') {
            const title = selectedCountry === 'All' ?
                `Total ${selectedStatistic} by country` :
                (selectedStatistic === 'All' ? `Total statistics for ${selectedCountry}` : `Total ${selectedStatistic} for ${selectedCountry}`);

            return {
                title: { text: title },
                xaxis: { title: { text: selectedCountry === 'All' ? 'Country' : 'Statistic' } },
                yaxis: { title: { text: 'Total count' } },
                margin: { t: 60 }
            };
        }

        const subject = selectedStatistic === 'All' ? 'All statistics' : selectedStatistic;
        const scope = selectedCountry === 'All' ? 'all countries' : selectedCountry;
        const viewSuffix = selectedDataView === 'Raw' ? '' : ` (${selectedDataView})`;

        return {
            title: { text: `${subject} over time — ${scope}${viewSuffix}` },
            xaxis: { title: { text: 'Date' } },
            yaxis: { title: { text: selectedDataView === 'Normalized' ? '% of series maximum' : 'Count' } },
            margin: { t: 60 }
        };
    }

    plotData() {
        const {statistics, selectedCountry, selectedStatistic, selectedView, selectedStyle, fromDate, toDate} = this.state;

        if (!statistics || !(selectedCountry in statistics) && selectedCountry !== 'All') {
            return;
        }

        let chartData = [];

        let filteredStatistics = [];
        if (selectedCountry === 'All') {
            for (let country of this.countries) {
                if (statistics[country]) {
                    for (let record of statistics[country]) {
                        filteredStatistics.push({...record, country});
                    }
                }
            }
        } else {
            filteredStatistics = statistics[selectedCountry];
        }

        filteredStatistics = filteredStatistics.filter(record => {
            if (fromDate && toDate) {
                const recordMonth = record.date.slice(0, 7);
                return recordMonth >= fromDate && recordMonth <= toDate;
            }
            return true;
        });

        if (selectedView === 'total') {
            if (selectedCountry === 'All') {
                for (let country of this.countries) {
                    let countryFilteredStatistics = filteredStatistics.filter(record => record.country === country);
                    let yData = countryFilteredStatistics.map(record => record[selectedStatistic] || 0);
                    let total = yData.reduce((a, b) => a + b, 0);
                    chartData.push({x: [country], y: [total], type: 'bar', name: country});
                }
            } else if (selectedStatistic === 'All') {
                for (let stat of this.state.allKeys) {
                    let yData = filteredStatistics.map(record => record[stat] || 0);
                    let total = yData.reduce((a, b) => a + b, 0);
                    chartData.push({x: [stat], y: [total], type: 'bar', name: stat});
                }
            } else {
                let yData = filteredStatistics.map(record => record[selectedStatistic] || 0);
                let total = yData.reduce((a, b) => a + b, 0);
                chartData.push({x: [selectedStatistic], y: [total], type: 'bar', name: selectedStatistic});
            }
        } else {
            if (selectedCountry === 'All') {
                for (let country of this.countries) {
                    let countryFilteredStatistics = filteredStatistics.filter(record => record.country === country);
                    let xData = countryFilteredStatistics.map(record => record.date);
                    let yData = countryFilteredStatistics.map(record => record[selectedStatistic] || 0);
                    chartData.push({x: xData, y: this.applyDataView(yData), type: selectedStyle, name: country});
                }
            } else {
                let xData = filteredStatistics.map(record => record.date);
                if (selectedStatistic === 'All') {
                    for (let stat of this.state.allKeys) {
                        let yData = filteredStatistics.map(record => record[stat] || 0);
                        chartData.push({x: xData, y: this.applyDataView(yData), type: selectedStyle, name: stat});
                    }
                } else {
                    let yData = filteredStatistics.map(record => record[selectedStatistic] || 0);
                    chartData.push({x: xData, y: this.applyDataView(yData), type: selectedStyle, name: selectedStatistic});
                }
            }
        }

        Plotly.newPlot('chart', chartData, this.buildLayout());
    }

    getMinMaxDates(statistics, selectedCountry) {
        let allDates = [];

        if (selectedCountry === 'All') {
            for (let country in statistics) {
                allDates = allDates.concat(statistics[country].map(record => new Date(record.date)));
            }
        } else if (statistics[selectedCountry]) {
            allDates = statistics[selectedCountry].map(record => new Date(record.date));
        }

        const minDate = new Date(Math.min(...allDates));
        const maxDate = new Date(Math.max(...allDates));

        return {
            min: minDate.toISOString().slice(0,7),
            max: maxDate.toISOString().slice(0,7)
        };
    }

    handleDataViewChange(e) {
        this.setState({selectedDataView: e.target.value}, () => {
            this.plotData();
        });
    }

    handleViewChange(e) {
        this.setState({selectedView: this.views[e.target.value]}, () => {
            this.plotData();
        });
    }

    handleStyleChange(e) {
        this.setState({selectedStyle: this.styles[e.target.value]}, () => {
            this.plotData();
        });
    }

    handleCountryChange(e) {
        const selectedCountry = e.target.value;
        const { min, max } = this.getMinMaxDates(this.state.statistics, selectedCountry);

        this.setState({
            selectedCountry,
            selectedStatistic: selectedCountry === 'All' ? 'Documents' : 'All',
            fromDate: min,
            toDate: max,
            dateMin: min,
            dateMax: max
        }, () => {
            this.plotData();
        });
    }

    handleStatisticChange(e) {
        this.setState({selectedStatistic: e.target.value}, () => {
            this.plotData();
        });
    }

    handleFromDateChange(e) {
        this.setState({fromDate: e.target.value}, () => {
            this.plotData();
        });
    }

    handleToDateChange(e) {
        this.setState({toDate: e.target.value}, () => {
            this.plotData();
        });
    }

    render() {
        const { allKeys, selectedCountry, selectedStatistic, selectedView, selectedDataView, fromDate, toDate, dateMin, dateMax } = this.state;
        let statistics = ['Documents', 'Sentences', 'Noun Phrases', 'Named Entities'].concat(
            allKeys.filter(
                key => !['Documents', 'Sentences', 'Noun Phrases', 'Named Entities'].includes(key)
            )
        );

        if (selectedCountry !== 'All') {
            statistics = ['All', ...statistics];
        }

        const isTimeSeries = selectedView === 'timeseries';

        return h('div', {},
            h('h1', { style: { textAlign: 'center', color: 'white' } }, 'Visualized Statistics'),
            h('div', { class: 'input-group' },
                h('div', { class: 'input-item' },
                    h('label', { for: 'country-select' }, 'Country:'),
                    h('select', { onChange: this.handleCountryChange.bind(this), value: selectedCountry, id: 'country-select' },
                        h('option', { value: 'All' }, 'All'),
                        this.countries.map(country =>
                            h('option', { value: country }, country)
                        )
                    ),
                ),
                h('div', { class: 'input-item' },
                    h('label', { for: 'from-date' }, 'From:'),
                    h('input', { type: 'month', min: dateMin, max: dateMax, onChange: this.handleFromDateChange.bind(this), value: fromDate, id: 'from-date' }),
                ),
                h('div', { class: 'input-item' },
                    h('label', { for: 'to-date' }, 'To:'),
                    h('input', { type: 'month', min: dateMin, max: dateMax, onChange: this.handleToDateChange.bind(this), value: toDate, id: 'to-date' }),
                ),
                h('div', { class: 'input-item' },
                    h('label', { for: 'statistic-select' }, 'Statistic:'),
                    h('select', { onChange: this.handleStatisticChange.bind(this), value: selectedStatistic, id: 'statistic-select' },
                        statistics.map(stat =>
                            h('option', { value: stat }, stat)
                        )
                    ),
                ),
                h('div', { class: 'input-item' },
                    h('label', { for: 'view-select' }, 'View:'),
                    h('i', {
                        class: 'fas fa-info-circle',
                        style: { paddingLeft: '1px', marginRight: '8px', color: '#888', cursor: 'pointer' },
                        title: 'Total: Adds up every data point in the selected date range into a single bar per country/statistic.\n\nOver Time: Plots each data point across the selected date range, so you can see trends over time.'
                    }),
                    h('select', { onChange: this.handleViewChange.bind(this), value: Object.keys(this.views).find(key => this.views[key] === selectedView), id: 'view-select' },
                        this.viewLabels.map(label =>
                            h('option', { value: label }, label)
                        )
                    ),
                ),
                h('div', { class: 'input-item' },
                    h('label', { for: 'style-select' }, 'Chart Style:'),
                    h('select', { onChange: this.handleStyleChange.bind(this), value: Object.keys(this.styles).find(key => this.styles[key] === this.state.selectedStyle), id: 'style-select', disabled: !isTimeSeries },
                        this.styleLabels.map(label =>
                            h('option', { value: label }, label)
                        )
                    ),
                ),
                h('div', { class: 'input-item' },
                    h('label', { for: 'data-view-select' }, 'Data View:'),
                    h('i', {
                        class: 'fas fa-info-circle',
                        style: { paddingLeft: '1px', marginRight: '8px', color: '#888', cursor: 'pointer' },
                        title: 'Raw data: Displays individual data points as they were collected, without any aggregation.\n\nAccumulated data: Displays data points in a cumulative format, where each point represents the total of the current and all previous data points.\n\nNormalized data: Scales each series to a percentage of its own maximum value (0-100%), so series with very different scales (e.g. Noun Phrases vs. Named Entities, or a large corpus vs. a small one) can be compared on the same chart. Only applies to the "Over Time" view.'
                    }),
                    h('select', { onChange: this.handleDataViewChange.bind(this), value: selectedDataView, id: 'data-view-select', disabled: !isTimeSeries },
                        this.dataViews.map(view =>
                            h('option', { value: view }, view)
                        )
                    ),
                ),
            ),
            h('div', { id: 'chart', style: { marginBottom: '20px' } }),
        );
    }
}

export default VisualizedStats;