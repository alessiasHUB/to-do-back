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
  dueDate?: Date;
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
    const queryResponse = await client.query(`
      select * 
      from todos
      order by id DESC
    `);
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
    const values: (string | Date | null)[] = [req.body.task];
    if (req.body.dueDate) {
      values.push(req.body.dueDate);
    } else {
      values.push(null);
    }
    const queryResponse = await client.query(
      `
      insert into todos (task, due_date) 
      values ($1, $2) 
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
    const values = [];
    let query = `update todos set`;

    if (patchData.task) {
      query += ` task = $${values.length + 1},`;
      values.push(patchData.task);
    }
    if (patchData.completed !== undefined) {
      query += ` completed = $${values.length + 1},`;
      values.push(patchData.completed);
    }
    // if (patchData.dueDate !== undefined) {
    //   query += ` due_date = $${values.length + 1},`;
    //   values.push(patchData.dueDate);
    // }

    query =
      query.slice(0, -1) + ` where id = $${values.length + 1} returning *`;
    values.push(req.params.id);

    try {
      const queryResponse = await client.query(query, values);
      const updatedItem = queryResponse.rows[0];
      res.status(200).json(updatedItem);
    } catch (err) {
      console.error(err);
    }
  }
);

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
