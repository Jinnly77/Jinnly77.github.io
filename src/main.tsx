import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ReadingProgressProvider } from "./context/ReadingProgressContext";
import { PostVisitsProvider } from "./context/PostVisitsContext";
import App from "./App";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <ReadingProgressProvider>
          <PostVisitsProvider>
            <App />
          </PostVisitsProvider>
        </ReadingProgressProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
