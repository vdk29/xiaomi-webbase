// Live connectivity check completed; no temporary capability remains.
Deno.serve(() => new Response('Check completed', { status: 410 }));
