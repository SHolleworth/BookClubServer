const mysql = require('mysql')
const fs = require('fs')

import { Pool } from '../../node_modules/@types/mysql'

let password = ''

let pool: Pool | null = null

const configureConnectionPool = () => {
    fs.readFile('../DBPassword.txt', (err: Error , data: string)  => {

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