const bcrypt = require('bcrypt')

import { UserData, UserLoginObject, UserObject, UserRegisterObject } from '../../../types'
import ConnectionWrapper, { Connection } from '../database'

const SALT_ROUNDS = 10

const insertUser = async (user: UserRegisterObject) => {

    return new Promise(async (resolve, reject) => {

        const connection = new (ConnectionWrapper as any)()

        const { username, password } = user

        try {

            await connection.getPoolConnection()

            const user = await connection.query(`SELECT * FROM User WHERE username = ?`, [username])

            if (user.length) return resolve("That username already exists.")

            const { hash, salt } = await hashPassword(password)

            const message = await insertUserSQL(connection, username, hash, salt)

            connection.release()

            return resolve(message)

        }
        catch (error) {

            connection.release()

            return reject(error)

        }            
 
    })
}

const retrieveUser = async (userToRetrieve: UserLoginObject): Promise<UserObject | string> => {
    
    return new Promise(async (resolve, reject) => {
        
        const connection = new (ConnectionWrapper as any)()

        try {

            await connection.getPoolConnection()

            const existingUsers = await connection.query('SELECT * FROM User WHERE username = ?', [userToRetrieve.username])

            if (existingUsers.length > 1) {
                
                connection.release()

                return reject(`Error, more than 1 user with name ${userToRetrieve.username} found.`)

            }

            const hash = existingUsers[0].password

            bcrypt.compare(userToRetrieve.password, hash, (err: Error, result: boolean) => {
                    
                if (err) {
                    
                    connection.release()
                    
                    return reject(`Error comparing passwords: ` + err)

                }

                if(result) {

                    const user = { id: existingUsers[0].id, username: existingUsers[0].username }

                    return resolve(user)

                }
                else {

                    connection.release()

                    return resolve("Incorrect Password")

                }

            })

        }
        catch (error) {

            connection.release()

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

const insertUserSQL = async (connection: Connection, username: string, hashedPassword: string, salt: string): Promise<string> => {

    return new Promise(async (resolve, reject) => {

        let user = { username, salt, password: "" }

        user.password = hashedPassword
    
        try {
            
            await connection.query("INSERT INTO User SET ?", [user])

            connection.release()

            return resolve(`User ${username} added to database.`)

        }
        catch (error) {

            connection.release()

            return reject(error)
            
        }

    })

}

export const convertToUserObject = (userData: UserData) => {
    
    return { id: userData.id, username: userData.username }

}

module.exports = { insertUser, retrieveUser }