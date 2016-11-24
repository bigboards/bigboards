var fsu = require('../../../main/server/utils/fs-utils');

describe('utils', function () {
    describe('write', function() {
        it('should write null values and null string', function() {
           fsu.jsonFile('/tmp/test.json', { 'nullValue': null, 'nullString': 'null'});
           fsu.readJsonFile('/tmp/test.json').then(function(data) {
               data.nullValue.should.eql(null);
               data.nullString.should.eql('null');
           })
        });
    });
});