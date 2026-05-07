const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

// Sync database and start server
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully with SQLite.');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
  });
