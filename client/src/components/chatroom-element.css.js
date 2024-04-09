import { css } from "lit";

export default css`
  :host {
    background: radial-gradient(#393939, #000000);
    padding-left: 16px;
    padding-right: 16px;
    max-width: 1800px;
  }

  body {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
  }

  .page-header {
    border-bottom: 2px solid rgba(128, 128, 128, 0.5);
    .title-container {
      display: flex;
      justify-content: start;
      padding-left: 2em;
      padding-bottom: 1em;
      .title {
        padding-right: 0.5em;
      }
      .username {
        color: #3ededd;
        padding-right: 2em;
      }
    }
  }
  .conversation-container {
    display: flex;
    justify-content: center;
    max-width: 1800px;
  }
  .chats-container {
    display: flex;
    flex-direction: column;
    width: 85vw;
    min-height: 80vh;
    max-height: 80vh;
    overflow-y: auto;
    padding: 3em;
  }
  .question-input-container {
    display: flex;
    justify-content: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    border-top: 1px solid #ddd;
    padding: 1em;
    display: flex;
    align-items: center;
    box-shadow: 0px -4px 10px rgba(0, 0, 0, 0.1);
    background-color: #fff;

    input[type="text"] {
      font-size: 1em;
      flex: 1;
      max-width: calc(0.68 * 100vw);
      height: 2.6em;
      padding: 0.2em;
      padding-left: 2em;
      border-radius: 20px; /* Increased border-radius for rounded corners */
      border: 1px solid #ccc;
      margin-right: 0.5em;
      outline: none; /* Remove outline on focus */
    }
    button {
      font-size: 1.25em;
      padding: 8px 16px;
      border-radius: 20px; /* Increased border-radius for rounded corners */
      background-color: #8a8f94;
      color: #fff;
      border: none;
      cursor: pointer;
      outline: none; /* Remove outline on focus */
      transition: background-color 0.3s ease; /* Added transition for smooth hover effect */
    }
  }
  .question-group-container {
    margin-bottom: 2em;
  }

  .line-container {
    margin-left: 1em;
  }

  .chat-question-container {
    max-width: 95%;
    align-self: flex-start;
    /* background-color: #f0f0f0; */
    margin-bottom: 0.2empx;
  }

  .chat-answers-container {
    max-width: 91%;
    margin-left: 4%;
    align-self: flex-start;
  }
  .chat-answer {
    /* background-color: #f0f0f0; */
  }

  .add-answer-button {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    border: solid 2px #cdcdcd;
    background-color: transparent;
    background-repeat: no-repeat;
    color: #ffffff;
    font-size: 1em;
    font-weight: bold;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }

  .question-footer {
    margin-bottom: 1em;
  }

  .answer-question-container {
    display: flex;
    justify-content: flex-end;
  }

  .answer-reply-input {
    padding: 1em;
    width: 80%;
    height: 5em;
    border: solid 2px #cdcdcd;
    background-color: transparent;
    background-repeat: no-repeat;
    border-radius: 2px;
    resize: vertical;
    margin-bottom: 0.2em;
    background-color: #d0d4e1;
  }
  .reply-button {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    border: solid 2px #cdcdcd;
    background-color: transparent;
    background-repeat: no-repeat;
    color: #ffffff;
    font-size: 1em;
    font-weight: bold;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }
`;
