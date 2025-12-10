import "./About.css";

export default function About() {
  const username = localStorage.getItem("username");

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingTop: "2200px",
        paddingBottom: "40px",
        background: "#e8b5bd",
        display: "flex",
        justifyContent: "center",
        //Learned from https://www.w3schools.com/cssref/pr_font_font-family.php
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(255,240,240,0.9)",
          borderRadius: "24px",
          padding: "28px 32px",
          maxWidth: "800px",
          //Learned from https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/width
          width: "90%",
          //Learned from https://www.w3schools.com/cssref/css3_pr_box-shadow.php
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          color: "#6c2a3e",
        }}
      >
        {/* Header */}
        <h1 style={{ marginBottom: "12px" }}>About Pomocat</h1>

        <p style={{ marginBottom: "10px" }}>
          {username ? `Hi ${username}! ` : ""}
          Pomocat is a small productivity web app that combines a daily task
          list, a lightweight calendar, and a focus timer with a separate task
          estimate timer. It features my two cats, Mochi and Mocha. Everything 
          you do here lives in your browser and is tied to the username you log in with.
        </p>

        {/* Getting started */}
        <h2 style={{ fontSize: "1.2rem", marginTop: "18px" }}>
          Getting started
        </h2>
        <div
          style={{
            marginTop: "10px",
            display: "grid",
            gap: "8px",
          }}
        >
          <div
            style={{
              padding: "8px 10px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.8)",
            }}
          >
            <strong>Create an account or log in: </strong>
            On the login page, you can register a new account (email +
            password) or sign back in. Your username is used in the keys for
            saved data (tasks, events, and timer settings), so each account has
            its own separate information.
          </div>

          <div
            style={{
              padding: "8px 10px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.8)",
            }}
          >
            <strong>Use the navbar to move around: </strong>
            The top bar has links to <em>Home</em>, <em>Calendar</em>,{" "}
            <em>Profile</em>, and <em>About</em>. Most pages are protected:
            if you&apos;re not logged in, Pomocat will redirect you to the
            login page instead and ask you to sign in first.
          </div>

          <div
            style={{
              padding: "8px 10px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.8)",
            }}
          >
            <strong>Logging out: </strong>
            The <em>Logout</em> button in the navbar clears your current
            session and sends you back to the login page. Your data stays in
            the browser and comes back whenever you log in again with the same
            username on the same device.
          </div>
        </div>

        {/* What Pomocat does */}
        <h2 style={{ fontSize: "1.2rem", marginTop: "22px" }}>
          What Pomocat Does
        </h2>

        <div
          style={{
            marginTop: "10px",
            display: "grid",
            //Learned from https://www.w3schools.com/cssref/css3_pr_gap.php
            gap: "8px",
          }}
        >
          <div
            style={{
              padding: "8px 10px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.8)",
            }}
          >
            <strong>Plan your day in one place: </strong>
            The <em>Calendar</em> lets you schedule events with names, optional
            times, and estimated durations. The <em>Home</em> page automatically
            pulls in any events you scheduled for <strong>today</strong> and
            shows them at the top of your task list.
          </div>

          <div
            style={{
              padding: "8px 10px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.8)",
            }}
          >
            <strong>Use realistic timing: </strong>
            On the <em>Profile</em> page you choose how long a focus session
            should be (work minutes) and how long breaks should be (break
            minutes). The big timer on the Home page uses your work duration.
            Each individual task also has its own estimate in minutes, which is
            tracked separately by a smaller task timer. 
          </div>

          <div
            style={{
              padding: "8px 10px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.8)",
            }}
          >
            <strong>See your progress clearly: </strong>
            The <em>Profile</em> page shows how many tasks you have completed in
            total and how many you finished today, based on tasks you mark as
            done from the Home page.
          </div>
        </div>

        {/* How it works */}
        <h2 style={{ fontSize: "1.2rem", marginTop: "22px" }}>How it works</h2>

        <div style={{ marginTop: "10px", display: "grid", gap: "12px" }}>
          {/* Step 1 */}
          <div>
            <div
              style={{
                fontSize: "0.8rem",
                letterSpacing: "0.06em",
                opacity: 0.8,
                marginBottom: "2px",
              }}
            >
              STEP 1
            </div>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.85)",
              }}
            >
              <strong>Set your timing style on the Profile page: </strong>
              Choose how long you want each focus session to be and how long
              your breaks should last (for example, 25/5, 40/10, or 50/10). Your
              work duration feeds into the big timer on the Home page. Changing
              these numbers updates how future sessions behave. 
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <div
              style={{
                fontSize: "0.8rem",
                letterSpacing: "0.06em",
                opacity: 0.8,
                marginBottom: "2px",
              }}
            >
              STEP 2
            </div>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.85)",
              }}
            >
              <strong>Plan your day on the Calendar: </strong>
              Click any future date to add an event with a name, an optional
              time, and an estimated duration in minutes. Past days are greyed
              out so you don&apos;t accidentally schedule things in the past.
              You can click an existing event to edit it or delete it with the
              ✕ button.
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <div
              style={{
                fontSize: "0.8rem",
                letterSpacing: "0.06em",
                opacity: 0.8,
                marginBottom: "2px",
              }}
            >
              STEP 3
            </div>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.85)",
              }}
            >
              <strong>Use the Home page to focus: </strong>
              The Home page shows a digital clock, your cat gif, and a combined
              list of today&apos;s tasks. Calendar events for today appear at
              the top (with a small <em>[Calendar]</em> label), and you can add
              manual tasks underneath with your own estimated times. Click a
              task&apos;s text to edit its name or estimate, or press{" "}
              <em>Focus</em> to make it the current task.
            </div>
          </div>

          {/* Step 4 – two timers explained */}
          <div>
            <div
              style={{
                fontSize: "0.8rem",
                letterSpacing: "0.06em",
                opacity: 0.8,
                marginBottom: "2px",
              }}
            >
              STEP 4 – UNDERSTANDING THE TWO TIMERS
            </div>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.85)",
              }}
            >
              <strong>Let the work timer and task timer cooperate: </strong>
              When you press <strong>Start</strong>, two different countdowns
              can be active:
              <ul style={{ marginTop: "6px", paddingLeft: "18px", listStyle: "none"  }}>
                <li>
                  The <strong>big timer</strong> at the top is your{" "}
                  <em>focus session timer</em>. It uses your work duration from
                  Profile (for example, a 40-minute session) and represents how
                  long you plan to stay in &quot;focus mode&quot;. When this ends,
                  my cat Mocha will start crying. Tell Mocha you are ready to go on break
                  to make him happy! The same will occur when you switch from your break back
                  to your focus session.
                </li>
                <li>
                  Under &quot;Estimate left&quot;, the{" "}
                  <strong>smaller timer</strong> is the{" "}
                  <em>task estimate timer</em>. It counts down only for the
                  specific task you&apos;re focusing on, using the estimate you
                  gave that task (for example, 20 minutes). When you go on break,
                  your task timer will pause until you return to work!
                </li>
              </ul>
              These timers are related but separate: your focus session can be
              longer than a single task, or you can finish multiple tasks within
              one work session.
            </div>
          </div>

          {/* Step 5 – when the task estimate hits zero */}
          <div>
            <div
              style={{
                fontSize: "0.8rem",
                letterSpacing: "0.06em",
                opacity: 0.8,
                marginBottom: "2px",
              }}
            >
              STEP 5 - WHEN A TASK RUNS OUT OF TIME
            </div>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.85)",
              }}
            >
              <strong>Handle &quot;estimate finished&quot; moments: </strong>
              When the task estimate timer reaches zero, Pomocat pauses your
              session and shows a little dialog asking what you want to do:
              <ul style={{ marginTop: "6px", paddingLeft: "18px", listStyle: "none"  }}>
                <li>
                  <strong>Add more minutes</strong> if you&apos;re still
                  working. This extends the task estimate and lets the focus
                  timer keep going.
                </li>
                <li>
                  <strong>Mark the task as done</strong> if you&apos;re
                  finished. The task is moved into your completed history and
                  removed from the active list. Pomocat can then automatically
                  focus the next available task while your work timer continues.
                </li>
              </ul>
            </div>
          </div>

          {/* Step 6 – profile / stats */}
          <div>
            <div
              style={{
                fontSize: "0.8rem",
                letterSpacing: "0.06em",
                opacity: 0.8,
                marginBottom: "2px",
              }}
            >
              STEP 6
            </div>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.85)",
              }}
            >
              <strong>Review everything on your Profile: </strong>
              The Profile page shows how many tasks you&apos;ve completed in
              total, how many you finished today, and your current work/break
              settings. This helps you see whether you&apos;re actually
              finishing the tasks you plan—and you can adjust your timing
              preferences if sessions feel too short or too long.
            </div>
          </div>
        </div>

        {/* Tips section */}
        <h2 style={{ fontSize: "1.2rem", marginTop: "22px" }}>
          Tips for using Pomocat
        </h2>

        <div
          style={{
            marginTop: "10px",
            display: "grid",
            gap: "6px",
          }}
        >
          <div
            style={{
              padding: "8px 10px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.8)",
            }}
          >
            Choose work and break durations that actually match your energy
            (25/5, 40/10, 50/10, etc.). If you always end a session with
            leftover time, try shortening it; if you constantly run over, try a
            slightly longer work duration.
          </div>
          <div
            style={{
              padding: "8px 10px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.8)",
            }}
          >
            Break big projects into several smaller tasks or calendar events.
            It feels better to check off five small pieces than stare at one
            impossible &quot;do everything&quot; task all day.
          </div>
          <div
            style={{
              padding: "8px 10px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.8)",
            }}
          >
            If your estimate runs out and you&apos;re still not done, adding
            more time is okay—this is information, not failure. Over time
            you&apos;ll learn how long things <em>actually</em> take you and
            can make better plans.
          </div>
          <div
            style={{
              padding: "8px 10px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.8)",
            }}
          >
            At the end of the day, visit Profile and glance at your completed
            tasks to see what you got through and what needs to move to
            tomorrow&apos;s calendar.
          </div>
        </div>

        <p style={{ marginTop: "18px", fontSize: "0.9rem", opacity: 0.85 }}>
          Pomocat is meant to be kind, not strict. It helps you plan, focus,
          and rest while making your to-do list feel a little less scary and a
          lot more doable.
        </p>
      </div>
    </div>
  );
}
