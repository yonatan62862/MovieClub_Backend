import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IUser {
  firstName?: string;  
  lastName?: string;   
  email: string;
  password?: string;  
  googleId?: string;   
  _id?: string;
  refreshToken?: string[];
  profilePicture?: string;
}

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: function () {
      return !this.googleId;  
    },
  },
  lastName: {
    type: String,
    required: function () {
      return !this.googleId;  
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;  
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, 
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
