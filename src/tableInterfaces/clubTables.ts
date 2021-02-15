import { ClubData, ClubObject, ClubPostObject, MemberData, MemberObject, UserData, UserObject } from "../../../types";
import ConnectionWrapper, { Connection } from "../database";

export const insertClub = async (clubData: ClubPostObject): Promise<string> => {
    
    return new Promise(async (resolve, reject) => {

        console.log("Attempting to insert club: " + clubData.name)

        const connection: Connection = new (ConnectionWrapper as any)()

        try {

            await connection.getPoolConnection()

            await connection.beginTransaction()

            const insertedClubRow = await connection.query('INSERT INTO Club (name) VALUES (?)', [clubData.name])

            const clubId = insertedClubRow.insertId

            const newClubMember = { userId: clubData.userId, clubId, admin: true }

            await connection.query('INSERT INTO ClubMember SET ?', [newClubMember])

            await connection.commit()

            connection.release()

            const message = "Successfully added club to database."

            console.log(message)

            return resolve(message)

        }
        catch (error){

            await connection.rollback()
        
            connection.release()

            console.error(error)

            return reject(error)

        }
       
    });

}

export const retrieveClubs = (user: UserObject): Promise<ClubObject[]> => {
    
    return new Promise(async (resolve, reject) => {
        
        console.log("Attempting to retrieve clubs of user: " + user.username)

        const message =  (clubs: ClubObject[]) =>  `Retrieved ${clubs.length} clubs of user: ` + user.username

        let clubDataBelongingToUser: ClubData[] = []

        let memberDataBelongingToClubs: MemberData[] = [] 

        let userDataBelongingToMembers: UserData[] = []

        const connection: Connection = new (ConnectionWrapper as any)()

        try {

            await connection.getPoolConnection()

            await connection.beginTransaction()

            const memberDataOfUser =  await connection.query('SELECT * FROM ClubMember WHERE userId = ?', [user.id])

            const clubIdsOfUser = memberDataOfUser.map((memberData: MemberData) => memberData.clubId) 

            clubDataBelongingToUser = await connection.query('SELECT * FROM Club WHERE id IN (?)', [clubIdsOfUser])

            if(clubDataBelongingToUser.length < 1) {

                console.log(message([]))

                return resolve([])

            }

            const clubIds = clubDataBelongingToUser.map((clubData: ClubData) => clubData.id)

            memberDataBelongingToClubs = await connection.query('SELECT * FROM ClubMember WHERE clubId IN (?)', [clubIds])

            const memberIds = memberDataBelongingToClubs.map((memberData: MemberData) => memberData.userId)

            userDataBelongingToMembers = await connection.query('SELECT * FROM User WHERE id IN (?)', [memberIds])

            const clubs = formatClubObjects(clubDataBelongingToUser, memberDataBelongingToClubs, userDataBelongingToMembers)

            await connection.commit()

            connection.release()

            console.log(message(clubs))

            return resolve(clubs)

        }
        catch (error) {

            await connection.rollback()

            connection.release()

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