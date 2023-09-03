const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "meetingdb",
});

async function loginUser(username, password) {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM Users WHERE username = ? AND password = ?",
      [username, password],
      (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0);
      }
    );
  });
}

module.exports = { loginUser };
