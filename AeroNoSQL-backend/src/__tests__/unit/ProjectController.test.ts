/**
 * 
 * @group unit
 * 
 */


import request from 'supertest'
import app from '../../../app'
import Counter from '../../models/Counters'
import Users from '../../models/Users'
import Airfoils from '../../models/Airfoils'
import Runs from '../../models/Runs'
import Projects from '../../models/Projects'
import JWTMocks from '../mocks/JWTMocks'
import userMocks from '../mocks/userMocks'
import airfoilMocks from '../mocks/airfoilMocks'
import runMocks from '../mocks/runMocks'
import projectMocks from '../mocks/projectMocks'
import _ from 'lodash'

jest.setTimeout(10000)

describe('projectController tests', () => {

    beforeAll(async () => {
        await Counter.create({ refCollection: "Airfoils", name: "AirfoilID", counter: 0 })
        await Counter.create({ refCollection: "Runs", name: "runID", counter: 0 })
        await Users.create(userMocks.user)
        await request(app.express).post('/airfoils').auth(JWTMocks.user_1, { type: "bearer" }).send(airfoilMocks.authorizedAirfoil)
        await request(app.express).post('/airfoils').auth(JWTMocks.user_1, { type: "bearer" }).send(airfoilMocks.authorizedAirfoil_2)
        await request(app.express).post('/runs').auth(JWTMocks.user_1, { type: "bearer" }).send(runMocks.authorizedRun)
        await request(app.express).post('/runs').auth(JWTMocks.user_1, { type: "bearer" }).send(runMocks.authorizedRun_2)
        await request(app.express).post('/runs').auth(JWTMocks.user_1, { type: "bearer" }).send({...runMocks.authorizedRun, airfoilID: 2})
        await request(app.express).post('/runs').auth(JWTMocks.user_1, { type: "bearer" }).send({...runMocks.authorizedRun_2, airfoilID: 2})
        await request(app.express).post('/runs').auth(JWTMocks.user_2, { type: "bearer" }).send(runMocks.authorizedRun)
        for ( let i = 0; i < 16; i++ ) {
            await request(app.express).post('/runs').auth(JWTMocks.user_1, { type: "bearer" }).send(runMocks.authorizedRun)
        }
    })

    afterAll(async () => {
        try {
            await Counter.collection.drop()
            await Airfoils.collection.drop()
            await Runs.collection.drop()
            await Users.collection.drop()
        } catch {}
    })

    afterEach( async () => {
        try {
            await Projects.collection.drop()
        } catch {}
    })

    it('Should authorize to get an project', async () => {
        const insertRes = await request(app.express).post('/projects').auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.authorizedProject)
        const res = await request(app.express).get(`/projects/${insertRes.body._id}`).auth(JWTMocks.user_1, { type: 'bearer' })

        expect(res.status).toBe(200)
    })

    it('Should unauthorize to get an project', async () => {
        const insertRes = await request(app.express).post('/projects').auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.authorizedProject)
        const res = await request(app.express).get(`/projects/${insertRes.body._id}`).auth(JWTMocks.user_2, { type: 'bearer' })

        expect(res.status).toBe(401)
    })

    it('Should authorize to insert the project document', async () => {
        const res = await request(app.express).post('/projects').auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.authorizedProject)

        expect(res.status).toBe(200)
    })

    it('Should unauthorize to insert the project document with uid diferent then authenticated user uid', async () => {
        const res = await request(app.express).post('/projects').send(projectMocks.unauthorizeduidProject).auth(JWTMocks.user_1, { type: "bearer" })

        expect(res.status).toBe(401)
    })

    it(`Should invalidate insert project request with invalid airfoil data`, async () => {
        const res = await request(app.express).post('/projects').auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.invalidAirfoilProject)

        expect(res.status).toBe(400)
    })
    
    it(`Should invalidate insert project request with invalid run data`, async () => {
        const res = await request(app.express).post('/projects').auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.invalidRunProject)

        expect(res.status).toBe(400)
    })

    it('Should delete project document', async () => {
        const insertedProjectRes = await request(app.express).post('/projects').auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.authorizedProject)
        const res = await request(app.express).delete(`/projects/${insertedProjectRes.body._id}`).auth(JWTMocks.user_1, { type: 'bearer' })
        
        expect(res.status).toBe(200)
    })
    
    it('Should not find project document to delete', async () => {
        const res = await request(app.express).delete(`/projects/5f973761a0eac4c121b3975b`).auth(JWTMocks.user_1, { type: 'bearer' })
        
        expect(res.status).toBe(404)
    })
    
    it('Should unauthorize to delete project document with uid diferent then authenticated user uid', async () => {
        const insertedProjectRes = await request(app.express).post('/projects').auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.authorizedProject)
        const res = await request(app.express).delete(`/projects/${insertedProjectRes.body._id}`).auth(JWTMocks.user_2, { type: 'bearer' })
        
        expect(res.status).toBe(401)
    })
    
    it('Should update project document', async () => {
        const insertedProjectRes = await request(app.express).post('/projects').auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.authorizedProject)
        const res = await request(app.express).put(`/projects/${insertedProjectRes.body._id}`).auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.updatedProject)
        
        expect(res.body).toMatchObject(projectMocks.updatedProject)
    })
    
    it('Should not find project document to update', async () => {
        const res = await request(app.express).put(`/projects/5f973761a0eac4c121b3975b`).auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.updatedProject)
        
        expect(res.status).toBe(404)
    })

    it("Should unauthorize to update project creator field", async () => {
        const insertedProjectRes = await request(app.express).post('/projects').auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.authorizedProject)
        const res = await request(app.express).put(`/projects/${insertedProjectRes.body._id}`).auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.unauthorizedCreatorProject)
        
        expect(res.status).toBe(401)
    })
    
    it(`Should invalidate update project request with invalid airfoil data`, async () => {
        const insertedProjectRes = await request(app.express).post('/projects').auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.authorizedProject)
        const res = await request(app.express).put(`/projects/${insertedProjectRes.body._id}`).auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.invalidAirfoilProject)

        expect(res.status).toBe(400)
    })
    
    it(`Should invalidate update project request with invalid run data`, async () => {
        const insertedProjectRes = await request(app.express).post('/projects').auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.authorizedProject)
        const res = await request(app.express).put(`/projects/${insertedProjectRes.body._id}`).auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.invalidRunProject)

        expect(res.status).toBe(400)
    })

    it('Should add project to user projects when insert project document', async () => {
        const insertedProjectRes = await request(app.express).post('/projects').auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.authorizedProject)
        const userRes = await request(app.express).get(`/users/${insertedProjectRes.body.creator.uid}?uid=true`).auth(JWTMocks.user_1, { type: 'bearer' })

        expect(_.some(userRes.body.projects,{ name: insertedProjectRes.body.name , projectID: insertedProjectRes.body._id})).toBe(true)
    })
    
    it('Should remove projects from user projects when delete project document', async () => {
        const insertedProjectRes = await request(app.express).post('/projects').auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.authorizedProject)
        await request(app.express).delete(`/projects/${insertedProjectRes.body._id}`).auth(JWTMocks.user_1, { type: 'bearer' })
        const userRes = await request(app.express).get(`/users/${insertedProjectRes.body.creator.uid}?uid=true`).auth(JWTMocks.user_1, { type: 'bearer' })
        
        expect(_.some(userRes.body.projects,{ name: insertedProjectRes.body.name , projectID: insertedProjectRes.body._id})).not.toBe(true)
    })

    it('Should return a pagination with 5 project documents', async () => {
        for (let i = 0; i < 10; i++) {
            await request(app.express).post('/projects').auth(JWTMocks.user_1, { type: 'bearer' }).send(projectMocks.authorizedProject)
        }
        const projectPaginationRes = await request(app.express).get(`/projects?limit=5`).auth(JWTMocks.user_1, { type: 'bearer' })

        expect(projectPaginationRes.body.docs.length).toBe(5)
    })

    it('Should return a pagination with second page', async () => {
        const projectPaginationRes = await request(app.express).get(`/projects?page=2`).auth(JWTMocks.user_1, { type: 'bearer' })

        expect(projectPaginationRes.body.page === 2).toBe(true)
    })

    it('Should unauthorize to get project pagination', async () => {
        const projectPaginationRes = await request(app.express).get(`/projects`)

        expect(projectPaginationRes.status).toBe(401)
    })
})