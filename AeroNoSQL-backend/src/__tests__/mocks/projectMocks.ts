import _ from 'lodash'

const baseInsertProject = {
    creator: {
        name: "mock user",
        userName: "@mockUser",
        userID: "jiy2AEaXb2WV3MI3hYhWEdyFRgC2"
    },
    name: "Projeto Teste",
    airfoils: [{
        airfoilID: 1,
        name: "mock airfoil",
        geometrie: {
            side: ["Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom"],
            x: [1, 0.95, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2, 0.15, 0.1, 0.075, 0.05, 0.025, 0.0125, 0, 0.0125, 0.025, 0.05, 0.075, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1],
            y: [0.0016, 0.0124, 0.0229, 0.0428, 0.061, 0.0771, 0.0905, 0.1002, 0.1048, 0.1044, 0.1013, 0.0934, 0.078, 0.0664, 0.0513, 0.0317, 0.0193, 0, -0.005, -0.0042, -0.001, 0.0028, 0.0068, 0.0145, 0.0217, 0.0282, 0.0333, 0.0385, 0.0386, 0.035, 0.0286, 0.0202, 0.01, 0.0044, -0.0016]
        },
        runsData: [{
            runID: 1,
            mach: 0,
            reynolds: 100000
        },
        {
            runID: 2,
            mach: 0,
            reynolds: 120000
        }]
    },
    {
        airfoilID: 2,
        name: "mock airfoil 2",
        geometrie: {
            side: ["Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Top", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom", "Bottom"],
            x: [1, 0.95, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2, 0.15, 0.1, 0.075, 0.05, 0.025, 0.0125, 0, 0.0125, 0.025, 0.05, 0.075, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1],
            y: [0.0016, 0.0124, 0.0229, 0.0428, 0.061, 0.0771, 0.0905, 0.1002, 0.1048, 0.1044, 0.1013, 0.0934, 0.078, 0.0664, 0.0513, 0.0317, 0.0193, 0, -0.005, -0.0042, -0.001, 0.0028, 0.0068, 0.0145, 0.0217, 0.0282, 0.0333, 0.0385, 0.0386, 0.035, 0.0286, 0.0202, 0.01, 0.0044, -0.0016]
        },
        runsData: [{
            runID: 3,
            mach: 0,
            reynolds: 100000
        },
        {
            runID: 4,
            mach: 0,
            reynolds: 120000
        }]
    }
    ]
}

const updatedProject = _.cloneDeep(baseInsertProject)

updatedProject.airfoils[0].runsData.push({ runID: 5, mach: 0, reynolds: 100000 })

const invalidAirfoilProject = _.cloneDeep(baseInsertProject)

invalidAirfoilProject.airfoils[0].airfoilID = 100

const invalidRunProject = _.cloneDeep(baseInsertProject)

invalidRunProject.airfoils[0].runsData[0].runID = 100

export default {

    authorizedProject: _.cloneDeep(baseInsertProject),

    unauthorizedUserIDProject: { ...baseInsertProject, creator: { name: "mock user", userName: "@mockUser", userID: "123" } },

    updatedProject ,

    unauthorizedCreatorProject: { ...baseInsertProject, creator:{ name: "mocking bird user", userName: "@mockingBirdUser", userID: "jiy2AEaXb2WV3MI3hYhWEdyFRgC2" } },

    invalidAirfoilProject ,

    invalidRunProject ,
    
}