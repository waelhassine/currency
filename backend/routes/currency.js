const express = require("express");
const router = express.Router();
const CurrencyController = require("../controllers/CurrencyController");

router.get("/convert", CurrencyController.convertCurrency);

module.exports = router;
