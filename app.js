//jshint esversion:6
require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();


app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/secretsDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  secrets: [{secret: String}]
});

console.log(process.env.SECRET);

userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password'] });

const User = new mongoose.model("user", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app
  .route("/register")
  .get(function (req, res) {
      res.render("register");
    })
  .post(function (req, res) {
    const newUser = new User({
      email: req.body.username,
      password: req.body.password,
    });
    User.findOne({ email: req.body.username }).then(function (userFound) {
        if (userFound) {
        console.log("User " + userFound.email + " exists in the database.");
      } else {
        newUser
          .save()
          .then(function () {
              console.log("New user saved to the database.");
              res.render("secrets");
          })
          .catch(function (err) {
            console.log(err);
          });
      }
    });
  });

app
  .route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {
    const email = req.body.username;
    const password= req.body.password;
    User.findOne({
      email: email,
    })
      .then(function (userFound) {
        if (userFound.password === password) {
          console.log("User found, logging in...");
          res.render("secrets");
        } else {
            console.log("Check your username and password, try again!");
        }
    })
    .catch(function (err) {
        console.log(err);
    });
});

app.route("/submit")
.get(function(req, res){
    res.render("submit")
})
.post(function(req, res){
    User.updateOne
})

app.listen(3000, function (req, res) {
  console.log("Server is running on port 3000.");
});
