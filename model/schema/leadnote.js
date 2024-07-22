const mongoose = require('mongoose');

const leadnote = new mongoose.Schema({
    leadID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Lead"
    }, 
    note: {
        type: String
    }, 
    addedBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('LeadNote', leadnote, 'LeadNote');