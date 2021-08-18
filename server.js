const express = require("express");
const socketIo = require("socket.io");
const cors = require("cors");

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());

const http = app.listen(PORT, () =>
	console.log(`🚀 Server ready at http://localhost:${PORT}`)
);

const io = socketIo(http, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});

io.once("connection", (socket) => {
	const id = socket.handshake.query.id;
	socket.join(id);

	socket.on("send-message", ({ recipients, text }) => {
		recipients.forEach((recipient) => {
			const newRecipients = recipients.filter((r) => r !== recipient);
			newRecipients.push(id);
			socket.broadcast.to(recipient).emit("receive-message", {
				recipients: newRecipients,
				sender: id,
				text,
			});
		});
	});
});
