const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const sha1 = require('sha1');
var dateFormat = require('dateformat');
var ODDataValues = require("../FakeSys/FakeSystem.js");
/*
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '147.91.204.116',
  user: 'HighFive',
  password: 'admin admin',
  database: 'HighFive',
  debug: false
});

const poolRemote = mysql.createPool({
  connectionLimit: 10,
  host: '147.91.204.116',
  user: 'HighFive',
  password: 'admin admin',
  database: 'HighFive_mu',
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

//  var fake = new ODDataValues();
router.get('/stats', function (req, res, next) {
  var sess = req.session;
  pool.getConnection(function (err, connection) {
    if (err) {
      res.json({ "code": 100, "status": "Error in connection database" });
      return;
    }


    var user = sess.LoggedUser;


    if (user == undefined) {
      console.log("nema sesije logujte se opet");
      return;
    }

    test = {};


    connection.query("select (select count(*) from notifications where idWorker=" + user.id + ") as 'obavestenja', (select count(*) from plantation p join plant_parcel pp on p.id=pp.idPlant join owner_parcel op on pp.idParcel = op.idParcel where op.idOwner=" + user.id + ") as 'plantaze',(select count(*) from user_connect uc join role r on r.id=uc.idRole where uc.idOwner=" + user.id + " and  r.name!='ekspert') as 'radnici',(select count(*) from user_connect uc  join role r on r.id=uc.idRole where  uc.idOwner=" + user.id + " and  r.name='ekspert') as 'eksperti'", function (err, rows) {
      connection.release();
      if (!err) {
        test = rows[0];
        res.json(test);
      }
    });


    connection.on('error', function (err) {
      res.json({ "code": 100, "status": "Error in connection database" });
      return;
    });
  });

});
router.get('/current/:idPlant', function (req, res, next) {
  var idPlant = req.params.idPlant;
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      return;
    }
    connection.query(`SELECT distinct idPlant, m.attribute FROM plant_measurer pm join measurer m on pm.idMeasurer = m.id where idPlant =` + idPlant, function (err, rows) {
      connection.release();
      if (rows.length == 0) {
        res.json(false);
        return;
      }

      var merenje = rows[0].attribute.split("-");
      var merenja = [];
      merenje.forEach(function (entry) {
        merenja.push(entry.split("~")[0]);
      });

      var fake = new ODDataValues();

      var data = JSON.parse(fake.getDataValue(merenja));

      var test = {};
      test.labels = new Array();
      test.data = new Array();
      for (var k in data) {
        if (data.hasOwnProperty(k) && k.toLowerCase() != "vlaznost") {
          test.data.push(data[k]);

          test.labels.push(k);
        }
        else test.vlaznost = data[k];
      }

      res.json(test);
    });
  });
});

router.get('/ubaciTemp/:idPlant/:temp', function (req, res, next) {
  poolRemote.getConnection(function (err, connection) {
    if (err) {
      res.json({ "code": 100, "status": "Error in connection database" });
      return;
    }

    var merenje = {
      idPlant: req.params.idPlant,
      value: req.params.temp,
      date: dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")
    }
    connection.query("insert into temperatura SET ?", merenje, function (err, rows) {
      connection.release();
      if (err) {
        res.json(false);
      }
      else res.json(true);

    });

  });

});

router.get("/tempStat/:idPlant", function (req, res, next) {
  poolRemote.getConnection(function (err, connection) {
    if (err) {
      res.json({ "code": 100, "status": "Error in connection database" });
      return;
    }
    connection.query("select * from temperatura where idPlant = " + req.params.idPlant, function (err, rows) {
      connection.release();
      if (err) {
        res.json(false);
      }
      else res.json(rows);

    });

  });
});
router.get('/dajPlantNotif/:id', function (req, res) {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      return;
    }
    var sess = req.session;
    var idUser;
    if (sess.LoggedUser) {
      idUser = sess.LoggedUser.id;
    }
    else {
      return;
    }
    id = req.params.id;

    connection.query(`select * from (
select distinct sn.*,t.name as 'tip', st.name as 'podtip', pos.name as 'producer',p2.name as 'plantaza',DATE_FORMAT(sn.date, '%d.%m.%Y %T') as 'datum'
from 
user u join owner_parcel op on u.id=`+ idUser + `  and u.block=0 and u.id=op.idOwner join parcel p1 on op.idParcel=p1.id join plant_parcel pp on p1.id=pp.idParcel join plantation p2 on pp.idPlant=p2.id join plant_type pt on p2.id=pt.idPlant join type t on t.id=pt.idType join subtype st on pt.idSubType=st.id  join producerofseeds pos on pt.idProducer=pos.id
join system_notifications sn on sn.idPlant = p2.id where p2.id=`+ id + `

union
select distinct sn.*,t.name as 'tip', st.name as 'podtip', pos.name as 'producer',p2.name as 'plantaza', DATE_FORMAT(sn.date, '%d.%m.%Y %T') as 'datum' from user u join user_connect op on u.id=`+ idUser + ` and u.id=op.idWorker join owner_parcel op1 on op1.idOwner=op.idOwner  join  user u2 on op1.idOwner=u2.id and u2.block=0 join  parcel p1 on op1.idParcel=p1.id join plant_parcel pp on p1.id=pp.idParcel join plantation p2 on pp.idPlant=p2.id join plant_type pt on p2.id=pt.idPlant join type t on t.id=pt.idType join subtype st on pt.idSubType=st.id  join producerofseeds pos on pt.idProducer=pos.id join user u1 on op.idOwner=u1.id
join system_notifications sn on sn.idPlant = p2.id where p2.id=`+ id + `
    
   )t3
order by t3.date desc`, function (err, rows) {
        connection.release();
        if (err) {
          console.log(err);
          res.json(false);
        }
        else res.json(rows);

      });

  });
});




module.exports = router;
