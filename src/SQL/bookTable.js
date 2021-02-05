const { getConnection } = require('./connection')

const insertBook = async (book, connection) => {
    
    return new Promise((resolve, reject) => {
        
        //Request connection from pool if none supplied
        if (!connection) connection = getConnection()

        connection.query('SELECT * FROM Book WHERE id = ?', [book.id], (error, results) => {
            
            if (error) return reject(error)

            if(results.length) return reject(`Error, book with id ${book.id} already in database.`)

        })

        const { title, authors, description, mainCategory, thumbnail } = book.info
        

        connection.query(
            'INSERT INTO Book \
            (title, authors,  description, mainCategory, thumbnail, volume_id, shelf_id) \
            VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [title, authors, description, mainCategory, thumbnail, book.volume_id, book.shelf_id], 
        (error, results) => {
            
            if (error) return reject(console.error(error))

            console.log("Inserted book: " + book.info.title)

            return resolve(results)

        })

    })

}

const retrieveBooksOfShelves = async (shelves, connection) => {
    
    return new Promise((resolve, reject) => {
        
        //Request connection from pool if none supplied
        if (!connection) connection = getConnection()

        if(!shelves.length) {

            console.log("Retrieved books.")
            console.log([])

            return resolve([])

        }

        if(shelves.length === 1) {

            connection.query('SELECT * FROM Book WHERE shelf_id = ?', [shelves[0].id], (error, results) => {
                
                if (error) return reject(`Error loading books for shelf ${shelves[0].name}: ${error}`)

                console.log("Retrieved books.")
                console.log(results)

                return resolve(results)

            })

        }

        shelfIds = shelves.map(shelf => shelf.id)

        connection.query('SELECT * FROM Book WHERE shelf_id IN (?)', shelfIds, (error, results) => {
            
            if (error) return reject(`Error loading books: ${error}.`)

            console.log("Retrieved books.")
            console.log(results)

            return resolve(results)

        } )

    })

}

module.exports = { insertBook, retrieveBooksOfShelves }