const path = require('path');
const express = require('express');
const router = require('express').Router();
router.use(express.static('../public'));

router.get('/:pageNum', async function (req, res) {
    res.sendFile(path.join(__dirname + `/../public/html/page${req.params.pageNum}.html`));
});

module.exports = router;