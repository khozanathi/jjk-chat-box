const socket = io();
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const fileInput = document.getElementById("fileInput");
const usernameInput = document.getElementById("username");
const chatWindow = document.getElementById("chat-window");

// Send a message and save to the database
function sendMessage() {
  const username = usernameInput.value.trim();
  const text = messageInput.value.trim();
  const file = fileInput.files[0] ? fileInput.files[0].name : "";

  if (!username) return alert("Enter your username!");
  
  // Emit message to other clients
  socket.emit("chat", { username, text, file });
  
  // Save the message to the database
  fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, text, file })
  });

  messageInput.value = "";
  fileInput.value = "";
}

document.addEventListener("DOMContentLoaded", async () => {
  // Fetch chat history from the server when the page loads
  const response = await fetch('/api/messages');
  const messages = await response.json();

  // Render the messages
  messages.forEach(message => {
    displayMessage(message);
  });
});

function displayMessage(data) {
  const div = document.createElement("div");
  div.className = data.username === usernameInput.value.trim() ? "sender" : "receiver";
  
  div.innerHTML = `<p><strong>${data.username}:</strong> ${data.text}</p>`;
  
  if (data.file) {
    const fileExtension = data.file.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      div.innerHTML += `<img src="/uploads/${data.file}" alt="${data.file}" class="chat-image">`;
    } else {
      div.innerHTML += `<p>📎 <a href="/uploads/${data.file}" target="_blank">${data.file}</a></p>`;
    }
  }

  chatWindow.appendChild(div);
}

socket.on("chat", data => {
  // Display new message in the chat window
  displayMessage(data);
});


sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});