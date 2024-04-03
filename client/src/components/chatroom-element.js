import { LitElement, html } from "lit";
import style from "./chatroom-element.css.js";
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import "./chat/answer/answer-block.js";
import "./chat/question/question-block.js";

/**
 * An example element.
 */
export class ChatRoomElement extends LitElement {
  static get properties() {
    return {
      /**
       * The list of questions
       * @type {array}
       */
      listQuestions: { type: Array },

      /**
       * The number of times the button has been clicked.
       * @type {number}
       */
      count: { type: Number },

      /**
       * The name to say "Hello" to.
       * @type {string}
       */
      name: { type: String },

      /**
       * The target question.
       * @type {Object}
       */
      questionToAnswer: { type: Object },
    };
  }

  constructor() {
    super();
    this._username = "Chip";
    this.questionToAnswer = {};
    this.listQuestions = [];

    this.socket = io("http://localhost:3000", {
      extraHeaders: {
        "Access-Control-Allow-Origin": "*",
      },
    });
    this.socket.on("new connection", (questions) => {
      console.log("init - questions", questions);
      this.listQuestions = questions;
      // init question
      // could refactor to the most popular if likes are added to questions
      if (questions[0]) {
        this.questionToAnswer = questions[0];
      }
    });

    this.socket.on("question-added", (question) => {
      console.log("updated question added", question);
      this.listQuestions = [...this.listQuestions, question];
    });

    this.socket.on("added-answer", (updatedQuestion) => {
      console.log("updated question from an answer sub", updatedQuestion);
      this.listQuestions = this.listQuestions.map((question) => {
        if (question.id === updatedQuestion.id) {
          return updatedQuestion;
        }
        return question;
      });
      console.log("updated listQuestions", this.listQuestions);
    });
  }

  static styles = [style];

  get questionInput() {
    return this.renderRoot?.querySelector("#new-question") ?? null;
  }

  get answerInput() {
    return this.renderRoot?.querySelector("#new-answer") ?? null;
  }

  addQuestion() {
    const question = {
      user: this._username,
      text: this.questionInput.value,
    };

    this.socket.emit("add-question", question);
    this.questionInput.value = "";
  }

  addAnswer() {
    let answerText = this.answerInput.value;
    console.log("UI add answer", this.questionToAnswer);

    const answer = {
      questionId: this.questionToAnswer.id || 10000,
      questionText: this.questionToAnswer.text,
      user: this._username,
      text: answerText,
    };
    console.log("add answer submit click", answer);
    this.socket.emit("add-answer", answer);
    this.answerInput.value = "";
  }

  handleAnswerQuestionClick(question) {
    console.log("previous question to answer id", this.questionToAnswer.id);
    console.log("selected question id", question.id);
    this.questionToAnswer = question;
    console.log("updated question to answer", this.questionToAnswer);
  }

  render() {
    let { questionToAnswer, listQuestions, username } = this;

    const questions = html`
      <div>
        <div class="scrollable-container">
          ${listQuestions.map(
            (question, index) => html`
            <div class="question-group-container">
              <div class="chat-question-container">
                <chat-question
                  .message=${question}
                  .loggedInUser=${username}
                ></chat-question>
              </div>
              <div>
                ${
                  question.botAnswered
                    ? html`
                        <div>
                          <p>
                            ${`This question was asked before and answered by ${
                              question.answers[question.answers.length - 1].user
                            }`}
                          </p>
                          <p>${question.answers[0].text}</p>
                        </div>
                      `
                    : html`
                        <div class="chat-answers-container">
                          ${question.answers.map((answer) => {
                            return html`
                              <div class="chat-answer">
                                <chat-answer
                                  .message=${answer}
                                  .loggedInUser=${username}
                                ></chat-answer>
                              </div>
                            `;
                          })}
                          <div class="question-footer">
                            ${question.id === questionToAnswer.id
                              ? html`
                                  <div class="answer-question-container">
                                    <textarea id="new-answer"></textarea>
                                    <button
                                      class="add-answer-button"
                                      @click=${this.addAnswer}
                                    >
                                      Reply
                                    </button>
                                  </div>
                                `
                              : html`
                                  <button
                                    class="add-answer-button"
                                    @click=${() => {
                                      this.handleAnswerQuestionClick(question);
                                    }}
                                  >
                                    Add your Answer
                                  </button>
                                `}
                          </div>
                        </div>
                      `
                }
              </div>
              <div class="line-container">
                <hr />
              </div>
            </div>
          </div>
          `
          )}
        </div>
      </div>
    `;

    return html`
      <h1>Forter Chatroom</h1>
      <div class="chat-container">${questions}</div>
      <div>
        <!-- <p>${questionToAnswer.text}</p> -->
        <!-- <input id="new-answer" type="text" aria-label="New Answer" /> -->
        <!-- <button @click=${this.addAnswer}>Submit</button> -->
      </div>
      <div class="question-input-container">
        <input
          class="question-input"
          id="new-question"
          type="text"
          aria-label="New Question"
        />
        <button class="question-submit-button" @click=${this.addQuestion}>
          Ask
        </button>
      </div>
    `;
  }
}

window.customElements.define("chatroom-element", ChatRoomElement);
