import React, { useState, useEffect } from "react"
import "./App.css"
import CodeCompiler from "./components/CodeCompiler";

function App() {
  return (
    <div className="app-container">
      <CodeCompiler />
    </div>
  );
}

export default App
