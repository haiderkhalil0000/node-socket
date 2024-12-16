const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 5050;
const JWT_SECRET = "Node socket app.";

const parents = {};
const guards = {};

app.use(express.json());

app.post("/generate-token", (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ error: "userId and role are required" });
  }

  const token = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ access_token: token });
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication token missing"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid authentication token"));
  }
});

io.on("connection", (socket) => {
  socket.on("register_parent", (parentId) => {
    parents[parentId] = socket;
  });

  socket.on("register_guard", (guardId) => {
    guards[guardId] = socket;
  });

  socket.on("picket_request_guard", ({ parentId, guardId, data }) => {
    const guardSocket = guards[guardId];
    if (guardSocket) {
      guardSocket.emit("picket_request_guard", { parentId, guardId, data });
    }
  });

  socket.on("picket_request_parent", ({ parentId, guardId, response }) => {
    const parentSocket = parents[parentId];
    if (parentSocket) {
      parentSocket.emit("picket_request_parent", {
        parentId,
        guardId,
        response,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
