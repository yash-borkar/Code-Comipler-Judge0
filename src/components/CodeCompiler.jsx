import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { githubLight } from "@uiw/codemirror-theme-github";
import Select from "react-select";
import axios from "axios";
import {
  Moon,
  Sun,
  Play,
  Code2,
  FileCode,
  Terminal,
  Download,
  Copy,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Github
} from "lucide-react";
import "../styles.css"; 

// Language options for the dropdown
const languageOptions = [
  {
    value: "63",
    label: "JavaScript (Node.js 12.14.0)",
    extension: "js",
    language: javascript
  },
  { value: "71", label: "Python (3.8.1)", extension: "py", language: python },
  { value: "54", label: "C++ (GCC 9.2.0)", extension: "cpp", language: cpp },
  {
    value: "62",
    label: "Java (OpenJDK 13.0.1)",
    extension: "java",
    language: java
  }
];

// Default code for each language
const defaultCode = {
  "63": `// JavaScript code
console.log("Hello, World!");`,
  "71": `# Python code
print("Hello, World!")`,
  "54": `// C++ code
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  "62": `// Java code
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`
};

function App() {
  const [code, setCode] = useState(defaultCode["71"]);
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState(languageOptions[1]);
  const [input, setInput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("idle"); // 'idle', 'success', 'error', 'loading'
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode
      ? JSON.parse(savedMode)
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [showInfo, setShowInfo] = useState(false);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // Handle language change
  const handleLanguageChange = selectedOption => {
    setLanguage(selectedOption);
    setCode(defaultCode[selectedOption.value]);
  };

  // Handle code change
  const handleCodeChange = value => {
    setCode(value);
  };

  // Handle code execution
  const executeCode = async () => {
    setIsCompiling(true);
    setStatusType("loading");
    setStatusMessage("Compiling and executing your code...");
    setOutput("");

    try {
      // Replace with your Judge0 API endpoint
      const response = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions",
        {
          source_code: code,
          language_id: language.value,
          stdin: input
        },
        {
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": 
              "14492912fbmsh7ad3e55424e42bcp1aab8djsnb51ba72dd3fc", // Replace with your RapidAPI key
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
          }
        }
      );

      const { token } = response.data;

      // Poll for results
      let intervalId = setInterval(async () => {
        try {
          const result = await axios.get(
            `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
            {
              headers: {
                "X-RapidAPI-Key": "14492912fbmsh7ad3e55424e42bcp1aab8djsnb51ba72dd3fc", // Replace with your RapidAPI key
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
              }
            }
          );

          const { status, stdout, stderr, compile_output } = result.data;

          if (status.id >= 3) {
            // Status is not "In Queue" or "Processing"
            clearInterval(intervalId);
            setIsCompiling(false);

            if (status.id === 3) {
              // Accepted
              setStatusType("success");
              setStatusMessage("Code executed successfully!");
              setOutput(stdout || compile_output || "No output");
            } else {
              setStatusType("error");
              setStatusMessage(`Error: ${status.description}`);
              setOutput(
                stderr || compile_output || "No error details available"
              );
            }
          }
        } catch (error) {
          clearInterval(intervalId);
          setIsCompiling(false);
          setStatusType("error");
          
          // Default error message
          let errorMessage = "There was a problem processing your code.";
          
          // Try to extract more useful info if available
          if (error.response) {
            console.error("API Response Error:", error.response);
            
            // First priority: If we have compile_output or stderr from Judge0, use that
            if (error.response.data && (error.response.data.compile_output || error.response.data.stderr)) {
              // These contain the actual compiler errors (missing semicolons, etc.)
              errorMessage = error.response.data.compile_output || error.response.data.stderr;
            }
            // Second priority: If we have a specific status message from Judge0
            else if (error.response.data && error.response.data.status && error.response.data.status.description) {
              errorMessage = `Compilation Error: ${error.response.data.status.description}`;
            }
            // Third priority: Check HTTP status codes
            else if (error.response.status === 400) {
              errorMessage = "Bad request: Your submission format may be incorrect.";
            } else if (error.response.status === 401) {
              errorMessage = "Authentication error: Please check your API key.";
            } else if (error.response.status === 429) {
              errorMessage = "Too many requests: Please try again later.";
            }
            // Fourth priority: Just dump the response data as JSON
            else if (error.response.data) {
              errorMessage = `API Error: ${JSON.stringify(error.response.data)}`;
            }
          } else if (error.request) {
            console.error("No Response Error:", error.request);
            errorMessage = "No response from server. Please check your internet connection.";
          } else {
            console.error("Request Error:", error.message);
            errorMessage = "Error preparing request: " + error.message;
          }
          
          setStatusMessage("Compilation Error");
          setOutput(errorMessage);
        }
      }, 1000);
    } catch (error) {
      setIsCompiling(false);
      setStatusType("error");
      
      // Default error message
      let errorMessage = "Failed to submit your code for execution.";
      
      if (error.response) {
        console.error("Submit API Error:", error.response);
        
        // First priority: Check for compiler output in response
        if (error.response.data && (error.response.data.compile_output || error.response.data.stderr)) {
          errorMessage = error.response.data.compile_output || error.response.data.stderr;
        }
        // Second priority: Check for specific error message
        else if (error.response.data && error.response.data.error) {
          errorMessage = `Error: ${error.response.data.error}`;
        }
        // Third priority: Check HTTP status codes
        else if (error.response.status === 400) {
          errorMessage = "Invalid submission: Please check your code and try again.";
        } else if (error.response.status === 401) {
          errorMessage = "Authentication error: Please check your API key.";
        } else if (error.response.status === 429) {
          errorMessage = "Rate limit exceeded: Please try again later.";
        }
      } else if (error.request) {
        console.error("No Response on Submit:", error.request);
        errorMessage = "No response from server. Please check your internet connection.";
      } else {
        console.error("Submit Request Error:", error.message);
        errorMessage = "Error: " + error.message;
      }
      
      setStatusMessage("Submission Error");
      setOutput(errorMessage);
    }
  };

  // For demo purposes, simulate code execution without actual API call
  const simulateExecution = () => {
    setIsCompiling(true);
    setStatusType("loading");
    setStatusMessage("Compiling and executing your code...");
    setOutput("");

    setTimeout(() => {
      setIsCompiling(false);
      setStatusType("success");
      setStatusMessage("Code executed successfully!");

      if (language.value === "71") {
        // Python
        setOutput("Hello, World!");
      } else if (language.value === "63") {
        // JavaScript
        setOutput("Hello, World!");
      } else if (language.value === "54") {
        // C++
        setOutput("Hello, World!");
      } else if (language.value === "62") {
        // Java
        setOutput("Hello, World!");
      }
    }, 1500);
  };

  // Copy code to clipboard
  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setStatusMessage("Code copied to clipboard!");
    setStatusType("success");
    setTimeout(() => {
      setStatusMessage("");
      setStatusType("idle");
    }, 2000);
  };

  // Download code
  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `code.${language.extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Reset code to default
  const resetCode = () => {
    setCode(defaultCode[language.value]);
    setStatusMessage("Code reset to default!");
    setStatusType("success");
    setTimeout(() => {
      setStatusMessage("");
      setStatusType("idle");
    }, 2000);
  };

  return (
    <div className="app-container">
      {/* Main container with max width */}
      <div className="main-container">
        {/* Header */}
        <header className="app-header">
          <div className="app-logo">
            <div className="logo-icon">
              <Code2 className="icon-large" />
            </div>
            <h1 className="app-title">
            Compile<span className="title-accent">Space</span>
            </h1>
          </div>
          <div className="header-actions">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="icon-button"
              aria-label="Information"
            >
              <Info className="icon-small" />
            </button>
            <a
              href="https://github.com/yash-borkar/Code-Comipler-Judge0"
              target="_blank"
              rel="noopener noreferrer"
              className="icon-button"
              aria-label="GitHub Repository"
            >
              <Github className="icon-small" />
            </a>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="icon-button"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun className="icon-small" />
              ) : (
                <Moon className="icon-small" />
              )}
            </button>
          </div>
        </header>

        {/* Info panel - conditionally rendered */}
        {showInfo && (
          <div className="info-panel">
          <h2 className="panel-title">About CompileSpace</h2>
          <p className="info-text">
            <strong>CompileSpace</strong> is a powerful online IDE that enables you to write, compile, 
            and execute code seamlessly in multiple programming languages. 
            It leverages the <strong>Judge0 API</strong> to process your code securely in the cloud.
          </p>
        
          <h3 className="section-title">Supported Languages</h3>
          <p className="info-text">
          CompileSpace currently supports <strong>JavaScript (Node.js 12.14.0)</strong>, 
            <strong> Python (3.8.1)</strong>, <strong>C++ (GCC 9.2.0)</strong>, 
            and <strong>Java (OpenJDK 13.0.1)</strong>.
          </p>
        </div>
        
        )}

        {/* Language selector and action buttons */}
        <div className="control-panel">
          <div className="control-panel-content">
            <div className="language-selector">
              <label className="selector-label">
                Select Programming Language
              </label>
              <Select
                options={languageOptions}
                value={language}
                onChange={handleLanguageChange}
                className="react-select-container"
                classNamePrefix="react-select"
                isSearchable
                placeholder="Select language..."
                theme={theme => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: darkMode ? "#3b82f6" : "#2563eb",
                    primary25: darkMode ? "#1e3a8a" : "#dbeafe",
                    neutral0: darkMode ? "#1f2937" : "#ffffff",
                    neutral80: darkMode ? "#f9fafb" : "#1f2937"
                  }
                })}
              />
            </div>
            <div className="action-buttons">
              <button
                onClick={copyCode}
                className="action-button"
                title="Copy code"
              >
                <Copy className="icon-small" />
                <span className="button-text">Copy</span>
              </button>
              <button
                onClick={downloadCode}
                className="action-button"
                title="Download code"
              >
                <Download className="icon-small" />
                <span className="button-text">Download</span>
              </button>
              <button
                onClick={resetCode}
                className="action-button"
                title="Reset code"
              >
                <RefreshCw className="icon-small" />
                <span className="button-text">Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content area - modified to use side-by-side layout */}
        <div className="content-area side-by-side">
          {/* Code editor section */}
          <div className="editor-container">
            <div className="panel-header">
              <FileCode className="icon-small icon-accent" />
              <h3 className="panel-title">Code Editor</h3>
            </div>

            <div className="editor-wrapper">
              <CodeMirror
                value={code}
                height="400px"
                extensions={[language.language()]}
                onChange={handleCodeChange}
                theme={darkMode ? vscodeDark : githubLight}
                className="code-editor"
              />
            </div>

            <div className="input-container">
              <div className="input-header">
                <FileCode className="icon-small icon-accent" />
                <h3 className="panel-title">Input</h3>
              </div>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Enter input for your code here..."
                className="code-input"
              />
            </div>

            <div className="editor-actions">
              <button
                onClick={executeCode}
                disabled={isCompiling}
                className={`run-button ${isCompiling ? "disabled" : ""}`}
              >
                {isCompiling ? (
                  <>
                    <RefreshCw className="icon-small spinning" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="icon-small" />
                    Run Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output section */}
          <div className="output-container">
            <div className="panel-header">
              <div className="header-content">
                <Terminal className="icon-small icon-accent" />
                <h3 className="panel-title">Output</h3>
              </div>
            </div>

            {statusMessage && (
              <div className={`status-message ${statusType}`}>
                {statusType === "success" && (
                  <CheckCircle className="icon-small" />
                )}
                {statusType === "error" && <XCircle className="icon-small" />}
                {statusType === "loading" && (
                  <Clock className="icon-small spinning" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="output-content">
              {output ? (
                <pre className="output-text">{output}</pre>
              ) : (
                <div className="output-empty">
                  <Terminal className="icon-large icon-muted" />
                  <p>Run your code to see the output here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <p>© 2025 CompileSpace</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
