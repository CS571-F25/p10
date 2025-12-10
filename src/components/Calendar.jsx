import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "./Calendar.css";

export default function Calendar() {
  const username = localStorage.getItem("username");
  const calendarKey = `calendar_${username}`;

  const [events, setEvents] = useState(() => {
    return JSON.parse(localStorage.getItem(calendarKey)) || {};
  });

  useEffect(() => {
    localStorage.setItem(calendarKey, JSON.stringify(events));
  }, [events, calendarKey]);

  const [currentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [editingIndex, setEditingIndex] = useState(null);

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventEstimate, setNewEventEstimate] = useState(""); 

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayIndex = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  function openAddModal(day) {
    setSelectedDate(day);
    setNewEventTitle("");
    setNewEventTime("");
    setNewEventEstimate("");
    setMode("add");
    setEditingIndex(null);
    setShowModal(true);
  }

  function openEditModal(day, index) {
    const key = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`;
    const dayEvents = events[key] || [];
    const ev = dayEvents[index];
    if (!ev) return;

    const isObject = typeof ev === "object" && ev !== null;
    const title = isObject ? ev.title : String(ev);
    const time = isObject && ev.time ? ev.time : "";
    const estimateMinutes =
      isObject && typeof ev.estimateMinutes === "number"
        ? String(ev.estimateMinutes)
        : "";

    setSelectedDate(day);
    setNewEventTitle(title);
    setNewEventTime(time);
    setNewEventEstimate(estimateMinutes);
    setMode("edit");
    setEditingIndex(index);
    setShowModal(true);
  }

  function addOrEditEvent() {
    if (!newEventTitle.trim()) {
      alert("Please enter an event name.");
      return;
    }

    const estimateMinutes = parseInt(newEventEstimate, 10);
    if (isNaN(estimateMinutes) || estimateMinutes <= 0) {
      alert("Please enter a positive estimated time (in minutes).");
      return;
    }

    const key = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${selectedDate}`;
    const list = [...(events[key] || [])];

    const newEvent = {
      title: newEventTitle.trim(),
      time: newEventTime || "",
      estimateMinutes,
      completed: false,
    };

    if (mode === "edit" && editingIndex != null && list[editingIndex]) {
      list[editingIndex] = {
        ...(list[editingIndex] || {}),
        ...newEvent,
      };
    } else {
      list.push(newEvent);
    }

    setEvents({
      ...events,
      [key]: list,
    });

    setShowModal(false);
  }

  function deleteEvent(day, index) {
    const key = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`;
    const updatedEvents = [...(events[key] || [])];

    updatedEvents.splice(index, 1);

    setEvents({
      ...events,
      [key]: updatedEvents,
    });
  }

  function getEvents(day) {
    const key = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`;
    return events[key] || [];
  }

  // Got help from https://www.w3schools.com/jsref/jsref_tolocaledatestring.asp
  //Got help from https://www.w3schools.com/tags/tag_div.ASP
  //Got help from https://getbootstrap.com/docs/5.0/forms/form-control/
  return (
    <div
      className="calendar-page"
      style={{
        background: "#e8b5bd",
        //Learned from https://www.w3schools.com/css/css_overflow.asp
        overflowX: "hidden",
        paddingBottom: "60px",
      }}
    >
      <h1 className="calendar-title">
        {currentMonth.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </h1>

      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="week-header">
            {d}
          </div>
        ))}

        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={"empty-" + i}></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayEvents = getEvents(day);
          const isPast = (() => {
            const d = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day
            );
            if (d.getFullYear() < todayY) return true;
            if (
              d.getFullYear() === todayY &&
              d.getMonth() < todayM
            )
              return true;
            if (
              d.getFullYear() === todayY &&
              d.getMonth() === todayM &&
              d.getDate() < todayD
            )
              return true;
            return false;
          })();

          return (
            <div
              key={day}
              className={`day-box ${isPast ? "past-day" : ""}`}
              onClick={() => {
                if (!isPast) openAddModal(day);
              }}
            >
              <div className="day-number">{day}</div>

              <div className="events-list">
                {dayEvents.map((e, idx) => {
                  const isObject = typeof e === "object" && e !== null;
                  const title = isObject ? e.title : e;
                  const time = isObject ? e.time || "" : "";
                  const completed = isObject && !!e.completed;
                  return (
                    <div
                      key={idx}
                      className="event-item"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        if (!isPast) {
                          openEditModal(day, idx);
                        }
                      }}
                    >
                      <span
                        className="event-text"
                        style={{
                          //Learned this from https://www.w3schools.com/cssref/pr_text_text-decoration.php
                          textDecoration: completed ? "line-through" : "none",
                          opacity: completed ? 0.6 : 1,
                        }}
                      >
                        {time && <strong>{time} • </strong>}
                        {title}
                      </span>
                      <button
                        className="event-delete"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          deleteEvent(day, idx);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {mode === "edit" ? "Edit Event" : "Add Event"} for {selectedDate}{" "}
            {currentMonth.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Event name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Event name (e.g., CS 571 study)"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Time</Form.Label>
            <Form.Control
              type="time"
              value={newEventTime}
              onChange={(e) => setNewEventTime(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Estimated duration (minutes)</Form.Label>
            <Form.Control
              type="number"
              min="1"
              placeholder="e.g., 50"
              value={newEventEstimate}
              onChange={(e) => setNewEventEstimate(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={addOrEditEvent}>
            {mode === "edit" ? "Save Changes" : "Add Event"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
