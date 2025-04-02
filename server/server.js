const express = require("express");
const port = 1155;
const path = require("path");
const app = express();
const cors = require("cors");
const db = require('./config/db')

app.use(express.json());
app.use(cors({origin:"http://localhost:5173"}));
app.use(express.urlencoded())
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", require("./routes/route"))

app.listen(port, (err) => {
    err ? console.log(err) : console.log("Server Started on port :- " + port);
})
