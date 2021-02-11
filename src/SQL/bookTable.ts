import { BookObject, ShelfObject } from "../../../types"
import { Pool } from "../../node_modules/@types/mysql/"

const { getConnection } = require('./connection')

const insertBook = async (book: BookObject, pool: Pool) => {
    
    return new Promise((resolve, reject) => {
        
        //Request pool from connection if none supplied
        if (!pool) pool = getConnection()

        pool.getConnection((err, connection) => {

            if (err) return reject(err)
            
            connection.beginTransaction((error) => {

                if (error) return reject(error)



                connection.query('SELECT * FROM Book WHERE id = ?', [book.id], (error, results) => {
                
                    if (error) {

                        return connection.rollback(() => {
                            
                            return reject(error)

                        }) 

                    }
    
                    if(results.length) return reject(`Error, book with id ${book.id} already in database.`)


    
                    connection.query('INSERT INTO Book (volumeId, shelfId) VALUES (?, ?)', [book.volumeId, book.shelfId], (error, results) => {
                    
                        if (error) {

                            return connection.rollback(() => {
                                
                                return reject("Error adding book: " + error)
    
                            }) 
    
                        } 
            
                        const bookInfo = { ...book.info, authors: book.info.authors.toString(), bookId: results.insertId } 

                        
            
                        connection.query('INSERT INTO BookInfo SET ?', bookInfo, (error, results) => {
                            
                            if (error) {

                                return connection.rollback(() => {
                                    
                                    return reject("Error adding book info: " + error)
        
                                }) 
        
                            }  
                
                            console.log("Inserted book info.")
                
                            connection.commit((error) => {
                                
                                if (error) {

                                    return connection.rollback(() => {
                                        
                                        return reject("Error commiting book insertion: " + error)
            
                                    }) 
            
                                }
                                
                                return resolve(results)

                            })
                        })
                    })
                })
            })
        })
    })
}

const retrieveBooksOfShelves = async (shelves: ShelfObject[], connection: Pool) => {
    
    return new Promise((resolve, reject) => {
        
        //Request connection from pool if none supplied
        if (!connection) connection = getConnection()

        let books: BookObject[] = []

        if(!shelves.length) {

            console.log("No books to retrieve.")

            return resolve(books)
        }

        if(shelves.length === 1) {

            connection.query('SELECT * FROM Book WHERE shelfId = ?', [shelves[0].id], (error, results) => {
                
                if (error) return reject(`Error loading books for shelf ${shelves[0].name}: ${error}`)

                console.log("Retrieved books for single shelf.")

                books = results

                retrieveAndAppendBookInfo(books, connection)
                .then(books => {

                    return resolve(books)
    
                })
                .catch(error => {
                    
                    return reject(error)
    
                })
            })

        }

        const shelfIds: number[] = shelves.map(shelf => shelf.id)

        connection.query('SELECT * FROM Book WHERE shelfId IN (?)', [shelfIds], (error, results) => {
            
            if (error) return reject(`Error loading books: ${error}.`)

            console.log("Retrieved books.")

            books = results

            if(books.length) {
                retrieveAndAppendBookInfo(books, connection)
                .then(booksWithInfo => {

                    return resolve(booksWithInfo)

                })
                .catch(error => {
                    
                    return reject(error)

                })
            }
            else {

                return resolve(books)

            }
        })

    })

}

const retrieveAndAppendBookInfo = async (books: BookObject[], connection: Pool) => {

    return new Promise((resolve, reject) => {
        
        //Request connection from pool if none supplied
        if (!connection) connection = getConnection()

        const bookIds: (number | null)[] = books.map(book => book.id)

        connection.query('SELECT * FROM BookInfo WHERE bookId IN (?)', [bookIds], (error, results) => {
            
            if (error) return reject("Error loading book data: " + error)

            console.log("Retrieved book info.")

            return resolve(books.map((book, i) => 
                {

                    book.info = results[i]

                    if(results[i].authors.includes(',')) {

                        book.info.authors = results[i].authors.split(',')

                    }
                    else {

                        book.info.authors = [results[i].authors]
                    }


                    return book

                }))

        })

    })
    
}

module.exports = { insertBook, retrieveBooksOfShelves }