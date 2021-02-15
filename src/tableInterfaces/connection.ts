const mysql = require('mysql')
const fs = require('fs')

import { Pool } from 'mysql'

let password = ''

let pool: Pool | null = null

export const configureConnectionPool = () => {
    fs.readFile('../DBPassword.txt', (err: Error , data: string)  => {

        if (err) throw err

        password = data
            
        pool = mysql.createPool({
            connectionLimit: 2,
            host : 'localhost',
            user: 'root',
            password, 
            database: 'bookclub'
        })

        console.log("Connected to database.")
    })
}

export const getPool = () => {

    return pool
    
}

module.exports = { configureConnectionPool, getPool }