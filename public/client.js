const socket = io();
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const fileInput = document.getElementById("fileInput");
const usernameInput = document.getElementById("username");
const chatWindow = document.getElementById("chat-window");
const fileUrl = `/uploads/${data.file}`;

function sendMessage() {
  const username = usernameInput.value.trim();
  const text = messageInput.value.trim();
  const file = fileInput.files[0];

  if (!username) return alert("Please enter your username!");
  if (!text && !file) return alert("Please enter a message or select a file!");

  const formData = new FormData();
  formData.append("username", username);
  formData.append("text", text);
  if (file) formData.append("file", file);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/messages");

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      document.getElementById("filePreview").innerHTML = `<p>Uploading: ${percent}%</p>`;
    }
  };

  xhr.onload = () => {
    if (xhr.status === 200) {
      messageInput.value = "";
      fileInput.value = "";
      document.getElementById("filePreview").innerHTML = "";
    } else {
      alert("Upload failed.");
    }
  };

  xhr.onerror = () => alert("Upload error.");
  xhr.send(formData);
}

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  const preview = document.getElementById("filePreview");
  preview.innerHTML = ""; // Clear previous preview

  if (!file) return;

  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file.name);

  if (isImage) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement("img");
      img.src = reader.result;
      img.className = "preview-image";
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  } else {
    const fileInfo = document.createElement("p");
    fileInfo.textContent = `📎 ${file.name}`;
    preview.appendChild(fileInfo);
  }
});

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