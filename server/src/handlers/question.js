import "../env.js";
import pkg from "@elastic/elasticsearch";
import { randomUUID } from "crypto";

const { Client } = pkg;
const ELASTIC_PASS = process.env.ELASTIC_PASSWORD;

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

export const ensureIndexExists = async (indexName) => {
  try {
    const questionIndexExists = await client.indices.exists({
      index: indexName,
    });

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
};

export const createInitQuestion = async () => {
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
};

export const deleteAllByIndex = async (indexName) => {
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
};

export const getAllDocumentsByIndex = async (indexName) => {
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
};

export const createQuestion = async (questionData, answers) => {
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
};

export const findQuestionDuplicate = async (questionText) => {
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
};

export const findSimilarQuestion = async (questionText) => {
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
};

export const addAnswerToQuestion = async (questionId, answer) => {
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
};

export const getQuestionById = async (questionId) => {
  try {
    const document = await client.get({
      index: "questions",
      id: questionId,
    });
    return document;
  } catch (err) {
    console.log("error retrieving question", err);
  }
};
