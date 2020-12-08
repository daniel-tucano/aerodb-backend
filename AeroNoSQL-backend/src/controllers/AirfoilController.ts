import Airfoil, { AirfoilDataType } from "../models/Airfoils";
import User from "../models/Users";
import Counter from "../models/Counters";
import { Request, Response } from "express";
import { paginate } from "../functions/paginate";
import lodash from "lodash";

module.exports = {
  async index(req: Request, res: Response) {
    let { page = 1, limit = 10 } = req.query;
    const estimatedDocumentCount = req.query.estimatedDocumentCount !== "false";
    page = Number(page);
    limit = Number(limit);

    // Checks if page and limit query parameters are valid
    if (!(Number.isInteger(page) && Number.isInteger(limit)))
      return res.status(400).send("PAGE AND LIMIT PARAMETERS MUST BE NUMBERS");

    const airfoils = await paginate(Airfoil, req.ODataFilter, req.ODataSort, {
      page,
      limit,
      estimatedDocumentCount,
    });

    return res.json(airfoils);
  },

  async show(req: Request, res: Response) {
    const airfoil = await Airfoil.findOne({ airfoilID: Number(req.params.id) });

    if (!airfoil) return res.status(404).send("AIRFOIL NOT FOUND");

    return res.json(airfoil);
  },

  async store(req: Request<any, any, AirfoilDataType>, res: Response) {
    // Checks if the operation is authorized
    if (req.decodedIdToken?.uid !== req.body.creator.uid)
      return res.status(401).send("CLIENT NOT AUTHORIZED TO PERFORM OPERATION");

    // Obtain the counter wich will be the new airfoilID
    const airfoilCounter = await Counter.findOneAndUpdate(
      { refCollection: "Airfoils" },
      { $inc: { counter: 1 } },
      { new: true, useFindAndModify: false }
    );
    // If fails to update counter, return failure and logs to console
    if (!airfoilCounter) {
      console.log("Fail to increment airfoil counter!");
      return res.send("Fail to increment airfoil counter!");
    }
    // Add airfoilID to the request
    req.body.airfoilID = airfoilCounter.counter;
    // Add nameLowerCase to the request
    req.body.nameLowerCase = req.body.name.toLowerCase();
    // Adds current server date to postedDate field
    req.body.postedDate = new Date();
    // Add airfoil to database
    const airfoil = await Airfoil.create(req.body);

    // If successfully add the airfoil, then add it to user airfoils
    if (airfoil) {
      await User.findOneAndUpdate(
        { uid: airfoil.creator.uid },
        { $addToSet: { userAirfoils: airfoil.airfoilID } },
        { useFindAndModify: false }
      );
    }

    // Return value added
    return res.json(airfoil);
  },

  async update(req: Request<any, any, AirfoilDataType>, res: Response) {
    // Reading the resource current value
    let airfoil = await Airfoil.findOne(
      { airfoilID: Number(req.params.id) },
      null,
      { lean: true }
    );

    // Checks if the airfoil exists
    if (!airfoil) return res.status(404).send("AIRFOIL NOT FOUND");

    // Checks if the operation is authorized
    if (req.decodedIdToken?.uid !== airfoil.creator.uid)
      return res.status(401).send("CLIENT NOT AUTHORIZED TO PERFORM OPERATION");

    // Checks if it's trying to change creator field
    if (!lodash.isEqual(req.body.creator, airfoil.creator))
      return res
        .status(401)
        .send(
          "CLIENT NOT AUTHORIZED TO PERFORM OPERATION! NOT ALLOWED TO CHANGE DOCUMENT CREATOR"
        );

    // If it is authorized, perform the operation and return its result
    airfoil = await Airfoil.findOneAndUpdate(
      { airfoilID: Number(req.params.id) },
      req.body,
      { new: true, useFindAndModify: false, lean: true }
    );
    return res.json(airfoil);
  },

  async destroy(req: Request, res: Response) {
    // Reading the resource current value
    let airfoil = await Airfoil.findOne(
      { airfoilID: Number(req.params.id) },
      {},
      { lean: true }
    );

    // Checks if the airfoil exists
    if (!airfoil) return res.status(404).send("AIRFOIL NOT FOUND");

    // Checks if the operation is authorized
    if (req.decodedIdToken?.uid !== airfoil.creator.uid)
      return res.status(401).send("CLIENT NOT AUTHORIZED TO PERFORM OPERATION");

    // If it is authorized, perform the operation and return its result
    const airfoil_deleted = await Airfoil.findOneAndDelete({
      airfoilID: Number(req.params.id),
    });

    // If successfully deleted the airfoil, then uptdate user to reflect deletion
    if (airfoil_deleted) {
      await User.findOneAndUpdate(
        { uid: airfoil.creator.uid },
        { $pull: { userAirfoils: airfoil_deleted.airfoilID } },
        { useFindAndModify: false }
      );
    }

    return res.send();
  },
};
