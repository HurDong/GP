var express = require("express");
var mysql = require("mysql");
var app = express();

// Allow express to parse JSON bodies in POST requests
app.use(express.json());

// Create a connection to the database
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "meetingDB",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected to the database!");
});

app.get("/reviews", function (req, res) {
  connection.query("SELECT * FROM reviews", (err, mysqlres) => {
    if (err) {
      console.log("Error fetching reviews: " + err);
      res.json({ status: "error" });
    } else {
      res.json({ status: "ok", data: mysqlres });
    }
  });
});

app.get("/reviews/:id", function (req, res) {
  connection.query(
    "SELECT * FROM reviews WHERE id = ?",
    [req.params.id],
    (err, mysqlres) => {
      if (err) {
        console.log("Error fetching review with id: " + req.params.id);
        res.json({ status: "error" });
      } else {
        res.json({ status: "ok", data: mysqlres });
      }
    }
  );
});

app.put("/reviews/:id", function (req, res) {
  const { rating, review_text } = req.body;
  connection.query(
    "UPDATE reviews SET rating = ?, review_text = ? WHERE id = ?",
    [rating, review_text, req.params.id],
    (err) => {
      if (err) {
        console.log("Error updating review: " + err);
        res.json({ status: "error" });
      } else {
        res.json({ status: "ok" });
      }
    }
  );
});

app.delete("/reviews/:id", function (req, res) {
  connection.query(
    "DELETE FROM reviews WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) {
        console.log("Error deleting review: " + err);
        res.json({ status: "error" });
      } else {
        res.json({ status: "ok" });
      }
    }
  );
});

app.get("/reviews/restaurant/:restaurant_id", (req, res) => {
  connection.query(
    "SELECT * FROM reviews WHERE restaurant_id = ?",
    [req.params.restaurant_id],
    (err, results) => {
      if (err) throw err;
      res.send(results);
    }
  );
});

app.get("/users/:id", function (req, res) {
  connection.query(
    "SELECT * FROM Users WHERE id = ?",
    [req.params.id],
    (err, mysqlres) => {
      if (err) {
        console.log("Error fetching user with id: " + req.params.id);
        res.json({ status: "error" });
      } else {
        res.json({ status: "ok", data: mysqlres });
      }
    }
  );
});

app.post("/signup", function (req, res) {
  const { username, email, password } = req.body;

  // Check if any of the fields are empty
  if (!username || !email || !password) {
    res.json({ status: "error", message: "Please fill all fields" });
    return;
  }

  // Check if the email is already registered
  connection.query(
    "SELECT * FROM Users WHERE email = ?",
    [email],
    function (err, result) {
      if (err) {
        res.json({
          status: "error",
          message: "An error occurred during sign up1",
        });
        console.log("Error fetching users: " + err);
        return;
      }

      if (result.length > 0) {
        res.json({ status: "error", message: "Email already registered" });
        return;
      } else {
        // Insert the new user into the database
        connection.query(
          "INSERT INTO Users (username, email, password) VALUES (?, ?, ?)",
          [username, email, password],
          function (err, result) {
            if (err) {
              res.json({
                status: "error",
                message: "An error occurred during sign up2",
              });
              console.log("Error inserting new user: " + err);
              return;
            }

            res.json({ status: "ok", message: "Successfully registered" });
          }
        );
      }
    }
  );
});

app.post("/login", function (req, res) {
  const { email, password } = req.body;
  connection.query(
    "SELECT * FROM Users WHERE email = ? AND password = ?",
    [email, password],
    function (err, results) {
      if (err) {
        console.log("Error logging in: " + err);
        res.json({ status: "error" });
      } else if (results.length > 0) {
        res.json({ status: "ok", data: results[0] });
      } else {
        res.json({ status: "error", message: "Invalid email/password" });
      }
    }
  );
});

app.listen(3000, function () {
  console.log("Server is listening on port 3000");
});
