Deno.serve(async () => {
  const dashboardUrl = Deno.env.get("DASHBOARD_URL");
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!dashboardUrl || !cronSecret) return new Response("Missing function secrets", { status: 500 });

  const response = await fetch(`${dashboardUrl.replace(/\/$/, "")}/api/push/send`, {
    method: "POST",
    headers: { authorization: `Bearer ${cronSecret}` },
  });
  return new Response(await response.text(), { status: response.status, headers: { "content-type": "application/json" } });
});
