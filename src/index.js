/*global chrome*/
/* src/content.js */
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App";

class Main extends React.Component {
  render() {
    return (
      <div className="extension">
        <App />
      </div>
    );
  }
}

const app = document.createElement("div");
app.id = "my-extension-root";

document.body.appendChild(app);
ReactDOM.render(<Main />, app);

app.style.display = "none";

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === "clicked_browser_action") {
    toggle();
  }
});

function toggle() {
  if (app.style.display === "none") {
    app.style.display = "block";
  } else {
    app.style.display = "none";
  }
}
