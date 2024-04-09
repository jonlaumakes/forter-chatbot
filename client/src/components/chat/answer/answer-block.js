import { LitElement, html } from "lit";
import { answerComponentStyles } from "./answer-block.css.js";
import { getTimeAgo } from "../util/time-util.js";

export class AnswerComponent extends LitElement {
  constructor() {
    super();
  }
  static styles = [answerComponentStyles];

  static properties = {
    question: { type: Object },
    answer: { type: Object },
    loggedInUser: { type: Object },
    botAnswered: { type: Boolean },
  };

  render() {
    const { question, answer, botAnswered, loggedInUser } = this;

    console.log("answer block - question", question);
    console.log("answer block - answer", answer);
    console.log("answer block - botAnswered", botAnswered);

    const timeAgoAnswer = answer ? getTimeAgo(answer.created_at) : "";
    const duplicateUnansweredQuestionUser =
      question.duplicate_query_unanswered_user !== undefined
        ? question.duplicate_query_unanswered_user
        : null;

    const robotIcon = html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="#ffffff"
        width="2em"
        height="2em"
        viewBox="0 0 24 24"
        data-name="Layer 1"
      >
        <path
          d="M9,15a1,1,0,1,0,1,1A1,1,0,0,0,9,15ZM2,14a1,1,0,0,0-1,1v2a1,1,0,0,0,2,0V15A1,1,0,0,0,2,14Zm20,0a1,1,0,0,0-1,1v2a1,1,0,0,0,2,0V15A1,1,0,0,0,22,14ZM17,7H13V5.72A2,2,0,0,0,14,4a2,2,0,0,0-4,0,2,2,0,0,0,1,1.72V7H7a3,3,0,0,0-3,3v9a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V10A3,3,0,0,0,17,7ZM13.72,9l-.5,2H10.78l-.5-2ZM18,19a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V10A1,1,0,0,1,7,9H8.22L9,12.24A1,1,0,0,0,10,13h4a1,1,0,0,0,1-.76L15.78,9H17a1,1,0,0,1,1,1Zm-3-4a1,1,0,1,0,1,1A1,1,0,0,0,15,15Z"
        />
      </svg>
    `;

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
          stroke="#ffffff"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;

    function getIcon() {
      if (botAnswered || answer.username === "Chatroom Bot") {
        return robotIcon;
      }
      if (answer.user_id === loggedInUser.user_id) {
        return userIcon;
      }
      return otherUserIcon;
    }

    function getAnswerText() {
      // user provided answer
      if (answer.text && !botAnswered && !answer.bot_suggested) {
        return html` <p class="message-text">${answer.text}</p> `;
      }
      // bot found an exact question match + no user answers
      if (duplicateUnansweredQuestionUser && !answer && !answer.bot_suggested) {
        return html`
          <p class="message-text">
            ${`This question was asked before by ${duplicateUnansweredQuestionUser}`}
          </p>
        `;
      }
      // bot found an exact question match + answer(s)
      if (!duplicateUnansweredQuestionUser && answer && !answer.bot_suggested) {
        return html`
          <p class="message-text">
            This question was asked before by
            <strong>${duplicateUnansweredQuestionUser}</strong>
            and answered by
            <strong>${answer.username}</strong>:
          </p>
          <p class="message-text"><strong>Answer:</strong> ${answer.text}</p>
        `;
      }
      // bot found a similar question
      if (answer.bot_suggested) {
        return html`
          <p class="message-text">
            Hi - I found a similar question asked by
            <strong>${answer.similar_question_user}:</strong>
          </p>
          <p class="message-text">
            <strong>Question: </strong>${`${answer.similar_question_text}`}
          </p>
          <p class="message-text"><strong>Answer: </strong>${answer.text}</p>
        `;
      }
    }

    return html`
      <div class="message-container">
        <div class="header">
          <div class="icon-container">${getIcon()}</div>
          <div class="user-info">
            <span class="username"
              >${botAnswered ? "Chatroom Bot" : answer.username}</span
            >
            ${!botAnswered
              ? html`<span class="timestamp">${timeAgoAnswer}</span>`
              : null}
          </div>
        </div>
        <div class="message-container">${getAnswerText()}</div>
      </div>
    `;
  }
}

customElements.define("chat-answer", AnswerComponent);
