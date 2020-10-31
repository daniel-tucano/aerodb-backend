import Airfoil from '../models/Airfoils'
import User from '../models/Users'
import Counter from '../models/Counters'
import { Request, Response } from "express"
const breezeMongodb = require('breeze-mongodb')
import { authorizeOperation } from '../functions/authorizeOperation'
import { paginate } from '../functions/paginate'
import { QueryFindOneAndRemoveOptions } from 'mongoose'


module.exports = {
    async index(req: Request, res: Response) {
        let { page = 1, limit = 10 } = req.query
        page = Number(page)
        limit = Number(limit)

        if (Number.isInteger(page) && Number.isInteger(limit)) {
            const ODataMongoQuery = new breezeMongodb.MongoQuery(req.query)
            const airfoils = await paginate(Airfoil, ODataMongoQuery.filter, { page, limit });
            return res.json(airfoils);
        } else {
            return res.send('page and limit must be integers')
        }
    },

    async show(req: Request, res: Response) {
        const airfoil = await Airfoil.findOne({ airfoilID: Number(req.params.id) })

        return res.json(airfoil)
    },

    async store(req: Request, res: Response) {

        // Checks if the operation is authorized
        const isAuthorized = await authorizeOperation(req, req.body.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result

            // Obtain the counter wich will be the new airfoilID
            const airfoilCounter = await Counter.findOneAndUpdate({ refCollection: "Airfoils" }, { $inc: { counter: 1 } }, { new: true, useFindAndModify: false })
            // If fails to update counter, return failure and logs to console
            if (!airfoilCounter) {
                console.log('Fail to increment airfoil counter!')
                return res.send('Fail to increment airfoil counter!')
            }
            // Add airfoilID to the request
            req.body.airfoilID = airfoilCounter.counter
            // Add nameLowerCase to the request
            req.body.nameLowerCase = req.body.name.toLowerCase()
            // Adds current server date to postedDate field
            req.body.postedDate = new Date
            // Add airfoil to database
            const airfoil = await Airfoil.create(req.body);

            // If successfully add the airfoil, then add it to user airfoils
            if (airfoil) {
                await User.findOneAndUpdate({uid: airfoil.creator.userID}, { $addToSet: { userAirfoils: airfoil.airfoilID } })
            }

            // Return value added
            return res.json(airfoil)
        } else {
            // Otherwise return an error
            return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        }

    },

    async update(req: Request, res: Response) {

        // Reading the resource current value
        let airfoil = await Airfoil.findOne({ airfoilID: Number(req.params.id) })

        // Checks if the airfoil exists
        if (!airfoil) {
            return res.send('airfoil dont exist')
        }

        // Checks if the operation is authorized
        const isAuthorized = await authorizeOperation(req, airfoil.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result
            airfoil = await Airfoil.findOneAndUpdate({ airfoilID: Number(req.params.id) }, req.body, { new: true, useFindAndModify: false })
            return res.json(airfoil)
        } else {
            // Otherwise return an error
            return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        }

    },

    async destroy(req: Request, res: Response) {

        // Reading the resource current value
        let airfoil = await Airfoil.findOne({ airfoilID: Number(req.params.id) })

        // Checks if the airfoil exists
        if (!airfoil) {
            return res.send('airfoil dont exist')
        }

        // Checks if the operation is authorized
        const isAuthorized = await authorizeOperation(req, airfoil.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result
            const airfoil_deleted = await Airfoil.findOneAndRemove({ airfoilID: Number(req.params.id)}, { useFindAndModify: false } as QueryFindOneAndRemoveOptions)

            // If successfully deleted the airfoil, then uptdate user to reflect deletion
            if (airfoil_deleted) {
                await User.findOneAndUpdate({uid: airfoil.creator.userID}, { $pull: { userAirfoils: airfoil_deleted.airfoilID } })
            }

            return res.send()
        } else {
            // Otherwise return an error
            return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        }

    }
}