const mysql = require('mysql')
const fs = require('fs')

import { Pool } from 'mysql'

let pool: Pool | null = null

export const configureConnectionPool = () => {

    const password = process.env.DB_PASSWORD
        
    pool = mysql.createPool({
        connectionLimit: 100,
        host : 'localhost',
        user: 'root',
        password, 
        database: 'bookclub'
    })

    console.log("Connected to database.")
    
}

export const getPool = () => {

    return pool
    
}

module.exports = { configureConnectionPool, getPool }