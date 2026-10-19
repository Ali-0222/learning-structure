// Import the application exported by app.js.
const app = require('./app');

// The port identifies where the server listens for requests.
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`HireHub is running at http://localhost:${PORT}`);
});
