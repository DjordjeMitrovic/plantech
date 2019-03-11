const express = require('express');
var mongoose = require('mongoose');
var plantation = require('../models/plantation');
var bodyParser = require('body-parser');
const router = express.Router();
const mysql = require('mysql');
var app = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const pool = mysql.createPool({
    connectionLimit: 100,
    host: '147.91.204.116',
    user: 'HighFive',
    password: 'student',
    database: 'HighFive',
    debug: false
});

router.get('/getTypes/:userID', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };
        var user = req.params.userID;
        console.log(user);

        connection.query("SELECT * FROM `type` WHERE visible=1 OR idUser=" + user + "", function (err, rows) {
            connection.release();
            if (!err) {
                var test = [];

                for (var i = 0; i < rows.length; i++) {
                    test[i] = rows[i];
                }

                res.json(test);
            }
            else {
                console.log("greska neka");
            }
        });

        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    })

});
router.get('/getSubtypes', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };



        connection.query("SELECT * FROM `subtype` s JOIN type_subtype p ON s.id=p.idSubType", function (err, rows) {
            connection.release();
            if (!err) {
                var test = [];

                for (var i = 0; i < rows.length; i++)
                    test[i] = rows[i];

                res.json(test);
            }
        });

        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    })

});



router.get('/getProducers', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };



        connection.query("select * from producerofseeds", function (err, rows) {
            connection.release();
            if (!err) {
                var test = [];

                for (var i = 0; i < rows.length; i++)
                    test[i] = rows[i];

                res.json(test);
            }
        });

        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    })

});


router.get('/addProducer/:producerName', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({
                "code": 100,
                "status": "Error in connection database"
            });
            return;
        };
        var ime = req.params.producerName;
        var producer = {
            name: ime
        }
        console.log(ime);

        test = {};
        connection.query("insert into producerofseeds  SET ? ", producer, function (err, rows) {
            connection.release();
            if (!err) {
                test.id = rows.insertId;
                test.success = true;
            }
            else {
                test.success = false;
            }
            console.log(test);
            res.json(test);
        })
    })
});


router.get('/addType/:typeName/:isVisible/:userID', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({
                "code": 100,
                "status": "Error in connection database"
            });
            return;
        };

        var name = req.params.typeName;
        var visible = req.params.isVisible;
        var idUser = req.params.userID;

        var type = {
            name: name,
            visible: visible,
            idUser: idUser
        };
        console.log(type);

        test = {};

        connection.query("insert into type SET ?", type, function (err, rows) {
            connection.release();
            if (!err) {
                test.id = rows.insertId;
                test.success = true;
            }
            else {
                test.success = false;
            }
            console.log(test);
            res.json(test);
        })

    })
});

router.get('/addSubtype/:vrsta/:name', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({
                "code": 100,
                "status": "Error in connection database"
            });
            return;
        };

        var vrsta = req.params.vrsta;
        var naziv = req.params.name;

        var subtype = {
            name: naziv
        };

        test = {};
        var subtypeID;

        connection.query("insert into subtype SET ?", subtype, function (err, rows) {

            if (!err) {

                test.success = true;

            }
            else {
                test.success = false;
            }
            console.log(test);


            this.subtypeID = rows.insertId;
            ubaciTipPodtip(test, this.subtypeID);
        })

        function ubaciTipPodtip(test, subtypeID) {
            var rel = {
                idType: vrsta,
                idSubType: subtypeID
            };
            console.log(rel.idType + " " + rel.idSubType);
            if (test.success) {
                connection.query("insert into type_subtype SET ?", rel, function (err, rows) {
                    connection.release();
                    if (!err) {
                        test.success = true;
                        test.id = subtypeID;
                    }
                    else {
                        test.success = false;
                    }
                    console.log(test);
                    res.json(test);
                })
            }
            else {
                res.json(test);
            }
        }
    })
});



router.get('/addPlantation/:name/:vrsta/:podvrsta/:producer/:parcel/:poligoni', function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({
                "code": 100,
                "status": "Error in connection database"
            });
            return;
        };

        var poligoni = JSON.parse(req.params.poligoni);

        for (var i = 0; i < poligoni.length; i++) {
            var coords = [];
            for (var j = 0; j < poligoni[i].length; j++) {

                var latlng = [];
                latlng.push(poligoni[i][j].lng);
                latlng.push(poligoni[i][j].lat);
                coords.push(latlng);
            }
            coords.push(coords[0]);
            var poly = [];
            poly.push(coords);


            var imePlantaze = req.params.name;
            var vrsta = req.params.vrsta;
            var podvrsta = req.params.podvrsta;
            var proizvodjac = req.params.producer;
            var parcel = req.params.parcel;
            var plantID;
            

            var plant = {
                name: imePlantaze
            }
            var test = {};

            connection.query("insert into plantation SET ?", plant, function (err, rows) {
                if (!err) {
                    var user = sess.LoggedUser;
                    test.success = true;
                    this.plantID = rows.insertId;
                    var pid = rows.insertId;
                    var prvi = new plantation({
                        userID: user.id,
                        plantationID: pid,
                        coordinates: poly

                    })
                    console.log("prvi");
                    console.log(JSON.stringify(prvi));
                    console.log("poly");
                    console.log(JSON.stringify(poly));
                    prvi.save(function (err) {
                        if (err) {
                            console.log("greska pri cuvanju: " + err);
                            return err;
                        } else {
                            console.log("sacuvan prvi");
                        }

                    });
                    ubaciPlantType(test, this.plantID);
                }





            });
        }
        connection.release();
        test.success = true;
        res.json(test);

        function ubaciPlantType(test, plID) {
            var plantType = {
                idPlant: plID,
                idType: vrsta,
                idSubType: podvrsta
            };
            if (test.success && vrsta!=-1) {
                connection.query("insert into plant_type SET ?", plantType, function (err, rows) {
                    if (!err) {
                        test.success = true;
                        ubaciProSubtype(test, plID);
                    }
                    else {
                        test.success = false;
                        ubaciProSubtype(test, plID);
                    }
                    console.log(test);
                });
            }
        };

        function ubaciProSubtype(test, plID) {
          
            var proSubtype = {
                idProducer: proizvodjac,
                idSubType: podvrsta
            };
            if (test.success && proizvodjac!=-1 && podvrsta!=-1) {
                connection.query("insert into producer_subtype SET ?", proSubtype, function (err, rows) {

                    if (!err) {
                        test.success = true;
                        ubaciPlantParcel(test, plID);
                    }
                    else {
                        test.success = false;
                        ubaciPlantParcel(test, plID);
                    }
                    console.log(test);
                });
            }
        };

        function ubaciPlantParcel(test, plID) {
            var parcid;
            //ovde treba da se ispita da li je blizu neke vec postojece plantaze pa da se dodaju u istu parcelu
            var parc = {
                name: "DefaultNovaParcelaDodataZbogMonga"
            };

            connection.query("insert into parcel SET ?", parc, function (err, rows) {
                var parcid = rows.insertId;
                var plantParcel = {
                    idPlant: plID,
                    idParcel: rows.insertId
                };
                if (test.success) {
                    connection.query("insert into plant_parcel SET ?", plantParcel, function (err, rows) {

                        var op = {
                            idOwner: sess.LoggedUser.id,
                            idParcel: parcid
                        }
                        connection.query("insert into owner_parcel SET ?", op, function (err, rows) {
                        });

                    });
                }
            });

        };
    });

});

module.exports = router;
