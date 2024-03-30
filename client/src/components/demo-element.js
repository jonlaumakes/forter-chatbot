import {LitElement, html} from 'lit';
import style from './demo-element.css.js';
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
      name: {type: String},

      /**
       * The list of questions
       * @type {array}
       */
      _listQuestions: { type: Array },

      /**
       * The number of times the button has been clicked.
       * @type {number}
       */
      count: {type: Number},
    };
  }

  constructor() {
    super();
    this._listQuestions = [
      {
        user: 'chipper',
        text: 'how do you center a div?'
      },
      {
        user: 'otto',
        text: 'why does does my stomach hurt?'
      },
    ];
    this.socket = io('http://localhost:3000', {
      extraHeaders: {
        "Access-Control-Allow-Origin": "*"
    }});
    this.socket.on('new connection', console.log);
  }

  static styles = [style];

  get questionInput() {
    return this.renderRoot?.querySelector('#new-question') ?? null;
  }

  addQuestion() {
    this._listQuestions = [
      ...this._listQuestions,
      {
        user: 'Me',
        text: this.questionInput.value
      }
    ];
    this.questionInput.value = '';
    console.log('added a question to the chat', this._listQuestions);
  }

  render() {
    const {name, count} = this;

    // const questions = html`
    //   <ul>
    //     ${_listQuestions.map(
    //       (question) => html`
    //           <li>
    //             ${question.text}
    //           </li>`
    //     )}
    //   </ul>
    // `;

    return html`
      <div>Chatroom</div>
      <input id="new-question" type="text" aria-label="New Question">
      <button @click=${this.addQuestion}>Add a question</button>
    `;
  }
}

window.customElements.define('demo-element', DemoElement);
