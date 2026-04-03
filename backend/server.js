const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/env');


// here we have Initialized the Express app
const app = express();


// here we attach essential Middlewares
app.use(cors()); 


app.use(express.json()); 


//Setup a basic health-check route to verify it works
app.get('/', (req, res) => {
  res.send('EleeteBattle API is up and running!');
});

// Start listening for incoming requests
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});