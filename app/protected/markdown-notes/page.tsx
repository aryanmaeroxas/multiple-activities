"use client";

import { useEffect, useState } from "react";
import { remark } from "remark";
import html from "remark-html";
import { createClient } from "@/utils/supabase/client";

export default function MarkdownNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [user, setUser] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState<{ [key: string]: boolean }>(
    {}
  );

  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
      if (data?.user) fetchNotes(data.user.id);
    }
    fetchUser();
  }, []);

  async function fetchNotes(userId: string) {
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setNotes(data);
  }

  async function addNote() {
    if (!newNote.trim() || !user) return;

    const { data, error } = await supabase
      .from("notes")
      .insert([{ content: newNote, user_id: user.id }])
      .select();

    if (error) {
      console.error("Error adding note:", error.message);
      return;
    }

    if (data) setNotes([data[0], ...notes]);
    setNewNote("");
  }

  async function deleteNote(noteId: string) {
    const { error } = await supabase.from("notes").delete().eq("id", noteId);

    if (error) {
      console.error("Error deleting note:", error.message);
      return;
    }

    setNotes(notes.filter((note) => note.id !== noteId));
  }

  function startEditing(noteId: string, currentText: string) {
    setEditingId(noteId);
    setEditText(currentText);
  }

  async function saveEdit(noteId: string) {
    if (!editText.trim()) return;

    const { error } = await supabase
      .from("notes")
      .update({ content: editText, updated_at: new Date() })
      .eq("id", noteId);

    if (error) {
      console.error("Error updating note:", error.message);
      return;
    }

    setNotes(
      notes.map((note) =>
        note.id === noteId ? { ...note, content: editText } : note
      )
    );

    setEditingId(null);
  }

  async function convertMarkdown(text: string) {
    const processedContent = await remark().use(html).process(text);
    console.log(processedContent.toString());
    return processedContent.toString();
  }

  function togglePreview(noteId: string) {
    setPreviewMode((prev) => ({ ...prev, [noteId]: !prev[noteId] }));
  }

  return (
    <div className="p-4 max-w-md w-96 mx-auto">
      <h1 className="text-center text-3xl font-semibold mb-4">
        Markdown Notes
      </h1>

      {/* Input Fields */}
      <textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Write in Markdown..."
        className="w-full p-2 border rounded focus:outline-none resize-none"
        rows={4}
      />
      <button
        onClick={addNote}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Note
      </button>

      {/* Notes List */}
      <ul className="mt-4 space-y-2">
        {notes.map((note) => (
          <li key={note.id} className="p-2 border rounded bg-gray-50">
            <div className="flex justify-between">
              <button onClick={() => togglePreview(note.id)}>Ⓜ️</button>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-red-500 hover:text-red-700"
              >
                ❌
              </button>
            </div>

            {/* Editing Mode */}
            {editingId === note.id ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => saveEdit(note.id)}
                onKeyDown={(e) =>
                  !e.shiftKey && e.key === "Enter" && saveEdit(note.id)
                }
                className="w-full p-2 border rounded resize-none focus:outline-none mt-2"
                rows={4}
              />
            ) : previewMode[note.id] ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: convertMarkdown(note.content),
                }}
              />
            ) : (
              <div
                className="mt-2 p-2 bg-white border rounded"
                onClick={() => startEditing(note.id, note.content)}
              >
                {note.content}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
