import express from "express";
import httpServer from "http";
import { Server } from "socket.io";
import cors from "cors";
import { randomUUID } from "crypto";

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
    id: randomUUID(),
    user: "chip",
    text: "how do you center a div?",
    answers: [
      {
        user: "otto",
        text: "read the docs!",
        created_at: new Date() - 10000,
      },
    ],
    created_at: new Date() - 10000,
  },
  {
    id: randomUUID(),
    user: "otto",
    text: "why does does my stomach hurt?",
    answers: [
      {
        user: "chip",
        text: "you keep eating grass",
        created_at: new Date() - 1000,
      },
    ],
    created_at: new Date() - 50000,
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
  io.emit(
    "new connection",
    listQuestions.sort((a, b) => {
      return a.created_at - b.created_at;
    })
  );

  socket.on("add-question", (question) => {
    console.log("server - add question", question);
    const newQuestion = {
      ...question,
      id: randomUUID,
      answers: [],
      created_at: new Date(),
    };

    listQuestions.push(newQuestion);
    console.log("questions", listQuestions);
    socket.emit("question-added", newQuestion);
  });

  socket.on("add-answer", (answerData) => {
    console.log("answer data", answerData);
    const { text, questionId: id, user } = answerData;
    let updatedQuestion;

    for (let i = 0; i < listQuestions.length; i++) {
      const question = listQuestions[i];
      if (question.id === id) {
        console.log("found ID", question.text);
        question.answers.push({
          user,
          text,
          created_at: Date.now(),
        });
        updatedQuestion = listQuestions[i];
        console.log("updated Question", updatedQuestion);
      }
    }

    socket.emit("added-answer", updatedQuestion);
  });
});
