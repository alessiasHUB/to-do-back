import express from "express";
import cors from "cors";
import { Client } from "pg";

const client = new Client(process.env.DATABASE_URL);

//TODO: this request for a connection will not necessarily complete before the first HTTP request is made!
client.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/signatures", async (req, res) => {
  const signatures = await client.query('select * from signatures;'); //DONE|FIXME-TASK: get signatures from db!
  res.status(200).json({
    status: "success",
    data: {
      signatures
    },
  });
});

app.get("/signatures/:id", async (req, res) => {
  // :id indicates a "route parameter", available as req.params.id
  //  see documentation: https://expressjs.com/en/guide/routing.html
  const id = parseInt(req.params.id); // params are always string type

  const signature = await client.query(`
    select * 
    from signatures 
      where id = ${id}
  `);   //DONE|FIXME-TASK get the signature row from the db (match on id)

  if (signature) {
    res.status(200).json({
      status: "success",
      data: {
        signature,
      },
    });
  } else {
    res.status(404).json({
      status: "fail",
      data: {
        id: "Could not find a signature with that id identifier",
      },
    });
  }
});

app.post("/signatures", async (req, res) => {
  const { name, message } = req.body;
  if (typeof name === "string") {
    const createdSignature = await client.query(`
      insert into signatures (name,message) 
      values ('${name}','${message}');
    `); //DONE|FIXME-TASK: insert the supplied signature object into the DB

    res.status(201).json({
      status: "success",
      data: {
        signature: createdSignature, //return the relevant data (including its db-generated id)
      },
    });
  } else {
    res.status(400).json({
      status: "fail",
      data: {
        name: "A string value for name is required in your JSON body",
      },
    });
  }
});

//update a signature.
app.put("/signatures/:id", async (req, res) => {
  //  :id refers to a route parameter, which will be made available in req.params.id
  const { name, message } = req.body;
  const id = parseInt(req.params.id);
  if (typeof name === "string") {

    const result: any = await client.query(`
      UPDATE signatures
      SET name = '${name}', message = '${message}',
      WHERE id = ${id};
    `); //DONE|FIXME-TASK: update the signature with given id in the DB.

    if (result.rowCount === 1) {
      const updatedSignature = result.rows[0];
      res.status(200).json({
        status: "success",
        data: {
          signature: updatedSignature,
        },
      });
    } else {
      res.status(404).json({
        status: "fail",
        data: {
          id: "Could not find a signature with that id identifier",
        },
      });

    }
  } else {
    res.status(400).json({
      status: "fail",
      data: {
        name: "A string value for name is required in your JSON body",
      },
    });
  }
});

app.delete("/signatures/:id", async (req, res) => {
  const id = parseInt(req.params.id); // params are string type

  const queryResult: any = await client.query(`
    delete * 
    from signatures
    where id = ${id}
  `); ////DONE|FIXME-TASK: delete the row with given id from the db  
  const didRemove = queryResult.rowCount === 1;

  if (didRemove) {
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE#responses
    // we've gone for '200 response with JSON body' to respond to a DELETE
    //  but 204 with no response body is another alternative:
    //  res.status(204).send() to send with status 204 and no JSON body
    res.status(200).json({
      status: "success",
    });
  } else {
    res.status(404).json({
      status: "fail",
      data: {
        id: "Could not find a signature with that id identifier",
      },
    });
  }
});

export default app;
