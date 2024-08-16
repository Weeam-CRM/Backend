const mongoose = require('mongoose');


const adminApproval = new mongoose.Schema({
    leadName: {
        type: String
    },
    leadId: {
        type: String
    },
    agentApproval: {
        type: String
    },
    agentId: {
        type: String
    },
    managerApproval: {
        type: String
    },
    managerId: {
        type: String
    },
})

module.exports = mongoose.model("AdminApproval",adminApproval)