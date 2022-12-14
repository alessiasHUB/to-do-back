import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  addDbItems,
  getAllDbItems,
  getDbItemById,
  DbItem,
  updateDbItemById,
  deleteCompletedItems,
  deleteDbItemById
} from "./db";
import filePath from "./filePath";

export interface taskText {
  task: string;
}

const app = express();

/** Parses JSON data in a request automatically */
app.use(express.json());
/** To allow 'Cross-Origin Resource Sharing': https://en.wikipedia.org/wiki/Cross-origin_resource_sharing */
app.use(cors());

// read in contents of any environment variables in the .env file
dotenv.config();

// use the environment variable PORT, or 4000 as a fallback
const PORT_NUMBER = process.env.PORT ?? 4000;

// API info page
app.get("/", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

// GET /items
app.get("/items", (req, res) => {
  const allItems = getAllDbItems();
  res.status(200).json(allItems);
});

// POST /items
app.post<{}, {}, DbItem>("/items", (req, res) => {
  const postData = req.body;
  const createdItem = addDbItems(postData);
  res.status(201).json(createdItem);
});

// GET /items/:id
app.get<{ id: string }>("/items/:id", (req, res) => {
  const matchingItem = getDbItemById(parseInt(req.params.id));
  if (matchingItem === "not found") {
    res.status(404).json(matchingItem);
  } else {
    res.status(200).json(matchingItem);
  }
});

// DELETE /items/:id
app.delete<{ id: string }>("/items/:id", (req, res) => {
  const matchingItem = getDbItemById(parseInt(req.params.id));
  
  if (matchingItem === "not found") {
    res.status(404).json(matchingItem);
  } else {
    deleteDbItemById(parseInt(req.params.id))
    res.status(200).json(matchingItem);
  }
});

// DELETE /completed-items
app.delete("/completed-items", (req, res) => {
  const completedArr = deleteCompletedItems();
  if (completedArr === "no completed items found") {
    res.status(404).json(completedArr);
  } else {
    res.status(200).json(completedArr);
  }
});

// PATCH /items/:id
app.patch<{ id: string }, {}, Partial<DbItem>>("/items/:id", (req, res) => {
  const matchingItem = updateDbItemById(parseInt(req.params.id), req.body);
  if (matchingItem === "not found") {
    res.status(404).json(matchingItem);
  } else {
    res.status(200).json(matchingItem);
  }
});

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
