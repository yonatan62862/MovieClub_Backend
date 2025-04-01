import { Document, Schema, model } from "mongoose";

export interface IMessage extends Document {
  content: string;
  senderId: string;
  receiverId: string;
  chatId: string;
  createdAt: Date;
}

export const MessageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: [true, "Message is missing."],
    },
    senderId: {
      type: String,
      required: [true, "Sender user is missing."],
    },
    receiverId: {
      type: String,
      required: [true, "Receiver user is missing."],
    },
    chatId: {
      type: String,
      required: [true, "Chat id is missing."],
    },
    createdAt: { type: Date },
  },
  {
    versionKey: false,
    id: false,
    toJSON: {
      virtuals: true,
    },
  }
);

MessageSchema.virtual("sender", {
  ref: "User",
  foreignField: "_id",
  localField: "senderId",
  justOne: true,
});
MessageSchema.virtual("receiver", {
  ref: "User",
  foreignField: "_id",
  localField: "receiverId",
  justOne: true,
});
MessageSchema.virtual("chat", {
  ref: "Chat",
  foreignField: "_id",
  localField: "chatId",
  justOne: true,
});

export const Message = model<IMessage>("Message", MessageSchema, "messages");