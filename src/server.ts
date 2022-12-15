import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Client } from "pg";
import filePath from "./filePath";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
const PORT_NUMBER = process.env.PORT ?? 4000;
const client = new Client(process.env.DATABASE_URL);
client.connect();

export interface DbItem {
  id: number;
  task: string;
  completed: boolean;
}

export interface taskText {
  task: string;
}

//API info page
app.get("/", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

// GET /items
app.get("/items", async (req, res) => {
  try {
    const queryResponse = await client.query(`select * from todos`);
    const allItems = queryResponse.rows;
    res.status(200).json(allItems);
  } catch (err) {
    console.error(err);
  }
});

// GET /items/:id
app.get<{ id: string }>("/items/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const values = [id];
    const queryResponse = await client.query(
      `
      select * 
      from todos 
      where id = $1
    `,
      values
    );
    const matchingTodo = queryResponse.rows[0];
    res.status(200).json(matchingTodo);
  } catch (err) {
    console.error(err);
  }
});

// POST /items
app.post<{}, {}, DbItem>("/items", async (req, res) => {
  try {
    const values = [req.body.task];
    const queryResponse = await client.query(
      `
      insert into todos (task) 
      values ($1) 
      returning *
    `,
      values
    );
    const createdItem = queryResponse.rows[0];
    res.status(201).json(createdItem);
  } catch (err) {
    console.error(err);
  }
});

// DELETE /items/:id
app.delete<{ id: string }>("/items/:id", async (req, res) => {
  const values = [req.params.id];
  try {
    const queryResponse = await client.query(
      `
      delete from todos
      where id = $1
      returning *
    `,
      values
    );
    const removedItem = queryResponse.rows[0];
    res.status(200).json(removedItem);
    // add if statement if rows are NOT 1
  } catch (err) {
    console.error(err);
  }
});

// DELETE /completed-items
app.delete("/completed-items", async (req, res) => {
  try {
    const queryResponse = await client.query(`
      delete from todos 
      where completed = true 
      returning *
    `);
    const returnedItems = queryResponse.rows;
    res.status(200).json(returnedItems);
  } catch (err) {
    console.error(err);
  }
});

// PATCH /items/:id
app.patch<{ id: string }, {}, Partial<DbItem>>(
  "/items/:id",
  async (req, res) => {
    const patchData = req.body;
    try {
      if (patchData.task && patchData.completed !== undefined) {
        const values = [patchData.task, patchData.completed, req.params.id];
        const queryResponse = await client.query(
          `
        update todos
        set task = $1, completed = $2
        where id = $3
        returning *
      `,
          values
        );
        const updatedItem = queryResponse.rows[0];
        res.status(200).json(updatedItem);
      } else if (
        patchData.task === undefined &&
        patchData.completed !== undefined
      ) {
        const values = [patchData.completed, req.params.id];
        const queryResponse = await client.query(
          `
        update todos
        set completed = $1
        where id = $2
        returning *
      `,
          values
        );
        const updatedItem = queryResponse.rows[0];
        res.status(200).json(updatedItem);
      } else if (patchData.task && patchData.completed === undefined) {
        const values = [patchData.task, req.params.id];
        const queryResponse = await client.query(
          `
        update todos
        set task = $1
        where id = $2
        returning *  
      `,
          values
        );
        const updatedItem = queryResponse.rows[0];
        res.status(200).json(updatedItem);
      }
    } catch (err) {
      console.error(err);
    }
  }
);

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
