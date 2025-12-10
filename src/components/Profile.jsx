import { useEffect, useState } from "react";
import "./Profile.css";

export default function Profile() {
  const username = localStorage.getItem("username");

  const tasksKey = `tasks_main_${username}`;
  const completedKey = `completed_main_${username}`;
  const timerSettingsKey = `timer_settings_${username}`;
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [workMinutes, setWorkMinutes] = useState("");
  const [breakMinutes, setBreakMinutes] = useState("");

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

    const savedSettings = localStorage.getItem(timerSettingsKey);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (typeof parsed.workMinutes === "number") {
          setWorkMinutes(String(parsed.workMinutes));
        }
        if (typeof parsed.breakMinutes === "number") {
          setBreakMinutes(String(parsed.breakMinutes));
        }
      } catch (e) {
        console.error("Bad timer settings JSON", e);
      }
    }
  }, [tasksKey, completedKey, timerSettingsKey]);

  function handleSaveSettings() {
    const w = parseInt(workMinutes, 10);
    const b = parseInt(breakMinutes, 10);

    if (isNaN(w) || w <= 0 || isNaN(b) || b <= 0) {
      alert(
        "Please enter positive numbers for both work and break durations (in minutes)."
      );
      return;
    }

    const settings = { workMinutes: w, breakMinutes: b };
    localStorage.setItem(timerSettingsKey, JSON.stringify(settings));
    alert(
      "Timing preferences saved! Any running timer on the Home page will be reset the next time you visit it."
    );
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">Hey {username}!</h1>
      <div className="profile-stats-card">
        <h2 className="profile-section-heading">Your Task Stats</h2>
        <p>
          <strong>Total tasks completed:</strong> {completedTasks}
        </p>
        <p>
          <strong>Tasks completed today:</strong> {completedToday}
        </p>
      </div>
      <div className="profile-timing-card">
        <h2 className="profile-section-heading">Timing Preferences</h2>
        <p className="profile-timing-description">
          Choose how long you like to focus and how long you like to break.
          These preferences are required before you can use the timer on the
          Home page.
        </p>
        <div className="profile-timing-inputs">
          <div className="profile-input-group">
            <label className="profile-label">
              Work duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={workMinutes}
              onChange={(e) => setWorkMinutes(e.target.value)}
              className="profile-input"
            />
          </div>

          <div className="profile-input-group">
            <label className="profile-label">
              Break duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(e.target.value)}
              className="profile-input"
            />
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="profile-save-button"
        >
          Save Timing Preferences
        </button>
      </div>
    </div>
  );
}
