var fsu = require('./fs-utils'),
    fss = require('./fs-utils-sync'),
    Q = require('q');

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

module.exports.toTintId = function(type, owner, slug) {
    return '[' + type + ']' + owner + '$' + slug;
};

module.exports.setTintState = function(metadataPath, metadata, newState) {
    metadata.state = newState;

    fss.writeJsonFile(metadataPath + '/meta.json', metadata);

    return Q();
};

module.exports.removeTintState = function(metadataPath, metadata) {
    console.log('removed the tints state for ' + metadata.id);
    var metadataFile = metadataPath + '/meta.json';

    return fsu.exists(metadataFile).then(function(exists) {
        if (exists) {
            return fsu.readJsonFile(metadataFile).then(function(installedTints) {
                var remainingTints = [];

                Object.keys(installedTints).forEach(function(property) {
                    if (! installedTints.hasOwnProperty(property)) return;

                    if (property != metadata.id)
                        remainingTints[property] = installedTints[property];
                });

                return fsu.jsonFile(metadataFile, remainingTints);
            });
        }
    });


};