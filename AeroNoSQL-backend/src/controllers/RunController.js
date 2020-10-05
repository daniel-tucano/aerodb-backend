const mongoose = require('mongoose')

const Run = mongoose.model('Run')

module.exports = {
    async index(req, res) {
        const { page = 1 } = req.query;
        const { limit = 10 } = req.query
        const runs = await Run.paginate({}, {page, limit});

        return res.json(runs);
    },

    async show(req,res) {
        const run = await Run.findById(req.params.id)

        return res.json(run)
    },

    async store(req, res) {
        const run = await Run.create(req.body);

        return res.json(run);
    },

    async update(req,res) {
        const run = await Run.findByIdAndUpdate(req.params.id, req.body, {new:true})

        return res.json(run)
    },

    async destroy(req,res) {
        await Run.findByIdAndRemove(req.params.id)

        return res.send()
    }
}