global.i = 0;
var getUID = function () {
    return 'RawClient_' + global.i++;
};

exports.getUID = getUID;