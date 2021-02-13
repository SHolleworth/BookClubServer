const { getConnection } = require('./connection')

import { Pool } from "mysql";
import { ClubData, ClubObject, ClubPostObject, MemberData, MemberObject, UserData, UserObject } from "../../../types";
import { convertToUserObject } from "./userTable";

export const insertClub = async (clubData: ClubPostObject, pool: Pool | null): Promise<string> => {
    
    return new Promise((resolve, reject) => {
        
        if (!pool) pool = getConnection()

        if(pool) {

            try {

                console.log("Inserting new club.")

                pool.getConnection((error, connection) => {
                    
                    if (error) return reject(error)
    
    
    
                    connection.beginTransaction((error) => {
                        
                        if (error) return reject(error)
    
    
    
                        connection.query('INSERT INTO Club (name) VALUES (?)', [clubData.name], (error, results) => {
                            
                            if (error) {
    
                                connection.rollback()
    
                                connection.release()
    
                                return reject(error)
    
                            }
    
    

                            const clubId = results.insertId
    
                            const newClubMember = { userId: clubData.userId, clubId, admin: true }
    
                            connection.query('INSERT INTO ClubMember SET ?', [newClubMember], (error) => {
                                
                                if (error) {
    
                                    connection.rollback()
        
                                    connection.release()
        
                                    return reject(error)
        
                                }
    
    
    
                                connection.commit((error) => {
                                    
                                    if (error) {
    
                                        connection.rollback()
            
                                        connection.release()
            
                                        return reject(error)
            
                                    }
    
    
                                    connection.release()
    
                                    return resolve("Successfully added club to database.")
    
                                })
    
                            })
                        })
    
                    })
    
                })
    
            }
            catch (error) {
    
                ("SQL error during club insertion: " + error)
    
            }

        }
        else {

            return reject("Error inserting club, not connected to database.")

        }
        
    });

}

export const retrieveClubs = (user: UserObject, pool: Pool | null): Promise<ClubObject[]> => {

    console.log("Inside retrieving clubs.")
    
    return new Promise((resolve, reject) => {
        
        if (!pool) pool = getConnection()

        let clubDataBelongingToUser: ClubData[] = []
        let memberDataBelongingToClubs: MemberData[] = [] 
        let userDataBelongingToMembers: UserData[] = []

        if(pool) {

            console.log("Connected to database.")

            try {

                pool.getConnection((error, connection) => {
                    
                    if (error) return reject(error)
    

                    console.log("Acquired connection from pool")
    
                    connection.beginTransaction((error) => {
                        
                        if (error) return reject(error)
    
                        console.log("Beginning transaction.")



                        connection.query('SELECT * FROM ClubMember WHERE userId = ?', [user.id], (error, results) => {
                            
                            if (error) {

                                connection.rollback()

                                connection.release()

                                return reject(error)

                            }



                        
                            const clubIdsOfUser = results.map((memberData: MemberData) => memberData.clubId) 

                            connection.query('SELECT * FROM Club WHERE id IN (?)', [clubIdsOfUser], (error, results) => {

                                if (error) {

                                    connection.rollback()

                                    connection.release()

                                    return reject(error)

                                }



                                console.log("Retrieved club data for user.")

                                clubDataBelongingToUser = results

                                if(clubDataBelongingToUser.length < 1) {

                                    return resolve([])

                                }

                                const clubIds = clubDataBelongingToUser.map((clubData: ClubData) => clubData.id)

                                connection.query('SELECT * FROM ClubMember WHERE clubId IN (?)', [clubIds], (error, results) => {
                                    
                                    if (error) {

                                        connection.rollback()
        
                                        connection.release()
        
                                        return reject(error)
        
                                    }

                                    

                                    console.log("Retrieved member data.")

                                    memberDataBelongingToClubs = results

                                    const memberIds = memberDataBelongingToClubs.map((memberData: MemberData) => memberData.userId)

                                    connection.query('SELECT * FROM User WHERE id IN (?)', [memberIds], (error, results) => {
                                        
                                        if (error) {

                                            connection.rollback()
            
                                            connection.release()
            
                                            return reject(error)
            
                                        }



                                        userDataBelongingToMembers = results

                                        const clubs = formatClubObjects(clubDataBelongingToUser, memberDataBelongingToClubs, userDataBelongingToMembers)

                                        connection.commit((error) => {

                                            if (error) {

                                                connection.rollback()
                
                                                connection.release()
                
                                                return reject(error)
                
                                            }
                                            


                                            connection.release()

                                            return resolve(clubs)
                                            
                                        })

                                    })

                                })
                            
                            })

                        })

                    })
    
                })
    
            }
            catch (error) {
    
                return reject("SQL error during club insertion: " + error)
    
            }

        }
        else {

            return reject("Error inserting club, not connected to database.")

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