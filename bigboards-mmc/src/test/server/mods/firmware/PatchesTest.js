var Firmware = require('../../../../main/server/mods/firmware');
var config = require('../../../../main/server/config');
var fsUtil = require('../../../../main/server/utils/fs-utils');
var should = require('should');
var tmp = require('tmp');

describe('firmware', function () {

    describe('config', function () {
        var firmware;

        beforeEach(function () {
            firmware = new Firmware(config.firmware.patchesDirectory, null);
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
            var firmware = new Firmware('/some/dummy/directory', null);

            firmware.patches().catch(function (error) {
                error.should.throw();
                done();
            });
        });

        it('should return empty list on empty folder', function (done) {
            tmp.dir(function tempDirCreated(err, dir) {
                if (err) done(err);

                var firmware = new Firmware(dir, null);
                firmware.patches().then(function (patches) {
                    patches.should.be.an.instanceOf(Array).and.have.lengthOf(0);
                    done();
                }).catch(function (error) {
                    done(error);
                });
            });
        });

        it('should return a one-element list on a simple folder', function (done) {
            tmp.dir(function tempDirCreated(err, dir) {
                if (err) done(err);

                tmp.file({dir: dir}, function tmpFileCreated(err, file) {
                    if (err) done(err);

                    var firmware = new Firmware(dir, null);
                    firmware.patches().then(function (patches) {
                        patches.should.be.an.instanceOf(Array).and.have.lengthOf(1);

                        var fileName = fsUtil.fileName(file);
                        patches.should.containEql(fileName);
                        done();
                    }).catch(function (error) {
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

                        var firmware = new Firmware(dir, null);
                        firmware.patches().then(function (patches) {
                            patches.should.be.an.instanceOf(Array).and.have.lengthOf(2);

                            var fileName = fsUtil.fileName(file);
                            var fileTwoName = fsUtil.fileName(fileTwo);
                            patches.should.containEql(fileName);
                            patches.should.containEql(fileTwoName);
                            done();
                        }).catch(function (error) {
                            done(error);
                        });
                    });
                });
            });
        });
    });
});
