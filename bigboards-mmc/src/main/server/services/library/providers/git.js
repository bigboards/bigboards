var spawn = require('child_process').spawn,
    Q = require('q');

// -- git archive --remote=git://git.foo.com/project.git HEAD:path/to/directory filename | tar -x

module.exports.getDescriptor = function(url) {
    var defer = Q.defer();

    var buffer = '';

    var gitArchive = spawn("git", [
        'archive',
        '--remote=' + url,
        'HEAD',
        'tint.yml'
    ], {
        cwd: '/tmp'
    });

    var unpackArchive = spawn('tar', ['-x']);

    gitArchive.stdout.pipe(unpackArchive.stdin);

    unpackArchive.on('data', function(data) {
        buffer += data;
    });

    unpackArchive.on('close', function(code) {
        if (code != 0) return defer.reject("process ended with code " + code);
        else defer.resolve(buffer);
    });

    return defer.promise;
};