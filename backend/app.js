const express = require('express');
const app = express();
const errorMiddleware = require('./middleware/error');
// Routes import
const product = require('./routes/productRoute');
const user = require('./routes/userRoute');
const order = require('./routes/orderRoute');
const cookie = require("cookie-parser");
app.use(express.json());
app.use(cookie());
app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1",order )

// Middleware for errors
app.use(errorMiddleware);
module.exports=app;