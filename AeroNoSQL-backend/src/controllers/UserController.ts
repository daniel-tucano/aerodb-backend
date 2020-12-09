import User from "../models/Users";
import admin from "firebase-admin";
import fs from "fs";
import { Request, Response } from "express";
import { paginate } from "../functions/paginate";

module.exports = {
  async index(req: Request, res: Response) {
    let { page = 1, limit = 10 } = req.query;
    const estimatedDocumentCount = req.query.estimatedDocumentCount !== "false";
    page = Number(page);
    limit = Number(limit);

    // Checks if page and limit query parameters are valid
    if (!(Number.isInteger(page) && Number.isInteger(limit)))
      return res.status(400).send("PAGE AND LIMIT PARAMETERS MUST BE NUMBERS");

    const users = await paginate(User, req.ODataFilter, req.ODataSort, {
      page,
      limit,
      estimatedDocumentCount,
    });

    return res.json(users);
  },

  async show(req: Request, res: Response) {
    const uid = req.params.uid !== "false";

    const user = uid
      ? await User.findOne({ uid: req.params.id })
      : await User.findById(req.params.id);

    return res.json(user);
  },

  async store(req: Request, res: Response) {
    const user = await User.create(req.body);

    return res.json(user);
  },

  async update(req: Request, res: Response) {
    const uid = req.params.uid !== "false";

    if (req.params.id !== req.decodedIdToken?.uid)
      return res.status(401).send("CLIENT NOT AUTHORIZED TO PERFORM OPERATION");

    const user = uid
      ? await User.findOneAndUpdate({ uid: req.params.id }, req.body, {
          new: true,
          useFindAndModify: false,
        })
      : await User.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          useFindAndModify: false,
        });

    if (!user) return res.status(404).send("USER DON'T EXISTS");

    return res.json(user);
  },

  async destroy(req: Request, res: Response) {
    const uid = req.params.uid !== "false";

    if (req.params.id !== req.decodedIdToken?.uid)
      return res.status(401).send("CLIENT NOT AUTHORIZED TO PERFORM OPERATION");

    const user = uid
      ? await User.findOneAndRemove({ uid: req.params.id })
      : await User.findByIdAndRemove(req.params.id);

    if (!user) return res.status(404).send("USER DON'T EXISTS");

    return res.send();
  },

  async uploadProfileImg(req: Request, res: Response) {
    const uid = req.query.uid !== "false";
    const original = req.query.original !== "false";

    if (req.params.id !== req.decodedIdToken?.uid)
      return res.status(401).send("CLIENT NOT AUTHORIZED TO PERFORM OPERATION");

    const uploadResponse = await admin
      .storage()
      .bucket()
      .upload(req.file.path, {
        destination: `${req.params.id}/${req.file.filename}`,
      });

    console.log(`${req.file.filename} uploaded to cloud.`);

    fs.unlink(req.file.path, (err) => {
      err
        ? console.log(err)
        : console.log(`${req.file.filename} deleted from local storage`);
    });

    await uploadResponse[0].makePublic();

    const url = `https://storage.googleapis.com/aero-no-sql-dev.appspot.com/${req.params.id}/${req.file.filename}`;

    const user = uid
      ? await User.findOneAndUpdate(
          { uid: req.params.id },
          {
            [original ? "originalProfileImgPath" : "profileImgUrl"]: original
              ? `${req.params.id}/${req.file.filename}`
              : url,
          },
          {
            new: true,
            useFindAndModify: false,
          }
        )
      : await User.findByIdAndUpdate(
          req.params.id,
          {
            [original ? "originalProfileImgPath" : "profileImgUrl"]: original
              ? `${req.params.id}/${req.file.filename}`
              : url,
          },
          {
            new: true,
            useFindAndModify: false,
          }
        );

    if (!user) return res.status(404).send("USER DON'T EXISTS");

    return res.status(200).send(url);
  },
  async uploadBackgroundImg(req: Request, res: Response) {
    const uid = req.query.uid !== "false";
    const original = req.query.original !== "false";

    if (req.params.id !== req.decodedIdToken?.uid)
      return res.status(401).send("CLIENT NOT AUTHORIZED TO PERFORM OPERATION");

    const uploadResponse = await admin
      .storage()
      .bucket()
      .upload(req.file.path, {
        destination: `${req.params.id}/${req.file.filename}`,
      });

    console.log(`${req.file.filename} uploaded to cloud.`);

    fs.unlink(req.file.path, (err) => {
      err
        ? console.log(err)
        : console.log(`${req.file.filename} deleted from local storage`);
    });

    await uploadResponse[0].makePublic();

    const url = `https://storage.googleapis.com/aero-no-sql-dev.appspot.com/${req.params.id}/${req.file.filename}`;

    const user = uid
      ? await User.findOneAndUpdate(
          { uid: req.params.id },
          {
            [original
              ? "originalBackgroundImgPath"
              : "backgroundImgUrl"]: original
              ? `${req.params.id}/${req.file.filename}`
              : url,
          },
          {
            new: true,
            useFindAndModify: false,
          }
        )
      : await User.findByIdAndUpdate(
          req.params.id,
          {
            [original
              ? "originalBackgroundImgPath"
              : "backgroundImgUrl"]: original
              ? `${req.params.id}/${req.file.filename}`
              : url,
          },
          {
            new: true,
            useFindAndModify: false,
          }
        );

    if (!user) return res.status(404).send("USER DON'T EXISTS");

    return res.status(200).send(url);
  },
};
