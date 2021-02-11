const { getConnection } = require('./connection')
const bcrypt = require('bcrypt')

import { UserLoginObject, UserObject, UserRegisterObject } from '../../../types'
import { Pool } from '../../node_modules/@types/mysql'

const SALT_ROUNDS = 10

const insertUser = async (user: UserRegisterObject, connection: Pool) => {

    return new Promise((resolve, reject) => {

        if(!connection) connection = getConnection()

        if (connection) {
            
            const { username, password } = user

            try {
            
                connection.query(`SELECT * FROM User WHERE username = ?`, [username], (error, result, fields) => {

                    if (error) return reject("Error searching for existing user: " + error)
    
                    if (result.length) return resolve("That username already exists.")
    
                    hashPassword(password)
                        .then(({ hash, salt }) => {
    
                            return insertUserSQL(connection, username, hash, salt)
    
                        })
                        .then(result => {
        
                            return resolve(result)
    
                        })
                        .catch(error => {
    
                            return reject("Error hashing password: " + error)
                            
                        })
                })

            }
            catch (error) {

                console.log(`SQL query error ${error.code}.`)

            }            
        }
        else {

            return reject("Error during user insertion, not connected to Database.")

        }
    })
}

const retrieveUser = async (userToRetrieve: UserLoginObject, connection: Pool): Promise<UserObject> => {
    
    return new Promise((resolve, reject) => {
        
        if (!connection) connection = getConnection()

        if(connection) {

            try {

                connection.query('SELECT * FROM User WHERE username = ?', [userToRetrieve.username], (error, results) => {
                
                    if (error) return reject(`Error retrieving user ${userToRetrieve.username} data: ` + error)
    
                    if (results.length > 1) return reject(`Error, more than 1 user with name ${userToRetrieve.username} found.`)
    
                    const hash = results[0].password
    
                    bcrypt.compare(userToRetrieve.password, hash, (err: Error, result: boolean) => {
                        
                        if (err) return reject(`Error comparing passwords: ` + err)
    
                        if(result) {
    
                            const user = { id: results[0].id, username: results[0].username }
    
                            console.log("Retrieved user.")
    
                            console.log({ user })
    
                            return resolve(user)
    
                        }
    
                    })
                })

            }
            catch (error) {

                console.error(error)

            }
        }
        else {

            return reject("Error during user insertion, not connected to Database.")

        }

    })


}

const hashPassword = async (password: string): Promise<{ hash: string, salt: string}>=> {

    return new Promise ((resolve, reject) => {
        
        bcrypt.genSalt(SALT_ROUNDS, (err: Error, salt: string) => {

            if (err) return reject("Error generating salt: " + err)

            bcrypt.hash(password, salt, (err: Error, hash: string) => {

                if (err) return reject("Error hashing password: " + err)

                return resolve({ hash, salt })

            })
        })

    })
}

const insertUserSQL = async (connection: Pool, username: string, hashedPassword: string, salt: string): Promise<string> => {

    return new Promise((resolve, reject) => {

        let user = { username, salt, password: "" }

        user.password = hashedPassword
    
        try {

            connection.query("INSERT INTO User SET ?", user, (error) => {
    
                if (error) return reject("Error inserting user into database: " + error)
    
                return resolve(`User ${username} added to database.`)
            
            })

        }
        catch (error) {

            console.error(error)
            
        }

    })

}

module.exports = { insertUser, retrieveUser }