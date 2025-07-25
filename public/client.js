const socket = io();
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const fileInput = document.getElementById("fileInput");
const usernameInput = document.getElementById("username");
const chatWindow = document.getElementById("chat-window");

function sendMessage() {
  const username = usernameInput.value.trim();
  const text = messageInput.value.trim();
  const file = fileInput.files[0] ? fileInput.files[0].name : "";

  if (!username) return alert("Enter your username!");
  socket.emit("chat", { username, text, file });

  messageInput.value = "";
  fileInput.value = "";
}

socket.on("chat", data => {
  const div = document.createElement("div");
  div.className = data.username === usernameInput.value.trim() ? "sender" : "receiver";
  div.innerHTML = `<p><strong>${data.username}:</strong> ${data.text}</p>`;
  if (data.file) {
    div.innerHTML += `<p>📎 <a href="/uploads/${data.file}" target="_blank">${data.file}</a></p>`;
  }
  chatWindow.appendChild(div);
});

sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});