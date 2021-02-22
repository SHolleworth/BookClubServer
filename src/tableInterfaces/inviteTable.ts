import { ClubInvitePost, ClubInviteData, UserObject, ClubObject, ClubInviteReceive } from "../../../types";
import { Connection } from "../database";
import { configureConnectionPool } from "./connection";

const insertInvite = async (invite: ClubInviteData, connection: Connection) => {

    console.log("Attempting to insert invite: ")
    console.log(invite)
    
    return new Promise(async (resolve, reject) => {
        
        try {

            const { invitedId, inviterId, clubId } = invite

            const exisitngInvite = await connection.query("SELECT * FROM ClubInvite WHERE invitedId = ? AND inviterId = ? AND clubId = ?", [invitedId, inviterId, clubId])

            if(exisitngInvite.length) {

                return reject("Error, invite already exists")

            }

            const result = await connection.query("INSERT INTO clubinvite SET ?", [invite])

            return resolve(result.insertId)

        }
        catch (error) {            

            console.error(error)

            return reject(error)

        }

    })
    
}

const retrieveInvitesOfUser = async (user: UserObject, connection: Connection) => {
    
    console.log(`Retrieving invites of user ${user.username}.`)
    
    return new Promise(async (resolve, reject) => {
        
        try {

            const inviteData: ClubInviteData[] = await connection.query("SELECT * FROM clubinvite WHERE invitedId = ?", [user.id])

            const invites = await Promise.all( inviteData.map(async (data) => retrieveInvite(data, connection)) )

            console.log(`Retrieved ${invites.length} invites.`)

            return resolve(invites)

        }
        catch (error) {            

            console.error(error)

            return reject(error)

        }

    })

}

const retrieveInvite = async (inviteData: ClubInviteData, connection: Connection) => {

    return new Promise(async (resolve, reject) => {
        
        try {

            const inviteId = inviteData.id

            const userData = await connection.query("SELECT * FROM user WHERE id = ?", [inviteData.inviterId])

            const inviter = { id: userData[0].id, username: userData[0].username }

            const club = await connection.query("SELECT * FROM club WHERE id = ?", [inviteData.clubId])

            const invite: ClubInviteReceive = { inviteId, inviter, club: club[0] }

            console.log(`Retrieved invite to club ${(invite.club as any).name} from ${(invite.inviter as any).username}.`)

            return resolve(invite)

        }
        catch(error) {

            console.error(error)

            return reject(error)

        }

    });
    
}

const deleteInvite = async (invite: ClubInviteReceive, connection: Connection) => {

    return new Promise(async (resolve, reject) => {
        
        try {

            await connection.query("DELETE FROM clubinvite WHERE id = ?", [invite.inviteId])

            return resolve("Invite deleted.")

        }
        catch(error) {

            console.error(error)

            return reject(error)

        }

    });
    
}

module.exports = { insertInvite, retrieveInvitesOfUser, deleteInvite }