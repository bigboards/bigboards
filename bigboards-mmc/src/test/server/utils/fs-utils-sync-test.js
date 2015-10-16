var fs = require('fs');
var should = require('should');
var tmp = require('tmp');
var uuid = require('node-uuid');

var fss = require('../../../main/server/utils/fs-utils-sync');
var fse = require('fs-extra');

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

        describe('generateDir', function () {
            it('should render the contents inside a directory', function () {
                var path = '/tmp/' + uuid.v4();

                fss.generateDir(__dirname + '/templates', path, { var1: 'foo', var2: 'bar' });

                fss.exists(path + '/dir1/file1.tmpl').should.eql(true);
                fss.exists(path + '/dir2/file2.tmpl').should.eql(true);

                fss.readFile(path + '/dir1/file1.tmpl').should.eql('foo');
                fss.readFile(path + '/dir2/file2.tmpl').should.eql('bar');

                //fss.rmdir(path);
            });

            it('should render a single file', function () {
                var path = '/tmp/' + uuid.v4();

                fss.generateFile(__dirname + '/templates/dir1/file1.tmpl', path, { var1: 'foo', var2: 'bar' });

                var content = fss.readFile(path);
                console.log('content: "' + content + '"');

                if  (content != 'foo') fail('Invalid content!');

                //fss.rmdir(path);
            });
        });
    });
});
