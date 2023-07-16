require("dotenv").config();
const pool = require("../db/config");

const getUsers = async(req, res) => {
    const users = await pool.query('SELECT user_id, email, username, usertype, admintype FROM users');;
    res.json(users.rows);
}

module.exports = {
    getUsers
}