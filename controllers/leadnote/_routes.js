const express = require('express');
const leadnote = require('./leadnote');
const auth = require('../../middelwares/auth');

const router = express.Router();

router.get('/:lid', auth, leadnote.index)
router.post('/', auth, leadnote.add)

module.exports = router