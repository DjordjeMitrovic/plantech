var bodyParser = require('body-parser');

const express = require('express');

var app = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const mysql = require('mysql');
const sha1 = require('sha1');
/*
const pool = mysql.createPool({
    connectionLimit: 10,
    host: '147.91.204.116',
    user: 'HighFive',
    password: 'admin admin',
    database: 'HighFive',
    debug: false
});
*/

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    database: 'highfive',
    debug: false
});


app.get('/addMarker/:niz', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.json(false);
            return;
        }
        var niz = JSON.parse(req.params.niz);

        for (var i = 0; i < niz.length; i++) {

            var marker = {
                x: niz[i].lng,
                y: niz[i].lat,
            }
            connection.query("insert into measurer SET ?", marker, function (err, rows) {
                if (err) {
                    console.log(err);
                    connection.release();
                    return;
                }
            });
        }
        res.json(true);
        connection.release();
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});
app.get('/getMarkers/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        var rez = {};
        rez.success = true;
        var id = req.params.id;
        connection.query(`select m.*,pp.idPlant,pp.idPArcel,op.idOwner,uc.idWorker from measurer m join plant_measurer pm on m.id= pm.idMeasurer JOIN plantation p on p.id = pm.idPlant join plant_parcel pp on pp.idPLant = pm.idPlant JOIN owner_parcel op on op.idParcel=pp.idParcel LEFT JOIN user_connect uc on uc.idOwner = op.idOwner LEFT JOIN role r on r.id = uc.idRole where ((r.permission between 48 and 63 or  r.permission between 16 and 31 )and uc.idWorker = ` + id + ` ) or (op.idOwner= ` + id + ` )`, function (err, rows) {
            /*  connection.query("select m.*,pp.idPlant,pp.idPArcel,uc.idOwner,uc.idWorker from measurer m join plant_measurer pm on m.id= pm.idMeasurer JOIN plantation p on p.id = pm.idPlant join plant_parcel pp on pp.idPLant = pm.idPlant JOIN owner_parcel op on op.idParcel=pp.idParcel JOIN user_connect uc on uc.idOwner = op.idOwner JOIN role r on r.id = uc.idRole where (r.permission between 48 and 63 or  r.permission between 16 and 31) and (uc.idOwner=" + id + " or uc.idWorker=" + id + ")", function (err, rows) {*/
            connection.release();
            if (err) {
                rez.success = false;
                res.json(rez);
                return;
            }
            rez.data = rows;

            res.json(rez);


        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});
app.get('/connectPlantMarker/:nizId/:Measurer', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            return;
        }


        nizId = JSON.parse(req.params.nizId);
        console.log(nizId);
        Measurer = JSON.parse(req.params.Measurer);
        var idMeasurer = Measurer.id;

        connection.query("UPDATE measurer SET `x`=" + Measurer.x + ",`y`=" + Measurer.y + ",`attribute`='" + Measurer.attribute + "' where id=" + idMeasurer, function (err, rows) {
            if (err) {
                console.log(err);
                connection.release();
                return;
            }

        });


        for (var i = 0; i < nizId.length; i++) {
            (function (cntr) {
                var plntM = {
                    idPlant: nizId[cntr],
                    idMeasurer: idMeasurer
                }
                console.log("jao" + cntr);
                connection.query("delete from plant_measurer where idPlant=" + nizId[cntr] + " or idMeasurer=" + idMeasurer, function (err, rows) {
                    if (err) {
                        console.log(err);
                        connection.release();
                        return;
                    }
                    connection.query("insert into plant_measurer SET ?", plntM, function (err, rows) {
                        if (err) {
                            console.log(err);
                            connection.release();
                            return;
                        }


                    });
                });
            })(i);
        }

        connection.release();
        var test = {};
        test.success = true;
        res.json(test);

        connection.on('error', function (err) {
            //  res.json({ "code": 100, "status": "Error in connection database" });
            console.log(err);
            return;
        });
    });

});

app.get('/connectPlantNewMarker/:nizId/:Measurer', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            // console.log(err);
            //res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var rez = {};
        rez.success = true;

        nizId = JSON.parse(req.params.nizId);
        idMeasurer = JSON.parse(req.params.Measurer);

        console.log(idMeasurer);

        connection.query("insert into measurer set ?", idMeasurer, function (err, rows) {
            if (err) {
                console.log(err);
                connection.release();
                return;
            }
            for (var i = 0; i < nizId.length; i++) {
                (function (cntr) {
                    connection.query("delete from plant_measurer where idPlant=" + nizId[cntr], function (err, rowsss) {
                        if (err) {
                            console.log(err);
                            connection.release();
                            return;
                        };
                        var plntM = {
                            idPlant: nizId[cntr],
                            idMeasurer: rows.insertId
                        }
                        connection.query("insert into plant_measurer SET ?", plntM, function (err, rows) {
                            if (err) {
                                console.log(err);
                                connection.release();
                                return;
                            }
                        });
                    });
                })(i);
            }
            var test = {};
            test.success = true;
            connection.release();
            res.json(test);

        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

app.get('/deleteMarker/:niz', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        niz = req.params.niz;
        connection.query("DELETE FROM `measurer` WHERE id=" + niz, function (err, rows) {
            connection.release();
        });
        res.json(true);
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});


module.exports = app;