const express = require('express');
const lead = require('./lead');
const auth = require('../../middelwares/auth');

const router = express.Router();

router.get('/', auth, lead.index)
router.get('/search', auth, lead.search)
router.get('/advanced-search', auth, lead.advancedSearch)
router.get('/cycle/:lid', auth, lead.history)
router.post('/add', auth, lead.add)
router.post('/add/campaign', lead.addFromCampaign)
router.post('/addMany', auth, lead.addMany)
router.get('/view/:id', auth, lead.view)
router.put('/edit/:id', auth, lead.edit)
router.put('/changeStatus/:id', auth, lead.changeStatus)
router.delete('/delete/:id', auth, lead.deleteData)
router.post('/deleteMany', auth, lead.deleteMany)
module.exports = router