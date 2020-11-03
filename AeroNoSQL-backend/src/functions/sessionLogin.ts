import app from '../../app'
import { Request, Response } from 'express'

const FIVE_DAYS_IN_MILISECONDS = 1000 * 60 * 60 * 24 * 5

const sessionLogin = async (req: Request, res: Response) => {

    const idToken = req.body.idToken.toString()

    if (!idToken) {
        return res.send('ID Token needed')
    }

    const sessionCookie = await app.fireApp.auth().createSessionCookie(idToken, {expiresIn: FIVE_DAYS_IN_MILISECONDS})

    res.cookie('session',sessionCookie, { maxAge: FIVE_DAYS_IN_MILISECONDS, httpOnly: true, sameSite: "strict"})

    return res.status(200).send('success')
}

export default sessionLogin