import { Socket } from "socket.io"

const express = require('express')
const app = express()
const server = require('http').createServer(app)
const port = 3000
const io = require('socket.io')(server)
const fs = require('fs')

const { searchGoogleBooksByTitle } = require('./requestHandler')
const { insertBook, retrieveBooksOfShelves } = require('./tableInterfaces/bookTable')
const { configureConnectionPool, getPool }= require('./tableInterfaces/connection')
const { insertShelf, retrieveShelvesOfUser } = require('./tableInterfaces/shelfTable')
const { insertUser, retrieveUser } = require('./tableInterfaces/userTable')

import { BookObject, ClubObject, ClubPostObject, ShelfObject, UserLoginDataObject, UserLoginObject, UserObject, UserRegisterObject } from '../../types' 
import { insertClub, retrieveClubs as retrieveClubsOfUser } from "./tableInterfaces/clubTables"
import ConnectionWrapper from './database'

fs.readFile('../apiKey.txt', 'utf8', (err: Error, data: string) => {

    if (err) throw err

    const apiKey = data

    console.log("API key acquired.")

    server.listen(port, () => {

        console.log("Listening on port " + port)

    });

    configureConnectionPool()

    io.on('connection' , (socket: Socket) => {

        console.log("Client connected")

        //Search bar query from client
        socket.on('search_google_books_by_title', async (query: string) => {


            try {

                const volumeData = await searchGoogleBooksByTitle(query, apiKey)

                socket.emit('google_books_by_title_response', volumeData)

            }
            catch (error) {

                socket.emit('google_books_by_title_error', error)

            }
        })


        //New user registration
        socket.on('register_new_user', async (user: UserRegisterObject) => {

            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                const message = await insertUser(user, connection)

                socket.emit('register_new_user_response', message)


            }
            catch (error) {

                socket.emit('register_new_user_error', error)

            }
            finally {

                connection.release()

            }

        })

        //User login request
        socket.on('login_as_user', async (user: UserLoginObject) =>{

            let userData: UserLoginDataObject = { user: { id: null, username: null }, shelves: [], books: [], clubs: [] }

            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                userData.user = await retrieveUser(user, connection)

                userData.shelves = await retrieveShelvesOfUser(userData.user, connection)

                userData.books = await retrieveBooksOfShelves(userData.shelves, connection)

                userData.clubs = await retrieveClubsOfUser(userData.user, connection)
                
                console.log("User logging on: " + userData.user.username)

                socket.emit('login_as_user_response', userData)
            }
            catch(error) {

                socket.emit('login_as_user_error', error)

            }
            finally {

                connection.release()

            }
        })

        //New shelf to add to database
        socket.on('post_new_shelf' , async (shelf: ShelfObject) => {

            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                const message = await insertShelf(shelf, connection)

                socket.emit('post_new_shelf_response', message)

            }
            catch(error) {

                socket.emit('post_new_shelf_error', error)

            }
            finally {

                connection.release()

            }

        })

        //Retrieve shelves of user
        socket.on('retrieve_shelves', async (user: UserObject) => {

            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                const shelves = await retrieveShelvesOfUser(user, connection)

                socket.emit('retrieve_shelves_response', shelves)

            }
            catch(error) {
              
                socket.emit('retrieve_shelves_error', error)

            }
            finally {

                connection.release()

            }

        })


        //New book to add to database
        socket.on('post_new_book', async (book: BookObject) =>{

            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                const message = await insertBook(book, connection)

                socket.emit('post_new_book_response', message)

            }
            catch(error){
                
                socket.emit('post_new_book_error', error)

            }
            finally {

                connection.release()

            }

        })

        //Retrieve books of user
        socket.on('retrieve_books', async (user) => {

            const data: {shelves: ShelfObject[], books: BookObject[]} = { shelves: [], books: [] }

            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                data.shelves = await retrieveShelvesOfUser(user, connection)

                data.books = await retrieveBooksOfShelves(data.shelves, connection)
                
                socket.emit('retrieve_books_response', data)

            }
            catch(error) {
                
                socket.emit('retrieve_books_error', error)
                
            }
            finally {

                connection.release()

            }

        })

        //Post new club
        socket.on('post_new_club', async (clubData: ClubPostObject) => {
            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                const message = await insertClub(clubData, connection)

                socket.emit('post_new_club_response', message)

            }
            catch(error) {
                
                socket.emit('post_new_club_error', error)

            }
            finally {

                connection.release()

            }

        })

        //Retrieve clubs of user
        socket.on('retrieve_clubs', async (user: UserObject) => {

            console.log("Retrieving clubs for user: " + user.id)

            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                const clubs = await retrieveClubsOfUser(user, connection)

                socket.emit('retrieve_clubs_response', clubs)

            }
            catch(error) {
                
                socket.emit('retrieve_clubs_error', error)

            }
            finally {

                connection.release()

            }
            
        })

    })
})
