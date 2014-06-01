var S = require('string');

/**
 * A module for the Ansible provisioning tool.
 */

module.exports.invokeAction = function(tintId, actionId, cb) {
    var tintFolder = '/opt/bb/tints.d/' + tintId;

    run_cmd('ansible-playbook -i ' + tintFolder + '/hosts ' + tintFolder + '/playbooks/action-' + actionId + '.yml', function(error, stdout, stderr) {
        console.info(stdout);

        if (error != null && error != "") {
            console.info(stderr);
            return cb(error, null);
        }

        var outputLines = S(stdout).lines();

        var result = {
            full: stdout,
            error: stderr,
            parsed: {}
        };
        var currentPlay = null;
        var currentTask = null;

        for (var i = 0; i < outputLines.length; i++) {
            var line = S(outputLines[i]);

            if (line.startsWith("PLAY")) {
                currentPlay = line.substring(line.indexOf('[') + 1, line.indexOf(']'));

                if (currentPlay != "") {
                    result.parsed[currentPlay] = {};
                    console.log("result.parsed[" + currentPlay + "] = {}");
                }

            } else if (S(outputLines[i]).startsWith("TASK")) {
                currentTask = line.substring(line.indexOf('[') + 1, line.indexOf(']'));

                result.parsed[currentPlay][currentTask] = {};
                console.log("result.parsed[" + currentPlay + "][" + currentTask + "] = {}");

            } else if (line.startsWith('ok') || line.startsWith('changed') || line.startsWith('unreachable') || line.startsWith('failed')) {
                if (! result.parsed[currentPlay][currentTask]) continue;

                var status = line.substring(0, line.indexOf(':'));
                var node = line.substring(line.indexOf('[') + 1, line.indexOf(']'));

                console.log("result.parsed[" + currentPlay + "][" + currentTask + "][" + node + "] = " + status);
                result.parsed[currentPlay][currentTask][node] = status.toString();

            }
        }

        cb(null, result);
    });
};

module.exports.sync = function() {

};

module.exports.status = function() {

};

function run_cmd(cmd, callBack ) {
    var exec = require('child_process').exec;

    exec(cmd, callBack);

//    var spawn = require('child_process').spawn;
//    var child = spawn(cmd, args);
//    var resp = "";
//
//    child.stdout.on('data', function (buffer) { resp += buffer.toString() });
//    child.stdout.on('end', function() { callBack (resp) });
}