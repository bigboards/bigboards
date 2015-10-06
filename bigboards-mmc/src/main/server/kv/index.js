var fs = require('fs'),
    fsu = require('../utils/fs-utils'),
    log = require('winston');

function KeyValueStore(file) {
    this.file = file;

    var self = this;

    // -- check if the file exists
    fsu.exists(file).then(function(exists) {
        if (!exists) {
            log.error('Unable to find the file backing the key/value store at '  + file + '!');
        } else {
            self.reload();
        }
    });
}

KeyValueStore.prototype.reload = function() {
    try {
        this.cache = fsu.readYamlFileSync(this.file);
    } catch (error) {
        throw new Error('Unable to parse the contents of the ' + this.file + ' file into a key/value store: ' + error.message);
    }
};

KeyValueStore.prototype.set = function(key, value) {
    var self = this;
    if( Object.prototype.toString.call( key ) === '[object Array]' ) {
        key.forEach(function(k) {
            self.cache[k.key] = k.value;
        })
    } else {
        this.cache[key] = value;
    }

    persist(this.file, this.cache);
};

KeyValueStore.prototype.get = function(key) {
    return this.cache[key];
};

KeyValueStore.prototype.remove = function(key) {
    var self = this;

    if( Object.prototype.toString.call( key ) === '[object Array]' ) {
        key.forEach(function(k) {
            delete self.cache[k];
        })
    } else {
        delete this.cache[key];
    }

    persist(this.file, this.cache);
};

KeyValueStore.prototype.list = function(prefix) {
    var result = {};

    for (var k in this.cache) {
        if (! this.cache.hasOwnProperty(k)) continue;

        if (k.indexOf(prefix) == 0) {
            result[k] = this.cache[k];
        }
    }

    return result;
};

module.exports = KeyValueStore;

function persist(path, contents) {
    fsu.writeYamlFileSync(path, contents);
    log.debug('KeyValueStore persisted to disk!');
}