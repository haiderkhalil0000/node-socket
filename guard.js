const axios = require("axios");
const io = require("socket.io-client");

(async () => {
  try {
    const response = await axios.post("http://localhost:5050/generate-token", {
      userId: "guard_1",
      role: "guard",
    });

    const token = response.data.access_token;
    const socket = io("http://localhost:5050", {
      auth: {
        token,
      },
    });

    socket.on("connect", () => {
      const guardId = "guard_1";
      socket.emit("register_guard", guardId);
      socket.on("picket_request_guard", ({ parentId, guardId, data }) => {
        console.log(
          `Received data from Parent (parentId: ${parentId}): ${data}`
        );
        const response = typeof data === "string";
        socket.emit("picket_request_parent", { parentId, guardId, response });
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
