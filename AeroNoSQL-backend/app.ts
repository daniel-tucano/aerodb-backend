import express, { Express } from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import bearerToken from "express-bearer-token";
import publicRoutes from "./src/publicRoutes";
import privateRoutes from "./src/privateRoutes";
import verifyToken from "./src/functions/verifyToken";
import cleanBodyFields from "./src/functions/cleanBodyFields";
import addODataQuery from "./src/functions/addODataQuery";
import admin from "firebase-admin";

interface IEnv {
  CORS_ORIGIN: string;
  MONGO_URL: string;
  MONGODB_USER: string;
  MONGODB_PASSWORD: string;
  NODE_ENV: string;
}

export class AppController {
  express: Express;
  env!: IEnv;
  fireApp!: admin.app.App;
  mongoose!: typeof mongoose;

  constructor() {
    this.express = express();

    this.setEnviromentVariables();
    this.dbConnect();
    this.setFirebase();
    this.middlewares();
    this.routes();
  }

  private setEnviromentVariables() {
    // Load enviroment variables if not in production
    if (process.env.NODE_ENV !== "production") {
      let dotenvConfig;

      if (process.env.NODE_ENV === "test_unit") {
        dotenvConfig = { path: ".test.unit.env" };
      } else if (process.env.NODE_ENV === "test_integration") {
        dotenvConfig = { path: ".test.integration.env" };
      } else {
        dotenvConfig = { path: ".env" };
      }

      require("dotenv").config(dotenvConfig);
    }

    const {
      CORS_ORIGIN,
      MONGO_URL,
      MONGODB_USER,
      MONGODB_PASSWORD,
      NODE_ENV,
    } = process.env;

    this.env = {
      CORS_ORIGIN,
      MONGO_URL,
      MONGODB_USER,
      MONGODB_PASSWORD,
      NODE_ENV,
    } as IEnv;
  }

  private dbConnect() {
    // Iniciando Banco de dados

    const auth =
      this.env.MONGODB_USER && this.env.MONGODB_PASSWORD
        ? { user: this.env.MONGODB_USER, password: this.env.MONGODB_PASSWORD }
        : undefined;

    mongoose
      .connect(
        this.env.MONGO_URL as string,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          auth,
        } as mongoose.ConnectionOptions
      )
      .then((mongoose) => {
        console.log("Conexão com o mongoose deu certo");
        this.mongoose = mongoose;
      })
      .catch((erro) => {
        console.log("conexão com mongoose falhou");
        console.log(erro);
      });
  }

  private setFirebase() {
    // If not in test enviroment initializes firebase admin SDK. File with app configuration and enviroment variable pointing to it is needed
    if (
      this.env.NODE_ENV !== "test_unit" &&
      this.env.NODE_ENV !== "test_integration"
    ) {
      this.fireApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: "aero-no-sql-dev.appspot.com",
      });
    }
  }

  private middlewares() {
    this.express.use(express.json());
    this.express.use(cookieParser());
    this.express.use(
      cors({ origin: this.env.CORS_ORIGIN?.split(","), credentials: true })
    );
    this.express.use(bearerToken());
    this.express.use(cleanBodyFields);
    this.express.use(addODataQuery);
  }

  private routes() {
    this.express.use(publicRoutes);
    this.express.use(verifyToken);
    this.express.use(privateRoutes);
  }
}

export default new AppController();
