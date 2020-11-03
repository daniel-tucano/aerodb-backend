import { Request } from 'express';
import app from '../../app'

// Verify if the resource belongs to the client who made the request
const verifyOwnership = async (sessionToken: string, userID: string): Promise<boolean> => {

    let isOwner = Boolean()

    try {

        // Checks if the auth JWT was signed correctly
        const decodedSessionToken = await app.fireApp.auth().verifySessionCookie(sessionToken)
        isOwner = decodedSessionToken.uid === userID
        console.log(decodedSessionToken.uid)
        console.log(userID)
        console.log(`inside resource.creator, isOwner: ${isOwner}`)

        return isOwner

    } catch (error) {
        isOwner = false

        console.log("CLIENT NOT AUTHORIZED: an error ocurred while verifying session token signature")
        console.log(error)

        return isOwner
    }

}

type authorizeOperationType = (req: Request, userID: string) => Promise<boolean> 

export const authorizeOperation: authorizeOperationType =  async function (req: Request, userID: string): Promise<boolean> {

    let isOwner = Boolean()

    let isAuthorized = Boolean()

    // Verifify if some authorization cookie was send with the request
    if (req.cookies.session) {
        // Verify if the client own the resource
        isOwner = await verifyOwnership(req.cookies.session, userID)

        if (isOwner) {
            // If the client own the resource it is authorized to do the operation
            isAuthorized = true
        } else {
            // Otherwise it is not
            isAuthorized = false

            // Logs the status on the console
            console.log("CLIENT NOT AUTHORIZED: client do not own the resourse")
        }

    } else {
        // If no authorization cookie was sent the client is not authorized to do the operation
        isAuthorized = false

        // Logs the status on the console
        console.log("CLIENT NOT AUTHORIZED: session token was not provided")
    }

    // Return the resulting authorization status
    return isAuthorized

}