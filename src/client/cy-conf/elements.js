import elements from '../../files/gb.json';


// process data
elements.nodes.forEach((n) => {
  const data = n.data;

  data.NodeTypeFormatted = data.NodeType;
  data.sentencesToShow = data.sentences;

  // save original position for use in animated layouts
  n.data.orgPos = {
    x: n.position.x,
    y: n.position.y
  };

  // zero width space after dashes to allow for line breaking
  data.name = data.name.replace(/[-]/g, '-\u200B');
});

export default elements;