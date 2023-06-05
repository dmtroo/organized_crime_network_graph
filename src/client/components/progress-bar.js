import {h, Component} from 'preact';

class ProgressBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            progress: this.props.progress || 0,
        };
    }

    componentDidUpdate(prevProps) {
        if(prevProps.progress !== this.props.progress) {
            this.setState({
                progress: this.props.progress,
            });
        }
    }

    render() {
        const {progress} = this.state;
        const progressStyle = {
            width: `${progress}%`,
        };

        return h('div', {class: 'progress-bar-container'}, [
            h('div', {
                class: 'progress-bar',
                style: progressStyle,
            }),
        ]);
    }
}

export default ProgressBar;
