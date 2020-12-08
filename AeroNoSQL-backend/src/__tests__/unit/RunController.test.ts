/**
 *
 * @group unit
 *
 */

import request from "supertest";
import app from "../../../app";
import Counter from "../../models/Counters";
import Users from "../../models/Users";
import Runs, { RunDataType } from "../../models/Runs";
import Airfoils from "../../models/Airfoils";
import airfoilMocks from "../mocks/airfoilMocks";
import userMocks from "../mocks/userMocks";
import runMocks from "../mocks/runMocks";
import JWTMocks from "../mocks/JWTMocks";
import { random } from "lodash";

jest.setTimeout(10000);

describe("runController tests", () => {
  beforeAll(async () => {
    await Counter.create({
      refCollection: "Airfoils",
      name: "AirfoilID",
      counter: 0,
    });
    await Users.create(userMocks.user);
    await request(app.express)
      .post("/airfoils")
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send(airfoilMocks.authorizedAirfoil);
  });

  afterAll(async () => {
    await Counter.collection.drop();
    try {
      await Airfoils.collection.drop();
      await Users.collection.drop();
    } catch {}
  });

  // Create Run Counter and User
  beforeEach(async () => {
    await Counter.create({ refCollection: "Runs", name: "runID", counter: 0 });
  });

  // Clean Runs (if it exists), Users and Counters
  afterEach(async () => {
    await Counter.deleteOne({ refCollection: "Runs" });
    try {
      await Runs.collection.drop();
    } catch {}
  });

  it("Should authorize to insert the run document", async () => {
    const res = await request(app.express)
      .post("/runs")
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send(runMocks.authorizedRun);

    expect(res.status).toBe(200);
  });

  it("Should unauthorize to insert the run document", async () => {
    const res = await request(app.express)
      .post("/runs")
      .send(runMocks.unauthorizedRun)
      .auth(JWTMocks.user_1, { type: "bearer" });

    expect(res.status).toBe(401);
  });

  it("Should delete run document", async () => {
    const insertedRunRes = await request(app.express)
      .post("/runs")
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send(runMocks.authorizedRun);
    const res = await request(app.express)
      .delete(`/runs/${insertedRunRes.body.runID}`)
      .auth(JWTMocks.user_1, { type: "bearer" });

    expect(res.status).toBe(200);
  });

  it("Should not find run document to delete", async () => {
    const res = await request(app.express)
      .delete(`/runs/1`)
      .auth(JWTMocks.user_1, { type: "bearer" });

    expect(res.status).toBe(404);
  });

  it("Should unauthorize to delete run document", async () => {
    const insertedRunRes = await request(app.express)
      .post("/runs")
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send(runMocks.authorizedRun);
    const res = await request(app.express)
      .delete(`/runs/${insertedRunRes.body.runID}`)
      .auth(JWTMocks.user_2, { type: "bearer" });

    expect(res.status).toBe(401);
  });

  it("Should update run document", async () => {
    const insertedRunRes = await request(app.express)
      .post("/runs")
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send(runMocks.authorizedRun);
    const res = await request(app.express)
      .put(`/runs/${insertedRunRes.body.runID}`)
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send(runMocks.updatedRun);

    expect(res.body).toMatchObject(runMocks.updatedRun);
  });

  it("Should not find run document to update", async () => {
    const res = await request(app.express)
      .put(`/runs/1`)
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send(runMocks.updatedRun);

    expect(res.status).toBe(404);
  });

  it("Should unauthorize to update run 'creator' field", async () => {
    const insertedRunRes = await request(app.express)
      .post("/runs")
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send(runMocks.authorizedRun);
    const res = await request(app.express)
      .put(`/runs/${insertedRunRes.body.runID}`)
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send(runMocks.unauthorizedUpdatedRun);

    expect(res.status).toBe(401);
  });

  it("Should add run to airfoil runs when insert run document", async () => {
    const insertedRunRes = await request(app.express)
      .post("/runs")
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send(runMocks.authorizedRun);
    const airfoilRes = await request(app.express)
      .get(`/airfoils/${insertedRunRes.body.airfoilID}`)
      .auth(JWTMocks.user_1, { type: "bearer" });

    expect(airfoilRes.body.runs.runIDs).toContain(insertedRunRes.body.runID);
  });

  it("Should remove run from airfoil runs when delete run document", async () => {
    const insertedRunRes = await request(app.express)
      .post("/runs")
      .auth(JWTMocks.user_1, { type: "bearer" })
      .send(runMocks.authorizedRun);
    await request(app.express)
      .delete(`/runs/${insertedRunRes.body.runID}`)
      .auth(JWTMocks.user_1, { type: "bearer" });
    const airfoilRes = await request(app.express)
      .get(`/airfoils/${insertedRunRes.body.airfoilID}`)
      .auth(JWTMocks.user_1, { type: "bearer" });

    expect(airfoilRes.body.runs.runIDs).not.toContain(
      insertedRunRes.body.runID
    );
  });

  it("Should return a pagination with 5 run documents", async () => {
    for (let i = 0; i < 10; i++) {
      await request(app.express)
        .post("/runs")
        .auth(JWTMocks.user_1, { type: "bearer" })
        .send(runMocks.authorizedRun);
    }
    const runPaginationRes = await request(app.express).get("/runs?limit=5");

    expect(runPaginationRes.body.docs.length).toBe(5);
  });

  it("Should return a pagination with second page", async () => {
    for (let i = 0; i < 20; i++) {
      await request(app.express)
        .post("/runs")
        .auth(JWTMocks.user_1, { type: "bearer" })
        .send(runMocks.authorizedRun);
    }
    const runPaginationRes = await request(app.express).get("/runs?page=2");

    expect(runPaginationRes.body.docs[0].runID).toBe(11);
    expect(runPaginationRes.body.page).toBe(2);
  });

  it("Should filter pagination by airfoilID = 10", async () => {
    // Insert runs with airfoilID = 1
    for (let i = 0; i < 20; i++) {
      await request(app.express)
        .post("/runs")
        .auth(JWTMocks.user_1, { type: "bearer" })
        .send(runMocks.authorizedRun);
    }
    // Insert 20 airfoils to have some with airfoilID = 10
    for (let i = 0; i < 20; i++) {
      await request(app.express)
        .post("/airfoils")
        .auth(JWTMocks.user_1, { type: "bearer" })
        .send(airfoilMocks.authorizedAirfoil);
    }
    // Insert runs with airfoilID = 10
    for (let i = 0; i < 20; i++) {
      await request(app.express)
        .post("/runs")
        .auth(JWTMocks.user_1, { type: "bearer" })
        .send({ ...runMocks.authorizedRun, airfoilID: 10 });
    }
    const runPaginationRes = await request(app.express).get(
      "/runs?$filter=airfoilID eq 10&estimatedDocumentCount=false"
    );

    // Expect all results from query to have airfoilID === 10
    expect(
      runPaginationRes.body.docs.every(
        (runDoc: RunDataType) => runDoc.airfoilID === 10
      )
    ).toBe(true);
    // Expect pagination totalDocs to be 20 (number of docs with airfoilID === 10)
    expect(runPaginationRes.body.totalDocs).toBe(20);
  });

  it("Should order pagination results by ascendent mach", async () => {
    // Insert runs with random mach values
    for (let i = 0; i < 20; i++) {
      await request(app.express)
        .post("/runs")
        .auth(JWTMocks.user_1, { type: "bearer" })
        .send({ ...runMocks.authorizedRun, mach: Math.random() });
    }
    const runPaginationRes = await request(app.express).get(
      "/runs?$orderby=mach"
    );

    // Expect machs in doc array to be in ascending order
    expect(
      runPaginationRes.body.docs.every(
        (run: RunDataType, index: number, runsArray: Array<RunDataType>) => {
          if (index + 1 === runsArray.length) return true;
          return runsArray[index + 1].mach >= run.mach;
        }
      )
    ).toBe(true);
  });
});
