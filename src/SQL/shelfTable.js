const { getConnection } = require('./connection')

const insertShelf = async (shelf, connection) => {
    
    return new Promise((resolve, reject) => {
        
        console.log("Inserting shelf " + shelf.name)

        //If no connection supplied, request one from the pool
        if(!connection) connection = getConnection()

        connection.query('SELECT * FROM Shelf WHERE id = ?', [shelf.id], (error, results) => {
            
            if (error) return reject(error)

            if(results.length) return reject(`Error, shelf with id ${shelf.id} already in database.`)

        })

        connection.query('INSERT INTO Shelf (name, user_id) VALUES (?, ?)', 
            [shelf.name, shelf.userId], (error, results) => {
            
            if (error) return reject(console.error(error))

            console.log("Inserted shelf: " + shelf.name)

            return resolve(results)

        })

    })

}

const retrieveShelvesOfUser = async (user, connection) => {
    
    return new Promise((resolve, reject) => {

        //If no connection supplied, request one from the pool
        if(!connection) connection = getConnection()

        connection.query('SELECT * FROM Shelf WHERE user_id = ?', [user.id], (error, results) => {
            
            if (error) return reject(error)

            console.log("Retrieved shelves." + results)

            console.log(results)

            return resolve(results)

        })

    })

}

module.exports = { insertShelf, retrieveShelvesOfUser }