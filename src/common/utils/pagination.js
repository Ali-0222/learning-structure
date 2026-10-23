function paginate(items, page, limit) {
  // Page 1 starts at index 0; page 2 skips the first limit items.
  const start = (page - 1) * limit;
  const total = items.length;
  return {
    data: items.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = { paginate };
