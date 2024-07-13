const mongoose = require('mongoose');


const leadCycleSchema = new mongoose.Schema({

    leadID: {
        type: mongoose.Schema.ObjectId, 
        ref: 'Lead'    
    }, 

    type: {
        type: String,
    }, 

    updatedData: {
        type: String, 
    }, 

    updatedBy: {
        type: mongoose.Schema.ObjectId, 
        ref: 'User'
    }

}, {
    timestamps: true
});


const LeadCycle = mongoose.model('LeadCycle', leadCycleSchema, 'LeadCycle');
module.exports = { LeadCycle};
