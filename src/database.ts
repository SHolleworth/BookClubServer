import { verify } from "crypto";
import { MysqlError, PoolConnection } from "mysql";
import { getPool } from './tableInterfaces/connection'

export interface Connection {
    rollback: () => Promise<any>;
    release: () => void;
    connection: PoolConnection | null
    getPoolConnection: () => Promise<any>
    query(sql: string, args: any[]): any
    beginTransaction: () => Promise<any>
    commit: () => Promise<any>
}

export default function (this: Connection) {

    this.connection = null




    this.getPoolConnection = async () => {

        return new Promise((resolve, reject) => {
            
            const pool = getPool()

            if(pool) {

                pool.getConnection((error, connection: PoolConnection) => {

                    if (error) return reject(error)

                    this.connection = connection

                    console.log("Got connection")

                    return resolve(1)
                
                })
            }
            else {

                return reject("Error, unable to obtain connection pool.")

            }
        
        });
        
    }



    
    this.query = async (sql: string, args: any[]) => {

        return new Promise((resolve, reject) => {

            if(this.connection) {

                this.connection.query(sql, args, (error: MysqlError | null, results: any[]) => {

                    if (error) return reject(error)

                    return resolve(results)
                    
                })

            }
            else {

                return reject(`Error when querying, connection wrapper not connected to database. SQL: ${sql}.`)

            }
            
        });
        
    }





    this.beginTransaction = async () => {

        return new Promise((resolve, reject) => {
            
            if (this.connection) {
    
                this.connection.beginTransaction((error: MysqlError) => {
    
                    if(error) return reject(error)
    
                    return resolve(1)
                    
                })
    
            }
            else {
    
                return reject("Error beginning transaction, connection wrapper not connected to database.")
            }
    
        });
    }




    this.commit = async () => {

        return new Promise((resolve, reject) => {
            
            if (this.connection) {
    
                this.connection.commit((error: MysqlError) => {
    
                    if (error) return reject(error)
    
                    return resolve(1)
                    
                })
    
            }
            else {
    
                return reject("Error beginning transaction, connection wrapper not connected to database.")

            }
    
        });
        
    }



    this.release = () => {

        if(this.connection) {
            
            console.log("Releasing connection")

            this.connection.release()

        }

    }



    this.rollback = async (): Promise<any> => {

        return new Promise((resolve, reject) => {
            
            if(this.connection) {

                this.connection.rollback(() => {
                    
                    return resolve(1)

                })

            }
            else {

                return reject("Error rolling back transaction, connection wrapper not connected to database.")
            }


        });
        
    }

}