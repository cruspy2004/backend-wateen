const express = require('express');
require('dotenv').config();
const pool = require('./config/db');

const app = express();
app.use(express.json());

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`✅ DB Connected! Time: ${result.rows[0].now}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ DB Connection failed.");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
