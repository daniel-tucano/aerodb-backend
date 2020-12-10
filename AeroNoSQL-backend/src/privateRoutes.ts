import express from "express";
import multerImg from "./functions/multerImg";
const privateRoutes = express.Router();

const AirfoilsController = require("./controllers/AirfoilController");
const ProjectController = require("./controllers/ProjectController");
const RunController = require("./controllers/RunController");
const UserController = require("./controllers/UserController");

// Airfoil Private Routes
privateRoutes.post("/airfoils", AirfoilsController.store);
privateRoutes.put("/airfoils/:id", AirfoilsController.update);
privateRoutes.delete("/airfoils/:id", AirfoilsController.destroy);

// Runs Private Routes
privateRoutes.post("/runs", RunController.store);
privateRoutes.put("/runs/:id", RunController.update);
privateRoutes.delete("/runs/:id", RunController.destroy);

// Users Private Routes
privateRoutes.post("/users", UserController.store);
privateRoutes.put("/users/:id", UserController.update);
privateRoutes.delete("/users/:id", UserController.destroy);
privateRoutes.post(
  "/users/upload/profile-image/:id",
  multerImg("profile-image"),
  UserController.uploadProfileImg
);
privateRoutes.post(
  "/users/upload/background-image/:id",
  multerImg("background-image"),
  UserController.uploadBackgroundImg
);

// Project Private Routes
privateRoutes.get("/projects", ProjectController.index);
privateRoutes.get("/projects/:id", ProjectController.show);
privateRoutes.post("/projects", ProjectController.store);
privateRoutes.put("/projects/:id", ProjectController.update);
privateRoutes.delete("/projects/:id", ProjectController.destroy);

export default privateRoutes;
