"use client";

import { Notebook, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Link from "next/link";

interface Notes {
  id: number;
  Name: string;
  Text: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Notes[] | null>(null);

  useEffect(() => {
    const getNotes = async () => {
      const { data } = await supabase.from("Notes").select("*");

      setNotes(data);
    };

    getNotes();
  });

  async function ADDNotes() {
    const { data, error } = await supabase.from("Notes").insert({
      Name: "Default Name",
      Text: "Ovo je primer teksta koji ide u belešku.",
    });

    if (data) console.log(data);
    if (error) console.log(error);
  }
  async function DeleteNotes(id: number) {
    const { data, error } = await supabase
      .from("Notes")
      .delete()
      .select("*")
      .eq("id", id);

    if (data) console.log(data);
    if (error) console.log(error);
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-start text-neutral-400">
        <div className="flex items-center w-full justify-center sticky top-0 bg-neutral-900 z-10 py-5">
          <div className="text-2xl">Today</div>
          <div
            onClick={ADDNotes}
            className="cursor-pointer transition-transform duration-300 hover:rotate-45 hover:scale-110 active:scale-100 border border-amber-400 w-10 h-10 bg-amber-400 text-neutral-600 rounded-xl flex items-center justify-center ml-10"
          >
            <Plus size={20} />
          </div>
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
                        <div>{note.Name}</div>
                        <div>{note.Text.slice(0, 25)}...</div>
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/Note/${note.id}`}>
                            <div>View</div>
                          </Link>
                          <div
                            className="hover:text-red-500 transition-all cursor-pointer"
                            onClick={() => DeleteNotes(note.id)}
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
