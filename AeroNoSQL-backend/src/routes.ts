import express, { Request, Response } from 'express'
import { exec } from 'child_process'
import fs from 'fs'
import sessionLogin from './functions/sessionLogin'
const routes = express.Router()

const AirfoilsController = require('./controllers/AirfoilController')
const ProjectController = require('./controllers/ProjectController')
const RunController = require('./controllers/RunController')
const UserController = require('./controllers/UserController')

// CSRF Route
routes.get('/csrf-token', (req,res) => res.json({ csrfToken: req.csrfToken() }))

// Session Token Route
routes.post('/sessionLogin', sessionLogin)

// Airfoil Routes
routes.get('/airfoils', AirfoilsController.index)
routes.get('/airfoils/:id', AirfoilsController.show)
routes.post('/airfoils', AirfoilsController.store)
routes.put('/airfoils/:id', AirfoilsController.update)
routes.delete('/airfoils/:id', AirfoilsController.destroy)

// Runs Routes
routes.get('/runs', RunController.index)
routes.get('/runs/:id', RunController.show)
routes.post('/runs', RunController.store)
routes.put('/runs/:id', RunController.update)
routes.delete('/runs/:id', RunController.destroy)

// Users Routes
routes.get('/users', UserController.index)
routes.get('/users/:id', UserController.show)
routes.post('/users', UserController.store)
routes.put('/users/:id', UserController.update)
routes.delete('/users/:id', UserController.destroy)

// Project Routes
routes.get('/projects', ProjectController.index)
routes.get('/projects/:id', ProjectController.show)
routes.post('/projects', ProjectController.store)
routes.put('/projects/:id', ProjectController.update)
routes.delete('/projects/:id', ProjectController.destroy)


// Rotas de download

// Download de projeto
routes.get('/download/project', async (req: Request, res: Response) => {
    function stringToBase64(str: string) {
        const buff = Buffer.from(str, 'utf8');
        return buff.toString('base64');
    }

    let execString = "python3 ./src/createProjectZip.py"

    for(let keyValue of Object.entries(req.query)) {
        execString += ` ${stringToBase64(keyValue[0] as string)}`
        execString += ` ${stringToBase64(keyValue[1] as string)}`
    }

    const python = exec(execString)

    console.log(execString)
    console.log(`executando script em python`)
    python.stdout.on('data', (projectZipPath) => {
        
        try {
            res.download(projectZipPath.toString().trim(), (error) => {
                if (error) {
                    res.send('an error has ocurred')
                }else {
                    console.log(`script em python executado com sucesso`)
                    fs.unlink(projectZipPath.toString().trim(), (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log('arquivo deletado com sucesso')
                        }
                    })
                }
            })
        } catch {
            res.send('an error has ocurred')
        }
    })
    
    python.on('exit', (code) => {
        if (code === 1) {
            res.send('an error has ocurred')
        }
    })

})

// Download de arquivo de aerofolio .mat
routes.get('/download/airfoilMatFile', async (req: Request, res: Response) => {
    function stringToBase64(str: string) {
        const buff = Buffer.from(str, 'utf8');
        return buff.toString('base64');
    }

    let execString = "python3 ./src/airfoilMatFileDownload.py"

    for(let keyValue of Object.entries(req.query)) {
        execString += ` ${stringToBase64(keyValue[0] as string)}`
        execString += ` ${stringToBase64(keyValue[1] as string)}`
    }

    const python = exec(execString)

    console.log(execString)
    console.log(`executando script em python`)
    python.stdout.on('data', (airfoilMatFilePath: string) => {
        
        try {
            console.log(airfoilMatFilePath)
            res.download(airfoilMatFilePath.toString().trim(), (error) => {
                if (error) {
                    res.send(airfoilMatFilePath.toString().trim())
                }else {
                    console.log(`script em python executado com sucesso`)
                    fs.unlink(airfoilMatFilePath.toString().trim(), (err) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log('arquivo deletado com sucesso')
                        }
                    })
                }
            })
        } catch {
            console.log(`ocorreu um erro ao enviar o arquivo ${airfoilMatFilePath} para download`)
            res.send('an error has ocurred')
        }
    })
    
    python.on('exit', (code) => {
        if (code === 1) {
            res.send('an error has ocurred')
        }
    })

})

export default routes