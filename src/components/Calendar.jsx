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
  }, [events]);

  const [currentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState("");

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

  function openModal(day) {
    setSelectedDate(day);
    setNewEvent("");
    setShowModal(true);
  }

  function addEvent() {
    if (!newEvent.trim()) return;

    const key = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${selectedDate}`;

    setEvents({
      ...events,
      [key]: [...(events[key] || []), newEvent],
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

  return (
    <div
      className="calendar-page"
      style={{
        background: "#e8b5bd",
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

          return (
            <div key={day} className="day-box" onClick={() => openModal(day)}>
              <div className="day-number">{day}</div>

              <div className="events-list">
                {dayEvents.map((e, idx) => (
                  <div
                    key={idx}
                    className="event-item"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{e}</span>
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        deleteEvent(day, idx);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#6c2a3e",
                        cursor: "pointer",
                        marginLeft: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Event for {selectedDate}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Event name..."
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={addEvent}>
            Add Event
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
