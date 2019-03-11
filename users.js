// Express
var mongoose = require('mongoose');
var plantation = require('../models/plantation');
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');
var nodemailer = require('nodemailer');
const express = require('express');
var crypto = require("crypto");
var app = express.Router();
//var weather = require('npm-openweathermap');
//weather.api_key = '0d009ab575deb18aa53e1930f40234c7';
//weather.temp = 'c';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const router = express.Router();
const mysql = require('mysql');
const sha1 = require('sha1');

const pool = mysql.createPool({
    connectionLimit: 1000,
    host: '147.91.204.116',
    user: 'HighFive',
    password: 'admin admin',
    database: 'HighFive',
    debug: false
});

const pool1 = mysql.createPool({
    connectionLimit: 1000,
    host: '147.91.204.116',
    user: 'admin admin',
    database: 'HighFive_mu',
    debug: false
});

/*
const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'HighFive',
    debug: false
});

const pool1 = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'HighFive_mu',
    debug: false
});*/

var smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 25,
    auth: {
        user: 'plantechHF@gmail.com',
        pass: 'highfiveteam',
    },
    tls: { rejectUnauthorized: false },
    debug: true
});

/*router.get("/currentTemp/:x/:y", function (req, res, next) {
    var location = {
        longitude: req.params.x,
        latitude: req.params.y,
    }
   
    weather.get_weather_custom('coordinates', location, 'weather').then(function (ress) {
        console.log(ress);
        res.json(ress);
        
    }, function (error) {
        console.log(error)
    })
});*/ //mozda zatreba nekad
router.get('/probaSifre', function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        var id = crypto.randomBytes(2).toString('hex');
        res.json(id);
    });
});



router.get('/users/:user/:pass/', function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            //tu zatvori? 
            return;
        }


        var user = req.params.user;
        var pass = sha1(req.params.pass);

        console.log(user + " i   " + pass);

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
            } else {
                //tu da se zatvori!
                //
            }

        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});



router.get('/blokiran/:user/:pass/', function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }


        var user = req.params.user;
        var pass = sha1(req.params.pass);

        console.log(user + " i   " + pass);

        test = {};


        connection.query("select * from user where username='" + user + "' and password = '" + pass + "' and block=1", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length == 0) {
                    test.success = false;
                    console.log("FALSE!!!!!!");
                }
                else {
                    test.success = true;
                    console.log("TRUE!!!!!!");
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




router.get('/register/:user/:pass', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }


        var user = req.params.user;
        var pass = sha1(req.params.pass);


        test = {};


        connection.query("select username,password from user where username='" + user + "'", function (err, rows) {
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




router.get('/proveriMail/:email/:usern', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var email = req.params.email;
        var usern = req.params.usern;

        test = {};


        connection.query("select username,password from user where  email='" + email + "' and username!='" + usern + "'", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length == 0)
                    test.success = true;
                else
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


router.get('/posaljiMail/:em/:pass', function (req, res) {
    var emaill = req.params.em;
    var password = req.params.pass;
    let mail = "Postovani, \n Vasa nova sifra je " + password + ".\n\n Pozdrav, \n High Five Tim. ";
    var mailOptions = {
        to: emaill,
        subject: 'Promena sifra',
        text: mail
    }
    var test = {};
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            test.success = false;
        }
        else {
            test.success = true;
            res.json(test);
        }
        res.json({ "code": 100, "status": "Error in connection database" });
    });
});


router.get('/posaljiMailZahtevPrihvacen/:id', function (req, res) {
    var idU = req.params.id;


    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var test1 = [];
        connection.query("select email from user where id='" + idU + "'", function (err, rows) {
            connection.release();
            if (!err) {
                test1 = rows[0].email;

                let mail = "Postovani, \n Vas zahtev za vlasnistvo je prihvacen.\n Pozdrav,\n High Five Tim. ";
                var mailOptions = {
                    to: test1,
                    subject: 'Zahtev za vlasnistvo',
                    text: mail
                }
                var test = {};
                smtpTransport.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        test.success = false;
                    }
                    else {
                        test.success = true;
                        res.json(test);
                    }
                    res.json({ "code": 100, "status": "Error in connection database" });
                });
            }
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
});


router.get('/posaljiMail3/:em/:user/:pass', function (req, res) {
    var emaill = req.params.em;
    var password = req.params.pass;
    var username = req.params.user;
    let mail = "Uspesno ste se registrovali.\n Podaci o vasem nalogu: \n Korisnicko ime:" + username + "\n Sifra:" + password + ".\n\n Pozdrav, \n High Five Tim. ";
    var mailOptions = {
        to: emaill,
        subject: 'Uspesna registracija',
        text: mail
    }
    var test = {};
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            test.success = false;
        }
        else {
            test.success = true;
            console.log("Poslato jeeeeee!");
            res.json(test);
        }
        res.json({ "code": 100, "status": "Error in connection database" });
    });
});


router.get('/posaljiMail4/:em', function (req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var emaill = req.params.em;

        test = {};
        connection.query("select username,password from user where  email='" + emaill + "'", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length > 0) {
                    test = rows[0];
                    var user = test.username;
                    var pass = test.password;

                    let mail = "Nedavno ste pokusali da pristupite nalogu. Vasi podaci su: \n Korisnicko ime:" + user + "\n Sifra:" + pass + ".\n\n Pozdrav, \n High Five Tim. ";
                    var mailOptions = {
                        to: emaill,
                        subject: 'Prostupanje nalogu',
                        text: mail
                    }
                    var test1 = {};
                    smtpTransport.sendMail(mailOptions, function (error, response) {
                        if (error) {
                            test1.success = false;
                        }
                        else {
                            test1.success = true;
                            console.log("Poslato jeeeeee!");
                            res.json(test1);
                        }
                        res.json({ "code": 100, "status": "Error in connection database" });
                    });

                }

            }
        });
    });
});




router.get('/posaljiMail2/:ime/:naslov/:email/:tekst', function (req, res) {
    var ime = req.params.ime;
    var naslov = req.params.naslov;
    var email = req.params.email;
    var tekst = req.params.tekst;
    let mail = "Ime posiljaoca:" + ime + " .\n Mail posiljaoca: " + email + " .\n \n " + tekst + "";
    var mailOptions = {
        to: 'plantechhf@gmail.com',
        subject: naslov,
        text: mail
    }
    var test = {};
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            test.success = false;
        }
        else {
            test.success = true;
            res.json(test);
        }
        res.json({ "code": 100, "status": "Error in connection database" });
    });
});





router.get('/proveriAdmina/:user/:pass', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        test = {};
        var userr = req.params.user;
        var pass = req.params.pass;
        var pom = sha1(pass);
        connection.query("select username,password from user where username='" + userr + "' and username='admin' and password='" + pom + "' and password='d033e22ae348aeb5660fc2140aec35850c4da997' ", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length > 0) {
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




router.get('/vratiEmail/:user', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var test = [];
        var userr = req.params.user;
        connection.query("select email from user where username='" + userr + "'", function (err, rows) {
            connection.release();
            if (!err) {
                test = rows[0].email;

                res.json(test);
            }
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
});

router.get('/vratiAtribute', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var test = [];
        var userr = req.params.user;
        connection.query("select * from attribute", function (err, rows) {
            connection.release();
            if (!err) {
                for (i = 0; i < rows.length; i++)
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


router.get('/unesiPodatkee/:zajson/:ref/:ime/:obav/:posl/:podtip/:user', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var podt = req.params.podtip;
        var user = req.params.user;
        var ime = req.params.ime;
        var podaci = {
            name: req.params.ime,
            days: req.params.zajson,
            idSubType: req.params.podtip,
            solution: req.params.obav,
            consequence: req.params.posl,
            datePicked: req.params.ref
        }
        test = {};
        connection.query("select * from rules r join type_subtype s on r.idSubType=" + podt + "  and r.name='" + ime + "' and s.idSubType=r.idSubType join type t on s.idType=t.id and t.idUser=" + user + "", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length == 0) {
                    connection.query("insert into rules SET ?", podaci, function (err, rows) {

                        if (!err) {
                            test.success = true;
                        } else {
                            test.success = false;
                            console.log(err + " greska u ubacivanju pravilaaaaaaaa");
                        }

                        res.json(test);
                    });
                }
                else {
                    test.success = false;
                    res.json(test);
                }
            }



            connection.on('error', function (err) {
                res.json({ "code": 100, "status": "Error in connection database" });
                return;
            });
        });

    });
});




router.get('/proveriUser/:usern', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        test = {};
        var idU = req.params.usern;
        connection.query("select * from user where username='" + idU + "' ", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length > 0) {
                    test.success = true;
                }
                else {
                    test.success = false;
                }

                res.json(test);
            }
            else
                console.log("greskaa");
        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});



router.get('/proveriKoJeLogovan/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        test = {};
        var idU = req.params.id;
        connection.query("select * from user where id=" + idU + " and username='admin'", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length > 0) {
                    test.success = true;
                }
                else {
                    test.success = false;
                }

                res.json(test);
            }
            else
                console.log("greskaa");
        });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});



router.get('/proveriZahtevv/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        test = {};
        var idU = req.params.id;
        connection.query("select * from request where idUser=" + idU + " ", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length > 0) {
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




router.get('/dodajUBazu/:user/:pass/:email/:ime/:prezime/:drzava/:datum', function (req, res, next) {

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
        var blokiran = 0;
        test = {};
        var podaci = {
            username: user,
            password: pass,
            name: ime,
            surname: prezime,
            email: emaill,
            birth: datum,
            country: drzava,
            block: blokiran
        };
        connection.query("insert into user SET ?", podaci, function (err, rows) {
            connection.release();
            if (!err) {
                test.success = true;
                id = rows.insertId;
                connection.query("insert into user_color (idUser,colorOne,colorTwo) values(" + id + ",'blue','green')", function (err, rows) {
                    if (err) {
                        console.log(err);
                        connection.release();
                        return;
                    }
                    connection.query("insert into user_lang (idUser,lang) values(" + id + ",'srb')", function (err, rows) {
                        if (err) {
                            console.log(err);
                            connection.release();
                            return;
                        }
                    });
                });
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


router.get('/prikaziKorisnike', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.idu;
        connection.query("select * from user", function (err, rows) {
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


router.get('/prikaziSveZahteve', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.idu;
        connection.query("select u.* from user u join request r on u.id=r.idUser", function (err, rows) {
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



router.get('/prikaziPlantaze/:idu', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" })
            return;
        }
        var id = req.params.idu;
        connection.query("select distinct p2.*,t.id as idt, t.name as namet, st.name as names,pos.name as namep,u.username,p1.name as imanje from user u join owner_parcel op on u.id=" + id + "  and u.block=0 and u.id=op.idOwner join parcel p1 on op.idParcel=p1.id join plant_parcel pp on p1.id=pp.idParcel join plantation p2 on pp.idPlant=p2.id join plant_type pt on p2.id=pt.idPlant join type t on t.id=pt.idType join subtype st on pt.idSubType=st.id  join producerofseeds pos on pt.idProducer=pos.id union select distinct p2.*,t.id as idt, t.name as namet, st.name as names,pos.name as namep,u1.username,p1.name as imanje from user u join user_connect op on u.id=" + id + " and u.id=op.idWorker join owner_parcel op1 on op1.idOwner=op.idOwner  join  user u2 on op1.idOwner=u2.id and u2.block=0 join  parcel p1 on op1.idParcel=p1.id join plant_parcel pp on p1.id=pp.idParcel join plantation p2 on pp.idPlant=p2.id join plant_type pt on p2.id=pt.idPlant join type t on t.id=pt.idType join subtype st on pt.idSubType=st.id  join producerofseeds pos on pt.idProducer=pos.id join user u1 on op.idOwner=u1.id", function (err, rows) {
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

router.get('/podaciOPlantazi/:plantID', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        test = {};
        var id = req.params.plantID;
        connection.query("select p.name, pt.idType, pt.idSubType, pt.idProducer from plantation p join plant_type pt on p.id=pt.idPlant where p.id=" + id + "", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length > 0) {
                    test.success = true;
                    test.plant = rows[0];
                    console.log(rows[0]);
                } else {
                    test.success = false;
                }
            } else {
                console.log(err);
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

router.get('/expNotifications', function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        test = {};
        var id = sess.LoggedUser.id;
        connection.query(" select * from ( select distinct p2.id,p2.name,u.username,p1.name as imanje,sn.description,sn.severity,sn.date,sn.id as idNot from user u join owner_parcel op on u.id=" + id + "  and u.block=0 and u.id=op.idOwner join parcel p1 on op.idParcel=p1.id join plant_parcel pp on p1.id=pp.idParcel join plantation p2 on pp.idPlant=p2.id join system_notifications sn on sn.idPlant = p2.id where sn.seen=0 union select distinct p2.id,p2.name,u1.username,p1.name as imanje,sn.description,sn.severity,sn.date, sn.id as idNot  from user u join user_connect op on u.id=" + id + " and u.id=op.idWorker join owner_parcel op1 on op1.idOwner=op.idOwner join  user u2 on op1.idOwner=u2.id and u2.block=0 join  parcel p1 on op1.idParcel=p1.id join plant_parcel pp on p1.id=pp.idParcel join plantation p2 on pp.idPlant=p2.id join user u1 on op.idOwner=u1.id join system_notifications sn on sn.idPlant = p2.id where sn.seen=0 )t3 order by t3.date desc", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length > 0) {
                    test.not = new Array();
                    test.success = true;
                    for (var i = 0; i < rows.length; i++) {
                        test.not[i] = rows[i];
                    }
                } else {
                    test.success = false;
                }
            } else {
                console.log(err);
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

router.get('/expNotificationsSeen/:userID', function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        test = {};
        var user = req.params.userID.split(',');
        var ids = [];
        //console.log(user.length + " u get tajps server");
        for (var i = 0; i < user.length; i++) {
            ids[i] = user[i];
        }
        connection.query("update system_notifications set seen=1 where id in (" + ids + ")", function (err, rows) {
            connection.release();
            if (!err) {
                test.success = true;
            } else {
                console.log(err);
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




router.get('/prikaziImanje/:idu', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.idu;
        connection.query("select distinct p1.*,op.idOwner from user u join owner_parcel op on u.id=" + id + " and u.block=0  and u.id=op.idOwner join parcel p1 on op.idParcel=p1.id   union select distinct p1.*, op1.idOwner from user u join user_connect op on u.id=" + id + " and u.id=op.idWorker join owner_parcel op1 on op1.idOwner=op.idOwner join parcel p1 on op1.idParcel=p1.id", function (err, rows) {
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
                console.log("Joveta ");
            }
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
});

router.get('/prikaziPodatkeOImanju/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var idI = req.params.id;
        connection.query("select name from parcel where id=" + idI + "", function (err, rows) {
            connection.release();
            if (!err) {
                var test = new Array();

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

router.get('/vratiTipove1/:idUs', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var idUser = req.params.idUs;
        connection.query("select distinct id,name from type join type_subtype st on id=st.idType where visible!=0 or idUser=" + idUser + "", function (err, rows) {
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
        connection.query("select id from type where name='" + nameTip + "'", function (err, rows) {
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

router.get('/prikaziPodtip/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var idT = req.params.id;

        connection.query("select s.* from type_subtype ts join subtype s on ts.idType=" + idT + " and ts.idSubType=s.id", function (err, rows) {
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

router.get('/prikaziPodtip2/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var idT = req.params.id;

        connection.query("select s.* from type_subtype ts join subtype s on ts.idType=" + idT + " and ts.idSubType=s.id and s.name!='nepoznat'", function (err, rows) {
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

router.get('/prikaziVrednostiSlajderZemljiste/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var idPod = req.params.id;
        connection.query("select s.criticalMin as defaultCritMin,s.criticalMax as defaultCritMax,s.optimalMin, s.optimalMax from Specifications s join subtype_spec ss on s.id = ss.idSpec and ss.idSubType =" + idPod + " join Attribute a on s.idAttribute=a.id and a.name='moisture'", function (err, rows) {
            if (!err) {
                if (rows.length != 0) {
                    var test = [];
                    for (var i = 0; i < rows.length; i++)
                        test[i] = rows[i];

                    res.json(test);
                }
                else if (rows.length == 0) {
                    connection.query("select * from Attribute where name='moisture'", function (err, rows) {
                        connection.release();
                        if (!err) {
                            var test = [];
                            for (var i = 0; i < rows.length; i++)
                                test[i] = rows[i];

                            res.json(test);
                        }
                    });
                }
            }
            connection.on('error', function (err) {
                res.json({ "code": 100, "status": "Error in connection database" });
                return;
            });
        });
    });
});

router.get('/prikaziVrednostiSlajderTemperatura/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var idPod = req.params.id;
        connection.query("select s.criticalMin as defaultCritMin,s.criticalMax as defaultCritMax,s.optimalMin, s.optimalMax from Specifications s join subtype_spec ss on s.id = ss.idSpec and ss.idSubType =" + idPod + " join Attribute a on s.idAttribute=a.id and a.name='temperature'", function (err, rows) {
            if (!err) {
                if (rows.length != 0) {
                    var test = [];
                    for (var i = 0; i < rows.length; i++)
                        test[i] = rows[i];

                    res.json(test);
                }
                else if (rows.length == 0) {
                    connection.query("select * from Attribute where name='temperature'", function (err, rows) {
                        connection.release();
                        if (!err) {
                            var test = [];
                            for (var i = 0; i < rows.length; i++)
                                test[i] = rows[i];

                            res.json(test);
                        }
                    });
                }
            }

            connection.on('error', function (err) {
                res.json({ "code": 100, "status": "Error in connection database" });
                return;
            });
        });
    });
});
router.get('/prikaziVrednostiSlajderC/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var idPod = req.params.id;
        connection.query("select s.criticalMin as defaultCritMin,s.criticalMax as defaultCritMax,s.optimalMin, s.optimalMax from Specifications s join subtype_spec ss on s.id = ss.idSpec and ss.idSubType =" + idPod + " join Attribute a on s.idAttribute=a.id and a.name='C'", function (err, rows) {
            if (!err) {
                if (rows.length != 0) {
                    var test = [];
                    for (var i = 0; i < rows.length; i++)
                        test[i] = rows[i];

                    res.json(test);
                }
                else if (rows.length == 0) {
                    connection.query("select * from Attribute where name='C'", function (err, rows) {
                        connection.release();
                        if (!err) {
                            var test = [];
                            for (var i = 0; i < rows.length; i++)
                                test[i] = rows[i];

                            res.json(test);
                        }
                    });
                }
            }

            connection.on('error', function (err) {
                res.json({ "code": 100, "status": "Error in connection database" });
                return;
            });
        });
    });
});

router.get('/prikaziVrednostiSlajderr/:id/:ime', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var idPod = req.params.id;
        var ime = req.params.ime;
        connection.query("select s.criticalMin as defaultCritMin,s.criticalMax as defaultCritMax,s.optimalMin, s.optimalMax from Specifications s join subtype_spec ss on s.id = ss.idSpec and ss.idSubType =" + idPod + " join Attribute a on s.idAttribute=a.id and a.name='" + ime + "'", function (err, rows) {
            if (!err) {
                if (rows.length != 0) {
                    var test = [];
                    for (var i = 0; i < rows.length; i++)
                        test[i] = rows[i];

                    res.json(test);
                }
                else if (rows.length == 0) {
                    connection.query("select * from Attribute where name='" + ime + "'", function (err, rows) {
                        connection.release();
                        if (!err) {
                            var test = [];
                            for (var i = 0; i < rows.length; i++)
                                test[i] = rows[i];

                            res.json(test);
                        }
                    });
                }
            }

            connection.on('error', function (err) {
                res.json({ "code": 100, "status": "Error in connection database" });
                return;
            });
        });
    });
});

router.get('/prikaziVrednostiSlajderrAdvance/:id/:idPodtip', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        var idPod = req.params.idPodtip;
        var idAtr = req.params.id;
        connection.query("select s.criticalMin as defaultCritMin,s.criticalMax as defaultCritMax,s.optimalMin, s.optimalMax from Specifications s join subtype_spec ss on s.id = ss.idSpec and ss.idSubType =" + idPod + " join Attribute a on s.idAttribute=a.id and a.name='" + idAtr + "'", function (err, rows) {
            if (!err) {
                if (rows.length != 0) {
                    var test = [];
                    for (var i = 0; i < rows.length; i++)
                        test[i] = rows[i];

                    res.json(test);
                }
                else if (rows.length == 0) {
                    connection.query("select * from Attribute where name='" + idAtr + "'", function (err, rows) {
                        connection.release();
                        if (!err) {
                            var test = [];
                            for (var i = 0; i < rows.length; i++)
                                test[i] = rows[i];

                            res.json(test);
                        }
                    });
                }
            }

            connection.on('error', function (err) {
                res.json({ "code": 100, "status": "Error in connection database" });
                return;
            });
        });
    });
});

router.get('/vratiIdAtributa/:ime', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var ime1 = req.params.ime;

        connection.query("select* from Attribute where name='" + ime1 + "'", function (err, rows) {
            connection.release();
            if (!err) {
                var test = [];
                test[0] = rows[0];

                res.json(test);
            }
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
});

var plantation11 = require('../models/plantation');
router.get('/promeniPlantaze/:idplant/:idus/:imep/:imet/:imest/:imeps/:nizPoli', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        var idp = req.params.idplant;
        var idUs = req.params.idus;
        var imeP = req.params.imep;
        var imeT = req.params.imet;
        var imeST = req.params.imest;
        var imePS = req.params.imeps;
        var pom = JSON.parse(req.params.nizPoli);


        //  console.log("drugi ---> "+JSON.stringify(poligoni.getArray()));

        //console.log("promeniPlantaze: " + idp + " : " + idUs + " : " + imeP + " : " + imeT + " : " + imeST + " : " + imePS);
        test = {};
        var poligoni = pom;
        var poly = [];
        for (var i = 0; i < poligoni.length; i++) {
            var coords = [];
            for (var j = 0; j < poligoni[i].length; j++) {

                var latlng = [];
                latlng.push(poligoni[i][j].lng);
                latlng.push(poligoni[i][j].lat);
                coords.push(latlng);
            }
            // coords.push(coords[0]);
            poly.push(coords);
        }
        console.log("poly: ---> " + JSON.stringify(poly));
        console.log("pol " + poly);

        //prvi.update({ 'plantationID': idp }, { $set:{ 'userID': 118 }});


        plantation11.findOneAndUpdate({
            plantationID: idp
        },
            {
                $set: { 'coordinates': poly }
            }, { upsert: true }, function (err, newPlant) {
                if (err) {
                    res.send('error updating ');
                } else {
                    console.log(newPlant);
                    //res.send(newPlant);
                }
            });

        connection.query("UPDATE plantation,plant_type SET plantation.name = '" + imeP + "',plant_type.idType = " + imeT + ",plant_type.idSubType =" + imeST + ",plant_type.idProducer=" + imePS + " WHERE plantation.id = " + idp + " and plant_type.idPlant = " + idp + "", [imeP, imeT, imeST, imePS], function (err, rows) {
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

router.get('/promeniParcelu/:imeP/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var novoIme = req.params.imeP;
        var id = req.params.id;

        test = {};


        connection.query("update parcel set name=? where id=" + id + "", [novoIme], function (err, rows) {
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

router.get('/sacuvajPodatkeZaPraviloZemljiste/:critMin/:critMax/:optMin/:optMax/:podtip/:atr/:podt/:ime', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        var critMin = req.params.critMin;
        var critMax = req.params.critMax;
        var optMin = req.params.optMin;
        var optMax = req.params.optMax;
        var podtip = req.params.podtip;
        var atribut = req.params.atr;
        var idPod = req.params.podt;
        var ime = req.params.ime;
        console.log("PODTIP " + podtip + " ATRIBUT " + atribut + "ID SPEC " + idPod + " IME " + ime);
        connection.query("select a.* from subtype_spec sc join Specifications s on sc.idSpec=s.id and sc.idSubType=" + podtip + " join Attribute a on a.id=s.idAttribute and a.name='" + ime + "'", function (err, rows) {
            if (!err) {
                if (rows.length == 0) {
                    console.log("UPISUJEM!");
                    var podatak = {
                        criticalMin: critMin,
                        criticalMax: critMax,
                        optimalMin: optMin,
                        optimalMax: optMax,
                        idAttribute: atribut
                    };
                    var pomocna = idPod;
                    test = {};
                    connection.query("insert into Specifications SET ?", podatak, function (err, rows) {

                        if (!err) {
                            idKolone = rows.insertId;
                            var podatak1 = {
                                idSubType: podtip,
                                idSpec: idKolone
                            };
                            connection.query("insert into subtype_spec SET ?", podatak1, function (err, rows) {

                                if (!err)
                                    test.success = true;
                                else test.success = false;
                            });
                        }
                        else {
                            test.success = false;
                        }
                        res.json(test);

                    });
                }
                else {
                    var pom1;
                    console.log("SAD SAM OVDE!" + idPod + " crit min " + critMin + " crit max " + critMax);
                    connection.query("UPDATE Specifications s SET s.criticalMin=?, s.criticalMax=?, s.optimalMin=?, s.optimalMax=? where id=" + idPod + "", [critMin, critMax, optMin, optMax, atribut], function (err, rows) {
                        if (!err)
                            test.success = true;
                        else test.success = false;
                    });
                }
            }
        });

        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;

        });

    });
});

router.get('/nadjiIdSpec/:podt/:atr', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        console.log("OVDEEEEEEEEEE!!!");
        var podtip = req.params.podt;
        var atr = req.params.atr;
        connection.query("select s.* from Specifications s join subtype_spec ss on s.id = ss.idSpec and ss.idSubType =" + podtip + " and s.idAttribute=" + atr + "", function (err, rows) {
            if (!err) {
                var test = [];
                if (rows.length != 0) {
                    test[0] = rows[0];
                }
                else test[0] = 0;
                res.json(test);
            }
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
});

router.get('/promeniKorisnika/:id/:status', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.id;
        var status = req.params.status;

        test = {};


        connection.query("update user set block=? where id=" + id + "", [status], function (err, rows) {
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

        connection.query("select ps1.* from subtype st join producer_subtype ps on st.name='" + nameST + "' and st.id=ps.idSubType join producerofseeds ps1 on ps.idProducer=ps1.id", function (err, rows) {
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


router.get('/obrisiImanje/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.id

        test = {};

        connection.query("delete from parcel where id=" + id + "", function (err, rows) {
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







router.get('/dozvolaZaVlasnika/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var idU = req.params.id

        test = {};

        connection.query("delete from request where idUser=" + idU + "", function (err, rows) {
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




router.get('/obrisiZahtev/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var idU = req.params.id

        test = {};

        connection.query("delete from request where idUser=" + idU + "", function (err, rows) {
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



router.get("/informacijeOZemljistu/:idplant", function (req, res, next) {
    pool1.getConnection(function (err, connection) {
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

    pool1.getConnection(function (err, connection) {
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
router.get('/getUserByID/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.id

        test = {};

        connection.query("select * from user where id=" + id + "", function (err, rows) {
            connection.release();
            if (!err) {
                for (var i = 0; i < rows.length; i++) {
                    test[i] = rows[i];
                    res.json(test);
                    return;
                }

            }
            else console.log(err);

        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});
router.get('/dodajRadnika2/:ownerID/:username/:roleID', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var ownerID = req.params.ownerID;

        var roleID = req.params.roleID;
        var userid;
        var tt;

        var username = req.params.username;

        var test = [];

        /*     connection.query("select * from user u join owner o on u.username='" + username + "' and u.id=o.idUser", function (err, rows) {
                connection.release();
                 if (!err) {
                     if (rows.length != 0) {
                         test = false
                         res.json(test);
                         return;
                     }
     
                 }
                 else console.log(err);
     
             });*/

        connection.query("select id from user where username='" + username + "' and block=0 and id!=" + ownerID + "", function (err, rows) {

            if (!err) {


                for (var i = 0; i < rows.length; i++) {
                    test[i] = rows[i];
                    userid = rows[i].id;
                    console.log("test userid" + userid);
                    console.log("ceo red " + rows[i]);
                }
                console.log("uuaa " + userid);
                if (userid === undefined) {
                    console.log("undefined");
                    test.success = false;
                    test[0] = "nema";
                    res.json(test);
                    return;
                }
                else
                    console.log("dendefined");
                test = {};
                var podaci = {
                    idOwner: ownerID,
                    idWorker: userid,
                    idRole: roleID,
                    date: dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")
                };
                console.log("dendefined" + ownerID + " us " + userid);
                connection.query("select * from user_connect where idWorker=" + userid + " and idOwner=" + ownerID + "", function (err, rows) {

                    if (!err) {
                        for (var i = 0; i < rows.length; i++) {
                            test[i] = rows[i];
                            tt = rows[i];
                        }



                    }
                    else console.log(err);
                    console.log("test " + tt);
                    if (test[0] !== undefined) {
                        console.log("undefined 2 3");
                        test.success = false;
                        test[0] = "ima";
                        res.json(test);
                        return;
                    }



                    connection.query("insert into notifications SET ?", podaci, function (err, rows) {
                        /*     connection.release();*/
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


                });


                console.log("ceo red2 " + podaci);

            }
        });



        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});


router.get('/dodajRadnika/:ownerID/:workerID/:roleID/:accepted', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var ownerID = req.params.ownerID;

        var workerID = req.params.workerID;
        var roleID = req.params.roleID;
        var dodaj = req.params.accepted;


        test = {};
        var podaci
        if (dodaj == 1) podaci = {
            idOwner: ownerID,
            idWorker: workerID,
            idRole: roleID,
        };
        console.log(dodaj);
        connection.query("delete from notifications where idWorker=" + workerID + " and idOwner=" + ownerID, function (err, rows) {
            if (dodaj == 0) {
                connection.release();
                console.log("isao gde treba");
                test.success = true;
                res.json(test);
                return;
            }
            else if (dodaj == 1) {
                console.log("isao");
                connection.query("delete from user_connect where idWorker=" + workerID + " and idOwner=" + ownerID, function (err, rows) {
                    connection.query("insert into user_connect SET ?", podaci, function (err, rows) {
                        connection.release();

                        if (!err) {
                            test.success = true;

                        }
                        else {
                            test.success = false;

                        }
                        res.json(test);


                    });
                });
            } else
                connection.release();

        });

        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});


router.get('/promeniSifru2/:username/:sifra', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var pass = sha1(req.params.sifra);
        var user = req.params.username;
        console.log(pass + " user " + user);
        test = {};
        console.log("OVDE SAM: " + user + " i " + pass);
        connection.query('UPDATE user SET password=? WHERE username = ?', [pass, user], function (err, rows) {
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




router.get('/proveriObavestenja/:ownerID/:username/', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var ownerID = req.params.ownerID;
        var user = req.params.username;
        test = {};
        connection.query("select * from user u join notifications n on u.username='" + user + "' and u.id=n.idWorker and n.idOwner=" + ownerID + " ", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length != 0) {
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



router.get('/proveriConnect/:ownerID/:username/', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var ownerID = req.params.ownerID;
        var user = req.params.username;
        test = {};
        connection.query("select * from user u join user_connect n on u.username='" + user + "' and u.id=n.idWorker and n.idOwner=" + ownerID + " ", function (err, rows) {
            connection.release();
            if (!err) {
                if (rows.length != 0) {
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





router.get('/dodajObavestenje/:ownerID/:workerID/:roleID', function (req, res, next) {
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
            date: dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")
        };
        connection.query("delete from notifications where idWorker=" + workerID + " and idOwner=" + ownerID, function (err, rows) {


            connection.query("insert into notifications SET ?", podaci, function (err, rows) {
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
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

router.get('/dozvolaZaVlasnika1/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var idU = req.params.id


        test = {};
        var podaci = {
            idUser: idU
        };

        connection.query("insert into owner SET ?", podaci, function (err, rows) {
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
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

router.get("/dohvatiObavestenja", function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }


        connection.query("select u1.id as 'idworker', u2.id as 'idowner', r.id as 'idrole', u1.name as 'radnik', u2.name as 'ownername', u2.surname as 'ownerlastname', r.name as 'role', DATE_FORMAT(n.date,'%m-%d-%Y') as 'date',u2.profilePic from notifications n join user u1 on u1.id=n.idWorker join user u2 on n.idOwner=u2.id join role r on r.id=n.idRole where u1.id=" + sess.LoggedUser.id + " order by n.date desc", function (err, rows) {
            connection.release();
            if (!err) {
                var test = rows;




                res.json(test);
            }
        });


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
router.get('/getRoles/:id', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var user = req.params.id.split(',');
        var ids = [];
        //console.log(user.length + " u get tajps server");
        for (var i = 0; i < user.length; i++) {
            ids[i] = user[i];
            console.log(user[i]);
        }

        connection.query("select * from role where visible=0 OR idUser in (" + ids + ")", function (err, rows) {
            connection.release();
            if (!err) {
                var test = [];

                for (var i = 0; i < rows.length; i++) {
                    test[i] = rows[i];
                    console.log(rows[i]);
                }


                res.json(test);
            } else {
                console.log(err);
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



router.get('/osveziPodatke', function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        test = {};

        connection.query("select * from user where id = " + sess.LoggedUser.id, function (err, rows) {
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

router.get('/getOwners', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }


        connection.query("select distinct o.idOwner, u.username, u.name, u.surname, u.email from owner_parcel o join user u on o.idOwner=u.id", function (err, rows) {
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


router.get('/uzmiImanja', function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        /* console.log(`select * from 
         (select u.id as 'idowner', u.username, u.id as 'iduser', p.id as 'idparc', p.name 
         from owner_parcel op join parcel p on op.idParcel = p.id join user u on u.id = op.idOwner 
         where u.id= ` + sess.LoggedUser.id + ` ` +
             `union
         select uc.idOwner as 'idowner', u.username, u.id as 'iduser', p.id as 'idparc', p.name 
         from user_connect uc join owner_parcel op on
         uc.idOwner = op.idOwner join parcel p on op.idParcel = p.id join user u on u.id = uc.idWorker 
         where uc.idWorker=`+ sess.LoggedUser.id + `) t3`);*/
        connection.query(`select * from 
        (select u.id as 'idowner', u.username, u.id as 'iduser', p.id as 'idparc', p.name 
        from owner_parcel op join parcel p on op.idParcel = p.id join user u on u.id = op.idOwner 
        where u.id= ` + sess.LoggedUser.id + ` ` +
            `union
        select uc.idOwner as 'idowner', u.username, u.id as 'iduser', p.id as 'idparc', p.name 
        from user_connect uc join owner_parcel op on
        uc.idOwner = op.idOwner join parcel p on op.idParcel = p.id join user u on u.id = uc.idWorker 
        where uc.idWorker=`+ sess.LoggedUser.id + `) t3`, function (err, rows) {
                connection.release();
                res.json(rows);

            });


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

router.get('/dodajImanje/:ime/:idowner', function (req, res, next) {
    var success = true;
    var ime = req.params.ime;
    var idowner = req.params.idowner;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        var parcela = {
            name: ime
        };
        connection.query("select * from owner_parcel op join parcel p on op.idOwner=" + idowner + " and op.idParcel=p.id and p.name='" + ime + "'", parcela, function (err, rows) {
            if (rows.length > 0) success = false;
            if (success == true) {
                connection.query("INSERT INTO parcel SET ?", parcela, function (err, rows) {

                    if (err) {
                        console.log(err);
                        success = false;
                        res.json(success);
                        return;
                    }

                    var idparc = rows.insertId;
                    var op = {
                        idOwner: idowner,
                        idParcel: idparc
                    };

                    connection.query("INSERT INTO owner_parcel SET ?", op, function (err, rows) {
                        connection.release();

                        if (err) {
                            console.log(err);
                            success = false;
                            res.json(success);
                            return;

                        }
                        else {
                            res.json(success);

                        }
                    });

                });
            }
            else res.json(success);
            connection.on('error', function (err) {
                res.json({ "code": 100, "status": "Error in connection database" });
                return;
            });
        });

    });
});
router.get('/plantationNames/:id', function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        test = {};
        var user = req.params.id;

        var plants = [];

        connection.query("SELECT pp.idPlant as 'id', pl.name as 'ime', t.name as 'tip', st.name as 'podtip', ps.name as 'producer', u.username as 'username' FROM plant_parcel pp JOIN plantation pl ON pp.idPlant = pl.id JOIN plant_type pt on pl.id = pt.idPlant JOIN type t ON t.id=pt.idType JOIN subtype st ON st.id = pt.idSubType JOIN producerofseeds ps ON ps.id = pt.idProducer JOIN owner_parcel op ON op.idParcel=pp.idParcel JOIN user u ON u.id = op.idOwner WHERE pp.idParcel ='" + user + "'", function (err, rows) {
            connection.release();
            if (!err) {
                test.success = true;
                for (var i = 0; i < rows.length; i++)
                    plants[i] = rows[i];

            } else {
                test.success = false;
            }
            console.log(plants + " naziviivivivi!");
            res.json(plants);

        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});



router.get('/plantsInParcel/:id', function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        test = {};
        var user = req.params.id;
        console.log("ovo novo broj parcele " + user)
        var plants = [];
        connection.query("select idPlant from plant_parcel where idParcel='" + user + "'", function (err, rows) {
            connection.release();
            if (!err) {
                test.success = true;
                for (var i = 0; i < rows.length; i++)
                    plants[i] = rows[i].idPlant;

            } else {
                test.success = false;
            }
            console.log(plants + " plantaze na parceli");
            uzmiPlantaze(test, plants);

        });

        function uzmiPlantaze(test, plants) {
            if (test.success) {
                plantation.find({
                    plantationID: { $in: plants }
                })
                    .exec(function (err, plantations) {
                        if (err) {
                            res.send('error occured')
                        } else {
                            console.log(plantations);
                            res.json(plantations);
                        }
                    });
            } else {
                res.json(test);
            }
        }


        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});

router.get('/getUserColor/:id', function (req, res, next) {
    console.log("cita");
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.id
        console.log(id);
        test = {};

        connection.query("select * from user_color where idUser=" + id + "", function (err, rows) {
            connection.release();
            if (!err) {
                for (var i = 0; i < rows.length; i++) {
                    test[i] = rows[i];
                    console.log("cita");
                    console.log(test[i]);
                    res.json(test);
                    return;
                }

            }
            else console.log(err);

        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});
router.get('/insertColor/:userID/:colorOne/:colorTwo', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        console.log(req.params.colorOne);
        var userID = req.params.userID;
        console.log(userID);
        var colorOne = req.params.colorOne;
        var colorTwo = req.params.colorTwo;
        console.log(colorOne);


        test = {};
        var podaci = {
            idUser: userID,
            colorOne: colorOne,
            colorTwo: colorTwo,
        };

        connection.query("delete from user_color where idUser=" + userID, function (err, rows) {
            connection.query("insert into user_color SET ?", podaci, function (err, rows) {
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


        });

        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});
router.get('/getUserLang/:id', function (req, res, next) {
    console.log("cita lang");
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.id
        console.log(id);
        test = {};

        connection.query("select * from user_lang where idUser=" + id + "", function (err, rows) {
            connection.release();
            if (!err) {
                for (var i = 0; i < rows.length; i++) {
                    test[i] = rows[i];
                    console.log("cita");
                    console.log(test[i]);
                    res.json(test);
                    return;
                }

            }
            else console.log(err);

        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});
router.get('/insertLang/:userID/:lang', function (req, res, next) {
    console.log("pise lang");
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        var userID = req.params.userID;

        var lang = req.params.lang;



        test = {};
        var podaci = {
            idUser: userID,
            lang: lang,

        };

        connection.query("delete from user_lang where idUser=" + userID, function (err, rows) {
            connection.query("insert into user_lang SET ?", podaci, function (err, rows) {
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


        });

        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

});


router.get('/prikaziPlantazeSaImanja/:idIm', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        var id = req.params.idIm;
        connection.query("SELECT p.* FROM plant_parcel pp JOIN plantation p on pp.idPlant=p.id WHERE pp.idParcel=" + id, function (err, rows) {
            connection.release();
            if (!err) {
                res.json(rows);
            }
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
});


router.get('/dajMerenja/', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        connection.query("SELECT * FROM Attribute", function (err, rows) {
            connection.release();
            if (!err) {
                res.json(rows);
            }
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
});

module.exports = router;
