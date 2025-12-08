"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/supabaseClient";
import { Trash2, UndoDot } from "lucide-react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { useGuestID } from "../GuestID";

interface Trash {
  id: number;
  Name: string;
  Text: string;
}

interface Notes {
  id: number;
  Name: string;
  Text: string;
}

export default function Trash() {
  const [trashNotes, setTrashNotes] = useState<Trash[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const GuestId = useGuestID();

  useEffect(() => {
    const fetchTrashNotes = async () => {
      const noteID = user?.id || GuestId;
      if (!noteID) return;
      const { data } = await supabase
        .from("Trash")
        .select("*")
        .eq("user_id", noteID);
      setTrashNotes(data);
    };

    fetchTrashNotes();
  });

  useEffect(() => {
    const GetUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    GetUser();
  });

  async function DeleteNotes(id: number) {
    const { data, error } = await supabase
      .from("Trash")
      .delete()
      .select("*")
      .eq("id", id);

    if (data) console.log(data);
    if (error) console.log(error);
  }

  async function BackNotes(note: Notes, id: number) {
    const noteID = user?.id || GuestId;
    if (!noteID) return;
    const { error } = await supabase
      .from("Trash")
      .delete()
      .select("*")
      .eq("id", id);

    const { data } = await supabase
      .from("Notes")
      .insert({
        user_id: GuestId,
        Name: note.Name,
        Text: note.Text,
      })
      .eq("id", note.id);

    if (data) console.log(data);
    if (error) console.log(error);
  }

  return (
    <div className="p-4 text-white">
      <Link href="/">
        <div>Home</div>
      </Link>
      <h1 className="text-2xl font-bold mb-4 ml-10 mt-10">Trash</h1>
      <div className="flex flex-col gap-2">
        {trashNotes && trashNotes.length > 0 ? (
          <div className="flex flex-col gap-5">
            {trashNotes?.map((note) => (
              <div
                key={note.id}
                className="border border-neutral-900 p-3 rounded-xl bg-neutral-900 text-white flex items-center justify-between"
              >
                <div>
                  <h2 className="font-bold">{note.Name}</h2>
                  <p>{note.Text}</p>
                </div>
                <div className="flex items-center justify-end gap-5 mr-5">
                  <UndoDot size={20} onClick={() => BackNotes(note, note.id)} />
                  <Trash2 size={20} onClick={() => DeleteNotes(note.id)} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="m-5 text-xl ml-10">Trash is Empty!</div>
        )}
      </div>
    </div>
  );
}
