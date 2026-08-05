function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

function authorized(request, env) {
  const password = request.headers.get('X-Admin-Password');
  return Boolean(env.ADMIN_PASSWORD && password === env.ADMIN_PASSWORD);
}

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT id, name, icon, color, category, platform, version, date, downloads, description AS desc, url FROM software ORDER BY id DESC'
  ).all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  if (!authorized(request, env)) return json({ error: '管理密码错误' }, 401);
  const item = await request.json();
  const required = ['name', 'category', 'platform', 'version', 'desc', 'url'];
  if (required.some(key => !String(item[key] || '').trim())) return json({ error: '请填写完整信息' }, 400);
  if (!/^https?:\/\//i.test(item.url)) return json({ error: '下载地址必须使用 HTTP 或 HTTPS' }, 400);
  const result = await env.DB.prepare(
    'INSERT INTO software (name, icon, color, category, platform, version, date, downloads, description, url) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)'
  ).bind(item.name.trim(), item.icon || 'S', item.color || '#4f46e5', item.category, item.platform.trim(), item.version.trim(), new Date().toISOString().slice(0, 10), item.desc.trim(), item.url.trim()).run();
  return json({ id: result.meta.last_row_id }, 201);
}

export async function onRequestPut({ request, env }) {
  if (!authorized(request, env)) return json({ error: '管理密码错误' }, 401);
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return json({ error: '缺少软件 ID' }, 400);
  const item = await request.json();
  const required = ['name', 'category', 'platform', 'version', 'desc', 'url'];
  if (required.some(key => !String(item[key] || '').trim())) return json({ error: '请填写完整信息' }, 400);
  if (!/^https?:\/\//i.test(item.url)) return json({ error: '下载地址必须使用 HTTP 或 HTTPS' }, 400);
  const result = await env.DB.prepare(
    'UPDATE software SET name = ?, icon = ?, color = ?, category = ?, platform = ?, version = ?, description = ?, url = ? WHERE id = ?'
  ).bind(item.name.trim(), item.icon || 'S', item.color || '#4f46e5', item.category, item.platform.trim(), item.version.trim(), item.desc.trim(), item.url.trim(), id).run();
  if (!result.meta.changes) return json({ error: '没有找到该软件' }, 404);
  return json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  if (!authorized(request, env)) return json({ error: '管理密码错误' }, 401);
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return json({ error: '缺少软件 ID' }, 400);
  await env.DB.prepare('DELETE FROM software WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
