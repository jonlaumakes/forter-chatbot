import { LitElement, html } from "lit";
import { answerComponentStyles } from "./answer-block.css.js";

export class AnswerComponent extends LitElement {
  constructor() {
    super();
  }
  static styles = [answerComponentStyles];

  static properties = {
    message: { type: Object },
  };

  render() {
    return html`
      <div class="message">
        <span class="username">${this.message.user}:</span> ${this.message.text}
      </div>
    `;
  }
}

customElements.define("chat-answer", AnswerComponent);
