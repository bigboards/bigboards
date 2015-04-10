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

module.exports.toTutorialElementPath = function(generationPath, path) {
    return generationPath + '/' + path.join('_') + '.bbt'
};

module.exports.toTutorialTocPath = function(generationPath) {
    return generationPath + '/toc.bbt'
};