const express = require('express');
const router = express.Router();

const {
    getBatch,
    getOne,
    insertOne,
    updateOne,
    deleteOne
} = require("../core/transaction.js")

router.get('/', getBatch);
router.get('/:id', getOne);
router.post('/', insertOne);
router.put('/:id', updateOne);
router.delete('/:id', deleteOne);

module.exports = router;