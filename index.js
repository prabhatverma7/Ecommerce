const bodyParser = require('body-parser');
const express = require('express');
const dbConnect = require('./configs/dbConnect');
const dotenv = require('dotenv').config();
const authRouter = require('./routes/authRoute');

const app = express();
const PORT = process.env.PORT || 4000;
dbConnect();

app.use(bodyParser.json());
app.use('/api/user',authRouter);
app.listen(PORT, () => {
console.log(`Server is running on ${PORT}`);
});