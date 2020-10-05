const mongoose = require('mongoose')

const Airfoil = mongoose.model('Airfoil')

module.exports = {
    async index(req, res) {
        const { page = 1 } = req.query;
        const { limit = 10 } = req.query
        const airfoils = await Airfoil.paginate({}, {page, limit});

        return res.json(airfoils);
    },

    async show(req,res) {
        const airfoil = await Airfoil.findById(req.params.id)

        return res.json(airfoil)
    },

    async store(req, res) {
        const airfoil = await Airfoil.create(req.body);

        return res.json(airfoil);
    },

    async update(req,res) {
        const airfoil = await Airfoil.findByIdAndUpdate(req.params.id, req.body, {new:true})

        return res.json(airfoil)
    },

    async destroy(req,res) {
        await Airfoil.findByIdAndRemove(req.params.id)

        return res.send()
    }
}