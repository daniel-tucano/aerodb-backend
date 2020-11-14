import Run, { RunDataType } from '../models/Runs'
import Counter from '../models/Counters'
import Airfoil from '../models/Airfoils'
import lodash from 'lodash'
import { Request, Response } from "express"
import { paginate } from '../functions/paginate'
import { QueryFindOneAndRemoveOptions } from 'mongoose'

module.exports = {
    async index(req: Request, res: Response) {
        let { page = 1, limit = 10 } = req.query
        page = Number(page)
        limit = Number(limit)

        // Checks if page and limit query parameters are valid
        if (!(Number.isInteger(page) && Number.isInteger(limit))) return res.status(400).send('PAGE AND LIMIT PARAMETERS MUST BE NUMBERS')

        const runs = await paginate(Run, req.ODataFilter, { page, limit });
        
        return res.json(runs);
    },

    async show(req: Request, res: Response) {
        const run = await Run.findOne({ runID: Number(req.params.id) })

        return res.json(run)
    },

    async store(req: Request<any, RunDataType, RunDataType>, res: Response) {

        // Checks if the operation is authorized
        if (req.decodedIdToken?.uid !== req.body.creator.userID) return res.status(401).send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')

        // Checks if the airfoil exists in the database
        const airfoil = await Airfoil.findOne({ airfoilID: req.body.airfoilID }, {}, { lean: true })

        // If it don't exist, return 404
        if (!airfoil) return res.status(404).send('AIRFOIL NOT FIND')

        // Obtain the counter wich will be the new runID
        const runCounter = await Counter.findOneAndUpdate({ refCollection: "Runs" }, { $inc: { counter: 1 } }, { new: true, useFindAndModify: false })
        // If fails to update counter, return failure an4 logs to console
        if (!runCounter) {
            console.log('Fail to increment run counter!')
            return res.send('Fail to increment run counter!')
        }
        // Add runID to the request
        req.body.runID = runCounter.counter
        // Adds current server date to postedDate field
        req.body.postedDate = new Date()
        // Add run to database
        const run = await Run.create(req.body);

        // If successfully added the run, then update airfoil runs to reflect addition
        if (run) {
            await Airfoil.findOneAndUpdate({ airfoilID: run.airfoilID }, { $addToSet: { "runs.runIDs": run.runID, "runs.runObjIDs": run._id } }, { useFindAndModify: false })
        }

        // Return value added
        return res.json(run)

    },

    async update(req: Request<any, RunDataType, RunDataType>, res: Response) {

        // Checks if the operation is authorized
        if (req.decodedIdToken?.uid !== req.body.creator.userID) return res.status(401).send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')

        // Reading the resource current value
        let run = await Run.findOne({ runID: Number(req.params.id) }, {}, { lean: true })

        // Checks if the run exists
        if (!run) return res.status(404).send('run dont exist')

        // Checks if the operation is authorized
        if (req.decodedIdToken?.uid !== run.creator.userID) return res.status(401).send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')

        // Checks if it's trying to change creator field
        if (!lodash.isEqual(req.body.creator, run.creator)) return res.status(401).send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION! NOT ALLOWED TO CHANGE DOCUMENT CREATOR')

        // If it is authorized, perform the operation and return its result
        run = await Run.findOneAndUpdate({ runID: Number(req.params.id) }, req.body, { new: true, useFindAndModify: false, lean: true })
        return res.json(run)

    },

    async destroy(req: Request, res: Response) {

        // Reading the resource current value
        let run = await Run.findOne({ runID: Number(req.params.id) }, {}, { lean: true })

        // Checks if the run exists
        if (!run) return res.status(404).send('run dont exist')

        // Checks if the operation is authorized
        if (req.decodedIdToken?.uid !== run.creator.userID) return res.status(401).send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')

        // If it is authorized, perform the operation and return its result
        const run_deleted = await Run.findOneAndDelete({ runID: Number(req.params.id) }, { useFindAndModify: false } as QueryFindOneAndRemoveOptions)

        // If successfully deleted the run, then update the airfoil to reflect the deletion
        if (run_deleted) {
            await Airfoil.findOneAndUpdate({ airfoilID: run_deleted.airfoilID }, { $pull: { "runs.runIDs": run_deleted.runID, "runs.runObjIDs": run_deleted._id } }, { useFindAndModify: false })
        }

        return res.send()

    }
}