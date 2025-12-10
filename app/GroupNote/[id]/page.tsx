"use client";

import { useGuestID } from "@/app/GuestID";
import { supabase } from "@/app/supabaseClient";
import { User } from "@supabase/supabase-js";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  User2,
  UserRoundPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface Notes {
  id: number;
  user_id: string;
  created_at: Date;
  Name: string;
  Text: string;
  bold: boolean;
  italic: boolean;
  under: boolean;
  strike: boolean;
  vere: string;
  type: string;
  members: number;
  owner_id: string;
  member_id: string[];
}

export default function Notes({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [notes, setNotes] = useState<Notes[] | null>(null);
  const [note, setNote] = useState<Notes | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [under, setUnder] = useState(false);
  const [strike, setStrike] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [show, setShow] = useState(false);
  const [vere, setVere] = useState("left");
  const GuestId = useGuestID();
  const noteID = user?.id || GuestId || "";

  useEffect(() => {
    const getNotes = async () => {
      const { data } = await supabase
        .from("Notes")
        .select("*")
        .eq("id", id)
        .eq("type", "group");

      const note = data?.[0];

      setNotes(data);
      setBold(note?.bold ?? false);
      setItalic(note?.italic ?? false);
      setUnder(note?.under ?? false);
      setStrike(note?.strike ?? false);
      setVere(note?.vere ?? "left");
    };

    getNotes();
  }, [refresh, id]);
  useEffect(() => {
    if (!note?.id) return;

    const addMember = async () => {
      const noteID = user?.id || GuestId;
      if (!noteID) return;
      const updatedMembers = note.member_id
        ? [...note.member_id, noteID]
        : [noteID];
      await supabase
        .from("Notes")
        .update({ members: updatedMembers.length, member_id: updatedMembers })
        .eq("id", note.id);

      setRefresh((prev) => !prev);
    };

    addMember();
  }, [note?.id, refresh]);
  useEffect(() => {
    const GetUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    GetUser();
  });

  async function SaveNotes(note: Notes) {
    const { data, error } = await supabase
      .from("Notes")
      .update({
        Name: note.Name,
        Text: note.Text,
        bold: bold,
        italic: italic,
        under: under,
        strike: strike,
        vere: vere,
      })
      .eq("id", note.id)
      .eq("type", "group");

    if (data) console.log(data);
    if (error) {
      console.log(error);
    }
    setRefresh((prev) => !prev);
  }

  async function InviteUser(note: Notes) {
    const noteID = user?.id || GuestId;
    if (!noteID) return;
    const { data, error } = await supabase
      .from("Notes")
      .update({
        owner_id: noteID,
      })
      .eq("id", note.id)
      .eq("user_id", noteID)
      .eq("type", "group");
    if (!error) {
      setRefresh((prev) => !prev);
    }
    if (data) console.log(data);
    navigator.clipboard.writeText(`${note.id}`);
    alert(`Copied to clipboard! id: ${note.id}`);
  }

  return (
    <div className="text-neutral-400">
      <div className="md:hidden flex flex-col items-center justify-center p-4 bg-neutral-900 min-h-screen">
        <div className="m-5">
          <Link href="/">Home</Link>
        </div>
        {notes?.map((note, i) => (
          <div
            key={note.id}
            className="w-full mb-8 bg-neutral-800 rounded-2xl p-4 shadow-lg"
          >
            <div className="relative">
              <div
                onClick={() => setShow(!show)}
                className="flex items-center gap-2 cursor-pointer m-5"
              >
                <User2 size={20} />
                <div>{note.members || 0}</div>
              </div>
            </div>
            <input
              className="w-full text-xl md:text-2xl outline-none py-3 px-4 rounded-lg mb-4 bg-neutral-700 text-white placeholder:text-neutral-400"
              value={note.Name}
              onChange={(e) => {
                setNotes((prev) => {
                  if (!prev) return prev;
                  const updated = [...prev];
                  updated[i] = { ...updated[i], Name: e.target.value };
                  return updated;
                });
              }}
              placeholder="Note Name"
            />
            <div className="text-sm text-neutral-400 mb-4 text-right">
              {new Date(note.created_at).toLocaleString("sr-RS", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </div>
            <div className="flex flex-wrap gap-3 mb-4 justify-center">
              <button
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                  bold ? "bg-amber-500" : "bg-neutral-700"
                }`}
                onClick={() => setBold(!bold)}
              >
                B
              </button>
              <button
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                  italic ? "bg-amber-500" : "bg-neutral-700"
                } italic`}
                onClick={() => setItalic(!italic)}
              >
                i
              </button>
              <button
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                  under ? "bg-amber-500" : "bg-neutral-700"
                }`}
                onClick={() => {
                  if (strike) setStrike(false);
                  setUnder(!under);
                }}
              >
                U
              </button>
              <button
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                  strike ? "bg-amber-500" : "bg-neutral-700"
                }`}
                onClick={() => {
                  if (under) setUnder(false);
                  setStrike(!strike);
                }}
              >
                S
              </button>
              <div className="flex gap-2">
                <button
                  className={`w-10 h-10 flex items-center justify-center text-white rounded-lg ${
                    vere === "left" ? "bg-amber-500" : "bg-neutral-700"
                  }`}
                  onClick={() => setVere("left")}
                >
                  <AlignLeft size={16} />
                </button>
                <button
                  className={`w-10 h-10 flex items-center justify-center text-white rounded-lg ${
                    vere === "center" ? "bg-amber-500" : "bg-neutral-700"
                  }`}
                  onClick={() => setVere("center")}
                >
                  <AlignCenter size={16} />
                </button>
                <button
                  className={`w-10 h-10 flex items-center justify-center text-white rounded-lg ${
                    vere === "right" ? "bg-amber-500" : "bg-neutral-700"
                  }`}
                  onClick={() => setVere("right")}
                >
                  <AlignRight size={16} />
                </button>
              </div>
            </div>
            <textarea
              className={`w-full h-48 p-3 rounded-lg resize-none outline-none bg-neutral-700 text-white ${
                bold ? "text-2xl" : "text-xl"
              } ${italic && "italic"} ${under && "underline"} ${
                strike && "line-through"
              } ${vere === "left" && "text-left"} ${
                vere === "center" && "text-center"
              } ${vere === "right" && "text-right"}`}
              value={note.Text}
              onChange={(e) => {
                setNotes((prev) => {
                  if (!prev) return prev;
                  const updated = [...prev];
                  updated[i] = { ...updated[i], Text: e.target.value };
                  return updated;
                });
              }}
              placeholder="Note Text"
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => InviteUser(note)}
                className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition-transform"
              >
                <UserRoundPlus size={20} />
              </button>
              <button
                onClick={() => SaveNotes(note)}
                className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition-transform"
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="md:flex hidden">
        <div className="m-5">
          <Link href="/">Home</Link>
        </div>
        <div className="flex items-center justify-center w-full h-screen">
          {notes
            ?.filter(
              (note) =>
                note.type === "group" &&
                (note.owner_id === noteID || note.member_id?.includes(noteID))
            )
            ?.map((note, i) => {
              const noteID = user?.id || GuestId;
              const isOwner = note.owner_id === noteID;

              return (
                <div key={note.id} className="px-4 mb-8">
                  <div className="flex flex-col gap-6 w-full border border-neutral-800 bg-neutral-800 px-10 py-10 rounded-xl">
                    <div className="relative">
                      <div
                        onClick={() => setShow(!show)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <User2 size={20} />
                        <div>{note.members || 0}</div>
                      </div>
                    </div>
                    <input
                      className="w-120 text-xl py-4 px-5 rounded-2xl outline-none border border-neutral-700 bg-neutral-700 text-white placeholder:text-neutral-400"
                      value={note.Name}
                      onChange={(e) => {
                        setNotes((prev) => {
                          if (!prev) return prev;
                          const updated = [...prev];
                          updated[i] = { ...updated[i], Name: e.target.value };
                          return updated;
                        });
                      }}
                      placeholder="Note Name"
                    />
                    <div className="text-sm text-neutral-400 text-right">
                      {new Date(note.created_at).toLocaleString("sr-RS", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white cursor-pointer ${
                          bold ? "bg-amber-500 text-black" : "bg-neutral-700"
                        }`}
                        onClick={() => setBold(!bold)}
                      >
                        B
                      </div>
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white cursor-pointer ${
                          italic
                            ? "bg-amber-500 italic text-black"
                            : "bg-neutral-700"
                        }`}
                        onClick={() => setItalic(!italic)}
                      >
                        i
                      </div>
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white cursor-pointer ${
                          under
                            ? "bg-amber-500 underline text-black"
                            : "bg-neutral-700"
                        }`}
                        onClick={() => {
                          if (strike) setStrike(false);
                          setUnder(!under);
                        }}
                      >
                        U
                      </div>
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white cursor-pointer ${
                          strike
                            ? "bg-amber-500 line-through text-black"
                            : "bg-neutral-700"
                        }`}
                        onClick={() => {
                          if (under) setUnder(false);
                          setStrike(!strike);
                        }}
                      >
                        S
                      </div>
                      <div className="flex gap-2">
                        <button
                          className={`w-10 h-10 flex items-center justify-center text-white rounded-lg ${
                            vere === "left" ? "bg-amber-500" : "bg-neutral-700"
                          }`}
                          onClick={() => setVere("left")}
                        >
                          <AlignLeft size={16} />
                        </button>
                        <button
                          className={`w-10 h-10 flex items-center justify-center text-white rounded-lg ${
                            vere === "center"
                              ? "bg-amber-500"
                              : "bg-neutral-700"
                          }`}
                          onClick={() => setVere("center")}
                        >
                          <AlignCenter size={16} />
                        </button>
                        <button
                          className={`w-10 h-10 flex items-center justify-center text-white rounded-lg ${
                            vere === "right" ? "bg-amber-500" : "bg-neutral-700"
                          }`}
                          onClick={() => setVere("right")}
                        >
                          <AlignRight size={16} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      className={`w-full h-48 p-5 rounded-2xl resize-none outline-none border border-neutral-700 bg-neutral-700 text-white placeholder:text-neutral-400 ${
                        bold ? "text-xl" : "text-lg"
                      } ${italic && "italic"} ${under && "underline"} ${
                        strike && "line-through"
                      } ${vere === "left" && "text-left"} ${
                        vere === "center" && "text-center"
                      } ${vere === "right" && "text-right"}`}
                      value={note.Text}
                      onChange={(e) => {
                        setNotes((prev) => {
                          if (!prev) return prev;
                          const updated = [...prev];
                          updated[i] = { ...updated[i], Text: e.target.value };
                          return updated;
                        });
                      }}
                      placeholder="Note Text"
                    />
                    <div className="mt-4 flex justify-between">
                      {isOwner && (
                        <button
                          onClick={() => InviteUser(note)}
                          className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-all cursor-pointer"
                        >
                          <UserRoundPlus size={20} />
                        </button>
                      )}
                      <button
                        onClick={() => SaveNotes(note)}
                        className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-all cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
