import mongoose, { Document, Schema, model } from "mongoose";
import { IMessage } from "./messageModel";

type Delete = {
  userId: mongoose.Types.ObjectId;
  deletedAt: Date;
};

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  messages: IMessage[];
  deletedBy: Delete[];
  createdAt: Date;
  updatedAt: Date;
  deleteHistory: Delete[];
}

export const ChatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        required: [true, "Participant is missing."],
        ref: "User",
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    deletedBy: [
      {
        userId: { type: Schema.Types.ObjectId },
        deletedAt: { type: Date },
      },
    ],
    deleteHistory: [
      {
        userId: { type: Schema.Types.ObjectId },
        deletedAt: { type: Date },
      },
    ],
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    versionKey: false,
    id: false,
    toJSON: { virtuals: true },
  }
);

export const Chat = model<IChat>("Chat", ChatSchema, "chats");