const mongoose = require('mongoose')

const Airfoil = mongoose.model('Airfoil')
const Counter = mongoose.model('Counter')

module.exports = {
    async index(req, res) {
        const { page = 1 } = req.query;
        const { limit = 10 } = req.query
        const airfoils = await Airfoil.paginate({}, {page, limit});

        return res.json(airfoils);
    },

    async show(req,res) {
        const airfoil = await Airfoil.findOne({airfoilID: req.params.id})

        return res.json(airfoil)
    },

    async store(req, res) {
        // Obténdo counter que será o novo ID do aerofólio
        const AirfoilCounter = await Counter.findOneAndUpdate({refCollection: "Airfoils"}, {$inc: {counter: 1}}, {new: true, useFindAndModify: false})
        // Adicionando a requisição
        req.body.airfoilID = AirfoilCounter.counter
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