const express = require('express');
const adminApproval = require('./adminApproval');
const auth = require('../../middelwares/auth');

const router = express.Router();

router.post('/add', adminApproval.add);


module.exports = router