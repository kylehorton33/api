const express = require("express");
const main = require("./controllers/main");
const auth = require("./controllers/auth");

const app = express();
app.use(express.json());

app.get("/", main.welcomeMessage);

app.post("/users/signup", auth.checkSignupBody, auth.signupUser)
app.post("/users/login", auth.checkLoginBody, auth.loginUser)

app.get("/users", auth.isAdminUser, auth.getAllUsers);
app.get("/user/:id", auth.getOneUser);
app.put("/user/:id", auth.updateUser);

app.listen(5000, () => {
    console.log("The server has started at http://localhost:5000");
});