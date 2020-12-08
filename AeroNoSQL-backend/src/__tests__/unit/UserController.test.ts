/**
 *
 * @group unit
 *
 */

import request from "supertest";
import app from "../../../app";
import Counter from "../../models/Counters";
import Users from "../../models/Users";
import Airfoil from "../../models/Airfoils";
import userMocks from "../mocks/userMocks";
import airfoilMocks from "../mocks/airfoilMocks";
import JWTMocks from "../mocks/JWTMocks";

jest.setTimeout(10000);

describe("UserController tests", () => {
  // Create Airfoil Counter and add some airfoil documents
  beforeAll(async () => {
    await Counter.create({
      refCollection: "Airfoils",
      name: "AirfoilID",
      counter: 0,
    });
    for (let i = 0; i < 10; i++) {
      await request(app.express)
        .post("/airfoils")
        .auth(JWTMocks.user_1, { type: "bearer" })
        .send(airfoilMocks.authorizedAirfoil);
    }
  });

  // Clean Airfoil Counter and airfoil documents
  afterAll(async () => {
    await Counter.collection.drop();
    await Airfoil.collection.drop();
  });

  // Clean Users (if it exists)
  afterEach(async () => {
    try {
      await Users.collection.drop();
    } catch {}
  });

  it("Should insert user document", async () => {
    const res = await request(app.express)
      .post("/users")
      .send(userMocks.user)
      .auth(JWTMocks.user_1, { type: "bearer" });

    res.body.yearOfBirth = new Date(res.body.yearOfBirth);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(userMocks.user);
  });

  it("Should delete user document", async () => {
    const insertedUserRes = await request(app.express)
      .post("/users")
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send(userMocks.user);
    const res = await request(app.express)
      .delete(`/users/${insertedUserRes.body.uid}`)
      .auth(JWTMocks.user_1, { type: "bearer" });

    expect(res.status).toBe(200);
  });

  it("Should not find user document to delete", async () => {
    const res = await request(app.express)
      .delete(`/users/${userMocks.user.uid}`)
      .auth(JWTMocks.user_1, { type: "bearer" });

    expect(res.status).toBe(404);
  });

  it("Should unauthorize to delete user document", async () => {
    const insertedUserRes = await request(app.express)
      .post("/users")
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send(userMocks.user);
    const res = await request(app.express)
      .delete(`/users/${insertedUserRes.body.uid}`)
      .auth(JWTMocks.user_2, { type: "bearer" });

    expect(res.status).toBe(401);
  });

  it("Should update user document", async () => {
    const insertedUserRes = await request(app.express)
      .post("/users")
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send(userMocks.user);
    const res = await request(app.express)
      .put(`/users/${insertedUserRes.body.uid}`)
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send(userMocks.updatedUser);

    res.body.yearOfBirth = new Date(res.body.yearOfBirth);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(userMocks.updatedUser);
  });

  it("Should not find user document to update", async () => {
    const res = await request(app.express)
      .put(`/users/${userMocks.user.uid}`)
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send(userMocks.updatedUser);

    expect(res.status).toBe(404);
  });

  it("Should return a pagination with 5 user documents", async () => {
    for (let i = 0; i < 10; i++) {
      await request(app.express)
        .post("/users")
        .auth(JWTMocks.user_1, { type: "bearer" })
        .send(userMocks.user);
    }
    const userPaginationRes = await request(app.express)
      .get("/users?limit=5")
      .auth(JWTMocks.user_1, { type: "bearer" });

    expect(userPaginationRes.body.docs.length).toBe(5);
  });

  it("Should return a pagination with second page", async () => {
    for (let i = 0; i < 10; i++) {
      await request(app.express)
        .post("/users")
        .auth(JWTMocks.user_1, { type: "bearer" })
        .send(userMocks.user);
    }
    await request(app.express)
      .post("/users")
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send({ ...userMocks.user, name: "user 11" });
    const userPaginationRes = await request(app.express)
      .get("/users?page=2")
      .auth(JWTMocks.user_1, { type: "bearer" });

    expect(userPaginationRes.body.docs[0].name).toBe("user 11");
    expect(userPaginationRes.body.page).toBe(2);
  });
});
