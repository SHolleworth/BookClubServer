import { AcceptClubInviteObject, ClubData, ClubObject, ClubPostObject, MemberData, MemberObject, UserData, UserObject } from "../../../types";
import { Connection } from "../database";

export const insertClub = async (clubData: ClubPostObject, connection: Connection): Promise<string> => {
    
    return new Promise(async (resolve, reject) => {

        console.log("Attempting to insert club: " + clubData.name)

        try {

            await connection.beginTransaction()

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

export const retrieveClubs = (user: UserObject, connection: Connection): Promise<ClubObject[]> => {
    
    return new Promise(async (resolve, reject) => {
        
        console.log("Attempting to retrieve clubs of user: " + user.username)

        const message =  (clubs: ClubObject[]) =>  `Retrieved ${clubs.length} clubs of user: ` + user.username

        let clubDataBelongingToUser: ClubData[] = []

        let memberDataBelongingToClubs: MemberData[] = [] 

        let userDataBelongingToMembers: UserData[] = []
       
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

            const clubs = formatClubObjects(clubDataBelongingToUser, memberDataBelongingToClubs, userDataBelongingToMembers)

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

const formatClubObjects = (clubDataSet: ClubData[], memberDataSet: MemberData[], userDataSet: UserData[]) => {
    
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

        const club: ClubObject = { ...clubData, members: [...members] }

        return club

    })

}