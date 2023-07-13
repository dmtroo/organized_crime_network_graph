import { h, Component } from 'preact';
import Plotly from 'plotly.js-dist';

class VisualizedStats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            selectedCountry: 'All',
            selectedStatistic: 'N of documents',
            selectedChartType: 'sum',
            selectedDataView: 'Raw',
            allKeys: [],
            statistics: null
        };
        this.countries = ['GB', 'FR', 'IT', 'NL', 'BE'];
        this.chartTypes = ['bar', 'line', 'sum'];
        this.dataViews = ['Raw', 'Accumulated'];
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
        this.setState({statistics, allKeys}, this.plotData);
    }


    plotData() {
        const {statistics, selectedCountry, selectedStatistic, selectedChartType, selectedDataView} = this.state;

        if (!statistics || !(selectedCountry in statistics) && selectedCountry !== 'All') {
            return;
        }

        let chartData = [];

        if (selectedChartType === 'sum') {
            if (selectedCountry === 'All') {
                if (selectedStatistic !== 'All') {
                    for (let country of this.countries) {
                        if (country in statistics) {
                            let yData = statistics[country].map(record => record[selectedStatistic] || 0);
                            let total = yData.reduce((a, b) => a + b, 0);
                            chartData.push({x: [country], y: [total], type: 'bar', name: country});
                        }
                    }
                }
            } else {
                if (selectedStatistic === 'All') {
                    for (let stat of this.state.allKeys) {
                        let yData = statistics[selectedCountry].map(record => record[stat] || 0);
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
                let xData = statistics[selectedCountry].map(record => record.date);
                if (selectedStatistic === 'All') {
                    for (let stat of this.state.allKeys) {
                        let yData = statistics[selectedCountry].map(record => record[stat] || 0);
                        let yDataToShow = selectedDataView === 'Raw' ? yData : yData.map((val, idx) => yData.slice(0, idx + 1).reduce((a, b) => a + b, 0));
                        chartData.push({x: xData, y: yDataToShow, type: selectedChartType, name: stat});
                    }
                } else {
                    let yData = statistics[selectedCountry].map(record => record[selectedStatistic] || 0);
                    let yDataToShow = selectedDataView === 'Raw' ? yData : yData.map((val, idx) => yData.slice(0, idx + 1).reduce((a, b) => a + b, 0));
                    chartData.push({x: xData, y: yDataToShow, type: selectedChartType, name: selectedStatistic});
                }
            }
        }

        Plotly.newPlot('chart', chartData);
    }


    handleDataViewChange(e) {
        this.setState({selectedDataView: e.target.value}, () => {
            this.plotData();
        });
    }

    handleChartTypeChange(e) {
        this.setState({selectedChartType: e.target.value}, () => {
            this.plotData();
        });
    }

    handleCountryChange(e) {
        this.setState({
            selectedCountry: e.target.value,
            selectedStatistic: e.target.value === 'All' ? 'N of documents' : 'All'
        }, () => {
            this.plotData();
        });
    }


    handleStatisticChange(e) {
        this.setState({selectedStatistic: e.target.value}, () => {
            this.plotData();
        });
    }

    render() {
        const {allKeys, selectedCountry, selectedStatistic} = this.state;
        let statistics = ['N of documents', 'N of sentences', 'N of NPs', 'N of NEs'].concat(
            allKeys.filter(
                key => !['N of documents', 'N of sentences', 'N of NPs', 'N of NEs'].includes(key)
            )
        );

        if (selectedCountry !== 'All') {
            statistics = ['All', ...statistics];
        }

        return h('div', {},
            h('select', {onChange: this.handleCountryChange.bind(this), value: selectedCountry},
                h('option', {value: 'All'}, 'All'),
                this.countries.map(country =>
                    h('option', {value: country}, country)
                )
            ),
            h('select', {onChange: this.handleStatisticChange.bind(this), value: selectedStatistic},
                statistics.map(stat =>
                    h('option', {value: stat}, stat)
                )
            ),
            h('select', {onChange: this.handleChartTypeChange.bind(this)},
                this.chartTypes.map(type =>
                    h('option', {value: type}, type)
                )
            ),
            h('select', {onChange: this.handleDataViewChange.bind(this)},
                this.dataViews.map(view =>
                    h('option', {value: view}, view)
                )
            ),
            h('div', {id: 'chart'})
        );
    }
}

export default VisualizedStats;