const { getConnection } = require('./connection')
const bcrypt = require('bcrypt')

const SALT_ROUNDS = 10

const insertUser = async (user) => {

    return new Promise((resolve, reject) => {

        const connection = getConnection()

        if (connection) {
            
            const { username, password } = user

            connection.query(`SELECT * FROM User WHERE username = ?`, [username], (error, result, fields) => {

                if (error) return reject("Error searching for existing user: " + error)

                if (result.length) return resolve("That username already exists.")

                hashPassword(password)
                    .then(({ hash, salt }) => {

                        return insertUserSQL(connection, username, hash, salt)

                    })
                    .then(result => {

                        console.log(result)

                        return resolve(result)

                    })
                    .catch(error => {

                        return reject("Error hashing password: " + error)
                        
                    })
            })
        }
        else {

            return reject("Error during user insertion, not connected to Database.")

        }
    })
}

const retrieveUser = async (userToRetrieve, connection) => {
    
    return new Promise((resolve, reject) => {
        
        if (!connection) connection = getConnection()

        if(connection) {

            connection.query('SELECT * FROM User WHERE username = ?', [userToRetrieve.username], (error, results) => {
                
                if (error) return reject(`Error retrieving user ${userToRetrieve.username} data: ` + error)

                if (results.length > 1) return reject(`Error, more than 1 user with name ${userToRetrieve.username} found.`)

                const hash = results[0].password

                bcrypt.compare(userToRetrieve.password, hash, (err, result) => {
                    
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
        else {

            return reject("Error during user insertion, not connected to Database.")

        }

    })


}

const hashPassword = async (password) => {

    return new Promise ((resolve, reject) => {
        
        bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {

            if (err) return reject("Error generating salt: " + err)

            bcrypt.hash(password, salt, (err, hash) => {

                if (err) return reject("Error hashing password: " + err)

                return resolve({ hash, salt })

            })
        })

    })
}

const insertUserSQL = async (connection, username, hashedPassword, salt) => {

    return new Promise((resolve, reject) => {

        user = { username, salt }

        user.password = hashedPassword
    
        connection.query("INSERT INTO User SET ?", user, (error) => {
    
            if (error) return reject("Error inserting user into database: " + error)

            return resolve(`User ${username} added to database.`)
        
        })

    })

}

module.exports = { insertUser, retrieveUser }