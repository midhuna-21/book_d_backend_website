import express from "express";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import morgan from 'morgan';
import cors,{CorsOptions} from "cors";
import dbConnect from "./config/db";
import userRoutes from "./routes/userRoute";
import adminRoutes from "./routes/adminRoute";
import config from "./config/config";
import "./utils/ReuseFunctions/cronJob";
import { ChatService } from "./services/chat/chatService";
import { ChatRepository } from "./respository/chat/chatRepository";
import { notificationService } from "./services";
import { initializeSocket } from "./sockets/socket-connection";

const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);

const app = express();

console.log(config.API_URL,'api url')
let corsOptions:CorsOptions={
    origin:config.API_URL,
    methods:['GET','POST','PUT','DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials:true
}
const server = http.createServer(app);

const io = new Server(server, {
    cors:corsOptions,
});
app.set("io", io);


dbConnect();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'))
app.use(express.static("public/"));

initializeSocket(io, chatService, notificationService);

app.use(cors(corsOptions));


app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

server.listen(config.PORT, () => {
    console.log(`Server running at ${config.PORT}`);
});
