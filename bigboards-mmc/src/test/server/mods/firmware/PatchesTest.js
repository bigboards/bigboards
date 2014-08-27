var fs = require('fs');
var should = require('should');
var tmp = require('tmp');

var Firmware = require('../../../../main/server/mods/firmware');
var config = require('../../../../main/server/config');
var fsUtil = require('../../../../main/server/utils/fs-utils');

describe('firmware', function () {

    describe('config', function () {
        var firmware;

        beforeEach(function () {
            firmware = new Firmware(config.firmware.patchesDirectory, null, null);
        });

        it('should have an patches directory', function () {
            firmware.should.have.property('patchesDirectory');
            firmware.patchesDirectory.should.eql(config.firmware.patchesDirectory);
        });

        it('should have an patches directory equal to configuration', function () {
            firmware.should.have.property('patchesDirectory');
            firmware.patchesDirectory.should.eql(config.firmware.patchesDirectory);
        });
    });

    describe('patches', function () {

        it('should error on non-existing folder', function (done) {
            var firmware = new Firmware('/some/dummy/directory', null, null);

            firmware.availablePatches().fail(function (error) {
                error.should.throw();
                done();
            });
        });

        it('should return empty list on empty folder', function (done) {
            tmp.dir(function tempDirCreated(err, dir) {
                if (err) done(err);

                var firmware = new Firmware(dir, null, null);
                firmware.availablePatches().then(function (patches) {
                    patches.should.be.an.instanceOf(Array).and.have.lengthOf(0);
                    done();
                }).fail(function (error) {
                    done(error);
                });
            });
        });

        it('should return a one-element list on a simple folder', function (done) {
            tmp.dir(function tempDirCreated(err, dir) {
                if (err) done(err);

                tmp.file({dir: dir}, function tmpFileCreated(err, file) {
                    if (err) done(err);

                    var firmware = new Firmware(dir, null, null);
                    firmware.availablePatches().then(function (patches) {
                        patches.should.be.an.instanceOf(Array).and.have.lengthOf(1);

                        var fileName = fsUtil.fileName(file);
                        patches.should.containEql({name: fileName, installedOn: undefined});
                        done();
                    }).fail(function (error) {
                        done(error);
                    });
                });
            });
        });

        it('should return a list of filename in a folder', function (done) {
            tmp.dir(function tempDirCreated(err, dir) {
                if (err) done(err);

                tmp.file({dir: dir}, function tmpFileCreated(err, file) {

                    tmp.file({dir: dir}, function tmpFileCreated(err, fileTwo) {
                        if (err) done(err);

                        var firmware = new Firmware(dir, null, null);
                        firmware.availablePatches().then(function (patches) {
                            patches.should.be.an.instanceOf(Array).and.have.lengthOf(2);

                            var fileName = fsUtil.fileName(file);
                            var fileTwoName = fsUtil.fileName(fileTwo);
                            patches.should.containEql({name: fileName, installedOn: undefined});
                            patches.should.containEql({name: fileTwoName, installedOn: undefined});
                            done();
                        }).fail(function (error) {
                            done(error);
                        });
                    });
                });
            });
        });
    });

    describe('asPatch', function() {
        it('should return a patch object', function() {
            Firmware.asPatch('a', 'b').should.eql({name: 'a', installedOn: 'b'});
        });
    });

    describe('lineAsPatch', function() {
        it('should return a patch object', function() {
            Firmware.lineAsPatch('a | b').should.eql({name: 'a', installedOn: 'b'});
        });
        it('should return a patch object with undefined installedOn when no timestamp', function() {
            Firmware.lineAsPatch('a').should.eql({name: 'a', installedOn: undefined});
        });
        it('should return a patch object with undefined name', function() {
            Firmware.lineAsPatch('| b').should.eql({name: undefined, installedOn: 'b'});
        });
        it('should return a patch object with undefined installedOn when only pipe', function() {
            Firmware.lineAsPatch('a |').should.eql({name: 'a', installedOn: undefined});
        });
    });

    describe('installedPatches', function() {
        it('should error on non-existing versions file', function(done) {
            var firmware = new Firmware(null, '/some/file/that/does/not/exist.txt', null);
            firmware.installedPatches().fail(function (error) {
                error.should.throw();
                done();
            });
        });

        it('should return empty list on empty versions', function(done) {
            tmp.file(function tmpFileCreated(err, file) {
                if (err) done(err); // err is not good

                var firmware = new Firmware(null, file, null);
                firmware.installedPatches().then(function(patches) {
                    patches.should.be.an.instanceOf(Array).and.have.lengthOf(0);
                    done();
                }).fail(function(error) {
                    done(error);
                });
            });
        });

        it('should return simple list on our test versions', function(done) {
            var file = './bigboards-mmc/src/test/server/mods/firmware/versions.tst';
            var firmware = new Firmware(null, file, null);
            firmware.installedPatches().then(function(patches) {
                patches.should.be.an.instanceOf(Array).and.have.lengthOf(1);
                patches.should.containEql({name: 'zpatch', installedOn: 'timestamp'});
                done();
            }).fail(function(error) {
                done(error);
            });
        });

//        it('should return simple list on simple versions', function(done) {
//            tmp.file(function tmpFileCreated(err, file) {
//                if (err) done(err);
//
//                fs.appendFile(file, 'patch | timestamp ', function (err) {
//                    if (err) done(err);
//
//                    var firmware = new Firmware(null, file, null);
//                    firmware.installedPatches().then(function(patches) {
//                        patches.should.be.an.instanceOf(Array).and.have.lengthOf(1);
//                        patches.should.containEql({name: 'patch', installedOn: 'timestamp'});
//                        done();
//                    }).fail(function(error) {
//                        done(error);
//                    });
//                });
//            });
//        });
    });

    describe('patches', function() {
        it('should fail when available patches do not exist', function(done) {
            tmp.file(function tmpFileCreated(err, file) {
                var firmware = new Firmware('/some/dummy/directory', file, null);

                firmware.patches().fail(function (error) {
                    error.should.throw();
                    done();
                });
            });
        });

        it('should return an empty list when no available and no installed patches', function(done) {
            tmp.dir(function tmpDirCreated(err, dir) {
                if (err) done(err);

                tmp.file(function tmpFileCreated(err, file) {
                    if (err) done(err);

                    var firmware = new Firmware(dir, file, null);
                    firmware.patches().then(function(patches) {
                        patches.should.be.instanceOf(Array).and.have.lengthOf(0);
                        done();
                    }).fail(function(err) {
                        done(err);
                    });
                });
            });
        });

        it('should return the installed patches list when no available patches', function(done) {
            tmp.dir(function tmpDirCreated(err, dir) {
                if (err) done(err);

                var file = './bigboards-mmc/src/test/server/mods/firmware/versions.tst';
                var firmware = new Firmware(dir, file, null);
                firmware.patches().then(function(patches) {
                    patches.should.be.instanceOf(Array).and.have.lengthOf(1);
                    patches.should.containEql({name: 'zpatch', installedOn: 'timestamp'});
                    done();
                }).fail(function(err) {
                    done(err);
                });
            });
        });

        it('should return the available patches when no installed patches', function(done) {
            tmp.dir(function tmpDirCreated(err, dir) {
                if (err) done(err);

                tmp.file({dir: dir}, function tmpPatchCreated(err, patch) {
                    if (err) done(err);

                    tmp.file(function tmpFileCreated(err, file) {
                        if (err) done(err);

                        var firmware = new Firmware(dir, file, null);
                        firmware.patches().then(function(patches) {
                            patches.should.be.instanceOf(Array).and.have.lengthOf(1);

                            var patchName = fsUtil.fileName(patch);
                            patches.should.containEql({name: patchName, installedOn: undefined});
                            done();
                        }).fail(function(err) {
                            done(err);
                        });
                    });
                });
            });
        });

        it('should return an the available and installed patches', function(done) {
            tmp.dir(function tmpDirCreated(err, dir) {
                if (err) done(err);

                tmp.file({dir: dir}, function tmpPatchCreated(err, patch) {
                    if (err) done(err);

                    var file = './bigboards-mmc/src/test/server/mods/firmware/versions.tst';
                    var firmware = new Firmware(dir, file, null);
                    firmware.patches().then(function(patches) {
                        patches.should.be.instanceOf(Array).and.have.lengthOf(2);

                        var patchName = fsUtil.fileName(patch);

                        // installed before available
                        patches[0].should.eql({name: 'zpatch', installedOn: 'timestamp'});
                        patches[1].should.eql({name: patchName, installedOn: undefined});
                        done();
                    }).fail(function(err) {
                        done(err);
                    });
                });
            });
        });

    });

    describe('comparePatches', function() {
        it('should compare patchs by installedOn then by name', function() {
            Firmware.comparePatches({name: 'a', installedOn: '1'}, {name: 'b', installedOn: '2'}).should.eql(-1);
            Firmware.comparePatches({name: 'a', installedOn: '2'}, {name: 'b', installedOn: '1'}).should.eql(1);
            Firmware.comparePatches({name: 'a', installedOn: '1'}, {name: 'b', installedOn: '1'}).should.eql(-1);
            Firmware.comparePatches({name: 'b', installedOn: '1'}, {name: 'a', installedOn: '1'}).should.eql(1);
            Firmware.comparePatches({name: 'a', installedOn: '1'}, {name: 'a', installedOn: '1'}).should.eql(0);
        });

        it('should compare installed patchs before available patches', function() {
            Firmware.comparePatches({name: 'a', installedOn: '1'}, {name: 'b', installedOn: undefined}).should.eql(-1);
            Firmware.comparePatches({name: 'a', installedOn: undefined}, {name: 'b', installedOn: '1'}).should.eql(1);
            Firmware.comparePatches({name: 'a', installedOn: undefined}, {name: 'b', installedOn: undefined}).should.eql(-1);
            Firmware.comparePatches({name: 'b', installedOn: undefined}, {name: 'a', installedOn: undefined}).should.eql(1);
            Firmware.comparePatches({name: 'a', installedOn: undefined}, {name: 'a', installedOn: undefined}).should.eql(0);
        });
    });
});
