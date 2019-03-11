var mongoose = require('mongoose');
var plantation = require('../models/plantation');
var bodyParser = require('body-parser');
var express = require('express');
var app = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.get('/plantations', function(req, res) {
  console.log('getting all plantations');
  plantation.find({})
    .exec(function(err, plantations) {
      if(err) {
        res.send('error occured')
      } else {
        console.log(plantations);
        res.json(plantations);
      }
    });
});

app.get('/plantations/:userID', function(req, res) {
  console.log('getting all plantations from user');
  plantation.find({
    userID: req.params.userID
    })
    .exec(function(err, plantations) {
      if(err) {
        res.send('error occured')
      } else {
        console.log(plantations);
        res.json(plantations);
      }
    });
});

app.get('/getGeoData/:userID', function(req, res) {
  console.log('getting all plantations from user');
  plantation.find({
    userID: req.params.userID
    })
    .exec(function(err, plantations) {
      if(err) {
        res.send('error occured')
      } else {
        console.log(plantations[0].coordinates[0]);
        res.json(plantations[0].coordinates[0]);
      }
    });
});



app.post('/plantations', function(req, res) {
  plantation.create(req.body, function(err, plantation) {
    if(err) {
      res.send('error saving plantation');
    } else {
      console.log(plantation);
      res.send(plantation);
    }
  });
});

app.put('/plantations/:plantID', function(req, res) {
  plantation.findOneAndUpdate({
    plantationID: req.params.id
    },
    { $set: { 'coordinates' : req.body.coordinates }
  }, {upsert: true}, function(err, newPlant) {
    if (err) {
      res.send('error updating ');
    } else {
      console.log(newPlant);
      res.send(newPlant);
    }
  });
});

app.delete('/plantations/:plantID', function(req, res) {
  console.log(req.param.plantID);
  plantation.findOneAndRemove({
    plantationID: req.params.plantID
  }, function(err, plant) {
    if(err) {
      res.send('error removing')
    } else {
      console.log(plant);
      res.send({'test.success':true});
    }
  });
});

app.get('/save', function(req,res){
  var prvi = new plantation( {
    userID:4,
    plantationID:3,
   
      coordinates:[
        [[-12.04, -77.033],
       [-12.040, -77.039],
       [-12.050, -77.024],
      	[-12.04, -77.033]]
        ]
    

  })
  
prvi.save(function(err){
  if(err){
    console.log("greska pri cuvanju");
    return err;
  }else {
    console.log("sacuvan prvi");
  }
  
});

  

})


module.exports = app;