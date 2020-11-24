import { Request, Response, NextFunction, RequestHandler } from 'express';
import app from '../../app'

// Verify if the resource belongs to the client who made the request
const verifyOwnership = async (idToken: string, uid: string): Promise<boolean> => {

    let isOwner = Boolean()

    try {

        // Checks if the auth JWT was signed correctly
        const decodedIdToken = await app.fireApp.auth().verifyIdToken(idToken)
        isOwner = decodedIdToken.uid === uid
        // console.log(decodedIdToken.uid)
        // console.log(uid)
        // console.log(`inside resource.creator, isOwner: ${isOwner}`)

        return isOwner

    } catch (error) {
        isOwner = false

        // console.log("CLIENT NOT AUTHORIZED: an error ocurred while verifying session token signature")
        // console.log(error)

        return isOwner
    }

}

type authorizeOperationType = (req: Request, res: Response, next: NextFunction) => Promise<any>

const authorizeOperation: authorizeOperationType =  async function (req: Request, res: Response, next: NextFunction) {

    let isOwner = Boolean()

    // Verifify if some authorization token was send with the request
    if (req.token) {
        // Verify if the client own the resource
        isOwner = await verifyOwnership(req.token, req.body.creator.uid)

        if (isOwner) {
            // If the client own the resource it is authorized to do the operation
            next()

        } else {
            // Otherwise it is not
            return res.status(401).send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')

            // Logs the status on the console
            // console.log("CLIENT NOT AUTHORIZED: client do not own the resourse")
        }

    } else {
        // If no authorization token was sent the client is not authorized to do the operation
        return res.status(401).send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')

        // Logs the status on the console
        // console.log("CLIENT NOT AUTHORIZED: session token was not provided")
    }
}

export default authorizeOperation