require("dotenv").config();
const pool = require("../db/config");

const getUsers = async(req, res) => {
    const users = await pool.query('SELECT * FROM users');;
    res.json(users.rows);
}

module.exports = {
    getUsers
}