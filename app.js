const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connection = require("./db/config");
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    // httpOnly: true,   //not required in dev mode
  })
);

app.use("/api/cabin", require("./routes/cabinRoute"));
app.use("/api/ai", require("./routes/gptRoutes"));
app.use("/api/user", require("./routes/userRoute"));

app.use("/", (req, res) => {
  res.send("wild oasis");
});

app.listen(process.env.PORT, async () => {
  await connection;
  console.log(
    `server is running on port ${process.env.PORT} connected to database...`
  );
});
