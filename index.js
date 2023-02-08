const express = require("express");
// const db = require("./db.json");
const fs = require("fs"); //file system
const bodyParser = require("body-parser");
const async = require("async");
const jwt = require("jsonwebtoken");
const verify = require("./services/authServices");
const cookiesParser = require("cookie-parser");
const cors = require("cors");

const corsOptions ={
  origin: true,
  credentials: true,
  optionSuccessStatus: 200
}


require("dotenv").config();

const MongoDB = require("./services/databaseServices");
const { mongo } = require("mongoose");
const notemodel = require("./notemodel");
const usermodel = require("./user_model");
const cookieParser = require("cookie-parser");

const port = process.env.BACKEND_PORT;
const secretKey = process.env.JWT_SECRET;


const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookiesParser());
app.use(cors(corsOptions));

MongoDB.start(); //db has been started


//Users
app.get("/api/v1/getUsers", (req, res) => {
  async.auto(
    {
      notes: function (cb) {
        usermodel.find().exec(function (err, notes) {
          if (err) {
            return cb("Unable to fetch notes.");
          }
          console.log(notes);
          return cb(null, notes);
        });
      },
    },
    function (err, results) {
      if (err) {
        return res.status(403).json({ error: err });
      }
      return res.json({ results: results.notes });
    }
  );
});

app.post("/api/v1/addNewUser", async (req, res) => {
  const data = new usermodel({
    user: req.body.user,
    password: req.body.password,
    createdAt: req.body.createdAt,
    authToken: authToken
  });
  const val = await data.save();
  res.send("user Successfully created");
})

//Notes combine Users
app.get("/api/v1/getNotesUsers", (req, res) => {
  async.auto(
    {
      notes: function (cb) {
        notemodel.find().exec(function (err, notes) {
          if (err) {
            return cb("Unable to fetch notes.");
          }
          console.log(notes);
          return cb(null, notes);
        });
      },
      users: function (cb) {
        usermodel.find().exec(function (err, users) {
          if (err) {
            return cb("Unable to fetch users.");

          }
          console.log(users);
          return cb(null, users);
        })

      },

      combine: ['notes', 'users', function (results, cb) {
        return results.notes.concat(results.users);
      }]


    }, function (err, results) {
      if (err) {
        return res.status(403).json({ error: err });
      }
      return res.json({ results: results.combine });
      return res.send(results.notes.concat(results.users));
    }
  )

})

//db
app.post("/api/v1/addnewnoteFromDb", (req, res) => {
  let Existingnotes = db.notes;
  let note = req.body.note;

  Existingnotes.push(note);
  fs.writeFile("db.json", JSON.stringify({ notes: Existingnotes }), () => { });

  res.send("Note Created");
});


app.post("/api/v1/addnewnotes", async (req, res) => {
  const data = new notemodel({
    desc: req.body.desc,
    title: req.body.title,
  });

  const val = await data.save();

  res.send("Note Sucessfully Created");
});


//Users
app.post('/api/v1/submission', function (req, res) {
  var key = req.body.key;
  var first = parseInt(req.body.firstNumber);
  var second = parseInt(req.body.lastNumber);
  console.log(key);
  async.auto({
    add: function (cb) {
      if (key != "add") {
        return cb(null, false);
      }
      var sum = first + second;
      return cb(null, sum);
    },
    sub: function (cb) {
      if (key != "sub") {
        return cb(null, false);
      }

      var first = parseInt(req.body.firstNumber);
      var second = parseInt(req.body.lastNumber);
      var sum = first - second;
      return cb(null, sum);
    },
    mul: function (cb) {
      if (key != "mul") {
        return cb(null, false);
      }
      var first = parseInt(req.body.firstNumber);
      var second = parseInt(req.body.lastNumber);
      var sum = first * second;
      return cb(null, sum);
    },
    areaOfSquare: function (cb) {
      if (key != "areaOfSquare") {
        return cb(null, false);
      }
      var first = parseInt(req.body.firstNumber);
      var sum = Number(first * first);
      return cb(null, sum);
    },
    areaOfCircle: function (cb) {
      if (key != "areaOfCircle") {
        return cb(null, false);
      }
      var radius = parseInt(req.body.firstNumber);
      var sum = Number(radius * radius * 3.14);
      return cb(null, sum);
    },
    square: function (cb) {
      if (key != "square") {
        return cb(null, false);
      }

      var first = parseInt(req.body.firstNumber);
      var sum = Number(first * first);
      return cb(null, sum);
    },
    squareRoot: function (cb) {
      if (key != "squareRoot") {
        return cb(null, false);
      }
      var first = parseFloat(req.body.firstNumber);

      var sum = Number(Math.sqrt(first));
      return cb(null, sum);
    },

  },
    function (err, results) {
      if (err) {
        return res.status(403).json({ error: err });
      }
      // console.log(results[key]);

      return res.json({ results: results });
    }
  )

});

//
app.get('/api/v1/newNotes',(req, res) => {
  async.auto(
    {
      notes: function (cb) {
        notemodel.find().exec(function (err, note) {
          if (err) {
            return cb(err);
          }
          return cb(null, note);
        });
      },
    },
    function (err, results) {
      if (err) {
        return res.status(403).json({ error: err });
      }
      return res.json({ results: results.notes });

    }
  );
});

app.post('/api/v1/signup', (req, res) => {
  async.auto(
  
    {
      users: function (cb) {
        var userData = { email: req.body.email, password: req.body.password }
        userData.authToken = jwt.sign(userData,secretKey)
        
        usermodel.create(userData, (err, user) => {
          if (err) {
            return cb("Unable to fetch notes.");
          }
          console.log(user)
          return cb(null, user);
        }
        );
      },
    },
    function (err, results) {
      if (err) {
        return res.status(403).json({ error: err });
      }
      return res.json({ results: results.users });
    }
  );
});


app.post('/api/v1/login', (req, res) => {
  async.auto(
    {
      users: function (cb) {

        usermodel.findOne({ email: req.body.email, password: req.body.password }, 
          (err, user) => {
          if (err) {
            return cb("Unable to fetch notes.");
          }
  
          console.log(user)
          try {
            var token = jwt.sign(
              { email: user.email, password: user.password },
              secretKey
            );
            return cb(null, token);
          } catch (err) {
            return cb(null, false);
          }
        }
        
        );
      },
    },
    function (err, results) {
      if (err) {
        return res.status(403).json({ error: err });
      }
      console.log(results);

      if (!results.users) {
        return res.json({ results: "unable to login" });
      }
      res
        .cookie("authToken", results.users, {
          httpOnly: true,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        })
        .send(" succesfully logged in");
    }
  );
});


app.get('/api/v1/logout',(req,res) =>{
 res.cookie("authToken","",{
  httpOnly:true
 })
 .send("Successfully logout");
})

app.listen(port, () => {
  console.log("App has been started");
});




