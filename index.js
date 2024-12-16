const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();
const io = new Server(server);

const PORT = 5050;

const parents = {};
const guards = {};

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
