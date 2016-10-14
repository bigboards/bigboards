angular
    .module('bb.setup')
    .factory('Application', Application);

Application.$Inject = [];

function Application() {
    var name = "";
    var shortId = "";
    var nodes = [];

    function setName(value) { name = value; }
    function setShortId(value) { shortId = value; }
    function listNodes() { return nodes; }

    function addNode(node) {
        nodes.push(node);
    }

    function removeNode(node) {
        nodes.splice(nodes.indexOf(node), 1);
    }


    return {
        setName: setName,
        setShortId: setShortId,
        addNode: addNode,
        removeNode: removeNode,
        listNodes: listNodes
    };
}