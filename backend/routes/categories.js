const express = require('express');
const router = express.Router();

const {
    getBatch,
    insertOne
} = require('../core/categories')

router.get('/', getBatch);
router.post('/', insertOne);

module.exports = router;
