module.exports = function(grunt) {
	var gtx = require('gruntfile-gtx').wrap(grunt);

    gtx.loadAuto();

    var gruntConfig = require('./grunt');
    gruntConfig.package = require('./package.json');

    gtx.loadNpmTasks('grunt-debug-task');

    // grunt bower integration
    gtx.loadNpmTasks('grunt-bower-install-simple');
    gtx.registerTask('bower-install', [ 'bower-install-simple' ]);

    // ApiDoc.js
    gtx.loadNpmTasks('grunt-apidoc');
    gtx.registerTask('apidoc', ['apidoc']);

    gtx.config(gruntConfig);

    // We need our bower components in order to develop
    gtx.alias('build:dev',  ['recess:app', 'copy:dev']);
    gtx.alias('build:dist', ['bower-install:dev', 'clean:dist', 'copy:dist', 'clean:dists', 'recess:min', 'concat:dist', 'uglify:dist', 'apidoc:mmc-api']);

    gtx.alias('release', ['bower-install:dev', 'build:dev', 'changelog:release', 'bump-commit']);
    gtx.alias('release-patch', ['bump-only:patch', 'release']);
    gtx.alias('release-minor', ['bump-only:minor', 'release']);
    gtx.alias('release-major', ['bump-only:major', 'release']);
    gtx.alias('prerelease', ['bump-only:prerelease', 'release']);

    gtx.finalise();
}
