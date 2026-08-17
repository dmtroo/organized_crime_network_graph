// Graph data is loaded lazily (see AppComponent#loadGraph) instead of being
// statically imported here, so the ~100MB country datasets aren't baked
// into the JS bundle and downloaded on every page load.
const elements = { nodes: [], edges: [] };

export default elements;