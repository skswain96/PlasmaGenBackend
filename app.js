import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import firebase from "firebase";
import * as admin from "firebase-admin";
import nodemailer from "nodemailer";
import msg91 from "msg91-sms";
import voucher_codes from "voucher-code-generator";

var authkey = "233012AosSPkY6Ua5b7c55a0";
var dialcode = "91";
var route = 4;
var senderid = "PLASMA";

import serviceAccount from "./plasmagendb-85c2a-firebase-adminsdk-991zp-a1ba6c789c.json";

const app = express(); // get all todos

var corsOptions = {
  origin: "http://127.0.0.1:3000",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
// Parse incoming requests data
app.use(cors(corsOptions));
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

function SendSMS(phone, name, isMCQ, res) {
  if (isMCQ === true) {
    const coupon = voucher_codes.generate({
      length: 3,
      count: 1,
      prefix: "PGBPU",
      charset: voucher_codes.charset("numbers")
    });

    const message = `Thank you for visiting our stall, B-20. We hope you enjoyed the visit, coz we definitely did!
  
Your lucky coupon is ${coupon}
  
Please hold onto this message. PlasmaGen BioSciences wishes you the best for the lucky draw! Fingers crossed.`;

    msg91.sendOne(authkey, phone, message, senderid, route, dialcode, function(
      response
    ) {
      //Returns Message ID, If Sent Successfully or the appropriate Error Message
      console.log(response);
    });
  } else {
    const coupon = voucher_codes.generate({
      length: 3,
      count: 1,
      prefix: "PGBCO",
      charset: voucher_codes.charset("numeric")
    });

    const message = `Thank you for visiting our stall, B-20. We hope you enjoyed the visit, coz we definitely did!
  
Your lucky coupon is ${coupon}
  
Please hold onto this message. PlasmaGen BioSciences wishes you the best for the lucky draw! Fingers crossed.`;

    msg91.sendOne(authkey, phone, message, senderid, route, dialcode, function(
      response
    ) {
      //Returns Message ID, If Sent Successfully or the appropriate Error Message
      console.log(response);
    });
  }

  //var message = `Hello ${name}, your Coupon code is `;
}

// All Routes

// GET || fetch basic user details

app.get("/", (req, res) => {
  res.send("Welcome to PlasmaGen");
});

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
  const speciality = req.body.speciality;
  const hospital = req.body.hospital;
  const city = req.body.city;
  const isMCQ = req.body.isMCQ;
  // const gameLevel = req.body.phone;
  // const time = req.body.time;
  // const position = req.body.position;
  // const coupon = req.body.coupon;

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

  const ref = firebase.database().ref("/data/");

  const UserData = {
    name: name,
    email: email,
    phone: phone,
    speciality: speciality,
    gameLevel: "",
    time: "",
    position: "",
    hospital: hospital,
    city: city,
    isMCQ: isMCQ
  };

  ref.child("users").push(UserData, function(error) {
    if (error) {
      res.send("Data could not be updated." + error);
    } else {
      Mailer(email, name, res);
      SendSMS(phone, name, isMCQ, res);
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

// app.post("/api/survey1/deal", (req, res) => {
//   const email = req.body.email;
//   const name = req.body.name;
//   const phone = req.body.phone;

//   if (!name) {
//     return res.status(400).send({
//       success: "false",
//       message: "name is required"
//     });
//   } else if (!email) {
//     return res.status(400).send({
//       success: "false",
//       message: "email is required"
//     });
//   } else if (!phone) {
//     return res.status(400).send({
//       success: "false",
//       message: "phone is required"
//     });
//   } else {
//     Mailer(email, name, res);
//     SendSMS(phone, name, res);
//   }
// });

//     // "start": "nodemon app.js --exec babel-node --"

const PORT = 3000;

app.listen(process.env.PORT || 3000, () => {
  console.log(`server running on port ${PORT}`);
});
