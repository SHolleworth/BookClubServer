import { ShelfObject, UserObject } from '../../../types'
import { Connection } from '../database'

const insertShelf = async (shelf: ShelfObject, connection: Connection) => {
    
    return new Promise(async (resolve, reject) => {
        
        console.log("Inserting shelf " + shelf.name)

        try {

            const existingShelves = await connection.query('SELECT * FROM Shelf WHERE id = ?', [shelf.id])

            if(existingShelves.length) return reject(`Error, shelf with id ${shelf.id} already in database.`)

            await connection.query('INSERT INTO Shelf (name, userId) VALUES (?, ?)', [shelf.name, shelf.userId])   

            const message = "Successfully added shelf to database."

            console.log(message)
            
            return resolve(message)

        }
        catch (error) {

            console.error(error)

            return reject(error)

        }

    })

}

const retrieveShelvesOfUser = async (user: UserObject, connection: Connection): Promise<ShelfObject[]> => {
    
    return new Promise(async (resolve, reject) => {       

        try {         

            const shelves = await connection.query('SELECT * FROM Shelf WHERE userId = ?', [user.id])

            const message = `Retrieved ${shelves.length} shelves of user ${user.username}.`

            console.log(message)

            return resolve(shelves)

        }
        catch (error) {   

            console.error(error)

            return reject(error)

        }

    })

}

module.exports = { insertShelf, retrieveShelvesOfUser }