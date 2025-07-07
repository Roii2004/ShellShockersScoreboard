const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

const db = new sqlite3.Database("./scores.db");

db.run(`CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playerName TEXT NOT NULL,
    score INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Define route for Unity to send scores
app.post("/addscore", (req, res) => {
    const name = req.body.playerName;
    const score = req.body.score;

    if (!name || typeof score !== "number") {
        return res.status(400).json({ message: "Invalid input." });
    }

    db.run("INSERT INTO scores (playerName, score) VALUES (?, ?)", [name, score], function (err) {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error." });
        }

        console.log(`Stored score from ${name}: ${score}`);
        res.status(200).json({ message: "Score saved." });
    });
});

// Route to get top 10 scores in descending order
app.get("/topscores", (req, res) => {
    db.all(
        "SELECT playerName, score, timestamp FROM scores ORDER BY score DESC LIMIT 10",
        [],
        (err, rows) => {
            if (err) {
                console.error("Database read error:", err);
                return res.status(500).json({ message: "Database error." });
            }
            res.json(rows);
        }
    );
});

// Temporary route to clear all scores (DEV ONLY)
app.post("/clearscores", (req, res) => {
    db.run("DELETE FROM scores", [], (err) => {
        if (err) {
            console.error("Failed to clear scores:", err);
            return res.status(500).json({ message: "Failed to clear scores." });
        }
        res.json({ message: "All scores cleared." });
    });
});

// Also allow clearing scores via GET for convenience
app.get("/clearscores", (req, res) => {
    db.run("DELETE FROM scores", [], (err) => {
        if (err) {
            console.error("Failed to clear scores (GET):", err);
            return res.status(500).json({ message: "Failed to clear scores." });
        }
        res.json({ message: "All scores cleared via GET." });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});