import { css } from "lit";

export const answerComponentStyles = css`
  .message-container {
    background-color: #cdcdcd;
    padding: 0.5em;
    padding-left: 1.3em;
    border-radius: 5px;
    margin-bottom: 0.5em;
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
    font-weight: bold;
    margin-right: 5px;
    margin-left: 0.7em;
  }

  .timestamp {
    font-size: 0.87em;
    color: #666;
  }

  .message-text {
    margin-top: 0.4em;
    margin-left: 3em;
    margin-bottom: 0.3em;
  }

  .bot-message-text {
    margin-top: 0.4em;
    margin-left: 3em;
    margin-bottom: 0.3em;
    font-weight: bold;
  }

  .footer {
    display: flex;
    justify-content: space-between;
  }

  .upvote-icon {
    background-color: #8a8f94;
    color: #fff;
    border: none;
    border-radius: 3px;
    padding: 5px;
    cursor: pointer;
  }
`;
