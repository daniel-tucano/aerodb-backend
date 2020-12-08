import Project, { ProjectDataType } from "../models/Projects";
import User from "../models/Users";
import lodash from "lodash";
import { Request, Response } from "express";
import { paginate } from "../functions/paginate";
import Airfoils from "../models/Airfoils";
import Runs from "../models/Runs";

module.exports = {
  async index(req: Request, res: Response) {
    let { page = 1, limit = 10, estimatedDocumentCount = true } = req.query;
    page = Number(page);
    limit = Number(limit);
    estimatedDocumentCount = estimatedDocumentCount !== "false";

    // Checks if page and limit query parameters are valid
    if (!(Number.isInteger(page) && Number.isInteger(limit)))
      return res.status(400).send("PAGE AND LIMIT PARAMETERS MUST BE NUMBERS");

    // Perform the operation and return its result
    const projects = await paginate(
      Project,
      { ...req.ODataFilter, "creator.uid": req.decodedIdToken?.uid },
      req.ODataSort,
      { page, limit, estimatedDocumentCount }
    );

    return res.json(projects);
  },

  async show(req: Request, res: Response) {
    const project = await Project.findById(req.params.id, {}, { lean: true });

    // Checks if the project exists
    if (!project) return res.status(404).send("project dont exist");

    // Checks if the operation is authorized
    if (req.decodedIdToken?.uid !== project.creator.uid)
      return res.status(401).send("CLIENT NOT AUTHORIZED TO PERFORM OPERATION");

    // If it is authorized, perform the operation and return its result
    return res.json(project);
  },

  async store(
    req: Request<any, ProjectDataType, ProjectDataType>,
    res: Response
  ) {
    // Checks if the operation is authorized
    if (req.decodedIdToken?.uid !== req.body.creator.uid)
      return res.status(401).send("CLIENT NOT AUTHORIZED TO PERFORM OPERATION");

    // Checks if the project airfoils and runs exists and are consistent with database values
    for (const projectAirfoil of req.body.airfoils) {
      // Look for this aifoil in the database
      const airfoil = await Airfoils.findOne(
        { airfoilID: projectAirfoil.airfoilID },
        {},
        { lean: true }
      );
      // If no airfoil is returned from database then sends an error
      if (!airfoil)
        return res
          .status(400)
          .send(`AIRFOIL ${projectAirfoil.airfoilID} NOT FOUND!`);
      // If some airfoil is found then separate the common values part from the project airfoil
      const { runsData, ...projectAirfoilCommonValues } = projectAirfoil;
      // If the common values from the project airfoil differ from the database airfoil values then sends an error
      if (!lodash.some([airfoil], projectAirfoilCommonValues))
        return res
          .status(400)
          .send(
            `PROJECT PROVIDED AIRFOIL ${airfoil.airfoilID} IS INCONSISTENT WITH DATABASE VALUES`
          );
      // For this project airfoil checks it's runs data
      for (const projectRun of projectAirfoil.runsData) {
        // Look for this run in the database
        const run = await Runs.findOne(
          { runID: projectRun.runID },
          {},
          { lean: true }
        );
        // If no run is returned from database then sends an error
        if (!run)
          return res.status(400).send(`RUN ${projectRun.runID} NOT FOUND!`);
        // If the common values from the project run differ from the database run values then sends an error
        if (!lodash.some([run], projectRun))
          return res
            .status(400)
            .send(
              `PROJECT PROVIDED RUN ${run.runID} IS INCONSISTENT WITH DATABASE VALUES`
            );
      }
    }

    // Add project to database
    const project = await Project.create(req.body);
    // If succeed in adding the project, update users project to reflect addition
    if (project) {
      await User.findOneAndUpdate(
        { uid: project.creator.uid },
        {
          $addToSet: {
            projects: { name: project.name, projectID: project.id },
          },
        },
        { useFindAndModify: false }
      );
    }
    // Return value added
    return res.json(project);
  },

  async update(
    req: Request<any, ProjectDataType, ProjectDataType>,
    res: Response
  ) {
    const project = await Project.findById(req.params.id, {}, { lean: true });

    // Checks if the project exists
    if (!project) return res.status(404).send("project dont exist");

    // Checks if the operation is authorized
    if (req.decodedIdToken?.uid !== project.creator.uid)
      return res.status(401).send("CLIENT NOT AUTHORIZED TO PERFORM OPERATION");

    // Checks if it's trying to change creator field
    if (!lodash.isEqualWith(req.body.creator, project.creator))
      return res
        .status(401)
        .send(
          "CLIENT NOT AUTHORIZED TO PERFORM OPERATION! NOT ALLOWED TO CHANGE DOCUMENT CREATOR"
        );

    // Checks if the project airfoils and runs exists and are consistent with database values
    for (const projectAirfoil of req.body.airfoils) {
      // Look for this aifoil in the database
      const airfoil = await Airfoils.findOne(
        { airfoilID: projectAirfoil.airfoilID },
        {},
        { lean: true }
      );
      // If no airfoil is returned from database then sends an error
      if (!airfoil)
        return res
          .status(400)
          .send(`AIRFOIL ${projectAirfoil.airfoilID} NOT FOUND!`);
      // If some airfoil is found then separate the common values part from the project airfoil
      const { runsData, ...projectAirfoilCommonValues } = projectAirfoil;
      // If the common values from the project airfoil differ from the database airfoil values then sends an error
      if (!lodash.some([airfoil], projectAirfoilCommonValues))
        return res
          .status(400)
          .send(
            `PROJECT PROVIDED AIRFOIL ${airfoil.airfoilID} IS INCONSISTENT WITH DATABASE VALUES`
          );
      // For this project airfoil checks it's runs data
      for (const projectRun of projectAirfoil.runsData) {
        // Look for this run in the database
        const run = await Runs.findOne(
          { runID: projectRun.runID },
          {},
          { lean: true }
        );
        // If no run is returned from database then sends an error
        if (!run)
          return res.status(400).send(`RUN ${projectRun.runID} NOT FOUND!`);
        // If the common values from the project run differ from the database run values then sends an error
        if (!lodash.some([run], projectRun))
          return res
            .status(400)
            .send(
              `PROJECT PROVIDED RUN ${run.runID} IS INCONSISTENT WITH DATABASE VALUES`
            );
      }
    }

    // If it is authorized, perform the operation and return its result
    const project_new = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, useFindAndModify: false, lean: true }
    );

    // Checks if the new project succeed to update
    if (!project_new) {
      return res.send("failed to update project");
    }

    // If changes the project.name, then update projects array in creator User
    if (project_new.name !== project.name) {
      await User.findOneAndUpdate(
        { _id: project_new.creator.uid },
        { $set: { "projects.$.name": project_new.name } },
        { useFindAndModify: false }
      );
    }

    // Return value updated
    return res.json(project_new);
  },

  async destroy(req: Request, res: Response) {
    const project = await Project.findById(req.params.id, {}, { lean: true });

    // Checks if the project exists
    if (!project) return res.status(404).send("project dont exist");

    // Checks if the operation is authorized
    if (req.decodedIdToken?.uid !== project.creator.uid)
      return res.status(401).send("CLIENT NOT AUTHORIZED TO PERFORM OPERATION");

    // If it is authorized, perform the operation and return its result
    const project_deleted = await Project.findByIdAndDelete(req.params.id);

    // If succeed in deleting the project, update users project to reflect deletion
    if (project_deleted) {
      await User.findOneAndUpdate(
        { uid: project_deleted.creator.uid },
        {
          $pull: {
            projects: {
              name: project_deleted.name,
              projectID: project_deleted.id,
            },
          },
        },
        { useFindAndModify: false }
      );
    }

    res.send();
  },
};
