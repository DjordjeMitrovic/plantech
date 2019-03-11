



// Express
var mongoose = require('mongoose');
var plantation = require('../models/plantation');
var bodyParser = require('body-parser');

const express = require('express');
var app = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const router = express.Router();
const mysql = require('mysql');
const sha1 = require('sha1');
const pool = mysql.createPool({
    connectionLimit: 100,
    host: '147.91.204.116',
    user: 'HighFive',
    password: 'student',
    database: 'HighFive',
    debug: false
});

router.get('/users/:user/:pass/', function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }


        var user = req.params.user;
        var pass = sha1(req.params.pass);



        test = {};


        connection.query("select * from user where username='" + user + "' and password = '" + pass + "'", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length == 0) {
                    test.success = false;
                }
                else {
                    test.success = true;
                    sess.LoggedUser = rows[0];
                }

                res.json(test);
            }
        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

router.get('/register/:user/:pass/:email', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }


        var user = req.params.user;
        var pass = sha1(req.params.pass);
        var email = req.params.email;


        test = {};


        connection.query("select username,password from user where username='" + user + "' or email='" + email + "'", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length == 0) {
                    test.success = true;
                }
                else {
                    test.success = false;
                }

                res.json(test);
            }
        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});







router.get('/dodajUBazu/:user/:pass/:email/:ime/:prezime/:drzava/:datum', function (req, res, next) {
    console.log("pozvano");
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var user = req.params.user;
        var pass = sha1(req.params.pass);
        var emaill = req.params.email;
        var ime = req.params.ime;
        var prezime = req.params.prezime;
        var drzava = req.params.drzava;
        var datum = req.params.datum;
        /*      var datum=Date.parse(req.params.datum);
              var drzava=req.params.drzava;*/

        test = {};
        var podaci = {
            username: user,
            password: pass,
            name: ime,
            surname: prezime,
            email: emaill,
            birth: datum,
            country: drzava
        };
        connection.query("insert into user SET ?", podaci, function (err, rows) {
            connection.release();
            if (!err) {

                test.success = true;
            }
            else {
                test.success = false;
            }
            console.log(test);
            res.json(test);

        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});


router.get('/posaljiZahtevAdminu/:id', function (req, res, next) {
    console.log("pozvano");
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var idU = req.params.id;

        test = {};
        var podaci = {
            idUser: idU
        };
        connection.query("insert into request SET ?", podaci, function (err, rows) {
            connection.release();
            if (!err) {

                test.success = true;
            }
            else {
                test.success = false;
            }
            console.log(test);
            res.json(test);

        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});







router.get('/prikaziPlantaze/:idu', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.idu;
        connection.query("select distinct p2.*,t.id as idt, t.name as namet, st.name as names,pos.name as namep from user u join owner_parcel op on u.id=" + id + " and u.id=op.idOwner join parcel p1 on op.idParcel=p1.id join plant_parcel pp on p1.id=pp.idParcel join plantation p2 on pp.idPlant=p2.id join plant_type pt on p2.id=pt.idPlant join type t on t.id=pt.idType join subtype st on pt.idSubType=st.id join producer_subtype pst on pt.idSubType=pst.idSubType join producerofseeds pos on pst.idProducer=pos.id", function (err, rows) {
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
    });
});


router.get('/prikaziPodatkeOPlant/:id/:idu', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var idP = req.params.id;
        var idU = req.params.idu;
        connection.query("select p2.*,t.id as idt, t.name as namet, st.name as names,pos.name as namep from user u join owner_parcel op on u.id=" + idU + " and u.id=op.idOwner join parcel p1 on op.idParcel=p1.id join plant_parcel pp on p1.id=pp.idParcel join plantation p2 on p2.id=" + idP + " and pp.idPlant=p2.id join plant_type pt on p2.id=pt.idPlant join type t on t.id=pt.idType join subtype st on pt.idSubType=st.id join producer_subtype pst on pt.idSubType=pst.idSubType join producerofseeds pos on pst.idProducer=pos.id", function (err, rows) {
            connection.release();
            if (!err) {
                var test = new Array();

                for (var i = 0; i < rows.length; i++)
                    test[i] = rows[i];

                res.json(test);
                console.log(idP);
                console.log(idU);
            }
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
});

router.get('/vratiTipove/:idUs', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var idUser = req.params.idUs;
        connection.query("select * from type where visible!=0 or idUser=" + idUser + "", function (err, rows) {
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
    });
});



router.get('/prikaziIDTipa/:nameT', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var nameTip = req.params.nameT;
        console.log(nameTip);
        connection.query("select id from type where name='" + nameTip + "'", function (err, rows) {
            connection.release();
            if (!err) {
                var test = [];
                console.log(rows.length);
                for (var i = 0; i < rows.length; i++)
                    test[i] = rows[i];

                res.json(test);
            }
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
});

router.get('/prikaziPodtip/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var idT = req.params.id;

        connection.query("select s.name from type_subtype ts join subtype s on ts.idType=" + idT + " and ts.idSubType=s.id", function (err, rows) {
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
    });
});



router.get('/promeniPlantaze/:idplant/:idus/:imep/:imet/:imest/:imeps', function (req, res, next) {
    console.log("pozvano");
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var idp = req.params.idplant;
        var idUs = req.params.idus;
        var imeP = req.params.imep;
        var imeT = req.params.imet;
        var imeST = req.params.imest;
        var imePS = req.params.imeps;

        test = {};


        connection.query("update user u join owner_parcel op on u.id=op.idOwner join parcel p1 on op.idParcel=p1.id join plant_parcel pp on p1.id=pp.idParcel join plantation p2 on pp.idPlant=p2.id join plant_type pt on p2.id=pt.idPlant join type t on t.id=pt.idType join subtype st on pt.idSubType=st.id join producer_subtype pst on pt.idSubType=pst.idSubType join producerofseeds pos on pst.idProducer=pos.id set p2.name=?, t.name=?, st.name=?, pos.name=? where u.id=" + idUs + " and p2.id=" + idp + "", [imeP, imeT, imeST, imePS], function (err, rows) {
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


router.get('/prikaziProizvodjaca/:name', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var nameST = req.params.name;

        connection.query("select ps1.name from subtype st join producer_subtype ps on st.name='" + nameST + "' and st.id=ps.idSubType join producerofseeds ps1 on ps.idProducer=ps1.id", function (err, rows) {
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
    });
});



router.get('/promenipodatke/:name/:surname/:country/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var ime = req.params.name;
        var prezime = req.params.surname;
        var drzava = req.params.country;
        var id = req.params.id

        test = {};

        connection.query('UPDATE user SET name = ?, surname = ?, country = ? WHERE id = ?', [ime, prezime, drzava, id], function (err, rows) {
            connection.release();
            if (!err) {
                if (!err) {
                    test.success = true;
                }
                else {
                    test.success = false;
                }

                res.json(test);
            }
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

router.get('/obrisiPlantazu/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.id

        test = {};

        connection.query("delete from plantation where id=" + id + "", function (err, rows) {
            connection.release();
            if (!err) {
                if (!err) {
                    test.success = true;
                    izbrisan = id;
                    plantation.findOneAndRemove({
                        plantationID: izbrisan
                    }, function (err, plant) {
                        if (err) {
                            res.send('error removing');
                        } else {
                            console.log(plant);
                       
                        }
                    });
                }
                else {
                    test.success = false;
                }

                res.json(test);
            }
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});





router.get("/informacijeOZemljistu/:idplant", function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        var id = req.params.idplant;

        test = {};

        connection.query("select measuring.id,measurment,DATE_FORMAT(date,'%d-%m-%Y') as 'date' from measuring join measuring_detail on measuring.id=measuring_detail.idMeasure where measuring.idPlant=" + id + " order by measuring.date desc, measuring.id", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length != 0) test.success = true;
                else test.success = false;

                test.labels = new Array();
                test.data = new Array();
                var dict = {};
                for (i = 0; i < rows.length && i < 5; i++) {
                    if (test.labels.indexOf(rows[i].data) === -1) test.labels.push(rows[i].date)
                    var data = JSON.parse(rows[i].measurment);
                    for (var k in data) {
                        if (data.hasOwnProperty(k)) {
                            if (dict[k] === undefined) dict[k] = new Array();
                            dict[k].push(data[k]);
                        }
                    }


                }

                for (var k in dict) {
                    if (dict.hasOwnProperty(k) && k != 'Vlaznost') {


                        var obj = {};
                        obj.data = new Array();
                        obj.label = k;
                        obj.data = dict[k];

                        test.data.push(obj);
                    }
                }
                res.json(test);



            }



            connection.on('error', function (err) {
                res.json({ "code": 100, "status": "Error in connection database" });
                return;

            });
        }


        );
    });
});


router.get('/moisture/:idplant', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        var id = req.params.idplant;

        test = {};

        connection.query("select measuring.id,measurment,DATE_FORMAT(date,'%d-%m-%Y') as 'date' from measuring join measuring_detail on measuring.id=measuring_detail.idMeasure where measuring.idPlant=" + id + " order by measuring.date desc, measuring.id", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length != 0) test.success = true;
                else test.success = false;
                test.labels = new Array();
                test.data = new Array();
                var dict = {};
                for (i = 0; i < rows.length && i < 5; i++) {
                    if (test.labels.indexOf(rows[i].data) === -1) test.labels.push(rows[i].date)
                    var data = JSON.parse(rows[i].measurment);
                    for (var k in data) {
                        if (data.hasOwnProperty(k)) {
                            if (dict[k] === undefined) dict[k] = new Array();
                            dict[k].push(data[k]);
                        }
                    }


                }

                for (var k in dict) {
                    if (dict.hasOwnProperty(k) && k == 'Vlaznost') {


                        var obj = {};
                        obj.data = new Array();
                        obj.label = k;
                        obj.data = dict[k];

                        test.data.push(obj);
                    }
                }
                res.json(test);



            }



            connection.on('error', function (err) {
                res.json({ "code": 100, "status": "Error in connection database" });
                return;

            });
        }


        );
    });
});


router.get('/promeniSifru/:sifra/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var pass = sha1(req.params.sifra);
        var id = req.params.id

        test = {};

        connection.query('UPDATE user SET password=? WHERE id = ?', [pass, id], function (err, rows) {
            connection.release();
            if (!err) {
                if (!err) {
                    test.success = true;
                }
                else {
                    test.success = false;
                }

                res.json(test);
            }
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});


router.get('/dodajRadnika/:ownerID/:workerID/:roleID', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var ownerID = req.params.ownerID;

        var workerID = req.params.workerID;
        var roleID = req.params.roleID;


        test = {};
        var podaci = {
            idOwner: ownerID,
            idWorker: workerID,
            idRole: roleID,
        };

        connection.query("insert into user_connect SET ?", podaci, function (err, rows) {
            connection.release();
            if (!err) {
                if (!err) {
                    test.success = true;

                }
                else {
                    test.success = false;

                }

                res.json(test);
            }
            else console.log(err);
        });
        console.log("ovde 2");
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});






router.get('/getUsers', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }


        connection.query("select * from user", function (err, rows) {
            connection.release();
            if (!err) {
                var test = [];

                for (var i = 0; i < rows.length; i++) {
                    test[i] = rows[i];
                    console.log(rows[i]);
                }


                res.json(test);
            }
        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});
router.get('/getRoles', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }


        connection.query("select * from role", function (err, rows) {
            connection.release();
            if (!err) {
                var test = [];

                for (var i = 0; i < rows.length; i++) {
                    test[i] = rows[i];
                    console.log(rows[i]);
                }


                res.json(test);
            }
        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});
router.get('/getUsersWorkers/:ownerID', function (req, res, next) {
    console.log("udjee ");
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.ownerID;

        console.log(id);

        connection.query("SELECT uc.id as UserConID,u.id,u2.name,u2.surname,r.id as roleID,r.name as roleName FROM user u join user_connect uc on u.id=" + id + " and u.id=uc.idOwner join user u2 on u2.id=uc.idWorker join role r on uc.idRole=r.id where u.id=" + id, function (err, rows) {
            connection.release();
            if (!err) {
                var test = [];

                for (var i = 0; i < rows.length; i++) {
                    test[i] = rows[i];
                    console.log(rows[i]);
                }


                res.json(test);
            }
            else console.log(err);
        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});
router.get('/deleteWorkers/:workerID', function (req, res, next) {
    console.log("brisee ");
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.workerID;

        console.log(id);

        connection.query("delete from user_connect where id=" + id + "", function (err, rows) {
            connection.release();
            if (!err) {
                var test = [];

                for (var i = 0; i < rows.length; i++) {
                    test[i] = rows[i];
                    console.log(rows[i]);
                }


                res.json(test);
            }
            else console.log(err);
        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});
router.get('/updateWorkers/:workerID/:roleID', function (req, res, next) {
    console.log("brisee ");
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.workerID;
        var roleID = req.params.roleID;
        console.log(id);

        connection.query("UPDATE user_connect SET idRole=" + roleID + "  where id=" + id + "", function (err, rows) {
            connection.release();
            if (!err) {
                var test = [];

                for (var i = 0; i < rows.length; i++) {
                    test[i] = rows[i];
                    console.log(rows[i]);
                }


                res.json(test);
            }
            else console.log(err);
        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});




router.get('/proveriSifru/:sifra', function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var pass = sha1(req.params.sifra);
        test = {};

        connection.query("select * from user where password = '" + pass + "'", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length == 0) {
                    test.success = true;
                }
                else {
                    test.success = false;
                    sess.LoggedUser = rows[0];
                }

                res.json(test);
            }
        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});






router.get('/proveriSifru2/:sifra/:userid', function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var pass = sha1(req.params.sifra);
        var id = req.params.userid;
        test = {};

        connection.query("select * from user where password = '" + pass + "' and id=" + id + "", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length == 0) {
                    test.success = false;
                }
                else {
                    test.success = true;

                }

                res.json(test);
            }
        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});





module.exports = router;
