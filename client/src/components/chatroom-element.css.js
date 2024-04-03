import { css } from "lit";

export default css`
  :host {
    display: block;
    border: solid 1px gray;
    padding: 16px;
    max-width: 1800px;
  }
  .chat-container {
    display: flex;
    flex-direction: column;
    max-height: 80vh;
    overflow-y: auto;
    padding: 10px;
    background-color: #fff;
    border-radius: 8px;
  }
  .question-input-container {
    display: flex;
    position: fixed; /* Changed to fixed */
    bottom: 0;
    left: 0;
    right: 0;
    margin-bottom: 1em;
    background-color: #fff;
    border-top: 1px solid #ddd; /* Added border top */
    padding: 10px;
    display: flex;
    align-items: center;
    box-shadow: 0px -4px 10px rgba(0, 0, 0, 0.1); /* Added box shadow */

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
    max-width: 70%;
    align-self: flex-start; /* Align questions to the left */
    background-color: #f0f0f0;
    margin-bottom: 0.2empx;
  }

  .chat-answers-container {
    max-width: 66%;
    margin-left: 4%;
    align-self: flex-start; /* Align questions to the left */
  }
  .chat-answer {
    background-color: #f0f0f0;
  }

  .add-answer-button {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    border: none;
    background-color: #0079d3;
    color: #ffffff;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }

  .question-footer {
    margin-bottom: 1em;
  }
`;
