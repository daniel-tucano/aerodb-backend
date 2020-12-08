import express, { Request, Response } from "express";
import { exec } from "child_process";
import fs from "fs";
const publicRoutes = express.Router();

const AirfoilsController = require("./controllers/AirfoilController");
const RunController = require("./controllers/RunController");
const UserController = require("./controllers/UserController");

// Airfoil Public Routes
publicRoutes.get("/airfoils", AirfoilsController.index);
publicRoutes.get("/airfoils/:id", AirfoilsController.show);

// Runs Public Routes
publicRoutes.get("/runs", RunController.index);
publicRoutes.get("/runs/:id", RunController.show);

// Users Public Routes
publicRoutes.get("/users", UserController.index);
publicRoutes.get("/users/:id", UserController.show);

// Download Public Routes

// Download de projeto
publicRoutes.get("/download/project", async (req: Request, res: Response) => {
  function stringToBase64(str: string) {
    const buff = Buffer.from(str, "utf8");
    return buff.toString("base64");
  }

  let execString = "python3 ./src/createProjectZip.py";

  for (let keyValue of Object.entries(req.query)) {
    execString += ` ${stringToBase64(keyValue[0] as string)}`;
    execString += ` ${stringToBase64(keyValue[1] as string)}`;
  }

  const python = exec(execString);

  console.log(execString);
  console.log(`executando script em python`);
  python.stdout.on("data", (projectZipPath) => {
    try {
      res.download(projectZipPath.toString().trim(), (error) => {
        if (error) {
          res.send("an error has ocurred");
        } else {
          console.log(`script em python executado com sucesso`);
          fs.unlink(projectZipPath.toString().trim(), (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log("arquivo deletado com sucesso");
            }
          });
        }
      });
    } catch {
      res.send("an error has ocurred");
    }
  });

  python.on("exit", (code) => {
    if (code === 1) {
      res.send("an error has ocurred");
    }
  });
});

// Download de arquivo de aerofolio .mat
publicRoutes.get(
  "/download/airfoilMatFile",
  async (req: Request, res: Response) => {
    function stringToBase64(str: string) {
      const buff = Buffer.from(str, "utf8");
      return buff.toString("base64");
    }

    let execString = "python3 ./src/airfoilMatFileDownload.py";

    for (let keyValue of Object.entries(req.query)) {
      execString += ` ${stringToBase64(keyValue[0] as string)}`;
      execString += ` ${stringToBase64(keyValue[1] as string)}`;
    }

    const python = exec(execString);

    console.log(execString);
    console.log(`executando script em python`);
    python.stdout.on("data", (airfoilMatFilePath: string) => {
      try {
        console.log(airfoilMatFilePath);
        res.download(airfoilMatFilePath.toString().trim(), (error) => {
          if (error) {
            res.send(airfoilMatFilePath.toString().trim());
          } else {
            console.log(`script em python executado com sucesso`);
            fs.unlink(airfoilMatFilePath.toString().trim(), (err) => {
              if (err) {
                console.log(err);
              } else {
                console.log("arquivo deletado com sucesso");
              }
            });
          }
        });
      } catch {
        console.log(
          `ocorreu um erro ao enviar o arquivo ${airfoilMatFilePath} para download`
        );
        res.send("an error has ocurred");
      }
    });

    python.on("exit", (code) => {
      if (code === 1) {
        res.send("an error has ocurred");
      }
    });
  }
);

export default publicRoutes;
