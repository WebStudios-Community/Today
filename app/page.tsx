"use client";

import { FileText, Notebook, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { useGuestID } from "./GuestID";
import { useRouter } from "next/navigation";

interface Notes {
  id: number;
  Name: string;
  Text: string;
  type: string;
  members: number;
  owner_id: string;
}
interface Trash {
  id: number;
  Name: string;
  Text: string;
}

export default function Home() {
  const router = useRouter();
  const [notes, setNotes] = useState<Notes[] | null>(null);
  const [trashs, setTrashs] = useState<Trash[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState<{ [id: number]: string }>({});
  const [show, setShow] = useState<number | null>(null);
  const [join, setJoin] = useState(false);
  const [joining, setJoining] = useState("");
  const colors = [
    // Pastel
    "#F5C2E7",
    "#F9E2AF",
    "#A6E3A1",
    "#89DCEB",
    "#B4BEFE",

    // Vibrant
    "#FF6B6B",
    "#FFA94D",
    "#4DABF7",
    "#6EE7B7",
    "#C084FC",

    // Neutral
    "#1E1E1E",
    "#2D2D2D",
    "#3F3F46",
    "#71717A",
    "#F4F4F5",
  ];
  const GuestId = useGuestID();

  useEffect(() => {
    const getNotes = async () => {
      const noteID = user?.id || GuestId;
      if (!noteID) return;
      const { data } = await supabase
        .from("Notes")
        .select("*")
        .eq("user_id", noteID);

      setNotes(data);
    };

    getNotes();
  }, [refresh]);

  useEffect(() => {
    const GetUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    GetUser();
  });

  useEffect(() => {
    const getNotes = async () => {
      const noteID = user?.id || GuestId;
      if (!noteID) return;
      const { data } = await supabase
        .from("Trash")
        .select("*")
        .eq("user_id", noteID);

      setTrashs(data);
    };

    getNotes();
  }, [refresh]);

  async function ADDNotes() {
    const noteID = user?.id || GuestId;
    if (!noteID) return;
    const { data, error } = await supabase
      .from("Notes")
      .insert({
        user_id: noteID,
        Name: "Default Name",
        Text: "Default Text",
        type: "private",
      })
      .select();

    if (data && data.length > 0) {
      const newNoteId = data[0].id;
      router.push(`/Note/${newNoteId}`);
    }
    if (!error) {
      setRefresh((prev) => !prev);
    }
  }
  async function ADDGroupNotes() {
    const noteID = user?.id || GuestId;
    if (!noteID) return;
    const { data, error } = await supabase
      .from("Notes")
      .insert({
        user_id: noteID,
        Name: "Default Name",
        Text: "Default Text",
        type: "group",
      })
      .select();

    if (data && data.length > 0) {
      const newNoteId = data[0].id;
      router.push(`/GroupNote/${newNoteId}`);
    }
    if (!error) {
      setRefresh((prev) => !prev);
    }
  }
  async function DeleteNotes(note: Notes, id: number) {
    const noteID = user?.id || GuestId;
    if (!noteID) return;
    const { error } = await supabase.from("Trash").insert({
      user_id: noteID,
      Name: note.Name,
      Text: note.Text,
    });

    const { data } = await supabase
      .from("Notes")
      .delete()
      .select("*")
      .eq("id", id);

    if (data) console.log(data);
    if (!error) {
      setRefresh((prev) => !prev);
    }
  }

  async function JoinGroup(noteId: string) {
    const { data: noteData, error: fetchError } = await supabase
      .from("Notes")
      .select("*")
      .eq("id", noteId)
      .eq("type", "group")
      .single();

    if (fetchError || !noteData) {
      alert("Note not found!");
      return;
    }
    const { data, error } = await supabase
      .from("Notes")
      .update({ members: (noteData.members || 0) + 1 })
      .eq("id", noteId);

    if (!error) {
      setRefresh((prev) => !prev);
      router.push(`/GroupNote/${noteId}`);
    }
  }

  return (
    <div>
      <div className="md:hidden flex flex-col items-center justify-start text-neutral-300">
        <div className="flex items-center w-full justify-center sticky top-0 bg-neutral-900 z-10 py-5">
          <div className="absolute left-5 cursor-pointer">
            {join ? (
              <div className="flex flex-col items-center gap-1">
                <div onClick={() => setJoin(!join)}>Back</div>
                <input
                  className="outline-0 border w-20 border-neutral-700 rounded-xl h-8 text-center text-sm"
                  placeholder="Note ID"
                  value={joining}
                  onChange={(e) => setJoining(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      await JoinGroup(joining);
                    }
                  }}
                />
              </div>
            ) : (
              <div onClick={() => setJoin(!join)}>Join</div>
            )}
          </div>
          <div className="text-2xl">Today</div>
          <div className="relative">
            <div
              onClick={() => setOpen(!open)}
              className={`cursor-pointer transition-transform duration-300  ${
                open ? "rotate-90" : "hover:rotate-45"
              } hover:scale-110 active:scale-100 border border-amber-500 w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center ml-10`}
            >
              <Plus size={20} />
            </div>
            {open && (
              <div className="border border-amber-500 bg-amber-500 absolute top-12 -left-2 p-2 rounded-lg w-35 flex flex-col gap-3 items-center text-white text-md">
                <div
                  onClick={ADDGroupNotes}
                  className="cursor-pointer border border-amber-600 py-2 w-full text-center  bg-amber-600 rounded-xl"
                >
                  Group Notes
                </div>
                <div
                  className="cursor-pointer border border-amber-600 py-2 w-full text-center  bg-amber-600 rounded-xl"
                  onClick={ADDNotes}
                >
                  Notes
                </div>
              </div>
            )}
          </div>
          <Link href="/Trash" className="absolute right-5">
            <div>
              {trashs && trashs.length > 0 && (
                <div>
                  <div>Trash</div>
                </div>
              )}
            </div>
          </Link>
        </div>
        <div>
          <div>
            {notes && notes.length === 0 ? (
              <div className="mt-10 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  Notes is Empty <Notebook size={15} />,
                </div>
                <div
                  className="underline hover:text-neutral-300 transition-colors cursor-pointer"
                  onClick={ADDNotes}
                >
                  Add Here
                </div>
              </div>
            ) : (
              <div className="mt-10 flex-1 flex flex-col items-center gap-5">
                {notes
                  ?.filter((note) => note.type === "private")
                  ?.map((note) => (
                    <div key={note.id}>
                      <div className="relative flex flex-col gap-5 border border-neutral-900 bg-neutral-900 p-2 w-70 rounded-xl text-white">
                        <div className="flex items-center justify-start">
                          <div className="flex items-center justify-center gap-5 text-amber-400">
                            <FileText size={20} />
                            <div>Private Notes</div>
                          </div>
                        </div>
                        <div className="text-center border border-amber-500 py-2 bg-amber-500 rounded-xl">
                          {note.Name}
                        </div>
                        <div className="text-center">
                          {note.Text.slice(0, 25)}...
                        </div>
                        <div className="flex items-center justify-between gap-3 ml-2 mr-2">
                          <Link href={`/Note/${note.id}`}>
                            <div className="border border-amber-500 bg-amber-500 hover:border-neutral-600 hover:bg-amber-600 transition-all p-2 rounded-full">
                              View
                            </div>
                          </Link>
                          <div
                            className="border border-red-400 bg-red-400 p-2 rounded-full hover:bg-red-500 hover:border-red-500 transition-all cursor-pointer"
                            onClick={() => DeleteNotes(note, note.id)}
                          >
                            <Trash size={20} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                {notes
                  ?.filter((note) => note.type === "group")
                  ?.map((note) => (
                    <div key={note.id}>
                      <div
                        style={{
                          backgroundColor: color[note.id] || "#171717",
                        }}
                        className="relative flex flex-col gap-5 border border-neutral-900 p-2 w-70 rounded-xl text-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center justify-center gap-5 text-amber-400">
                            <FileText size={20} />
                            <div>Group Notes</div>
                          </div>
                          <div className="relative">
                            <div
                              className="w-6 h-6 rounded-full border border-neutral-600 cursor-pointer"
                              style={{ backgroundColor: color[note.id] }}
                              onClick={() =>
                                setShow((prev) =>
                                  prev === note.id ? null : note.id
                                )
                              }
                            ></div>
                            {show === note.id && (
                              <div className="absolute right-0 top-8 z-50 grid grid-cols-5 gap-2 bg-neutral-800 p-3 rounded-xl w-max">
                                {colors.map((c) => (
                                  <div
                                    key={c}
                                    onClick={() =>
                                      setColor((prev) => ({
                                        ...prev,
                                        [note.id]: c,
                                      }))
                                    }
                                    className="w-7 h-7 rounded-full cursor-pointer border border-neutral-700"
                                    style={{ backgroundColor: c }}
                                  ></div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-center border border-amber-500 py-2 bg-amber-500 rounded-xl">
                          {note.Name}
                        </div>
                        <div className="text-center">
                          {note.Text.slice(0, 25)}...
                        </div>
                        <div className="flex items-center justify-between gap-3 ml-2 mr-2">
                          <Link href={`/GroupNote/${note.id}`}>
                            <div className="border border-amber-500 bg-amber-500 hover:border-neutral-600 hover:bg-amber-600 transition-all p-2 rounded-full">
                              View
                            </div>
                          </Link>
                          <div
                            className="border border-red-400 bg-red-400 p-2 rounded-full hover:bg-red-500 hover:border-red-500 transition-all cursor-pointer"
                            onClick={() => DeleteNotes(note, note.id)}
                          >
                            <Trash size={20} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="md:flex hidden flex-col items-center justify-start text-neutral-300">
        <div className="flex items-center w-full justify-center sticky top-0 bg-neutral-900 z-10 py-5">
          <div className="absolute left-5 cursor-pointer">
            {join ? (
              <div className="flex items-center gap-5">
                <div onClick={() => setJoin(!join)}>Back</div>
                <input
                  className="outline-0 border w-20 border-neutral-700 rounded-xl h-8 text-center text-sm"
                  placeholder="Note ID"
                  value={joining}
                  onChange={(e) => setJoining(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      await JoinGroup(joining);
                    }
                  }}
                />
              </div>
            ) : (
              <div onClick={() => setJoin(!join)}>Join</div>
            )}
          </div>
          <Link href="/">
            <div className="text-2xl">Today</div>
          </Link>
          <div className="relative">
            <div
              onClick={() => setOpen(!open)}
              className={`cursor-pointer transition-transform duration-300  ${
                open ? "rotate-90" : "hover:rotate-45"
              } hover:scale-110 active:scale-100 border border-amber-500 w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center ml-10`}
            >
              <Plus size={20} />
            </div>
            {open && (
              <div className="border border-amber-500 bg-amber-500 absolute top-12 -left-2 p-2 rounded-lg w-35 flex flex-col gap-3 items-center text-white text-md">
                <div
                  onClick={ADDGroupNotes}
                  className="cursor-pointer border border-amber-600 py-2 w-full text-center  bg-amber-600 rounded-xl"
                >
                  Group Notes
                </div>
                <div
                  className="cursor-pointer border border-amber-600 py-2 w-full text-center  bg-amber-600 rounded-xl"
                  onClick={ADDNotes}
                >
                  Notes
                </div>
              </div>
            )}
          </div>
          <Link href="/Trash" className="absolute right-5">
            <div>
              {trashs && trashs.length > 0 && (
                <div>
                  <div>Trash</div>
                </div>
              )}
            </div>
          </Link>
        </div>
        <div>
          <div>
            {notes && notes.length === 0 ? (
              <div className="mt-10 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  Notes is Empty <Notebook size={15} />,
                </div>
                <div
                  className="underline hover:text-neutral-300 transition-colors cursor-pointer"
                  onClick={ADDNotes}
                >
                  Add Here
                </div>
              </div>
            ) : (
              <div className="w-150 mt-10 flex-1 grid grid-cols-2 gap-5">
                {notes
                  ?.filter((note) => note.type === "private")
                  ?.map((note) => (
                    <div key={note.id}>
                      <div className="relative flex flex-col gap-5 border border-neutral-900 bg-neutral-900 p-2 w-70 rounded-xl text-white">
                        <div className="flex items-center justify-start">
                          <div className="flex items-center justify-center gap-5 text-amber-400">
                            <FileText size={20} />
                            <div>Private Notes</div>
                          </div>
                        </div>
                        <div className="text-center border border-amber-500 py-2 bg-amber-500 rounded-xl">
                          {note.Name}
                        </div>
                        <div className="text-center">
                          {note.Text.slice(0, 25)}...
                        </div>
                        <div className="flex items-center justify-between gap-3 ml-2 mr-2">
                          <Link href={`/Note/${note.id}`}>
                            <div className="border border-amber-500 bg-amber-500 hover:border-neutral-600 hover:bg-amber-600 transition-all p-2 rounded-full">
                              View
                            </div>
                          </Link>
                          <div
                            className="border border-red-400 bg-red-400 p-2 rounded-full hover:bg-red-500 hover:border-red-500 transition-all cursor-pointer"
                            onClick={() => DeleteNotes(note, note.id)}
                          >
                            <Trash size={20} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                {notes
                  ?.filter((note) => note.type === "group")
                  ?.map((note) => {
                    const noteID = user?.id || GuestId;
                    const isOwner = note.owner_id === noteID;

                    return (
                      <div key={note.id}>
                        <div
                          style={{
                            backgroundColor: color[note.id] || "#171717",
                          }}
                          className="relative flex flex-col gap-5 border border-neutral-900 p-2 w-70 rounded-xl text-white"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center justify-center gap-5 text-amber-400">
                              <FileText size={20} />
                              <div>Group Notes</div>
                            </div>
                            <div className="relative">
                              <div
                                className="w-6 h-6 rounded-full border border-neutral-600 cursor-pointer"
                                style={{ backgroundColor: color[note.id] }}
                                onClick={() =>
                                  setShow((prev) =>
                                    prev === note.id ? null : note.id
                                  )
                                }
                              ></div>
                              {show === note.id && (
                                <div className="absolute left-9 top-0 z-50 grid grid-cols-5 gap-2 bg-neutral-800 p-3 rounded-xl w-max">
                                  {colors.map((c) => (
                                    <div
                                      key={c}
                                      onClick={() =>
                                        setColor((prev) => ({
                                          ...prev,
                                          [note.id]: c,
                                        }))
                                      }
                                      className="w-7 h-7 rounded-full cursor-pointer border border-neutral-700"
                                      style={{ backgroundColor: c }}
                                    ></div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-center border border-amber-500 py-2 bg-amber-500 rounded-xl">
                            {note.Name}
                          </div>
                          <div className="text-center">
                            {note.Text.slice(0, 25)}...
                          </div>
                          <div className="flex items-center justify-between gap-3 ml-2 mr-2">
                            <Link href={`/GroupNote/${note.id}`}>
                              <div className="border border-amber-500 bg-amber-500 hover:border-neutral-600 hover:bg-amber-600 transition-all p-2 rounded-full">
                                View
                              </div>
                            </Link>
                            {isOwner && (
                              <div
                                className="border border-red-400 bg-red-400 p-2 rounded-full hover:bg-red-500 hover:border-red-500 transition-all cursor-pointer"
                                onClick={() => DeleteNotes(note, note.id)}
                              >
                                <Trash size={20} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
