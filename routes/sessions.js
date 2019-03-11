// Express

const express = require('express');
const router = express.Router();

router.get('/LogovaniKorisnik', function (req, res, next) {
    var sess = req.session;
    if (sess.LoggedUser) {
        res.json(sess.LoggedUser);
    }
    else {
        var test = {};
        test.success = false;
        res.json(test);
    }
});

router.get('/logout', function (req, res, next) {
    req.session.destroy();
    var test = {};
    test.success = true;
    res.json(test);

});


module.exports = router;