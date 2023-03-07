const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "13.125.198.179",
    user: "ssafy",
    password:"ssafy1234",
    database:"order_system",
    waitForConnections:true,
    connectionLimit:100,
    queueLimit:0
})

module.exports = pool;