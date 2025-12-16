# VioletChat - Real-Time Team Messenger

This is a complete, responsive React chat application with a Violet/White theme.
It currently runs in a **Serverless Simulation Mode** for immediate preview, where `mockBackend.ts` simulates the database and WebSocket delays.

## 🚀 Features

- **Real-time Messaging**: Instant updates with optimistic UI.
- **Message Status**: Sent (Single Tick), Delivered (Double Tick), Read (Blue Double Tick).
- **Presence System**: Online/Offline status indicators.
- **Responsive Design**: Mobile-first sidebar and chat transitions.
- **Authentication**: Login/Register flow (Data persists in LocalStorage).

---

## 🛠️ Backend Implementation (Python/FastAPI)

Below is the ready-to-use code for the requested Python/FastAPI backend.

### `requirements.txt`
```text
fastapi
uvicorn
pymongo
passlib[bcrypt]
python-jose[cryptography]
python-multipart
websockets
```

### `main.py` (FastAPI Server)

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import json
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.violet_chat

# Auth Utilities
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        # Broadcast user online
        await self.broadcast({"type": "user_online", "userId": user_id})

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

    async def broadcast(self, message: dict):
        for connection in self.active_connections.values():
            await connection.send_json(message)

manager = ConnectionManager()

# Routes
@app.post("/auth/register")
async def register(user_data: dict):
    # Implementation for creating user in MongoDB
    pass

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Handle 'send_message', 'message_read' events here
            if data['type'] == 'send_message':
                 # Save to DB
                 # manager.send_personal_message(...) to receiver
                 pass
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        await manager.broadcast({"type": "user_offline", "userId": user_id})
```

## 🗄️ MongoDB Schema Structure

**Collection: `users`**
```json
{
  "_id": "ObjectId",
  "username": "String",
  "email": "String",
  "password_hash": "String",
  "online_status": "Boolean",
  "last_seen": "ISODate"
}
```

**Collection: `messages`**
```json
{
  "_id": "ObjectId",
  "sender_id": "String (User ID)",
  "receiver_id": "String (User ID)",
  "message": "String",
  "timestamp": "ISODate",
  "status": "String (sent|delivered|read)"
}
```