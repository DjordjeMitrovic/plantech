
var bodyParser = require('body-parser');

const express = require('express');
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

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
    database: 'highfive',
    debug: false
});
*/

router.get("/userIsOwner", function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        if (sess.LoggedUser == undefined) {
            console.log("greska u sesiji, ponovo se logujte");
            return;
        }
        connection.query("select * from owner where IdUser = " + sess.LoggedUser.id, function (err, rows) {
            connection.release();
            if (rows.length != 0) res.json({ "owner": true });
            else res.json({ "owner": false });
        });


    });
});

router.get("/dozvoleKodVlasnika", function (req, res, next) {
    var sess = req.session;
    test = {};
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        connection.query("select uc.idWorker,uc.idOwner, r.permission from user u join user_connect uc on u.id = uc.idWorker join role r on uc.idRole = r.id where uc.idWorker = " + sess.LoggedUser.id, function (err, rows) {
            connection.release();
            var dozvole = [];
            if (rows.length != 0) {
                test.success = true;
                test.guest = false;
                for (var i = 0; i < rows.length; i++) {
                    var dozvola = {};
                    dozvola.vlasnik = rows[i].idOwner;
                    dozvola.radnik = rows[i].idWorker;
                    var vrednosti = {};
                    var broj = Number(rows[i].permission);
                    var max = 32;

                    var dozvolebin = "";
                    while (max > 0) {
                        if ((broj & max) == 0) dozvolebin += "0";
                        else dozvolebin += "1";
                        max = max >> 1;

                    }

                    vrednosti.gledanjePlantaza = dozvolebin[0] == 0 || dozvolebin[0] == undefined ? false : true;
                    vrednosti.plantCRUD = dozvolebin[1] == 0 || dozvolebin[1] == undefined ? false : true;
                    vrednosti.tipDodavanje = dozvolebin[2] == 0 || dozvolebin[2] == undefined ? false : true;
                    vrednosti.radnikDodajBrisi = dozvolebin[3] == 0 || dozvolebin[3] == undefined ? false : true;
                    vrednosti.radnikAzuriraj = dozvolebin[4] == 0 || dozvolebin[4] == undefined ? false : true;
                    vrednosti.statistikaPrikaz = dozvolebin[5] == 0 || dozvolebin[5] == undefined ? false : true;
                    dozvola.vrednosti = vrednosti;
                    dozvole.push(dozvola);

                }
                test.dozvole = dozvole;

            }
            else {
                test.success = false;
                test.guest = true;

            }
            res.json(test);
        });


    });
});
router.get('/permisions', function (req, res, next) {
    var sess = req.session;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }


        test = {};
        test.guest = false;
        var user = sess.LoggedUser;
        if (user == undefined) {
            console.log("greska u sesiji, ponovo se logujte");
            return;
        }
        connection.query(`
                    select * from(
                        select uc.idWorker as 'iduser' , pp.idPlant as 'idplant', r.permission as 'perm' 
                        from owner_parcel op join user u on u.id = op.idOwner join plant_parcel pp on op.idParcel = pp.idParcel
                        join user_connect uc on uc.idOwner=u.id join role r on uc.idRole = r.id
                        where uc.idWorker = `+ user.id +
            ` UNION
                        select u.id as 'iduser', pp.idPlant as 'idplant', 63 as 'perm' 
                        from owner_parcel op join user u on u.id = op.idOwner join plant_parcel pp on op.idParcel = pp.idParcel
                        where u.id = `+ user.id +
            `
            
              UNION
                        select idUser as 'iduser', null as 'idplant', 63 as 'perm' from owner  where owner.idUser=`+ user.id + ` ` +
            `UNION
                        select uc.idWorker as 'iduser' , null as 'idplant', r.permission as 'perm' 
                        from 
                        user_connect uc join role r   on uc.idRole = r.id
                         where uc.idWorker= `+ user.id + `
            
            ) as t3`
            , function (err, rows) {
                connection.release();
                if (!err) {
                    if (rows.length == 0) {
                        test.success = false;
                        test.guest = true;
                    }
                    else {

                        test.success = true;
                        test.plantaze = [];
                        for (var i = 0; i < rows.length; i++) {
                            var plantaza = {};

                            plantaza.id = rows[i].idplant;
                            var dozvole = {};
                            var broj = Number(rows[i].perm);
                            var max = 32;

                            var dozvolebin = "";
                            console.log(broj);
                            while (max > 0) {
                                if ((broj & max) == 0) dozvolebin += "0";
                                else dozvolebin += "1";
                                max = max >> 1;

                            }
                            console.log(dozvolebin);
                            dozvole.gledanjePlantaza = dozvolebin[0] == 0 || dozvolebin[0] == undefined ? false : true;
                            dozvole.plantCRUD = dozvolebin[1] == 0 || dozvolebin[1] == undefined ? false : true;
                            dozvole.tipDodavanje = dozvolebin[2] == 0 || dozvolebin[2] == undefined ? false : true;
                            dozvole.radnikDodajBrisi = dozvolebin[3] == 0 || dozvolebin[3] == undefined ? false : true;
                            dozvole.radnikAzuriraj = dozvolebin[4] == 0 || dozvolebin[4] == undefined ? false : true;
                            dozvole.statistikaPrikaz = dozvolebin[5] == 0 || dozvolebin[5] == undefined ? false : true;
                            plantaza.dozvole = dozvole;
                            test.plantaze.push(plantaza);


                        }
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