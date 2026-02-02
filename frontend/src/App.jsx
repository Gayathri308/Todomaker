import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  Plus, Trash2, Check, Pencil, Loader2, Calendar as CalIcon,
  Clock, Trophy, TrendingUp, Bell, GripVertical, AlertCircle,
  Zap, Flame, Coffee, Moon, Sun, Music, Quote, Star
} from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay, parseISO, startOfWeek, endOfWeek, startOfMonth, isWithinInterval, differenceInHours } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart, Bar, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import './index.css';

const API_URL = 'http://localhost:5000/api/tasks';

// --- ULTIMATE LIT AUDIO SUITE ---
const SOUNDS = {
  standard: 'https://cdn.pixabay.com/audio/2022/03/15/audio_7314782071.mp3', // Clean crisp pop
  'high-priority': 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', // Professional chime
  'top-priority': 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'  // EPIC ACHIEVEMENT (LIT)
};

const MOTIVATIONAL_QUOTES = [
  "Your only limit is your mind. Keep pushing! 🚀",
  "Small daily wins lead to giant results. 🏆",
  "The secret of getting ahead is getting started. ✨",
  "Don't stop until you're proud. You've got this! 💪",
  "Discipline is doing what needs to be done, even if you don't feel like it. 🧠",
  "Make today so awesome that yesterday gets jealous. 🔥",
  "Focus on being productive, not busy. 🎯",
  "The best way to predict the future is to create it. 🌌",
  "Great things never come from comfort zones. 🌩️",
  "Either you run the day or the day runs you. 🏃‍♂️",
  "Believe you can and you're halfway there. 💫",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. 🛡️",
  "Hard work beats talent when talent doesn't work hard. ⚡",
  "Action is the foundational key to all success. 🔑",
  "Dream big. Start small. But most of all, start. 🌱",
  "Don't watch the clock; do what it does. Keep going. ⏳"
];

const pageVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 50, damping: 15 }
  },
  hover: {
    y: -15,
    boxShadow: "0 45px 90px -15px rgba(99, 102, 241, 0.3)",
    transition: { type: "spring", stiffness: 400, damping: 10 }
  }
};

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, type: "spring", stiffness: 100 }
  })
};

const AnimatedText = ({ text, className }) => {
  const letters = Array.from(text);
  return (
    <h1 className={className}>
      {letters.map((char, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={letterVariants}
          style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </motion.span>
      ))}
    </h1>
  );
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState('standard');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [selectedQuote, setSelectedQuote] = useState('');

  useEffect(() => {
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setSelectedQuote(randomQuote);
  }, []);

  const playSuccessSound = (priority) => {
    const audio = new Audio(SOUNDS[priority] || SOUNDS.standard);
    audio.volume = 0.5;
    audio.play().catch(() => { });
  };

  const gritStats = useMemo(() => {
    const completed = tasks.filter(t => t.completed);
    const highCount = completed.filter(t => t.priority === 'high-priority').length;
    const topCount = completed.filter(t => t.priority === 'top-priority').length;

    const baseScore = completed.length * 10;
    const bonus = (highCount * 25) + (topCount * 60);
    const score = baseScore + bonus;

    const completionHours = completed.map(t => new Date(t.createdAt).getHours());
    let style = "Consistent Worker";
    if (completionHours.some(h => h >= 0 && h <= 5)) style = "Midnight Hustler 🌙";
    else if (completionHours.some(h => h >= 5 && h <= 9)) style = "Early Bird ☀️";
    else if (completionHours.length > 5 && new Set(completionHours).size < 3) style = "Deep Focus Master 🧠";

    return { score, style, totalTrophies: completed.length };
  }, [tasks]);

  const stats = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const monthStart = startOfMonth(today);

    const daily = tasks.filter(t => isSameDay(parseISO(t.dueDate || t.createdAt), today));
    const weekly = tasks.filter(t => isWithinInterval(parseISO(t.dueDate || t.createdAt), { start: weekStart, end: today }));
    const monthly = tasks.filter(t => isWithinInterval(parseISO(t.dueDate || t.createdAt), { start: monthStart, end: today }));

    const calcRate = (arr) => arr.length === 0 ? 0 : Math.round((arr.filter(t => t.completed).length / arr.length) * 100);

    return {
      daily: calcRate(daily),
      weekly: calcRate(weekly),
      monthly: calcRate(monthly),
      monthlyTrophies: monthly.filter(t => t.completed).length
    };
  }, [tasks]);

  const chartData = useMemo(() => {
    return [6, 5, 4, 3, 2, 1, 0].map(daysAgo => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      const prevPeriodDate = new Date();
      prevPeriodDate.setDate(prevPeriodDate.getDate() - (daysAgo + 7));

      const dayTasks = tasks.filter(t => isSameDay(parseISO(t.dueDate || t.createdAt), date));
      const prevDayTasks = tasks.filter(t => isSameDay(parseISO(t.dueDate || t.createdAt), prevPeriodDate));

      const completed = dayTasks.filter(t => t.completed).length;
      const prevCompleted = prevDayTasks.filter(t => t.completed).length;

      return {
        name: format(date, 'EEE'),
        fullDate: format(date, 'MMMM do'),
        currentRate: dayTasks.length === 0 ? 0 : Math.round((completed / dayTasks.length) * 100),
        prevRate: prevDayTasks.length === 0 ? 0 : Math.round((prevCompleted / prevDayTasks.length) * 100),
        completed,
        total: dayTasks.length
      };
    });
  }, [tasks]);

  const dailyTrend = useMemo(() => {
    if (chartData.length < 2) return 0;
    return chartData[6].rate - chartData[5].rate;
  }, [chartData]);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayTasks = tasks.filter(t => isSameDay(parseISO(t.dueDate || t.createdAt), date));
      if (dayTasks.length === 0) return null;

      const topTask = dayTasks.find(t => t.priority === 'top-priority');
      const highTask = dayTasks.find(t => t.priority === 'high-priority');

      return (
        <div className="flex flex-col items-center">
          <div className="flex justify-center gap-0.5 mt-0.5">
            {topTask && <div className="most-important-dot" />}
            {highTask && <div className="important-dot" />}
          </div>
          <span className={`calendar-hint ${topTask ? 'urgent' : ''}`}>
            {topTask ? topTask.text : (highTask ? highTask.text : `${dayTasks.length} tasks`)}
          </span>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch (err) {
      const saved = localStorage.getItem('tasks');
      if (saved) setTasks(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const taskData = { text: newTask, dueDate: selectedDate.toISOString(), priority: newPriority };
    const tempId = Date.now().toString();
    const optimisticTask = { ...taskData, _id: tempId, completed: false, createdAt: new Date().toISOString() };

    setTasks(prev => [optimisticTask, ...prev]);
    setNewTask('');

    try {
      const res = await axios.post(API_URL, taskData);
      setTasks(prev => prev.map(t => t._id === tempId ? res.data : t));
    } catch (err) { }
  };

  const toggleComplete = async (id, completed, priority) => {
    setTasks(tasks.map(t => t._id === id ? { ...t, completed: !completed } : t));
    if (!completed) {
      const defaults = {
        spread: 360,
        ticks: 100,
        gravity: 0.5,
        decay: 0.94,
        startVelocity: 40,
        shapes: ['star', 'circle'],
        colors: priority === 'top-priority' ? ['#FFD700', '#FF4500', '#6366f1'] : ['#6366f1', '#10b981']
      };

      const fire = (particleRatio, opts) => {
        confetti({ ...defaults, ...opts, particleCount: Math.floor(200 * particleRatio) });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });

      playSuccessSound(priority);
    }
    try { await axios.put(`${API_URL}/${id}`, { completed: !completed }); } catch (err) { }
  };

  const deleteTask = async (id) => {
    setTasks(tasks.filter(t => t._id !== id));
    try { await axios.delete(`${API_URL}/${id}`); } catch (err) { }
  };

  const dailyTasks = useMemo(() => {
    return tasks.filter(task => isSameDay(parseISO(task.dueDate || task.createdAt), selectedDate));
  }, [tasks, selectedDate]);

  return (
    <motion.div
      className="container"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {/* SUCCEED SECTION (TOP ROW WITH ANIMATED BORDER) */}
      <div className="section-header">
        <div className="section-icon-wrapper">
          <Trophy size={32} className="text-amber-400" />
        </div>
        <span className="section-label">Retention & Mastery</span>
        <h2 className="section-title">Performance Core</h2>
      </div>

      <div className="succeed-wrapper">
        <div className="succeed-container">
          <motion.div className="dashboard-row" variants={pageVariants}>
            <motion.div className="stat-card" variants={cardVariants} whileHover="hover">
              <span className="stat-label">Grit Prediction</span>
              <motion.div className="grit-value" animate={{ opacity: [0, 1], scale: [0.95, 1] }}>
                {gritStats.score} pts
              </motion.div>
              <div className="style-badge">
                <Zap size={24} color="#fbbf24" strokeWidth={3} /> <span className="text-xl font-black">{gritStats.style}</span>
              </div>
            </motion.div>

            <motion.div className="stat-card" variants={cardVariants} whileHover="hover">
              <span className="stat-label">Daily Success</span>
              <motion.span className="stat-value text-7xl font-black">{stats.daily}%</motion.span>
              <div className="stat-trend flex items-center justify-center gap-3 px-6 py-2 rounded-2xl bg-white/5 mt-4"
                style={{ color: dailyTrend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                <span className="text-2xl font-black">{dailyTrend >= 0 ? '↑' : '↓'} {Math.abs(dailyTrend)}%</span>
                <span className="text-sm font-bold uppercase tracking-widest opacity-70">Weekly Momentum</span>
              </div>
            </motion.div>

            <motion.div className="stat-card" variants={cardVariants} whileHover="hover">
              <span className="stat-label">Reliability Score</span>
              <motion.span className="stat-value text-7xl font-black">{stats.weekly}%</motion.span>
              <div className="flex justify-center gap-3 mt-6">
                {Array(Math.min(5, Math.ceil(stats.weekly / 20))).fill(0).map((_, i) => (
                  <motion.div key={i} animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}>
                    <Flame size={32} color="#f97316" fill="#f97316" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="main-layout">
        {/* LEFT COLUMN: TODAY AGENDA + GROWTH ACTIVITY */}
        <div className="flex flex-col gap-10">
          <div className="section-header">
            <div className="section-icon-wrapper">
              <Clock size={32} className="text-primary" />
            </div>
            <span className="section-label">Strategic Focus</span>
            <h2 className="section-title">Your Workflow</h2>
          </div>
          <motion.div
            className="glass-card main-task-card"
            variants={cardVariants}
          >
            <header className="mb-10 text-center">
              <div className="overflow-hidden">
                <AnimatedText
                  text="Another task defeated. I remain undefeated"
                  className="undefeated-title"
                />
                <motion.p
                  className="subtitle mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                </motion.p>
              </div>
            </header>

            <form className="todo-form" onSubmit={addTask}>
              <div className="form-stack">
                <div className="input-row">
                  <input
                    type="text"
                    placeholder="What is your focus for today?"
                    className="flex-1"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(99, 102, 241, 0.6)" }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="btn-add"
                  >
                    Add Focus
                  </motion.button>
                </div>

                <div className="priority-row">
                  {[
                    { id: 'standard', label: 'Standard', icon: '○' },
                    { id: 'high-priority', label: 'High Priority', icon: '⚡' },
                    { id: 'top-priority', label: 'Top Priority', icon: '🔥' }
                  ].map(p => (
                    <label key={p.id} className="priority-option flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        className="accent-primary"
                        checked={newPriority === p.id}
                        onChange={() => setNewPriority(p.id)}
                      />
                      <span className="text-base font-bold tracking-tight">{p.icon} {p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>

            {loading ? (
              <div className="flex justify-center p-16">
                <Loader2 className="animate-spin text-primary" size={50} />
              </div>
            ) : (
              <DragDropContext onDragEnd={() => { }}>
                <Droppable droppableId="tasks">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {/* ACTIVE TASKS */}
                      <ul className="todo-list mb-12">
                        <AnimatePresence mode="popLayout">
                          {dailyTasks.filter(t => !t.completed).map((task) => (
                            <motion.li
                              key={task._id}
                              layout
                              initial={{ opacity: 0, x: -50 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              transition={{ type: "spring", stiffness: 200, damping: 25 }}
                              className={`todo-item priority-${task.priority} p-6 shadow-lg`}
                            >
                              <div className="checkbox scale-150" onClick={() => toggleComplete(task._id, task.completed, task.priority)}>
                                {task.completed && <Check size={24} color="white" />}
                              </div>
                              <div className="flex-1">
                                <span className="todo-text block text-2xl font-black tracking-tight">
                                  {task.text}
                                </span>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.4, color: '#ef4444', rotate: 10 }}
                                className="btn-icon delete"
                                onClick={() => deleteTask(task._id)}
                              >
                                <Trash2 size={28} />
                              </motion.button>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>

                      {/* THE REQUESTED SPACE BETWEEN SECTIONS */}
                      {dailyTasks.some(t => t.completed) && dailyTasks.some(t => !t.completed) && (
                        <div className="my-16 flex items-center gap-4 opacity-30">
                          <div className="h-[1px] bg-white flex-1"></div>
                          <span className="text-xs font-black uppercase tracking-[0.3em] whitespace-nowrap">Completed Mastery</span>
                          <div className="h-[1px] bg-white flex-1"></div>
                        </div>
                      )}

                      {/* COMPLETED TASKS */}
                      <ul className="todo-list opacity-60 scale-95">
                        <AnimatePresence mode="popLayout">
                          {dailyTasks.filter(t => t.completed).map((task) => (
                            <motion.li
                              key={task._id}
                              layout
                              initial={{ opacity: 0, x: 50 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              transition={{ type: "spring", stiffness: 200, damping: 25 }}
                              className={`todo-item completed priority-${task.priority} p-6 shadow-lg grayscale`}
                            >
                              <div className="checkbox checked scale-150" onClick={() => toggleComplete(task._id, task.completed, task.priority)}>
                                <Check size={24} color="white" />
                              </div>
                              <div className="flex-1">
                                <span className="todo-text block text-2xl font-bold tracking-tight line-through">
                                  {task.text}
                                </span>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.4, color: '#ef4444', rotate: 10 }}
                                className="btn-icon delete"
                                onClick={() => deleteTask(task._id)}
                              >
                                <Trash2 size={28} />
                              </motion.button>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </motion.div>

          <div className="section-header">
            <div className="section-icon-wrapper">
              <TrendingUp size={32} className="text-primary" />
            </div>
            <span className="section-label">Momentum Flow</span>
            <h2 className="section-title">Performance Timeline</h2>
          </div>

          {/* NEW PREMIUM GROWTH ANALYSIS CARD (DIFFERENT LAYOUT) */}
          <motion.div
            className="glass-card premium-analysis-card"
            variants={cardVariants}
            whileHover="hover"
            style={{
              background: 'linear-gradient(165deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              marginTop: '2rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* DECORATIVE DOT GRID BACKGROUND (THE CIRCLE SCALE) */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1.5px, transparent 1.5px)',
                backgroundSize: '30px 30px'
              }}>
            </div>

            <div className="flex justify-between items-center mb-12 relative z-10">
              <div>
                <h3 className="flex items-center gap-4 text-3xl font-black text-white">
                  Visualizing Your Momentum Flow
                </h3>
                <p className="text-muted font-bold mt-2 uppercase tracking-[0.4em] text-xs opacity-50">Trend & Analytics</p>
              </div>
              <div className="flex gap-10">
                <div className="text-center">
                  <div className="text-3xl font-black text-white">{tasks.length}</div>
                  <div className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">Total Effort</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-success">{tasks.filter(t => t.completed).length}</div>
                  <div className="text-[10px] font-black uppercase text-success tracking-widest mt-1">Growth Wins</div>
                </div>
              </div>
            </div>

            <div className="relative z-10" style={{ height: '420px', marginLeft: '-30px', marginRight: '-10px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
                      <stop offset="60%" stopColor="#6366f1" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.1)"
                    fontSize={14}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#94a3b8', fontWeight: 900, dy: 15 }}
                  />
                  <YAxis yAxisId="left" hide={true} />
                  <YAxis yAxisId="right" orientation="right" hide={true} domain={[0, 110]} />

                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      borderRadius: '24px',
                      boxShadow: '0 25px 50px rgba(0,0,0,0.9)',
                      padding: '24px'
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    itemStyle={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '8px' }}
                  />

                  {/* DAILY ANALYSIS: TASK VOLUME (BARS) */}
                  <Bar
                    yAxisId="left"
                    dataKey="completed"
                    name="Daily Victories"
                    barSize={45}
                    radius={[12, 12, 4, 4]}
                    fill="rgba(99, 102, 241, 0.15)"
                  />

                  {/* WEEKLY ANALYSIS: PERFORMANCE FLOW (AREA) */}
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="currentRate"
                    name="Success Rate %"
                    stroke="#6366f1"
                    strokeWidth={8}
                    fill="url(#growthGradient)"
                    animationDuration={2500}
                    dot={{ r: 8, fill: '#fff', stroke: '#6366f1', strokeWidth: 4 }}
                    activeDot={{ r: 12, fill: '#6366f1', stroke: '#fff', strokeWidth: 4 }}
                  />

                  {/* PREVIOUS WEEK TREND (REFERENCE LINE) */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="prevRate"
                    name="Last Week %"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth={3}
                    strokeDasharray="8 8"
                    dot={false}
                    animationDuration={2000}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <motion.div className="flex flex-col gap-10" variants={pageVariants}>
          <div className="section-header">
            <div className="section-icon-wrapper">
              <CalIcon size={32} className="text-primary" />
            </div>
            <span className="section-label">Planning Core</span>
            <h2 className="section-title">Date Selection</h2>
          </div>
          <motion.div
            className="glass-card"
            variants={cardVariants}
            whileHover="hover"
          >
            <Calendar onChange={setSelectedDate} value={selectedDate} tileContent={tileContent} />

            <div className="section-header mt-16 text-center">
              <div className="section-icon-wrapper mx-auto">
                <Quote size={32} className="text-primary" />
              </div>
              <span className="section-label">Daily Focus</span>
              <h2 className="section-title">Wisdom Insight</h2>
            </div>

            <motion.div
              className="quote-box p-8 rounded-[32px] mt-4 text-center border-t border-b border-white/5"
              key={selectedQuote}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <Quote size={28} className="mb-4 opacity-30 text-primary mx-auto" />
              <p className="font-black text-2xl text-[#f8fafc] italic leading-tight text-center px-4">
                "{selectedQuote}"
              </p>
            </motion.div>

            <div className="section-header mt-16 text-center">
              <div className="section-icon-wrapper mx-auto">
                <Trophy size={32} className="text-yellow-500" />
              </div>
              <span className="section-label">Milestone Progress</span>
              <h2 className="section-title">Retention & Mastery</h2>
            </div>

            <motion.div
              className="trophy-section mt-4 bg-yellow-500/10 p-10 rounded-[40px] border-2 border-yellow-500/20"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
            >
              <div className="text-center">
                <motion.div
                  className="trophy-badge scale-animation mb-8 mx-auto inline-block"
                  animate={{ rotate: [0, 15, -15, 0], y: [0, -10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                >
                  <Trophy size={80} className="text-white drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]" />
                </motion.div>
                <h3 className="font-black text-3xl mb-2 text-white/90">Mastery Achievement</h3>
                <p className="text-yellow-400 font-black text-4xl mb-10 drop-shadow-lg">
                  Gained {stats.monthlyTrophies} Trophies!
                </p>
              </div>

              <div className="trophy-shelf flex flex-wrap gap-4 justify-center">
                <AnimatePresence>
                  {Array(Math.min(12, stats.monthlyTrophies)).fill(0).map((_, i) => (
                    <motion.div
                      key={i}
                      className="mini-trophy w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-600 flex items-center justify-center shadow-2xl"
                      initial={{ scale: 0, y: 50 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
                      whileHover={{ scale: 1.3, rotate: 20 }}
                    >
                      <Trophy size={24} color="#fff" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="w-full h-6 bg-white/5 rounded-full mt-12 overflow-hidden border-2 border-white/10 p-1 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (stats.monthlyTrophies / 30) * 100)}%` }}
                  transition={{ duration: 2.5, ease: "circOut" }}
                />
              </div>
              <p className="text-center text-lg text-muted font-black mt-6 tracking-[0.2em] uppercase opacity-70">
                Mastery Multiplier: x{(1 + gritStats.score / 1000).toFixed(2)}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default App;
