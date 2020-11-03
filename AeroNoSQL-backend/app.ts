import express, { Express } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import csurf from 'csurf'
import routes from './src/routes'
import admin from 'firebase-admin'

interface IEnv {
    CORS_ORIGIN: string
    MONGODB_URI: string
    MONGODB_USER: string
    MONGODB_PASSWORD: string
}

class AppController {
    express: Express
    env!: IEnv
    fireApp!: admin.app.App

    constructor() {
        this.express = express()

        this.setEnviromentVariables()
        this.dbConnect()
        this.setFirebase()
        this.middlewares()
        this.routes()
    }

    private setEnviromentVariables() {
        // Load enviroment variables if not in production
        if (process.env.NODE_ENV !== 'production') {
            require('dotenv').config({
                path: process.env.NODE_ENV === "test" ? ".env.test" : ".env"
            })
        }

        const { CORS_ORIGIN, MONGODB_URI, MONGODB_USER, MONGODB_PASSWORD } = process.env

        // Checks if all enviroment variables exists
        if (!CORS_ORIGIN || !MONGODB_URI || !MONGODB_USER || !MONGODB_PASSWORD) {
            throw new Error("Some enviroment variable is missign");
        } else {
            this.env = { CORS_ORIGIN, MONGODB_URI, MONGODB_USER, MONGODB_PASSWORD }
        }
    }

    private dbConnect() {
        // Iniciando Banco de dados
        mongoose.connect(this.env.MONGODB_URI as string,
            { useNewUrlParser: true, useUnifiedTopology: true, auth: { user: this.env.MONGODB_USER, password: this.env.MONGODB_PASSWORD } } as mongoose.ConnectionOptions).then(() => {
                console.log('Conexão com o mongoose deu certo')
            }).catch((erro) => {
                console.log('conexão com mongoose falhou')
                console.log(erro)
            })
    }

    private setFirebase() {
        // Initializes firebase admin SDK. File with app configuration and enviroment variable pointing to it is needed
        this.fireApp = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    }

    private middlewares() {
        this.express.use(express.json())
        this.express.use(cookieParser())
        this.express.use(cors({ origin: this.env.CORS_ORIGIN.split(','), credentials: true }))
        this.express.use(csurf({ cookie: true }))
    }

    private routes() {
        this.express.use(routes)
    }
}

export default new AppController()
