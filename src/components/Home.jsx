import React, { useEffect, useState } from "react";
import "./Home.css";

export default function Home(props) {
  const username = localStorage.getItem("username");
  const storageKey = `tasks_${username}`;

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks]);

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  //Used this source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleTimeString
  const digital = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const completedKey = `completed_main_${username}`;
  function removeTask(id) {
    const task = tasks.find((t) => t.id === id);

    const completed = JSON.parse(localStorage.getItem(completedKey)) || [];
    completed.push({ text: task.text, time: Date.now() });
    localStorage.setItem(completedKey, JSON.stringify(completed));

    setTasks(tasks.filter((t) => t.id !== id));
  }

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { text: newTask, id: Date.now() }]);
    setNewTask("");
  };

  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  const [isRunning, setIsRunning] = useState(false);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(0);

  function startTimer() {
    if (!isRunning) {
      const h = parseInt(hours) || 0;
      const m = parseInt(minutes) || 0;
      const s = parseInt(seconds) || 0;

      setTotalSecondsLeft(h * 3600 + m * 60 + s);
    }
    setIsRunning(!isRunning);
  }

  function resetTimer() {
    setIsRunning(false);
    setTotalSecondsLeft(0);
    setHours("");
    setMinutes("");
    setSeconds("");
  }
  useEffect(() => {
    if (!isRunning) return;
    if (totalSecondsLeft <= 0) {
      setIsRunning(false);
      return;
    }

    const interval = setInterval(() => {
      setTotalSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, totalSecondsLeft]);

  return (
    <div className="home-page">
      <div className="clock-card">
        <img
          src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWN6czdwcXdsY2l6NXQxN2x0ZnJzN3Z6Mmxub3RlbDIzaHlhbmZ1ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7bCBsz5VYuqU5Fk7d6/giphy.gif"
          alt="cat gif"
          style={{
            width: "250px",
            height: "250px",
            borderRadius: "20px",
            objectFit: "cover",
            marginBottom: "15px",
          }}
        />
        <div className="digital-time">{digital}</div>
      </div>

      <div className="timer-card">
        <h3 className="timer-title">Timer</h3>
        <div className="timer-inputs">
          <input
            type="number"
            min="0"
            placeholder="H"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
          <span>:</span>
          <input
            type="number"
            min="0"
            placeholder="M"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
          <span>:</span>
          <input
            type="number"
            min="0"
            placeholder="S"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
          />
        </div>

        <div className="timer-display">
          {String(((totalSecondsLeft % 3600) / 60) | 0).padStart(2, "0")} :
          {String(totalSecondsLeft % 60).padStart(2, "0")}
        </div>

        <div className="timer-buttons">
          <button onClick={startTimer}>{isRunning ? "Pause" : "Start"}</button>
          <button onClick={resetTimer}>Reset</button>
        </div>
      </div>
      <div className="tasks-card">
        <h2 className="tasks-title">Tasks</h2>

        <div className="task-input-row">
          <input
            type="text"
            placeholder="Add a task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button onClick={addTask}>+</button>
        </div>

        <div className="task-list">
          {tasks.map((task) => (
            <div key={task.id} className="task-item">
              <span>{task.text}</span>
              <button
                className="delete-btn"
                onClick={() => removeTask(task.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
