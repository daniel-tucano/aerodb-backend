const admin = require('firebase-admin')
// Initializes firebase admin SDK. File with app configuration and enviroment variable pointing to it is needed
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

// Verify if the resource belongs to the client who made the request
const verifyOwnership = async (authJWT, resource) => {

    let isOwner = Boolean()

    try {

        // Checks if the auth JWT was signed correctly
        decodedAuthJWT = await admin.auth().verifyIdToken(authJWT)
        
        if(resource.creator.userId) {
            isOwner = decodedAuthJWT.uid === resource.creator.userId
        }else if(resource.creator) {
            isOwner = decodedAuthJWT.uid === resource.creator
            console.log(decodedAuthJWT.uid)
            console.log(resource)
            console.log(`inside resource.creator, isOwner: ${isOwner}`)
        }
    
        return isOwner

    } catch(error) {
        isOwner = false
    
        console.log("CLIENT NOT AUTHORIZED: an error ocurred while verifying auth JWT signature")
        console.log(error)
    
        return isOwner
    }

}

exports.authorizeOperation = async (req, resource) => {

    let isOwner = Boolean()

    let isAuthorized = Boolean()

    // Verifify if some authorization cookie was send with the request
    if (req.cookies.authJWT) {
        // Verify if the client own the resource
        isOwner = await verifyOwnership(req.cookies.authJWT, resource)

        if (isOwner) {
            // If the client own the resource it is authorized to do the operation
            isAuthorized = true
        } else {
            // Otherwise it is not
            isAuthorized = false

            // Logs the status on the console
            console.log("CLIENT NOT AUTHORIZED: client do not own the resourse")
        }

    } else {
        // If no authorization cookie was sent the client is not authorized to do the operation
        isAuthorized = false

        // Logs the status on the console
        console.log("CLIENT NOT AUTHORIZED: authJWT was not provided")
    }

    // Return the resulting authorization status
    return isAuthorized

}