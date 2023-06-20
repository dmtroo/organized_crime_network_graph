import { h, Component } from 'preact';

class NodeInfo extends Component {
  constructor(props){
    super(props);
    this.state = {
      showSentences: false
    };
    this.toggleSentences = this.toggleSentences.bind(this);
  }

  toggleSentences(e) {
    e.stopPropagation();
    this.setState(prevState => ({
      showSentences: !prevState.showSentences
    }));
  }

  render(){
    const { node } = this.props;
    const data = node.data();
    const { name } = data;
    const type = data.NodeTypeFormatted + (data.Type ? ` (${data.Type})` : '');
    const occurrences =  data.occur + " occurrences in " + data.occur_sent + " sentences in " + data.occur_doc + " documents";
    const sentences = data.sentencesToShow;
    let lemmatizationNotice;
    if (data.NodeTypeFormatted === 'NP') {
      lemmatizationNotice = h('div', { class: 'node-info-lemmatization' }, [
        '(this term is ',
        h('a', {
          href: 'https://www.techtarget.com/searchenterpriseai/definition/lemmatization',
          target: '_blank',
          rel: 'noopener noreferrer',
          onClick: (e) => e.stopPropagation()
        }, 'lemmatized)')
      ]);
    }

    return h('div', { class: 'node-info' }, [
      h('div', { class: 'node-info-name' }, name),
      lemmatizationNotice,
      h('div', { class: 'node-info-type' }, type),
      h('div', { class: 'node-info-occurrences' }, occurrences),
      h('div', { class: 'node-info-toggle' }, [
        h('div', { class: 'show-sentences', onClick: this.toggleSentences }, 'Toggle sentences')
      ]),
      this.state.showSentences && h('div', { class: 'sentences-table-wrapper' }, [
        h('table', { class: 'sentences-table' }, [
          h('thead', {}, [
            h('tr', {}, [
              h('th', {}, 'Sentences')
            ])
          ]),
          h('tbody', {}, sentences.map(sentence =>
              h('tr', {}, [
                h('td', {}, sentence)
              ])
          ))
        ])
      ])
    ]);
  }
}

export default NodeInfo;
export { NodeInfo };
