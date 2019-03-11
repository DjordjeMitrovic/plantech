const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const port = 5000;
var ODDataValues = require("./FakeSys/FakeSystem.js");
var dateFormat = require('dateformat');
const mysql = require('mysql');

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
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  database: 'highfive',
  debug: false
});
const pool1 = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  database: 'highfive_mu',
  debug: false
});

*/

require('events').EventEmitter.prototype._maxListeners = 1000;
var plant = require('./models/plantation');
var request = require('request');
var request = require('request');
var ekspertski = require('./routes/ekspertski.js');
var costumRules = require('./routes/costumeRules.js');
const schedule = require('node-schedule');
const mongoose = require('mongoose');
const session = require('express-session');
var cookieParser = require('cookie-parser');

app.use(cookieParser());
app.set('trust proxy', 1);

var proba = schedule.scheduleJob({ hour: [23], minute: [10] }, function () {

  ekspertski.ocitajVrednosti();
});
var proba1 = schedule.scheduleJob({ hour: [23], minute: [15] }, function () {
  costumRules.citajIzBaze();
});



var brisanjeStarih = schedule.scheduleJob("0 1 * * *", function () {
  pool1.getConnection(function (err, connection) {
    if (err) {

      console.log(err);
      return;
    }


    connection.query("delete from measuring where DATEDIFF('" + dateFormat(new Date(), "yyyy-mm-dd") + "',DATE_FORMAT(measuring.date,  '%Y-%m-%d' ))>30", function (err, rows) {
      connection.release();
      if (err) {
        console.log(err);
        return;
      }

    });
    connection.on('error', function (err) {
      console.log(err);
      return;
    });
  });

});
var unosNovihPodataka = schedule.scheduleJob({ hour: [6, 11, 14, 17, 20], minute: [0] }, function () {
  console.log('Crone pokrenut');
  var fake = new ODDataValues();


  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      return;

    }

    connection.query(`SELECT distinct idPlant, m.attribute FROM plant_measurer pm join measurer m on pm.idMeasurer = m.id `, function (err, rows) {
      connection.release();
      if (err) {
        console.log(err);
        return;
      }
      pool1.getConnection(function (err, connection2) {
        if (err) {
          console.log(err);
          return;
        }
        connection2.on('error', function (err) {
          console.log("greska u cronu");
          return;
        });
        for (var i = 0; i < rows.length; i++) {

          (function (cntr) {

            var merenje = rows[cntr].attribute.split("-");
            var merenja = [];
            merenje.forEach(function (entry) {
              merenja.push(entry.split("~")[0]);
            });
            console.log(merenja);

            var data = fake.getDataValue(merenja);
            var time = fake.getDateTimeUTC();
            var row = {};
            row.date = time;
            row.idPlant = rows[cntr].idPlant;
            plant.find({
              plantationID: rows[cntr].idPlant
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
                console.log(cntr);
                console.log(rows[cntr].idPlant);
                // console.log(body);
                temperatura = body.main.temp;
                var merenje = {
                  idPlant: rows[cntr].idPlant,
                  value: temperatura,
                  date: dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")
                }
                //console.log(merenje);
                connection2.query("insert into temperatura SET ?", merenje, function (err, rows) {
                  if (err) {
                    console.log(err);
                    connection2.release();
                    return;
                  }
                  connection2.query("insert into measuring SET ?", row, function (err, rowsss) {
                    if (err) {
                      console.log(err);
                      connection2.release();
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
                        return;
                      }
                    });



                  });
                });
              });
            });
          })(i);
        }

        connection2.release();
      });
    });
    connection.on('error', function (err) {
      console.log("greska u cronu");
      return;
    });

  });
});







var brisanjePoruka = schedule.scheduleJob("0 2 * * *", function () {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      return;
    }


    connection.query("delete from messages where deletedBySender = 1 and deletedByReceiver = 1", function (err, rows) {
      connection.release();
      if (err) {
        console.log(err);
        return;
      }

    });
    connection.on('error', function (err) {
      console.log(err);
      return;
    });
  });

});
var upisStatistike = schedule.scheduleJob("0 23 * * *", function () {
  var prosek;
  var prosekZemljista = [];
  var test = {};
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

      connection.query(`select idPlant from plant_measurer `, function (err, rows) {
        if (err) {
          connection.release();
          connection2.release();
          console.log(err);
          return;
        }
        for (let i = 0; i < rows.length; i++) {
          (function (cntr) {
            var idp = rows[cntr].idPlant;

            connection2.query("select measuring.id,measurment,DATE_FORMAT(date,'%d-%m-%Y') as 'date' from measuring join measuring_detail on measuring.id=measuring_detail.idMeasure where measuring.idPlant=" + idp + " order by measuring.date desc, measuring.id", function (err, rows) {
              if (err) {
                connection.release();
                connection2.release();
                console.log(err);
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
                connection2.query("select * from temperatura where idPlant = " + idp + ' ORDER BY DATE DESC', function (err, rows) {
                  if (err) {
                    connection.release();
                    connection2.release();
                    console.log(err);
                    return;
                  }
                  if (!err) {
                    //console.log(rows);
                    var suma = 0;
                    for (var j = 0; j < 5 && j < rows.length; j++) { suma += rows[j].value; }
                    prosek = suma / 5; //prosek temperature
                    prosekZemljista = [];



                    var niz = zemljisteVlaznost.data;
                    for (var j = 0; j < niz.length; j++) {
                      prosekZemljista[niz[j].label] = 0;

                      for (k = 0; k < niz[j].data.length; k++) {

                        prosekZemljista[niz[j].label] += niz[j].data[k];
                      }

                      prosekZemljista[niz[j].label] /= niz[j].data.length;




                    }
                    console.log(idp);
                    var rez = {
                      temperature: prosek,
                      moisture: prosekZemljista['Vlaznost'],
                      C: prosekZemljista['C'],
                      Na: prosekZemljista['Na'],
                      N: prosekZemljista['N'],
                      O: prosekZemljista['O'],
                      H: prosekZemljista['H'],
                      S: prosekZemljista['S'],
                      Pi: prosekZemljista['Pi'],
                      Si: prosekZemljista['Si'],
                      Cl: prosekZemljista['Cl'],
                      Mg: prosekZemljista['Mg'],
                      Al: prosekZemljista['Al'],
                      Fe: prosekZemljista['Fe'],
                      Mn: prosekZemljista['Mn'],


                    }
                    var string = JSON.stringify(rez);
                    console.log(JSON.stringify(rez));
                    connection2.query("insert into average_measuring(idPlant, measuring, date) VALUES (" + idp + ", '" + string + "',NOW() ) ", function (err, rows) {
                      if (err) {
                        connection.release();
                        connection2.release();
                        console.log(err);
                        return;
                      }
                    });
                  }
                });

              }

            });

          })(i);

        }

        connection.release();
        connection2.release();


      });
    });

  });
});

var unosBuducih = schedule.scheduleJob("5 23 * * *", function () {
  console.log("radis li ti!?");
  pom = [];
  var novNiz = {};
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

      connection.query(`select idPlant from plant_measurer `, function (err, rows) {
        if (err) {
          connection.release();
          connection2.release();
          console.log(err);
          return;
        }
        for (let i = 0; i < rows.length; i++) {
          (function (cntr) {
            var idp = rows[cntr].idPlant;
            pom = [];
            connection2.query("SELECT * FROM average_measuring WHERE idPlant=" + idp + " order by date desc LIMIT 5", function (err, rows) {
              if (err) {
                connection.release();
                connection2.release();
                console.log(err);
                return;
              }
              var nekiNiz = [];
              for (var jj = 0; jj < rows.length; jj++) {
                (function (j) {
                  pom = JSON.parse(rows[j].measuring);
                  for (var key in pom) {
                    if (nekiNiz[key] == undefined) nekiNiz[key] = 0
                    else nekiNiz[key] += pom[key];
                  }

                })(jj);
              }

              for (var key in pom) {
                var duzina;
                if (rows.length == 1) duzina = 1;
                else duzina = rows.length - 1;
                var rez = nekiNiz[key] / (duzina);
                console.log(nekiNiz[key] + " / " + duzina + " = " + rez);
                var pom1 = JSON.parse(rows[0].measuring);
                var kk = Math.abs(pom1[key] - Math.abs(rez - pom1[key]) / 2);
                if (isNaN(kk)) kk = rez;
                novNiz[key] = kk;


              }

              for (var p = 1; p <= 4; p++) {
                (function (pp) {
                  console.log('insert into average_measuring_future(date, measuring, idPlant) values(DATE_ADD(NOW(),INTERVAL " + pp + " DAY)," + JSON.stringify(novNiz) + ", " + idp + ")"');
                  connection2.query("insert into average_measuring_future(date, measuring, idPlant) values(DATE_ADD(NOW(),INTERVAL " + pp + " DAY),'" + JSON.stringify(novNiz) + "', " + idp + ")", function (err, rows) {

                    if (err) {
                      connection.release();
                      connection2.release();
                      console.log(err);
                      return;
                    }


                  });
                  for (var key in pom) {
                    var duzina;
                    if (rows.length == 1) duzina = 1;
                    else duzina = rows.length - 1;
                    var rez = nekiNiz[key] / (duzina);
                    console.log(nekiNiz[key] + " / " + rows.length + " = " + rez);
                    var pom1 = JSON.parse(rows[0].measuring);
                    var kk = Math.abs(pom1[key] - Math.abs(rez - pom1[key]) / 2);
                    if (isNaN(kk)) kk = rez;
                    novNiz[key] = kk - pp * rez / 100;


                  }
                })(p);
              }


            });

          })(i);

        }


        connection.release();
        connection2.release();


      });
    });

  });




});


mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost:27017/highfive');
mongoose.connect('mongodb://JovanSom:JovanSom@ds153400.mlab.com:53400/highfive');


var sess = {
  secret: 'keyboard cat',
  cookie: {},
  saveUninitialized: true,
  resave: true
}






app.use(session(sess))


app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'client')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const users = require('./routes/users');
const perms = require('./routes/permisions');
const stats = require('./routes/stats');
const sessions = require('./routes/sessions');
const plantation = require('./routes/plantation');
const types = require('./routes/types');
const messages = require('./routes/messages');
const uploads = require('./uploads/upload');
const roles = require('./routes/roles');
const markers = require('./routes/markers');
const finance = require('./routes/finance');
app.use('/messages', messages);
app.use('/types', types);
app.use("/permisions", perms);
app.use('/users', users);
app.use('/stats', stats);
app.use('/sessions', sessions);
app.use('/plantations', plantation);
app.use('/uploads', uploads);
app.use('/roles', roles);
app.use('/markers', markers);
app.use('/finance', finance);
app.listen(port, function () {
  console.log("Server is running on port " + port);
});
