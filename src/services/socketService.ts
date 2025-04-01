import { Server as httpServer } from "http";
import { Socket, Server as SocketServer } from "socket.io";
import { Chat, IChat } from "../models/chatModel";
import { IMessage, Message } from "../models/messageModel";
import { chatsService } from "./chatService";
import { messagesService } from "./messageService";

class SocketService {
  private socketServer: SocketServer | null = null;

  public handleSocketMessages(httpServer: httpServer) {
    const options = {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    };
    this.socketServer = new SocketServer(httpServer, options);

    this.socketServer.sockets.on("connection", (socket: Socket) => {
      console.log(`Client has been connected ${socket.id}.`);

      socket.on("sendMessage", async (msg: IMessage) => {
        console.log("Client sent message.");
        const newMessage = new Message(msg);
        const message = await messagesService.sendMessage(newMessage);
        this.socketServer?.sockets.emit("sendMessage", message);
      });

      socket.on("startChat", async (chat: IChat) => {
        console.log("Client started new chat.");
        const newChat = new Chat(chat);
        const addedChat = await chatsService.startChat(newChat);
        this.socketServer?.sockets.emit("startChat", addedChat);
      });

      socket.on("disconnect", () => {
        console.log("Client has been disconnected.");
      });
    });
  }

  public emitChat(chat: IChat) {
    this.socketServer?.sockets.emit("startChat", chat);
  }
}

export const socketService = new SocketService();