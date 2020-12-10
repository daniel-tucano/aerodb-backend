const baseUser = {
  uid: "jiy2AEaXb2WV3MI3hYhWEdyFRgC2",
  name: "mock name",
  surname: "mock surname",
  userName: "@mockUserName",
  email: "user@example.com'",
  gender: "male",
  yearOfBirth: new Date(1999, 2, 8, 0, 0, 0, 0),
  institution: "mock institution",
  about: "mock about",
  socialNetworks: {
    facebook: "facebook.com/mockFacebook",
    twitter: "twitter.com/mockTwitter",
    github: "gihub.com/mockGithub",
    linkedin: "linkedin.com/mockLinkedin",
  },
  backgroundImg: {
    path: "",
    url: "https://miro.medium.com/max/700/1*92adf06PCF91kCYu1nPLQg.jpeg",
  },
  profileImg: {
    path: "",
    url:
      "https://lh3.googleusercontent.com/ogw/ADGmqu-KvG4tQiXYmFk6tmbvWkC0oUs9ZSCZ7XzLrGjK=s83-c-mo",
  },
  projects: [],
  userAirfoils: [],
  favoriteAirfoils: [],
};

export default {
  user: baseUser,

  updatedUser: { ...baseUser, userAirfoils: [1] },

  uid: "5fb61a86bdde2cd499a537da",

  firebaseUser: {
    uid: "jiy2AEaXb2WV3MI3hYhWEdyFRgC2",
    email: "user@example.com",
    emailVerified: false,
    phoneNumber: "+11234567890",
    password: "secretPassword",
    displayName: "mock name",
    photoURL: "http://www.example.com/12345678/photo.png",
    disabled: false,
  },
};
