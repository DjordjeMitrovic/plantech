const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const port = 2002;
const mongoose = require('mongoose');
const session = require('express-session');
var cookieParser = require('cookie-parser');
//var mysqlevent = require('./routes/mysqlEvents');
app.use(cookieParser());
app.set('trust proxy', 1);

//mongoose.connect('mongodb://147.91.204.116:2001/HighFive')

var sess = {
  secret: 'keyboard cat',
  cookie: {},
  saveUninitialized: true,
  resave: true
}



app.use(session(sess))


app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
const users = require('./routes/users');
const stats = require('./routes/stats');
const sessions = require('./routes/sessions');
const plantation = require('./routes/plantation');
const messages = require('./routes/messages');
app.use('/messages',messages);
app.use('/users', users);
app.use('/stats',stats);
app.use('/sessions',sessions);
app.use('/plantations',plantation);
app.listen(port, function(){
    console.log("Server is running on port " + port);
});
