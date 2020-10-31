import Run from '../models/Runs'
import Counter from '../models/Counters'
import Airfoil from '../models/Airfoils'
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
            const runs = await paginate(Run, ODataMongoQuery.filter, { page, limit });
            return res.json(runs);
        } else {
            return res.send('page and limit must be integers')
        }
    },

    async show(req: Request, res: Response) {
        const run = await Run.findOne({ runID: Number(req.params.id) })

        return res.json(run)
    },

    async store(req: Request, res: Response) {

        // Checks if the airfoil exists in the database
        const airfoil = await Airfoil.findOne({airfoilID: req.body.airfoilID})

        if (airfoil) {
            // Checks if the operation is authorized
            const isAuthorized = await authorizeOperation(req, req.body.creator.userID)
    
            if (isAuthorized) {
                // If it is authorized, perform the operation and return its result
    
                // Obtain the counter wich will be the new runID
                const runCounter = await Counter.findOneAndUpdate({ refCollection: "Runs" }, { $inc: { counter: 1 } }, { new: true, useFindAndModify: false })
                // If fails to update counter, return failure and logs to console
                if (!runCounter) {
                    console.log('Fail to increment run counter!')
                    return res.send('Fail to increment run counter!')
                }
                // Add runID to the request
                req.body.runID = runCounter.counter
                // Adds current server date to postedDate field
                req.body.postedDate = Date.now()
                // Add run to database
                const run = await Run.create(req.body);

                // If successfully added the airfoil, then update airfoil runs to reflect addition
                if (run) {
                    await Airfoil.findOneAndUpdate({ airfoilID: run.airfoilID }, { $addToSet: { "runs.runIDs": run.runID, "runs.runObjIDs": run._id} })
                }

                // Return value added
                return res.json(run)
            } else {
                // Otherwise return an error
                return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
            }
        } else {
            return res.send(`AIRFOIL ${req.body.airfoilID} DO NOT EXISTS`)
        }


    },

    async update(req: Request, res: Response) {

        // Reading the resource current value
        let run = await Run.findOne({ runID: Number(req.params.id) })

        // Checks if the run exists
        if (!run) {
            return res.send('run dont exist')
        }

        // Checks if the operation is authorized
        const isAuthorized = await authorizeOperation(req, run.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result
            run = await Run.findOneAndUpdate({ runID: Number(req.params.id) }, req.body, { new: true, useFindAndModify: false })
            return res.json(run)
        } else {
            // Otherwise return an error
            return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        }

    },

    async destroy(req: Request, res: Response) {

        // Reading the resource current value
        let run = await Run.findOne({ runID: Number(req.params.id) })

        // Checks if the run exists
        if (!run) {
            return res.send('run dont exist')
        }

        // Checks if the operation is authorized
        const isAuthorized = await authorizeOperation(req, run.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result
            const run_deleted = await Run.findOneAndRemove({ runID: Number(req.params.id) }, { useFindAndModify: false } as QueryFindOneAndRemoveOptions)

            // If successfully deleted the run, then update the airfoil to reflect the deletion
            if (run_deleted) {
                await Airfoil.findOneAndUpdate({ airfoilID: run_deleted.airfoilID }, {$pull: { "runs.runIDs": run_deleted.runID, "runs.runObjIDs": run_deleted._id}} )
            }

            return res.send()
        } else {
            // Otherwise return an error
            return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        }

    }
}