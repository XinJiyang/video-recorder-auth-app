# 🎥 Webcam Recorder App

A full-stack web application that allows users to register/login, access their webcam to record video, preview/download/delete/rename recordings, and upload them to the server — all via a clean, modern UI.

> 🚀 Deployed on:  
> Frontend (Vercel): [https://your-frontend-url.vercel.app](https://your-frontend-url.vercel.app)  
> Backend (Render): [https://your-backend-url.onrender.com](https://your-backend-url.onrender.com)

---

## 🔧 Features

- ✅ **User Authentication** – Register and login functionality with password strength validation  
- 🎥 **Webcam Access** – Access camera with user permission and record browser-compatible video  
- 💾 **Recording Controls** – Start, stop, preview, rename, delete, and download recordings  
- 📤 **Upload Recordings** – Upload videos to the backend server  
- 🚫 **Permissions Handling** – Detect browser compatibility and display warnings  
- 💬 **UX Enhancements** – Visual feedback for recording status, button states, modal confirmation, and alerts

---

## 🧪 Tech Stack

| Frontend (Vite + React) | Backend (Node.js + Express) |
|-------------------------|-----------------------------|
| React, Tailwind CSS     | Express, Multer             |
| Vite, React Router DOM  | File-based storage (no DB)  |
| Custom CSS + Icons      | JSON API                    |

---

## 📁 Project Structure

```bash
video-recorder-auth-app/
├── client/                   # Frontend (Vercel)
│   ├── src/pages/            # Login, Register, Dashboard
│   ├── src/utils/            # Password validator
│   └── public/, App.jsx ...  # Main Vite app
│
├── server/                   # Backend (Render)
│   ├── routes/               # Express routes
│   ├── uploads/              # Video files storage
│   └── server.js             # Entry point
```

## ⚙️ How to Run Locally

### 1️⃣ Clone this repository

```bash
git clone https://github.com/XinJiyang/webcam-recorder-app.git
cd webcam-recorder-app
```

### 2️⃣ Setup & Run Backend

```bash
cd server
npm install
node server.js
```
Server will run on http://localhost:5000

### 3️⃣ Setup & Run Frontend

```bash
cd ../client
npm install
npm run dev
```
Frontend will run on http://localhost:5173

## 🚧 Known Limitations

- No database: registered users are not persisted across restarts

- Uploaded videos are stored on the backend file system and may be lost when the Render instance restarts

- Multi-user separation and secure storage are not implemented in this demo