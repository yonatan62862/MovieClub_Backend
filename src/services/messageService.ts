import mongoose from "mongoose";
import { Chat, IChat } from "../models/chatModel";
import { ResourceNotFoundError, ValidationError } from "../client_errors/clientErrors";
import { IMessage, Message } from "../models/messageModel";
import { chatsService } from "./chatService";
import { socketService } from "./socketService";


class MessagesService {
  public async sendMessage(message: IMessage): Promise<IMessage> {
    try {
      const chat = await chatsService.getChat(message.chatId);
      const messageReceiverId = new mongoose.Types.ObjectId(message.receiverId);
      await this.handleDeletedMessages(chat, messageReceiverId);

      const errors = message.validateSync();
      if (errors) {
        throw new ValidationError(errors.message);
      }
      message.createdAt = new Date();

      message = await Message.create(message);
      await Chat.findByIdAndUpdate(
        message.chatId,
        { $push: { messages: message._id }, updatedAt: new Date() },
        { new: true }
      );
      return message;
    } catch (error: any) {
      console.error("Error in sendMessage:", error.message);
      throw error;
    }
  }

  private async handleDeletedMessages(
    chat: IChat,
    receiverId: mongoose.Types.ObjectId
  ): Promise<void> {
    const isDeleted = chat.deleteHistory.find((c) =>
      c.userId.equals(receiverId)
    );
    if (isDeleted) {
      chat.deletedBy = chat.deleteHistory.filter((c) =>
        c.userId.equals(receiverId)
      );
      chat.messages = chat.messages.filter((msg) => {
        return (
          new Date(msg.createdAt).getTime() >=
          new Date(isDeleted.deletedAt).getTime()
        );
      });
      chat.updatedAt = new Date();
      await Chat.findByIdAndUpdate(
        chat._id,
        { deletedBy: [], updatedAt: new Date() },
        { new: true }
      );
      socketService.emitChat(chat);
    }
  }

  public async deleteMessage(messageId: string): Promise<void> {
    const messageToDelete = await Message.findByIdAndDelete({ _id: messageId });
    if (!messageToDelete) throw new ResourceNotFoundError(messageId);
    const chatId = messageToDelete.chatId;
    await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { messages: messageId },
      },
      { new: true }
    );
  }

}
export const messagesService = new MessagesService();