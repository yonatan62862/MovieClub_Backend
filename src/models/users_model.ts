import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  _id?: string;
  refreshToken?: string[];
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
  profilePicture: {
    type: String,
    default: "https://via.placeholder.com/150",
  },
});

const userModel = mongoose.model<IUser>("User", userSchema, "users");

export default userModel;
