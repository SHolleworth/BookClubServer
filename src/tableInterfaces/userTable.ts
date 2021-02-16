const bcrypt = require('bcrypt')

import { UserData, UserLoginObject, UserObject, UserRegisterObject } from '../../../types'
import { Connection } from '../database'

const SALT_ROUNDS = 10

const updateSocketIdOfUser = async (userId: number, socketId: string, connection: Connection) => {

    console.log(`Adding socket ID: ${socketId} to user ID: ${userId}.`)

    return new Promise(async (resolve, reject) => {
        
        try {

            await connection.query("UPDATE user SET socketId = ? WHERE id = ?", [socketId, userId])

            const message = "Successfully updated socket ID. New socket ID: " + socketId

            console.log(message)

            return resolve(message)

        }  
        catch (error) {

            console.error(error)

            return reject(error)

        }

    });
    
}

const insertUser = async (user: UserRegisterObject, connection: Connection) => {

    console.log("Attempting to insert user: " + user.username)

    return new Promise(async (resolve, reject) => {

        const { username, password } = user

        try {           

            const user = await connection.query(`SELECT * FROM User WHERE username = ?`, [username])

            if (user.length) {

                return resolve("That username already exists.")

            } 

            const { hash, salt } = await hashPassword(password)

            const message = await insertUserSQL(username, hash, salt, connection)         

            console.log("Inserted user: " + user.username)

            return resolve(message)

        }
        catch (error) {     

            console.error(error)

            return reject(error)

        }            
 
    })
}

const retrieveUser = async (userToRetrieve: UserLoginObject, connection: Connection): Promise<UserObject | string> => {

    console.log("Attempting to retrieve user: " + userToRetrieve.username)
    
    return new Promise(async (resolve, reject) => {
        
        try {

            const existingUsers = await connection.query('SELECT * FROM User WHERE username = ?', [userToRetrieve.username])

            if (existingUsers.length > 1) {               

                const error = `Error, more than 1 user with name ${userToRetrieve.username} found.`

                console.error(error)

                return reject(error)

            }

            const hash = existingUsers[0].password

            bcrypt.compare(userToRetrieve.password, hash, (err: Error, result: boolean) => {
                    
                if (err) {
                    
                    const error = `Error comparing passwords: ` + err

                    console.error(error)
                    
                    return reject(error)

                }

                if(result) {

                    const user = { id: existingUsers[0].id, username: existingUsers[0].username }                    

                    console.log("Retrieved user: " + user.username)

                    return resolve(user)

                }
                else {                    

                    const error = "Incorrect Password"

                    console.error(error)

                    return resolve(error)

                }

            })

        }
        catch (error) {            

            console.error(error)

            return reject(error)

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

const insertUserSQL = async (username: string, hashedPassword: string, salt: string, connection: Connection): Promise<string> => {

    return new Promise(async (resolve, reject) => {

        let user = { username, salt, password: "" }

        user.password = hashedPassword
    
        try {
            
            await connection.query("INSERT INTO User SET ?", [user])

            const message = `User ${username} added to database.`

            console.log(message)

            return resolve(message)

        }
        catch (error) {

            console.error(error)

            return reject(error)
            
        }

    })

}

export const convertToUserObject = (userData: UserData) => {
    
    return { id: userData.id, username: userData.username }

}

module.exports = { insertUser, retrieveUser, updateSocketIdOfUser }