var mongoose = require('mongoose');
var plantation = require('../models/plantation');
var bodyParser = require('body-parser');
var express = require('express');
var app = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/plantations', function (req, res) {
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

app.get('/plantations/:userID', function (req, res) {
  console.log('getting all plantations from user');
  plantation.find({
    userID: req.params.userID
  })
    .exec(function (err, plantations) {
      if (err) {
        res.send('error occured')
      } else {
        console.log(plantations);
        res.json(plantations);
      }
    });
});


app.get('/vratiVise/:niz', function (req, res) {
  var arr = req.params.plantationID.split(',');
  var zaNazad = [];
  for (var i = 0; i < arr.length; i++) {
    zaNazad.push();
  }
});

app.get('/userPlantation/:plantationID', function (req, res) {

  plantation.find({
    plantationID: req.params.plantationID
  })
    .exec(function (err, plantations) {
      if (err) {
        res.send('error occured')
      } else {
        console.log('pozvbani smo aloo: ' + JSON.stringify(plantations));
        res.json(plantations);
      }
    });

});

app.get('/getGeoData/:plantID', function (req, res) {
  console.log(req.params.plantID);
  plantation.find({
    plantationID: req.params.plantID
  })
    .exec(function (err, plantations) {
      if (err) {
        res.send('error occured')
      } else {
        console.log(plantations);
        res.json(plantations[0].coordinates[0]);
      }
    });
});



app.post('/plantations', function (req, res) {
  plantation.create(req.body, function (err, plantation) {
    if (err) {
      res.send('error saving plantation');
    } else {
      console.log(plantation);
      res.send(plantation);
    }
  });
});

app.get('/updatePlantations/:plantID/:coordinates', function (req, res) {
  var poligoni = JSON.parse(req.params.coordinates);

        console.log("NizPOligona u ADD -->  " + JSON.stringify(req.params.poligoni));
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
  console.log("usao u find one and update");
  plantation.findOneAndUpdate({
    plantationID: req.params.plantID
  },
    {
      $set: { 'coordinates': poly }
    }, { upsert: true }, function (err, newPlant) {
      if (err) {
        res.send('error updating ');
      } else {
        console.log(newPlant);
        res.send(newPlant);
      }
    });
});

app.delete('/plantations/:plantID', function (req, res) {
  console.log(req.param.plantID);
  plantation.findOneAndRemove({
    plantationID: req.params.plantID
  }, function (err, plant) {
    if (err) {
      res.send('error removing')
    } else {
      console.log(plant);
      res.send({ 'test.success': true });
    }
  });
});

app.get('/save', function (req, res) {
  var prvi = new plantation({
    userID: 4,
    plantationID: 3,

    coordinates: [
      [[-12.04, -77.033],
      [-12.040, -77.039],
      [-12.050, -77.024],
      [-12.04, -77.033]]
    ]


  })

  prvi.save(function (err) {
    if (err) {
      console.log("greska pri cuvanju");
      return err;
    } else {
      console.log("sacuvan prvi");
    }

  });



})


module.exports = app;