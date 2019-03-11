var bodyParser = require('body-parser');
var dateFormat = require('dateformat');
const express = require('express');
var moment = require('moment');
var app = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const router = express.Router();
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
app.get('/getMessage/:ID', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var messID = req.params.ID;
        var test = [];

        connection.query("select m.id, m.idReceiver, m.idSender, m.read, m.text, m.time, u.username, u.name, u.surname, u.email,u.profilePic from messages m join user u on m.idSender=u.id where m.id='" + messID + "'", function (err, rows) {
            connection.release(); ///!!!!!!!!!!!!!!!!!!!!!
            if (!err) {
                var pos = {};
                pos.success = true
                for (var i = 0; i < rows.length; i++)
                    test[i] = rows[i];
                //markRead(pos, messID);
                res.json(test);
            }else{
                res.json(test);
            }


        });

        function markRead(test, id) {

            connection.query("update messages m SET m.read=0 where m.id=" + id + "", function (err, rows) {
                connection.release();
                if (!err) {


                }
                else {
                    console.log(err);
                }


            });
        }


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

app.get('/getMessages', function (req, res, next) {
    var sess = req.session;
    console.log("usao u get messages " + sess.LoggedUser.id);
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        var test = [];
        connection.query("select m.id, m.idReceiver, m.idSender, m.read, m.text, m.time, u.username, u.name, u.surname, u.email,u.profilePic from messages m join user u on m.idSender=u.id where m.idReceiver='" + sess.LoggedUser.id + "' and m.deletedByReceiver=0 order by m.time desc", function (err, rows) {
            connection.release();
            if (!err) {
                

                for (var i = 0; i < rows.length; i++)
                    test[i] = rows[i];

                res.json(test);
            }else{
                res.json(test);
            }


        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});
app.get('/markAsRead/:numbers', function (req, res, next) {
    var sess = req.session;
    console.log("usao u get messages " + sess.LoggedUser.id);
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var niz = [];
        niz = req.params.numbers.split(',');
        var a = []
        var sql = '';
        var test = {};
        for (var i = 0; i < niz.length; i++)
            sql += "update messages m SET m.read=0 where m.id=" + parseInt(niz[i]) + ";";

        connection.query(sql, function (err, rows) {
            connection.release();
            if (!err) {
                test.success = true;
                res.json(test);
            }
            else {
                console.log(err);
                test.success = false;
                res.json(test);
            }


        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});






app.get('/deleteSenderMessages/:numbers', function (req, res, next) {
    var sess = req.session;
    console.log("usao u delete messages sender" + sess.LoggedUser.id);
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        test = {};
        var niz = [];
        niz = req.params.numbers.split(',');
        var a = []
        var sql = '';
        for (var i = 0; i < niz.length; i++)
            sql += "update messages m SET m.deletedBySender=1 where m.id=" + parseInt(niz[i]) + ";";

        console.log(a);
        connection.query(sql, function (err, rows) {
            connection.release();
            if (!err) {
                test.success = true

            }
            else {
                test.success = false;
                console.log(err);
            }
            res.json(test);

        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

app.get('/deleteReceiverMessages/:numbers', function (req, res, next) {
    var sess = req.session;
    console.log("usao u delete messages recei" + sess.LoggedUser.id);
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        test = {};
        var niz = [];
        niz = req.params.numbers.split(',');
        var a = []
        var sql = '';
        for (var i = 0; i < niz.length; i++)
            sql += "update messages m SET m.deletedByReceiver=1 where m.id=" + parseInt(niz[i]) + ";";

        console.log(a);
        connection.query(sql, function (err, rows) {
            connection.release();
            if (!err) {
                test.success = true

            }
            else {
                test.success = false;
                console.log(err);
            }
            res.json(test);

        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});
app.get('/deleteYMessages/:numbers', function (req, res, next) {
    var sess = req.session;
    console.log("usao u delete messages YYY" + sess.LoggedUser.id);
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        test = {};
        var niz = [];
        niz = req.params.numbers.split(',');
        var a = []
        var sql = '';
        for (var i = 0; i < niz.length; i++)
            sql += "update messages m SET m.deletedByReceiver=1, m.deletedBySender=1  where m.id=" + parseInt(niz[i]) + ";";

        connection.query(sql, function (err, rows) {
            connection.release();
            if (!err) {
                test.success = true

            }
            else {
                test.success = false;
                console.log(err);
            }
            res.json(test);

        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

app.get('/getSentMessages', function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        var test = [];
        connection.query("select m.id, m.idReceiver, m.idSender, m.read, m.text, m.time, u.username, u.name, u.surname, u.email from messages m join user u on m.idReceiver=u.id where m.deletedBySender=0 and m.idSender='" + sess.LoggedUser.id + "' order by m.time desc", function (err, rows) {
            connection.release();
            if (!err) {
                

                for (var i = 0; i < rows.length; i++)
                    test[i] = rows[i];

                res.json(test);
            }else{
                res.json(test);    
            }


        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

app.get('/sendMessage/:receiver/:text', function (req, res, next) {
    var sess = req.session
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        test = {};

        var userN = req.params.receiver;
        var idRec;
        connection.query("select id from user where username like ?", userN, function (err, rows) {
            if (!err) {
                if (rows.length > 0) {
                    test.success = true;
                    idRec = rows[0].id;
                    console.log(idRec);
                    ubaciPoruku(test, idRec)
                } else {
                    test.success = false;
                    ubaciPoruku(test, idRec);
                }

            }
            else {
                test.success = false;
                ubaciPoruku(test, idRec);
            }
        })


        function ubaciPoruku(test, idRec) {

            var idReceiver = idRec;
            var idSender = sess.LoggedUser.id;
            var text = req.params.text;
            var date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            var message = {
                idReceiver: idReceiver,
                idSender: idSender,
                text: text,
                read: 1,
                time: date,
                deletedBySender: 0,
                deletedByReceiver: 0

            };
            console.log(message);
            if (test.success) {
                connection.query("insert into messages SET ?", message, function (err, rows) {
                    connection.release();
                    if (!err) {
                        test.success = true;
                    }
                    else {
                        test.success = false;
                    }
                    res.json(test);


                });
            }
            else
                res.json(test);
        }
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

app.get('/sendMessageTest/:idSender/:idReceiver/:text', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        test = {};
        var idReceiver = req.params.idReceiver;
        var idSender = req.params.idSender;
        var text = req.params.text;
        var date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        var message = {
            idReceiver: idReceiver,
            idSender: idSender,
            text: text,
            read: 1,
            time: date

        };
        console.log(message);
        connection.query("insert into messages SET ?", message, function (err, rows) {
            connection.release();
            if (!err) {
                test.success = true;
            }
            else {
                test.success = false;
            }
            res.json(test);


        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

module.exports = app;