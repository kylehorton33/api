require("dotenv").config();
const pool = require("../db/config");

// create new user
const createUser = async(req, res) => {
    res.json({ todo: "Implement a createUser query" })
}

// return all users
const getAllUsers = async(req, res) => {
    const users = await pool.query('SELECT user_id, email, username, usertype, admintype FROM users');;
    res.json(users.rows);
}

// return one users
const getOneUser = async(req, res) => {
    res.json({ todo: "Implement a getOneUser query" })
}

// update user
const updateUser = async(req, res) => {
    res.json({ todo: "Implement an updateUser query" })
}

module.exports = {
    createUser,
    getAllUsers,
    getOneUser,
    updateUser,
}