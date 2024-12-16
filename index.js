const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();
const io = new Server(server);

const PORT = 5050;

const parents = {};
const guards = {};

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("register_parent", (parentId) => {
    parents[parentId] = socket;
    console.log(`Parent connected with parentId: ${parentId}`);
  });

  socket.on("register_guard", (guardId) => {
    guards[guardId] = socket;
    console.log(`Guard connected with guardId: ${guardId}`);
  });

  socket.on("picket_request_parent", ({ parentId, guardId, data }) => {
    console.log(
      `Parent request received: parentId=${parentId}, guardId=${guardId}, Data=${data}`
    );

    const guardSocket = guards[guardId];
    if (guardSocket) {
      console.log(
        `Sending data to Guard (guardId: ${guardId}) from Parent (parentId: ${parentId})`
      );
      guardSocket.emit("picket_request_guard", { parentId, guardId, data });
    } else {
      console.log(`No guard connected with guardId: ${guardId}`);
    }
  });

  socket.on("picket_response_guard", ({ parentId, guardId, response }) => {
    console.log(
      `Guard response received: parentId=${parentId}, guardId=${guardId}, Response=${response}`
    );

    const parentSocket = parents[parentId];
    if (parentSocket) {
      console.log(
        `Sending response to Parent (parentId: ${parentId}) from Guard (guardId: ${guardId})`
      );
      parentSocket.emit("picket_response_parent", {
        parentId,
        guardId,
        response,
      });
    } else {
      console.log(`No parent connected with parentId: ${parentId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
