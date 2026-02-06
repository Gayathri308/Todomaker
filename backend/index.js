const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url') {
    console.error('CRITICAL: Supabase credentials missing in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Routes
// 1. Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Add a new task
app.post('/api/tasks', async (req, res) => {
    const taskData = {
        text: req.body.text,
        dueDate: req.body.dueDate || new Date().toISOString(),
        priority: req.body.priority || 'standard',
        completed: false,
        createdAt: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from('tasks')
            .insert([taskData])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. Update a task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .update(req.body)
            .eq('id', req.params.id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 4. Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
    console.log('Supabase Bridge Active');
});
