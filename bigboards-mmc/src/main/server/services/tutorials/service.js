var Q = require('q'),
    uuid = require('node-uuid'),
    Errors = require('../../errors'),
    yaml = require("js-yaml"),
    mkdirp = require('mkdirp'),
    fsu = require('../../utils/fs-utils'),
    fs = require('fs'),
    log = require('winston'),
    tu = require('../../utils/tint-utils');

function TutorialService(settings, configuration, services, templater) {
    this.settings = settings;
    this.configuration = configuration;
    this.services = services;
    this.templater = templater;

    var self = this;
}

/*********************************************************************************************************************
 * TINTS
 *********************************************************************************************************************/
TutorialService.prototype.listInstalled = function() {
    var self = this;

    var promises = [];

    var typeStat = fs.statSync(self.settings.dir.tints + '/tutor');
    if (typeStat.isDirectory()) {
        var owners = fs.readdirSync(self.settings.dir.tints + '/tutor');

        for (var j in owners) {
            var files = fs.readdirSync(self.settings.dir.tints + '/tutor/' + owners[j]);

            for (var k in files) {
                promises.push(tu.parseManifest(self.services.hex, self.templater, self.settings.dir.tints, 'tutor', owners[j], files[k]));
            }
        }
    }

    return Q.allSettled(promises).then(function (responses) {
        var result = [];

        for (var i in responses) {
            if (responses[i] != null) {
                result.push(responses[i].value);
            }
        }

        return result;
    });
};

TutorialService.prototype.get = function(owner, tint) {
    return tu.parseManifest(this.services.hex, this.templater, this.settings.dir.tints, 'tutor', owner, tint);
};

TutorialService.prototype.getChapter = function(owner, slug, path) {
    var self = this;

    return this.get(owner, slug).then(function(tint) {
        var element = tint.tutor.toc;
        for (var idx in path) {
            element = element[path[idx]];
            if (! element.children) break;

            element = element.children;
        }

        var stack = tu.toChapterStack(tint.tutor.toc, path);

        var resourcePath = self.settings.dir.tints + '/tutor/' + owner + '/' + slug + '/' + element.file;

        return fsu.exists(resourcePath).then(function(exists) {
            if (exists) {
                return fsu.readFile(resourcePath).then(function(content) {
                    return {
                        path: path,
                        content: content,
                        next: tu.nextChapter(stack, path),
                        previous: tu.previousChapter(stack, path)
                    }
                });
            } else {
                return Q.fail('No such file or directory: ' + resourcePath);
            }
        });
    });
};

TutorialService.prototype.remove = function(tint) {
    return this.services.task.invoke(tint.type + '_uninstall', { tint: tint});
};

module.exports = TutorialService;