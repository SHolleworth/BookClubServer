const mysql = require('mysql')
const fs = require('fs')

let password = ''

let pool = null

const configureConnectionPool = () => {
    fs.readFile('../../DBPassword.txt', (err, data)  => {

        if (err) throw err

        password = data
            
        pool = mysql.createPool({
            connectionLimit: 10,
            host : 'localhost',
            user: 'root',
            password, 
            database: 'bookclub'
        })

        console.log("Connected to database.")
    })
}

const getConnection = () => {
    return pool
}

module.exports = { configureConnectionPool, getConnection }