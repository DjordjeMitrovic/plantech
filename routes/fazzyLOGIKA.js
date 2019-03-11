/*var fuzzylogic = require("fuzzylogic");
var resTriangle = fuzzylogic.triangle(2.5, 0, 2, 4);
var resTriangle1 = fuzzylogic.triangle(1.5, 0, 1, 4);
var resTrapezoid = fuzzylogic.trapezoid(15, 0, 20, 30, 100);
var resTrapezoid1 = fuzzylogic.trapezoid(24.327, 0, 20, 24, 100);
console.log("alo: " + resTriangle);
console.log("alo: " + resTriangle1);
console.log("alo: " + resTrapezoid);
console.log("alo: " + resTrapezoid1);

var gaussian = function(mean, stdev) {
    var y2;
    var use_last = false;
    return function () {
        var y1;
        if (use_last) {
            y1 = y2;
            use_last = false;
        }
        else {
            var x1, x2, w;
            do {
                x1 = 2.0 * Math.random() - 1.0;
                x2 = 2.0 * Math.random() - 1.0;
                w = x1 * x1 + x2 * x2;
            } while (w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w)) / w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
        }

        var retval = mean + stdev * y1;
        if (retval > 0)
            return retval;
        return -retval;
    }
}
var pr = gaussian(5,0.5);
for (var i = 0; i < 10; i++) {
    console.log("raspodela " + pr());
}
*/

/*
 ---------------- test!! ---------
atribut1 = {
    "merenje": "vlaznost",
    "critMin": 0,
    "optMin": 20,
    "optMax": 30,
    "critMax": 70,
}
atribut2 = {
    "merenje": "temperatura",
    "critMin": -40,
    "optMin": 20,
    "optMax": 30,
    "critMax": 100,
}
atribut3 = {
    "merenje": "vlaznost",
    "critMin": 0,
    "optMin": 10,
    "optMax": 20,
    "critMax": 70,
}
atribut4 = {
    "merenje": "temperatura",
    "critMin": -40,
    "optMin": 30,
    "optMax": 40,
    "critMax": 100,
}
dan = [];
dani = [];
dan.push(atribut1);
dan.push(atribut2);
dan1 = [];
dan1.push(atribut3);
dan1.push(atribut4);

dani.push(dan);
dani.push(dan1);
console.log(JSON.stringify(dani));

*/


var unosBuducih = schedule.scheduleJob("23 18 * * *", function () {
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

                for (let i = 0; i < rows.length; i++) {
                    (function (cntr) {
                        var idp = rows[cntr].idPlant;

                        connection2.query("SELECT * FROM average_measuring WHERE idPlant=" + idp + " order by date desc LIMIT 5", function (err, rows) {
                            var nekiNiz = [];
                            for (var jj = rows.length - 1; jj >= 0; jj--) {
                                (function (j) {
                                    var pom = JSON.parse(rows[j].measuring);
                                    for (var key in pom) {
                                        if (nekiNiz[key] == undefined) nekiNiz[key] = 0
                                        else nekiNiz[key] += pom[key];
                                    }

                                })(jj);
                            }

                            for (var key in pom) {
                                console.log(nekiNiz[key]);
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