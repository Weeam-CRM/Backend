const express = require('express');
const adminApproval = require('./adminApproval');
const auth = require('../../middelwares/auth');

const router = express.Router();

router.post('/add', adminApproval.add);
router.get('/get',auth, adminApproval.get);
router.put('/update',auth, adminApproval.responseFromAdmin);


module.exports = router  