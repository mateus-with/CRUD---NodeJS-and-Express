// importando
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 4000;

// conexão com o bd
mongoose.connect(process.env.DB_URI);
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Conected to the database!"));

// middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})

app.use(express.static('uploads'))

// setando os templates engines
app.set('view engine', 'ejs');

// route prefix
app.use("", require("./routes/routes"));

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`)
})


