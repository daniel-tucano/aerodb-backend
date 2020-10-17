const mongoose = require('mongoose')

const Run = mongoose.model('Run')
const Counter = mongoose.model('Counter')

module.exports = {
    async index(req, res) {
        const { page = 1 } = req.query;
        const { limit = 10 } = req.query
        const runs = await Run.paginate({}, {page, limit});

        return res.json(runs);
    },

    async show(req,res) {
        const run = await Run.findOne({runID: req.params.id})

        return res.json(run)
    },

    async store(req, res) {
        const runCounter = await Counter.findOneAndUpdate({refCollection: "Runs"}, { $inc: {counter: 1}}, { new: true, useFindAndModify: false})
        req.body.runID = runCounter.counter
        const run = await Run.create(req.body);

        return res.json(run);
    },

    async update(req,res) {
        const run = await Run.findOneAndUpdate({runID: req.params.id}, req.body, {new:true})

        return res.json(run)
    },

    async destroy(req,res) {
            await Run.findOneAndRemove({runID: req.params.id})

        return res.send()
    }
}