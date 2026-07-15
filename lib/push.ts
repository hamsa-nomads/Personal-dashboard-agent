import webpush from "web-push";
import { getSupabaseAdmin } from "./supabase-admin";

export function configureWebPush() {
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function sendDueReminders() {
  const supabase = getSupabaseAdmin();
  if (!supabase || !configureWebPush()) return { configured: false, sent: 0 };
  const now = new Date().toISOString();
  const { data: reminders, error: remindersError } = await supabase.from("reminders").select("id,title,body,url").is("sent_at", null).lte("scheduled_for", now).order("scheduled_for", { ascending: true }).limit(50);
  if (remindersError) throw remindersError;
  if (!reminders?.length) return { configured: true, sent: 0 };
  const { data: subscriptions, error: subscriptionsError } = await supabase.from("push_subscriptions").select("id,subscription").eq("active", true);
  if (subscriptionsError) throw subscriptionsError;
  let sent = 0;
  for (const reminder of reminders) {
    const payload = JSON.stringify({ title: reminder.title, body: reminder.body, url: reminder.url ?? "/" });
    await Promise.all((subscriptions ?? []).map(async (record) => {
      try {
        await webpush.sendNotification(record.subscription, payload);
        sent += 1;
      } catch (error) {
        const statusCode = typeof error === "object" && error && "statusCode" in error ? Number((error as { statusCode?: number }).statusCode) : 0;
        if (statusCode === 404 || statusCode === 410) await supabase.from("push_subscriptions").update({ active: false }).eq("id", record.id);
      }
    }));
    await supabase.from("reminders").update({ sent_at: new Date().toISOString() }).eq("id", reminder.id);
  }
  return { configured: true, sent };
}
