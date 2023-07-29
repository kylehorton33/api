require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const pool = require("../db/config");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function createUserToken(user) {
    const timestamp = new Date().getTime();
    const payload = { sub: user.user_id, iat: timestamp, is_admin: user.is_admin };
    return jwt.sign(payload, process.env.JWT_SECRET);
}

const isValidUser = (req, res, next) => {
    let token, decoded;
    try {
        token = req.headers.authorization.split(' ')[1];
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
        return res.status(401).send({ error: "You must be logged in for this action " })
    }
    console.log(new Date().getTime() - decoded.iat) // check age of token
    next()
}

const isAdminUser = (req, res, next) => {
    let token, decoded;
    try {
        token = req.headers.authorization.split(' ')[1];
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
        return res.status(401).send({ error: "You must be logged in for this action " })
    }
    console.log(new Date().getTime() - decoded.iat) // check age of token
    if (decoded.admintype) {
        next()
    } else {
        return res.status(401).send({ error: "You must be an admin for this action " })
    }
}

const checkSignupBody = [
    body("email")
    .isEmail().normalizeEmail({ all_lowercase: true }),
    body("password")
    .not().isEmpty()
    .trim().escape()
    .isLength({ min: 6, max: 30 }),
];

const checkLoginBody = [
    body("email")
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

    const email = req.body.email;
    const password = req.body.password;

    // check if user exists
    let user = null;
    try {
        result = await pool.query("SELECT user_id, password_hash, is_admin FROM app_user WHERE email = $1", [email]);
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
    const password = req.body.password;

    // Check if a user with the username or email already exists
    let existingUser = null;
    try {
        existingUser = await pool.query("SELECT * FROM app_user WHERE email = $1", [email]);
    } catch (err) {
        return res.status(500).json({ "error": err.message });
    }

    // If the user already exists, then return an error.
    if (existingUser.rows[0]) {
        return res.status(422).send({ error: 'This email is already taken. Please check and try again.' });
    }

    // If a user with email does NOT exist, create and save user record
    let newUser = null;
    let hashedPassword = null;
    try {
        hashedPassword = await bcrypt.hash(password, 10).then(hash => { return hash })
        newUser = await pool.query("INSERT INTO app_user (email, password_hash) VALUES ($1, $2) RETURNING *", [email, hashedPassword]);
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
    isAdminUser,
    signupUser,
    getAllUsers,
    getOneUser,
    updateUser,
    checkLoginBody,
    loginUser,
};