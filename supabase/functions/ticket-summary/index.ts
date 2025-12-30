// @ts-nocheck
// Edge Function Deno - VS Code ignore TypeScript errors

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      }
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { ticket_id, reason = "manual" } = await req.json();

    if (!ticket_id) {
      return new Response(JSON.stringify({ error: "ticket_id required" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" }
      });
    }

    // Récup ticket
    const { data: ticket, error: ticketErr } = await supabase
      .from("tickets")
      .select("id, title, description, status, priority")
      .eq("id", ticket_id)
      .single();

    if (ticketErr || !ticket) {
      return new Response(JSON.stringify({ error: "Ticket not found" }), { 
        status: 404, 
        headers: { "Content-Type": "application/json" }
      });
    }

    // Récup messages
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("sender, message_text")
      .eq("ticket_id", ticket_id)
      .order("created_at", { ascending: true })
      .limit(20);

    const safeMessages = messages ?? [];
    const conversation = safeMessages.slice(-8)
      .map((m: any) => `${m.sender}: ${m.message_text?.substring(0, 100)}`)
      .join("\n");

    // Résumé structuré
    const summary = `**🚨 Problème:** ${ticket.title}
**🎯 Priorité:** ${ticket.priority || "Moyenne"}
**📝 Description:** ${ticket.description?.substring(0, 120) || "N/A"}
**💬 Conversation (${safeMessages.length} msg):**
${conversation || "Aucune"}
**📊 Statut:** ${ticket.status}`;

    const cleanSummary = summary.trim().substring(0, 800);

    // Sauvegarde
    await supabase.from("tickets").update({
      summary: cleanSummary,
      summary_updated_at: new Date().toISOString(),
    }).eq("id", ticket_id);

    return new Response(JSON.stringify({ 
      success: true, 
      ticket_id, 
      summary: cleanSummary 
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
});
