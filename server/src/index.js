import express from "express";
import httpServer from "http";
import { Server } from "socket.io";
import cors from "cors";
import { randomUUID } from "crypto";
import fs from "fs";
import pkg from "@elastic/elasticsearch";

const { Client } = pkg;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("path");

const client = new Client({
  node: "https://localhost:9200",
  auth: {
    username: "elastic",
    password: process.env.ELASTIC_PASSWORD,
  },
  tls: {
    ca: fs.readFileSync("./http_ca.crt"),
    rejectUnauthorized: false,
  },
});

const http = httpServer.createServer(app);

http.listen(3000, () => {
  console.log("listening on *:3000");
});

const indexName = "questions";

const cleanInput = (text) => {
  return text.trim().split(" ").join("");
};

const users = [
  {
    username: "Otto",
    userId: randomUUID(),
  },
  {
    username: "Chip",
    userId: randomUUID(),
  },
  {
    username: "Kylo",
    userId: randomUUID(),
  },
];
// init question list
const listQuestions = [
  {
    id: randomUUID(),
    username: users[0].username,
    text: "how do you center a div?",
    answers: [
      {
        username: users[1].username,
        text: "read the docs!",
        created_at: new Date() - 1000,
      },
      {
        username: users[2].username,
        text: "If he wanted to read docs, he wouldn't be on here.  Try using a flex container!!",
        created_at: new Date() - 1000,
      },
    ],
    botAnswered: false,
    created_at: new Date() - 2000,
  },
  {
    id: randomUUID(),
    username: users[0].username,
    text: "why does does my stomach hurt?",
    answers: [
      {
        username: users[0].username,
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

// socket server
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

const createNewUser = () => {
  return {
    username: `User${Math.floor(Math.random(0, 1) * 100, 1)}`,
    userId: randomUUID(),
  };
};

io.on("connection", (socket) => {
  const user = users.pop() || createNewUser();
  console.log("SERVER - new connection", user);
  socket.emit(
    "A new user connected",
    user,
    listQuestions.sort((a, b) => {
      return a.created_at - b.created_at;
    })
  );

  /**
   * INITIALIZATION
   */
  // check if index exists
  // create it or clear the records in 'questions' index
  async function initialize() {
    await ensureIndexExists(indexName);
  }

  initialize().then(() => {
    console.log("db initiazation complete");
  });

  async function ensureIndexExists(indexName) {
    const questionIndexExists = await client.indices.exists({
      index: indexName,
    });

    console.log("question index exists", questionIndexExists);
    // try {
    //   client.indices.exists({ index: "questions" }).then(
    //     (res) => {
    //       console.log("res exists", res);
    //       return res;
    //     },
    //     (err) => {
    //       console.log("error checking index exists", err);
    //       return false;
    //     }
    //   );
    // } catch (error) {
    //   console.log("error", error);
    // }
  }

  /**
   * Add question
   */
  async function createQuestion(questionData) {
    try {
      const result = await client.index({
        index: "questions",
        body: {
          ...questionData,
        },
      });
      console.log("Question created:", result);
      return result;
    } catch (error) {
      console.error("Error creating question:", error);
    }
  }

  socket.on("add-question", (question) => {
    console.log("add question from UI");
    const cleandQuestionInput = cleanInput(question.text);
    const newQuestion = {
      userId: question.userId,
      username: question.username,
      id: randomUUID(),
      ...question,
      answers: [],
      botAnswered: false,
      created_at: new Date(),
    };

    // let indexExists = checkIndexExists();

    // handle a duplicate question
    // retrieve answer from answerMap
    // const lastAnswer = answerMap[cleandQuestionInput];
    // if (lastAnswer) {
    //   newQuestion.answers.push(lastAnswer);
    //   newQuestion.botAnswered = true;
    // }

    // add question to questionList
    // listQuestions.push(newQuestion);
    // io.emit("question-added", newQuestion);
  });

  /**
   * Add answer
   */
  socket.on("add-answer", (answer) => {
    // update the answerMap with the latest answer
    const cleanedQuestion = cleanInput(answer.questionText);
    answerMap[cleanedQuestion] = answer;

    // update the question (with new answer) in questionList
    let questionAnswered;
    for (let i = 0; i < listQuestions.length; i++) {
      const question = listQuestions[i];
      if (question.id === answer.questionId) {
        question.answers.push({
          ...answer,
          created_at: new Date(),
        });
        questionAnswered = listQuestions[i];
      }
    }

    io.emit("added-answer", questionAnswered);
  });
});
