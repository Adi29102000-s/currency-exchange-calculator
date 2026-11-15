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
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  INR: 'Indian Rupee',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  SGD: 'Singapore Dollar',
  AED: 'UAE Dirham',
  ZAR: 'South African Rand',
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
let lastFetchTime = null;

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
  const fromRate = exchangeRates[from] || 1;
  const toRate = exchangeRates[to] || 1;

  return (amount / fromRate) * toRate;
}

function formatMoney(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function renderPopularRates() {
  const currencyOrder = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];
  const items = currencyOrder
    .filter((code) => code !== fromCurrency.value)
    .slice(0, 5)
    .map((code) => {
      const rate = convertCurrency(1, fromCurrency.value, code);
      return `
        <li>
          <span class="pair">${fromCurrency.value} → ${code}</span>
          <strong>${rate.toFixed(2)}</strong>
        </li>
      `;
    })
    .join('');

  popularRatesList.innerHTML = items || '<li><span class="pair">No rates available</span></li>';
}

function updateResult() {
  const amount = Number(amountInput.value || 0);
  const from = fromCurrency.value;
  const to = toCurrency.value;

  const converted = convertCurrency(amount, from, to);
  resultText.textContent = converted.toFixed(2);
  resultCode.textContent = to;

  const oneUnit = convertCurrency(1, from, to);
  rateSummary.textContent = `1 ${from} = ${oneUnit.toFixed(4)} ${to}`;

  renderPopularRates();
}

async function fetchRates() {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');

    if (!response.ok) {
      throw new Error('Fetch failed');
    }

    const data = await response.json();

    if (!data.rates || Object.keys(data.rates).length === 0) {
      throw new Error('No rates returned');
    }

    exchangeRates = { ...fallbackRates, ...data.rates };
    lastFetchTime = new Date();
    statusPill.textContent = 'Live rates';
    statusPill.style.background = 'rgba(20, 184, 166, 0.12)';
    statusPill.style.color = '#0f766e';
    lastUpdated.textContent = lastFetchTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    exchangeRates = { ...fallbackRates };
    lastFetchTime = new Date();
    statusPill.textContent = 'Fallback rates';
    statusPill.style.background = 'rgba(251, 191, 36, 0.15)';
    statusPill.style.color = '#92400e';
    lastUpdated.textContent = lastFetchTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  updateResult();
});

swapButton.addEventListener('click', () => {
  const currentFrom = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = currentFrom;
  updateResult();
});

amountInput.addEventListener('input', updateResult);
fromCurrency.addEventListener('change', updateResult);
toCurrency.addEventListener('change', updateResult);

async function init() {
  populateCurrencyOptions();
  await fetchRates();
  updateResult();
}

init();
