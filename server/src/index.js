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
    user_id: randomUUID(),
  };
};

io.on("connection", async (socket) => {
  const user = users.pop() || createNewUser();
  console.log("SERVER - new connection", user);

  try {
    const questions = await getAllDocumentsByIndex("questions");
    socket.emit("A new user connected", user, questions);
  } catch (err) {
    console.log("error retrieving in socket");
  }

  /**
   * INITIALIZATION
   */
  // check if index exists
  // create it or clear the records in 'questions' index
  async function initialize() {
    try {
      await ensureIndexExists(indexName);
      console.log("DB initialization complete");
    } catch (error) {
      console.log("failed to initialize DB connection");
    }
  }

  initialize();

  async function ensureIndexExists(indexName) {
    try {
      const questionIndexExists = await client.indices.exists({
        index: indexName,
      });

      console.log("question index exists", questionIndexExists);
      if (!questionIndexExists) {
        // create index and init questions
        await createInitQuestion();
        // retrieve the init questions and emit
      } else {
        console.log(`index ${indexName} already exists`);
        // delete all the questions and add init question
        await deleteAll("questions");
        await createInitQuestion();
        const questions = await getAllDocumentsByIndex("questions");
        // TODO: get all the questions
      }
    } catch (error) {
      console.log("error checking index exists", error);
    }
  }

  async function createInitQuestion() {
    try {
      await client.index({
        index: "questions",
        body: {
          user_id: randomUUID(),
          username: "init guy",
          question_text: "how do you center a div?",
          answers: [],
          bot_answered: false,
          created_at: Date.now(),
        },
      });
      console.log(`document created`);
    } catch (error) {
      console.log("error creating index", error);
    }
  }

  async function deleteAll(indexName) {
    try {
      await client.deleteByQuery({
        index: indexName,
        body: {
          query: {
            match_all: {},
          },
        },
      });
    } catch (err) {
      console.log(`error deleting all in ${indexName}`);
    }
  }

  async function getAllDocumentsByIndex(indexName) {
    const result = await client.search({
      index: "questions",
      body: {
        query: {
          match_all: {},
        },
      },
    });
    console.log(result.hits.hits[0]._source);
    return result.hits.hits;
  }

  /**
   * Add question
   */
  async function createQuestion(questionData) {
    console.log("create question", questionData);
    try {
      await client.index({
        index: "questions",
        body: {
          user_id: questionData.user_id,
          username: "init guy",
          question_text: "how do you center a div?",
          user_id: randomUUID(),
          answers: [],
          botAnswered: false,
          created_at: Date.now(),
        },
      });
      console.log(`index ${indexName} created`);
    } catch (error) {
      console.log("error creating index", error);
    }
  }

  socket.on("add-question", (question) => {
    console.log("add question from UI");
    const cleandQuestionInput = cleanInput(question.text);

    const newQuestion = {
      ...question,
      answers: [],
      botAnswered: false,
      created_at: Date.now(),
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
