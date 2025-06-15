/**
 * @description
 * Express router module for managing nursing-related links stored in a text file.
 * Supports reading all links, adding new links, and deleting existing links.
 * Links are stored line-by-line in `db/linksfornursing.txt`.
 * @version 1.0
 */
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const linksPath = path.join(__dirname, "db", "linksfornursing.txt");

/**
 * @function readLinks
 * @description
 * Reads the nursing links text file, splits it by lines,
 * trims whitespace, and filters out empty lines.
 *
 * @returns {string[]} Array of link strings.
 */
const readLinks = () =>
  fs.readFileSync(linksPath, "utf-8")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

/**
 * @route GET ALL /links
 * @description
 * Retrieves all nursing links from the text file.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.get("/links", (req, res) => {
  try {
    const links = readLinks();
    res.json({ links });
  } catch (err) {
    res.status(500).json({ message: "Failed to read links." });
  }
});


/**
 * @route POST new /links
 * @description
 * Adds a new nursing link to the text file if it doesn't already exist.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
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


/**
 * @route DELETE /links
 * @description
 * Removes the specified nursing link from the text file if it exists.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
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
