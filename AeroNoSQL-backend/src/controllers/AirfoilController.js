const mongoose = require('mongoose')
const breezeMongodb = require('breeze-mongodb')
const { authorizeOperation } = require('../functions/authorizeOperation')

const Airfoil = mongoose.model('Airfoil')
const Counter = mongoose.model('Counter')
const User = mongoose.model('User')

module.exports = {
    async index(req, res) {
        const { page = 1, limit = 10 } = req.query
        const ODataMongoQuery = new breezeMongodb.MongoQuery(req.query)
        const airfoils = await Airfoil.paginate(ODataMongoQuery.filter, { page, limit });

        return res.json(airfoils);
    },

    async show(req, res) {
        const airfoil = await Airfoil.findOne({ airfoilID: req.params.id })

        return res.json(airfoil)
    },

    async store(req, res) {

        // Checks if the operation is authorized
        const isAuthorized = await authorizeOperation(req, req.body.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result

            // Obtain the counter wich will be the new airfoilID
            const airfoilCounter = await Counter.findOneAndUpdate({ refCollection: "Airfoils" }, { $inc: { counter: 1 } }, { new: true, useFindAndModify: false })
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

    async update(req, res) {

        // Reading the resource current value
        let airfoil = await Airfoil.findOne({ airfoilID: req.params.id })

        // Checks if the operation is authorized
        const isAuthorized = await authorizeOperation(req, airfoil.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result
            airfoil = await Airfoil.findOneAndUpdate({ airfoilID: req.params.id }, req.body, { new: true, useFindAndModify: false })
            return res.json(airfoil)
        } else {
            // Otherwise return an error
            return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        }

    },

    async destroy(req, res) {

        // Reading the resource current value
        let airfoil = await Airfoil.findOne({ airfoilID: req.params.id })

        // Checks if the operation is authorized
        const isAuthorized = await authorizeOperation(req, airfoil.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result
            const airfoil_deleted = await Airfoil.findOneAndRemove({ airfoilID: req.params.id}, { useFindAndModify: false })

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