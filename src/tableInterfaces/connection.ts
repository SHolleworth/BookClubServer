const mysql = require('mysql')
import RLPromise from '../utility/readlinePromise' 
import { Pool } from 'mysql'

let pool: Pool | null = null

export const configureConnectionPool = async() => {
    
    return new Promise(async (resolve, reject) => {
         
        try {

            let password = '' , user = '', database = ''

            const rlp = new (RLPromise as any)
        
            database = await rlp.question("Enter MySQL database name: ")

            user = await rlp.question("Enter MySQL database user: ")

            password = await rlp.question("Enter MySQL database password: ")
        
            pool = mysql.createPool({
                connectionLimit: 100,
                host : 'localhost',
                user,
                password,
                database
            })
        
            console.log("Connected to database.")

            return resolve(1)

        }
        catch (error) {

            return reject("Error establishing database connection " + error)

        } 
        
    });
}

export const getPool = () => {

    return pool
    
}

module.exports = { configureConnectionPool, getPool }