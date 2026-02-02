const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Task Model
const taskSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    dueDate: { type: String },
    priority: { type: String, default: 'normal' }, // normal, important, most-important
    createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

// Routes
// 1. Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Add a new task
app.post('/api/tasks', async (req, res) => {
    const task = new Task({
        text: req.body.text,
        dueDate: req.body.dueDate,
        priority: req.body.priority || 'normal'
    });
    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. Update a task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 4. Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
