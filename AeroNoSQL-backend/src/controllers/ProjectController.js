const mongoose = require('mongoose')

const Project = mongoose.model('Project')
const User = mongoose.model('User')

module.exports = {
    async index(req, res) {
        const projects = Project.find()
        
        return res.json(projects)
    },

    async show(req, res) {
        const project = Project.findById(req.params.id)

        return res.json(project)
    },

    async store(req, res) {
        const project = await Project.create(req.body)

        // Se adicionou o projeto com sucesso atualiza os projetos do User que criou
        if (project) {
            await User.findByIdAndUpdate(project.creator, {$addToSet: { projects: { name: project.name, projectID: project.id } }})
        }

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