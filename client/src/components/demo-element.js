import { LitElement, html } from "lit";
import style from "./demo-element.css.js";
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

/**
 * An example element.
 */
export class DemoElement extends LitElement {
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
    console.log("handle answer question click", question);
    this.questionToAnswer = question;
    console.log("updated question to answer", this.questionToAnswer);
  }

  render() {
    // const { name, count } = this;
    let { questionToAnswer, listQuestions } = this;

    const questions = html`
      <ul>
        ${listQuestions.map(
          (question, index) => html`
            <div>
              <p>${`Question: ${question.text}`}</p>
              <p>${`Posted by: ${question.user} at ${question.created_at}`}</p>
              <div>
                ${question.botAnswered
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
                      ${question.answers.map((answer) => {
                        return html`
                          <div>
                            <p>${`Answered by: ${answer.user}`}</p>
                            <p>${answer.text}}</p>
                          </div>
                        `;
                      })}
                    `}
                <!-- ${question.answers.map((answer) => {
                  return html`
                    <div>
                      <p>${`Answered by: ${answer.user}`}</p>
                      <p>${answer.text}}</p>
                    </div>
                  `;
                })} -->
              </div>
              <button
                @click=${() => {
                  this.handleAnswerQuestionClick(question);
                }}
              >
                Answer this question
              </button>
            </div>
          `
        )}
      </ul>
    `;

    return html`
      <div>Chatroom</div>
      ${questions}
      <input id="new-question" type="text" aria-label="New Question" />
      <button @click=${this.addQuestion}>Add a question</button>
      <div>
        <p>${questionToAnswer.text ?? "Select a question to answer!"}</p>
        <input id="new-answer" type="text" aria-label="New Answer" />
        <button @click=${this.addAnswer}>Submit</button>
      </div>
    `;
  }
}

window.customElements.define("demo-element", DemoElement);
