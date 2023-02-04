const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const dbConnect = require('./configs/dbConnect');
const { notFound, errorHandler } = require('./middlewares/errorhandler');
const dotenv = require('dotenv').config();
const authRouter = require('./routes/authRoute');


const app = express();
const PORT = process.env.PORT || 4000;
dbConnect();

app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/user',authRouter);


app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
console.log(`Server is running on ${PORT}`);
});