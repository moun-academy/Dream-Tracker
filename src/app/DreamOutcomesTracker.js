"use client";

import { useMemo, useState } from "react";

const initialDreams = [
  { id: 1, name: "Launch a personal portfolio", completed: true },
  { id: 2, name: "Run a half marathon", completed: false },
  { id: 3, name: "Visit Iceland", completed: false },
];

export default function DreamOutcomesTracker() {
  const [dreams, setDreams] = useState(initialDreams);
  const [newDream, setNewDream] = useState("");

  const completedCount = useMemo(
    () => dreams.filter((dream) => dream.completed).length,
    [dreams]
  );

  const progress = dreams.length === 0 ? 0 : Math.round((completedCount / dreams.length) * 100);

  function addDream(event) {
    event.preventDefault();

    const trimmed = newDream.trim();
    if (!trimmed) {
      return;
    }

    setDreams((currentDreams) => [
      ...currentDreams,
      {
        id: Date.now(),
        name: trimmed,
        completed: false,
      },
    ]);

    setNewDream("");
  }

  function toggleDream(id) {
    setDreams((currentDreams) =>
      currentDreams.map((dream) =>
        dream.id === id ? { ...dream, completed: !dream.completed } : dream
      )
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        background: "#f6f9fc",
        color: "#1f2937",
        display: "flex",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "680px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 8px 30px rgba(31, 41, 55, 0.12)",
          padding: "24px",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Dream Outcomes Tracker</h1>
        <p style={{ marginTop: 8 }}>
          Track milestones and keep momentum with clear progress.
        </p>

        <div
          style={{
            margin: "20px 0",
            background: "#e5e7eb",
            borderRadius: "999px",
            overflow: "hidden",
          }}
          aria-label="progress"
        >
          <div
            style={{
              width: `${progress}%`,
              background: "#2563eb",
              color: "#fff",
              textAlign: "center",
              padding: "6px 0",
              fontSize: "14px",
              transition: "width 0.25s ease",
            }}
          >
            {progress}% complete
          </div>
        </div>

        <form onSubmit={addDream} style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <input
            type="text"
            value={newDream}
            onChange={(event) => setNewDream(event.target.value)}
            placeholder="Add a new dream milestone"
            style={{
              flex: 1,
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "10px",
              fontSize: "15px",
            }}
          />
          <button
            type="submit"
            style={{
              border: "none",
              borderRadius: "8px",
              background: "#2563eb",
              color: "#fff",
              padding: "10px 14px",
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </form>

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "8px" }}>
          {dreams.map((dream) => (
            <li
              key={dream.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                type="checkbox"
                checked={dream.completed}
                onChange={() => toggleDream(dream.id)}
                aria-label={`Mark ${dream.name} complete`}
              />
              <span
                style={{
                  textDecoration: dream.completed ? "line-through" : "none",
                  opacity: dream.completed ? 0.7 : 1,
                }}
              >
                {dream.name}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
