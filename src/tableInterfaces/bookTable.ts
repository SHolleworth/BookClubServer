import { BookObject, ShelfObject } from "../../../types"
import {  Pool, PoolConnection } from "mysql"
import ConnectionWrapper, { Connection } from '../database'
import { configureConnectionPool } from "./connection"

const { getPool } = require('./connection')

const insertBook = async (book: BookObject, pool: Pool) => {
    
    return new Promise(async (resolve, reject) => {
        
        //Request pool from connection if none supplied
        if (!pool) pool = getPool()

        if(!book.info.authors) {

            book.info.authors = [""]

        }

        const connection: Connection = new (ConnectionWrapper as any)()

        try {

            await connection.getPoolConnection()

            await connection.beginTransaction()

            const existingBooks = await connection.query('SELECT * FROM Book WHERE id = ?', [book.id]) 
            
            if(existingBooks.length) return reject(`Error, book with id ${book.id} already in database.`)

            const insertBookResult = await connection.query('INSERT INTO Book (volumeId, shelfId) VALUES (?, ?)', [book.volumeId, book.shelfId])

            const bookInfo = { ...book.info, authors: book.info.authors.toString(), bookId: insertBookResult.insertId }

            await connection.query('INSERT INTO BookInfo SET ?', [bookInfo])

            await connection.commit()

            connection.release()

            return resolve("Added book and info to database.")

        }
        catch (error) {

            try {

                await connection.rollback()

                connection.release()

                return reject(error)

            }
            catch (error) {

                return reject(error)

            }
        }

    })

}

const retrieveBooksOfShelves = async (shelves: ShelfObject[], connection: Pool) => {
    
    return new Promise((resolve, reject) => {
        
        //Request connection from pool if none supplied
        if (!connection) connection = getPool()

        let books: BookObject[] = []

        if(!shelves.length) {

            console.log("No books to retrieve.")

            return resolve(books)
        }

        if(shelves.length === 1) {

            try {

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
            catch (error) {

                console.error(error)

            }            

        }

        const shelfIds: number[] = shelves.map(shelf => shelf.id)

        try {

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

        }
        catch (error) {

            console.error(error)

        }


    })

}

const retrieveAndAppendBookInfo = async (books: BookObject[], connection: Pool) => {

    return new Promise((resolve, reject) => {
        
        //Request connection from pool if none supplied
        if (!connection) connection = getPool()

        const bookIds: (number | null)[] = books.map(book => book.id)

        try {
    
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

        }
        catch (error) {

            console.error(error)

        }

    })
    
}

module.exports = { insertBook, retrieveBooksOfShelves }