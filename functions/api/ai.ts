/**
 * Cloudflare Pages Function — secure AI proxy.
 *
 * Keeps the LLM API key server-side (set `AI_API_KEY` in the Pages dashboard as a
 * secret env var, NOT a VITE_* var). The browser calls this function; the key is
 * never shipped to the client bundle.
 *
 * Env vars (set in Cloudflare Pages → Settings → Environment variables):
 *   AI_API_KEY  = your provider key            (secret)
 *   AI_BASE_URL = https://api.openai.com/v1    (or any OpenAI-compatible provider)
 *   AI_MODEL    = gpt-4o-mini
 */
export const onRequestPost = async ({ request, env }) => {
  const key = env.AI_API_KEY
  if (!key) {
    return Response.json({ ok: false, reason: 'no-key' }, { status: 501 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, reason: 'bad-json' }, { status: 400 })
  }

  const base = (env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')
  const model = env.AI_MODEL || 'gpt-4o-mini'

  const messages = []
  if (body.system) messages.push({ role: 'system', content: String(body.system) })
  messages.push({ role: 'user', content: String(body.user || '') })

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
        max_tokens: typeof body.maxTokens === 'number' ? body.maxTokens : 1200,
        ...(body.json ? { response_format: { type: 'json_object' } } : {}),
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return Response.json({ ok: false, reason: `provider:${res.status}`, detail: text.slice(0, 300) }, { status: 502 })
    }

    const data = await res.json()
    const output = data?.choices?.[0]?.message?.content
    if (typeof output !== 'string' || !output.trim()) {
      return Response.json({ ok: false, reason: 'empty' }, { status: 502 })
    }
    return Response.json({ ok: true, output: output.trim() })
  } catch (err) {
    return Response.json({ ok: false, reason: 'upstream-error' }, { status: 502 })
  }
}

// Preflight for the simple POST the client makes.
export const onRequestOptions = async () => {
  return new Response(null, { status: 204 })
}