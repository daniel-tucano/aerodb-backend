const mongoose = require('mongoose')
const breezeMongodb = require('breeze-mongodb')
const { authorizeOperation } = require('../functions/authorizeOperation')

const Run = mongoose.model('Run')
const Counter = mongoose.model('Counter')
const Airfoil = mongoose.model('Airfoil')

module.exports = {
    async index(req, res) {
        const { page = 1, limit = 10 } = req.query
        const ODataMongoQuery = new breezeMongodb.MongoQuery(req.query)
        const runs = await Run.paginate(ODataMongoQuery.filter, { page, limit });

        return res.json(runs);
    },

    async show(req, res) {
        const run = await Run.findOne({ runID: req.params.id })

        return res.json(run)
    },

    async store(req, res) {

        // Checks if the airfoil exists in the database
        const airfoil = await Airfoil.findOne({airfoilID: req.body.airfoilID})

        if (airfoil) {
            // Checks if the operation is authorized
            const isAuthorized = await authorizeOperation(req, req.body.creator.userID)
    
            if (isAuthorized) {
                // If it is authorized, perform the operation and return its result
    
                // Obtain the counter wich will be the new runID
                const runCounter = await Counter.findOneAndUpdate({ refCollection: "Runs" }, { $inc: { counter: 1 } }, { new: true, useFindAndModify: false })
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

    async update(req, res) {

        // Reading the resource current value
        let run = await Run.findOne({ runID: req.params.id })

        // Checks if the operation is authorized
        const isAuthorized = await authorizeOperation(req, run.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result
            run = await Run.findOneAndUpdate({ runID: req.params.id }, req.body, { new: true, useFindAndModify: false })
            return res.json(run)
        } else {
            // Otherwise return an error
            return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        }

    },

    async destroy(req, res) {

        // Reading the resource current value
        let run = await Run.findOne({ runID: req.params.id })

        // Checks if the operation is authorized
        const isAuthorized = await authorizeOperation(req, run.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result
            const run_deleted = await Run.findOneAndRemove({ runID: req.params.id }, { useFindAndModify: false })

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