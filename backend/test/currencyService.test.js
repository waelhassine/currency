const axios = require("axios");
const { ValidationError, BadRequestError } = require("../utils/errors");
const currencyService = require("../services/CurrencyService");
require("dotenv").config();

jest.mock("axios");

describe("CurrencyService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getExchangeRate", () => {
    test("should return the exchange rate for valid currencies", async () => {
      axios.get.mockResolvedValue({
        data: {
          conversion_rates: { EUR: 0.85 },
        },
      });

      const rate = await currencyService.getExchangeRate("USD", "EUR");
      expect(rate).toBe(0.85);
      expect(axios.get).toHaveBeenCalledWith(
        `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`,
      );
    });

    test("should throw ValidationError if the target currency is not supported", async () => {
      axios.get.mockResolvedValue({
        data: {
          conversion_rates: {},
        },
      });

      await expect(
        currencyService.getExchangeRate("USD", "XXX"),
      ).rejects.toThrow(ValidationError);
    });

    test("should throw a general error if the API call fails", async () => {
      axios.get.mockRejectedValue(new Error("Network Error"));

      await expect(
        currencyService.getExchangeRate("USD", "EUR"),
      ).rejects.toThrow(
        "Failed to fetch exchange rates. Please try again later.",
      );
    });
  });

  describe("convertCurrency", () => {
    test("should return the correct converted amount", () => {
      const rate = 0.85;
      const amount = 100;
      const convertedAmount = currencyService.convertCurrency(rate, amount);

      expect(convertedAmount).toBe("85.00");
    });
  });

  describe("validateCurrencyInputs", () => {
    test("should validate inputs without throwing errors for valid inputs", () => {
      expect(() =>
        currencyService.validateCurrencyInputs("USD", "EUR", 100),
      ).not.toThrow();
    });

    test("should throw ValidationError for missing inputs", () => {
      expect(() =>
        currencyService.validateCurrencyInputs("", "EUR", 100),
      ).toThrow(ValidationError);

      expect(() =>
        currencyService.validateCurrencyInputs("USD", "", 100),
      ).toThrow(ValidationError);

      expect(() =>
        currencyService.validateCurrencyInputs("USD", "EUR", null),
      ).toThrow(ValidationError);
    });

    test("should throw BadRequestError for invalid amounts", () => {
      expect(() =>
        currencyService.validateCurrencyInputs("USD", "EUR", -100),
      ).toThrow(BadRequestError);

      expect(() =>
        currencyService.validateCurrencyInputs("USD", "EUR", "not-a-number"),
      ).toThrow(BadRequestError);
    });
  });

  describe("convertCurrencyHandler", () => {
    test("should return the converted currency details for valid inputs", async () => {
      const from = "USD";
      const to = "EUR";
      const amount = 100;

      const result = await currencyService.convertCurrencyHandler(
        from,
        to,
        amount,
      );

      expect(result).toEqual({
        from: "USD",
        to: "EUR",
        rate: 0.9013, // Use the mocked rate here
        amount: 100,
        convertedAmount: 90.1,
      });
    });

    test("should throw ValidationError for invalid inputs", async () => {
      await expect(
        currencyService.convertCurrencyHandler("", "EUR", 100),
      ).rejects.toThrow(ValidationError);

      await expect(
        currencyService.convertCurrencyHandler("USD", "", 100),
      ).rejects.toThrow(ValidationError);
    });

    test("should throw BadRequestError for invalid amount", async () => {
      await expect(
        currencyService.convertCurrencyHandler("USD", "EUR", -100),
      ).rejects.toThrow(BadRequestError);
    });

    test("should throw an error if exchange rate fetching fails", async () => {
      jest
        .spyOn(currencyService, "getExchangeRate")
        .mockRejectedValue(new Error("Failed to fetch exchange rates"));

      await expect(
        currencyService.convertCurrencyHandler("USD", "EUR", 100),
      ).rejects.toThrow("Failed to fetch exchange rates");
    });
  });
});
