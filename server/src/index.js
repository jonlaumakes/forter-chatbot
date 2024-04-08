import "./env.js";
import express from "express";
import httpServer, { get } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { randomUUID } from "crypto";
import pkg from "@elastic/elasticsearch";

const ELASTIC_PASS = process.env.ELASTIC_PASSWORD;
console.log("env", ELASTIC_PASS);

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

const cleanInput = (text) => {
  return text.trim().split(" ").join("");
};

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
// init question list
// const listQuestions = [
//   {
//     id: randomUUID(),
//     username: users[0].username,
//     text: "how do you center a div?",
//     answers: [
//       {
//         username: users[1].username,
//         text: "read the docs!",
//         created_at: new Date() - 1000,
//       },
//       {
//         username: users[2].username,
//         text: "If he wanted to read docs, he wouldn't be on here.  Try using a flex container!!",
//         created_at: new Date() - 1000,
//       },
//     ],
//     botAnswered: false,
//     created_at: new Date() - 2000,
//   },
//   {
//     id: randomUUID(),
//     username: users[0].username,
//     text: "why does does my stomach hurt?",
//     answers: [
//       {
//         username: users[0].username,
//         text: "you keep eating grass at the park",
//         created_at: new Date() - 61000,
//       },
//     ],
//     botAnswered: false,
//     created_at: new Date() - 60000,
//   },
// ];

// init question map
// const answerMap = listQuestions.reduce((acc, question) => {
//   const input = cleanInput(question.text);
//   acc[input] = question.answers[question.answers.length - 1];
//   return acc;
// }, {});

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
      await deleteAllByIndex("questions");
      await createInitQuestion();
    }
  } catch (error) {
    console.log("error checking index exists", error);
  }
}

async function createInitQuestion() {
  try {
    const addedQuestion = await client.index({
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
    console.log(`document created`, addedQuestion);
  } catch (error) {
    console.log("error creating index", error);
  }
}

async function deleteAllByIndex(indexName) {
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

async function createQuestion(questionData) {
  console.log("create question - UI payload", questionData);

  try {
    const created = await client.create(
      {
        index: "questions",
        id: randomUUID(),
        body: {
          ...questionData,
          botAnswered: false,
          answers: [],
          created_at: Date.now(),
        },
      },
      "questions"
    );
    console.log(`question document added: ${created}`);
    return created;
  } catch (error) {
    console.log("error creating index", error);
  }
}

async function addAnswerToQuestion(questionId, answer) {
  try {
    const result = await client.update({
      index: "questions",
      id: questionId,
      body: {
        script: {
          source: "ctx._source.answers.add(params.answer)",
          params: { answer: answer },
        },
      },
    });
    console.log(`Answer added to question`, result);
  } catch (error) {
    console.error("Error adding answer to question:", error);
    throw error;
  }
}

async function getQuestionById(questionId) {
  try {
    const document = await client.get({
      index: "questions",
      id: questionId,
    });
    return document;
  } catch (err) {
    console.log("error retrieving question", err);
  }
}

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
    console.log("question from UI", question);
    const isDuplicate = false;

    if (isDuplicate) {
    } else {
      const addResult = await createQuestion({
        ...question,
        question_text: cleanInput(question.question_text),
      });

      console.log("created", addResult);
      const questionId = addResult._id;

      const createdQuestion = await getQuestionById(questionId);
      console.log("Retrieve created Question", createdQuestion._source);
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
    console.log("add-answer payload", answer);
    const result = await addAnswerToQuestion(questionId, answer);
    const updatedQuestion = await getQuestionById(questionId);
    console.log("updated question source", updatedQuestion._source);
    console.log("updated question answers", updatedQuestion._source.answers);
    io.emit("added-answer", {
      ...updatedQuestion._source,
      id: updatedQuestion._id,
    });
  });
});
