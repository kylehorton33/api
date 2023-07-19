require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const pool = require("../db/config");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function createUserToken(user) {
    const timestamp = new Date().getTime();
    const payload = { sub: user.user_id, iat: timestamp, admintype: user.admintype, usertype: user.usertype };
    return jwt.sign(payload, process.env.JWT_SECRET);
}

const isValidUser = (req, res, next) => {
    let token, decoded;
    try {
        token = req.headers.authorization.split(' ')[1];
        decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log(decoded)
        next()
    } catch {
        return res.status(401).send({ error: "You must be logged in for this action " })
    }
}

const checkSignupBody = [
    body("email")
    .isEmail().normalizeEmail({ all_lowercase: true }),
    body("username")
    .not().isEmpty()
    .trim().escape()
    .isLength({ min: 3, max: 15 }),
    body("password")
    .not().isEmpty()
    .trim().escape()
    .isLength({ min: 6, max: 30 }),
];

const checkLoginBody = [
    body("username")
    .not().isEmpty(),
    body("password")
    .not().isEmpty()
];

const validateRequestBody = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }
}

const loginUser = async(req, res, next) => {
    // validate request body
    validateRequestBody(req, res)

    const username = req.body.username;
    const password = req.body.password;

    // check if user exists
    let user = null;
    try {
        result = await pool.query("SELECT user_id, password_hash, admintype, usertype FROM users WHERE username = $1", [username]);
        user = result.rows[0]
    } catch (err) {
        return res.status(500).json({ "error": err.message });
    }
    if (!user) {
        return res.status(401).json({ error: "User does not exist" })
    }

    // check if password is valid
    const match = await bcrypt.compare(password, user.password_hash)
    if (match) {
        let token = createUserToken(user)
        return res.status(200).json({ token })
    } else {
        return res.status(401).json({ error: "Incorrect Password" })
    }
}

// create new user
const signupUser = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }

    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const userType = 1;
    const adminType = 0;

    // Check if a user with the username or email already exists
    let existingUser = null;
    try {
        existingUser = await pool.query("SELECT * FROM users WHERE username = $1 or email = $2", [username, email]);
    } catch (err) {
        return res.status(500).json({ "error": err.message });
    }

    // If the user already exists, then return an error.
    if (existingUser.rows[0]) {
        return res.status(422).send({ error: 'This username or email is already taken. Please check and try again.' });
    }

    // If a user with username does NOT exist, create and save user record
    let newUser = null;
    let hashedPassword = null;
    try {
        hashedPassword = await bcrypt.hash(password, 10).then(hash => { return hash })
        newUser = await pool.query("INSERT INTO users (email, username, password_hash, usertype, admintype) VALUES ($1, $2, $3, $4, $5) RETURNING *", [email, username, hashedPassword, userType, adminType]);
    } catch (err) {
        return res.status(500).send({ error: err.message });
    }

    // Use CreateUserToken function at the top of this file. Create a User JWT token and send it back as a response.
    return res.json({ token: createUserToken(newUser.rows[0]) });
};

// return all users
const getAllUsers = async(req, res) => {
    const users = await pool.query("SELECT user_id, email, username, usertype, admintype FROM users");
    res.json(users.rows);
};

// return one users
const getOneUser = async(req, res) => {
    res.json({ todo: "Implement a getOneUser query" });
};

// update user
const updateUser = async(req, res) => {
    res.json({ todo: "Implement an updateUser query" });
};

module.exports = {
    checkSignupBody,
    isValidUser,
    signupUser,
    getAllUsers,
    getOneUser,
    updateUser,
    checkLoginBody,
    loginUser,
};