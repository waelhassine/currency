/**
 * Currency Service Module
 *
 * This module provides services for currency conversion, including fetching exchange rates,
 * converting amounts between currencies, and validating input data.
 *
 * Functions:
 *
 * 1. getExchangeRate(from, to)
 *    - Retrieves the exchange rate for converting from one currency to another.
 *    - Throws ValidationError if the target currency is not supported.
 *
 * 2. convertCurrency(rate, amount)
 *    - Converts a given amount using a specified exchange rate.
 *
 * 3. validateCurrencyInputs(from, to, amount)
 *    - Validates the currency conversion input parameters.
 *    - Throws ValidationError or BadRequestError for invalid inputs.
 *
 * 4. convertCurrencyHandler(from, to, amount)
 *    - High-level function to handle the end-to-end flow of currency conversion.
 *    - Fetches exchange rates, performs validation, and calculates the result.
 *
 * Errors:
 *
 * - ValidationError: Thrown when input validation fails.
 * - BadRequestError: Thrown when a bad request is made.
 *
 * Example Usage:
 *
 * const currencyService = require('./currencyService');
 *
 * // Convert currency
 * currencyService.convertCurrencyHandler('USD', 'EUR', 100)
 *   .then(result => console.log(result))
 *   .catch(err => console.error(err));
 */

const axios = require("axios");
const { ValidationError, BadRequestError } = require("../utils/errors");

const EXCHANGE_RATE_API_URL = "https://v6.exchangerate-api.com/v6";
const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

// Fetches the exchange rate for the given currency pair
const getExchangeRate = async (from, to) => {
  try {
    const response = await axios.get(
      `${EXCHANGE_RATE_API_URL}/${API_KEY}/latest/${from.toUpperCase()}`,
    );
    const rates = response.data.conversion_rates;
    console.log("rates", rates);

    if (!rates[to.toUpperCase()]) {
      throw new ValidationError(`Currency '${to}' is not supported.`);
    }

    return rates[to.toUpperCase()];
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error; // Re-throw ValidationError
    }
    throw new Error("Failed to fetch exchange rates. Please try again later.");
  }
};

// Converts the amount using the provided exchange rate
const convertCurrency = (rate, amount) => {
  return (rate * amount).toFixed(2);
};

// Validates input parameters for currency conversion
const validateCurrencyInputs = (from, to, amount) => {
  if (!from || !to || !amount) {
    throw new ValidationError(
      "Missing required parameters: 'from', 'to', or 'amount'.",
    );
  }

  if (isNaN(amount) || amount <= 0) {
    throw new BadRequestError("Amount must be a positive number.");
  }
};

// Handles the complete currency conversion process
const convertCurrencyHandler = async (from, to, amount) => {
  // Validate inputs
  validateCurrencyInputs(from, to, amount);

  // Fetch exchange rate
  const rate = await getExchangeRate(from, to);
  console.log("rate --------------->", rate);

  // Perform currency conversion
  const convertedAmount = convertCurrency(rate, amount);

  return {
    from: from.toUpperCase(),
    to: to.toUpperCase(),
    rate,
    amount: parseFloat(amount),
    convertedAmount: parseFloat(convertedAmount),
  };
};

module.exports = {
  getExchangeRate,
  convertCurrency,
  validateCurrencyInputs,
  convertCurrencyHandler,
};
