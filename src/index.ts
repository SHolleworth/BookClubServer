import { Socket } from "socket.io"

const express = require('express')
const app = express()
const server = require('http').createServer(app)
const port = 3000
const io = require('socket.io')(server)
const fs = require('fs')

const { searchGoogleBooksByTitle } = require('./requestHandler')
const { insertBook, deleteBook, retrieveBooksOfShelves } = require('./tableInterfaces/bookTable')
const { configureConnectionPool, getPool }= require('./tableInterfaces/connection')
const { insertShelf, deleteShelf, retrieveShelvesOfUser } = require('./tableInterfaces/shelfTable')
const { insertUser, retrieveUser, retrieveUserIdAndSocketIdByUsername, updateSocketIdOfUser } = require('./tableInterfaces/userTable')
const { insertInvite, retrieveInvitesOfUser, deleteInvite } = require('./tableInterfaces/inviteTable')

import { BookObject, ClubInvitePost, ClubInviteData, ClubObject, ClubPostObject, ShelfObject, UserLoginDataObject, UserLoginObject, UserObject, UserRegisterObject, ClubInviteReceive, MemberData, AcceptClubInviteObject, MeetingObject } from '../../types' 
import { deleteMeeting, insertClub, insertClubMember, insertMeeting, retrieveClubsOfUser } from "./tableInterfaces/clubTables"
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

        socket.on('update_socket_id', async (userId: number) => {

            const connection = new (ConnectionWrapper as any)()
            
            try {

                await connection.getPoolConnection()

                const message = await updateSocketIdOfUser(userId, socket.id, connection)

                socket.emit('update_socket_id_response', message)

            }
            catch (error) {

                socket.emit('update_socket_id_error', error)

            }
            finally {

                connection.release()

            }
        })


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

            let userData: UserLoginDataObject = { 
                user: { id: null, username: null }, 
                shelves: [], 
                books: [], 
                clubs: [],
                invites: []
            }

            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                userData.user = await retrieveUser(user, connection)

                userData.shelves = await retrieveShelvesOfUser(userData.user, connection)

                userData.books = await retrieveBooksOfShelves(userData.shelves, connection)

                userData.clubs = await retrieveClubsOfUser(userData.user, connection, socket)

                userData.invites = await retrieveInvitesOfUser(userData.user, connection)

                await updateSocketIdOfUser(userData.user.id, socket.id, connection)
                
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

        socket.on('delete_shelf' , async (shelf: ShelfObject) => {

            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                const message = await deleteShelf(shelf, connection)

                socket.emit('delete_shelf_response', message)

            }
            catch(error) {

                socket.emit('delete_shelf_error', error)

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

        socket.on('delete_book', async (book: BookObject) =>{

            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                const message = await deleteBook(book, connection)

                socket.emit('delete_book_response', message)

            }
            catch(error){
                
                socket.emit('delete_book_error', error)

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

                const clubs = await retrieveClubsOfUser(user, connection, socket)

                socket.emit('retrieve_clubs_response', clubs)

            }
            catch(error) {
                
                socket.emit('retrieve_clubs_error', error)

            }
            finally {

                connection.release()

            }
            
        })


        //Send club invite to username
        socket.on('send_club_invite', async (invite: ClubInvitePost) => {

            const { invitedUsername, inviter, club } = invite

            console.log(`Processing club invitation to club: ${club.name}, sent from ${inviter.username} to ${invitedUsername}.`)

            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                const { id, socketId } = await retrieveUserIdAndSocketIdByUsername(invitedUsername, connection) 

                const inviteData: ClubInviteData = { id: null, invitedId: id, inviterId: inviter.id, clubId: club.id }

                const inviteId = await insertInvite(inviteData, connection)

                const inviteToSend: ClubInviteReceive = { inviter, club, inviteId }

                console.log("Sending invite to socket Id " + socketId)

                io.to(socketId).emit('receiving_club_invite', inviteToSend)

                socket.emit('send_club_invite_response', "Invite sent.")

            }
            catch(error) {

                console.error(error)
                
                socket.emit('send_club_invite_error', error)

            }
            finally {

                connection.release()

            }
            
        })

        socket.on('retrieve_club_invites', async (user: UserObject) => {

            console.log(`Retrieving invites of ${user.username}.`)

            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                const invites = await retrieveInvitesOfUser(user, connection)

                console.log('Retrieved invites.')

                socket.emit('retrieve_club_invites_response', invites)

            }
            catch(error) {

                console.error(error)
                
                socket.emit('retrieve_club_invites_error', error)

            }
            finally {

                connection.release()

            }
            
        })


        socket.on('delete_club_invite', async (invite: ClubInviteReceive) => {

            console.log(`Deleting invite ${invite.inviteId}.`)

            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                const message = await deleteInvite(invite, connection)

                console.log(message)

                socket.emit('delete_club_invite_response', message)

            }
            catch(error) {

                console.error(error)
                
                socket.emit('delete_club_invite_error', error)

            }
            finally {

                connection.release()

            }
            
        })


        //Add a club member
        socket.on('post_club_member', async (payload: AcceptClubInviteObject) => {

            const { userId, clubId } = payload.memberData

            console.log(`Adding user: ${userId} to club: ${clubId}.`)

            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                const message = await insertClubMember(payload, connection)

                const clubs = await connection.query("SELECT * FROM club WHERE id = ?", [clubId])

                console.log("Sending club refresh signal.")

                socket.to(clubs[0].name).emit("refresh_clubs")

                socket.emit('post_club_member_response', message)

            }
            catch(error) {

                console.error(error)
                
                socket.emit('post_club_member_error', error)

            }
            finally {

                connection.release()

            }
            
        })


        socket.on('post_meeting' , async (meeting: MeetingObject) => {
        
            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                const message = await insertMeeting(meeting, connection)

                socket.emit('post_meeting_response', message)

                const club = await connection.query("SELECT * FROM club WHERE id = ?", [meeting.clubId])

                io.to(club[0].name).emit('refresh_clubs')

            }
            catch(error) {

                console.error(error)
                
                socket.emit('post_meeting_error', error)

            }
            finally {

                connection.release()

            }

        })

        socket.on('delete_meeting' , async (meeting: MeetingObject) => {

            const connection = new (ConnectionWrapper as any)()

            try {

                await connection.getPoolConnection()

                const message = await deleteMeeting(meeting, connection)

                const club = await connection.query("SELECT * FROM Club WHERE id = ?", [meeting.clubId])

                socket.emit('delete_meeting_response', message)

                io.to(club.name).emit('refresh_clubs')

            }
            catch(error) {

                socket.emit('delete_meeting_error', error)

            }
            finally {

                connection.release()

            }

        })

    })
})
