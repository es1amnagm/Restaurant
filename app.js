const express = require("express");
const cors = require('cors');
const {SUCCESS,FAIL,ERROR} = require('./MiddleWare/errorHandling')
const mealsRouter = require('./Routes/mealsRoutes');
const usersRouter = require('./Routes/usersRoutes');

require("dotenv").config();
const app = express();

console.log();


app.use(express.json());
app.use(cors());




app.use('/meals',mealsRouter);
app.use('/users',usersRouter);





app.use((err, req, res, next) => {
  return res
    .status(err.statusCode || 500)
    .json({ state: err.errorState || ERROR, message: err.message });
});

app.use("", (req, res) => {
  return res.status(404).json({ message: "page not found" });
});



const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
