const mongoose = require('mongoose')
const breezeMongodb = require('breeze-mongodb')

const User = mongoose.model('User')

module.exports = {
    async index(req, res) {
        const { page = 1, limit = 10} = req.query
        const ODataMongoQuery = new breezeMongodb.MongoQuery(req.query)
        const users = await User.paginate(ODataMongoQuery.filter, {page, limit});
        
        return res.json(users);
    },

    async show(req,res) {
        const { uid = false } = req.query

        const user = uid ? await User.findOne({ uid: req.params.id }) : await User.findById(req.params.id)

        return res.json(user)
    },

    async store(req, res) {
        const user = await User.create(req.body);

        return res.json(user);
    },

    async update(req,res) {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {new:true})

        return res.json(user)
    },

    async destroy(req,res) {
        await User.findByIdAndRemove(req.params.id)

        return res.send()
    }
}