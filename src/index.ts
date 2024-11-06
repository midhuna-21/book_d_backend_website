import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
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

const corsOptions = {
    origin: config.API,
    credentials: true,
};
app.use(cors(corsOptions));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: config.API,
        methods: ["GET", "POST", "PUT"],
        credentials: true,
    },
});

app.set("io", io);

dbConnect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(morgan('dev'))
app.use(express.static("public/"));

initializeSocket(io, chatService, notificationService);

app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});

app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);


server.listen(config.PORT, () => {
    console.log(`Server running at ${config.PORT}`);
});
