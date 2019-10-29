import express from "express";
import bodyParser from "body-parser";
import firebase from "firebase";
import * as admin from "firebase-admin";
import nodemailer from "nodemailer";

const accountSid = "ACffe9c4ee1633d02a303b58c0b751bfb2";
const authToken = "48b8b0792d8ac524757678014d4e7835";
const client = require("twilio")(accountSid, authToken);

import serviceAccount from "./plasmagendb-85c2a-firebase-adminsdk-991zp-a1ba6c789c.json";

const app = express(); // get all todos

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

firebase.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://plasmagendb-85c2a.firebaseio.com"
});

app.all("/*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "POST, GET");
  next();
});

// All Functions

// send email function

function Mailer(email, name, res) {
  console.log(email, name);
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "urbanstopstudio@gmail.com",
      pass: "nbsdhzrgabplywdn"
    }
  });

  let mailOptions = {
    from: "urbanstop", // sender address
    to: email, // list of receivers
    subject: "Email Test ✔", // Subject line
    // text: "Hello" + name, // plain text body
    html: "<p>Hello " + name + ", How are you? <br>?</p>" // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(400).send({ success: false });
    } else {
      res.status(200).send({ success: true });
    }
  });
}

// send SMS function

function SendSMS(phone, name, res) {
  client.messages
    .create({
      body: "Hello" + name + ". How are you?",
      from: "+15005550006",
      to: "+91" + phone
    })
    .then(message => {
      console.log(message);
      res.status(200).send({
        name: name,
        phone: phone,
        message: message
      });
    })
    .catch(err => {
      console.log(err);
      res.status(400).send({
        status: "false",
        message: "failed"
      });
    });
}

// All Routes

// GET || fetch basic user details

app.get("/api/survey1/form", (req, res) => {
  const userReference = firebase.database().ref();

  userReference.once("value").then(function(snap) {
    res.status(200).send({
      success: "true",
      message: "Success",
      status: 200,
      data: snap.val()
    });
  });
});

// POST || Baisc User Details

app.post("/api/survey1/form", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;

  if (!name) {
    return res.status(400).send({
      success: "false",
      message: "name is required"
    });
  } else if (!email) {
    return res.status(400).send({
      success: "false",
      message: "email is required"
    });
  } else if (!phone) {
    return res.status(400).send({
      success: "false",
      message: "phone is required"
    });
  }

  const referencePath = "/users/";
  const ref = firebase.database().ref(referencePath);

  const UserData = {
    name: name,
    email: email,
    phone: phone,
    gameLevel: null,
    time: null,
    position: null
  };

  ref.push(UserData, function(error) {
    if (error) {
      res.send("Data could not be updated." + error);
    } else {
      return res.status(201).send({
        success: "true",
        message: "User Data added successfully",
        UserData
      });
    }
  });
});

// POST || Game Level

app.post("/api/survey1/gamelevel", (req, res) => {
  const GameLevel = req.body.level;
  if (GameLevel === "Easy") {
    return res.status(201).send({
      success: "true",
      message: "Easy Level Selected",
      GameLevel: GameLevel
    });
  } else if (GameLevel === "Medium") {
    return res.status(201).send({
      success: "true",
      message: "Medium Level Selected",
      GameLevel: GameLevel
    });
  } else if (GameLevel === "Difficult") {
    return res.status(201).send({
      success: "true",
      message: "Difficult Level Selected",
      GameLevel: GameLevel
    });
  } else {
    return res.status(500).send({
      success: "false",
      message: "Please select level as: Easy, Medium, Difficult"
    });
  }
});

// POST || Send Email and Phone

app.post("/api/survey1/deal", (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const phone = req.body.phone;

  if (!name) {
    return res.status(400).send({
      success: "false",
      message: "name is required"
    });
  } else if (!email) {
    return res.status(400).send({
      success: "false",
      message: "email is required"
    });
  } else if (!phone) {
    return res.status(400).send({
      success: "false",
      message: "phone is required"
    });
  } else {
    Mailer(email, name, res);
    //SendSMS(phone, name, res);
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
