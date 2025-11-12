const base = 'http://localhost:4000/api';

async function main() {
  const loginRes = await fetch(base + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@e4d.test', password: 'admin123' })
  });
  if (!loginRes.ok) {
    console.error('Login failed:', loginRes.status, await loginRes.text());
    process.exit(1);
  }
  const tokens = await loginRes.json();
  const token = tokens?.accessToken;
  if (!token) {
    console.error('No accessToken in response');
    process.exit(1);
  }
  const dashRes = await fetch(base + '/admin/dashboard', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!dashRes.ok) {
    console.error('Dashboard request failed:', dashRes.status, await dashRes.text());
    process.exit(1);
  }
  const data = await dashRes.json();
  console.log(JSON.stringify(data, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
