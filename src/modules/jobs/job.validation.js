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

const editableFields = ['title', 'company', 'location'];

function validateBodyFields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    fail(400, 'Request body must be a JSON object.');
  }
  for (const field of Object.keys(body)) {
    if (!editableFields.includes(field)) {
      fail(400, `Unknown field: ${field}. Allowed fields: title, company, location.`);
    }
  }
}

function validateJob(body) {
  validateBodyFields(body);
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

function validateJobPatch(body) {
  validateBodyFields(body);
  const fields = Object.keys(body);
  if (fields.length === 0) {
    fail(400, 'Provide at least one field to update.');
  }
  const changes = {};
  for (const field of fields) {
    const value = body[field];
    // Missing fields stay unchanged; supplied fields must be valid.
    if (typeof value !== 'string' || !value.trim()) {
      fail(400, `${field} must be a non-empty string.`);
    }
    changes[field] = value.trim();
  }
  return changes;
}

module.exports = { fail, validateId, validateJob, validateJobPatch };
