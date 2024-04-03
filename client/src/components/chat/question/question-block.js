import { LitElement, html } from "lit";
import { questionComponentStyles } from "./question-block.css.js";
import { getTimeAgo } from "../util/time-util.js";

export class QuestionComponent extends LitElement {
  constructor() {
    super();
  }
  static styles = [questionComponentStyles];

  static properties = {
    message: { type: Object },
    loggedInuser: { type: String },
  };

  render() {
    const timeAgo = getTimeAgo(this.message.created_at);

    return html`
      <div class="message-container">
        <div class="header">
          <div class="icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#000000"
              width="2em"
              height="2em"
              viewBox="0 0 24 24"
              data-name="Layer 1"
            >
              <path
                d="M9,15a1,1,0,1,0,1,1A1,1,0,0,0,9,15ZM2,14a1,1,0,0,0-1,1v2a1,1,0,0,0,2,0V15A1,1,0,0,0,2,14Zm20,0a1,1,0,0,0-1,1v2a1,1,0,0,0,2,0V15A1,1,0,0,0,22,14ZM17,7H13V5.72A2,2,0,0,0,14,4a2,2,0,0,0-4,0,2,2,0,0,0,1,1.72V7H7a3,3,0,0,0-3,3v9a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V10A3,3,0,0,0,17,7ZM13.72,9l-.5,2H10.78l-.5-2ZM18,19a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V10A1,1,0,0,1,7,9H8.22L9,12.24A1,1,0,0,0,10,13h4a1,1,0,0,0,1-.76L15.78,9H17a1,1,0,0,1,1,1Zm-3-4a1,1,0,1,0,1,1A1,1,0,0,0,15,15Z"
              />
            </svg>
          </div>
          <div class="user-info">
            <span class="username">${this.message.user}</span>
            <span class="timestamp">${timeAgo}</span>
          </div>
        </div>
        <p class="message-text">${this.message.text}</p>
      </div>
    `;
  }
}

customElements.define("chat-question", QuestionComponent);
