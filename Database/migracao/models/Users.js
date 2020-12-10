const mongoose = require('mongoose')

const UserMongoSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  yearOfBirth: {
    type: Date,
    required: true,
  },
  institution: {
    type: String,
    required: false,
  },
  about: {
    type: String,
    required: true,
  },
  socialNetworks: {
    type: mongoose.SchemaTypes.Map,
    required: true,
    facebook: {
      type: String,
      required: false,
    },
    twitter: {
      type: String,
      required: false,
    },
    github: {
      type: String,
      required: false,
    },
    linkedin: {
      type: String,
      required: false,
    },
  },
  backgroundImg: {
    path: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
    required: false,
  },
  originalBackgroundImgPath: {
    type: String,
    required: false,
  },
  profileImg: {
    path: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
    required: false,
  },
  originalProfileImgPath: {
    type: String,
    required: false,
  },
  projects: [
    {
      name: String,
      projectID: String,
    },
  ],
  userAirfoils: [Number],
  favoriteAirfoils: [Number],
});

mongoose.model('User',UserMongoSchema)