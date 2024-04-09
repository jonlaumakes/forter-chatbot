import { css } from "lit";

export const answerComponentStyles = css`
  p {
    font-family: Helvetica, Arial, sans-serif;
  }
  .message-container {
    /* background-color: #e4e4e4; */
    padding-bottom: 0.5em;
    padding-left: 1.3em;
    border-radius: 5px;
    .message-text {
      color: #dedede;
      font-size: 1em;
      margin-top: 0.4em;
      margin-left: 3em;
      margin-bottom: 0.3em;
    }
    .similar-question-text {
      color: #dedede;
      font-size: 1em;
      margin-top: 0.4em;
      margin-left: 4em;
      margin-bottom: 0.3em;
    }
  }

  .header {
    display: flex;
    align-items: justify;
    justify-content: flex-start;
    margin-bottom: 5px;
  }

  icon-container {
    width: 1em;
  }

  .user-info {
    display: flex;
    align-items: center;
  }

  .username {
    font-family: Helvetica, Arial, sans-serif;
    color: #dedede;
    font-weight: bold;
    margin-right: 0.5em;
    margin-left: 0.7em;
    font-size: 1.3em;
  }

  .timestamp {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 0.87em;
    color: #667;
  }

  .bot-message-text {
    margin-top: 0.4em;
    margin-left: 4em;
    margin-bottom: 0.3em;
    font-weight: bold;
  }

  .footer {
    display: flex;
    justify-content: space-between;
  }

  .upvote-icon {
    /* background-color: #8a8f94; */
    color: #fff;
    border: none;
    border-radius: 3px;
    padding: 5px;
    cursor: pointer;
  }
`;
