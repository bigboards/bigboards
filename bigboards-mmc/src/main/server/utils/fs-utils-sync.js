var Q = require('q'),
    fs = require('fs'),
    yaml = require("js-yaml"),
    ini = require('ini'),
    swig = require('swig'),
    mkdirp = require('mkdirp');

var renderer = new swig.Swig({
    varControls: ['[[', ']]'],
    tagControls: ['[%', '%]'],
    cmtControls: ['[#', '#]'],
    locals: {
        lookup: function(lookupType, path) {
            return module.exports.readFile(path);
        }
    }
});

/**********************************************************************************************************************
 ** GENERAL
 *********************************************************************************************************************/

module.exports.absolute = function(path) {
    var p = path;
    if (p.indexOf('/') != 0) p = '/' + p;

    return process.cwd() + p;
};

module.exports.exists = function(path) {
    try {
        fs.accessSync(path, fs.F_OK);
        return true;
    } catch (err) {
        return false;
    }
};

module.exports.fileName = function(path) {
    if (path) {
        var start = path.lastIndexOf("/")+1;
        var end = path.length;
        return path.substring(start, end);
    }

    return undefined;
};

/**********************************************************************************************************************
 ** DIRECTORIES
 *********************************************************************************************************************/
module.exports.readDir = function(path) {
    return fs.readDirSync(path);
};

module.exports.mkdir = function(path) {
    return mkdirp.sync(path);
};

module.exports.isDirectory = function(path) {
    return fs.statSync(path).isDirectory();
};

module.exports.rmdir = function(path) {
    var deleteFolderRecursive = function(path) {
        if( fs.existsSync(path) ) {
            fs.readdirSync(path).forEach(function(file,index){
                var curPath = path + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };

    return deleteFolderRecursive(path);
};

/**********************************************************************************************************************
 ** TEMPLATING
 *********************************************************************************************************************/
module.exports.generateFile = function(templatePath, targetPath, variables) {
    var content = renderer.renderFile(templatePath, variables);
    this.writeFile(targetPath, content);
};

module.exports.generateDir = function(pathContainingTemplates, targetPath, variables) {
    var self = this;

    var dirContents = this.readDir(pathContainingTemplates);
    dirContents.forEach(function(child) {
        if (self.isDirectory(pathContainingTemplates + '/' + child)) {
            // -- also create the directory in the target path
            self.mkdir(targetPath + '/' + child);
            self.generateDir(pathContainingTemplates + '/' + child, targetPath + '/' + child, variables);
        } else {
            self.generateFile(pathContainingTemplates + '/' + child, targetPath, variables);
        }
    });
};

/**********************************************************************************************************************
 ** PLAIN FILES
 *********************************************************************************************************************/

module.exports.readFile = function(file) {
    return fs.readFile(file, {encoding: 'utf8'});
};

module.exports.writeFile = function(file, content) {
    return fs.writeFile(file, content, 'utf8');
};

/**********************************************************************************************************************
 ** YAML FILES
 *********************************************************************************************************************/

module.exports.readYamlFile = function(file) {
    return yaml.safeLoad(this.readFile(file));
};

module.exports.writeYamlFile = function(file, obj) {
    return this.writeFile(file, yaml.safeDump(obj));
};

/**********************************************************************************************************************
 ** JSON FILES
 *********************************************************************************************************************/

module.exports.readJsonFile = function(file) {
    return JSON.parse(this.readFile(file));
};

module.exports.writeJsonFile = function(path, obj) {
    this.writeFile(path, JSON.stringify(obj));
};

/**********************************************************************************************************************
 ** INI FILES
 *********************************************************************************************************************/
module.exports.readIniFile = function(file) {
    return ini.parse(this.readFile(file));
};

module.exports.writeIniFile = function(path, obj) {
    this.writeFile(path, ini.stringify(obj, { whitespace: true }));
};