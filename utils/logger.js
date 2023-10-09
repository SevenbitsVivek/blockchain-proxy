const config = require("../config");

function log(message) {
    if (config.LOGGING) {
        console.log(message);
    }
}

function info(message) {
    if (config.LOGGING) {
        console.info(message);
    }
}

function error(error) {
    if (config.LOGGING) {
        console.error(error);
    }
}

function table(data) {
    if (config.LOGGING) {
        console.table(data);
    }
}

module.exports={
    log:log,
    info:info,
    error:error,
    table:table
}