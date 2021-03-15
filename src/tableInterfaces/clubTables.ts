import { Socket } from "socket.io";
import { AcceptClubInviteObject, ClubData, ClubObject, ClubPostObject, MeetingData, MeetingObject, MemberData, MemberObject, UserData, UserObject } from "../../../types";
import { Connection } from "../database";
const { retrieveBookById } = require("./bookTable")

export const insertClub = async (clubData: ClubPostObject, connection: Connection): Promise<string> => {
    
    return new Promise(async (resolve, reject) => {

        console.log("Attempting to insert club: " + clubData.name)

        try {

            await connection.beginTransaction()

            const existingClubs = await connection.query('SELECT * FROM Club WHERE name = ?', [clubData.name])

            if(existingClubs.length) {

                await connection.rollback()

                const error = "Club name already exists."

                console.error(error)

                return reject(error)

            }

            const insertedClubRow = await connection.query('INSERT INTO Club (name) VALUES (?)', [clubData.name])

            const clubId = insertedClubRow.insertId

            const newClubMember = { userId: clubData.userId, clubId, admin: true }

            await connection.query('INSERT INTO ClubMember SET ?', [newClubMember])

            await connection.commit()

            const message = "Successfully added club to database."

            console.log(message)

            return resolve(message)

        }
        catch (error){

            try {

                await connection.rollback()

                console.error(error)

                return reject(error)

            }
            catch (error) {

                console.error(error)

                return reject(error)

            }

        }
       
    });

}

export const retrieveClubsOfUser = (user: UserObject, connection: Connection, socket: Socket): Promise<ClubObject[]> => {
    
    return new Promise(async (resolve, reject) => {
        
        console.log("Attempting to retrieve clubs of user: " + user.username)

        const message =  (clubs: ClubObject[]) =>  `Retrieved ${clubs.length} clubs of user: ` + user.username

        let clubDataBelongingToUser: ClubData[] = []

        let memberDataBelongingToClubs: MemberData[] = [] 

        let userDataBelongingToMembers: UserData[] = []

        let meetings: MeetingObject[] = []
       
        try {

            await connection.beginTransaction()

            const memberDataOfUser =  await connection.query('SELECT * FROM ClubMember WHERE userId = ?', [user.id])

            const clubIdsOfUser = memberDataOfUser.map((memberData: MemberData) => memberData.clubId)

            if(clubIdsOfUser.length < 1) {

                console.log(message([]))

                await connection.commit()

                return resolve([])

            }

            clubDataBelongingToUser = await connection.query('SELECT * FROM Club WHERE id IN (?)', [clubIdsOfUser])

            const clubIds = clubDataBelongingToUser.map((clubData: ClubData) => clubData.id)

            memberDataBelongingToClubs = await connection.query('SELECT * FROM ClubMember WHERE clubId IN (?)', [clubIds])

            const memberIds = memberDataBelongingToClubs.map((memberData: MemberData) => memberData.userId)

            userDataBelongingToMembers = await connection.query('SELECT * FROM User WHERE id IN (?)', [memberIds])

            meetings = await retrieveMeetingsOfClubs(clubDataBelongingToUser, connection)

            const clubs = formatClubObjects(clubDataBelongingToUser, memberDataBelongingToClubs, userDataBelongingToMembers, meetings)

            clubs.forEach((club: ClubObject) => socket.join(club.name))

            console.log(`Joined rooms:`)

            console.log(socket.rooms)

            await connection.commit()

            console.log(message(clubs))

            return resolve(clubs)

        }
        catch (error) {

            await connection.rollback()

            console.error(error)

            return reject(error)
        }

    });

}

export const insertClubMember = (payload: AcceptClubInviteObject, connection: Connection) => {

    return new Promise(async (resolve, reject) => {
       
        const { clubId, userId } = payload.memberData

        try {

            await connection.beginTransaction()

            const exisitingMembers =  await connection.query("SELECT * FROM clubMember WHERE clubId = ? AND userID = ?", [clubId, userId])

            if(exisitingMembers.length) {

                await connection.rollback()

                const error = "Error, member data already exists in database."

                console.error(error)

                return reject(error)

            }

            const newMember = { clubId, userId, admin: false }

            await connection.query("INSERT INTO clubMember SET ?", [newMember])

            const message = `Successfully added user: ${userId} to club ${clubId}.`

            console.log(message)

            console.log(`Deleting invite ${payload.inviteId}`)

            await connection.query("DELETE FROM clubinvite WHERE id = ?", [payload.inviteId])

            await connection.commit()

            return resolve(message)

        }
        catch (error) {

            await connection.rollback()

            console.error(error)

            return reject(error)
        }

    });
    
}

const formatClubObjects = (clubDataSet: ClubData[], memberDataSet: MemberData[], userDataSet: UserData[], meetings: MeetingObject[]) => {
    
    return clubDataSet.map((clubData: ClubData) => {

        const memberDataOfThisClub = memberDataSet.filter((memberData: MemberData) => memberData.clubId === clubData.id)

        const members: (MemberObject | undefined)[] = memberDataOfThisClub.map((memberData: MemberData) => {

            const memberUserData = userDataSet.find((userData: UserData) => userData.id === memberData.userId)

            if (memberUserData) {

                const user: UserObject = { id: memberUserData.id, username: memberUserData.username }

                const member: MemberObject = { admin: memberData.admin, user: {...user} }

                return member

            }

            return undefined

        })

        const meeting = meetings.find((meeting: MeetingObject) => meeting.clubId === clubData.id) as MeetingObject

        const club: ClubObject = { ...clubData, members: [...members], meeting }

        return club

    })

}

export const insertMeeting = (meeting: MeetingObject, connection: Connection) => {
 
    return new Promise(async (resolve, reject) => {
       
        const { day, month, year } = meeting.date

        const { minutes, hours } = meeting.time

        const dateAndTime = new Date (
        year as number, 
        month as number - 1, 
        day as number, 
        hours as number, 
        minutes as number)

        const bookId = meeting.book?.id

        const clubId = meeting.clubId

        const meetingData = { bookId, clubId, dateAndTime }

        try {

            const existingMeetings = await connection.query("SELECT * FROM clubMeeting WHERE clubId = ?", [clubId])

            if(existingMeetings.length) return reject("Error, club already has meeting.")

            await connection.query("INSERT INTO clubMeeting SET ?", [meetingData])

            const message = "Added meeting to database."

            console.log(message)

            return resolve(message)

        }
        catch (error) {

            console.error(error)

            return reject(error)
        }

    });

}

export const deleteMeeting = (meeting: MeetingObject, connection: Connection) => {

    return new Promise(async (resolve, reject) => {

        try {

            await connection.query("DELETE FROM clubmeeting WHERE id = ?", [meeting.id])
    
            const message = `Deleted meeting.`

            console.log(message)

            return resolve(message)

        }
        catch (error) {

            console.error(error)

            return reject(error)
        }
    });
    
}

export const retrieveMeetingsOfClubs = async (clubs: ClubData[], connection: Connection): Promise<MeetingObject[]> => {

    return new Promise(async (resolve, reject) => {

        try {

            const meetingData = await Promise.all(clubs.map((club: ClubData) => {
                
                return retrieveMeeting(club, connection) 

            }))

            const meetings = await Promise.all(meetingData.map(async (meeting: MeetingData) => {

                if(meeting.dateAndTime === null) {

                    const minutes = null
                    const hours = null
                    const day = null
                    const month = null
                    const year = null

                    const date = {day, month, year}

                    const time = {minutes, hours}

                    return Promise.resolve({ id: null, book: null, date, time, clubId: meeting.clubId})

                }

                const id = meeting.id

                const clubId = meeting.clubId

                const dateAndTime = new Date(meeting.dateAndTime)

                const date = {
                    year: dateAndTime.getFullYear(),
                    month: dateAndTime.getMonth() + 1,
                    day: dateAndTime.getDate()
                }

                const time = { 
                    hours: dateAndTime.getHours(),
                    minutes: dateAndTime.getMinutes()
                }

                try {

                    const book = await retrieveBookById(meeting.bookId as number, connection)

                    return Promise.resolve({ id, book, date, time, clubId })

                }
                catch (error) {

                    return Promise.reject(error)
                }
                
            }))

            const message = `Retrieved meetings of clubs.`

            console.log(message)

            return resolve(meetings)

        }
        catch (error) {

            console.error(error)

            return reject(error)
        }

    });

}

const retrieveMeeting = async (club: ClubData, connection: Connection): Promise<MeetingData> => {

    return new Promise(async (resolve, reject) => {

        try {

            const meetingData = await connection.query("SELECT * FROM clubMeeting WHERE clubId = ?", [club.id])

            if(meetingData.length) return resolve(meetingData[0])

            return resolve({ id: null, bookId: null, dateAndTime: null, clubId: club.id } )

        }
        catch (error) {

            console.error(error)

            return reject(error)
        }

    });

}