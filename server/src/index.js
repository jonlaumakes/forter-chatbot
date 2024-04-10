import "./env.js";
import express from "express";
import httpServer, { get } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { randomUUID } from "crypto";
import pkg from "@elastic/elasticsearch";

import {
  ensureIndexExists,
  getAllDocumentsByIndex,
  createQuestion,
  findQuestionDuplicate,
  addAnswerToQuestion,
  getQuestionById,
} from "./handlers/question.js";

const ELASTIC_PASS = process.env.ELASTIC_PASSWORD;

const app = express();
const { Client } = pkg;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = new Client({
  node: "https://localhost:9200",
  auth: {
    username: "elastic",
    password: ELASTIC_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const http = httpServer.createServer(app);

http.listen(3000, () => {
  console.log("listening on *:3000");
});

const indexName = "questions";

const users = [
  {
    username: "Otto",
    user_id: randomUUID(),
  },
  {
    username: "Chip",
    user_id: randomUUID(),
  },
  {
    username: "Kylo",
    user_id: randomUUID(),
  },
];

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

/**
 * INITIALIZATION
 */
// check if index exists
// create 'questions' index or clear the records in index
async function initialize() {
  try {
    await ensureIndexExists(indexName);
    console.log("DB initialization complete");
  } catch (error) {
    console.log("failed to initialize DB connection");
  }
}

initialize();

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
   * Add question
   */
  socket.on("add-question", async (question) => {
    let isDuplicate = false;
    let strongestHit = undefined;
    // check for duplicate question
    const matchSearch = await findQuestionDuplicate(question.question_text);
    const questionExactMatchCount = matchSearch.hits.total.value;

    if (questionExactMatchCount > 0) {
      strongestHit = matchSearch.hits.hits
        ? matchSearch.hits.hits[0]
        : undefined;
      isDuplicate =
        strongestHit &&
        strongestHit._source.question_text === question.question_text;
    }

    // EXACT MATCH
    if (isDuplicate) {
      // double check new question and retrieved match
      const answers = strongestHit._source.answers;
      console.log("exact match found - strongest hit", strongestHit);
      // prep answer sent back to user
      const returnedAnswers = [];
      if (answers.length > 0) {
        const botAnswer = {
          ...answers[0],
          created_at: answers[0].created_at,
        };
        returnedAnswers.push(botAnswer);
      }

      let questionWithOriginalUser = {
        ...question,
        username: strongestHit._source.username,
      };

      const returnedQuestion = {
        ...questionWithOriginalUser,
        bot_answered: true,
        answers: returnedAnswers,
        created_at: Date.now(),
      };

      if (answers.length < 1) {
        returnedQuestion.duplicate_query_unanswered_user =
          strongestHit._source.username;
      }
      // emit question only to asking user
      // include previous answer with bot_answered flag and prior answer
      socket.emit("question-added", returnedQuestion);
    } else {
      let answers = [];

      // SIMILAR MATCH - add a suggested answer to the added question
      if (questionExactMatchCount > 0) {
        const strongestAnswer = strongestHit._source.answers[0];
        console.log("strongest answer for similar question", strongestAnswer);

        const similarQuestionAnswerData = {
          bot_suggested: true,
          ...strongestAnswer,
          username: "Chatroom Bot",
          similar_question_text: strongestHit._source.question_text,
          similar_question_user: strongestHit._source.username,
        };

        answers.push(similarQuestionAnswerData);
      }
      // persist question
      const addResult = await createQuestion(
        {
          ...question,
          question_text: question.question_text.trim(),
        },
        answers
      );
      const questionId = addResult._id;

      const createdQuestion = await getQuestionById(questionId);
      io.emit("question-added", {
        ...createdQuestion._source,
        id: questionId,
      });
    }
  });

  /**
   * Add answer
   */
  socket.on("add-answer", async (questionId, answer) => {
    const updatedAnswer = { ...answer, created_at: Date.now() };
    const result = await addAnswerToQuestion(questionId, updatedAnswer);
    const updatedQuestion = await getQuestionById(questionId);

    const question = {
      ...updatedQuestion._source,
      id: updatedQuestion._id,
      created_at: Date.now(),
    };

    io.emit("added-answer", question);
  });
});
