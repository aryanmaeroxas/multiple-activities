"use client";

import { useEffect, useState } from "react";
import { remark } from "remark";
import html from "remark-html";
import { createClient } from "@/utils/supabase/client";

interface Note {
  id: string;
  content: string;
}

export default function MarkdownNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<Note>({ id: "", content: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [user, setUser] = useState<any>(null);
  const [convertedHTMLs, setConvertedHTMLs] = useState<{
    [key: string]: string;
  }>({});
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

    if (data) {
      const convertedHTMLMap: { [key: string]: string } = {};
      for (const note of data) {
        convertedHTMLMap[note.id] = await convertMarkdown(note.content);
      }

      setNotes(
        data.map((note: any) => ({ id: note.id, content: note.content }))
      );
      setConvertedHTMLs(convertedHTMLMap);
    }
  }
  

  async function addNote() {
    if (!newNote.content.trim() || !user) return;

    const { data, error } = await supabase
      .from("notes")
      .insert([{ content: newNote.content, user_id: user.id }])
      .select();

    if (error) {
      console.log("Error adding note:", error.message);
      return;
    }

    if (data) {
      const newNoteWithMarkdown = { id: data[0].id, content: data[0].content };
      const convertedMarkdown = await convertMarkdown(
        newNoteWithMarkdown.content
      );

      setNotes([newNoteWithMarkdown, ...notes]);
      setConvertedHTMLs((prev) => ({
        ...prev,
        [newNoteWithMarkdown.id]: convertedMarkdown,
      }));
    }
    setNewNote({ id: "", content: "" });
  }

  async function deleteNote(id: string) {
    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) {
      console.log("Error deleting note:", error.message);
      return;
    }

    setNotes(notes.filter((note) => note.id !== id));
  }

  function startEditing(id: string, currentText: string) {
    setEditingId(id);
    setEditText(currentText);
  }

  async function saveEdit(id: string) {
    if (!editText.trim()) return;

    const { error } = await supabase
      .from("notes")
      .update({ content: editText, updated_at: new Date() })
      .eq("id", id);

    if (error) {
      console.log("Error updating note:", error.message);
      return;
    }

    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, content: editText } : note
      )
    );
    setEditingId(null);
  }

  async function convertMarkdown(text: string) {
    const processedContent = await remark().use(html).process(text);
    return processedContent.toString();
  }

  async function togglePreview(noteId: string, content: string) {
    setPreviewMode((prev) => ({ ...prev, [noteId]: !prev[noteId] }));
  }

  return (
    <div className="p-4 max-w-md w-96 mx-auto">
      <h1 className="text-center text-3xl font-semibold mb-4">
        Markdown Notes
      </h1>
      {/* Input Fields */}
      <textarea
        value={newNote.content}
        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
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
              <input
                title="Toggle Markdown"
                type="checkbox"
                className="toggle"
                defaultChecked
                onClick={() => togglePreview(note.id, note.content)}
                disabled={editingId === note.id}
              />
              <button
                title="Delete"
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
                className="mt-2 p-2 bg-white border rounded"
                onClick={() => startEditing(note.id, note.content)}
              >
                {note.content}
              </div>
            ) : (
              <article
                className="prose w-full p-2 border rounded resize-none focus:outline-none mt-2 ignore-css"
                dangerouslySetInnerHTML={{
                  __html: convertedHTMLs[note.id] || "",
                }}
              ></article>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
