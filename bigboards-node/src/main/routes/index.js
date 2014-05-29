var postman = require('../postman');

module.exports.attachHandlers = function attachHandlers(server) {

    server.get('/api/v1/metrics', postman.get);

    // or something like
    // server.post('/something', something.put);
};
