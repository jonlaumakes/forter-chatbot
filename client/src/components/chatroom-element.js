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
    this.username = "Chip";
    this.questionToAnswer = {};
    this.listQuestions = [];

    this.socket = io("http://localhost:3000", {
      extraHeaders: {
        "Access-Control-Allow-Origin": "*",
      },
    });
    this.socket.on("new connection", (questions) => {
      this.listQuestions = questions;
      // could refactor to the most popular if likes are added to questions
      if (questions[0]) {
        this.questionToAnswer = questions[0];
      }
    });

    this.socket.on("question-added", (question) => {
      this.listQuestions = [...this.listQuestions, question];
    });

    this.socket.on("added-answer", (updatedQuestion) => {
      this.listQuestions = this.listQuestions.map((question) => {
        if (question.id === updatedQuestion.id) {
          return updatedQuestion;
        }
        return question;
      });
    });
  }

  static styles = [style];

  get questionInput() {
    return this.renderRoot?.querySelector("#new-question") ?? null;
  }

  get answerInput() {
    return this.renderRoot?.querySelector("#new-answer-input") ?? null;
  }

  handleQuestionInputChange(e) {
    if (e.key === "Enter") {
      this.addQuestion();
    }
    return;
  }

  handleAnswerInputChange(e) {
    if (e.key === "Enter") {
      this.addAnswer();
    }
    return;
  }

  addQuestion() {
    const question = {
      user: this.username,
      text: this.questionInput.value,
    };

    this.socket.emit("add-question", question);
    this.questionInput.value = "";
  }

  addAnswer() {
    let answerText = this.answerInput.value;

    if (!answerText.length) return;

    const answer = {
      questionId: this.questionToAnswer.id || 10000,
      questionText: this.questionToAnswer.text,
      user: this.username,
      text: answerText,
    };

    this.socket.emit("add-answer", answer);
    this.answerInput.value = "";
  }

  handleAnswerQuestionClick(question) {
    this.questionToAnswer = question;
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
                        <div class="chat-answers-container">
                          <div class="chat-answer">
                            <chat-answer
                              .message=${
                                question.answers[question.answers.length - 1]
                              }
                              .loggedInUser=${username}
                              .botAnswered=${question.botAnswered}
                            ></chat-answer>
                            </div>
                          </div>
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
                                  .botAnswered=${question.botAnswered}
                                ></chat-answer>
                              </div>
                            `;
                          })}
                          <div class="question-footer">
                            ${question.id === questionToAnswer.id
                              ? html`
                                  <div class="answer-question-container">
                                    <textarea
                                      placeholder="What are your thoughts?"
                                      id="new-answer-input"
                                      class="answer-reply-input"
                                      @keydown=${this.handleAnswerInputChange}
                                    ></textarea>
                                  </div>
                                  <div class="answer-question-container">
                                    <button
                                      class="reply-button"
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
                                    Add an answer
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
      <div class="page-header">
        <div class="title-container">
          <div class="title">#forter-chatroom</div>
        </div>
      </div>
      <div class="conversation-container">
        <div class="chats-container">${questions}</div>
      </div>
      <div class="question-input-container">
        <input
          class="question-input"
          id="new-question"
          type="text"
          aria-label="New Question"
          @keydown=${this.handleQuestionInputChange}
        />
        <button class="question-submit-button" @click=${this.addQuestion}>
          Ask
        </button>
      </div>
    `;
  }
}

window.customElements.define("chatroom-element", ChatRoomElement);
