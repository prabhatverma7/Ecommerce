const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const morgan = require('morgan');
const dbConnect = require('./configs/dbConnect');
const { notFound, errorHandler } = require('./middlewares/errorhandler');
const dotenv = require('dotenv').config();
const authRouter = require('./routes/authRoute');
const productRouter = require('./routes/productRoute');
const blogRouter = require('./routes/blogRoute');


const app = express();
const PORT = process.env.PORT || 4000;
dbConnect();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api/user',authRouter);
app.use('/api/product',productRouter);
app.use('/api/blog',blogRouter);

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
console.log(`Server is running on ${PORT}`);
});