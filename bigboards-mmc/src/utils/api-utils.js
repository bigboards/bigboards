module.exports.handleError = function(res, error) {
    if (error.name == 'NotFoundError') {
        return res.send(404, error);
    } else if (error.name == 'IllegalParameterError') {
        return res.send(400, error);
    } else {
        return res.send(500, error);
    }
};
