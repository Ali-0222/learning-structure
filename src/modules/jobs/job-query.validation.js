const { fail } = require('./job.validation');

function readText(value, name, fallback = '') {
  if (value === undefined) return fallback;
  // Repeated parameters, such as ?page=1&page=2, produce an array.
  if (typeof value !== 'string') fail(400, `${name} must be a single text value.`);
  return value.trim();
}

function readPositiveInteger(value, name, fallback, maximum) {
  if (value === undefined) return fallback;
  const text = readText(value, name);
  const number = Number(text);
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(number) || number < 1 || number > maximum) {
    fail(400, `${name} must be a whole number between 1 and ${maximum}.`);
  }
  return number;
}

function validateJobQuery(query = {}) {
  const allowed = ['search', 'location', 'company', 'page', 'limit', 'sortBy', 'order'];
  for (const key of Object.keys(query)) {
    if (!allowed.includes(key)) fail(400, `Unknown query parameter: ${key}.`);
  }
  const sortBy = readText(query.sortBy, 'sortBy', 'id');
  const order = readText(query.order, 'order', 'asc');
  if (!['id', 'title', 'company', 'location'].includes(sortBy)) {
    fail(400, 'sortBy must be id, title, company, or location.');
  }
  if (!['asc', 'desc'].includes(order)) fail(400, 'order must be asc or desc.');

  return {
    search: readText(query.search, 'search').toLowerCase(),
    location: readText(query.location, 'location').toLowerCase(),
    company: readText(query.company, 'company').toLowerCase(),
    page: readPositiveInteger(query.page, 'page', 1, 1000000),
    limit: readPositiveInteger(query.limit, 'limit', 5, 50),
    sortBy,
    order,
  };
}

module.exports = { validateJobQuery };
