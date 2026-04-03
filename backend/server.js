const express = require('express');
const cors = require('cors');
const { PORT } = require('./src/config/env');
const connectDB = require('./src/config/db'); // import
const authRoutes = require('./src/routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

connectDB(); //   connection call


app.use('/api', authRoutes); //   route setup

app.get('/', (req, res) => {
  res.send('EleeteBattle API is up and running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
