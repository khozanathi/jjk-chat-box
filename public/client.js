const socket = io();
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const fileInput = document.getElementById("fileInput");
const usernameInput = document.getElementById("username");
const chatWindow = document.getElementById("chat-window");

async function sendMessage() {
  const username = usernameInput.value.trim();
  const text = messageInput.value.trim();
  const file = fileInput.files[0];

  if (!username) return alert("Please enter your username!");
  if (!text && !file) return alert("Please enter a message or select a file!");

  const formData = new FormData();
  formData.append("username", username);
  formData.append("text", text);
  if (file) formData.append("file", file);

  try {
    const response = await fetch("/api/messages", {
      method: "POST",
      body: formData
    });

    const savedMessage = await response.json();
    // Message will be broadcast via Socket.IO
  } catch (err) {
    console.error("Error sending message:", err);
    alert("Failed to send message.");
  }

  messageInput.value = "";
  fileInput.value = "";
  document.getElementById("filePreview").innerHTML = "";
}

/*
// iyasebenza leeee
function displayMessage(data) {
  const div = document.createElement("div");
  div.className = data.username === usernameInput.value.trim() ? "sender" : "receiver";

  let content = `<p><strong>${data.username}:</strong> ${data.text}</p>`;

  if (data.file) {
    const fileUrl = `/uploads/${data.file}`;
    const fileExtension = data.file.split('.').pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
      content += `<img src="${fileUrl}" class="chat-image" alt="Image file" />`;
    } else {
      content += `<p>📎 <a href="${fileUrl}" target="_blank" download>${data.file}</a></p>`;
    }
  }

  div.innerHTML = content;
  chatWindow.appendChild(div);
}
*/

function displayMessage(data) {
  const div = document.createElement("div");
  div.className = data.username === usernameInput.value.trim() ? "sender" : "receiver";

  let content = `<p><strong>${data.username}:</strong> ${data.text}</p>`;

  if (data.file) {
    const fileUrl = `/uploads/${data.file}`;
    const fileExtension = data.file.split('.').pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
      content += `<img src="${fileUrl}" class="chat-image" alt="Image file" />`;
    } else if (["pdf"].includes(fileExtension)) {
      content += `
        <p>📄 PDF Preview:</p>
        <iframe src="${fileUrl}" width="100%" height="300px" style="border:1px solid #ccc;"></iframe>
        <p><a href="${fileUrl}" download>Download PDF</a></p>
      `;
    } else if (["mp4", "webm", "ogg"].includes(fileExtension)) {
      content += `
        <p>🎥 Video:</p>
        <video controls width="300">
          <source src="${fileUrl}" type="video/${fileExtension}">
          Your browser does not support the video tag.
        </video>
      `;
    } else if (["mp3", "wav", "ogg"].includes(fileExtension)) {
      content += `
        <p>🎧 Audio:</p>
        <audio controls>
          <source src="${fileUrl}" type="audio/${fileExtension}">
          Your browser does not support the audio element.
        </audio>
      `;
    } else {
      content += `<p>📎 <a href="${fileUrl}" target="_blank" download>${data.file}</a></p>`;
    }
  }

  div.innerHTML = content;
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

socket.on("chat", data => {
  // Display new message in the chat window
  displayMessage(data);
});

/* Socket event
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
*/

// Event listeners
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});
