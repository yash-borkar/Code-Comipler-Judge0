import React, { useState, useEffect } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { cpp } from "@codemirror/lang-cpp"
import { java } from "@codemirror/lang-java"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { githubLight } from "@uiw/codemirror-theme-github"
import Select from "react-select"
import axios from "axios"
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
} from "lucide-react"

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
]

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
}

function App() {
  const [code, setCode] = useState(defaultCode["71"])
  const [output, setOutput] = useState("")
  const [language, setLanguage] = useState(languageOptions[1])
  const [input, setInput] = useState("")
  const [isCompiling, setIsCompiling] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [statusType, setStatusType] = useState("idle") // 'idle', 'success', 'error', 'loading'
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode")
    return savedMode
      ? JSON.parse(savedMode)
      : window.matchMedia("(prefers-color-scheme: dark)").matches
  })
  const [showInfo, setShowInfo] = useState(false)

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  // Handle language change
  const handleLanguageChange = selectedOption => {
    setLanguage(selectedOption)
    setCode(defaultCode[selectedOption.value])
  }

  // Handle code change
  const handleCodeChange = value => {
    setCode(value)
  }

  // Handle code execution
  const executeCode = async () => {
    setIsCompiling(true)
    setStatusType("loading")
    setStatusMessage("Compiling and executing your code...")
    setOutput("")

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
      )

      const { token } = response.data

      // Poll for results
      let intervalId = setInterval(async () => {
        try {
          const result = await axios.get(
            `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
            {
              headers: {
                "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY", // Replace with your RapidAPI key
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
              }
            }
          )

          const { status, stdout, stderr, compile_output } = result.data

          if (status.id >= 3) {
            // Status is not "In Queue" or "Processing"
            clearInterval(intervalId)
            setIsCompiling(false)

            if (status.id === 3) {
              // Accepted
              setStatusType("success")
              setStatusMessage("Code executed successfully!")
              setOutput(stdout || compile_output || "No output")
            } else {
              setStatusType("error")
              setStatusMessage(`Error: ${status.description}`)
              setOutput(
                stderr || compile_output || "No error details available"
              )
            }
          }
        } catch (error) {
          clearInterval(intervalId)
          setIsCompiling(false)
          setStatusType("error")
          setStatusMessage("Error checking submission status")
          setOutput(error.message)
        }
      }, 1000)
    } catch (error) {
      setIsCompiling(false)
      setStatusType("error")
      setStatusMessage("Error submitting code")
      setOutput(error.message)
    }
  }

  // For demo purposes, simulate code execution without actual API call
  const simulateExecution = () => {
    setIsCompiling(true)
    setStatusType("loading")
    setStatusMessage("Compiling and executing your code...")
    setOutput("")

    setTimeout(() => {
      setIsCompiling(false)
      setStatusType("success")
      setStatusMessage("Code executed successfully!")

      if (language.value === "71") {
        // Python
        setOutput("Hello, World!")
      } else if (language.value === "63") {
        // JavaScript
        setOutput("Hello, World!")
      } else if (language.value === "54") {
        // C++
        setOutput("Hello, World!")
      } else if (language.value === "62") {
        // Java
        setOutput("Hello, World!")
      }
    }, 1500)
  }

  // Copy code to clipboard
  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setStatusMessage("Code copied to clipboard!")
    setStatusType("success")
    setTimeout(() => {
      setStatusMessage("")
      setStatusType("idle")
    }, 2000)
  }

  // Download code
  const downloadCode = () => {
    const element = document.createElement("a")
    const file = new Blob([code], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `code.${language.extension}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Reset code to default
  const resetCode = () => {
    setCode(defaultCode[language.value])
    setStatusMessage("Code reset to default!")
    setStatusType("success")
    setTimeout(() => {
      setStatusMessage("")
      setStatusType("idle")
    }, 2000)
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Main container with max width */}
      <div className="max-w-[1440px] mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mr-3">
              <Code2 className="h-7 w-7 text-white" />
            </div>
            <h1
              className={`text-2xl md:text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Code<span className="text-blue-600">Compiler</span>
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-full ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
              aria-label="Information"
            >
              <Info className="h-5 w-5" />
            </button>
            <a
              href="https://github.com/yash-borkar/Code-Comipler-Judge0"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
              aria-label="GitHub Repository"
            >
              <Github className="h-5 w-5" />
            </a>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-yellow-300"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </header>

        {/* Info panel - conditionally rendered */}
        {showInfo && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <h2
              className={`text-xl font-semibold mb-2 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              About CodeCompiler
            </h2>
            <p
              className={`mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              CodeCompiler is an online IDE that allows you to write, compile,
              and run code in multiple programming languages. It uses the Judge0
              API to compile and execute your code securely in the cloud.
            </p>
            <h3
              className={`text-lg font-medium mt-3 mb-1 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Supported Languages
            </h3>
            <ul
              className={`list-disc pl-5 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <li>JavaScript (Node.js)</li>
              <li>Python</li>
              <li>C++</li>
              <li>Java</li>
            </ul>
            <button
              onClick={() => setShowInfo(false)}
              className={`mt-4 px-4 py-2 rounded ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Close
            </button>
          </div>
        )}

        {/* Language selector and action buttons - centered at top */}
        <div
          className={`mb-6 p-4 rounded-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg`}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="w-full md:w-64">
              <label
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
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
            <div className="flex items-center space-x-2">
              <button
                onClick={copyCode}
                className={`flex items-center px-3 py-2 rounded ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                title="Copy code"
              >
                <Copy className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Copy</span>
              </button>
              <button
                onClick={downloadCode}
                className={`flex items-center px-3 py-2 rounded ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                title="Download code"
              >
                <Download className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Download</span>
              </button>
              <button
                onClick={resetCode}
                className={`flex items-center px-3 py-2 rounded ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                title="Reset code"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex flex-col space-y-6">
          {/* Code editor section */}
          <div
            className={`rounded-lg overflow-hidden shadow-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div
              className={`p-3 border-b ${
                darkMode ? "border-gray-700" : "border-gray-200"
              } flex items-center`}
            >
              <FileCode
                className={`h-5 w-5 mr-2 ${
                  darkMode ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <h3
                className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-700"
                }`}
              >
                Code Editor
              </h3>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700">
              <CodeMirror
                value={code}
                height="400px"
                extensions={[language.language()]}
                onChange={handleCodeChange}
                theme={darkMode ? vscodeDark : githubLight}
                className="text-md"
              />
            </div>

            <div className={`p-4 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
              <div className="flex items-center mb-2">
                <FileCode
                  className={`h-5 w-5 mr-2 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <h3
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-700"
                  }`}
                >
                  Input
                </h3>
              </div>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Enter input for your code here..."
                className={`w-full h-20 p-3 rounded-md border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-700 placeholder-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div className="p-4 flex justify-end">
              <button
                // Using real execution now
                onClick={executeCode}
                disabled={isCompiling}
                className={`flex items-center px-6 py-2 rounded-md font-medium ${
                  isCompiling
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                } transition-all duration-200 shadow-md hover:shadow-lg`}
              >
                {isCompiling ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Run Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output section */}
          <div
            className={`rounded-lg overflow-hidden shadow-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div
              className={`p-3 border-b ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <Terminal
                  className={`h-5 w-5 mr-2 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <h3
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-700"
                  }`}
                >
                  Output
                </h3>
              </div>
            </div>

            {statusMessage && (
              <div
                className={`p-3 ${
                  statusType === "success"
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    : statusType === "error"
                    ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                    : statusType === "loading"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                } flex items-center`}
              >
                {statusType === "success" && (
                  <CheckCircle className="h-5 w-5 mr-2" />
                )}
                {statusType === "error" && <XCircle className="h-5 w-5 mr-2" />}
                {statusType === "loading" && (
                  <Clock className="h-5 w-5 mr-2 animate-pulse" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}

            <div
              className={`p-4 h-[300px] overflow-auto font-mono text-sm ${
                darkMode
                  ? "bg-gray-900 text-gray-200"
                  : "bg-gray-50 text-gray-800"
              }`}
            >
              {output ? (
                <pre className="whitespace-pre-wrap">{output}</pre>
              ) : (
                <div
                  className={`text-center py-16 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Run your code to see the output here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className={`mt-10 py-4 text-center border-t ${
            darkMode
              ? "border-gray-800 text-gray-400"
              : "border-gray-200 text-gray-600"
          }`}
        >
          <div className="flex flex-col md:flex-row justify-center items-center gap-2">
            <p>© 2025 CodeCompiler</p>
            <span className="hidden md:inline">•</span>
            <p>Built with React, CodeMirror, and Judge0 API</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
