const io = require("socket.io-client");
const socket = io("http://localhost:5050");

socket.on("connect", () => {
  console.log("Parent connected to server");

  const parentId = "parent_1";
  const guardId = "guard_1";

  socket.emit("register_parent", parentId);

  const data = "Hello, Guard!";
  socket.emit("picket_request_guard", { parentId, guardId, data });

  socket.on("picket_request_parent", ({ parentId, guardId, response }) => {
    console.log(
      `Response from Guard (guardId: ${guardId}) for Parent (parentId: ${parentId}): ${response}`
    );
  });
});
