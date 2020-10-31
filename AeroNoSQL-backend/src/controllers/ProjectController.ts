import Project from '../models/Projects'
import User from '../models/Users'
import { Request, Response } from "express"
const breezeMongodb = require('breeze-mongodb')
import { authorizeOperation } from '../functions/authorizeOperation'
import { paginate } from '../functions/paginate'


module.exports = {
    async index(req: Request, res: Response) {
        let { page = 1, limit = 10, uid } = req.query
        page = Number(page)
        limit = Number(limit)

        if (Number.isInteger(page) && Number.isInteger(limit)) {
            const ODataMongoQuery = new breezeMongodb.MongoQuery(req.query)

            // Query MUST contain uid to only allow resources reads comming from owners requests
            if (!uid) {
                return res.send("Must include uid query parameter")
            }

            const isAuthorized = authorizeOperation(req, uid as string)

            if (isAuthorized) {
                // If it is authorized, perform the operation and return its result
                const projects = await paginate(Project, { ...ODataMongoQuery.filter, "creator.userID": uid }, { page, limit })
                return res.json(projects)
            } else {
                // Otherwise return an error
                return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
            }
        } else {
            return res.send('page and limit must be integers')
        }
    },

    async show(req: Request, res: Response) {
        const project = await Project.findById(req.params.id)

        // Checks if the project exists
        if (!project) {
            return res.send('project dont exist')
        }

        // Checks if operation is authorized
        const isAuthorized = authorizeOperation(req, project.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result
            return res.json(project)
        } else {
            // Otherwise return an error
            return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        }

    },

    async store(req: Request, res: Response) {

        // Checks if the operation is authorized
        const isAuthorized = await authorizeOperation(req, req.body.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result

            // Add project to database
            const project = await Project.create(req.body);
            // If succeed in adding the project, update users project to reflect addition
            if (project) {
                await User.findOneAndUpdate({ uid: project.creator.userID }, { $addToSet: { projects: { name: project.name, projectID: project.id } } })
            }
            // Return value added
            return res.json(project)

        } else {
            // Otherwise return an error
            return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        }

    },

    async update(req: Request, res: Response) {
        const project = await Project.findById(req.params.id)

        // Checks if the project exists
        if (!project) {
            return res.send('project dont exist')
        }

        // Checks if the operation is authorized
        const isAuthorized = await authorizeOperation(req, project.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result
            const project_new = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, useFindAndModify: false })

            // Checks if the new project succeed to update
            if (!project_new) {
                return res.send('failed to update project')
            }

            // If changes the project.name, then update projects array in creator User
            if (project_new.name !== project.name) {
                await User.findOneAndUpdate({ _id: project_new.creator.userID }, { $set: { "projects.$.name": project_new.name } })
            }

            // Return value updated
            return res.json(project_new)
        } else {
            // Otherwise return an error
            return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        }

    },

    async destroy(req: Request, res: Response) {

        const project = await Project.findById(req.params.id)

        // Checks if the project exists
        if (!project) {
            return res.send('project dont exist')
        }

        // Checks if operation is authorized
        const isAuthorized = await authorizeOperation(req, project.creator.userID)

        if (isAuthorized) {
            // If it is authorized, perform the operation and return its result
            const project_deleted = await Project.findByIdAndDelete(req.params.id)

            // If succeed in deleting the project, update users project to reflect deletion
            if (project_deleted) {
                await User.findOneAndUpdate({ uid: project_deleted.creator.userID }, { $pull: { projects: { name: project_deleted.name, projectID: project_deleted.id } } })
            }

            res.send()
        } else {
            // Otherwise return an error
            return res.send('CLIENT NOT AUTHORIZED TO PERFORM OPERATION')
        }

    }
}