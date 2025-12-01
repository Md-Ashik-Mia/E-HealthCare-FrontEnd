# Backend Implementation Guide

Since I cannot access your backend codebase directly, please follow this guide to implement the Chat, Video, and Audio calling features in your Express + Mongoose backend.

## 1. Install Dependencies
Run this command in your backend directory:
```bash
npm install socket.io openai
```

## 2. Create Chat Model
Create `models/Chat.js` to store chat history:

```javascript
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  roomId: { type: String, required: true }, // e.g., "userId1-userId2" (sorted)
  sender: { type: String, required: true }, // 'patient' or 'doctor' or 'ai'
  receiverId: { type: String },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model('Chat', chatSchema);
```

## 3. Create AI Controller
Create `controllers/ai.controller.js` to handle AI logic:

```javascript
const DoctorProfile = require('../models/DoctorProfile'); // Adjust path to your Doctor model
// const OpenAI = require('openai'); // Uncomment if using real OpenAI

// Mock AI response for now (Replace with real OpenAI logic)
const generateAIResponse = async (query) => {
  // Simulate AI thinking
  return `[AI Auto-Reply]: I received your message: "${query}". How can I help you further?`;
};

exports.getAiStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await DoctorProfile.findOne({ _id: doctorId }); // Adjust query based on your schema
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    
    res.json({ isAIEnabled: doctor.isAIEnabled || false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleAi = async (req, res) => {
  try {
    const { doctorId, isAIEnabled } = req.body;
    const doctor = await DoctorProfile.findOneAndUpdate(
      { _id: doctorId },
      { isAIEnabled },
      { new: true }
    );
    res.json({ message: 'AI status updated', isAIEnabled: doctor.isAIEnabled });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAiResponse = async (req, res) => {
  try {
    const { query } = req.body;
    const response = await generateAIResponse(query);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

## 4. Create AI Routes
Create `routes/ai.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const auth = require('../middleware/auth'); // Your auth middleware

router.get('/status/:doctorId', auth, aiController.getAiStatus);
router.patch('/toggle', auth, aiController.toggleAi);
router.post('/response/:doctorId', auth, aiController.getAiResponse);

module.exports = router;
```

## 5. Update Main File (index.js)
Update your `index.js` to set up Socket.io and use the new routes.

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Chat = require('./models/Chat'); // Import Chat model

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const aiRoutes = require('./routes/ai.routes');
// ... other routes ...
app.use('/ai', aiRoutes);

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a chat room
  socket.on('joinRoom', ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
  });

  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    const { roomId, sender, message, receiverId } = data;
    
    // Save to database
    try {
      const newChat = new Chat({ roomId, sender, message, receiverId });
      await newChat.save();
    } catch (err) {
      console.error('Error saving chat:', err);
    }

    // Broadcast to room (including sender)
    io.to(roomId).emit('newMessage', data);
  });

  // WebRTC Signaling Events
  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", { 
      signal: data.signalData, 
      from: data.from, 
      name: data.name 
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 6. Update Doctor Model
Ensure your `models/DoctorProfile.js` has the `isAIEnabled` field:

```javascript
// Add this to your schema
isAIEnabled: { type: Boolean, default: false }
```
