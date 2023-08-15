import { h, Component } from 'preact';
import Plotly from 'plotly.js-dist';

class VisualizedStats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            selectedCountry: 'All',
            selectedStatistic: 'Documents',
            selectedChartType: 'sum',
            selectedDataView: 'Raw',
            fromDate: null,
            toDate: null,
            allKeys: [],
            statistics: null
        };
        this.countries = ['GB', 'FR', 'IT', 'NL', 'BE'];
        this.chartTypeLabels = ['Sum', 'Bar', 'Line'];
        this.chartTypes = {'Sum': 'sum', 'Bar': 'bar', 'Line': 'line'};
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
            toDate: max
        }, this.plotData);
    }

    plotData() {
        const {statistics, selectedCountry, selectedStatistic, selectedChartType, selectedDataView, fromDate, toDate} = this.state;

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
                return new Date(record.date) >= new Date(fromDate) && new Date(record.date) <= new Date(toDate);
            }
            return true;
        });

        if (selectedChartType === 'sum') {
            if (selectedCountry === 'All') {
                for (let country of this.countries) {
                    let countryFilteredStatistics = filteredStatistics.filter(record => record.country === country);
                    let yData = countryFilteredStatistics.map(record => record[selectedStatistic] || 0);
                    let total = yData.reduce((a, b) => a + b, 0);
                    chartData.push({x: [country], y: [total], type: 'bar', name: country});
                }
            } else {
                if (selectedStatistic === 'All') {
                    for (let stat of this.state.allKeys) {
                        let yData = filteredStatistics.map(record => record[stat] || 0);
                        let total = yData.reduce((a, b) => a + b, 0);
                        chartData.push({x: [stat], y: [total], type: 'bar', name: stat});
                    }
                }
            }
        } else {
            if (selectedCountry === 'All') {
                for (let country of this.countries) {
                    if (country in statistics) {
                        let xData = statistics[country].map(record => record.date);
                        let yData = statistics[country].map(record => record[selectedStatistic] || 0);
                        let yDataToShow = selectedDataView === 'Raw' ? yData : yData.map((val, idx) => yData.slice(0, idx + 1).reduce((a, b) => a + b, 0));
                        chartData.push({x: xData, y: yDataToShow, type: selectedChartType, name: country});
                    }
                }
            } else {
                let xData = filteredStatistics.map(record => record.date);
                if (selectedStatistic === 'All') {
                    for (let stat of this.state.allKeys) {
                        let yData = filteredStatistics.map(record => record[stat] || 0);
                        let yDataToShow = selectedDataView === 'Raw' ? yData : yData.map((val, idx) => yData.slice(0, idx + 1).reduce((a, b) => a + b, 0));
                        chartData.push({x: xData, y: yDataToShow, type: selectedChartType, name: stat});
                    }
                } else {
                    let yData = filteredStatistics.map(record => record[selectedStatistic] || 0);
                    let yDataToShow = selectedDataView === 'Raw' ? yData : yData.map((val, idx) => yData.slice(0, idx + 1).reduce((a, b) => a + b, 0));
                    chartData.push({x: xData, y: yDataToShow, type: selectedChartType, name: selectedStatistic});
                }
            }
        }

        Plotly.newPlot('chart', chartData);
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

    handleChartTypeChange(e) {
        this.setState({selectedChartType: this.chartTypes[e.target.value]}, () => {
            this.plotData();
        });
    }

    handleCountryChange(e) {
        const selectedCountry = e.target.value;
        const { min, max } = this.getMinMaxDates(this.state.statistics, selectedCountry);

        this.setState({
            selectedCountry,
            selectedStatistic: selectedCountry === 'All' ? 'N of documents' : 'All',
            fromDate: min,
            toDate: max
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
        const { allKeys, selectedCountry, selectedStatistic, fromDate, toDate } = this.state;
        let statistics = ['Documents', 'Sentences', 'Noun Phrases', 'Named Entities'].concat(
            allKeys.filter(
                key => !['Documents', 'Sentences', 'Noun Phrases', 'Named Entities'].includes(key)
            )
        );

        if (selectedCountry !== 'All') {
            statistics = ['All', ...statistics];
        }

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
                    h('input', { type: 'month', onChange: this.handleFromDateChange.bind(this), value: fromDate, id: 'from-date' }),
                ),
                h('div', { class: 'input-item' },
                    h('label', { for: 'to-date' }, 'To:'),
                    h('input', { type: 'month', onChange: this.handleToDateChange.bind(this), value: toDate, id: 'to-date' }),
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
                    h('label', { for: 'chart-type-select' }, 'Chart Type:'),
                    h('select', { onChange: this.handleChartTypeChange.bind(this), value: Object.keys(this.chartTypes).find(key => this.chartTypes[key] === this.state.selectedChartType), id: 'chart-type-select' },
                        this.chartTypeLabels.map(type =>
                            h('option', { value: type }, type)
                        )
                    ),
                ),
                h('div', { class: 'input-item' },
                    h('label', { for: 'data-view-select' }, 'Data View:'),
                    h('i', {
                        class: 'fas fa-info-circle',
                        style: { paddingLeft: '1px', marginRight: '8px', color: '#888', cursor: 'pointer' },
                        title: 'Raw data: Displays individual data points as they were collected, without any aggregation.\n\nAccumulated data: Displays data points in a cumulative format, where each point represents the total of the current and all previous data points.'
                    }),
                    h('select', { onChange: this.handleDataViewChange.bind(this), id: 'data-view-select' },
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