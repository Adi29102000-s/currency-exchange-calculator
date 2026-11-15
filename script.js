const fallbackRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.33,
  JPY: 157.09,
  AUD: 1.5,
  CAD: 1.36,
  CHF: 0.89,
  CNY: 7.25,
  SGD: 1.35,
  AED: 3.67,
  ZAR: 18.22,
};

const currencyLabels = {
  USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', INR: 'Indian Rupee',
  JPY: 'Japanese Yen', AUD: 'Australian Dollar', CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc', CNY: 'Chinese Yuan', SGD: 'Singapore Dollar',
  AED: 'UAE Dirham', ZAR: 'South African Rand',
};

const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const resultText = document.getElementById('result');
const resultCode = document.getElementById('result-code');
const statusPill = document.getElementById('status-pill');
const rateSummary = document.getElementById('rate-summary');
const lastUpdated = document.getElementById('last-updated');
const popularRatesList = document.getElementById('popular-rates');
const form = document.getElementById('converter-form');
const swapButton = document.getElementById('swap-button');

let exchangeRates = { ...fallbackRates };

function populateCurrencyOptions() {
  const options = Object.keys(fallbackRates)
    .map((code) => `<option value="${code}">${code} - ${currencyLabels[code]}</option>`)
    .join('');
  fromCurrency.innerHTML = options;
  toCurrency.innerHTML = options;
  fromCurrency.value = 'USD';
  toCurrency.value = 'INR';
}

function convertCurrency(amount, from, to) {
  return (amount / exchangeRates[from]) * exchangeRates[to];
}

function renderPopularRates() {
  const codes = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD']
    .filter((code) => code !== fromCurrency.value)
    .slice(0, 5);
  popularRatesList.innerHTML = codes.map((code) => `
    <li><span class="pair">${fromCurrency.value} → ${code}</span>
    <strong>${convertCurrency(1, fromCurrency.value, code).toFixed(2)}</strong></li>
  `).join('');
}

function updateResult() {
  const amount = Math.max(0, Number(amountInput.value) || 0);
  const from = fromCurrency.value;
  const to = toCurrency.value;
  resultText.textContent = convertCurrency(amount, from, to).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  resultCode.textContent = to;
  rateSummary.textContent = `1 ${from} = ${convertCurrency(1, from, to).toFixed(4)} ${to}`;
  renderPopularRates();
}

async function fetchRates() {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error('Rate request failed');
    const data = await response.json();
    if (!data.rates || !data.rates.USD) throw new Error('No rates returned');
    exchangeRates = { ...fallbackRates, ...data.rates };
    statusPill.textContent = 'Live rates';
    lastUpdated.textContent = data.time_last_update_utc
      ? new Date(data.time_last_update_utc).toLocaleDateString()
      : 'Just now';
  } catch {
    exchangeRates = { ...fallbackRates };
    statusPill.textContent = 'Fallback rates';
    lastUpdated.textContent = 'Offline';
  }
  updateResult();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  updateResult();
});

swapButton.addEventListener('click', () => {
  [fromCurrency.value, toCurrency.value] = [toCurrency.value, fromCurrency.value];
  updateResult();
});

amountInput.addEventListener('input', updateResult);
fromCurrency.addEventListener('change', updateResult);
toCurrency.addEventListener('change', updateResult);

populateCurrencyOptions();
updateResult();
fetchRates();
