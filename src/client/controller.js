import EventEmitter from 'eventemitter3';
import memoize from 'lodash.memoize';

const layoutPadding = 40;
const animationDuration = 500;
const easing = 'ease';

// search parameters
const minMetricValue = 0.25; // filter out nodes from search results if they have total scores lower than this
const minSimilarityValue = 0; // only include in total metric if the individual sim val is on [0.5, 1]

//const delayPromise = duration => new Promise(resolve => setTimeout(resolve, duration));

const getOrgPos = n => Object.assign({}, n.data('orgPos'));

class Controller {
    constructor({cy}) {
        this.cy = cy;
        this.bus = new EventEmitter();
        this.menu = false;
        this.leftMenu = false;
        this.nodes = cy.nodes();
        this.searchMatchNodes = cy.collection();
        this.initialElements = cy.elements();
    }

// Right Menu Methods
    isMenuOpen() {
        return this.menu;
    }

    openMenu() {
        this.menu = true;

        this.bus.emit('openMenu');
        this.bus.emit('toggleMenu', true);
    }

    async closeMenu() {
        this.menu = false;

        this.bus.emit('closeMenu');
        this.bus.emit('toggleMenu', false);
    }

    toggleMenu() {
        if (this.isMenuOpen()) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    isLeftMenuOpen() {
        return this.leftMenu;
    }

    openLeftMenu() {
        this.leftMenu = true;

        this.bus.emit('openLeftMenu');
        this.bus.emit('toggleLeftMenu', true);
    }

    closeLeftMenu() {
        this.leftMenu = false;

        this.bus.emit('closeLeftMenu');
        this.bus.emit('toggleLeftMenu', false);
    }

    toggleLeftMenu() {
        if (this.isLeftMenuOpen()) {
            this.closeLeftMenu();
        } else {
            this.openLeftMenu();
        }
    }

    isInfoShown() {
        return this.infoNode != null;
    }

    showInfo(node) {
        this.infoNode = node;

        this.bus.emit('showInfo', node);
    }

    hideInfo() {
        this.bus.emit('hideInfo', this.infoNode);

        this.infoNode = null;
    }

    hasHighlight() {
        return this.lastHighlighted != null;
    }

    async highlight(node) {
        const {cy} = this;

        if (this.highlightInProgress) {
            return Promise.resolve();
        }

        this.highlightInProgress = true;

        const allEles = cy.elements();
        const nhood = this.lastHighlighted = node.closedNeighborhood();
        const others = this.lastUnhighlighted = allEles.not(nhood);
        const isolated = allEles.absoluteComplement(nhood);

        const highlightNodeAndNeighborhood = () => {
            cy.batch(() => {
                allEles.removeClass('faded highlighted hidden');

                nhood.addClass('highlighted');
                others.addClass('faded');
                isolated.addClass('hidden');
            });

            return Promise.resolve();
        };

        this.bus.emit('highlight', node);

        return (
            highlightNodeAndNeighborhood()
                .then(() => {
                    this.highlightInProgress = false;
                    this.bus.emit('highlightend', node);
                })
        );
    }

    async unhighlight() {
        if (!this.hasHighlight()) {
            return Promise.resolve();
        }

        const {cy} = this;
        const allEles = cy.elements();
        const allNodes = cy.nodes();

        cy.stop();
        allNodes.stop();

        const nhood = this.lastHighlighted;
        const others = this.lastUnhighlighted;

        this.lastHighlighted = this.lastUnhighlighted = null;

        const hideOthers = function () {
            others.addClass('hidden');

            return Promise.resolve();
        };

        const resetClasses = function () {
            cy.batch(function () {
                allEles.removeClass('hidden').removeClass('faded').removeClass('highlighted');
            });

            return Promise.resolve();
        };

        const animateToOrgPos = function (nhood) {
            return Promise.all(nhood.nodes().map(n => {
                return n.animation({
                    position: getOrgPos(n),
                    duration: animationDuration,
                    easing: easing
                }).play().promise();
            }));
        };

        const restorePositions = () => {
            cy.batch(() => {
                others.nodes().positions(getOrgPos);
            });

            return animateToOrgPos(nhood.nodes());
        };

        this.bus.emit('unhighlight');

        return (
            Promise.resolve()
                .then(hideOthers)
                .then(restorePositions)
                .then(resetClasses)
        );
    }

    updateSearch(queryString) {
        const normalize = str => str.toLowerCase();
        const getWords = str => str.split(/\s+/);
        const queryWords = getWords(normalize(queryString));

        const addWords = (wordList, wordsStr) => {
            if (wordsStr) {
                wordList.push(...getWords(normalize(wordsStr)));
            }
        };

        const cacheNodeWords = node => {
            const data = node.data();
            const wordList = [];

            addWords(wordList, data.name);
            //addWords(wordList, data.Synonym);
            addWords(wordList, data.NodeTypeFormatted);
            addWords(wordList, data.Type);
            //addWords(wordList, data.Country);

            node.data('words', wordList);
        };

        const getStringSimilarity = (queryWord, nodeWord) => {
            const index = nodeWord.indexOf(queryWord);

            if (index === 0) {
                const diff = Math.abs(nodeWord.length - queryWord.length);
                const maxLength = Math.max(nodeWord.length, queryWord.length);

                return 1 - (diff / maxLength);
            } else {
                return 0;
            }
        };

        const getMetric = (node, queryWords) => {
            const nodeWords = node.data('words');
            if (!nodeWords) return 0;
            let score = 0;

            for (let i = 0; i < nodeWords.length; i++) {
                let nodeWord = nodeWords[i];

                for (let j = 0; j < queryWords.length; j++) {
                    let queryWord = queryWords[j];
                    let similarity = getStringSimilarity(queryWord, nodeWord);

                    if (similarity > minSimilarityValue) {
                        score += similarity;
                    }

                }
            }
            return score;
        };

        const getNodeMetric = memoize(node => getMetric(node, queryWords), node => node.id());

        const currentNodes = this.cy.nodes();

        if (!this.cachedNodeWords) {
            this.cy.batch(() => {
                currentNodes.forEach(cacheNodeWords);
            });

            this.cachedNodeWords = true;
        }

        this.searchMatchNodes = currentNodes.filter(node => {
            return getNodeMetric(node) > minMetricValue;
        }).sort((nodeA, nodeB) => {
            return getNodeMetric(nodeB) - getNodeMetric(nodeA);
        });

        this.bus.emit('updateSearch', this.searchMatchNodes);

        return this.searchMatchNodes;
    }

    getSearchMatchNodes() {
        return this.searchMatchNodes;
    }

    invalidateWordCache() {
        this.cachedNodeWords = false;
    }

    applyFilter(percentage, nodeTypes, edgeColors) {
        return new Promise(resolve => {
            setTimeout(() => {
                const {cy} = this;
                const totalNodes = cy.nodes().length;
                percentage = percentage === '' ? 100 : percentage;
                const topX = Math.floor((percentage / 100) * totalNodes);

                const sortedNodesByStrength = cy.nodes().sort((a, b) => b.data("Strength") - a.data("Strength"));
                const topPercentageNodes = sortedNodesByStrength.slice(0, topX);

                // Filter nodes by Node Type
                const filteredNodesByType = topPercentageNodes.filter((node) => {
                    if (nodeTypes.length === 0) {
                        return true;
                    }
                    return nodeTypes.includes(node.data('NodeType'));
                });

                const filteredNodeIds = filteredNodesByType.map(node => node.id());

                const connectedEdges = filteredNodesByType.connectedEdges();

                // Filter edges based on the edge colors
                const preFilteredEdges = connectedEdges.filter(edge => {
                    if (edgeColors.length === 0) {
                        return true;
                    }
                    return edgeColors.includes(edge.data('interaction'));
                });

                const filteredEdges = preFilteredEdges.filter(edge => {
                    const sourceNodeId = edge.source().id();
                    const targetNodeId = edge.target().id();

                    return filteredNodeIds.includes(sourceNodeId) && filteredNodeIds.includes(targetNodeId);
                });

                const connectedNodeIds = new Set();
                filteredEdges.forEach(edge => {
                    connectedNodeIds.add(edge.source().id());
                    connectedNodeIds.add(edge.target().id());
                });

                const connectedNodes = filteredNodesByType.filter(node => connectedNodeIds.has(node.id()));

                cy.remove(cy.elements());

                cy.add(connectedNodes);
                cy.add(filteredEdges);

                const layout = cy.layout({
                    name: "preset",
                    positions: getOrgPos,
                    fit: true,
                    padding: layoutPadding,
                    animate: true,
                    animationDuration: animationDuration,
                    animationEasing: easing
                });

                layout.run();
                resolve();
            }, 0);
        });
    }

    restoreInitialElements() {
        return new Promise(resolve => {
            setTimeout(() => {
                const {cy} = this;
                // Reset search query
                this.updateSearch('');

                // Invalidate word cache
                this.invalidateWordCache();

                // Remove all elements from cy
                cy.remove(cy.elements());

                // Add the initial elements
                cy.add(this.initialElements);

                // Run a new layout to update the view
                const layout = cy.layout({
                    name: "preset",
                    positions: getOrgPos,
                    fit: true,
                    padding: layoutPadding,
                    animate: true,
                    animationDuration: animationDuration,
                    animationEasing: easing
                });

                layout.run();
                resolve();
            }, 0);
        });
    }


}

export default Controller;
export {Controller};