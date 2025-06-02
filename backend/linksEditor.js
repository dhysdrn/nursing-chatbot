import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const linksPath = path.join(__dirname, "db", "linksfornursing.txt");

const readLinks = () =>
  fs.readFileSync(linksPath, "utf-8")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

// GET all links
router.get("/links", (req, res) => {
  try {
    const links = readLinks();
    res.json({ links });
  } catch (err) {
    res.status(500).json({ message: "Failed to read links." });
  }
});

// POST new link
router.post("/links", (req, res) => {
  const { link } = req.body;
  if (!link) return res.status(400).json({ message: "No link provided." });

  try {
    const links = readLinks();
    if (links.includes(link)) {
      return res.status(400).json({ message: "Link already exists." });
    }
    fs.appendFileSync(linksPath, `${link}\n`);
    res.json({ message: "Link added." });
  } catch (err) {
    res.status(500).json({ message: "Failed to add link." });
  }
});

// DELETE link
router.delete("/links", (req, res) => {
  const { link } = req.body;
  if (!link) return res.status(400).json({ message: "No link provided." });

  try {
    const links = readLinks().filter(l => l !== link);
    fs.writeFileSync(linksPath, links.join("\n") + "\n");
    res.json({ message: "Link removed." });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove link." });
  }
});

export default router;
