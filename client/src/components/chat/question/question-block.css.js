import { css } from "lit";

export const questionComponentStyles = css`
  p {
    font-family: Helvetica, Arial, sans-serif;
  }
  .message-container {
    /* background-color: #f0f0f0; */
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
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
    margin-right: 5px;
    margin-left: 0.7em;
    font-size: 1.3em;
  }

  .timestamp {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 0.87em;
    color: #667;
  }

  .message-text {
    color: #dedede;
    margin-top: 0.4em;
    margin-left: 3em;
    margin-bottom: 0.3em;
  }

  .bot-help {
    color: #dedede;
    padding-top: 0.2em;
    margin-left: 4em;
    margin-bottom: 0.3em;
  }

  .footer {
    display: flex;
    justify-content: space-between;
  }

  .upvote-icon {
    background-color: #28a745;
    color: #fff;
    border: none;
    border-radius: 3px;
    padding: 5px;
    cursor: pointer;
  }
`;
