var mongoose = require('mongoose');
var plantation = require('../models/plantation');
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');
var request = require('request');
const express = require('express');

var app = express.Router();
//var weather = require('npm-openweathermap');
//weather.api_key = '0d009ab575deb18aa53e1930f40234c7';
//weather.temp = 'c';



var fuzzylogic = require("fuzzylogic");
var ODDataValues = require("../FakeSys/FakeSystem.js");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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

const pool1 = mysql.createPool({
    connectionLimit: 10,
    host: '147.91.204.116',
    user: 'HighFive',
    password: 'admin admin',
    database: 'HighFive_mu',
    debug: false
});


/*
const pool1 = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'highfive_mu',
    debug: false
});
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'highfive',
    debug: false
});
*/
/*
  connection.query("insert into system_notifications set ?", notification, function (err, rez) {
          
            if (err) {
                console.log(err);
                return;
            }

        });
        */
var nools = require("nools");
var Merenje = function (idPlant, value, tipMerenja) {
    this.idPlant = idPlant;
    this.value = value;
    this.tipMerenja = tipMerenja;
}
var Obavestenje = function (idPlant, description, severity) {
    this.idPlant = idPlant;
    this.description = description;
    this.severity = severity;
}
var flow = nools.flow("ekspertski", function (flow) {
    flow.rule("viseOdOptimalnog", [Merenje, "m", "m.value > 0.5 && m.value<1"], function (facts) {

        console.log("manje od opt");
        console.log(facts.m);
        var str = "";
        switch (facts.m.tipMerenja) {
            case 'temperatura':
                str = "Temperatura je visa od idealne za posadjeni tip."
                break;
            case 'vlaznost zemljista':
                str = "Vlaznost zemljista je veca od idealne za posadjeni tip.Preporucujemo umerenije zalivanje."
                break;

            default:
                str = "Elementi u zemljistu su zastupljeni u vecem procentu nego sto je idealno. Preporucujemo smanjivanje djubrenja.";
                break;
        }
        var obavestenje = new Obavestenje(
            facts.m.idPlant,
            str,
            1);
        this.assert(obavestenje)





    });

    flow.rule("manjeOdOptimalnog", [Merenje, "m", "m.value <-0.5 && m.value>-1"], function (facts) {

        console.log("manje od opt");
        console.log(facts.m);
        var str = "";
        switch (facts.m.tipMerenja) {
            case 'temperatura':
                str = "Temperatura je niza od idealne za posadjeni tip."
                break;
            case 'vlaznost zemljista':
                str = "Vlaznost zemljista je manja od idealne za posadjeni tip. Preporucujemo cesce i obimnije zalivanje."
                break;

            default:
                str = "Elementi u zemljistu su zastupljeni u manjem procentu nego sto je idealno. Preporucujemo umereno djubrenje.";
                break;
        }
        var obavestenje = new Obavestenje(
            facts.m.idPlant,
            str,
            1);
        this.assert(obavestenje)





    });

    flow.rule("kriticnoGornje", [Merenje, "m", "m.value<=0.5 && m.value >=0"], function (facts) {


        console.log("kriticno!");
        console.log(facts.m);
        var str = "";
        switch (facts.m.tipMerenja) {
            case 'temperatura':
                str = "Temperatura je na kriticno visokom nivou!"
                break;
            case 'vlaznost zemljista':
                str = "Vlaznost zemljista je kriticno visoka! Preporucujemo drasticno smanjivanje zalivanja."
                break;

            default:
                str = "Elementi u zemljistu su zastupljeni u kriticno vecem procentu od predvidjenog! Preporucujemo drasticno smanjivanje djubrenja.";
                break;
        }
        var obavestenje = new Obavestenje(
            facts.m.idPlant,
            str,
            1);
        this.assert(obavestenje)
    });

    flow.rule("kriticnoDonje", [Merenje, "m", "(m.value>= -0.5 && m.value < 0) || m.value==-1"], function (facts) {


        console.log("kriticno!");
        console.log(facts.m);
        var str = "";
        switch (facts.m.tipMerenja) {
            case 'temperatura':
                str = "Temperatura je na kriticno niskom nivou!"
                break;
            case 'vlaznost zemljista':
                str = "Vlaznost zemljista je kriticno niza od predvidjene! Preporucujemo obimnije zalivanje u sto kracem roku."
                break;

            default:
                str = "Elementi u zemljistu su zastupljeni u kriticno nizem procentu od predvidjenog. Preporucujemo obimno djubrenje u sto kracem roku.";
                break;
        }
        var obavestenje = new Obavestenje(
            facts.m.idPlant,
            str,
            1);
        this.assert(obavestenje)
    });

});
//var flow = nools.compile(__dirname + "/test.nools");

/*var Fibonacci = flow.getDefined("fibonacci"), Result = flow.getDefined("result");
var r1 = new Result(),
    session1 = flow.getSession(new Fibonacci({sequence:10}), r1),
    s1 = +(new Date());
session1.match().then(function () {
    console.log("%d [%dms]", r1.result, +(new Date()) - s1);
    session1.dispose();
});
 
var r2 = new Result(),
    session2 = flow.getSession(new Fibonacci({sequence:150}), r2),
    s2 = +(new Date());
session2.match().then(function () {
    console.log("%d [%dms]", r2.result, +(new Date()) - s2);
    session2.dispose();
});
 
var r3 = new Result(),
    session3 = flow.getSession(new Fibonacci({sequence:1000}), r3),
    s3 = +(new Date());
session3.match().then(function () {
    console.log("%d [%dms]", r3.result, +(new Date()) - s3);
    session3.dispose();
});*/




var ocitajVrednosti = function () {

    console.log('Crone pokrenut');
    var fake = new ODDataValues();


    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            return;
        }
        pool1.getConnection(function (err, connection2) {
            if (err) {
                console.log(err);
                return;
            }

            connection.query(`SELECT distinct idPlant, m.attribute FROM plant_measurer pm join measurer m on pm.idMeasurer = m.id`, function (err, rows) {
                if (err) {
                    console.log(err);
                    connection2.release();
                    connection.release();

                    return;
                }






                for (let i = 0; i < rows.length; i++) {
                    (function (cntr) {
                        var merenje = rows[cntr].attribute.split("-");
                        var merenja = [];
                        merenje.forEach(function (entry) {
                            merenja.push(entry.split("~")[0]);
                        });

                        var idp = rows[cntr].idPlant;



                        var data = fake.getDataValue(merenja);
                        var time = fake.getDateTimeUTC();
                        var row = {};
                        row.date = time;
                        row.idPlant = rows[i].idPlant;
                        connection.query(` SELECT a.name, s.criticalMin, s.criticalMax, s.optimalMin, s.optimalMax
                                FROM plant_type pt
                                JOIN subtype_spec ss ON pt.idPlant =`+ idp +
                            ` AND pt.idSubType = ss.idSubType
                                JOIN Specifications s ON s.id = ss.idSpec
                                JOIN Attribute a ON a.id = s.idAttribute`,
                            function (err, redovi) {
                                if (err) {
                                    console.log(err);
                                    connection2.release();
                                    connection.release();

                                    return;
                                }

                                if (redovi.length > 0) {


                                    connection2.query("insert into measuring SET ?", row, function (err, rowsss) {
                                        if (err) {
                                            console.log(err);
                                            connection2.release();
                                            connection.release();

                                            return;
                                        }
                                        var row = {};
                                        row.idMeasure = rowsss.insertId;
                                        row.measurment = data;
                                        test = {};
                                        connection2.query("insert into measuring_detail SET ?", row, function (err, rowssss) {
                                            if (err) {
                                                console.log(err);
                                                connection2.release();
                                                connection.release();

                                                return;
                                            }


                                            test = {};


                                            connection2.query("select measuring.id,measurment,DATE_FORMAT(date,'%d-%m-%Y') as 'date' from measuring join measuring_detail on measuring.id=measuring_detail.idMeasure where measuring.idPlant=" + idp + " order by measuring.date desc, measuring.id", function (err, rows) {
                                                if (err) {
                                                    console.log(err);
                                                    connection2.release();
                                                    connection.release();

                                                    return;
                                                }
                                                if (!err) {
                                                    if (rows.length != 0) { test.success = true; }
                                                    else { test.success = false; }
                                                    test.labels = new Array();
                                                    test.data = new Array();



                                                    var dict = {};
                                                    for (i = 0; i < rows.length && i < 5; i++) {
                                                        if (test.labels.indexOf(rows[i].data) === -1) {
                                                            test.labels.push(rows[i].date)

                                                        }
                                                        var data = JSON.parse(rows[i].measurment);
                                                        for (var k in data) {
                                                            if (data.hasOwnProperty(k)) {
                                                                if (dict[k] === undefined) dict[k] = new Array();
                                                                dict[k].push(data[k]);
                                                            }
                                                        }


                                                    }

                                                    for (var k in dict) {
                                                        if (dict.hasOwnProperty(k)) {


                                                            var obj = {};
                                                            obj.data = new Array();
                                                            obj.label = k;
                                                            obj.data = dict[k];

                                                            test.data.push(obj);
                                                        }

                                                    }
                                                    zemljisteVlaznost = test;

                                                    plantation.find({
                                                        plantationID: idp
                                                    }).exec(function (err, plantations) {
                                                        var centerX; var centerY;
                                                        var xmin = 99999, xmax = -99999, ymin = 99999, ymax = -99999;
                                                        for (var g = 0; g < plantations[0].length; g++) {

                                                            if (xmin > plantations[0][g][0]) xmin = plantations[0][g][0];
                                                            if (xmax < plantations[0][g][0]) xmax = plantations[0][g][0];
                                                            if (ymin > plantations[0][g][1]) ymin = plantations[0][g][1];
                                                            if (ymax < plantations[0][g][1]) ymax = plantations[0][g][1];
                                                        }
                                                        centerX = xmin + ((xmax - xmin) / 2);
                                                        centerY = ymin + ((ymax - ymin) / 2);
                                                        str = "http://api.openweathermap.org/data/2.5/weather?lat=" + centerY + "&lon=" + centerX + "&units=metric&appid=0d009ab575deb18aa53e1930f40234c7&lang=hr";
                                                        request({ url: str, json: true }, function (error, response, body) {

                                                            temperatura = body.main.temp;

                                                            var merenje = {
                                                                idPlant: idp,
                                                                value: temperatura,
                                                                date: dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")
                                                            }

                                                            connection2.query("insert into temperatura SET ?", merenje, function (err, rows) {
                                                                if (err) {
                                                                    console.log(err);
                                                                    connection2.release();
                                                                    connection.release();

                                                                    return;
                                                                }

                                                                if (!err) {
                                                                    connection2.query("select * from temperatura where idPlant = " + idp + ' ORDER BY DATE DESC', function (err, rows) {
                                                                        if (err) {
                                                                            console.log(err);
                                                                            connection2.release();
                                                                            connection.release();

                                                                            return;
                                                                        }
                                                                        if (!err) {

                                                                            var suma = 0;
                                                                            for (var j = 0; j < 5 && j < rows.length; j++) suma += rows[j].value;
                                                                            var prosek = suma / 5; //prosek temperature
                                                                            var prosekZemljista = [];



                                                                            var niz = zemljisteVlaznost.data;
                                                                            for (var j = 0; j < niz.length; j++) {
                                                                                prosekZemljista[niz[j].label] = 0;

                                                                                for (k = 0; k < niz[j].data.length; k++) {

                                                                                    prosekZemljista[niz[j].label] += niz[j].data[k];
                                                                                }

                                                                                prosekZemljista[niz[j].label] /= niz[j].data.length;




                                                                            }
                                                                            /*for (var i = 0; i < zemljisteVlaznost.data.length; i++) {
                                                                                prosekZemljista[zemljisteVlaznost.data[i].data.label] = 0;
                                                                                //var niz = zemljisteVlaznost.data[i].data
                                                                                for (var j = 0; j < zemljisteVlaznost.data[i].data.length; i++) {
                
                                                                                    prosekZemljista[zemljisteVlaznost.data[i].label] += zemljisteVlaznost.data[i].data[j];
                                                                                }
                                                                                prosekZemljista[zemljisteVlaznost.data[i].label] /= zemljisteVlaznost.data[i].data.length;
                                                                                console.log("k: "+prosekZemljista[zemljisteVlaznost.data[i].label]);
                                                                            }*/
                                                                            console.log("idPlantaze:" + idp);
                                                                            console.log("temp: " + prosek);

                                                                            console.log("vlaznost: " + prosekZemljista['Vlaznost']);

                                                                            /* ======================   DSL NOOLS =================================
                
                
                
                                                                            var merenje = flow.getDefined("Merenje"), obavestenje = flow.getDefined("Obavestenje");
                
                                                                            console.log("! " + fuzzylogic.trapezoid(prosek, 0, 20, 24, 100));
                                                                            var m1 = new merenje({ value: fuzzylogic.trapezoid(prosek, 0, 20, 24, 100), id: 15, tipMerenja: 'temperatura', tipBiljke: 'buzdovan' });
                                                                            session = flow.getSession(m1);
                
                                                                            session.match().then(function () {
                                                                                var niz = session.getFacts();
                                                                                for (var i = 0; i < niz.length; i++) {
                                                                                    if (niz[i].tip != null) {
                                                                                        console.log(niz[i].tip);
                                                                                    }
                                                                                }
                                                                                session.dispose();
                                                                            });
                
                
                
                                                                            /*define Merenje{
                                                                                value: null,
                                                                                id: null,
                                                                                tipMerenja: null,
                                                                                tipBiljke: null,
                                                                            }*/
                                                                            /* ----------------------- drugi NOOLS ------------------------------*/




                                                                            // console.log("!");

                                                                            var session = flow.getSession();
                                                                            //console.log(session);
                                                                            for (var k = 0; k < redovi.length; k++) {
                                                                                switch (redovi[k].name) {
                                                                                    case 'moisture':

                                                                                        session.assert(new Merenje(idp, fuzzylogic.trapezoid(prosekZemljista['Vlaznost'], redovi[k].criticalMin, redovi[k].optimalMin, redovi[k].optimalMax, redovi[k].criticalMax), 'vlaznost zemljista'));

                                                                                        break;
                                                                                    case 'temperature':
                                                                                        session.assert(new Merenje(idp, fuzzylogic.trapezoid(prosek, redovi[k].criticalMin, redovi[k].optimalMin, redovi[k].optimalMax, redovi[k].criticalMax), 'temperatura'));

                                                                                        break;
                                                                                    case 'C':
                                                                                        session.assert(new Merenje(idp, fuzzylogic.trapezoid(prosek, redovi[k].criticalMin, redovi[k].optimalMin, redovi[k].optimalMax, redovi[k].criticalMax), 'C'));

                                                                                        break;
                                                                                    case 'Na':
                                                                                        session.assert(new Merenje(idp, fuzzylogic.trapezoid(prosek, redovi[k].criticalMin, redovi[k].optimalMin, redovi[k].optimalMax, redovi[k].criticalMax), 'Na'));

                                                                                        break;
                                                                                    case 'N':
                                                                                        session.assert(new Merenje(idp, fuzzylogic.trapezoid(prosek, redovi[k].criticalMin, redovi[k].optimalMin, redovi[k].optimalMax, redovi[k].criticalMax), 'N'));

                                                                                        break;
                                                                                    case 'O':
                                                                                        session.assert(new Merenje(idp, fuzzylogic.trapezoid(prosek, redovi[k].criticalMin, redovi[k].optimalMin, redovi[k].optimalMax, redovi[k].criticalMax), 'O'));

                                                                                        break;
                                                                                    case 'H':
                                                                                        session.assert(new Merenje(idp, fuzzylogic.trapezoid(prosek, redovi[k].criticalMin, redovi[k].optimalMin, redovi[k].optimalMax, redovi[k].criticalMax), 'H'));

                                                                                        break;
                                                                                    case 'S':
                                                                                        session.assert(new Merenje(idp, fuzzylogic.trapezoid(prosek, redovi[k].criticalMin, redovi[k].optimalMin, redovi[k].optimalMax, redovi[k].criticalMax), 'S'));

                                                                                        break;
                                                                                    case 'Pi':
                                                                                        session.assert(new Merenje(idp, fuzzylogic.trapezoid(prosek, redovi[k].criticalMin, redovi[k].optimalMin, redovi[k].optimalMax, redovi[k].criticalMax), 'Pi'));

                                                                                        break;
                                                                                    case 'Si':
                                                                                        session.assert(new Merenje(idp, fuzzylogic.trapezoid(prosek, redovi[k].criticalMin, redovi[k].optimalMin, redovi[k].optimalMax, redovi[k].criticalMax), 'Si'));

                                                                                        break;
                                                                                    case 'Cl':
                                                                                        session.assert(new Merenje(idp, fuzzylogic.trapezoid(prosek, redovi[k].criticalMin, redovi[k].optimalMin, redovi[k].optimalMax, redovi[k].criticalMax), 'Cl'));

                                                                                        break;
                                                                                    case 'Mg':
                                                                                        session.assert(new Merenje(idp, fuzzylogic.trapezoid(prosek, redovi[k].criticalMin, redovi[k].optimalMin, redovi[k].optimalMax, redovi[k].criticalMax), 'Mg'));

                                                                                        break;
                                                                                    case 'Al':
                                                                                        session.assert(new Merenje(idp, fuzzylogic.trapezoid(prosek, redovi[k].criticalMin, redovi[k].optimalMin, redovi[k].optimalMax, redovi[k].criticalMax), 'Al'));

                                                                                        break;
                                                                                    case 'Fe':
                                                                                        session.assert(new Merenje(idp, fuzzylogic.trapezoid(prosek, redovi[k].criticalMin, redovi[k].optimalMin, redovi[k].optimalMax, redovi[k].criticalMax), 'Fe'));

                                                                                        break;
                                                                                    case 'Mn':
                                                                                        session.assert(new Merenje(idp, fuzzylogic.trapezoid(prosek, redovi[k].criticalMin, redovi[k].optimalMin, redovi[k].optimalMax, redovi[k].criticalMax), 'Mn'));

                                                                                        break;

                                                                                    default:
                                                                                        break;
                                                                                }
                                                                            }
                                                                            //console.log("!");
                                                                            //console.log(session.getFacts());
                                                                            session.match().then(function () {
                                                                                var niz = session.getFacts();


                                                                                for (var ii = 0; ii < niz.length; ii++) {
                                                                                    if (niz[ii] instanceof Obavestenje) {
                                                                                        console.log(niz[ii]);

                                                                                        connection.query("insert into system_notifications(idPlant, description,severity) VALUES (" + niz[ii].idPlant + ", '" + niz[ii].description + "' , " + niz[ii].severity + ")", function (err, rez) {
                                                                                            if (err) {

                                                                                                console.log(err);
                                                                                                connection2.release();
                                                                                                connection.release();

                                                                                                return;

                                                                                            }
                                                                                        });
                                                                                    }
                                                                                }
                                                                                session.dispose();
                                                                            });







                                                                        }


                                                                    });

                                                                }


                                                            });

                                                        });


                                                    });






                                                }




                                            });


                                        });
                                    });
                                }
                            })
                    })(i);

                }

                connection2.release();
                connection.release();
                connection2.on('error', function (err) {
                    console.log(err);
                    return;
                });
            });



        });
        connection.on('error', function (err) {
            console.log(err);
            return;
        });
    });
}
var pokupiPodatkeZemljiste = function (idPlant, connection) {



}
var pokupiPodatkeVlaznost = function (idPlant, connection) {



}






module.exports = {
    ocitajVrednosti: ocitajVrednosti,
    pokupiPodatkeZemljiste: pokupiPodatkeZemljiste,
    pokupiPodatkeVlaznost: pokupiPodatkeVlaznost
}
