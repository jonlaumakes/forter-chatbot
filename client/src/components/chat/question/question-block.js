import { LitElement, html } from "lit";
import { questionComponentStyles } from "./question-block.css.js";
import { getTimeAgo } from "../util/time-util.js";

export class QuestionComponent extends LitElement {
  constructor() {
    super();
  }
  static styles = [questionComponentStyles];

  static properties = {
    question: { type: Object },
    loggedInUser: { type: Object },
  };

  render() {
    const { question, loggedInUser } = this;
    console.log("question-block question", question);
    const timeAgo = getTimeAgo(this.question.created_at);

    const userIcon = html`
      <svg
        width="2em"
        height="2em"
        viewBox="0 0 1024 1024"
        class="icon"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M691.573 338.89c-1.282 109.275-89.055 197.047-198.33 198.331-109.292 1.282-197.065-90.984-198.325-198.331-0.809-68.918-107.758-68.998-106.948 0 1.968 167.591 137.681 303.31 305.272 305.278C660.85 646.136 796.587 503.52 798.521 338.89c0.811-68.998-106.136-68.918-106.948 0z"
          fill="#4A5699"
        />
        <path
          d="M294.918 325.158c1.283-109.272 89.051-197.047 198.325-198.33 109.292-1.283 197.068 90.983 198.33 198.33 0.812 68.919 107.759 68.998 106.948 0C796.555 157.567 660.839 21.842 493.243 19.88c-167.604-1.963-303.341 140.65-305.272 305.278-0.811 68.998 106.139 68.919 106.947 0z"
          fill="#C45FA0"
        />
        <path
          d="M222.324 959.994c0.65-74.688 29.145-144.534 80.868-197.979 53.219-54.995 126.117-84.134 201.904-84.794 74.199-0.646 145.202 29.791 197.979 80.867 54.995 53.219 84.13 126.119 84.79 201.905 0.603 68.932 107.549 68.99 106.947 0-1.857-213.527-176.184-387.865-389.716-389.721-213.551-1.854-387.885 178.986-389.721 389.721-0.601 68.991 106.349 68.933 106.949 0.001z"
          fill="#E5594F"
        />
      </svg>
    `;

    const otherUserIcon = html`
      <svg
        width="2em"
        height="2em"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14 19.2857L15.8 21L20 17M4 21C4 17.134 7.13401 14 11 14C12.4872 14 13.8662 14.4638 15 15.2547M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z"
          stroke="#e4e4e4"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;

    function getIcon() {
      if (question.user_id === loggedInUser.user_id) {
        return userIcon;
      }
      return otherUserIcon;
    }

    return html`
      <div class="message-container">
        <div class="header">
          <div class="icon-container">${getIcon()}</div>
          <div class="user-info">
            <span class="username">${question.username}</span>
            <span class="timestamp">${timeAgo}</span>
          </div>
        </div>
        <p class="message-text">${this.question.question_text}</p>
      </div>
    `;
  }
}

customElements.define("chat-question", QuestionComponent);
