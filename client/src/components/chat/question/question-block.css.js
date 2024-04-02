import { css } from "lit";

export const questionComponentStyles = css`
  .message-container {
    background-color: #f0f0f0;
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
    font-weight: bold;
    margin-right: 5px;
    margin-left: 0.7em;
  }

  .timestamp {
    color: #666;
  }

  .message-text {
    margin-bottom: 10px;
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
