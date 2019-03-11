const express = require('express');
var mongoose = require('mongoose');
var plantation = require('../models/plantation');
var bodyParser = require('body-parser');
var ODDataValues = require("../FakeSys/FakeSystem.js");
var router = express.Router();
const mysql = require('mysql');
var app = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
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
const poolRemote = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    database: 'highfive_mu',
    debug: false
});

router.get('/getTypes/:userID', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var user = req.params.userID.split(',');
        var ids = [];
        //console.log(user.length + " u get tajps server");
        for (var i = 0; i < user.length; i++) {
            ids[i] = user[i];
            // console.log(user[i]);
        }
        connection.query("SELECT * FROM `type` WHERE visible=1 OR idUser in (" + ids + ")", function (err, rows) {
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
                return;
            }
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });


    })

});


router.get('/getTypes1/:userID', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };
        var user = req.params.userID.split(',');
        var ids = [];
        //console.log(user.length + " u get tajps server");
        for (var i = 0; i < user.length; i++) {
            ids[i] = user[i];
            // console.log(user[i]);
        }
        connection.query("SELECT distinct id,name,idUser FROM `type` join type_subtype tp on tp.idType=id WHERE visible=1 OR idUser in (" + ids + ") ", function (err, rows) {
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

        connection.query("SELECT DISTINCT * FROM `subtype` s JOIN type_subtype p ON s.id=p.idSubType", function (err, rows) {
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

router.get('/getSubtypes/:userID', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };
        var user = req.params.userID.split(',');
        var ids = [];
        //console.log(user.length + " u get tajps server");
        for (var i = 0; i < user.length; i++) {
            ids[i] = user[i];
            // console.log(user[i]);
        }
        connection.query("SELECT DISTINCT  * FROM `subtype` s JOIN type_subtype p ON s.id=p.idSubType  WHERE visible=1 OR idUser in (" + ids + ")", function (err, rows) {
            connection.release();
            if (!err) {
                var test = [];

                for (var i = 0; i < rows.length; i++)
                    test[i] = rows[i];

                res.json(test);
            } else {
                console.log(err);
            }
        });

        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    })

});



router.get('/getSubtypesPom/:userID', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };
        var user = req.params.userID.split(',');
        var ids = [];
        //console.log(user.length + " u get tajps server");
        for (var i = 0; i < user.length; i++) {
            ids[i] = user[i];
            // console.log(user[i]);
        }
        console.log(ids);
        connection.query("SELECT DISTINCT  r.id,r.name,s.name as names FROM `subtype` s JOIN type_subtype p ON s.id=p.idSubType join rules r on s.id=r.idSubType WHERE visible=1 OR idUser in (" + ids + ")", function (err, rows) {
            connection.release();
            if (!err) {
                var test = [];

                for (var i = 0; i < rows.length; i++)
                    test[i] = rows[i];

                res.json(test);
            } else {
                console.log(err);
            }
        });

        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    })

});



router.get('/getProducers/:userID', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };
        var user = req.params.userID.split(',');
        var ids = [];
        //console.log(user.length + " u get tajps server");
        for (var i = 0; i < user.length; i++) {
            ids[i] = user[i];
            // console.log(user[i]);
        }


        connection.query("select distinct * from producerofseeds where visible=1 or idUser in (" + ids + ")", function (err, rows) {
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


router.get('/addProducer/:producerName/:userID', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({
                "code": 100,
                "status": "Error in connection database"
            });
            return;
        };
        var ime = req.params.producerName;
        var userid = req.params.userID;
        var producer = {
            name: ime,
            idUser: userid,
            visible: 0
        }
        // console.log(ime);

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
        //console.log(type);

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

router.get('/addSubtype/:vrsta/:name/:userID', function (req, res, next) {
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
        var us = req.params.userID;
        var subtype = {
            name: naziv,
            idUser: us,
            visible: 0
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


            if (rows.insertId) this.subtypeID = rows.insertId;
            ubaciTipPodtip(test, this.subtypeID);
        });

        function ubaciTipPodtip(test, subtypeID) {
            var rel = {
                idType: vrsta,
                idSubType: subtypeID
            };
            // console.log(rel.idType + " " + rel.idSubType);
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

router.get('/plantations', function (req, res) {
    console.log('getting all plantations');
    plantation.find({})
        .exec(function (err, plantations) {
            if (err) {
                res.send('error occured')
            } else {
                console.log(plantations);
                res.json(plantations);
            }
        });
});
var plantation = require('../models/plantation');
function fuja(value) {

    plantation.find({
        plantationID: value
    }).exec(function (err, plantations) {
        if (err) {
            return -1;
        } else {
            // console.log('pozvbani smo aloo: ' + JSON.stringify(plantations));
            return plantations;
        }
    });

}


router.get('/getImanja/:imanjeID', function (req, res, next) {


    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };

        var imanjeID = req.params.imanjeID;

        connection.query("SELECT * FROM `plant_parcel` WHERE idParcel = " + imanjeID + "", function (err, rows) {
            connection.release();
            if (!err) {
                var test = [];
                for (var i = 0; i < rows.length; i++) {
                    test[i] = rows[i];
                }
                res.json(test);
            }
        });

        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    })

});

router.get('/addPlantation/:ownerID/:name/:vrsta/:podvrsta/:producer/:parcel/:poligoni', function (req, res, next) {
    var sess = req.session;
    var imanje = req.params.parcel;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({
                "code": 100,
                "status": "Error in connection database"
            });
            return;
        };
        poolRemote.getConnection(function (err, connection2) {
            if (err) {
                res.json({
                    "code": 100,
                    "status": "Error in connection database"
                });
                return;
            };

            var poligoni = JSON.parse(req.params.poligoni);

            // console.log("NizPOligona u ADD -->  " + JSON.stringify(req.params.poligoni));
            var poly = [];
            for (var i = 0; i < poligoni.length; i++) {
                var coords = [];
                for (var j = 0; j < poligoni[i].length; j++) {

                    var latlng = [];
                    latlng.push(poligoni[i][j].lng);
                    latlng.push(poligoni[i][j].lat);
                    coords.push(latlng);
                }
                coords.push(coords[0]);
                poly.push(coords);
            }

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

                    var data = new ODDataValues();
                    var user = sess.LoggedUser;
                    test.success = true;
                    this.plantID = rows.insertId;
                    var idplantaze = rows.insertId;
                    var random = '{"moisture":15.4,"temperature":19.4,"C":3.459138405888165,"N":4.461665786531139,"O":5.423554682513132,"H":5.349602925026662,"S":5.532041775901308,"Pi":5.361344955768095,"Si":4.758298030763847,"Cl":4.380020849408302,"Na":4.919817734152224,"Mg":6.08835713885087,"Al":4.9432377476194675,"Fe":4.765925264980476,"Mn":6.062757200647491}';

                    for (var i = 0; i < 6; i++) {
                        (function (cntr) {
                            var sql = "insert into measuring(date, idPlant) values(DATE_ADD(NOW(),INTERVAL " + cntr + " DAY), " + idplantaze + ")";
                            console.log(sql);
                            connection2.query(sql, function (err, rows) {
                                if (err) {
                                    connection.release();
                                    connection2.release();
                                    console.log(err);
                                    return;
                                }

                                var merenja = [];
                                merenja.push('test');
                                var podaci = data.getDataValue(merenja);
                                var row = {};
                                row.idMeasure = rows.insertId;
                                row.measurment = podaci;
                                connection2.query("insert into measuring_detail SET ?", row, function (err, rows) {
                                    if (err) {
                                        connection.release();
                                        connection2.release();
                                        console.log(err);
                                        return;
                                    }
                                });


                            });

                            var sql2 = "insert into temperatura(date, idPlant, value) VALUES(DATE_ADD(NOW(),INTERVAL " + cntr + " DAY), " + idplantaze + ", 20)";
                            connection2.query(sql2, function (err, rows) {
                                if (err) {
                                    connection.release();
                                    connection2.release();
                                    console.log(err);
                                    return;
                                }
                            });
                            connection2.query("insert into average_measuring(date,idPlant,measuring) VALUES(DATE_ADD(NOW(),INTERVAL " + cntr + " DAY), " + idplantaze + ", " +"'"+ random + "')", function (err, rows) {
                                if (err) {
                                    connection.release();
                                    connection2.release();
                                    console.log(err);
                                }

                            });
                            connection2.query("insert into average_measuring_future(date,idPlant,measuring) VALUES(DATE_ADD(NOW(),INTERVAL " + cntr + " DAY), " + idplantaze + ", '" + random + "')", function (err, rows) {
                                if (err) {
                                    connection.release();
                                    connection2.release();
                                    console.log(err);
                                }

                            });
                        })(i);

                    }

                    for (var i = 1; i < 6; i++) {
                        (function (cntr) {
                            var sql = "insert into measuring(date, idPlant) values(DATE_ADD(NOW(),INTERVAL -" + cntr + " DAY), " + idplantaze + ")";
                            console.log(sql);
                            connection2.query(sql, function (err, rows) {
                                if (err) {
                                    connection.release();
                                    connection2.release();
                                    console.log(err);
                                    return;
                                }

                                var merenja = [];
                                merenja.push('test');
                                var podaci = data.getDataValue(merenja);
                                var row = {};
                                row.idMeasure = rows.insertId;
                                row.measurment = podaci;
                                connection2.query("insert into measuring_detail SET ?", row, function (err, rows) {
                                    if (err) {
                                        connection.release();
                                        connection2.release();
                                        console.log(err);
                                        return;
                                    }

                                });

                            });
                            var sql2 = "insert into temperatura(date, idPlant, value) VALUES(DATE_ADD(NOW(),INTERVAL -" + cntr + " DAY), " + idplantaze + ", 20)";
                            connection2.query(sql2, function (err, rows) {
                                if (err) {
                                    connection.release();
                                    connection2.release();
                                    console.log(err);
                                    return;
                                }
                            });
                            connection2.query("insert into average_measuring(date,idPlant,measuring) VALUES(DATE_ADD(NOW(),INTERVAL -" + cntr + " DAY), " + idplantaze + ", '" + random + "')", function (err, rows) {
                                if (err) {
                                    connection.release();
                                    connection2.release();
                                    console.log(err);
                                }

                            });
                            connection2.query("insert into average_measuring_future(date,idPlant,measuring) VALUES(DATE_ADD(NOW(),INTERVAL -" + cntr + " DAY), " + idplantaze + ", '" + random + "')", function (err, rows) {
                                if (err) {
                                    connection.release();
                                    connection2.release();
                                    console.log(err);
                                }

                            });
                        })(i);

                    }
                    var pid = rows.insertId;
                    var prvi = new plantation({
                        userID: req.params.ownerID,
                        plantationID: pid,
                        coordinates: poly
                    })

                    prvi.save(function (err) {
                        if (err) {
                            console.log("greska pri cuvanju: " + err);
                            return err;
                        } else {
                            console.log("sacuvan prvi!");
                        }
                    });
                    ubaciPlantType(test, this.plantID);
                }
            });


            test.success = true;
            res.json(test);

            function ubaciPlantType(test, plID) {
                var plantType = {
                    idPlant: plID,
                    idType: vrsta,
                    idSubType: podvrsta,
                    idProducer: proizvodjac
                };
                if (test.success && vrsta != -1) {
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
                ubaciPlantParcel(test, plID);
            };

            function ubaciPlantParcel(test, plID) {
                var plantParcel = {
                    idPlant: plID,
                    idParcel: imanje
                };
                if (test.success) {
                    connection.query("insert into plant_parcel SET ?", plantParcel, function (err, rows) {
                        connection.release();
                    });
                }
            };
        });
    });

});

router.get('/numOfPlantations', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };
        var test = {};
        connection.query("SELECT DATE_FORMAT( createdOn,  '%Y' ) AS  'year', DATE_FORMAT( createdOn,  '%m' ) AS  'month', COUNT( id ) AS  'total' FROM plantation GROUP BY DATE_FORMAT( createdOn,  '%Y%m' )", function (err, rows) {
            connection.release();
            if (!err) {
                test.success = true;
                test.labels = new Array();
                test.data = new Array();
                for (var i = 0; i < rows.length; i++) {
                    test.labels.push(rows[i].year + "-" + rows[i].month);
                    test.data.push(rows[i].total);

                }
            } else {
                test.success = false;
            }
            res.json(test);
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    })
});

router.get('/numOfParcels', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };
        var test = {};
        connection.query("SELECT DATE_FORMAT( createdOn,  '%Y' ) AS  'year', DATE_FORMAT( createdOn,  '%m' ) AS  'month', COUNT( id ) AS  'total' FROM parcel GROUP BY DATE_FORMAT( createdOn,  '%Y%m' )", function (err, rows) {
            connection.release();
            if (!err) {
                test.success = true;
                test.labels = new Array();
                test.data = new Array();
                for (var i = 0; i < rows.length; i++) {
                    test.labels.push(rows[i].year + "-" + rows[i].month);
                    test.data.push(rows[i].total);

                }
            } else {
                test.success = false;
            }
            res.json(test);
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    })
});

router.get('/numOfTypes', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };
        var test = {};
        connection.query("SELECT DATE_FORMAT( createdOn,  '%Y' ) AS  'year', DATE_FORMAT( createdOn,  '%m' ) AS  'month', COUNT( id ) AS  'total' FROM type GROUP BY DATE_FORMAT( createdOn,  '%Y%m' )", function (err, rows) {
            connection.release();
            if (!err) {
                test.success = true;
                test.labels = new Array();
                test.data = new Array();
                for (var i = 0; i < rows.length; i++) {
                    test.labels.push(rows[i].year + "-" + rows[i].month);
                    test.data.push(rows[i].total);
                }
            } else {
                test.success = false;
            }
            res.json(test);
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    })
});

router.get('/numOfUsers', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };
        var test = {};
        connection.query("SELECT DATE_FORMAT( createdOn,  '%Y' ) AS  'year', DATE_FORMAT( createdOn,  '%m' ) AS  'month', COUNT( id ) AS  'total' FROM user GROUP BY DATE_FORMAT( createdOn,  '%Y%m' )", function (err, rows) {
            connection.release();
            if (!err) {
                test.success = true;
                test.labels = new Array();
                test.data = new Array();
                for (var i = 0; i < rows.length; i++) {
                    test.labels.push(rows[i].year + "-" + rows[i].month);
                    test.data.push(rows[i].total);

                }
            } else {
                test.success = false;
            }
            res.json(test);
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    })
});


router.get('/typesOnPlantations', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };
        var test = {};
        connection.query("SELECT p.idType, COUNT( * ) AS num, t.name FROM plant_type p JOIN type t ON p.idType = t.id GROUP BY p.idType", function (err, rows) {
            connection.release();
            if (!err) {
                test.success = true;
                test.labels = new Array();
                test.data = new Array();
                for (var i = 0; i < rows.length; i++) {
                    test.labels.push(rows[i].name);
                    test.data.push(rows[i].num);
                }
            } else {
                test.success = false;
            }
            res.json(test);
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    })
});

router.get('/subtypesOnPlantations', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };
        var test = {};
        connection.query("SELECT p.idSubType, COUNT( * ) AS num, t.name FROM plant_type p JOIN subtype t ON p.idSubType = t.id GROUP BY p.idSubType", function (err, rows) {
            connection.release();
            if (!err) {
                test.success = true;
                test.labels = new Array();
                test.data = new Array();
                for (var i = 0; i < rows.length; i++) {
                    test.labels.push(rows[i].name);
                    test.data.push(rows[i].num);

                }
            } else {
                test.success = false;
            }
            res.json(test);
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    })
});
router.get('/obrisi/:id', function (req, res, next) {
    var id = req.params.id;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };
        var test = {};
        connection.query("update plant_type set idType=DEFAULT, idSubType=DEFAULT, idProducer=DEFAULT where idType=" + id, function (err, rows) {
            if (err) {
                connection.release();
                console.log(err);
                connection.release();
                return;
            };
            connection.query("delete from type where id = " + id, function (err, rows) {
                connection.release();
                if (err) {
                    console.log(err);
                    return;
                };
                test.success = true;
                res.json(test);
            });
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    })
});
router.get('/obrisiPodtip/:id', function (req, res, next) {
    var id = req.params.id;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };
        var test = {};
        connection.query("update plant_type set idType=DEFAULT, idSubType=DEFAULT, idProducer=DEFAULT where idSubType=" + id, function (err, rows) {
            if (err) {
                console.log(err);
                connection.release();
                return;
            };
            connection.query("delete from subtype where id = " + id, function (err, rows) {
                connection.release();
                if (err) {
                    console.log(err);
                    return;
                };

                test.success = true;
                res.json(test);
            });
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    })
});

router.get('/obrisiProizvodjaca/:id', function (req, res, next) {
    var id = req.params.id;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };
        var test = {};
        connection.query("update plant_type set idType=DEFAULT, idSubType=DEFAULT, idProducer=DEFAULT where idProducer=" + id, function (err, rows) {

            if (err) {
                console.log(err);
                connection.release();
                return;
            };
            connection.query("delete from producerofseeds where id = " + id, function (err, rows) {
                connection.release();
                if (err) {
                    console.log(err);
                    return;
                };

                test.success = true;
                res.json(test);
            });
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    })
});


router.get('/obrisiPravilo/:id', function (req, res, next) {
    var id = req.params.id;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        };
        var test = {};
        connection.query("delete from rules where id = " + id, function (err, rows) {
            connection.release();
            if (err) {
                console.log(err);
                return;
            };

            test.success = true;
            res.json(test);
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
});


module.exports = router;
