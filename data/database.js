// All the packages needed for database.js
require("dotenv").config();
const pg = require("pg");
const fs = require("fs");
const path = require("path");
const caCertPath = path.join(__dirname,"..","certs","global-bundle.pem");
const caCert = fs.readFileSync(caCertPath);

// EVERYTHING IN THE DATABASE.JS FILE

const client = new pg.Client ({
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        ca: caCert,
    },
});

// client.connect();

client.connect()
    .then(() => {
        console.log("Connected to the database");
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error.message);
        process.exit(1);
    });

client.query("SELECT * FROM posts", (err,res)=>{
    if(!err){
        console.log(res.rows);
    } else {
        console.log(err.message);
    }
});

module.exports = client;