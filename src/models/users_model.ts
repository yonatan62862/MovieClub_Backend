import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IUser {
<<<<<<< HEAD
=======
  firstName: string;
  lastName: string;
>>>>>>> server_branch
  email: string;
  password: string;
  _id?: string;
  refreshToken?: string[];
<<<<<<< HEAD
  avatar?: string;
}

const userSchema = new Schema<IUser>({
=======
  profilePicture?: string;
}

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
>>>>>>> server_branch
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: [String],
    default: [],
  },
<<<<<<< HEAD
  avatar: {
    type: String,
=======
  profilePicture: {
    profilePicture: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
>>>>>>> server_branch
  },
});

const userModel = mongoose.model<IUser>("Users", userSchema);

<<<<<<< HEAD
export default userModel;
=======
export default userModel;
>>>>>>> server_branch
