const { getPool } = require('./connection')
import { ShelfObject, UserObject } from '../../../types'
import { Pool } from 'mysql' 

const insertShelf = async (shelf: ShelfObject, connection: Pool) => {
    
    return new Promise((resolve, reject) => {
        
        console.log("Inserting shelf " + shelf.name)

        //If no connection supplied, request one from the pool
        if(!connection) connection = getPool()

        try {

            connection.query('SELECT * FROM Shelf WHERE id = ?', [shelf.id], (error, results) => {
            
                if (error) return reject(error)
    
                if(results.length) return reject(`Error, shelf with id ${shelf.id} already in database.`)


                connection.query('INSERT INTO Shelf (name, userId) VALUES (?, ?)', 
                [shelf.name, shelf.userId], (error, results) => {
                    
                    if (error) return reject(console.error(error))
        
                    console.log("Inserted shelf: " + shelf.name)
        
                    return resolve(results)
    
                })
    
            })
        }
        catch (error) {

            console.error(error)

        }

    })

}

const retrieveShelvesOfUser = async (user: UserObject, connection: Pool): Promise<ShelfObject[]> => {
    
    return new Promise((resolve, reject) => {

        //If no connection supplied, request one from the pool
        if(!connection) connection = getPool()

        try {

            connection.query('SELECT * FROM Shelf WHERE userId = ?', [user.id], (error, results) => {
            
                if (error) return reject("Error loading shelves: " + error)
    
                console.log("Retrieved shelves." + results)
    
                console.log({ results })
    
                return resolve(results)
    
            })

        }
        catch (error) {

            console.error(error)

        }

    })

}

module.exports = { insertShelf, retrieveShelvesOfUser }