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
        username: "initguy123",
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

async function createQuestion(questionData, answers) {
  console.log("create question - UI payload", questionData);

  try {
    const created = await client.create(
      {
        index: "questions",
        id: randomUUID(),
        body: {
          ...questionData,
          botAnswered: false,
          answers: answers,
          created_at: Date.now(),
        },
      },
      "questions"
    );
    console.log(`question document added: ${created}`);
    return created;
  } catch (err) {
    console.log("error creating index", err);
  }
}

async function findQuestionDuplicate(questionText) {
  console.log("find quesiton duplicate input", questionText);
  try {
    const searchResult = await client.search({
      index: "questions",
      body: {
        query: {
          match_phrase: {
            question_text: questionText,
          },
        },
      },
    });
    return searchResult;
  } catch (err) {
    console.log("error finding question duplicate", err);
    return false;
  }
}

async function findSimilarQuestion(questionText) {
  console.log("find similar quesitons", questionText);
  try {
    const searchResult = await client.search({
      index: "questions",
      body: {
        query: {
          more_like_this: {
            fields: ["question_text"],
            like: questionText,
            min_term_freq: 1,
            max_query_terms: 12,
          },
        },
      },
    });
    return searchResult;
  } catch (err) {
    console.log("error finding similar question", err);
    return false;
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
    let isDuplicate = false;
    let strongestHit = undefined;
    // check for duplicate question
    const matchSearch = await findQuestionDuplicate(question.question_text);
    console.log("match search", matchSearch);
    const questionMatchCount = matchSearch.hits.total.value;
    if (questionMatchCount > 0) {
      strongestHit = matchSearch.hits.hits
        ? matchSearch.hits.hits[0]
        : undefined;
      isDuplicate =
        strongestHit &&
        strongestHit._source.question_text === question.question_text;
    }

    // EXACT MATCH
    if (isDuplicate) {
      console.log("strongest exact match hit", strongestHit);
      // double check new question and retrieved match
      const answers = strongestHit._source.answers;
      console.log("exact match found - answers", answers);
      // prep answer sent back to user
      const returnedAnswers = [];
      if (answers.length > 0) {
        const botAnswer = {
          ...answers[0],
          created_at: answers[0].created_at,
        };
        returnedAnswers.push(botAnswer);
      }

      const returnedQuestion = {
        ...question,
        bot_answered: true,
        answers: returnedAnswers,
        created_at: Date.now(),
        duplicate_query_unanswered_user: strongestHit._source.username,
      };
      // emit question with previous answer with bot_answered flag and prior answer
      socket.emit("question-added", returnedQuestion);
    } else {
      // SIMILAR MATCH or UNIQUE QUESTION
      console.log("simular or unique - questionMatchCount", questionMatchCount);
      const similarSearch = await findSimilarQuestion(question.question_text);
      console.log("simular search ", similarSearch);
      let answers = [];

      // SIMILAR MATCH - add a suggested answer to the added question
      if (questionMatchCount > 0) {
        console.log("SIMILAR", similarSearch);
        const strongestAnswer = strongestHit._source.answers[0];

        const similarQuestionData = {
          botSuggested: true,
          ...strongestAnswer,
          username: "Chatroom Bot",
          similar_question_text: strongestHit._source.question_text,
          similar_question_user: strongestHit._source.username,
        };

        answers.push(similarQuestionData);
      }
      // persist question
      const addResult = await createQuestion(
        {
          ...question,
          question_text: question.question_text.trim(),
        },
        answers
      );

      // console.log("created new question", addResult);
      const questionId = addResult._id;

      const createdQuestion = await getQuestionById(questionId);
      // console.log("Retrieve created Question", createdQuestion._source);
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
    // console.log("updated question source", updatedQuestion._source);
    // console.log("updated question answers", updatedQuestion._source.answers);
    const question = {
      ...updatedQuestion._source,
      id: updatedQuestion._id,
      created_at: Date.now(),
    };
    console.log("add answer - updated question", question);

    io.emit("added-answer", question);
  });
});
