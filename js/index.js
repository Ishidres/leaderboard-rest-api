const express = require('express');
const mysql = require('mysql');

const app = express();
const config = require('../json/config.json');
const functions = require('./functions.js');
const debug = functions.debug;

process.on('unhandledRejection', console.error)
.on('uncaughtException', async function (err) {
  console.log("uncaughtException:\n" + err.stack);
  process.exit(0);
});

const mysqlConnection = mysql.createConnection({
  host: config.mysqlHost,
  user: config.mysqlUsername,
  password: config.mysqlPassword
});

mysqlConnection.connect(function(err) {
  // if (err) throw err;
  debug("Connected to MySQL database.", "i", 1);
});

app.listen(config.port, () => {
  debug("running on port " + config.port + ".", "i", 1);
});

app.get("/ping", (req, res) => {
  var timestamp = req.query.timestamp;

  if (!timestamp)
    return res.json(functions.errorResponse('invalid_request', 'Must provide a valid timestamp.'));

  var ping = new Date().getTime() - timestamp;
  return res.json(
    {
      ping: ping,
      unit: 'ms'
    });
});

app.get("/insert", (req, res) => {
  if (functions.tokenCheck(req)[0])
    return res.json(functions.tokenCheck(req)[1]);

  var userInfo = {
    id: Number(req.query.id),
    username: req.query.username,
    score: Number(req.query.score)
  }
  var error = false;

  // check for missing parameters and escape provided data
  Object.keys(userInfo).map(function(key) {
    if (!userInfo[key]) {
      error = true;
      res.json(functions.errorResponse('invalid_request', "The parameter '" + key + "' is missing or invalid."));
    }
    
    // prevent injection attacks
    userInfo[key] = mysql.escape(userInfo[key]);
  });
  
  if (!error) {
    debug('Successful API call:\n/insert:\n' + JSON.stringify(userInfo), 'd', 2);
    var sql = "INSERT INTO " + config.mysqlTableName + " (id, username, score) VALUES (" + userInfo.id + ", " + userInfo.username + ", " + userInfo.score + ") ON DUPLICATE KEY UPDATE";
    debug('MySQL Query: ' + sql, 'i', 3);

    mysqlConnection.query(sql, function (err, result) {
      if (err) {
        res.json(functions.errorResponse('unknown_error', "This error might have been caused on server side. Please try again later."));
        throw err;
      }
    });

  } else {
    debug('Failed API call:\n/insert:\n' + JSON.stringify(userInfo), 'w', 3);
  }
});

app.get("/*", (req, res) => {
  res.json(functions.errorResponse('invalid_request', 'Invalid endpoint given.'));
});

app.post("/*", (req, res) => {
  res.json(functions.errorResponse('invalid_request', 'Invalid endpoint given.'));
});