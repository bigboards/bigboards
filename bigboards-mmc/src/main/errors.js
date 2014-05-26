function NotFoundError(message) {
    this.name = "NotFoundError";
    this.message = message;
    this.stack = Error().stack;
}
NotFoundError.prototype = Object.create(Error.prototype);
module.exports.NotFoundError = NotFoundError;

function IllegalParameterError(message) {
    this.name = "IllegalParameterError";
    this.message = message;
    this.stack = Error().stack;
}
IllegalParameterError.prototype = Object.create(Error.prototype);
module.exports.IllegalParameterError = IllegalParameterError;