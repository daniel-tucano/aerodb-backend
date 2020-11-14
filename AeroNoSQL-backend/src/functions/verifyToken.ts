import { Request, Response, NextFunction } from 'express';
import { decode as decodeJWT } from 'jsonwebtoken'
import app from '../../app'
import admin from 'firebase-admin'

export default async function (req: Request, res: Response, next: NextFunction) {
    if (!req.token) return res.status(401).send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION! TOKEN NOT PROVIDED')

    try {

        if (app.env.NODE_ENV === "test_unit") {
            req.decodedIdToken = decodeJWT(req.token) as admin.auth.DecodedIdToken
            req.decodedIdToken.uid = req.decodedIdToken.user_id
        } else {
            req.decodedIdToken = await app.fireApp.auth().verifyIdToken(req.token)
        }

        next()
    } catch (e) {
        return res.status(401).send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION! INVALID TOKEN')
    }

}