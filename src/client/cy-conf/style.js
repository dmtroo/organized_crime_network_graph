export default `
core {
   active-bg-color: #fff;
   active-bg-opacity: 0.333;
}

edge {
   curve-style: haystack;
   haystack-radius: 0;
   opacity: 0.333;
   width: data(width);
   z-index: 0;
   overlay-opacity: 0;
  events: no;
}

node {
   width: data(Strength);
   height: data(Strength);
   font-size: data(FontSize);
   font-weight: bold;
   label: data(name);
   text-wrap: wrap;
   text-max-width: 99999999999px;
   text-overflow-wrap: anywhere;
   text-valign: center;
   text-halign: center;
   text-events: yes;
   text-background-color: gray;
   text-background-opacity: 0.4;
   color: #fff;
   text-outline-width: 1;
   text-outline-color: #fff;
   text-outline-opacity: 1;
   overlay-color: #fff;
   text-transform: uppercase;
}

node[NodeType = "NP"] {
   background-color: #FACD37;
   text-outline-color: #FACD37;
}

edge[interaction = "red"] {
   line-color: red;
}

edge[interaction = "green"] {
   line-color: green;
}

edge[interaction = "yellow"] {
   line-color: yellow;
}

node[NodeType = "LOC"] {
   background-color: #3498db;
   text-outline-color: #3498db;
}

node[NodeType = "PERSON"] {
   background-color: #DE3128;
   text-outline-color: #DE3128;
}

node[NodeType = "ORG"] {
   background-color: #3AAF38;
   text-outline-color: #3AAF38;
}

node[NodeType = "GPE"] {
   background-color: #3498db;
   text-outline-color: #3498db;
}

node[NodeType = "NORP"] {
   background-color: #9b59b6;
   text-outline-color: #9b59b6;
}

node.highlighted {
    min-zoomed-font-size: 0;
    z-index: 9999;
}

edge.highlighted {
   opacity: 0.8;
   width: 4;
   z-index: 9999;
}

.faded {
  events: no;
}

node.faded {
  opacity: 0.08;
}

edge.faded {
  opacity: 0.06;
}

.hidden {
   display: none;
}

.filtered {
    display: "none"
}

`;
