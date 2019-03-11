var mongoose = require('mongoose');


var plantationSchema = new mongoose.Schema({
    userID:{type: Number, required:true},
    plantationID:{type: Number, required:true},
    coordinates: Array,
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

plantationSchema.pre('save',function(next){
    now = new Date();
    this.updatedAt = now;
    if(!this.createdAt){
        this.createdAt = now;
    }
    next();
});


var Plantation = mongoose.model('Plantation',plantationSchema);
module.exports = Plantation; 