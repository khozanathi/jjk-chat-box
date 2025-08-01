const socket = io();
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const fileInput = document.getElementById("fileInput");
const usernameInput = document.getElementById("username");
const chatWindow = document.getElementById("chat-window");

function sendMessage() {
  const username = usernameInput.value.trim();
  const text = messageInput.value.trim();
  const file = fileInput.files[0];

  if (!username) return alert("Please enter your username!");

  const formData = new FormData();
  formData.append("username", username);
  formData.append("text", text);
  if (file) formData.append("file", file);

  fetch("/api/messages", {
    method: "POST",
    body: formData
  });

  messageInput.value = "";
  fileInput.value = "";
}

function displayMessage(data) {
  const div = document.createElement("div");
  div.className = data.username === usernameInput.value.trim() ? "sender" : "receiver";

  let content = `<p><strong>${data.username}:</strong> ${data.text}</p>`;

  if (data.file) {
    const fileUrl = `/uploads/${data.file}`;
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(data.file);

    if (isImage) {
      content += `<p><img src="${fileUrl}" class="chat-image" alt="Image file" /></p>`;
    } else {
      content += `<p>📎 <a href="${fileUrl}" target="_blank" download>${data.file}</a></p>`;
    }
  }

  div.innerHTML = content;
  chatWindow.appendChild(div);
}

// Load chat history on page load
document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("/api/messages");
  const messages = await response.json();

  messages.forEach(displayMessage);
});

// Socket event
socket.on("chat", displayMessage);

// Event listeners
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});