const mongoose = require('mongoose')
const breezeMongodb = require('breeze-mongodb')

const Run = mongoose.model('Run')
const Counter = mongoose.model('Counter')

module.exports = {
    async index(req, res) {
        const { page = 1, limit = 10} = req.query
        const ODataMongoQuery = new breezeMongodb.MongoQuery(req.query)
        const runs = await Run.paginate(ODataMongoQuery.filter, {page, limit});

        return res.json(runs);
    },

    async show(req,res) {
        const run = await Run.findOne({runID: req.params.id})

        return res.json(run)
    },

    async store(req, res) {
        // Obténdo counter que será o novo ID do run
        const runCounter = await Counter.findOneAndUpdate({refCollection: "Runs"}, { $inc: {counter: 1}}, { new: true, useFindAndModify: false})
        // Adicionando o runID a requisicao
        req.body.runID = runCounter.counter
        // Adiciona data atual do servidor ao campo postedDate
        req.body.postedDate = new Date
        const run = await Run.create(req.body);

        return res.json(run);
    },

    async update(req,res) {
        const run = await Run.findOneAndUpdate({runID: req.params.id}, req.body, {new:true, useFindAndModify: false})

        return res.json(run)
    },

    async destroy(req,res) {
            await Run.findOneAndRemove({runID: req.params.id},{useFindAndModify: false})

        return res.send()
    }
}