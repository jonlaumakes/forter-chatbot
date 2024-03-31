import express from "express";
import httpServer from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const http = httpServer.createServer(app);

http.listen(3000, () => {
  console.log("listening on *:3000");
});

const listQuestions = [
  {
    user: "chip",
    text: "how do you center a div?",
    answers: [
      {
        user: "otto",
        text: "read the docs!",
      },
    ],
  },
  {
    user: "otto",
    text: "why does does my stomach hurt?",
    answers: [
      {
        user: "chip",
        text: "stop eating grass",
      },
    ],
  },
];

const io = new Server(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.status(200);
  res.json({ message: "Hello - Chatbot home" });
});

io.on("connection", (socket) => {
  console.log("new connection - node");
  io.emit("new connection", listQuestions);

  socket.on("add-question", (question) => {
    console.log("server - add question", question);
    const newQuestion = {
      ...question,
      answers: [],
    };

    listQuestions.push(newQuestion);
    console.log("questions", listQuestions);
    socket.emit("add-question", newQuestion);
  });
});

// app.post("/question", (req, res) => {
//   console.log("POST - question", req);
// });

// io.on("ask", (socket) => {
//   console.log(`ask event: ${socket}`);
// });
