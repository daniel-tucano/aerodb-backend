const { exec } = require('child_process')
const express = require('express')
const routes = express.Router()

const AirfoilsController = require('./controllers/AirfoilController')
const RunController = require('./controllers/RunController')
const UserController = require('./controllers/UserController')


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

// Rotas de download
routes.get('/download/project', async (req, res) => {
    function stringToBase64(str) {
        const buff = Buffer.from(str, 'utf8');
        return buff.toString('base64');
    }

    execString = "python3 createProjectZip.py"

    for(let keyValue of Object.entries(req.query)) {
        execString += ` ${stringToBase64(keyValue[0])}`
        execString += ` ${stringToBase64(keyValue[1])}`
    }

    const python = exec(execString)

    python.stdout.on('data', (projectZipPath) => {
        try {
            res.download(projectZipPath.toString().trim())
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

module.exports = routes