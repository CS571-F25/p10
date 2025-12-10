import React, { useEffect, useState, useRef } from "react";
import "./Home.css";
import mochiGif from "../assets/mochi.gif";
import mochaCrySound from "../assets/mocha-cries-final-file.mp3";

export default function Home() {
  const username = localStorage.getItem("username");
  const storageKey = `tasks_${username}`;
  const calendarKey = `calendar_${username}`;
  const completedKey = `completed_main_${username}`;
  const timerSettingsKey = `timer_settings_${username}`;
  const timerStateKey = `timer_state_${username}`;

  //TASKS SECTION

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  const [newTask, setNewTask] = useState("");
  const [newTaskEstimate, setNewTaskEstimate] = useState("");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks, storageKey]);

  // TOP CLOCK
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  const digital = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  //TIMER SETTINGS
  const [timerSettings] = useState(() => {
    const saved = localStorage.getItem(timerSettingsKey);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const hasTimerSettings =
    timerSettings &&
    typeof timerSettings.workMinutes === "number" &&
    timerSettings.workMinutes > 0 &&
    typeof timerSettings.breakMinutes === "number" &&
    timerSettings.breakMinutes > 0;

  const preferenceLabel =
    hasTimerSettings && timerSettings
      ? `${timerSettings.workMinutes} min focus • ${timerSettings.breakMinutes} min break`
      : null;

  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [taskSecondsLeft, setTaskSecondsLeft] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [taskEndTime, setTaskEndTime] = useState(null);
  const [singleTaskMode, setSingleTaskMode] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendMinutes, setExtendMinutes] = useState("");
  const [taskAtPrompt, setTaskAtPrompt] = useState(null);
  const [pendingPhase, setPendingPhase] = useState(null); 
  const [awaitingPhaseConfirm, setAwaitingPhaseConfirm] = useState(false);
  const taskEndHandledRef = useRef(false);
  const sessionEndHandledRef = useRef(false);
  const hasLoadedTimerRef = useRef(false);

  const alarmRef = useRef(null);
  useEffect(() => {
    //Learned how to do this with https://stackoverflow.com/questions/47686345/playing-sound-in-react-js
    alarmRef.current = new Audio(mochaCrySound);
  }, []);

  //Learned how to do this with https://stackoverflow.com/questions/54847032/looping-audio-with-react-js
  function startAlarmLoop() {
    if (!alarmRef.current) return;
    try {
      alarmRef.current.loop = true;
      alarmRef.current.currentTime = 0;
      alarmRef.current.play().catch(() => {});
    } catch {
    }
  }

  function stopAlarmLoop() {
    if (!alarmRef.current) return;
    try {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
      alarmRef.current.loop = false;
    } catch {
    }
  }

  useEffect(() => {
    if (awaitingPhaseConfirm && pendingPhase) {
      startAlarmLoop();
    } else {
      stopAlarmLoop();
    }
  }, [awaitingPhaseConfirm, pendingPhase]);


  const calendarTasks = getCalendarTasksForToday(time);
  const normalizedManualTasks = tasks.map((t) => {
    const est =
      typeof t.estimateSeconds === "number" && t.estimateSeconds > 0
        ? t.estimateSeconds
        : 0;
    return {
      ...t,
      estimateSeconds: est,
      fromCalendar: false,
    };
  });

  const combinedTasks = [...calendarTasks, ...normalizedManualTasks];
  const focusedTask = combinedTasks.find((t) => t.id === focusedTaskId) || null;

  function addTask() {
    if (!newTask.trim()) {
      alert("Please enter a task description.");
      return;
    }
    const estimateMinutes = parseInt(newTaskEstimate, 10);
    if (isNaN(estimateMinutes) || estimateMinutes <= 0) {
      alert("Please enter a positive estimated time (in minutes).");
      return;
    }
    const estimateSeconds = estimateMinutes * 60;
    setTasks((prev) => [
      ...prev,
      {
        text: newTask.trim(),
        id: Date.now(),
        estimateSeconds,
        fromCalendar: false,
      },
    ]);
    setNewTask("");
    setNewTaskEstimate("");
  }

  // FOR REORDERING TASKS
  function moveTaskUp(task) {
    if (task.fromCalendar) return;
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx <= 0) return prev;
      const copy = [...prev];
      [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
      return copy;
    });
  }

  function moveTaskDown(task) {
    if (task.fromCalendar) return;
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const copy = [...prev];
      [copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]];
      return copy;
    });
  }

  function removeTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (focusedTaskId === id) {
      clearAllTimers();
    }
  }

  function completeTask(task) {
    if (!task) return;
    const completed = JSON.parse(localStorage.getItem(completedKey)) || [];
    completed.push({ text: task.text, time: Date.now() });
    localStorage.setItem(completedKey, JSON.stringify(completed));
    if (task.fromCalendar) {
      const calData = JSON.parse(localStorage.getItem(calendarKey)) || {};
      const eventsArr = calData[task.calendarKeyForEvent] || [];
      if (eventsArr[task.eventIndex]) {
        eventsArr[task.eventIndex] = {
          ...(eventsArr[task.eventIndex] || {}),
          completed: true,
        };
        calData[task.calendarKeyForEvent] = eventsArr;
        localStorage.setItem(calendarKey, JSON.stringify(calData));
      }
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    }

    if (focusedTaskId === task.id) {
      setFocusedTaskId(null);
      setTaskSecondsLeft(null);
      setTaskEndTime(null);
    }
  }

  // “Task completed early” BUTTON HANDELING
  function handleCompleteEarly() {
    if (!focusedTask) return;
    const finished = focusedTask;
    completeTask(finished);
    setTaskSecondsLeft(null);
    setTaskEndTime(null);
    taskEndHandledRef.current = false;
    if (singleTaskMode) {
      clearAllTimers();
    } else {
      const finishedId = finished.id;
      const next = autoFocusFirstAvailableTask(finishedId);
      if (!next) {
        setFocusedTaskId(null);
      }
    }
  }

function deleteTask(task) {
  if (!task) return;
  if (task.fromCalendar) {
    const calData = JSON.parse(localStorage.getItem(calendarKey)) || {};
    const eventsArr = calData[task.calendarKeyForEvent] || [];
    if (eventsArr[task.eventIndex]) {
      eventsArr.splice(task.eventIndex, 1);
      calData[task.calendarKeyForEvent] = eventsArr;
      localStorage.setItem(calendarKey, JSON.stringify(calData));
    }
  } else {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  }
  if (focusedTaskId === task.id) {
    if (singleTaskMode) {
      clearAllTimers();
    } else {
      const finishedId = task.id;
      const next = autoFocusFirstAvailableTask(finishedId);
      if (!next) {
        setFocusedTaskId(null);
        setTaskSecondsLeft(null);
        setTaskEndTime(null);
        taskEndHandledRef.current = false;
      }
    }
  }
}


  // FOR EDITTING TASKS
  function handleEditTask(task) {
    if (task.fromCalendar) {
      const newTitle = window.prompt("Edit task name:", task.text);
      if (newTitle === null) return;
      const currentMinutes =
        task.estimateSeconds && task.estimateSeconds > 0
          ? String(task.estimateSeconds / 60)
          : "";
      const newEstStr = window.prompt(
        "Edit estimated minutes (leave blank to keep current):",
        currentMinutes
      );
      if (newEstStr === null) return;
      const calendarData = JSON.parse(localStorage.getItem(calendarKey)) || {};
      const eventsArr = calendarData[task.calendarKeyForEvent] || [];
      const ev = eventsArr[task.eventIndex];
      if (!ev) return;
      const isObject = typeof ev === "object" && ev !== null;
      const base = isObject ? ev : { title: ev };
      let updated = {
        ...base,
        title: newTitle.trim(),
      };
      if (newEstStr.trim() !== "") {
        const newEstMin = parseInt(newEstStr.trim(), 10);
        if (!isNaN(newEstMin) && newEstMin > 0) {
          updated.estimateMinutes = newEstMin;
        } else {
          alert("Invalid estimate; keeping the old one.");
        }
      }
      eventsArr[task.eventIndex] = updated;
      calendarData[task.calendarKeyForEvent] = eventsArr;
      localStorage.setItem(calendarKey, JSON.stringify(calendarData));
      if (
        focusedTaskId === task.id &&
        newEstStr.trim() !== "" &&
        !isNaN(parseInt(newEstStr.trim(), 10)) &&
        parseInt(newEstStr.trim(), 10) > 0
      ) {
        const newEstSeconds = parseInt(newEstStr.trim(), 10) * 60;
        updateTaskTimerForFocused(newEstSeconds);
      }

      setTasks((prev) => [...prev]);
      return;
    }

    // FOR HANDELING THE MANUALLY CREATED TASKS
    const newTitle = window.prompt("Edit task name:", task.text);
    if (newTitle === null) return;
    const currentMinutes =
      task.estimateSeconds && task.estimateSeconds > 0
        ? String(task.estimateSeconds / 60)
        : "";
    const newEstStr = window.prompt(
      "Edit estimated minutes:",
      currentMinutes
    );
    if (newEstStr === null) return;
    const newEstMin = parseInt(newEstStr.trim(), 10);
    if (isNaN(newEstMin) || newEstMin <= 0) {
      alert("Please enter a positive number of minutes.");
      return;
    }
    const newEstSeconds = newEstMin * 60;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id? {
              ...t,
              text: newTitle.trim(),
              estimateSeconds: newEstSeconds,
            }: t
      )
    );
    if (focusedTaskId === task.id) {
      updateTaskTimerForFocused(newEstSeconds);
    }
  }
  function updateTaskTimerForFocused(newEstSeconds) {
    setTaskSecondsLeft(newEstSeconds);
    taskEndHandledRef.current = false;
    if (singleTaskMode) {
      setTotalSecondsLeft(newEstSeconds);
      const newEnd = Date.now() + newEstSeconds * 1000;
      setEndTime(newEnd);
      sessionEndHandledRef.current = false;
    }
    const newTaskEnd = Date.now() + newEstSeconds * 1000;
    setTaskEndTime(newTaskEnd);
  }

  //AUTO FOCUSING HANDELING
  function autoFocusFirstAvailableTask(excludeId = null) {
    const candidate = combinedTasks.find(
      (t) =>
        t.id !== excludeId &&
        !t.locked &&
        typeof t.estimateSeconds === "number" &&
        t.estimateSeconds > 0
    );
    if (!candidate) return null;

    setFocusedTaskId(candidate.id);
    setTaskSecondsLeft(candidate.estimateSeconds || 0);
    taskEndHandledRef.current = false;
    const newTaskEnd = Date.now() + (candidate.estimateSeconds || 0) * 1000;
    setTaskEndTime(newTaskEnd);
    return candidate;
  }

  //TIMER HANDELING

  function clearAllTimers() {
    setFocusedTaskId(null);
    setIsRunning(false);
    setTotalSecondsLeft(0);
    setTaskSecondsLeft(null);
    setSingleTaskMode(false);
    setIsBreak(false);
    setEndTime(null);
    setTaskEndTime(null);
    setPendingPhase(null);
    setAwaitingPhaseConfirm(false);
    taskEndHandledRef.current = false;
    sessionEndHandledRef.current = false;
    stopAlarmLoop();
  }

  //POMODORO MODE
  function startWorkPeriod() {
    if (!timerSettings) return;
    const workSeconds = (timerSettings.workMinutes || 0) * 60;
    if (workSeconds <= 0) return;
    const now = Date.now();
    setIsBreak(false);
    setTotalSecondsLeft(workSeconds);
    setEndTime(now + workSeconds * 1000);
    setIsRunning(true);
    sessionEndHandledRef.current = false;

    //HANDLE LEFT OVER TIME
    if (focusedTaskId && taskSecondsLeft && taskSecondsLeft > 0) {
      setTaskEndTime(now + taskSecondsLeft * 1000);
      taskEndHandledRef.current = false;
    } else {
      setTaskEndTime(null);
    }
  }

  function startBreakPeriod() {
    if (!timerSettings) {
      clearAllTimers();
      return;
    }
    const breakSeconds = (timerSettings.breakMinutes || 0) * 60;
    if (breakSeconds <= 0) {
      startWorkPeriod();
      return;
    }
    const now = Date.now();
    setIsBreak(true);
    setTotalSecondsLeft(breakSeconds);
    setEndTime(now + breakSeconds * 1000);
    setIsRunning(true);
    sessionEndHandledRef.current = false;
    setTaskEndTime(null);
  }

  //HANDLE WAITING FOR USER DURING MOCHA CRYING
  function startAwaitingPhase(targetPhase) {
    setIsRunning(false);
    setEndTime(null);
    setTotalSecondsLeft(0);
    setPendingPhase(targetPhase);
    setAwaitingPhaseConfirm(true);
    sessionEndHandledRef.current = true;
    setTaskEndTime(null);
  }

  function handleConfirmPhase() {
    if (!pendingPhase) return;
    const phase = pendingPhase;
    setAwaitingPhaseConfirm(false);
    setPendingPhase(null);
    stopAlarmLoop();

    if (phase === "break") {
      startBreakPeriod();
    } else if (phase === "work") {
      startWorkPeriod();
    }
  }

  // HANDLE FOCUS AND UNFOCUS WHEN NOT IN POMODORO MODE
  function handleFocusTask(task) {
    if (!hasTimerSettings) {
      alert(
        "To use the focus timer, please go to your Profile and set your preferred work and break durations first."
      );
      return;
    }

    if (task.fromCalendar && task.locked) {
      alert(
        task.calendarTime
          ? `This event starts at ${task.calendarTime}. You can focus it once that time has started.`
          : "This calendar task is not active yet."
      );
      return;
    }

    const hasEstimate = typeof task.estimateSeconds === "number" && task.estimateSeconds > 0;
    if (!hasEstimate) {
      alert("This task does not have a valid estimated time.");
      return;
    }

    if (focusedTaskId === task.id) {
      setFocusedTaskId(null);
      setTaskSecondsLeft(null);
      setTaskEndTime(null);
      taskEndHandledRef.current = false;

      if (singleTaskMode) {
        clearAllTimers();
      }
      return;
    }

    setFocusedTaskId(task.id);
    const est = task.estimateSeconds || 0;

    // HANDLE SINGLE TASK MODE VS POMODORO MODE
    if (!isRunning && totalSecondsLeft === 0 && !awaitingPhaseConfirm) {
      setSingleTaskMode(true);
      setTaskSecondsLeft(est);
      setTotalSecondsLeft(est);
      taskEndHandledRef.current = false;
      sessionEndHandledRef.current = false;
      const now = Date.now();
      setTaskEndTime(now + est * 1000);
      setEndTime(now + est * 1000);
      setIsRunning(true);
      setIsBreak(false);
    } else {
      // HANDLE THE TASK IN POMODORO MODE
      setSingleTaskMode(false);
      setTaskSecondsLeft(est);
      taskEndHandledRef.current = false;
      const now = Date.now();
      if (!isBreak && isRunning) {
        setTaskEndTime(now + est * 1000);
      } else {
        setTaskEndTime(null);
      }
    }
  }

  // START BUTTON HANDLING
  function handleStartClick() {
    if (!hasTimerSettings) {
      alert(
        "To use the focus timer, go to your Profile page and set your preferred work and break durations first."
      );
      return;
    }

    // HANDLE MOCHA CRYING
    if (awaitingPhaseConfirm) {
      setAwaitingPhaseConfirm(false);
      setPendingPhase(null);
      stopAlarmLoop();
      return;
    }

    // PAUSE BUTTON HANDLING
    if (isRunning) {
      if (endTime) {
        const rem = Math.max(
          0,
          Math.floor((endTime - Date.now()) / 1000)
        );
        setTotalSecondsLeft(rem);
      }
      if (taskEndTime && focusedTaskId && taskSecondsLeft != null) {
        const remTask = Math.max(
          0,
          Math.floor((taskEndTime - Date.now()) / 1000)
        );
        setTaskSecondsLeft(remTask);
      }
      setIsRunning(false);
      setEndTime(null);
      stopAlarmLoop();
      return;
    }
    setSingleTaskMode(false);
    let task = focusedTask;
    if (!task) {
      task = autoFocusFirstAvailableTask();
    }
    if (task) {
      const est = task.estimateSeconds || 0;
      if (est <= 0) {
        alert("This task does not have a valid estimated time.");
        return;
      }
      if (taskSecondsLeft == null || taskSecondsLeft <= 0) {
        setTaskSecondsLeft(est);
        taskEndHandledRef.current = false;
        const now = Date.now();
        if (!isBreak) {
          setTaskEndTime(now + est * 1000);
        } else {
          setTaskEndTime(null);
        }
      }
    }

    let startingSeconds = totalSecondsLeft;
    if (startingSeconds <= 0 && timerSettings?.workMinutes > 0) {
      startingSeconds = timerSettings.workMinutes * 60;
      setIsBreak(false);
      setTotalSecondsLeft(startingSeconds);
    }

    if (startingSeconds > 0) {
      const now = Date.now();
      setEndTime(now + startingSeconds * 1000);
      setIsRunning(true);
      sessionEndHandledRef.current = false;
    }
  }

  // WHEN TASK ESTIMATE ENDS HANDLING
  function handleTaskTimeEnd() {
    const task = focusedTask;
    setIsRunning(false); 
    setEndTime(null);
    setTaskEndTime(null);
    if (!task) {
      setTaskSecondsLeft(null);
      return;
    }
    setTaskAtPrompt(task);
    setExtendMinutes("");
    setShowExtendModal(true);
  }

  // EXTEND TASK TIME HANDLING
  function handleExtendConfirm() {
    if (!taskAtPrompt) {
      setShowExtendModal(false);
      return;
    }
    const val = extendMinutes.trim();
    const extra = parseInt(val, 10);
    if (isNaN(extra) || extra <= 0) {
      alert("Please enter a positive number of minutes.");
      return;
    }
    const extraSeconds = extra * 60;
    const now = Date.now();
    setTaskSecondsLeft(extraSeconds);
    setTaskEndTime(!isBreak ? now + extraSeconds * 1000 : null);
    taskEndHandledRef.current = false;
    setShowExtendModal(false);
    setTaskAtPrompt(null);

    //BIG TIMER VS TASK TIMER HANDELING DEPENDING ON THE MODE
    if (singleTaskMode) {
      setTotalSecondsLeft(extraSeconds);
      setEndTime(now + extraSeconds * 1000);
      setIsRunning(true);
      sessionEndHandledRef.current = false;
    } else {
      if (totalSecondsLeft > 0) {
        setEndTime(now + totalSecondsLeft * 1000);
        setIsRunning(true);
        sessionEndHandledRef.current = false;
      }
    }
  }

  // MARK TASKS DONE HANDLING
  function handleExtendDone() {
    if (taskAtPrompt) {
      const finished = taskAtPrompt;
      completeTask(finished);
      setTaskSecondsLeft(null);
      setTaskAtPrompt(null);

      if (singleTaskMode) {
        clearAllTimers();
      } else {
        const finishedId = finished.id;
        const next = autoFocusFirstAvailableTask(finishedId);
        if (totalSecondsLeft > 0) {
          const now = Date.now();
          setEndTime(now + totalSecondsLeft * 1000);
          setIsRunning(true);
          sessionEndHandledRef.current = false;
        }
        if (!next) {
          taskEndHandledRef.current = false;
        }
      }
    } else {
      if (singleTaskMode) {
        clearAllTimers();
      } else if (totalSecondsLeft > 0) {
        const now = Date.now();
        setEndTime(now + totalSecondsLeft * 1000);
        setIsRunning(true);
        sessionEndHandledRef.current = false;
      }
    }

    setShowExtendModal(false);
  }

  // MAIN TIMER TICKING HANDLING

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      if (endTime) {
        const rem = Math.max(
          0,
          Math.floor((endTime - Date.now()) / 1000)
        );
        setTotalSecondsLeft(rem);
        if (rem === 0 && !sessionEndHandledRef.current) {
          sessionEndHandledRef.current = true;
          setIsRunning(false);
          setEndTime(null);
          if (!singleTaskMode && hasTimerSettings) {
            if (!isBreak) {
              startAwaitingPhase("break");
            } else {
              startAwaitingPhase("work");
            }
          }
        }
      }

      // TASK TIMER HANDLING
      if (focusedTaskId && taskEndTime && taskSecondsLeft != null) {
        const remTask = Math.max(
          0,
          Math.floor((taskEndTime - Date.now()) / 1000)
        );
        setTaskSecondsLeft(remTask);
        if (remTask === 0 && !taskEndHandledRef.current) {
          taskEndHandledRef.current = true;
          clearInterval(interval);
          handleTaskTimeEnd();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isRunning,
    endTime,
    taskEndTime,
    focusedTaskId,
    taskSecondsLeft,
    singleTaskMode,
    isBreak,
    hasTimerSettings,
  ]);

  // TIMER STATES HANDLING

  useEffect(() => {
    if (!username) return;
    const payload = {
      totalSecondsLeft,
      taskSecondsLeft,
      focusedTaskId,
      isRunning,
      singleTaskMode,
      endTime,
      taskEndTime,
      isBreak,
      pendingPhase,
      awaitingPhaseConfirm,
    };
    localStorage.setItem(timerStateKey, JSON.stringify(payload));
  }, [
    username,
    timerStateKey,
    totalSecondsLeft,
    taskSecondsLeft,
    focusedTaskId,
    isRunning,
    singleTaskMode,
    endTime,
    taskEndTime,
    isBreak,
    pendingPhase,
    awaitingPhaseConfirm,
  ]);

  useEffect(() => {
    if (!username) return;
    if (hasLoadedTimerRef.current) return;

    const savedStr = localStorage.getItem(timerStateKey);
    if (!savedStr) {
      hasLoadedTimerRef.current = true;
      return;
    }

    try {
      const saved = JSON.parse(savedStr) || {};
      let {
        totalSecondsLeft: savedTotal = 0,
        taskSecondsLeft: savedTask = null,
        focusedTaskId: savedFocused = null,
        isRunning: savedRunning = false,
        singleTaskMode: savedSingle = false,
        endTime: savedEnd = null,
        taskEndTime: savedTaskEnd = null,
        isBreak: savedIsBreak = false,
        pendingPhase: savedPendingPhase = null,
        awaitingPhaseConfirm: savedAwaiting = false,
      } = saved;

      const now = Date.now();
      if (savedRunning && savedEnd) {
        const rem = Math.max(
          0,
          Math.floor((savedEnd - now) / 1000)
        );
        savedTotal = rem;
        if (rem === 0) {
          savedRunning = false;
          savedEnd = null;
          if (!savedSingle && hasTimerSettings) {
            savedPendingPhase = savedIsBreak ? "work" : "break";
            savedAwaiting = true;
          }
        }
      }
      if (
        savedRunning &&
        savedFocused &&
        typeof savedTask === "number" &&
        savedTaskEnd
      ) {
        const remTask = Math.max(
          0,
          Math.floor((savedTaskEnd - now) / 1000)
        );
        savedTask = remTask;
        if (remTask === 0) {
          savedTaskEnd = null;
        }
      }

      setTotalSecondsLeft(savedTotal);
      setTaskSecondsLeft(
        typeof savedTask === "number" ? savedTask : null
      );
      setFocusedTaskId(savedFocused || null);
      setIsRunning(!!savedRunning);
      setSingleTaskMode(!!savedSingle);
      setEndTime(savedEnd || null);
      setTaskEndTime(savedTaskEnd || null);
      setIsBreak(!!savedIsBreak);
      setPendingPhase(savedPendingPhase || null);
      setAwaitingPhaseConfirm(!!savedAwaiting);
      taskEndHandledRef.current = false;
      sessionEndHandledRef.current = false;
    } catch {
    }
    hasLoadedTimerRef.current = true;
  }, [username, timerStateKey, hasTimerSettings]);

  // DISPLAYS
  const displayHours = Math.floor(totalSecondsLeft / 3600);
  const displayMinutes = Math.floor((totalSecondsLeft % 3600) / 60);
  const displaySeconds = totalSecondsLeft % 60;
  const estimateDisplayMinutes =
    focusedTask && taskSecondsLeft != null && taskSecondsLeft > 0
      ? Math.floor(taskSecondsLeft / 60)
      : 0;
  const estimateDisplaySeconds =
    focusedTask && taskSecondsLeft != null && taskSecondsLeft > 0
      ? taskSecondsLeft % 60
      : 0;

  const phaseLabel = isBreak ? "Break" : "Work";

  // RENDERS
  //Got help from https://www.w3schools.com/jsref/jsref_string_padstart.asp
  //Got help for ChatGPT here
  return (
    <>
      <div className="home-page">
        {/* Clock + cat */}
        <div className="clock-card">
          <img
            src={mochiGif}
            alt="cat gif"
            style={{
              width: "250px",
              height: "250px",
              borderRadius: "20px",
              objectFit: "cover",
              marginBottom: "15px",
            }}
          />
          <p style={{fontWeight:"bold", fontSize: "1.5rem", color:"#6c2a3e"}}> Mochi </p>
          <div className="digital-time">{digital}</div>
        </div>

        {}
        <div className="timer-card">
          <h3 className="timer-title">Task Focus Timer</h3>
          {!hasTimerSettings ? (
            <p style={{ fontSize: "0.9rem", marginBottom: "6px" }}>
              To use the focus timer, go to your <strong>Profile</strong> page
              and set your preferred work and break durations. Once that is set,
              press <strong>Start</strong> for a full focus session, or click{" "}
              <strong>Focus</strong> on a task to time just that task.
            </p>
          ) : (
            <>
              <p style={{ fontSize: "0.9rem", marginBottom: "6px" }}>
                Press <strong>Start</strong> to begin a <strong>{phaseLabel}</strong>{" "}
                session using your preferred timing. If you click{" "}
                <strong>Focus</strong> on a task while the main timer is
                stopped, Pomocat will run a one-off countdown for that task —
                both timers match the estimate, and when it hits zero you&apos;ll
                get a prompt to add more time or mark it done.
              </p>
              {preferenceLabel && (
                <p
                  style={{
                    fontSize: "0.85rem",
                    marginBottom: "8px",
                    opacity: 0.9,
                  }}
                >
                  Your timing preference: <strong>{preferenceLabel}</strong>
                </p>
              )}

              <div className="timer-display">
                {String(displayHours).padStart(2, "0")} :
                {String(displayMinutes).padStart(2, "0")} :
                {String(displaySeconds).padStart(2, "0")}
              </div>

              <div
                style={{
                  fontSize: "0.9rem",
                  marginBottom: "10px",
                  color: "#6c2a3e",
                }}
              >
                <strong>Session:</strong> {isBreak ? "Break" : "Work"}
                <br />
                <strong>Current task:</strong>{" "}
                {focusedTask ? focusedTask.text : "No task selected"}
                {focusedTask && focusedTask.calendarTime && (
                  <>
                    {" "}
                    <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                      (Calendar • {focusedTask.calendarTime})
                    </span>
                  </>
                )}
                <br />
                <strong>Task estimate left:</strong>{" "}
                {focusedTask &&
                taskSecondsLeft != null &&
                taskSecondsLeft > 0 ? (
                  <>
                    {String(estimateDisplayMinutes).padStart(2, "0")}:
                    {String(estimateDisplaySeconds).padStart(2, "0")}
                  </>
                ) : focusedTask ? (
                  "00:00"
                ) : (
                  "No task focused"
                )}
              </div>

              <div className="timer-buttons" style={{ gap: "6px" }}>
                <button onClick={handleStartClick}>
                  {!hasTimerSettings
                    ? "Set timing in Profile"
                    : awaitingPhaseConfirm
                    ? "Pause Mocha’s cries"
                    : isRunning
                    ? "Pause"
                    : "Start"}
                </button>
                <button
                  onClick={() => {
                    clearAllTimers();
                  }}
                >
                  Reset
                </button>
                <button
                  onClick={handleCompleteEarly}
                  disabled={!focusedTask}
                >
                  Task completed early
                </button>
              </div>
              {/* Mocha cries banner */}
              {awaitingPhaseConfirm && pendingPhase && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "8px 10px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid #e0a5b5",
                    fontSize: "0.85rem",
                  }}
                >
                  <strong>Mocha is crying!</strong>{" "}
                  {pendingPhase === "break"
                    ? "Your work block just finished. When you’re ready, start your break."
                    : "Your break just finished. When you’re ready, start your next work block."}
                  <div style={{ marginTop: "6px" }}>
                    <button
                      onClick={handleConfirmPhase}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "10px",
                        border: "none",
                        background: "#6c2a3e",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                      }}
                    >
                      I’m ready to{" "}
                      {pendingPhase === "break"
                        ? "take a break"
                        : "start working"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Tasks list */}
        <div className="tasks-card">
          <h2 className="tasks-title">Tasks</h2>

          <p style={{ fontSize: "0.9rem", marginBottom: "8px" }}>
            Today&apos;s calendar tasks appear at the top (future ones are
            greyed out). Every task has an estimated duration. Press{" "}
            <strong>Start</strong> for a full focus session, or choose one
            manually with <strong>Focus</strong> to time just that task. Click a
            task name to edit it. Manual tasks can be reordered with the ↑ / ↓
            buttons.
          </p>

          <div className="task-input-row" style={{ gap: "5px" }}>
            <input
              type="text"
              placeholder="Add a task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <input
              type="number"
              min="1"
              placeholder="Est. min"
              value={newTaskEstimate}
              onChange={(e) => setNewTaskEstimate(e.target.value)}
              style={{ width: "100px" }}
            />
            <button onClick={addTask}>+</button>
          </div>

          <div className="task-list">
            {combinedTasks.map((task) => {
              const isManual = !task.fromCalendar;
              return (
                <div
                  key={task.id}
                  className="task-item"
                  style={{
                    opacity: task.locked ? 0.5 : 1,
                  }}
                >
                  <span
                    onClick={() => handleEditTask(task)}
                    style={{ cursor: "pointer", display: "inline-block" }}
                    title="Click to edit task"
                  >
                    {task.fromCalendar && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          marginRight: "6px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          opacity: 0.8,
                        }}
                      >
                        [Calendar]
                      </span>
                    )}
                    {task.text}
                    {task.calendarTime && (
                      <span style={{ fontSize: "0.8rem", marginLeft: "6px" }}>
                        • {task.calendarTime}
                      </span>
                    )}
                    {task.estimateSeconds > 0 && (
                      <span style={{ fontSize: "0.8rem", marginLeft: "6px" }}>
                        • est: {Math.floor(task.estimateSeconds / 60)} min
                      </span>
                    )}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      alignItems: "center",
                    }}
                  >
                    {isManual && (
                      <>
                        <button 
                          className="reorder-btn"
                          onClick={() => moveTaskUp(task)}
                        >
                          ↑
                        </button>
                        <button
                          className="reorder-btn"
                          onClick={() => moveTaskDown(task)}
                        >
                          ↓
                        </button>
                      </>
                    )}
                    <button
                      className="focus-btn"
                      onClick={() => handleFocusTask(task)}
                      disabled={task.locked || !hasTimerSettings}
                      style={{
                        borderRadius: "12px",
                        padding: "2px 8px",
                        border:
                          focusedTaskId === task.id
                            ? "2px solid #6c2a3e"
                            : "1px solid #6c2a3e",
                        backgroundColor:
                          focusedTaskId === task.id ? "#e5aaf7" : "#6c2a3e",
                        color: "white",
                        cursor:
                          task.locked || !hasTimerSettings
                            ? "not-allowed"
                            : "pointer",
                        opacity: task.locked || !hasTimerSettings ? 0.7 : 1,
                      }}
                    >
                      {task.locked
                        ? "Locked"
                        : !hasTimerSettings
                        ? "Set timing in Profile"
                        : focusedTaskId === task.id
                        ? "Focused"
                        : "Focus"}
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteTask(task)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Handling the Extend-time modal */}
      {showExtendModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px 24px",
              borderRadius: "18px",
              maxWidth: "360px",
              width: "90%",
              color: "#6c2a3e",
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            }}
          >
            <h4 style={{ marginTop: 0, marginBottom: "10px" }}>
              Time&apos;s up for this task
            </h4>
            <p style={{ fontSize: "0.9rem", marginBottom: "10px" }}>
              {taskAtPrompt ? taskAtPrompt.text : "Current task"}
            </p>
            <p style={{ fontSize: "0.9rem", marginBottom: "6px" }}>
              Do you want to keep working on it? Enter how many extra minutes
              you need, or mark this task as done.
            </p>

            <input
              type="number"
              min="1"
              placeholder="Extra minutes"
              value={extendMinutes}
              onChange={(e) => setExtendMinutes(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "10px",
                border: "1px solid #e0a5b5",
                marginTop: "6px",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
                marginTop: "14px",
              }}
            >
              <button
                style={{
                  padding: "6px 10px",
                  borderRadius: "10px",
                  border: "1px solid #6c2a3e",
                  background: "white",
                  color: "#6c2a3e",
                  cursor: "pointer",
                }}
                onClick={handleExtendDone}
              >
                No, this task is done
              </button>
              <button
                style={{
                  padding: "6px 10px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#6c2a3e",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                onClick={handleExtendConfirm}
              >
                Yes!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// HELPER FOR READING CALENDAR TASKS
function getCalendarTasksForToday(currentDate) {
  const calendarKey = `calendar_${localStorage.getItem("username")}`;
  const calendarData = JSON.parse(localStorage.getItem(calendarKey)) || {};
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();
  const key = `${year}-${month}-${day}`;
  const eventsForToday = calendarData[key] || [];

  return eventsForToday
    .map((e, idx) => {
      const isObject = typeof e === "object" && e !== null;
      const title = isObject ? e.title : e;
      const timeStr = isObject ? e.time || "" : "";
      const estimateMinutes = isObject ? e.estimateMinutes : null;
      const completed = isObject && !!e.completed;

      if (completed) return null;

      let locked = false;
      let displayTime = "";
      if (timeStr) {
        const [hh, mm] = timeStr.split(":").map((x) => parseInt(x, 10) || 0);
        const eventDate = new Date(year, month, day, hh, mm);
        locked = eventDate.getTime() > currentDate.getTime();
        const dateForDisplay = new Date(year, month, day, hh, mm);
        displayTime = dateForDisplay.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }

      const estimateSeconds =
        estimateMinutes && estimateMinutes > 0 ? estimateMinutes * 60 : 0;
//Got help from ChatGPT for this return
      return {
        id: `cal-${key}-${idx}`,
        text: title,
        fromCalendar: true,
        locked,
        calendarTime: displayTime,
        estimateSeconds,
        calendarKeyForEvent: key,
        eventIndex: idx,
      };
    })
    .filter(Boolean);
}