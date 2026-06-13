import { useState, useRef } from "react";

// All Sleeper calls go through our Vercel proxy to avoid CORS
async function sleeperFetch(path) {
  // Strip any leading slash so we never double-up
  const cleanPath = path.replace(/^\/+/, "");
  const res = await fetch(`/api/sleeper?path=${cleanPath}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  return res.json();
}

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Inter:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body, #root { background: #0D1F0F; min-height: 100vh; }

  .app {
    background: #0D1F0F;
    min-height: 100vh;
    color: #F5F5F0;
    font-family: 'Inter', sans-serif;
    background-image: repeating-linear-gradient(
      0deg, transparent, transparent 39px,
      rgba(255,255,255,0.03) 39px, rgba(255,255,255,0.03) 40px
    );
  }

  .header {
    background: #071209;
    border-bottom: 2px solid #D4AF37;
    padding: 16px 32px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .header-icon { font-size: 28px; }
  .header h1 {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 28px; font-weight: 900;
    letter-spacing: 2px; text-transform: uppercase; color: #F5F5F0;
  }
  .header-sub {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px; color: #D4AF37;
    letter-spacing: 3px; text-transform: uppercase; margin-left: auto;
  }

  .container { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }

  .card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; padding: 24px; margin-bottom: 24px;
  }
  .card-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 20px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: #D4AF37; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .step-badge {
    background: #D4AF37; color: #0D1F0F;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; font-weight: 900;
    padding: 2px 8px; border-radius: 4px; letter-spacing: 1px;
  }

  input[type="text"] {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 6px; color: #F5F5F0;
    font-family: 'Inter', sans-serif;
    font-size: 15px; padding: 10px 14px; width: 100%;
    outline: none; transition: border-color 0.2s;
  }
  input[type="text"]:focus { border-color: #D4AF37; }
  input[type="text"]::placeholder { color: rgba(255,255,255,0.3); }

  .btn {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    border: none; border-radius: 6px;
    padding: 11px 24px; cursor: pointer; transition: all 0.15s;
  }
  .btn-primary { background: #D4AF37; color: #0D1F0F; }
  .btn-primary:hover { background: #e8c84a; }
  .btn-primary:disabled { background: #5a4d1a; color: #888; cursor: not-allowed; }
  .btn-ghost { background: transparent; color: #F5F5F0; border: 1px solid rgba(255,255,255,0.2); }
  .btn-ghost:hover { border-color: #D4AF37; color: #D4AF37; }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px; margin-top: 12px;
  }
  .team-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 6px; padding: 12px 14px;
    cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; gap: 10px;
  }
  .team-card:hover { border-color: rgba(255,255,255,0.3); }
  .team-card.selected-disperse { border-color: #e05c5c; background: rgba(224,92,92,0.1); }
  .team-card.selected-draft { border-color: #D4AF37; background: rgba(212,175,55,0.1); }
  .team-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #1a3a1f; display: flex; align-items: center;
    justify-content: center; font-size: 18px; flex-shrink: 0; overflow: hidden;
  }
  .team-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .team-name { font-size: 13px; font-weight: 600; line-height: 1.3; }
  .team-owner { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }
  .check-dot {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.2); margin-left: auto; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; transition: all 0.15s;
  }
  .selected-disperse .check-dot { background: #e05c5c; border-color: #e05c5c; color: white; }
  .selected-draft .check-dot { background: #D4AF37; border-color: #D4AF37; color: #0D1F0F; }

  .order-list { margin-top: 12px; }
  .order-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px; margin-bottom: 8px;
  }
  .order-num {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 22px; font-weight: 900; color: #D4AF37;
    width: 28px; text-align: center;
  }
  .move-btns { display: flex; flex-direction: column; gap: 2px; margin-left: auto; }
  .move-btn {
    background: rgba(255,255,255,0.07); border: none;
    color: #F5F5F0; border-radius: 3px;
    width: 24px; height: 20px; cursor: pointer; font-size: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .move-btn:hover { background: rgba(255,255,255,0.15); }
  .move-btn:disabled { opacity: 0.2; cursor: default; }

  .draft-layout {
    display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start;
  }
  @media (max-width: 768px) { .draft-layout { grid-template-columns: 1fr; } }

  .on-the-clock {
    background: linear-gradient(135deg, #1a3a1f 0%, #0f2412 100%);
    border: 2px solid #D4AF37; border-radius: 10px;
    padding: 20px 24px; margin-bottom: 20px;
    position: relative; overflow: hidden;
  }
  .on-the-clock::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at top left, rgba(212,175,55,0.08) 0%, transparent 60%);
  }
  .otc-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 4px;
    text-transform: uppercase; color: #D4AF37;
    display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
  }
  .pulse {
    width: 10px; height: 10px; border-radius: 50%; background: #D4AF37;
    animation: pulse 1.2s infinite;
  }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(212,175,55,0.7); }
    70% { box-shadow: 0 0 0 10px rgba(212,175,55,0); }
    100% { box-shadow: 0 0 0 0 rgba(212,175,55,0); }
  }
  .otc-team {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 32px; font-weight: 900; letter-spacing: 1px; line-height: 1; margin-bottom: 4px;
  }
  .otc-pick-info { font-size: 13px; color: rgba(255,255,255,0.5); }

  .pool-filter { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
  .filter-btn {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.6); border-radius: 4px; padding: 5px 12px; cursor: pointer; transition: all 0.15s;
  }
  .filter-btn.active { background: rgba(212,175,55,0.15); border-color: #D4AF37; color: #D4AF37; }

  .player-list {
    display: flex; flex-direction: column; gap: 6px;
    max-height: 420px; overflow-y: auto; padding-right: 4px;
  }
  .player-list::-webkit-scrollbar { width: 4px; }
  .player-list::-webkit-scrollbar-track { background: transparent; }
  .player-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }

  .player-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px; cursor: pointer; transition: all 0.12s;
  }
  .player-row:hover { background: rgba(212,175,55,0.1); border-color: rgba(212,175,55,0.4); }

  .pos-badge {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px; font-weight: 700; letter-spacing: 1px;
    padding: 2px 7px; border-radius: 3px; min-width: 36px; text-align: center;
  }
  .pos-QB { background: rgba(239,68,68,0.2); color: #f87171; }
  .pos-RB { background: rgba(34,197,94,0.2); color: #4ade80; }
  .pos-WR { background: rgba(59,130,246,0.2); color: #93c5fd; }
  .pos-TE { background: rgba(251,146,60,0.2); color: #fb923c; }
  .pos-K  { background: rgba(168,85,247,0.2); color: #c084fc; }
  .pos-DEF { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); }
  .pos-PICK { background: rgba(212,175,55,0.2); color: #D4AF37; }

  .player-name { font-size: 14px; font-weight: 600; flex: 1; }
  .player-team { font-size: 12px; color: rgba(255,255,255,0.4); }

  .pick-btn {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    background: #D4AF37; color: #0D1F0F; border: none; border-radius: 4px;
    padding: 5px 12px; cursor: pointer; white-space: nowrap; transition: background 0.15s;
  }
  .pick-btn:hover { background: #e8c84a; }

  .pick-history {
    display: flex; flex-direction: column; gap: 6px;
    max-height: 500px; overflow-y: auto; padding-right: 4px;
  }
  .pick-history::-webkit-scrollbar { width: 4px; }
  .pick-history::-webkit-scrollbar-track { background: transparent; }
  .pick-history::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }

  .history-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 12px;
    background: rgba(255,255,255,0.03);
    border-left: 3px solid rgba(212,175,55,0.3);
    border-radius: 0 4px 4px 0; font-size: 13px;
  }
  .history-pick-num {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px; font-weight: 700; color: #D4AF37; width: 24px; flex-shrink: 0;
  }
  .history-team {
    font-size: 11px; color: rgba(255,255,255,0.45);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90px;
  }
  .history-player { font-weight: 600; flex: 1; font-size: 12px; }

  .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
  .result-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px;
  }
  .result-team {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px; font-weight: 700; letter-spacing: 1px; margin-bottom: 10px; color: #D4AF37;
  }
  .result-pick {
    display: flex; align-items: center; gap: 8px;
    padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px;
  }
  .result-pick:last-child { border-bottom: none; }

  .error-msg {
    background: rgba(224,92,92,0.12); border: 1px solid rgba(224,92,92,0.3);
    border-radius: 6px; color: #f87171; padding: 10px 14px; font-size: 13px; margin-top: 10px;
  }
  .spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.1); border-top-color: #D4AF37;
    border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .loading { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.5); font-size: 14px; padding: 12px 0; }
  .label { font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 6px; }
  .mt-12 { margin-top: 12px; }
  .mt-16 { margin-top: 16px; }
  .flex { display: flex; }
  .gap-8 { gap: 8px; }
  .empty-state { text-align: center; padding: 32px; color: rgba(255,255,255,0.3); font-size: 14px; }
`;

const POS_ORDER = { QB: 0, RB: 1, WR: 2, TE: 3, K: 4, DEF: 5, PICK: 6 };
const ALL_POS = ["ALL", "QB", "RB", "WR", "TE", "K", "DEF", "PICK"];

function posClass(pos) {
  if (!pos) return "pos-DEF";
  return `pos-${pos}`;
}

function snakeOrder(teams, totalPicks) {
  const order = [];
  let round = 0;
  while (order.length < totalPicks) {
    const roundTeams = round % 2 === 0 ? [...teams] : [...teams].reverse();
    for (const t of roundTeams) {
      if (order.length < totalPicks) order.push(t);
    }
    round++;
  }
  return order;
}

export default function App() {
  const [phase, setPhase] = useState("setup");
  const [leagueId, setLeagueId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [league, setLeague] = useState(null);
  const [rosters, setRosters] = useState([]);
  const [users, setUsers] = useState([]);

  const [disperseRosterIds, setDisperseRosterIds] = useState([]);
  const [draftRosterIds, setDraftRosterIds] = useState([]);
  const [draftOrderRosters, setDraftOrderRosters] = useState([]);

  const [pool, setPool] = useState([]);
  const [draftPicks, setDraftPicks] = useState([]);
  const [currentPickIdx, setCurrentPickIdx] = useState(0);
  const [pickOrder, setPickOrder] = useState([]);

  const [posFilter, setPosFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const playerCacheRef = useRef(null);

  // Build lookup maps
  const userMap = {};
  users.forEach(u => { userMap[u.user_id] = u; });
  const rosterUserMap = {};
  rosters.forEach(r => { rosterUserMap[r.roster_id] = userMap[r.owner_id] || {}; });

  function getRosterName(rid) {
    const u = rosterUserMap[rid];
    return u?.metadata?.team_name || u?.display_name || `Team ${rid}`;
  }

  async function loadLeague() {
    setLoading(true);
    setError("");
    try {
      const [lg, rs, us] = await Promise.all([
        sleeperFetch(`league/${leagueId}`),
        sleeperFetch(`league/${leagueId}/rosters`),
        sleeperFetch(`league/${leagueId}/users`),
      ]);
      setLeague(lg);
      setRosters(rs);
      setUsers(us);
      setPhase("selectTeams");
    } catch (e) {
      setError(e.message || "Failed to load league. Double-check the league ID.");
    }
    setLoading(false);
  }

  async function getPlayers() {
    if (playerCacheRef.current) return playerCacheRef.current;
    const data = await sleeperFetch("players/nfl");
    playerCacheRef.current = data;
    return data;
  }

  async function buildPool() {
    setLoading(true);
    setError("");
    try {
      const players = await getPlayers();
      const poolItems = [];

      for (const rid of disperseRosterIds) {
        const roster = rosters.find(r => r.roster_id === rid);
        if (!roster) continue;

        for (const pid of (roster.players || [])) {
          const p = players[pid];
          if (!p) continue;
          poolItems.push({
            id: `player_${pid}`,
            playerId: pid,
            name: `${p.first_name} ${p.last_name}`,
            pos: p.position || "DEF",
            nflTeam: p.team || "",
            type: "player",
          });
        }

        for (const pk of (roster.draft_picks || [])) {
          poolItems.push({
            id: `pick_${rid}_${pk.season}_${pk.round}_${pk.roster_id || ""}`,
            name: `${pk.season} Round ${pk.round} Pick`,
            pos: "PICK",
            nflTeam: "",
            type: "pick",
            pickDetail: pk,
          });
        }
      }

      const order = snakeOrder(draftRosterIds, poolItems.length);
      setPool(poolItems);
      setPickOrder(order);
      setDraftPicks([]);
      setCurrentPickIdx(0);
      setPhase("draft");
    } catch (e) {
      setError(e.message || "Failed to load player data.");
    }
    setLoading(false);
  }

  function toggleDisperse(rid) {
    setDisperseRosterIds(prev => {
      const next = prev.includes(rid) ? prev.filter(x => x !== rid) : [...prev, rid];
      // Auto-update draft list: everyone NOT being dispersed is eligible to draft
      setDraftRosterIds(rosters.map(r => r.roster_id).filter(id => !next.includes(id)));
      return next;
    });
  }

  function toggleDraft(rid) {
    if (disperseRosterIds.includes(rid)) return;
    setDraftRosterIds(prev =>
      prev.includes(rid) ? prev.filter(x => x !== rid) : [...prev, rid]
    );
  }

  function proceedToOrder() {
    setDraftOrderRosters([...draftRosterIds]);
    setPhase("setOrder");
  }

  function moveOrder(idx, dir) {
    const arr = [...draftOrderRosters];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
    setDraftOrderRosters(arr);
    setDraftRosterIds(arr);
  }

  function makePick(item) {
    const newPick = { pickNum: currentPickIdx + 1, rosterId: pickOrder[currentPickIdx], item };
    setDraftPicks(prev => [...prev, newPick]);
    setPool(prev => prev.filter(p => p.id !== item.id));
    const nextIdx = currentPickIdx + 1;
    setCurrentPickIdx(nextIdx);
    if (nextIdx >= pickOrder.length || pool.length <= 1) {
      setTimeout(() => setPhase("results"), 300);
    }
  }

  function resetAll() {
    setPhase("setup"); setLeagueId(""); setLeague(null);
    setRosters([]); setUsers([]);
    setDisperseRosterIds([]); setDraftRosterIds([]);
    setPool([]); setDraftPicks([]); setCurrentPickIdx(0); setPickOrder([]);
    setError("");
  }

  const currentRosterId = pickOrder[currentPickIdx];
  const currentRound = draftRosterIds.length > 0 ? Math.floor(currentPickIdx / draftRosterIds.length) + 1 : 1;
  const pickInRound = draftRosterIds.length > 0 ? (currentPickIdx % draftRosterIds.length) + 1 : 1;

  const filteredPool = pool
    .filter(item => {
      const matchPos = posFilter === "ALL" || item.pos === posFilter;
      const matchSearch = !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.nflTeam.toLowerCase().includes(search.toLowerCase());
      return matchPos && matchSearch;
    })
    .sort((a, b) => (POS_ORDER[a.pos] ?? 9) - (POS_ORDER[b.pos] ?? 9) || a.name.localeCompare(b.name));

  const resultsByTeam = {};
  draftRosterIds.forEach(rid => { resultsByTeam[rid] = []; });
  draftPicks.forEach(pk => {
    if (!resultsByTeam[pk.rosterId]) resultsByTeam[pk.rosterId] = [];
    resultsByTeam[pk.rosterId].push(pk);
  });

  return (
    <>
      <style>{style}</style>
      <div className="app">
        <div className="header">
          <span className="header-icon">🏈</span>
          <h1>Dispersal Draft</h1>
          <span className="header-sub">{league ? league.name : "Powered by Sleeper"}</span>
        </div>

        <div className="container">

          {/* SETUP */}
          {phase === "setup" && (
            <div className="card">
              <div className="card-title"><span className="step-badge">1</span> Connect Your League</div>
              <div className="label">Sleeper League ID</div>
              <input
                type="text"
                placeholder="e.g. 784523679123456789"
                value={leagueId}
                onChange={e => setLeagueId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && leagueId && loadLeague()}
              />
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                Sleeper → League → Settings → scroll to League ID
              </div>
              {error && <div className="error-msg">{error}</div>}
              <div className="mt-16">
                <button className="btn btn-primary" onClick={loadLeague} disabled={!leagueId || loading}>
                  {loading ? <><span className="spinner" style={{ width: 14, height: 14, marginRight: 8 }} />Loading...</> : "Load League →"}
                </button>
              </div>
            </div>
          )}

          {/* SELECT TEAMS */}
          {phase === "selectTeams" && (
            <>
              <div className="card">
                <div className="card-title"><span className="step-badge">2</span> Teams Being Dispersed</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>
                  Their players and picks go into the draft pool.
                </div>
                <div className="team-grid">
                  {rosters.map(r => {
                    const u = rosterUserMap[r.roster_id] || {};
                    const isDisp = disperseRosterIds.includes(r.roster_id);
                    return (
                      <div key={r.roster_id} className={`team-card ${isDisp ? "selected-disperse" : ""}`} onClick={() => toggleDisperse(r.roster_id)}>
                        <div className="team-avatar">
                          {u.avatar ? <img src={`https://sleepercdn.com/avatars/thumbs/${u.avatar}`} alt="" /> : "👤"}
                        </div>
                        <div>
                          <div className="team-name">{u.metadata?.team_name || u.display_name || `Team ${r.roster_id}`}</div>
                          <div className="team-owner">{u.display_name || ""}</div>
                        </div>
                        <div className="check-dot">{isDisp ? "✕" : ""}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card">
                <div className="card-title"><span className="step-badge">3</span> Teams Drafting</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>
                  All remaining teams are automatically included. Click to remove any that should sit out.
                </div>
                <div className="team-grid">
                  {rosters.filter(r => !disperseRosterIds.includes(r.roster_id)).map(r => {
                    const u = rosterUserMap[r.roster_id] || {};
                    const isDraft = draftRosterIds.includes(r.roster_id);
                    return (
                      <div key={r.roster_id} className={`team-card ${isDraft ? "selected-draft" : ""}`} onClick={() => toggleDraft(r.roster_id)}>
                        <div className="team-avatar">
                          {u.avatar ? <img src={`https://sleepercdn.com/avatars/thumbs/${u.avatar}`} alt="" /> : "👤"}
                        </div>
                        <div>
                          <div className="team-name">{u.metadata?.team_name || u.display_name || `Team ${r.roster_id}`}</div>
                          <div className="team-owner">{u.display_name || ""}</div>
                        </div>
                        <div className="check-dot">{isDraft ? "✓" : ""}</div>
                      </div>
                    );
                  })}
                </div>
                {error && <div className="error-msg">{error}</div>}
                <div className="mt-16 flex gap-8">
                  <button className="btn btn-ghost" onClick={() => setPhase("setup")}>← Back</button>
                  <button
                    className="btn btn-primary"
                    disabled={disperseRosterIds.length === 0 || draftRosterIds.length === 0}
                    onClick={proceedToOrder}
                  >Set Draft Order →</button>
                </div>
              </div>
            </>
          )}

          {/* SET ORDER */}
          {phase === "setOrder" && (
            <div className="card">
              <div className="card-title"><span className="step-badge">4</span> Set Draft Order</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>
                Snake format — order reverses each round automatically.
              </div>
              <div className="order-list">
                {draftOrderRosters.map((rid, i) => {
                  const u = rosterUserMap[rid] || {};
                  return (
                    <div className="order-item" key={rid}>
                      <div className="order-num">{i + 1}</div>
                      <div className="team-avatar" style={{ width: 30, height: 30, fontSize: 14 }}>
                        {u.avatar ? <img src={`https://sleepercdn.com/avatars/thumbs/${u.avatar}`} alt="" /> : "👤"}
                      </div>
                      <div>
                        <div className="team-name">{getRosterName(rid)}</div>
                        <div className="team-owner">{u.display_name || ""}</div>
                      </div>
                      <div className="move-btns">
                        <button className="move-btn" onClick={() => moveOrder(i, -1)} disabled={i === 0}>▲</button>
                        <button className="move-btn" onClick={() => moveOrder(i, 1)} disabled={i === draftOrderRosters.length - 1}>▼</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {error && <div className="error-msg">{error}</div>}
              <div className="mt-16 flex gap-8">
                <button className="btn btn-ghost" onClick={() => setPhase("selectTeams")}>← Back</button>
                <button className="btn btn-primary" onClick={buildPool} disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 14, height: 14, marginRight: 8 }} />Loading players...</> : "Start Draft →"}
                </button>
              </div>
            </div>
          )}

          {/* DRAFT */}
          {phase === "draft" && currentRosterId && (
            <>
              <div className="on-the-clock">
                <div className="otc-label"><div className="pulse"></div>On the Clock</div>
                <div className="otc-team">{getRosterName(currentRosterId)}</div>
                <div className="otc-pick-info">
                  Round {currentRound} · Pick {pickInRound} of {draftRosterIds.length} · Overall #{currentPickIdx + 1}
                </div>
              </div>

              <div className="draft-layout">
                <div>
                  <div className="card">
                    <div className="card-title">
                      Available Pool <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400, fontSize: 15 }}>({pool.length})</span>
                    </div>
                    <div className="pool-filter">
                      {ALL_POS.map(p => (
                        <button key={p} className={`filter-btn ${posFilter === p ? "active" : ""}`} onClick={() => setPosFilter(p)}>{p}</button>
                      ))}
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <input type="text" placeholder="Search players or NFL teams..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="player-list">
                      {filteredPool.length === 0 && <div className="empty-state">No players match your filter.</div>}
                      {filteredPool.map(item => (
                        <div className="player-row" key={item.id}>
                          <span className={`pos-badge ${posClass(item.pos)}`}>{item.pos}</span>
                          <span className="player-name">{item.name}</span>
                          <span className="player-team">{item.nflTeam}</span>
                          <button className="pick-btn" onClick={() => makePick(item)}>Pick</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <div className="card-title">Pick Log</div>
                    <div className="pick-history">
                      {draftPicks.length === 0 && <div className="empty-state" style={{ padding: 16 }}>No picks yet.</div>}
                      {[...draftPicks].reverse().map((pk, i) => (
                        <div className="history-row" key={i}>
                          <span className="history-pick-num">#{pk.pickNum}</span>
                          <span className={`pos-badge ${posClass(pk.item.pos)}`} style={{ fontSize: 11, padding: "1px 5px", minWidth: 30 }}>{pk.item.pos}</span>
                          <span className="history-player">{pk.item.name}</span>
                          <span className="history-team">{getRosterName(pk.rosterId)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-title" style={{ marginBottom: 10 }}>Up Next</div>
                    {pickOrder.slice(currentPickIdx + 1, currentPickIdx + 5).map((rid, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 13 }}>
                        <span style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 700, width: 20 }}>{i + 2}</span>
                        <span>{getRosterName(rid)}</span>
                      </div>
                    ))}
                  </div>

                  <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => setPhase("results")}>
                    End Draft Early
                  </button>
                </div>
              </div>
            </>
          )}

          {/* RESULTS */}
          {phase === "results" && (
            <div className="card">
              <div className="card-title">🏆 Draft Results</div>
              <div className="results-grid">
                {draftRosterIds.map(rid => (
                  <div className="result-card" key={rid}>
                    <div className="result-team">{getRosterName(rid)}</div>
                    {(resultsByTeam[rid] || []).map((pk, i) => (
                      <div className="result-pick" key={i}>
                        <span className={`pos-badge ${posClass(pk.item.pos)}`} style={{ fontSize: 11, padding: "1px 5px" }}>{pk.item.pos}</span>
                        <span style={{ fontSize: 13 }}>{pk.item.name}</span>
                      </div>
                    ))}
                    {(resultsByTeam[rid] || []).length === 0 && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No picks</div>}
                  </div>
                ))}
              </div>
              <div className="mt-16">
                <button className="btn btn-ghost" onClick={resetAll}>Start Over</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
