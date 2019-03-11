var bodyParser = require('body-parser');

const express = require('express');

var app = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const mysql = require('mysql');
const sha1 = require('sha1');

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
app.get('/addRole/:name/:perms/:idUser', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var role = {
            permission: req.params.perms,
            name: req.params.name,
            visible: 1,
            idUser: req.params.idUser
        }
        console.log(role);
        var success
        connection.query("insert into role SET ?", role, function (err, rows) {

            connection.release();
            if (!err) {
                success = true;
            } else {
                success = false;
                console.log(err + " greska u ubacivanju role");
            }

            res.json(success);
        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

app.get('/deleteRole/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var roleID = req.params.id;
        var success
        connection.query("delete from role where id='" + roleID + "'", function (err, rows) {

            connection.release();
            if (!err) {
                success = true;
            } else {
                success = false;
                console.log(err + " greska u ubacivanju role");
            }

            res.json(success);
        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});
module.exports = app;