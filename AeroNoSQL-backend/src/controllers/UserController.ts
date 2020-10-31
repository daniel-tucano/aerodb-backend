import User from '../models/Users'
import { Request, Response } from "express"
import { paginate } from '../functions/paginate'
const breezeMongodb = require('breeze-mongodb')

module.exports = {
    async index(req: Request, res: Response) {
        let { page = 1, limit = 10 } = req.query
        page = Number(page)
        limit = Number(limit)

        if (Number.isInteger(page) && Number.isInteger(limit)) {
            const ODataMongoQuery = new breezeMongodb.MongoQuery(req.query)
            const users = await paginate(User, ODataMongoQuery.filter, { page, limit });
            return res.json(users);
        } else {
            return res.send('page and limit must be integers')
        }
    },

    async show(req: Request, res: Response) {
        const { uid = false } = req.query

        const user = uid ? await User.findOne({ uid: req.params.id }) : await User.findById(req.params.id)

        return res.json(user)
    },

    async store(req: Request, res: Response) {
        const user = await User.create(req.body);

        return res.json(user);
    },

    async update(req: Request, res: Response) {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {new:true})

        return res.json(user)
    },

    async destroy(req: Request, res: Response) {
        await User.findByIdAndRemove(req.params.id)

        return res.send()
    }
}