const mongoose = require('mongoose');
const server = require('./app');
const config = require('./config/config');

try {
  mongoose.connect(config.db.MONGO_URL);
  server.listen(config.app.PORT, () => {
    console.log(`Running on ${config.db.URL}...`);
  });
} catch (error) {
  throw new Error();
}
