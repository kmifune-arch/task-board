"use client";

import { useEffect, useRef, useState } from "react";

type Task = {
  id: string;
  text: string;
  done: boolean;
};

const STORAGE_KEY = "task-board:tasks";

function makeId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    try {
      return crypto.randomUUID();
    } catch {
      // フォールバックへ
    }
  }
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function loadTasks(): Task[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is Task =>
        v !== null &&
        typeof v === "object" &&
        typeof (v as Task).id === "string" &&
        typeof (v as Task).text === "string" &&
        typeof (v as Task).done === "boolean",
    );
  } catch {
    return [];
  }
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = loadTasks();
    // localStorage からの初期化のため setState を許容
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (loaded.length > 0) setTasks(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // 容量超過などは無視
    }
  }, [tasks, hydrated]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const el = inputRef.current;
    const text = (el?.value ?? "").trim();
    if (!text) return;
    setTasks((prev) => [...prev, { id: makeId(), text, done: false }]);
    if (el) el.value = "";
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        タスクボード
      </h1>

      <form className="mb-6 flex gap-2" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          placeholder="新しいタスクを入力"
          autoComplete="off"
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          追加
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">
          タスクはまだありません
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`flex items-center gap-3 rounded-md border px-3 py-2 transition-colors ${
                task.done
                  ? "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500"
                  : "border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              }`}
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
                aria-label={`${task.text} を${task.done ? "未完了" : "完了"}にする`}
                className="h-4 w-4 cursor-pointer"
              />
              <span className={`flex-1 ${task.done ? "line-through" : ""}`}>
                {task.text}
              </span>
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                aria-label={`${task.text} を削除`}
                className="rounded px-2 py-1 text-sm text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
