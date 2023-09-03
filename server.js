const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");
const cors = require("cors");

const app = express();

// 이 위치에서 CORS 미들웨어를 등록
app.use(cors());

// 그 다음에 다른 미들웨어를 등록
app.use(bodyParser.json());
app.use("/", routes);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000/");
});
