// Throwing stops the current function; Express forwards the error to error middleware.
function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function validateId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    fail(400, 'Job ID must be a positive whole number.');
  }
  return id;
}

function validateJob(body) {
  const { title, company, location } = body || {};
  if (
    typeof title !== 'string' || !title.trim() ||
    typeof company !== 'string' || !company.trim() ||
    typeof location !== 'string' || !location.trim()
  ) {
    fail(400, 'Title, company, and location must be non-empty strings.');
  }
  // Return only allowed fields; the client cannot set the ID.
  return { title: title.trim(), company: company.trim(), location: location.trim() };
}

module.exports = { fail, validateId, validateJob };
