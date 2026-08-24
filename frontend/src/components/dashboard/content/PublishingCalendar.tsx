"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePostsStore } from "@/store/usePostsStore";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PublishingCalendar({
  basePath,
}: {
  basePath: string;
}) {
  const posts = usePostsStore((s) => s.posts).filter((p) => p.status === "scheduled");
  const fetchPosts = usePostsStore((s) => s.fetchPosts);
  // Default cursor to current calendar month.
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    fetchPosts({ status: "scheduled" });
  }, [fetchPosts]);

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { date: string | null; day: number | null }[] = [];
    for (let i = 0; i < firstDay; i++) cells.push({ date: null, day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ date, day: d });
    }
    return cells;
  }, [cursor]);

  function postsOn(date: string | null) {
    if (!date) return [];
    return posts.filter((p) => p.scheduledDate === date);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-bold">{monthLabel}</p>
        <div className="flex gap-1">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="border border-border p-1.5 hover:bg-surface"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="border border-border p-1.5 hover:bg-surface"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-px border border-border bg-border text-xs">
        {WEEKDAYS.map((w) => (
          <div key={w} className="bg-surface py-2 text-center font-mono text-muted">
            {w}
          </div>
        ))}
        {days.map((cell, i) => {
          const dayPosts = postsOn(cell.date);
          return (
            <div key={i} className="min-h-[90px] bg-background p-1.5">
              {cell.day ? (
                <>
                  <span className="text-muted">{cell.day}</span>
                  <div className="mt-1 space-y-1">
                    {dayPosts.map((p) => (
                      <Link
                        key={p.id}
                        href={`${basePath}/${p.id}/edit`}
                        className="block truncate bg-ink px-1.5 py-0.5 text-[10px] text-background hover:bg-ink/80"
                      >
                        {p.scheduledTime} · {p.caption}
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
