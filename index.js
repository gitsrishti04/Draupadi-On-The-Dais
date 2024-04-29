const express = require("express");
const sqlite3 = require("sqlite3");
const app = express();

const db = new sqlite3.Database("db.sqlite3");

const PORT = process.env.PORT || 8000;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.set("db", db);

app.use(express.static("static"));

app.post("/register/user", (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!(firstName && lastName && email && password)) {
        console.log("Invalid parameters!");
        res.status(400).json({ success: false, message: "Provide all the parameters!" });
        return;
    }

    const db = app.get("db");
    if (!db) {
        res.status(500).json({ success: false });
        return;
    }

    const stmt = db.prepare("INSERT INTO users VALUES(?, ?, ?, ?, 0)");

    stmt.run([firstName, lastName, email, password], (err) => {
        if (err) {
            res.status(500).json({ success: false });
            return;
        }

        res.status(200).json({ success: true, email, speaker: false });
    });
});

app.post("/register/speaker", (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!(firstName && lastName && email && password)) {
        console.log("Invalid parameters!");
        res.status(400).json({ success: false, message: "Provide all the parameters!" });
        return;
    }

    const db = app.get("db");
    if (!db) {
        res.status(500).json({ success: false });
        return;
    }

    const stmt = db.prepare("INSERT INTO users VALUES(?, ?, ?, ?, 1)");

    stmt.run([firstName, lastName, email, password], (err) => {
        if (err) {
            res.status(500).json({ success: false });
            return;
        }

        res.status(200).json({ success: true, email, speaker: true });
    });
});

app.post("/authenticate", (req, res) => {
    const { email, password } = req.body;

    if (!(email && password)) {
        res.status(400).json({ success: false, message: "Provide all the parameters!" });
        return;
    }

    const db = app.get("db");
    if (!db) {
        res.status(500).json({ success: false });
        return;
    }

    db.get(`SELECT email, password, speaker FROM users WHERE email LIKE '${email}'`, (err, row) => {
        if (err) {
            res.status(500).json({ success: false });
            return;
        }

        if (row === undefined) {
            res.status(400).json({ success: false, message: "User/Speaker does not exist!" });
            return;
        }

        if (row.password === password) {
            res.status(200).json({ success: true, email, speaker: row.speaker === 0 ? false : true });
            return;
        } else {
            res.status(401).json({ success: false, message: "Incorrect password!" });
            return;
        }
    }); 
});

app.listen(PORT, () => {
    console.log(`Started server on port ${PORT}`);

    // Initialize DB
    db.run(
        "CREATE TABLE IF NOT EXISTS users (first_name TEXT NOT NULL, last_name NOT NULL, email TEXT NOT NULL PRIMARY KEY, password TEXT NOT NULL, speaker BOOLEAN DEFAULT 0)"
    );
});
