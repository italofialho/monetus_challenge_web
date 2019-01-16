import React from "react";
import ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./CSS/custom.css";
import "./CSS/card.css";
import "./CSS/navbar.css";
import * as serviceWorker from "./serviceWorker";
import RootComponent from "./Components/RootView";

ReactDOM.render(<RootComponent />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
