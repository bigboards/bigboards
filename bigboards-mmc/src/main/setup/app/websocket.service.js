angular.module('bb.setup').factory('Socket', Socket);

Socket.$Inject = ['socketFactory'];

function Socket(socketFactory) {
    return socketFactory();
}
