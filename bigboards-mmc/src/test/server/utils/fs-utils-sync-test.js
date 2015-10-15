var fs = require('fs');
var should = require('should');
var tmp = require('tmp');

var fss = require('../../../main/server/utils/fs-utils-sync');

describe('utils', function () {

    describe('fs-utils-sync', function () {
        describe('exists', function () {
            it('should return true if the directory exists', function () {
                fss.exists('/home').should.eql(true);
            });

            it('should return true if the directory does not exist', function () {
                fss.exists('/foo/bar').should.eql(false);
            });
        });
    });
});
