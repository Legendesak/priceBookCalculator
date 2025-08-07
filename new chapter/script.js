let data = [];
let filteredData = [];
let selectedCurrency = 'USD';
let selectedRow = null;

fetch('data.json')
  .then(res => res.json())
  .then(json => {
    data = json;
    populateRegions();
  });

function populateRegions() {
  const regions = [...new Set(data.map(d => d.Region))];
  const regionSelect = document.getElementById('region');
  regionSelect.innerHTML = '<option value="">Select Region</option>';
  regions.forEach(region => {
    regionSelect.innerHTML += `<option value="${region}">${region}</option>`;
  });

  regionSelect.addEventListener('change', () => {
    const selectedRegion = regionSelect.value;
    filteredData = data.filter(d => d.Region === selectedRegion);
    populateCountries();
  });
}




function populateCountries() {
  const countrySelect = document.getElementById('country');
  countrySelect.innerHTML = '<option value="">Select Country</option>';
  const countries = [...new Set(filteredData.map(d => d.Country))];
  countries.forEach(country => {
    countrySelect.innerHTML += `<option value="${country}">${country}</option>`;
  });

  countrySelect.addEventListener('change', () => {
    const selectedCountry = countrySelect.value;
    selectedRow = filteredData.find(d => d.Country === selectedCountry);
    selectedCurrency = selectedRow.Currency;
    document.getElementById('currency').innerText = selectedCurrency;
    populateDispatchTitles();
    populatePricingTitles();
  });
}




function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('output').innerText = '';
}




function calculateYearly() {
  const levelRaw = document.getElementById('yearlyOptionCatogory').value;
  const backfillRaw = document.getElementById('yearlyOption').value;
  const years = parseInt(document.getElementById('yearCount').value, 10);

  const level = levelRaw.replace(/^yearly/i, '').trim().toUpperCase();
  const backfill = backfillRaw.includes('With') ? 'With Backfill' : 'Without Backfill';

  const searchString = `${level} ${backfill} Yearly Rate`.toLowerCase().replace(/\s+/g, '');

  const label = Object.keys(selectedRow).find(k =>
    k.toLowerCase().replace(/\s+/g, '') === searchString
  );

  if (!label) return showPopup('No yearly rate found.');

  const rawRate = selectedRow[label];
  const rate = parseFloat(rawRate.replace(/[^\d.,]/g, '').replace(/,/g, '')) || 0;
  const total = rate * years;

  const currencySymbol = selectedRow['Currency']?.trim().toLowerCase() === 'euro' ? '€' : '$';

  showPopup(`Total for ${years} year(s): ${currencySymbol}${formatCurrency(total)}`);
}


function calculateDaily() {
  const type = document.getElementById('dailyOption').value; // Full or Half
  const level = document.getElementById('dailyOptionCatogory').value; // e.g., dailyL1
  const levelLabel = level.replace('daily', '').toUpperCase(); // "L1"
  const days = parseInt(document.getElementById('dayCount').value, 10);

  const searchLabel = `${levelLabel} Daily rates ${type === 'Full' ? 'FULLD' : 'HD'}`;
  const key = Object.keys(selectedRow).find(k =>
    k.toLowerCase().includes(searchLabel.toLowerCase())
  );

  if (!key) return showPopup('No daily rate found.');

  const rate = parseFloat(selectedRow[key].replace(/[^\d.,]/g, '').replace(/,/g, '')) || 0;
  const total = rate * days;

  const currencySymbol = selectedRow['Currency']?.trim().toLowerCase() === 'euro' ? '€' : '$';

  showPopup(`Total for ${days} day(s): ${currencySymbol}${formatCurrency(total)}`);
}






function calculateDispatchPricing() {
  const selected = document.getElementById('dispatchPricingTitle');
  const titleText = selected.options[selected.selectedIndex].text.trim();
  const days = parseInt(document.getElementById('dispatchPricingDays').value, 10);

  const key = Object.keys(selectedRow).find(k =>
    k.toLowerCase().includes('dp') &&
    k.toLowerCase().includes(titleText.toLowerCase())
  );

  if (!key) return showPopup('No dispatch pricing found.');

  const rate = parseFloat(selectedRow[key].replace(/[^\d.,]/g, '').replace(/,/g, '')) || 0;
  const total = rate * days;


  const currencySymbol = selectedRow['Currency']?.trim().toLowerCase() === 'euro' ? '€' : '$';

  showPopup(`Total for ${days} day(s): ${currencySymbol}${formatCurrency(total)}`);
}





function populateDispatchTitles() {
  const select = document.getElementById('dispatchTitle');
  select.innerHTML = '';
  Object.keys(selectedRow).forEach(key => {
    if (key.startsWith('Dispatch Task:')) {
      select.innerHTML += `<option value="${key}">${key.replace('Dispatch Task:', '').trim()}</option>`;
    }
  });
}





function calculateTermRate() {
  const months = parseInt(document.getElementById('termMonths').value, 10);
  const level = document.getElementById('termBasedOptionCatogory').value.replace('term', '').toUpperCase(); // "L1"

  const termType = months < 3 ? 'SP' : 'LP'; // SP = short project, LP = long project
  const searchString = `${level} ${termType} Monthly`.toLowerCase().replace(/\s+/g, '');

  const key = Object.keys(selectedRow).find(k =>
    k.toLowerCase().replace(/\s+/g, '') === searchString
  );

  if (!key) return showPopup('No term-based rate found.');

  const rate = parseFloat(selectedRow[key].replace(/[^\d.,]/g, '').replace(/,/g, '')) || 0;
  const total = rate * months;

  const currencySymbol = selectedRow['Currency']?.trim().toLowerCase() === 'euro' ? '€' : '$';

  showPopup(`Total for ${months} month(s): ${currencySymbol}${formatCurrency(total)}`);
}






function calculateDispatchRate() {
  const selected = document.getElementById('dispatchRateTitle');
  const titleText = selected.options[selected.selectedIndex].text.trim();
  const days = parseInt(document.getElementById('dispatchRateDays').value, 10);
  const additionalHours = parseFloat(document.getElementById('additionalRate').value) || 0;

  const key = Object.keys(selectedRow).find(k =>
    k.toLowerCase().includes('dr') &&
    k.toLowerCase().includes(titleText.toLowerCase())
  );

  if (!key) return showPopup('No dispatch rate found.');

  const baseRate = parseFloat(selectedRow[key].replace(/[^\d.,]/g, '').replace(/,/g, '')) || 0;

  const additionalRateKey = Object.keys(selectedRow).find(k => k.toLowerCase().includes('dr additional hour'));
  const additionalRate = additionalRateKey ? parseFloat(selectedRow[additionalRateKey].replace(/[^0-9.]/g, '')) : 0;

  const total = (baseRate * days) + (additionalRate * additionalHours);


 const currencySymbol = selectedRow['Currency']?.trim().toLowerCase() === 'euro' ? '€' : '$';

  showPopup(`Total for ${days} day(s): ${currencySymbol}${formatCurrency(total)}`);
}





function populatePricingTitles() {
  const select = document.getElementById('pricingTitle');
  select.innerHTML = '';
  Object.keys(selectedRow).forEach(key => {
    if (key.startsWith('Dispatch Pricing:')) {
      select.innerHTML += `<option value="${key}">${key.replace('Dispatch Pricing:', '').trim()}</option>`;
    }
  });
}




function showPopup(message) {
  document.getElementById('popupText').innerText = message;
  document.getElementById('popup').style.display = 'block';
}

function closePopup() {
  document.getElementById('popup').style.display = 'none';
}


function formatCurrency(num) {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
