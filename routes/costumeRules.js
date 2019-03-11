var mongoose = require('mongoose');
var plantation = require('../models/plantation');
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');
var request = require('request');
const express = require('express');
var app = express.Router();
var fuzzylogic = require("fuzzylogic");
var ODDataValues = require("../FakeSys/FakeSystem.js");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const router = express.Router();
const mysql = require('mysql');
const sha1 = require('sha1');
var fuzzylogic = require("fuzzylogic");

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
var nools = require("nools");

var GraniceZaMerenje = function (idPlant, idDana, nazivMerenja, critMin, critMax, optMin, optMax, ruleId) {
    this.idPlant = idPlant;
    this.idDana = idDana;
    this.nazivMerenja = nazivMerenja;
    this.critMin = critMin;
    this.critMax = critMax;
    this.optMax = optMax;
    this.optMin = optMin;
    this.ruleId = ruleId;
}
var Merenje = function (idPlant, nazivMerenja, vrednost, idDana) {
    this.idPlant = idPlant;
    this.idDana = idDana;
    this.nazivMerenja = nazivMerenja;
    this.vrednost = vrednost
}

var Dan = function (redniBroj, brMerenja, ispunjeno, ruleId, idPlant) {
    this.ruleId = ruleId;
    this.redniBroj = redniBroj;
    this.ispunjeno = ispunjeno;
    this.brMerenja = brMerenja;
    this.idPlant = idPlant;
}
var Pravilo = function (brojDana, ispunjeno, consequence, solution, ruleId, idPlant) {
    this.ispunjeno = ispunjeno;
    this.brojDana = brojDana;
    this.consequence = consequence;
    this.solution = solution;
    this.ruleId = ruleId;
    this.idPlant = idPlant;
}

var Obavestenje = function (idPlant, ruleId, consequence, solution) {
    this.idPlant = idPlant;
    this.ruleId = ruleId;
    this.consequence = consequence;
    this.solution = solution;
}//

// &&  g.optMin < m.vrednost && g.optMax > m.vrednost
// DODAJ FAZI LOGIKU DODAJ FAZILOGIKU DODAJ FAZI LOGIKU DODAJ FAZILOGIKU DODAJ FAZI LOGIKU DODAJ FAZILOGIKUDODAJ FAZI LOGIKU DODAJ FAZILOGIKUDODAJ FAZI LOGIKU DODAJ FAZILOGIKUDODAJ FAZI LOGIKU DODAJ FAZILOGIKU
var flow = nools.flow("costumeRules", function (flow) {
    flow.rule("poklapaSE", [
        [Merenje, "m"],
        [GraniceZaMerenje, "g", "g.nazivMerenja == m.nazivMerenja && g.idPlant == m.idPlant && g.idDana == m.idDana &&  g.optMin < m.vrednost && g.optMax > m.vrednost "],
        [Dan, "d", "d.idPlant == m.idPlant && d.redniBroj == m.idDana && d.ruleId == g.ruleId"]
    ], function (facts) {
        facts.d.ispunjeno = facts.d.ispunjeno + 1;
        this.modify(facts.d);
        this.retract(facts.m);
        this.retract(facts.g);
        //   console.log("ALI!");
        // console.log(facts.d);
    });

    flow.rule("povecajIspunjenDan", [
        [Dan, "d", "d.ispunjeno == d.brMerenja"],
        [Pravilo, "p", "p.ruleId==d.ruleId && p.idPlant==d.idPlant"]
    ], function (facts) {
        facts.p.ispunjeno = facts.p.ispunjeno + 1;
        this.modify(facts.p);
        this.retract(facts.d);
        //console.log(facts.p);
    });

    flow.rule("ispunjenoPravilo", [
        [Pravilo, "p", "p.ispunjeno == p.brojDana"]
    ], function (facts) {
        //console.log("eh!");
        //console.log(facts.p);
        var obav = new Obavestenje(
            facts.p.idPlant,
            facts.p.ruleId,
            facts.p.consequence,
            facts.p.solution
        );
        this.assert(obav);
    });
});

var ukupnoDana = 5; // najvse dana za pravilo!
var danProsli = [];
var danBuduci = [];

var citajIzBaze = function () {
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
            connection.query(`SELECT r.id as ruleId,r.name as ruleName,r.days as days,r.idSubType as idSubType, r.consequence as consequence,r.solution as solution,r.datePicked as datePicked,pt.* FROM rules r JOIN plant_type pt on r.idSubType = pt.idSubType`, function (err, rows) {
                if (err) {
                    console.log(err);
                    connection.release();
                    return;
                }
                var session = flow.getSession();
                // console.log("broj: " + rows.length);
                for (var i = 0; i < rows.length; i++) {
                    (function (cntr) {
                        var pom = JSON.parse(rows[cntr].days);
                        var izabranDan = rows[cntr].datePicked;
                        // if (izabranDan == 1) izabranDan = 2;
                        var idTipa = rows[cntr].idSubType;
                        var idPlantaze = rows[cntr].idPlant;

                        session.assert(new Pravilo(ukupnoDana, 0, rows[cntr].consequence, rows[cntr].solution, rows[cntr].ruleId, rows[cntr].idPlant));

                        connection2.query("SELECT * FROM average_measuring WHERE idPlant=" + idPlantaze + " order by date desc LIMIT 5", function (err, rows1) {
                            if (err) {
                                console.log(err);
                                connection.release();
                                return;
                            }
                            //pom[cntr].forEach(function (element) {
                            //      session.assert(new GraniceZaMerenje(idPlantaze, c, element.merenje, element.critMin, element.critMax, element.optMin, element.optMax, rows[cntr].ruleId), element.merenje);
                            //  });

                            if (rows1.length != 0) {
                                // console.log("broj redova " + cntr + ": " + rows1.length + " idPlant: " + idPlantaze);
                                for (j = 0; j < izabranDan; j++) {
                                    (function (c) {
                                        session.assert(new Dan(c, pom[c].length, 0, rows[cntr].ruleId, idPlantaze));

                                        for (var kk in pom[c]) {
                                            (function (kkk) {
                                                session.assert(new GraniceZaMerenje(idPlantaze, c, pom[c][kkk].merenje, pom[c][kkk].critMin, pom[c][kkk].critMax, pom[c][kkk].optMin, pom[c][kkk].optMax, rows[cntr].ruleId), pom[c][kkk].merenje);
                                            })(kk);
                                        }
                                        if (rows1[izabranDan - 1 - c] != undefined) {
                                            var measuring = JSON.parse(rows1[izabranDan - 1 - c].measuring);

                                            //  console.log("??!");
                                            for (var key in measuring) {
                                                session.assert(new Merenje(idPlantaze, key, measuring[key], c), measuring[key]);
                                            }
                                        }

                                    })(j);
                                }
                                connection2.query("SELECT * FROM average_measuring_future WHERE idPlant= " + idPlantaze + " order by date asc LIMIT 5", function (err, rows2) {
                                    if (err) {
                                        console.log(err);
                                        connection.release();
                                        return;
                                    }
                                    // console.log("redovi " + rows2.length);measuring
                                    // console.log("broj redova dva " + cntr + ": " + rows2.length + " idPlant: " + idPlantaze);
                                    if (rows2.length != 0) {
                                        for (k = izabranDan; k < ukupnoDana; k++) {
                                            (function (ctl) {
                                                for (var kk in pom[ctl]) {
                                                    (function (kkk) {
                                                        session.assert(new GraniceZaMerenje(idPlantaze, ctl, pom[ctl][kkk].merenje, pom[ctl][kkk].critMin, pom[ctl][kkk].critMax, pom[ctl][kkk].optMin, pom[ctl][kkk].optMax, rows[cntr].ruleId), pom[ctl][kkk].merenje);
                                                    })(kk);
                                                }
                                                //  console.log("buducnost!");
                                                session.assert(new Dan(ctl, pom[ctl].length, 0, rows[cntr].ruleId, idPlantaze));
                                                //  console.log("tu lezi zeka: " + (ctl - izabranDan));
                                                if (rows2[ctl - izabranDan] != undefined) {
                                                    var measuring1 = JSON.parse(rows2[ctl - izabranDan].measuring);
                                                    //  console.log("tuu!");
                                                    for (var key1 in measuring1) {
                                                        session.assert(new Merenje(idPlantaze, key1, measuring1[key1], ctl), measuring1[key1]);

                                                    }
                                                }
                                            })(k);
                                        }

                                        // console.log(session.getFacts());
                                        /////////////////////////////////////////////////////////////////
                                        session.match().then(function () {
                                            var niz = session.getFacts();
                                            // console.log("dotle!?");
                                            //console.log("radi match!");
                                            for (var ii = 0; ii < niz.length; ii++) {
                                                // console.log(niz[ii]);
                                                if (niz[ii] instanceof Obavestenje) {

                                                    // console.log(niz[ii]);
                                                    var tekst = "DESILO SE: " + niz[ii].consequence + " \n PREDUZMI: " + niz[ii].solution;
                                                    connection.query("insert into system_notifications(idPlant, description,severity) VALUES (" + niz[ii].idPlant + ", '" + tekst + "' , 1)", function (err, rez) {
                                                        if (err) {
                                                            console.log(err);
                                                            return;
                                                        }
                                                    });
                                                    //session.retract(niz[ii]);
                                                }
                                            }
                                            session.dispose();
                                        });

                                    }
                                });
                            }
                        });
                    })(i);
                }

                connection2.release();
                connection2.on('error', function (err) {
                    console.log("greska u cronu");
                    return;
                });
            });

            connection.release();
            connection.on('error', function (err) {
                console.log("greska u cronu");
                return;
            });
        });
    });
}

//citajIzBaze();




/*
var pokupiIstoriju = function (id, n) {
    pool1.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            return;
        }
        connection.query("SELECT * FROM average_measuring WHERE idPlant=" + id + " order by date desc LIMIT 5", function (err, rows) {
            if (!err) {
                for (var i = n - 1; i >= 0; i--) {
                    danProsli.push(rows[i]);
                }
            } else {
                console.log("greska1");
            }
        });
        connection.release();
        connection.on('error', function (err) {
            console.log("greska u cronu");
            return;
        });
    });
}

var pokupiBuducnost = function (id) {
    pool1.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            return;
        }
        connection.query("SELECT * FROM average_measuring_future WHERE idPlant=" + id + " order by date asc LIMIT 5", function (err, rows) {
            if (!err) {
                for (var i = 0; i < rows.length; i++) {
                    danBuduci.push(rows[i]);
                }
            } else {
                console.log(err);
            }
        });
        connection.release();
        connection.on('error', function (err) {
            console.log("greska u cronu");
            return;
        });
    });
}*/
var vrsiPreporukuBiljke = function () {
    // ovde vrsi preporuke!!
}

module.exports = {
    citajIzBaze: citajIzBaze

}
