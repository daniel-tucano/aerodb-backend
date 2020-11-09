import { Request, Response, NextFunction } from 'express';
import app from '../../app'

export default async function ( req: Request, res:Response, next: NextFunction) {
    if ( req.token ) {
        try {
            req.decodedIdToken = await app.fireApp.auth().verifyIdToken( req.token )
            next()
        } catch {
            return res.status(401).send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION! INVALID TOKEN')
        }
    } else {
        return res.status(401).send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION! TOKEN NOT PROVIDED')
    }
}