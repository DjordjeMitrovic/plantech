const express = require('express');
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

router.get('/stats', function (req, res, next) {
  var sess = req.session;
  pool.getConnection(function (err, connection) {
    if (err) {
      res.json({ "code": 100, "status": "Error in connection database" });
      return;
    }


    var user = sess.LoggedUser;




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


module.exports = router;
