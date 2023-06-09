import { h, Component } from 'preact';

class Loader extends Component {
    render() {
        return h('div', { class: 'loading' }, [
            h('div', { class: 'loader-wheel' })
        ]);
    }
}

export default Loader;
export { Loader };
