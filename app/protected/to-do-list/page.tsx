"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function TodoApp() {
  const [todos, setTodos] = useState<any[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
      if (data?.user) fetchTodos(data.user.id);
    }
    fetchUser();
  }, []);

  async function fetchTodos(userId: string) {
    const { data } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setTodos(data);
  }

  async function addTodo() {
    if (!newTodo.trim() || !user) return;

    const { data, error } = await supabase
      .from("todos")
      .insert([{ task: newTodo, completed: false, user_id: user.id }])
      .select();

    if (error) {
      console.error("Error adding task:", error.message);
      return;
    }

    if (data) setTodos([data[0], ...todos]);
    setNewTodo("");
  }

  async function toggleCompleted(todoId: string, completed: boolean) {
    const { error } = await supabase
      .from("todos")
      .update({ completed: !completed })
      .eq("id", todoId);

    if (error) {
      console.error("Error updating task:", error.message);
      return;
    }

    setTodos(
      todos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !completed } : todo
      )
    );
  }

  async function deleteTodo(todoId: string) {
    const { error } = await supabase.from("todos").delete().eq("id", todoId);

    if (error) {
      console.error("Error deleting task:", error.message);
      return;
    }

    setTodos(todos.filter((todo) => todo.id !== todoId));
  }

  function startEditing(todoId: string, currentText: string) {
    setEditingId(todoId);
    setEditText(currentText);
  }

  async function saveEdit(todoId: string) {
    if (!editText.trim()) return;

    const { error } = await supabase
      .from("todos")
      .update({ task: editText })
      .eq("id", todoId);

    if (error) {
      console.error("Error updating task:", error.message);
      return;
    }

    setTodos(
      todos.map((todo) =>
        todo.id === todoId ? { ...todo, task: editText } : todo
      )
    );

    setEditingId(null);
  }

  return (
    <div className="p-4 max-w-md w-96 mx-auto">
      <h1 className="text-center text-3xl font-semibold mb-4">To Do List</h1>

      {/* Input Field */}
      <textarea
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="New Task"
        className="w-full p-2 border rounded focus:outline-none"
        onKeyDown={(e) => e.key === "Enter" && addTodo()}
      />

      {/* Task List */}
      <ul className="mt-4 space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-start p-2 border rounded bg-gray-50"
            onClick={() => startEditing(todo.id, todo.task)}
          >
            <div className="mr-3">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleCompleted(todo.id, todo.completed)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {/* Task Text or Edit Field */}
            <div className="flex-1 overflow-hidden">
              {editingId === todo.id ? (
                <textarea
                  value={editText}
                  onChange={(e) => {
                    setEditText(e.target.value);
                    e.target.style.height = "auto"; // Reset height
                    e.target.style.height = `${e.target.scrollHeight}px`; // Adjust height based on content
                  }}
                  onBlur={() => saveEdit(todo.id)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && saveEdit(todo.id)
                  }
                  autoFocus
                  className="w-full p-1 border rounded resize-none focus:outline-none"
                  style={{ minHeight: "40px", overflow: "hidden" }}
                />
              ) : (
                <span
                  className={`whitespace-pre-wrap break-words block ${
                    todo.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {todo.task}
                </span>
              )}
            </div>

            {/* Delete Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteTodo(todo.id);
              }}
              className="ml-2 text-gray-400 hover:text-red-500"
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
