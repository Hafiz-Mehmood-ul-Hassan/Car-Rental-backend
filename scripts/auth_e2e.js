// Auth E2E script for backend auth endpoints
// Run with: node scripts/auth_e2e.js

const BASE = process.env.BASE_URL || 'http://localhost:5000';

async function request(path, opts = {}){
  const url = BASE + path;
  const res = await fetch(url, opts);
  const text = await res.text();
  let json = null;
  try{ json = JSON.parse(text); }catch(e){ json = {raw: text}; }
  return { status: res.status, body: json };
}

(async ()=>{
  try{
    const ts = Date.now();
    const email = `e2e+${ts}@example.com`;
    const password = 'password123';

    console.log('1) Registering user', email);
    let r = await request('/api/auth/register', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name: 'E2E Test', email, password, role: 'RENTER' })
    });
    console.log('->', r.status, r.body);
    if (r.status !== 201) throw new Error('Register failed');

    console.log('2) Logging in');
    r = await request('/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email, password })
    });
    console.log('->', r.status, r.body);
    if (r.status !== 200) throw new Error('Login failed');

    const token = r.body.data.token;
    const refreshToken = r.body.data.refreshToken;

    console.log('3) GET /me');
    r = await request('/api/auth/me', { headers: { 'Authorization': 'Bearer '+token } });
    console.log('->', r.status, r.body);
    if (r.status !== 200) throw new Error('/me failed');

    console.log('4) Change password');
    r = await request('/api/auth/change-password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+token },
      body: JSON.stringify({ oldPassword: password, newPassword: 'newpass456' })
    });
    console.log('->', r.status, r.body);
    if (r.status !== 200) throw new Error('Change password failed');

    console.log('5) Refresh token');
    r = await request('/api/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    console.log('->', r.status, r.body);
    if (r.status !== 200) throw new Error('Refresh token failed');

    console.log('6) Update profile');
    const newToken = r.body.data.token;
    r = await request('/api/auth/me/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+newToken },
      body: JSON.stringify({ name: 'E2E Updated' })
    });
    console.log('->', r.status, r.body);
    if (r.status !== 200) throw new Error('Update profile failed');

    console.log('7) Delete profile');
    r = await request('/api/auth/me/delete', {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer '+newToken }
    });
    console.log('->', r.status, r.body);
    if (r.status !== 200) throw new Error('Delete profile failed');

    console.log('E2E auth flow completed successfully');
    process.exit(0);
  }catch(err){
    console.error('E2E failed:', err.message);
    process.exit(2);
  }
})();

