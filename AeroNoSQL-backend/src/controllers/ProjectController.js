const mongoose = require('mongoose')
const breezeMongodb = require('breeze-mongodb')
const { authorizeOperation } = require('../functions/authorizeOperation')

const Project = mongoose.model('Project')
const User = mongoose.model('User')

module.exports = {
    async index(req, res) {
        const { page = 1, limit = 10, uid} = req.query
        const ODataMongoQuery = new breezeMongodb.MongoQuery(req.query)
        
        // Query MUST contain uid to only allow resources reads comming from owners requests
        if (!uid) {
            return res.send("Must include uid query parameter")
        }

        const isAuthorized = authorizeOperation(req, uid)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result
            const projects = await Project.paginate({...ODataMongoQuery.filter, "creator.userID": uid}, {page, limit})
            return res.json(projects)
        } else {
            // Otherwise return an error
            return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        }

        
    },

    async show(req, res) {
        const project = await Project.findById(req.params.id)

        const isAuthorized = authorizeOperation(req, project.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result
            return res.json(project)
        } else {
            // Otherwise return an error
            return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        }

    },

    async store(req, res) {

        // Checks if the operation is authorized
        const isAuthorized = await authorizeOperation(req, req.body.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result

            // Add project to database
            const project = await Project.create(req.body);
            // If succeed in adding the project, update users project to reflect addition
            if (project) {
                await User.findOneAndUpdate({uid: project.creator.userID}, {$addToSet: { projects: { name: project.name, projectID: project.id } }})
            }
            // Return value added
            return res.json(project)

        } else {
            // Otherwise return an error
            return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        }

    },

    async update(req, res) {
        const project = await Project.findById(req.params.id)

        // Checks if the operation is authorized
        const isAuthorized = await authorizeOperation(req, project.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result
            const project_new = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, useFindAndModify: false })

            // If changes the project.name, then update projects array in creator User
            if (project_new.name !== project.name) {
                await User.findOneAndUpdate({_id: project_new.creator._id }, {$set: {"projects.$.name": project_new.name}})
            }
    
            // Return value updated
            return res.json(project_new)
        } else {
            // Otherwise return an error
            return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        }

    },

    async destroy(req, res) {

        const project = await Project.findById(req.params.id)

        const isAuthorized = await authorizeOperation(req, project.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result
            const project_deleted = await Project.findByIdAndDelete(req.params.id)

            // If succeed in deleting the project, update users project to reflect deletion
            if (project_deleted) {
                await User.findOneAndUpdate({uid: project_deleted.creator.userID}, {$pull: { projects: { name: project_deleted.name, projectID: project_deleted.id } }})
            }
    
            res.send()
        } else {
            // Otherwise return an error
            return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        }

    }
}