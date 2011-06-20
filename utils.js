var i = 0;
var getUID = function () {
    return 'RawClient_' + i++;
};

exports.getUID = getUID;