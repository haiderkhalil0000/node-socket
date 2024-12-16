const io = require("socket.io-client");
const socket = io("http://localhost:5050");

socket.on("connect", () => {
  console.log("Guard connected to server");

  const guardId = "guard_1";
  socket.emit("register_guard", guardId);

  socket.on("picket_request_guard", ({ parentId, guardId, data }) => {
    console.log(`Received data from Parent (parentId: ${parentId}): ${data}`);

    const response = typeof data === "string";

    console.log(
      `Sending response to Parent (parentId: ${parentId}): ${response}`
    );
    socket.emit("picket_response_guard", { parentId, guardId, response });
  });
});
