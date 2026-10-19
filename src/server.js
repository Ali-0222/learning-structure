// require doosri file se exported cheez yahan lata hai.
const app = require('./app');

// Port server ka local address number hai.
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`HireHub is running at http://localhost:${PORT}`);
});
