// app.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const app = express();

console.log("📂 Auth middleware chargé depuis :", require.resolve("./middleware/auth"));


// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());

// ✅ Route de healthcheck (toujours dispo)
app.get("/status", (req, res) => {
  res.json({ status: "API OK", timestamp: new Date().toISOString() });
});

// Routes API
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/licenses", require("./routes/licenseRoutes"));
// … ajoute ici les autres routes API

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

// Erreur globale
app.use((err, req, res, next) => {
  console.error("🔥 Unexpected error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Jobs (protégé avec try/catch pour ne pas bloquer l’API)
try {
  require("./jobs/licenseCron");
} catch (err) {
  console.error("⚠️ Erreur lors du chargement de licenseCron:", err.message);
}

// Lancement serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 API running on :${PORT}`);
});

module.exports = app;

