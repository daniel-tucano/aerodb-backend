const baseUser = {
    uid: "jiy2AEaXb2WV3MI3hYhWEdyFRgC2",
    name: "mock name",
    userName: "@mockUserName",
    email: "user@example.com'",
    gender: "male",
    yearOfBirth: new Date(1999, 2, 8, 0, 0, 0, 0),
    institution: "mock institution",
    about: "mock about",
    projects: [],
    userAirfoils: [],
    favoriteAirfoils: []
}

export default {
    user: baseUser,

    updatedUser: {...baseUser, userAirfoils: [1]},

    uid: '5fb61a86bdde2cd499a537da',

    firebaseUser: {
        uid: "jiy2AEaXb2WV3MI3hYhWEdyFRgC2",
        email: 'user@example.com',
        emailVerified: false,
        phoneNumber: '+11234567890',
        password: 'secretPassword',
        displayName: 'mock name',
        photoURL: 'http://www.example.com/12345678/photo.png',
        disabled: false
    }
}
