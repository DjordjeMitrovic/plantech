var express = require('express');

var fs = require('fs');
var multer = require('multer');
var crypto = require('crypto');
const router = express.Router();
var mime = require('mime');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/images/')
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
        });
    }
});
const mysql = require('mysql');

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
    password: '',
    database: 'HighFive',
    debug: false
});
*/
var upload = multer({ storage: storage });
var fs = require('fs');
var app = express();

app.set('view engine', 'ejs')

router.post('/upload', upload.single('image'), function (req, res) {

    var sess = req.session;
    var path = req.file.path;
    
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            return;
        }
       

        if (sess.LoggedUser == undefined) return;
        connection.query("update user SET profilePic=? where id= ?", [path.replace('uploads\\', '').replace('uploads/',''), sess.LoggedUser.id], function (err, rows) {
            connection.release();
            var success = true;
            res.json(success)

        });
        connection.on('error', function (err) {
            console.log(err);
            return;
        });
    });

});
module.exports = router;