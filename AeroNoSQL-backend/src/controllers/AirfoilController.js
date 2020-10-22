const mongoose = require('mongoose')
const breezeMongodb = require('breeze-mongodb')

const Airfoil = mongoose.model('Airfoil')
const Counter = mongoose.model('Counter')

module.exports = {
    async index(req, res) {
        const { page = 1, limit = 10} = req.query
        const ODataMongoQuery = new breezeMongodb.MongoQuery(req.query)
        const airfoils = await Airfoil.paginate(ODataMongoQuery.filter, {page, limit});

        return res.json(airfoils);
    },

    async show(req,res) {
        const airfoil = await Airfoil.findOne({airfoilID: req.params.id})

        return res.json(airfoil)
    },

    async store(req, res) {
        // Obténdo counter que será o novo ID do aerofólio
        const AirfoilCounter = await Counter.findOneAndUpdate({refCollection: "Airfoils"}, {$inc: {counter: 1}}, {new: true, useFindAndModify: false})
        // Adicionando o airfoilID a requisição
        req.body.airfoilID = AirfoilCounter.counter
        // Adiciona data atual do servidor ao campo postedDate
        req.body.postedDate = new Date
        const airfoil = await Airfoil.create(req.body);

        return res.json(airfoil);
    },

    async update(req,res) {
        const airfoil = await Airfoil.findOneAndUpdate({airfoilID: req.params.id}, req.body, {new:true, useFindAndModify: false})

        return res.json(airfoil)
    },

    async destroy(req,res) {
        await Airfoil.findOneAndRemove({airfoilID: req.params.id},{useFindAndModify: false})

        return res.send()
    }
}