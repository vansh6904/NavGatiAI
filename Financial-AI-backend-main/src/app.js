import express from 'express';
import cookieParser from 'cookie-parser';
import cors from "cors";
import http from "http";
import { Server } from "socket.io";


const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
      origin: "http://localhost:5173", 
      methods: ["GET", "POST"],
  },
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a community room
  socket.on("joinCommunity", (communityId) => {
      socket.join(communityId); // Join the room for the specific community
      console.log(`User joined community: ${communityId}`);
  });

  // Send a message to a community
  socket.on("sendMessage", (message) => {
      // Broadcast the message to everyone in the community room
      io.to(message.community).emit("receiveMessage", message);
  });

  
  // Handle disconnection
  socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
  });
});

//uncomment while running web
// app.use(cors({
//     origin: ['http://localhost:5173'],
//     credentials: true,
// }));

//uncomment while running app
app.use(cors({
  origin: '*', // Allow all origins (not recommended for production)
  credentials: true,
}));

app.use(express.json({
    limit: '20kb'
}));

app.use(express.urlencoded({
    extended : true,
    limit: '20kb'
}));

app.use(express.static('public'));

app.use(cookieParser());



//routes import 
import userRouter from './routes/user.routes.js';
import scrapeRouter from './routes/scrape.routes.js';
import chatbotRouter from './routes/chatbot.routes.js';

import communityRouter from "./routes/community.routes.js";
import messageRouter from "./routes/messages.routes.js";

import applicationRouter from "./routes/application.routes.js";

//routes declaration
app.use('/api/v1/users', userRouter);

app.use('/api/v1/scrape', scrapeRouter);

app.use('/api/v1/chatbot', chatbotRouter);

app.use("/api/v1/communities", communityRouter);

app.use("/api/v1/messages", messageRouter);

app.use("/api/v1/application",applicationRouter)



app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });

export {app,server};