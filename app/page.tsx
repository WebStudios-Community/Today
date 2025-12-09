"use client";

import { Notebook, Plus, Trash } from "lucide-react";
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

  return (
    <div>
      <div className="md:hidden flex flex-col items-center justify-start text-neutral-300">
        <div className="flex items-center w-full justify-center sticky top-0 bg-neutral-900 z-10 py-5">
          <div className="text-2xl">Today</div>
          <div
            onClick={ADDNotes}
            className="cursor-pointer transition-transform duration-300 hover:rotate-45 hover:scale-110 active:scale-100 border border-amber-400 w-10 h-10 bg-amber-400 text-neutral-600 rounded-xl flex items-center justify-center ml-10"
          >
            <Plus size={20} />
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
              <div className="mt-10">
                <div className="grid grid-cols-1 gap-5">
                  {notes?.map((note) => (
                    <div key={note.id}>
                      <div className="relative flex flex-col gap-5 border border-neutral-800 bg-neutral-800 p-2 w-70 rounded-xl">
                        <div className="text-center border border-neutral-700 py-2 bg-neutral-700 rounded-xl">
                          {note.Name}
                        </div>
                        <div className="text-center">
                          {note.Text.slice(0, 25)}...
                        </div>
                        <div className="flex items-center justify-between gap-3 ml-2 mr-2">
                          <Link href={`/Note/${note.id}`}>
                            <div>View</div>
                          </Link>
                          <div
                            className="hover:text-red-500 transition-all cursor-pointer"
                            onClick={() => DeleteNotes(note, note.id)}
                          >
                            <Trash size={20} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="md:flex hidden flex-col items-center justify-start text-neutral-300">
        <div className="flex items-center w-full justify-center sticky top-0 bg-neutral-900 z-10 py-5">
          <Link href="/">
            <div className="text-2xl">Today</div>
          </Link>
          <div
            onClick={ADDNotes}
            className="cursor-pointer transition-transform duration-300 hover:rotate-45 hover:scale-110 active:scale-100 border border-amber-500 w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center ml-10"
          >
            <Plus size={20} />
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
              <div className="w-150 mt-10 flex-1">
                <div className="grid grid-cols-2 gap-5">
                  {notes?.map((note) => (
                    <div key={note.id}>
                      <div className="relative flex flex-col gap-5 border border-neutral-800 bg-neutral-800 p-2 w-70 rounded-xl">
                        <div className="text-center border border-neutral-700 py-2 bg-neutral-700 rounded-xl">
                          {note.Name}
                        </div>
                        <div className="text-center">
                          {note.Text.slice(0, 25)}...
                        </div>
                        <div className="flex items-center justify-between gap-3 ml-2 mr-2">
                          <Link href={`/Note/${note.id}`}>
                            <div>View</div>
                          </Link>
                          <div
                            className="hover:text-red-500 transition-all cursor-pointer"
                            onClick={() => DeleteNotes(note, note.id)}
                          >
                            <Trash size={20} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
