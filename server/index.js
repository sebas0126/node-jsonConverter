express = require("express");
bodyParser = require("body-parser");

apiRouter = require("./routes/api");

app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", apiRouter);

app.listen(2300, () => {
  console.log("Server on port 2300");
})