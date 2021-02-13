import { ShelfObject, UserObject } from '../../../types'
import ConnectionWrapper from '../database'

const insertShelf = async (shelf: ShelfObject) => {
    
    return new Promise(async (resolve, reject) => {
        
        console.log("Inserting shelf " + shelf.name)

        const connection = new (ConnectionWrapper as any)()

        try {

            await connection.getPoolConnection()

            const existingShelves = await connection.query('SELECT * FROM Shelf WHERE id = ?', [shelf.id])

            if(existingShelves.length) return reject(`Error, shelf with id ${shelf.id} already in database.`)

            await connection.query('INSERT INTO Shelf (name, userId) VALUES (?, ?)', [shelf.name, shelf.userId])

            connection.release()
            
            return resolve("Successfully added shelf to database.")

        }
        catch (error) {

            connection.release()

            return reject(error)

        }

    })

}

const retrieveShelvesOfUser = async (user: UserObject): Promise<ShelfObject[]> => {
    
    return new Promise(async (resolve, reject) => {

        const connection = new (ConnectionWrapper as any)()

        try {

            await connection.getPoolConnection()

            const shelves = await connection.query('SELECT * FROM Shelf WHERE userId = ?', [user.id])

            connection.release()

            return resolve(shelves)


        }
        catch (error) {

            connection.release()

            return reject(error)

        }

    })

}

module.exports = { insertShelf, retrieveShelvesOfUser }