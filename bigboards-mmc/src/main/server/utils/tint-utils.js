var fsu = require('./fs-utils');

module.exports.parseManifest = function(hexService, templater, tintRoot, type, owner, slug) {
    var tintDir = tintRoot + '/' + type + '/' + owner + '/' + slug;

    return fsu.readYamlFile(tintDir + '/tint.yml').then(function(content) {
        return hexService.listNodes().then(function(nodes) {
            return templater.createScope(nodes).then(function(scope) {
                return templater.templateWithScope(content, scope);
            });
        }).fail(function(error) {
            console.log('unable to parse the tint meta file: ' + error.message);
        });
    });
};

module.exports.toChapterStack = function(toc, path) {
    var stack = [ toc ];
    for (var idx = 0; idx < path.length - 1; idx++) {
        var currentCollection = stack[stack.length - 1];

        // -- check if the given index is correct
        if (path[idx] >= currentCollection.length)
            throw new Error('Invalid path [' + path.join(',') + ']');

        var currentItem = currentCollection[path[idx]];

        // -- check if the element has children
        if (!currentItem.children) {
            if (idx != path.length - 1) throw new Error('Too many elements in path [' + path.join(',') + ']');
            else continue;
        }

        stack.push(currentItem.children);
    }

    return stack;
};

module.exports.previousChapter = function(stack, path) {
    var newPath = path.slice();

    // -- check if the path still holds any elements
    if (newPath.length == 0) return null;

    // -- update the index
    newPath[newPath.length - 1]--;

    // -- get the index
    var nextIdx = newPath[newPath.length - 1];

    // -- check if the index is within the bounds
    if (nextIdx >= 0) {
        return newPath;
    } else {
        return this.previousChapter(stack, newPath.slice(0, -1));
    }
};

module.exports.nextChapter = function(stack, path) {
    var newPath = path.slice();

    // -- check if the path still holds any elements
    if (newPath.length == 0) return null;

    // -- update the index
    newPath[newPath.length - 1]++;

    // -- get the index
    var nextIdx = newPath[newPath.length - 1];

    // -- check if the index is within the bounds
    if (nextIdx < stack[newPath.length - 1].length) {
        return newPath;
    } else {
        return this.nextChapter(stack, newPath.slice(0, -1));
    }
};