import mongoose, { Document } from "mongoose";

export interface UserDataType extends Document {
  uid: string;
  name: string;
  surname: string;
  userName: string;
  email: string;
  gender: string;
  yearOfBirth: Date;
  joinDate: Date;
  institution?: string;
  about: string;
  socialNetworks: {
    facebook?: string;
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  backgroundImg?: {
    path?: string;
    url?: string;
  };
  profileImg?: {
    path?: string;
    url?: string;
  };
  originalBackgroundImgPath?: string;
  originalProfileImgPath?: string;
  projects: {
    name: string;
    projectID: string;
  }[];
  userAirfoils: number[];
  favoriteAirfoils: number[];
}

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
  joinDate: {
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

export default mongoose.model<UserDataType>("User", UserMongoSchema);
