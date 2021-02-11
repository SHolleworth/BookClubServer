"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require('mysql');
var fs = require('fs');
var password = '';
var pool = null;
var configureConnectionPool = function () {
    fs.readFile('../DBPassword.txt', function (err, data) {
        if (err)
            throw err;
        password = data;
        pool = mysql.createPool({
            connectionLimit: 10,
            host: 'localhost',
            user: 'root',
            password: password,
            database: 'bookclub'
        });
        console.log("Connected to database.");
    });
};
var getConnection = function () {
    return pool;
};
module.exports = { configureConnectionPool: configureConnectionPool, getConnection: getConnection };
