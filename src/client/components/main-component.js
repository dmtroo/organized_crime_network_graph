import { h, Component } from 'preact';
import AppComponent from './app';
import StatisticsPage from './statistics';
import Loader from './loader';

class MainComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showGraph: false,
            loading: false
        };

        this.switchPage = this.switchPage.bind(this);
    }

    switchPage() {
        console.log("clicked!");
        this.setState(prevState => ({
            showGraph: !prevState.showGraph,
            loading: true
        }), () => {
            setTimeout(() => {
                this.setState({loading: false});
            }, 0);
        });
    }

    render() {
        if(this.state.loading){
            return h(Loader);
        } else {
            return h('div', {}, [
                h('button', { onClick: this.switchPage },
                    this.state.showGraph ? 'Go to Statistics Page' : 'Go to Graph Page'
                ),
                this.state.showGraph ? h(AppComponent) : h(StatisticsPage)
            ]);
        }
    }
}

export default MainComponent;
