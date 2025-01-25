const currencyService = require("../services/CurrencyService");

exports.convertCurrency = async (req, res) => {
  const { from, to, amount } = req.query;

  try {
    const result = await currencyService.convertCurrencyHandler(
      from,
      to,
      amount,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
