import { collections } from "@/lib/db/mongodb";
import { getAdmin } from "@/lib/server/admin";
import { json, serverError } from "@/lib/server/http";

// Quote every cell and neutralise leading formula characters so spreadsheets don't execute them.
function cell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Newsletter subscribers as CSV. */
export async function GET() {
  try {
    if (!(await getAdmin())) return json({ error: "Admin access required." }, 403);
    const { newsletterSubscribers } = await collections();
    const rows = await newsletterSubscribers.find({}).sort({ createdAt: -1 }).toArray();
    const csv = [["Email", "Source", "Subscribed"].map(cell).join(","),
      ...rows.map((row) => [row.email, row.source, row.createdAt.toISOString()].map(cell).join(","))].join("\r\n");
    return new Response(`﻿${csv}\r\n`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return serverError(error, "Subscriber export");
  }
}
