import User from '../models/Users'
import { Request, Response } from "express"
import { paginate } from '../functions/paginate'

module.exports = {
    async index(req: Request, res: Response) {
        let { page = 1, limit = 10 } = req.query
        page = Number(page)
        limit = Number(limit)

        // Checks if page and limit query parameters are valid
        if (!(Number.isInteger(page) && Number.isInteger(limit))) return res.status(400).send('PAGE AND LIMIT PARAMETERS MUST BE NUMBERS')
        
        const users = await paginate(User, req.ODataFilter, req.ODataSort, { page, limit });
        
        return res.json(users);
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
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, useFindAndModify: false })

        if (!user) return res.status(404).send("USER DON'T EXISTS")

        return res.json(user)
    },

    async destroy(req: Request, res: Response) {
        const user = await User.findByIdAndRemove(req.params.id)

        if (!user) return res.status(404).send("USER DON'T EXISTS")

        return res.send()
    }
}