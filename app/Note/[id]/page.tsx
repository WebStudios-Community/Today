"use client";

import { supabase } from "@/app/supabaseClient";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface Notes {
  id: number;
  created_at: Date;
  Name: string;
  Text: string;
}

export default function Notes({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [notes, setNotes] = useState<Notes[] | null>(null);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [under, setUnder] = useState(false);
  const [strike, setStrike] = useState(false);
  const [vere, setVere] = useState("");

  useEffect(() => {
    const getNotes = async () => {
      const { data } = await supabase.from("Notes").select("*").eq("id", id);

      setNotes(data);
    };

    getNotes();
  }, []);

  async function SaveNotes(note: Notes) {
    const { data, error } = await supabase
      .from("Notes")
      .update({
        id: note.id,
        Name: note.Name,
        Text: note.Text,
      })
      .eq("id", id);

    if (error) console.log(error);
    if (data) console.log(data);

    router.push("/");
  }

  return (
    <div className="text-neutral-400">
      <div>
        <div className="m-5">
          <Link href="/">Home</Link>
        </div>
        <div>
          {notes?.map((note, i) => (
            <div key={note.id}>
              <div className="m-10 flex flex-col gap-10">
                <input
                  className="text-2xl border-transparent outline-0 py-5 pl-5 rounded-4xl"
                  value={note.Name}
                  onChange={(e) => {
                    setNotes((prev) => {
                      if (!prev) return prev;

                      const updated = [...prev];
                      updated[i] = {
                        ...updated[i],
                        Name: e.target.value,
                      };

                      return updated;
                    });
                  }}
                  placeholder="Note Name"
                />
                <div className="flex items-center justify-between">
                  <div>
                    {new Date(note.created_at).toLocaleString("sr-RS", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`${
                        bold
                          ? "bg-neutral-800 border border-neutral-800 w-8 h-8 rounded-xl text-sm scale-120"
                          : "border border-neutral-800 w-8 h-8 rounded-xl text-sm"
                      } flex items-center justify-center cursor-pointer`}
                      onClick={() => setBold(!bold)}
                    >
                      B
                    </div>
                    <div
                      className={`${
                        italic
                          ? "bg-neutral-800 border border-neutral-800 w-8 h-8 rounded-xl text-sm scale-120 italic"
                          : "border border-neutral-800 w-8 h-8 rounded-xl text-sm"
                      } flex items-center justify-center cursor-pointer`}
                      onClick={() => setItalic(!italic)}
                    >
                      i
                    </div>
                    <div
                      className={`${
                        under
                          ? "bg-neutral-800 border border-neutral-800 w-8 h-8 rounded-xl text-sm scale-120 underline"
                          : "border border-neutral-800 w-8 h-8 rounded-xl text-sm"
                      } flex items-center justify-center cursor-pointer`}
                      onClick={() => {
                        if (strike) setStrike(false);
                        setUnder(!under);
                      }}
                    >
                      U
                    </div>
                    <div
                      className={`${
                        strike
                          ? "bg-neutral-800 border border-neutral-800 w-8 h-8 rounded-xl text-sm scale-120 line-through"
                          : "border border-neutral-800 w-8 h-8 rounded-xl text-sm"
                      } flex items-center justify-center cursor-pointer`}
                      onClick={() => {
                        if (under) setUnder(false);
                        setStrike(!strike);
                      }}
                    >
                      S
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`${
                          vere === "left"
                            ? "bg-neutral-800 border border-neutral-800 w-8 h-8 rounded-xl text-sm scale-120 line-through"
                            : "border border-neutral-800 w-8 h-8 rounded-xl text-sm"
                        } flex items-center justify-center cursor-pointer`}
                        onClick={() => setVere("left")}
                      >
                        <AlignLeft size={15} />
                      </div>
                      <div
                        className={`${
                          vere === "center"
                            ? "bg-neutral-800 border border-neutral-800 w-8 h-8 rounded-xl text-sm scale-120 line-through"
                            : "border border-neutral-800 w-8 h-8 rounded-xl text-sm"
                        } flex items-center justify-center cursor-pointer`}
                        onClick={() => setVere("center")}
                      >
                        <AlignCenter size={15} />
                      </div>
                      <div
                        className={`${
                          vere === "right"
                            ? "bg-neutral-800 border border-neutral-800 w-8 h-8 rounded-xl text-sm scale-120 line-through"
                            : "border border-neutral-800 w-8 h-8 rounded-xl text-sm"
                        } flex items-center justify-center cursor-pointer`}
                        onClick={() => setVere("right")}
                      >
                        <AlignRight size={15} />
                      </div>
                    </div>
                  </div>
                </div>
                <textarea
                  contentEditable
                  className={`border-transparent outline-0 py-5 pl-5 rounded-xl h-80 resize-none ${
                    bold ? "text-2xl" : "text-xl"
                  } ${italic && "italic"} ${under && "underline"} ${
                    strike && "line-through"
                  } ${vere === "left" && "text-start"} ${
                    vere === "center" && "text-center"
                  } ${vere === "right" && "text-end"}`}
                  value={note.Text}
                  onChange={(e) => {
                    setNotes((prev) => {
                      if (!prev) return prev;

                      const updated = [...prev];
                      updated[i] = {
                        ...updated[i],
                        Text: e.target.value,
                      };

                      return updated;
                    });
                  }}
                  placeholder="Note Text"
                />
                <div className="flex items-center justify-end">
                  <div
                    onClick={() => SaveNotes(note)}
                    className="text-xl border border-neutral-800 w-40 flex items-center justify-center py-4 rounded-xl hover:bg-neutral-800 hover:scale-110 active:scale-100 transition-all cursor-pointer"
                  >
                    <div>Saved</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
