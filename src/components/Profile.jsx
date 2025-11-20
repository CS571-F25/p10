import { useEffect, useState } from "react";

export default function Profile() {
  const username = localStorage.getItem("username");

  const tasksKey = `tasks_main_${username}`;
  const completedKey = `completed_main_${username}`;

  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);

  useEffect(() => {
    const tasks = JSON.parse(localStorage.getItem(tasksKey)) || [];
    const completed = JSON.parse(localStorage.getItem(completedKey)) || [];

    setTotalTasks(tasks.length);
    setCompletedTasks(completed.length);

    const today = new Date().toDateString();
    setCompletedToday(
      completed.filter((item) => new Date(item.time).toDateString() === today)
        .length
    );
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#e8b5bd",
        color: "#6c2a3e",
        fontFamily: "Inter, sans-serif",
        padding: "20px",
      }}
    >
      <h1
        style={{ fontWeight: "700", marginBottom: "30px", textAlign: "center" }}
      >
        Hey {username}!
      </h1>

      <div
        style={{
          background: "rgba(255,240,240,0.7)",
          padding: "30px 40px",
          borderRadius: "20px",
          maxWidth: "400px",
          width: "90%",
          textAlign: "center",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Your Task Stats</h2>

        <p>
          <strong>Total tasks created:</strong> {totalTasks}
        </p>
        <p>
          <strong>Total tasks completed:</strong> {completedTasks}
        </p>
        <p>
          <strong>Tasks completed today:</strong> {completedToday}
        </p>
      </div>
    </div>
  );
}
