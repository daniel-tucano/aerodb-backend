const mongoose = require('mongoose')

const Project = mongoose.model('Project')

module.exports = {
    async index(req, res) {
        const projects = Project.find()
        
        return res.json(projects)
    },

    async show(req, res) {
        const project = Project.findOne(req.params.id)

        return res.json(project)
    },

    async store(req, res) {
        const project = await Project.create(req.body)
        return res.json(project)
    },

    async update(req, res) {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, useFindAndModify: false })

        return res.json(project)
    },

    async destroy(req, res) {
        await Project.findByIdAndDelete(req.params.id)

        res.send()
    }
}