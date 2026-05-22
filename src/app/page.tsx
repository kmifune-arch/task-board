"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

type Task = {
  id: string;
  text: string;
  done: boolean;
};

const STORAGE_KEY = "task-board:tasks";
const STORAGE_EVENT = "task-board:tasks-changed";
const EMPTY_TASKS: Task[] = [];

function isTaskArray(value: unknown): value is Task[] {
  return (
    Array.isArray(value) &&
    value.every(
      (v) =>
        v !== null &&
        typeof v === "object" &&
        typeof (v as Task).id === "string" &&
        typeof (v as Task).text === "string" &&
        typeof (v as Task).done === "boolean",
    )
  );
}

let cachedRaw: string | null = null;
let cachedTasks: Task[] = EMPTY_TASKS;

function readTasks(): Task[] {
  if (typeof window === "undefined") return EMPTY_TASKS;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY_TASKS;
  }
  if (raw === cachedRaw) return cachedTasks;
  cachedRaw = raw;
  if (raw === null) {
    cachedTasks = EMPTY_TASKS;
    return cachedTasks;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    cachedTasks = isTaskArray(parsed) ? parsed : EMPTY_TASKS;
  } catch {
    cachedTasks = EMPTY_TASKS;
  }
  return cachedTasks;
}

function writeTasks(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {
    // 容量超過などは黙って継続
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(STORAGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(STORAGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

const getServerSnapshot = () => EMPTY_TASKS;

export default function Home() {
  const tasks = useSyncExternalStore(subscribe, readTasks, getServerSnapshot);
  const [input, setInput] = useState("");

  const addTask = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    writeTasks([
      ...readTasks(),
      { id: crypto.randomUUID(), text, done: false },
    ]);
    setInput("");
  }, [input]);

  const toggleTask = useCallback((id: string) => {
    writeTasks(
      readTasks().map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    writeTasks(readTasks().filter((t) => t.id !== id));
  }, []);

  const canSubmit = useMemo(() => input.trim().length > 0, [input]);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        タスクボード
      </h1>

      <form
        className="mb-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          addTask();
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="新しいタスクを入力"
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          disabled={!canSubmit}
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
