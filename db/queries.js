require("dotenv").config();
const pool = require("./config");

function getUsers() {
    return pool.query('SELECT * FROM users');
}

module.exports = {
    getUsers
}