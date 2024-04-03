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

const cleanInput = (text) => {
  return text.trim().split(" ").join("");
};

// init question list
const listQuestions = [
  {
    id: randomUUID(),
    user: "Chip",
    text: "how do you center a div?",
    answers: [
      {
        user: "Otto",
        text: "read the docs!",
        created_at: new Date() - 1000,
      },
      {
        user: "Kylo",
        text: "If he wanted to read docs, he wouldn't be on here.  Try using a flex container!!",
        created_at: new Date() - 1000,
      },
    ],
    botAnswered: false,
    created_at: new Date() - 2000,
  },
  {
    id: randomUUID(),
    user: "Otto",
    text: "why does does my stomach hurt?",
    answers: [
      {
        user: "Chip",
        text: "you keep eating grass at the park",
        created_at: new Date() - 61000,
      },
    ],
    botAnswered: false,
    created_at: new Date() - 60000,
  },
];

// init question map
const answerMap = listQuestions.reduce((acc, question) => {
  const input = cleanInput(question.text);
  acc[input] = question.answers[question.answers.length - 1];
  return acc;
}, {});

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
  io.emit(
    "new connection",
    listQuestions.sort((a, b) => {
      return a.created_at - b.created_at;
    })
  );
  /**
   * Add question
   */
  socket.on("add-question", (question) => {
    const cleandQuestionInput = cleanInput(question.text);
    const newQuestion = {
      ...question,
      id: randomUUID(),
      answers: [],
      botAnswered: false,
      created_at: new Date(),
    };

    const lastAnswer = answerMap[cleandQuestionInput];
    if (lastAnswer) {
      newQuestion.answers.push(lastAnswer);
      newQuestion.botAnswered = true;
    }

    listQuestions.push(newQuestion);
    socket.emit("question-added", newQuestion);
  });

  /**
   * Add answer
   */
  socket.on("add-answer", (answerData) => {
    const { text: answerText, questionId: id, user, questionText } = answerData;
    // update the answerMap with the latest answer
    const cleanedQuestion = cleanInput(questionText);
    answerMap[cleanedQuestion] = answerData;
    console.log("add answer - updated answer map", answerMap);

    let questionAnswered;

    // update the question (w/ answers) in questionList
    for (let i = 0; i < listQuestions.length; i++) {
      const question = listQuestions[i];
      if (question.id === id) {
        question.answers.push({
          user,
          text: answerText,
          created_at: new Date(),
        });
        questionAnswered = listQuestions[i];
      }
    }

    socket.emit("added-answer", questionAnswered);
  });
});
