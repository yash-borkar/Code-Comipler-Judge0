import { useState } from "react";
import { Card, CardContent } from "./ui/card"; // ✅ Fix import path
import { Button } from "./ui/button"; // ✅ Fix import path
import { Select, SelectItem } from "./ui/select"; // ✅ Fix import path
import { Textarea } from "./ui/textarea"; // ✅ Fix import path
import { Input } from "./ui/input"; // ✅ Fix import path



const languages = {
  "54": "C++",
  "62": "Java",
  "63": "JavaScript",
  "71": "Python",
};

export default function CodeCompiler() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("54");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const compileCode = async () => {
    setLoading(true);
    const response = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": "14492912fbmsh7ad3e55424e42bcp1aab8djsnb51ba72dd3fc", // Replace with your API key
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        },
        body: JSON.stringify({
          source_code: code,
          language_id: language,
          stdin: input,
        }),
      }
    );

    const result = await response.json();
    setOutput(result.stdout || result.stderr || "Error: No output");
    setLoading(false);
  };

  return (
    <div className="p-6">
      <Card className="p-4 shadow-lg w-full max-w-2xl mx-auto">
        <CardContent>
          <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {Object.entries(languages).map(([id, name]) => (
              <SelectItem key={id} value={id}>{name}</SelectItem>
            ))}
          </Select>
          <Textarea className="mt-4" rows={10} placeholder="Write your code here..." value={code} onChange={(e) => setCode(e.target.value)} />
          <Input className="mt-4" placeholder="Input (optional)" value={input} onChange={(e) => setInput(e.target.value)} />
          <Button className="mt-4 w-full" onClick={compileCode} disabled={loading}>
            {loading ? "Running..." : "Run Code"}
          </Button>
          <Textarea className="mt-4" rows={5} readOnly value={output} placeholder="Output will appear here..." />
        </CardContent>
      </Card>
    </div>
  );
}
