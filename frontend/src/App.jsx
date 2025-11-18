import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Header() {
  return (
    <div className="px-6 py-4 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">FlameSocial</div>
        <div className="text-sm text-gray-500">Social media manager</div>
      </div>
    </div>
  )
}

function ConnectForm({ onConnected }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    username: '',
    email: '',
    provider: 'twitter',
    access_token: '',
    refresh_token: '',
    account_handle: '',
    avatar_url: ''
  })

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        onConnected()
      } else {
        alert(data.detail || 'Failed to connect account')
      }
    } catch (err) {
      console.error(err)
      alert('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="p-4 border rounded-xl bg-white shadow-sm space-y-3">
      <div className="font-semibold">Connect an account</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className="input" placeholder="Your name" value={form.username} onChange={e=>update('username', e.target.value)} />
        <input className="input" placeholder="Email" value={form.email} onChange={e=>update('email', e.target.value)} />
        <select className="input" value={form.provider} onChange={e=>update('provider', e.target.value)}>
          <option value="twitter">Twitter/X</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="linkedin">LinkedIn</option>
          <option value="tiktok">TikTok</option>
          <option value="youtube">YouTube</option>
        </select>
        <input className="input" placeholder="Access token (demo)" value={form.access_token} onChange={e=>update('access_token', e.target.value)} />
        <input className="input" placeholder="Refresh token (optional)" value={form.refresh_token} onChange={e=>update('refresh_token', e.target.value)} />
        <input className="input" placeholder="Account handle (optional)" value={form.account_handle} onChange={e=>update('account_handle', e.target.value)} />
        <input className="input sm:col-span-2" placeholder="Avatar URL (optional)" value={form.avatar_url} onChange={e=>update('avatar_url', e.target.value)} />
      </div>
      <button disabled={loading} className="btn-primary w-full sm:w-auto">{loading? 'Connecting...' : 'Connect account'}</button>
    </form>
  )
}

function AccountsList({ refreshFlag }) {
  const [accounts, setAccounts] = useState([])
  const load = async () => {
    const res = await fetch(`${API_BASE}/accounts`)
    const data = await res.json()
    setAccounts(data.accounts || [])
  }
  useEffect(() => { load() }, [refreshFlag])
  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm">
      <div className="font-semibold mb-3">Connected accounts</div>
      <div className="space-y-3">
        {accounts.length === 0 && <div className="text-gray-500 text-sm">No accounts yet</div>}
        {accounts.map(a => (
          <div key={a._id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500" />
              <div>
                <div className="font-medium">{a.username} <span className="text-gray-400">· @{a.account_handle || 'account'}</span></div>
                <div className="text-xs text-gray-500">{a.provider}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">{a.email}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Composer() {
  const [content, setContent] = useState('')
  const [platforms, setPlatforms] = useState(['twitter'])
  const [userId, setUserId] = useState('')
  const [result, setResult] = useState(null)

  const toggle = (p) => setPlatforms(prev => prev.includes(p) ? prev.filter(x=>x!==p) : [...prev, p])

  const post = async () => {
    setResult(null)
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, platforms, content })
    })
    const data = await res.json()
    if (!res.ok) return alert(data.detail || 'Failed to create post')
    const pub = await fetch(`${API_BASE}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post_id: data.post_id }) })
    const out = await pub.json()
    if (!pub.ok) return alert(out.detail || 'Failed to publish')
    setResult(out)
  }

  const providers = ['twitter','facebook','instagram','linkedin','tiktok','youtube']

  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm">
      <div className="font-semibold mb-3">Create post</div>
      <textarea value={content} onChange={e=>setContent(e.target.value)} className="input h-28" placeholder="Write something..." />
      <div className="mt-2 flex flex-wrap gap-2">
        {providers.map(p => (
          <button key={p} onClick={()=>toggle(p)} className={`px-3 py-1 rounded-full border text-sm ${platforms.includes(p)?'bg-blue-600 text-white border-blue-600':'bg-gray-50'}`}>{p}</button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input className="input" placeholder="User ID (from connect response)" value={userId} onChange={e=>setUserId(e.target.value)} />
        <button onClick={post} className="btn-primary sm:col-span-2">Post now</button>
      </div>
      {result && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
          <div className="font-medium text-green-800">Published</div>
          <pre className="text-green-700 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [refresh, setRefresh] = useState(0)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800">
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <ConnectForm onConnected={() => setRefresh(v=>v+1)} />
        <AccountsList refreshFlag={refresh} />
        <Composer />
      </div>
    </div>
  )
}

// Small Tailwindy inputs
const styles = `
.input{ @apply w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white; }
.btn-primary{ @apply inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition; }
`

const styleEl = document.createElement('style')
styleEl.innerHTML = styles
if (typeof document !== 'undefined') document.head.appendChild(styleEl)
