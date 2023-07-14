const express = require("express");
const { getUsers } = require("./db/queries");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "The API is up and running",
    });
});

app.get("/users", async(req, res) => {
    const users = await getUsers();
    res.json(users.rows);
});

app.listen(5000, () => {
    console.log("The server has started at http://localhost:5000");
});