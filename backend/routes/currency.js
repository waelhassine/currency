const express = require("express");
const router = express.Router();
const CurrencyController = require("../controllers/CurrencyController");

router.post("/convert", CurrencyController.convertCurrency);

module.exports = router;
