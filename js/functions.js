/* ===== functions.js =====
  Used to import external functions
  such as debug() outside the main file.
*/

const config = require('../json/config.json');
const fs = require('fs');

module.exports = {

  debug: function (message, type_, priority) {
    var colorType = "";
    var resetType = "\x1b[0m";
    var used_mem = (((process.memoryUsage().heapTotal) / 1024) / 1024).toFixed(0); 

    // Link Filter:
    if (message.indexOf('access_token') !== -1)
      message = message.split('access_token')[0] + 'token';

    if (type_ === "i") {var type = "[INFO]"; resetType = "";}
    if (type_ === "w") {var type = "[WARNING]"; colorType = "\x1b[1m\x1b[33m";}
    if (type_ === "e") {var type = "[ERROR]"; colorType = "\x1b[1m\x1b[31m";}
    if (type_ === "d") {var type = "[DEBUG]"; colorType = "\x1b[1m\x1b[36m";}

    if (priority === undefined) {priority = 0;}
    if (type_ === undefined) {type_ = "i"; var type = "[INFO]"; resetType = "";}

    if (priority >= 0) {
      console.log(colorType + type + resetType + "][" + used_mem + " MB][" + (new Date().toISOString()) + "]:" + colorType, message, resetType);
    }
    
    var archiveDebug = "[" + used_mem + " MB][" + (new Date().toISOString()) + "]: " + message;
    var dateToday = new Date().toLocaleDateString();

    if (type_ === "i") {
      fs.appendFileSync(__dirname + '/' + config.archiveDir + './infos/' + dateToday + '_(' + priority + ')' + '.txt', "[" + new Date().toISOString() + "]: " + archiveDebug + "\n");    
    }
    if (type_ === "w") {
      fs.appendFileSync(__dirname + '/' + config.archiveDir + './warnings/' + dateToday + '_(' + priority + ')' + '.txt', "[" + new Date().toISOString() + "]: " + archiveDebug + "\n");    
    }
    if (type_ === "e") {
      fs.appendFileSync(__dirname + '/' + config.archiveDir + './errors/' + dateToday + '_(' + priority + ')' + '.txt', "[" + new Date().toISOString() + "]: " + archiveDebug + "\n");    
    }
    if (type_ === "d") {
      fs.appendFileSync(__dirname + '/' + config.archiveDir + './debugs/' + dateToday + '_(' + priority + ')' + '.txt', "[" + new Date().toISOString() + "]: " + archiveDebug + "\n");    
    }
  },

  errorResponse: function (error, description) {
    return {
      "error": error,
      "error_description": description,
      "status": "error"
    }
  },

  tokenCheck: function (req) {
    if (!req.query.token)
      return [true, functions.errorResponse('invalid_request', 'A token is required to access this ressource.')];

    if (req.query.token !== config.apiToken)
      return [true, functions.errorResponse('invalid_token', 'The given token is invalid.')];

    // correct token -> no error
    return false;
  }

};

const functions = module.exports;