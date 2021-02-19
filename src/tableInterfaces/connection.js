"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = exports.configureConnectionPool = void 0;
var mysql = require('mysql');
var fs = require('fs');
var password = '';
var pool = null;
exports.configureConnectionPool = function () {
    fs.readFile('../DBPassword.txt', function (err, data) {
        if (err)
            throw err;
        password = data;
        pool = mysql.createPool({
            connectionLimit: 100,
            host: 'localhost',
            user: 'root',
            password: password,
            database: 'bookclub'
        });
        console.log("Connected to database.");
    });
};
exports.getPool = function () {
    return pool;
};
module.exports = { configureConnectionPool: exports.configureConnectionPool, getPool: exports.getPool };
