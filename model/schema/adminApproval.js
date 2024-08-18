const mongoose = require('mongoose');


const adminApproval = new mongoose.Schema({
    leadName: {
        type: String
    },
    leadId: {
        type: String
    },
    agentName: {
        type: String
    },
    agentId: {
        type: String
    },
    mangerName: {
        type: String
    },
    managerId: {
        type: String
    },
    approvalStatus:{
        type:String
    }
})

module.exports = mongoose.model("AdminApproval",adminApproval)