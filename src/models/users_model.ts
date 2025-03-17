import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IUser {
  email: string;
  password: string;
  _id?: string;
  refreshToken?: string[];
  avatar?: string;
}

const userSchema = new Schema<IUser>({
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
  avatar: {
    type: String,
  },
});

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;