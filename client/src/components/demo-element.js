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
    };
  }

  constructor() {
    super();
    this._username = "Chip";
    this.questionToAnswer;
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
      this.questionToAnswer = questions[0];
    });

    this.socket.on("add-question", (question) => {
      console.log("UI - new question", question);
      this.listQuestions = [...this.listQuestions, question];
    });
    // socket for adding an answer
  }

  static styles = [style];

  get questionInput() {
    return this.renderRoot?.querySelector("#new-question") ?? null;
  }

  get answerInput() {
    return this.renderRoot?.querySelector("#new-answer") ?? null;
  }

  addQuestion() {
    let questionText = this.questionInput.value;

    this.socket.emit("add-question", {
      user: this._username,
      text: questionText,
    });
    this.questionInput.value = "";
  }

  addAnswer() {
    let answerText = this.answerInput.value;

    this.socket.emit("add-answer", {
      user: this._username,
      text: answerText,
    });
    this.answerInput.value = "";
  }

  handleAnswerQuestionClick(question) {
    console.log("handle answer question click", question.text);
    this.questionToAnswer = question;
    console.log("updated question to answer", this.questionToAnswer.text);
  }

  render() {
    // const { name, count } = this;
    let questionToAnswerLabel;

    if (this.questionToAnswer) {
      questionToAnswerLabel = this.questionToAnswer.text;
    } else {
      questionToAnswerLabel = "Select a question to answer!";
    }

    const questionsListEditable = this.listQuestions.map((question) => {
      return { ...question, editMode: false };
    });

    const questions = html`
      <ul>
        ${this.listQuestions.map(
          (question) => html`
            <li>${question.text}</li>
            <li>${`Posted by: ${question.user} at ${question.created_at}`}</li>
            <button
              @click=${() => {
                this.handleAnswerQuestionClick(question);
              }}
            >
              Answer
            </button>
            <!-- add in mapping for array of answers -->
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
        <p>${questionToAnswerLabel}</p>
        <input id="question-answer" type="text" aria-label="New Answer" />
        <button @click=${this.addAnswer}>Submit</button>
      </div>
    `;
  }
}

window.customElements.define("demo-element", DemoElement);
