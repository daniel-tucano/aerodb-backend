/**
 * 
 * @group unit
 * 
 */


import request from 'supertest'
import app from '../../../app'
import Counter from '../../models/Counters'
import Users from '../../models/Users'
import Airfoil from '../../models/Airfoils'
import userMocks from '../mocks/userMocks'
import airfoilMocks from '../mocks/airfoilMocks'
import JWTMocks from '../mocks/JWTMocks'

jest.setTimeout(10000)

describe('AirfoilController tests', () => {

    // Create Airfoil Counter and User
    beforeEach(async () => {
        await Counter.create({ refCollection: "Airfoils", name: "AirfoilID", counter: 0 })
        await Users.create(userMocks.user)
    })

    // Clean Airfoils (if it exists), Users and Counters
    afterEach(async () => {
        await Counter.collection.drop()
        await Users.collection.drop()
        try {
            await Airfoil.collection.drop()
        } catch { }
    })

    it('Should authorize to insert the airfoil document', async () => {
        const res = await request(app.express).post('/airfoils').auth(JWTMocks.user_1, { type: 'bearer' }).send(airfoilMocks.authorizedAirfoil)

        expect(res.body).toMatchObject(airfoilMocks.authorizedAirfoil)
    })

    it('Should unauthorize to insert the airfoil document', async () => {
        const res = await request(app.express).post('/airfoils').send(airfoilMocks.unauthorizedAirfoil).auth(JWTMocks.user_1, { type: "bearer" })

        expect(res.status).toBe(401)
    })

    it('Should delete airfoil document', async () => {
        const insertedAirfoilRes = await request(app.express).post('/airfoils').auth(JWTMocks.user_1, { type: 'bearer' }).send(airfoilMocks.authorizedAirfoil)
        const res = await request(app.express).delete(`/airfoils/${insertedAirfoilRes.body.airfoilID}`).auth(JWTMocks.user_1, { type: 'bearer' })
        
        expect(res.status).toBe(200)
    })
    
    it('Should not find airfoil document to delete', async () => {
        const res = await request(app.express).delete(`/airfoils/1`).auth(JWTMocks.user_1, { type: 'bearer' })
        
        expect(res.status).toBe(404)
    })
    
    it('Should unauthorize to delete airfoil document', async () => {
        const insertedAirfoilRes = await request(app.express).post('/airfoils').auth(JWTMocks.user_1, { type: 'bearer' }).send(airfoilMocks.authorizedAirfoil)
        const res = await request(app.express).delete(`/airfoils/${insertedAirfoilRes.body.airfoilID}`).auth(JWTMocks.user_2, { type: 'bearer' })
        
        expect(res.status).toBe(401)
    })
    
    it('Should update airfoil document', async () => {
        const insertedAirfoilRes = await request(app.express).post('/airfoils').auth(JWTMocks.user_1, { type: 'bearer' }).send(airfoilMocks.authorizedAirfoil)
        const res = await request(app.express).put(`/airfoils/${insertedAirfoilRes.body.airfoilID}`).auth(JWTMocks.user_1, { type: 'bearer' }).send(airfoilMocks.updatedAirfoil)
        
        expect(res.body).toMatchObject(airfoilMocks.updatedAirfoil)
    })
    
    it('Should not find airfoil document to update', async () => {
        const res = await request(app.express).put(`/airfoils/1`).auth(JWTMocks.user_1, { type: 'bearer' }).send(airfoilMocks.updatedAirfoil)
        
        expect(res.status).toBe(404)
    })

    it("Should unauthorize to update airfoil 'creator' field", async () => {
        const insertedAirfoilRes = await request(app.express).post('/airfoils').auth(JWTMocks.user_1, { type: 'bearer' }).send(airfoilMocks.authorizedAirfoil)
        const res = await request(app.express).put(`/airfoils/${insertedAirfoilRes.body.airfoilID}`).auth(JWTMocks.user_1, { type: 'bearer' }).send(airfoilMocks.unauthorizedUpdatedAirfoil)
        
        expect(res.status).toBe(401)
    })

    it('Should add airfoil to user userAirfoils when insert airfoil document', async () => {
        const airfoilRes = await request(app.express).post('/airfoils').auth(JWTMocks.user_1, { type: 'bearer' }).send(airfoilMocks.authorizedAirfoil)
        const userRes = await request(app.express).get(`/users/${userMocks.user.uid}?uid=true`).auth(JWTMocks.user_1, { type: 'bearer' })

        expect(userRes.body.userAirfoils).toContain(airfoilRes.body.airfoilID)
    })

    it('Should remove airfoil from user userAirfoils when delete airfoil document', async () => {
        const insertedAirfoilRes = await request(app.express).post('/airfoils').auth(JWTMocks.user_1, { type: 'bearer' }).send(airfoilMocks.authorizedAirfoil)
        await request(app.express).delete(`/airfoils/${insertedAirfoilRes.body.airfoilID}`).auth(JWTMocks.user_1, { type: 'bearer' })
        const userRes = await request(app.express).get(`/users/${userMocks.user.uid}?uid=true`).auth(JWTMocks.user_1, { type: 'bearer' })

        expect(userRes.body.userAirfoils).not.toContain(insertedAirfoilRes.body.airfoilID)
    })

    it('Should return a pagination with 5 airfoil documents', async () => {
        for (let i = 0; i < 10; i++) {
            await request(app.express).post('/airfoils').auth(JWTMocks.user_1, { type: 'bearer' }).send(airfoilMocks.authorizedAirfoil)
        }
        const airfoilPaginationRes = await request(app.express).get('/airfoils?limit=5')

        expect(airfoilPaginationRes.body.docs.length).toBe(5)
    })

    it('Should return a pagination with second page', async () => {
        for (let i = 0; i < 20; i++) {
            await request(app.express).post('/airfoils').auth(JWTMocks.user_1, { type: 'bearer' }).send(airfoilMocks.authorizedAirfoil)
        }
        const airfoilPaginationRes = await request(app.express).get('/airfoils?page=2')

        expect(airfoilPaginationRes.body.docs[0].airfoilID === 11 && airfoilPaginationRes.body.page === 2).toBe(true)
    })
})