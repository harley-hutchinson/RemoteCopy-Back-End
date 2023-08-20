const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const app = express();
const port = 3001;

// Database configuration
const pool = new Pool({
  user: "postgres",
  password: "teas",
  host: "localhost",
  port: 5432,
  database: "test",
});

// Middleware to parse request body as JSON + cors
// app.use(cors());
app.use(express.json());
app.use(cors());

// Endpoint to save the text
app.post("/save", cors(), (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required." });
  }

  pool.query("INSERT INTO saved_texts (text) VALUES ($1)", [text], (err, result) => {
    console.log(`${text} \nSuccessful Save to DB`);

    if (err) {
      console.error("Failed to save the text:", err);
      return res.status(500).json({ error: "Failed to save the text." });
    }

    res.sendStatus(200);
  });

  // Clears the table after the set time | 15 seconds ATM
  // setTimeout(() => {
  //   // Clear the table after 15 seconds
  //   pool.query("DELETE FROM saved_texts", (err, result) => {
  //     if (err) {
  //       console.error("Failed to clear the table:", err);
  //     } else {
  //       console.log("Table cleared successfully.");
  //     }
  //   });
  // }, 15000); // 15000 = 15 seconds | 2 hours = 7200000
});

// Endpoint to retrieve all saved texts
app.get("/texts", cors(), (req, res) => {
  pool.query("SELECT *, id  FROM saved_texts", (err, result) => {
    if (err) {
      console.error("Failed to retrieve texts:", err);
      return res.status(500).json({ error: "Failed to retrieve texts." });
    }

    const savedTexts = result.rows.map((row) => row);
    res.json(savedTexts);
    // console.log(savedTexts);
  });
});

// Delete individual saved text
app.delete("/delete", cors(), (req, res) => {
  const { id } = req.query;

  pool.query("DELETE FROM saved_texts WHERE id = $1", [id], (err, result) => {
    if (err) {
      console.error("Failed to delete text:", err);
      return res.status(500).json({ error: "Failed to delete text." });
    }

    res.json({ message: "Text deleted successfully." });
    console.log(`text delete: ${id}`);
  });
});

// Delete all saved text
app.delete("/deleteall", cors(), (req, res) => {
  pool.query("DELETE FROM saved_texts", (err, result) => {
    if (err) {
      console.error("Failed to all delete text:", err);
      return res.status(500).json({ error: "Failed to delete text." });
    }

    res.json({ message: "All text deleted successfully." });
    console.log("ALL DELETED");
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
