const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const sha1 = require('sha1');
var dateFormat = require('dateformat');


const pool = mysql.createPool({
  connectionLimit: 10,
  host: '147.91.204.116',
  user: 'HighFive',
  password: 'admin admin',
  database: 'HighFive',
  debug: false
});

/*
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  database: 'highfive',
  debug: false
});
*/

router.get('/addExpense/:opis/:datum/:iznos', function (req, res, next) {
  var sess = req.session;
  pool.getConnection(function (err, connection) {
    if (err) {
      res.json({ "code": 100, "status": "Error in connection database" });
      return;
    }
    var user = sess.LoggedUser;
    var dat = req.params.datum;
    var expense = {
      idUser: user.id,
      opis: req.params.opis,
      datum: dateFormat(new Date(dat), "yyyy-mm-dd h:MM:ss"),
      iznos: req.params.iznos,
      tip: "rashod"
    }
   // console.log("rashodi " + user.id + " " + req.params.opis + " " + dateFormat(new Date(dat), "yyyy-mm-dd h:MM:ss") + " " + req.params.iznos);
    test = {};
    connection.query("insert into finance set ? ", expense, function (err, rows) {
      connection.release();
      if (!err) {
        test.success = true;
      } else {
        console.log(err);
        test.success = false;
      }
      res.json(test);

    })

    connection.on('error', function (err) {
      res.json({ "code": 100, "status": "Error in connection database" });
      return;
    });
  });

});

router.get('/addIncome/:opis/:datum/:iznos', function (req, res, next) {
  var sess = req.session;
  pool.getConnection(function (err, connection) {
    if (err) {
      res.json({ "code": 100, "status": "Error in connection database" });
      return;
    }
    var user = sess.LoggedUser;
    var dat = req.params.datum;
    var expense = {
      idUser: user.id,
      opis: req.params.opis,
      datum: dateFormat(new Date(dat), "yyyy-mm-dd h:MM:ss"),
      iznos: req.params.iznos,
      tip: "prihod"
    }
    test = {};

    //console.log("prihodi " + user.id + " " + req.params.opis + " " + dateFormat(new Date(dat), "yyyy-mm-dd h:MM:ss") + " " + req.params.iznos);
    connection.query("insert into finance set ? ", expense, function (err, rows) {
      connection.release();
      if (!err) {
        test.success = true;
      } else {
        console.log(err);
        test.success = false;
      }
      res.json(test);

    })

    connection.on('error', function (err) {
      res.json({ "code": 100, "status": "Error in connection database" });
      return;
    });
  });

});

router.get('/getAllFinances', function (req, res, next) {
  var sess = req.session;
  pool.getConnection(function (err, connection) {
    if (err) {
      res.json({ "code": 100, "status": "Error in connection database" });
      return;
    }
    var user = sess.LoggedUser;
    test = [];
    connection.query("select * from finance where idUser='" + user.id + "'", function (err, rows) {
      connection.release();
      if (!err) {
        console.log(rows.length+" ukupno finansija");
        if (rows.length > 0) {
          for (var i = 0; i < rows.length; i++)
            test[i] = rows[i];
            
          res.json(test);
        } else {
          console.log("finance nema nista");
          res.json(test);
        }
      } else {
        console.log("finance greska");
        res.json(test);
      }

      

    })

    connection.on('error', function (err) {
      res.json({ "code": 100, "status": "Error in connection database" });
      return;
    });
  });

});

module.exports = router;