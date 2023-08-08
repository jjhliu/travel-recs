const mysql = require('mysql2/promise');

const pool= mysql.createPool({
    host:'localhost',
    database: 'travel',
    user:'root',
    password: 'travelers',
});

module.exports= pool;