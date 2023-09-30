const express = require("express");
const cors = require("cors");
const r = require("rethinkdb");
const http = require("http");
const { Server } = require("socket.io");

let connection;

r.connect(
  { host: "127.0.0.1", port: 28015, db: "todoListDB" },
  function (err, conn) {
    if (err) throw err;
    connection = conn;
    r.table("tasks")
      .changes({ squash: true, includeTypes: true })
      .run(connection, function (err, cursor) {
        cursor.each(function (err, row) {
          console.log(row);
          switch (row.type) {
            case "change":
              io.emit("taskChange", row.new_val); // Ajusté pour correspondre au client
              break;

            case "add":
              io.emit("taskAdd", row.new_val); // Ajusté pour correspondre au client
              break;

            case "remove":
              io.emit("taskDelete", row.old_val.id); // Ajusté pour correspondre au client
              break;

            default:
              break;
          }
        });
      });
  }
);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connect", function (socket) {
  console.log("user connected");
});

app.use(cors());
app.use(express.json());

app.get("/tasks", (req, res) => {
  r.table("tasks").run(connection, function (err, cursor) {
    cursor.toArray(function (err, results) {
      res.json(results);
    });
  });
});

app.post("/tasks", (req, res) => {
  const body = req.body;
  r.table("tasks")
    .insert(body)
    .run(connection, function (err, result) {
      if (err) throw err;
      res.json({ success: true, result: result });
    });
});

app.delete("/tasks/:id", (req, res) => {
  const id = req.params.id;
  r.table("tasks")
    .get(id)
    .delete()
    .run(connection, function (err, result) {
      if (err) throw err;
      res.json({ success: true, result: result });
    });
});

app.put("/tasks/:id", (req, res) => {
  const id = req.params.id;
  let body = req.body;

  r.table("tasks")
    .get(id)
    .update(body)
    .run(connection, (err, result) => {
      if (err) throw err;
      res.json({ success: true, result: result });

      r.table("tasks")
        .get(id)
        .run(connection, function (err, result) {
          if (err) throw err;
          io.emit("taskChanged", result); // Name changed here to match client
        });
    });
});

server.listen(3000, "0.0.0.0", () => {
  console.log(`Server is running on port 3000`);
});
