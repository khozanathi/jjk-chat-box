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

  socket.emit("chat", { username, text, file })

  const formData = new FormData();
  formData.append('username', username);
  formData.append('text', text);
  if (fileInput.files[0]) formData.append('file', fileInput.files[0]);

  fetch('/api/messages', {
    method: 'POST',
    body: formData
  });

  messageInput.value = "";
  fileInput.value = "";
}

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

// Load chat history on page load
document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch('/api/messages');
  const messages = await response.json();

  // Render the messages
  messages.forEach(message => {
    displayMessage(message);
  });
});

/*socket.on("chat", data => {
  // Display new message in the chat window
  displayMessage(data);
});*/

// Socket event
socket.on("chat", data => {
  const fileUrl = `https://jjk-chat-box.onrender.com/uploads/${data.file}`;
  const div = document.createElement("div");
  div.className = data.username === usernameInput.value.trim() ? "sender" : "receiver";

  let content = `<p><strong>${data.username}:</strong> ${data.text}</p>`;

  if (data.file) {
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(data.file);

    if (isImage) {
      content += `<p><img src="${fileUrl}" width="200" alt="Image from ${data.username}" /></p>`;
    } else {
      content += `<p>📎 <a href="${fileUrl}" download>${data.file}</a></p>`;
    }
  }

  div.innerHTML = content;
  chatWindow.appendChild(div);

  // Display new message in the chat window
  displayMessage(data);
});


// Event listeners
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});
