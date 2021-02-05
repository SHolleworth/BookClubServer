const express = require('express')
const app = express()
const server = require('http').createServer(app)
const port = 3000
const io = require('socket.io')(server)
const fs = require('fs')

const { searchGoogleBooksByTitle } = require('./requestHandler')
const { insertBook, retrieveBooksOfShelves } = require('./SQL/bookTable')
const { configureConnectionPool, getConnection }= require('./SQL/connection')
const { insertShelf, retrieveShelvesOfUser } = require('./SQL/shelfTable')
const { insertUser, retrieveUser } = require('./SQL/userTable')

fs.readFile('../../apiKey.txt', 'utf8', (err, data) => {

    if (err) throw err

    const apiKey = data

    console.log("API key acquired.")

    server.listen(port, () => {

        console.log("Listening on port " + port)

    });

    configureConnectionPool()

    io.on('connection' , socket => {

        console.log("Client connected")

        //Search bar query from client
        socket.on('search_google_books_by_title', query => {

            searchGoogleBooksByTitle(query, apiKey)
            .then(response => {

                socket.emit('google_books_by_title_response', response)

            })
            .catch(error => {

                socket.emit('google_books_by_title_error', error)

            })
        })


        //New user registration
        socket.on('register_new_user', user => {

            insertUser(user)
            .then(response => {

                socket.emit('register_new_user_response', response)

            })
            .catch(error => {

                socket.emit('register_new_user_error', error)

            })

        })

        //User login request
        socket.on('login_as_user', async (user) =>{

            userData = {}

            const connection = getConnection()

            try {
                userData.user = await retrieveUser(user, connection)

                userData.shelves = await retrieveShelvesOfUser(userData.user, connection)

                userData.books = await retrieveBooksOfShelves(userData.shelves, connection)
                
                console.log("User logging on: " + userData.user.username)

                socket.emit('login_as_user_response', userData)
            }
            catch(error) {

                socket.emit('login_as_user_error', error)

            }
        })

        //New shelf to add to database
        socket.on('post_new_shelf' , async (shelf) => {

            insertShelf(shelf)
            .then(results => {
                
                socket.emit('post_new_shelf_response', results)

            })
            .catch(error => {

                socket.emit('post_new_shelf_error', error)

            })

        })


        //New book to add to database
        socket.on('post_new_book', async (book) =>{

            insertBook(book)
            .then(results => {
                
                socket.emit('post_new_book_response', results)

            })
            .catch(error => {
                
                socket.emit('post_new_book_error', error)

            })

        })
    })
})
