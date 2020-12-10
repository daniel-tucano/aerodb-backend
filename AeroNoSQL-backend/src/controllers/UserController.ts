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

    // Obtain current user data
    const currentUserData = uid
      ? await User.findOne({ uid: req.params.id as string })
      : await User.findById(req.params.id);

    if (!currentUserData) return res.status(404).send("USER DON'T EXISTS");

    const uploadedFilePath = `${req.params.id}/${req.file.filename}`;

    // Delete file if it exists and the path propertie exists
    if (original) {
      currentUserData.originalProfileImgPath &&
        admin
          .storage()
          .bucket()
          .file(currentUserData.originalProfileImgPath)
          .delete()
          .then(() => {
            console.log(`${currentUserData.originalProfileImgPath} deleted`);
          })
          .catch(() => {
            console.log(
              `${currentUserData.originalProfileImgPath} was not deleted`
            );
          });
    } else {
      currentUserData.profileImg &&
        currentUserData.profileImg.path &&
        admin
          .storage()
          .bucket()
          .file(currentUserData.profileImg.path)
          .delete()
          .then(() => {
            console.log(`${currentUserData.profileImg?.path} deleted`);
          })
          .catch(() => {
            console.log(`${currentUserData.profileImg?.path} was not deleted`);
          });
    }

    // Upload file to the cloud
    const uploadResponse = await admin
      .storage()
      .bucket()
      .upload(req.file.path, {
        destination: uploadedFilePath,
      });

    console.log(`${req.file.filename} uploaded to cloud.`);

    // Delete file from local storage
    fs.unlink(req.file.path, (err) => {
      err
        ? console.log(err)
        : console.log(`${req.file.filename} deleted from local storage`);
    });

    await uploadResponse[0].makePublic();

    const url = `https://storage.googleapis.com/aero-no-sql-dev.appspot.com/${req.params.id}%2F${req.file.filename}`;

    // Data to be updated on user to reflect the new image upload
    const updateData = {
      ...(original
        ? { originalProfileImgPath: uploadedFilePath }
        : { profileImg: { url, path: uploadedFilePath } }),
    };

    uid
      ? await User.findOneAndUpdate({ uid: req.params.id }, updateData, {
          new: true,
          useFindAndModify: false,
        })
      : await User.findByIdAndUpdate(req.params.id, updateData, {
          new: true,
          useFindAndModify: false,
        });

    return res.status(200).send(url);
  },
  async uploadBackgroundImg(req: Request, res: Response) {
    const uid = req.query.uid !== "false";
    const original = req.query.original !== "false";

    if (req.params.id !== req.decodedIdToken?.uid)
      return res.status(401).send("CLIENT NOT AUTHORIZED TO PERFORM OPERATION");

    // Obtain current user data
    const currentUserData = uid
      ? await User.findOne({ uid: req.params.id as string })
      : await User.findById(req.params.id);

    if (!currentUserData) return res.status(404).send("USER DON'T EXISTS");

    const uploadedFilePath = `${req.params.id}/${req.file.filename}`;

    // Delete file if it exists and the path propertie exists
    if (original) {
      currentUserData.originalBackgroundImgPath &&
        admin
          .storage()
          .bucket()
          .file(currentUserData.originalBackgroundImgPath)
          .delete()
          .then(() => {
            console.log(`${currentUserData.originalBackgroundImgPath} deleted`);
          })
          .catch(() => {
            console.log(
              `${currentUserData.originalBackgroundImgPath} was not deleted`
            );
          });
    } else {
      currentUserData.backgroundImg &&
        currentUserData.backgroundImg.path &&
        admin
          .storage()
          .bucket()
          .file(currentUserData.backgroundImg.path)
          .delete()
          .then(() => {
            console.log(`${currentUserData.backgroundImg?.path} deleted`);
          })
          .catch(() => {
            console.log(
              `${currentUserData.backgroundImg?.path} was not deleted`
            );
          });
    }

    // Upload file to the cloud
    const uploadResponse = await admin
      .storage()
      .bucket()
      .upload(req.file.path, {
        destination: uploadedFilePath,
      });

    console.log(`${req.file.filename} uploaded to cloud.`);

    // Delete file from local storage
    fs.unlink(req.file.path, (err) => {
      err
        ? console.log(err)
        : console.log(`${req.file.filename} deleted from local storage`);
    });

    await uploadResponse[0].makePublic();

    const url = `https://storage.googleapis.com/aero-no-sql-dev.appspot.com/${req.params.id}%2F${req.file.filename}`;

    // Data to be updated on user to reflect the new image upload
    const updateData = {
      ...(original
        ? { originalBackgroundImgPath: uploadedFilePath }
        : { backgroundImg: { url, path: uploadedFilePath } }),
    };

    uid
      ? await User.findOneAndUpdate({ uid: req.params.id }, updateData, {
          new: true,
          useFindAndModify: false,
        })
      : await User.findByIdAndUpdate(req.params.id, updateData, {
          new: true,
          useFindAndModify: false,
        });

    return res.status(200).send(url);
  },
};
