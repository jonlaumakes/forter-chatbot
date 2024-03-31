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
       * The name to say "Hello" to.
       * @type {string}
       */
      name: { type: String },

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
    };
  }

  constructor() {
    super();
    this._username = "Chip";
    this.listQuestions = [
      // {
      //   user: "chipper",
      //   text: "how do you center a div?",
      // },
      // {
      //   user: "otto",
      //   text: "why does does my stomach hurt?",
      // },
    ];
    this.socket = io("http://localhost:3000", {
      extraHeaders: {
        "Access-Control-Allow-Origin": "*",
      },
    });
    this.socket.on("new connection", (questions) => {
      console.log("init - questions", questions);
      this.listQuestions = questions;
    });

    this.socket.on("add-question", (question) => {
      console.log("UI - new question", question);
      this.listQuestions = [...this.listQuestions, question];
    });
  }

  static styles = [style];

  get questionInput() {
    return this.renderRoot?.querySelector("#new-question") ?? null;
  }

  addQuestion() {
    let questionText = this.questionInput.value;

    this.socket.emit("add-question", {
      user: this._username,
      text: questionText,
    });
    this.questionInput.value = "";
  }

  render() {
    const { name, count } = this;
    // const listQuestions = [];

    const questions = html`
      <ul>
        ${this.listQuestions.map(
          (question) => html`
            <li>${question.text}</li>
            <button>Answer</button>
          `
        )}
      </ul>
    `;

    return html`
      <div>Chatroom</div>
      ${questions}
      <input id="new-question" type="text" aria-label="New Question" />
      <button @click=${this.addQuestion}>Add a question</button>
    `;
  }
}

window.customElements.define("demo-element", DemoElement);
