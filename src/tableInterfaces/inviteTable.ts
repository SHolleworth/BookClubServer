import { ClubInvitePost, ClubInviteData } from "../../../types";
import { Connection } from "../database";

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

module.exports = { insertInvite }