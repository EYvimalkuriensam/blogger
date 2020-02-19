const express = require("express");
require("./db/mongoose");

const app = express();
const PORT = process.env.PORT;

app.use(express.json);

app.listen(PORT, () => console.log(`Server is listening on ${PORT}`));
