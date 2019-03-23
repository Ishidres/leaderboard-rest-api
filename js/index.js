const express = require('express');
const mariadb = require('mariadb');

const app = express();
const config = require('../json/config.json');
const functions = require('./functions.js');
const debug = functions.debug;

process.on('unhandledRejection', console.error)
.on('uncaughtException', async function (err) {
  console.log("uncaughtException:\n" + err.stack);
  process.exit(0);
});

const mariadbConnection = mariadb.createPool({
  host: config.mariadbHost,
  user: config.mariadbUsername,
  password: config.mariadbPassword,
  database: config.mariadbDatabase
});

mariadbConnection.getConnection().then(() => {
  debug("Connected to mariadb database.", "i", 1);
}).catch(err => {
  // throw err;
});

function apiResponse (req, res, paths) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  if (paths[2] === 'ping') {
    if (functions.tokenCheck(req)[0])
    return res.json(functions.tokenCheck(req)[1]);

    var timestamp = req.query.timestamp;

    if (!timestamp || isNaN(timestamp))
      return res.json(functions.errorResponse('invalid_request', 'Must provide a valid timestamp.'));

    var ping = new Date().getTime() - timestamp;
    res.json(
      {
        ping: ping,
        unit: 'ms',
        status: 'success'
      }
    );
  }

  if (paths[2] === 'insert') {
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
      if (!userInfo[key] && error === false) {
        error = true;
        res.json(functions.errorResponse('invalid_request', "The parameter '" + key + "' is missing or invalid."));
      }
    });

    var userInfoArray = [userInfo.id, userInfo.username, userInfo.score];
    
    if (!error) {
      debug('Successful API call:\n/insert:\n' + JSON.stringify(userInfo), 'd', 2);
      var sql = "INSERT INTO " + config.mariadbTableName + " (id, username, score) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE";
      debug('mariadb Query: ' + sql, 'i', 3);

      mariadbConnection.query(sql, userInfoArray)
      .catch(err => {
        res.json(functions.errorResponse('unknown_error', "This error might have been caused on server side. Please try again later."));
        console.error(err);
      })
      .then(result => {
        res.json({
          status: 'success',
          description: "The given user information has successfully been updated in the database."
        });
      });

    } else {
      debug('Failed API call:\n/insert:\n' + JSON.stringify(userInfo), 'w', 3);
    }
  }

  if (paths[3] === 'fetch') {
    if (functions.tokenCheck(req)[0])
      return res.json(functions.tokenCheck(req)[1]);
  
    debug('Successful API call:\n/fetch:\n' + JSON.stringify(userInfo), 'd', 2);
    var sql = "SELECT * FROM " + config.mariadbTableName;
    debug('mariadb Query: ' + sql, 'i', 3);

    mariadbConnection.query(sql)
    .catch(err => {
      res.json(functions.errorResponse('unknown_error', "This error might have been caused on server side. Please try again later."));
      console.error(err);
    })
    .then(result => {
      // no need to add meta to results
      delete result.meta;

      res.json({
        status: 'success',
        results: result
      });
    });
  }
}

app.listen(config.port, () => {
  debug("running on port " + config.port + ".", "i", 1);
});

app.get("/*", (req, res) => {
  var paths = req.params[0].split('/');

  if (paths.indexOf('quiz') === -1)
    return res.json(functions.errorResponse('invalid_request', 'Invalid endpoint given.'));

  apiResponse(req, res, paths);
});

app.post("/*", (req, res) => {
  var paths = req.params[0].split('/');

  if (paths.indexOf('quiz') === -1)
    return res.json(functions.errorResponse('invalid_request', 'Invalid endpoint given.'));

  apiResponse(req, res, paths);
});