const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());  

const PYTHON_PATH = path.join(__dirname, "venv", "Scripts", "python.exe"); // adjust if needed
const PREDICT_SCRIPT = path.join(__dirname, "predict.py");

app.post("/predict", (req, res) => {
  const symptoms = req.body.symptoms;
  if (!symptoms || !Array.isArray(symptoms)) {
    return res.status(400).json({ error: "symptoms must be an array" });
  }

  const py = spawn(PYTHON_PATH, [PREDICT_SCRIPT]);

  py.stdin.write(JSON.stringify({ symptoms }));
  py.stdin.end();

  let data = "";
  py.stdout.on("data", chunk => data += chunk.toString());
  py.stderr.on("data", chunk => console.error("Python stderr:", chunk.toString()));

  py.on("close", code => {
    try {
      res.json(JSON.parse(data));
    } catch (e) {
      res.status(500).json({ error: "Failed to parse Python output", details: data });
    }
  });
});

// --- Start server ---
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
