const axios = require("axios");
const io = require("socket.io-client");

(async () => {
  try {
    const response = await axios.post("http://localhost:5050/generate-token", {
      userId: "parent_1",
      role: "parent",
    });

    const token = response.data.access_token;
    const socket = io("http://localhost:5050", {
      auth: {
        token,
      },
    });
    socket.on("connect", () => {
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
    socket.on("connect_error", (err) => {
      console.error("Connection Error:", err.message);
    });
  } catch (error) {
    console.error(
      "Error generating token or connecting to WebSocket:",
      error.message
    );
  }
})();
