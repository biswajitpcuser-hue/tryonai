import { useState, useEffect, useRef } from "react";
import Head from "next/head";

const AUTH_KEY = "_mab_auth";

export default function ManageAdmin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) === "1") {
      setAuthed(true);
      fetchUsers();
    }
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    }
  }

  async function doLogin() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem(AUTH_KEY, "1");
        setAuthed(true);
        fetchUsers();
      } else {
        setErr(data.error || "Wrong password");
      }
    } catch {
      setErr("Server se connect nahi ho pa raha. `npm run dev` chal raha hai?");
    }
    setLoading(false);
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setPw("");
  }

  async function addUser() {
    const e = emailInput.trim().toLowerCase();
    if (!e) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e }),
      });
      const data = await res.json();
      if (data.user) {
        setEmailInput("");
        fetchUsers();
      } else {
        setErr(data.error || "Failed to add");
      }
    } catch {
      setErr("Server error");
    }
    setLoading(false);
  }

  async function toggleUnlimited(email) {
    const u = users.find((x) => x.email === email);
    if (!u) return;
    const newVal = !u.unlimited;
    try {
      await fetch("/api/admin/users/unlimited", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, value: newVal }),
      });
      fetchUsers();
    } catch {}
  }

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.displayName || "").toLowerCase().includes(search.toLowerCase()),
  );

  if (!authed) {
    return (
      <>
        <Head>
          <title>Admin | TryonAI</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </Head>
        <div className="min-h-screen bg-[#0a0f0e] flex items-center justify-center p-5">
          <div className="w-full max-w-sm bg-[#131a18] border border-[#1f2b27] rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-[#08a966] rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">M</div>
            <h1 className="text-white text-xl font-bold mb-1">Admin Panel</h1>
            <p className="text-[#889f97] text-sm mb-6">Server-side secure login</p>
            {err && <p className="text-[#ff3b4a] text-sm mb-3">{err}</p>}
            <input
              type="password"
              className="w-full bg-[#0a0f0e] border border-[#1f2b27] rounded-lg p-3 text-white text-sm outline-none mb-3 focus:border-[#08a966]"
              placeholder="Admin Password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doLogin()}
              ref={inputRef}
              autoFocus
            />
            <button
              className="w-full bg-[#08a966] text-white rounded-lg py-3 text-sm font-semibold hover:bg-[#079857] disabled:opacity-50"
              onClick={doLogin}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Login"}
            </button>
          </div>
        </div>
      </>
    );
  }

  const unlimitedCount = users.filter((u) => u.unlimited).length;

  return (
    <>
      <Head>
        <title>Admin | TryonAI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <div className="min-h-screen bg-[#0a0f0e] text-white pb-20">
        <div className="max-w-lg mx-auto p-4">
          <div className="flex items-center justify-between py-3 border-b border-[#1f2b27] mb-4">
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <div className="flex gap-2">
              <button
                className="bg-[#08a966] text-white text-xs font-semibold px-4 py-2 rounded-lg"
                onClick={() => setShowAdd(!showAdd)}
              >
                {showAdd ? "Close" : "+ Add"}
              </button>
              <button
                className="bg-[rgba(255,59,74,0.15)] text-[#ff3b4a] text-xs font-semibold px-3 py-2 rounded-lg"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-[#131a18] border border-[#1f2b27] rounded-xl p-4 text-center">
              <p className="text-[#889f97] text-xs uppercase">Total Users</p>
              <p className="text-[#08a966] text-2xl font-extrabold mt-1">{users.length}</p>
            </div>
            <div className="bg-[#131a18] border border-[#1f2b27] rounded-xl p-4 text-center">
              <p className="text-[#889f97] text-xs uppercase">Unlimited</p>
              <p className="text-[#f5b342] text-2xl font-extrabold mt-1">{unlimitedCount}</p>
            </div>
          </div>

          {showAdd && (
            <div className="bg-[#131a18] border border-[#1f2b27] rounded-xl p-4 mb-4">
              <p className="text-[#889f97] text-xs uppercase mb-2">Naya User Add Karein</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  className="flex-1 bg-[#0a0f0e] border border-[#1f2b27] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#08a966]"
                  placeholder="user@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && addUser()}
                />
                <button
                  className="bg-[#08a966] text-white text-xs font-semibold px-4 py-2.5 rounded-lg whitespace-nowrap disabled:opacity-50"
                  onClick={addUser}
                  disabled={loading}
                >
                  Add
                </button>
              </div>
              {err && <p className="text-[#ff3b4a] text-xs mt-2">{err}</p>}
            </div>
          )}

          <div className="bg-[#131a18] border border-[#1f2b27] rounded-xl px-3 py-2.5 flex items-center gap-2 mb-3">
            <span className="text-[#4d635c]">&#x1F50D;</span>
            <input
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-white text-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <p className="text-[#889f97] text-xs mb-3">{filtered.length} users</p>

          <div className="space-y-1.5">
            {filtered.length === 0 ? (
              <p className="text-center text-[#4d635c] py-10 text-sm">
                {users.length === 0 ? "Koi user nahi hai" : "Koi match nahi mila"}
              </p>
            ) : (
              filtered.map((u) => (
                <div
                  key={u.email}
                  className="bg-[#131a18] border border-[#1f2b27] rounded-xl p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{u.displayName || u.email.split("@")[0]}</p>
                      <p className="text-xs text-[#889f97]">{u.email}</p>
                      <p className="text-[10px] text-[#4d635c] mt-0.5">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Today"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          u.unlimited
                            ? "bg-[rgba(8,169,102,0.15)] text-[#08a966]"
                            : "bg-[rgba(255,59,74,0.12)] text-[#ff3b4a]"
                        }`}
                      >
                        {u.unlimited ? "Unlimited" : "5/day"}
                      </span>
                      <button
                        className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer whitespace-nowrap ${
                          u.unlimited
                            ? "bg-[rgba(255,59,74,0.15)] text-[#ff3b4a]"
                            : "bg-[#08a966] text-white"
                        }`}
                        onClick={() => toggleUnlimited(u.email)}
                      >
                        {u.unlimited ? "Revoke" : "Unlock"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
