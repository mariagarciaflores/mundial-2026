/* ============================================================
   Mundial 2026 — Calendario, resultados en vivo y plantillas
   Datos: TheSportsDB (partidos/resultados) + Wikipedia (jugadores)
   ============================================================ */

const API = 'https://www.thesportsdb.com/api/v1/json/123';
const LEAGUE_ID = 4429;
const SEASON = '2026';
const GROUP_ROUNDS = [1, 2, 3];
const KO_ROUNDS = [32, 16, 125, 150, 160, 200];
const KO_START = '2026-06-26'; // no consultamos eliminatorias antes de esta fecha
const TOURNAMENT_START = '2026-06-11';
const TOURNAMENT_END = '2026-07-19';
const REFRESH_MS = 60000;

const KO_LABELS = {
  32: { es: 'Dieciseisavos de final', en: 'Round of 32' },
  16: { es: 'Octavos de final', en: 'Round of 16' },
  125: { es: 'Cuartos de final', en: 'Quarter-finals' },
  150: { es: 'Semifinales', en: 'Semi-finals' },
  160: { es: 'Tercer puesto', en: 'Third place play-off' },
  200: { es: 'Final', en: 'Final' },
};

const I18N = {
  es: {
    title: 'Mundial 2026', subtitle: 'Canadá · México · Estados Unidos',
    tabMatches: 'Partidos', tabGroups: 'Grupos', tabKnockout: 'Eliminatorias', tabTeams: 'Equipos',
    tzLabel: 'Horarios en:', live: 'EN VIVO', updated: 'Actualizado', today: 'Hoy',
    matchesOf: 'Partidos del', noMatches: 'No hay partidos este día.',
    group: 'Grupo', venue: 'Estadio', statusNS: 'POR JUGAR', statusFT: 'FINAL',
    statusHT: 'DESCANSO', statusLive: 'EN VIVO', statusPST: 'APLAZADO', statusET: 'PRÓRROGA', statusPEN: 'PENALES',
    standingsLegend1: 'Clasificado a dieciseisavos (1.º y 2.º)', standingsLegend2: 'Posible clasificación (mejores terceros)',
    bestThirds: 'Mejores terceros (clasifican los 8 mejores)',
    koEmpty: 'Las eliminatorias comienzan el 28 de junio. Los cruces aparecerán aquí automáticamente cuando termine la fase de grupos.',
    players: 'jugadores', back: '← Volver', age: 'años', caps: 'Partidos', goals: 'Goles', number: 'Dorsal',
    born: 'Nacimiento', nationality: 'Nacionalidad', club: 'Club', position: 'Posición',
    bioLoading: 'Cargando biografía…', bioError: 'No se pudo cargar la biografía.', readWiki: 'Leer más en Wikipedia →',
    posGK: 'Porteros', posDF: 'Defensas', posMF: 'Centrocampistas', posFW: 'Delanteros',
    pGK: 'Portero', pDF: 'Defensa', pMF: 'Centrocampista', pFW: 'Delantero',
    offline: 'Sin conexión con el servidor de resultados; mostrando el último calendario guardado.',
    footer: 'Datos: TheSportsDB y Wikipedia · Actualización automática cada 60 segundos · Hecho con ❤️ para el Mundial 2026',
    thTeam: 'Equipo', winner: 'Ganador',
    tzLocal: 'Tu hora local', tzAddPlaceholder: '+ Añadir país…',
  },
  en: {
    title: 'World Cup 2026', subtitle: 'Canada · Mexico · United States',
    tabMatches: 'Matches', tabGroups: 'Groups', tabKnockout: 'Knockout', tabTeams: 'Teams',
    tzLabel: 'Times in:', live: 'LIVE', updated: 'Updated', today: 'Today',
    matchesOf: 'Matches on', noMatches: 'No matches on this day.',
    group: 'Group', venue: 'Venue', statusNS: 'UPCOMING', statusFT: 'FULL TIME',
    statusHT: 'HALF TIME', statusLive: 'LIVE', statusPST: 'POSTPONED', statusET: 'EXTRA TIME', statusPEN: 'PENALTIES',
    standingsLegend1: 'Qualified for round of 32 (1st & 2nd)', standingsLegend2: 'Possible qualification (best thirds)',
    bestThirds: 'Best third-placed teams (top 8 qualify)',
    koEmpty: 'The knockout stage starts on June 28. Fixtures will appear here automatically once the group stage ends.',
    players: 'players', back: '← Back', age: 'years old', caps: 'Caps', goals: 'Goals', number: 'Number',
    born: 'Born', nationality: 'Nationality', club: 'Club', position: 'Position',
    bioLoading: 'Loading biography…', bioError: 'Could not load biography.', readWiki: 'Read more on Wikipedia →',
    posGK: 'Goalkeepers', posDF: 'Defenders', posMF: 'Midfielders', posFW: 'Forwards',
    pGK: 'Goalkeeper', pDF: 'Defender', pMF: 'Midfielder', pFW: 'Forward',
    offline: 'Could not reach the live results server; showing the last saved schedule.',
    footer: 'Data: TheSportsDB & Wikipedia · Auto-refresh every 60 seconds · Made with ❤️ for the 2026 World Cup',
    thTeam: 'Team', winner: 'Winner',
    tzLocal: 'Your local time', tzAddPlaceholder: '+ Add country…',
  },
};

// Zonas horarias ofrecidas en el selector (etiqueta por idioma)
const TZ_CATALOG = [
  { tz: 'Europe/Madrid', es: '🇪🇸 España', en: '🇪🇸 Spain', pinned: true },
  { tz: 'America/La_Paz', es: '🇧🇴 Bolivia', en: '🇧🇴 Bolivia', pinned: true },
  { tz: 'America/Argentina/Buenos_Aires', es: '🇦🇷 Argentina', en: '🇦🇷 Argentina' },
  { tz: 'America/Sao_Paulo', es: '🇧🇷 Brasil', en: '🇧🇷 Brazil' },
  { tz: 'America/Santiago', es: '🇨🇱 Chile', en: '🇨🇱 Chile' },
  { tz: 'America/Bogota', es: '🇨🇴 Colombia', en: '🇨🇴 Colombia' },
  { tz: 'America/Costa_Rica', es: '🇨🇷 Costa Rica', en: '🇨🇷 Costa Rica' },
  { tz: 'America/Havana', es: '🇨🇺 Cuba', en: '🇨🇺 Cuba' },
  { tz: 'America/Guayaquil', es: '🇪🇨 Ecuador', en: '🇪🇨 Ecuador' },
  { tz: 'America/El_Salvador', es: '🇸🇻 El Salvador', en: '🇸🇻 El Salvador' },
  { tz: 'America/New_York', es: '🇺🇸 EE. UU. (Este)', en: '🇺🇸 USA (Eastern)' },
  { tz: 'America/Chicago', es: '🇺🇸 EE. UU. (Centro)', en: '🇺🇸 USA (Central)' },
  { tz: 'America/Denver', es: '🇺🇸 EE. UU. (Montaña)', en: '🇺🇸 USA (Mountain)' },
  { tz: 'America/Los_Angeles', es: '🇺🇸 EE. UU. (Pacífico)', en: '🇺🇸 USA (Pacific)' },
  { tz: 'America/Guatemala', es: '🇬🇹 Guatemala', en: '🇬🇹 Guatemala' },
  { tz: 'America/Tegucigalpa', es: '🇭🇳 Honduras', en: '🇭🇳 Honduras' },
  { tz: 'America/Mexico_City', es: '🇲🇽 México (CDMX)', en: '🇲🇽 Mexico (CDMX)' },
  { tz: 'America/Managua', es: '🇳🇮 Nicaragua', en: '🇳🇮 Nicaragua' },
  { tz: 'America/Panama', es: '🇵🇦 Panamá', en: '🇵🇦 Panama' },
  { tz: 'America/Asuncion', es: '🇵🇾 Paraguay', en: '🇵🇾 Paraguay' },
  { tz: 'America/Lima', es: '🇵🇪 Perú', en: '🇵🇪 Peru' },
  { tz: 'America/Puerto_Rico', es: '🇵🇷 Puerto Rico', en: '🇵🇷 Puerto Rico' },
  { tz: 'America/Santo_Domingo', es: '🇩🇴 Rep. Dominicana', en: '🇩🇴 Dominican Rep.' },
  { tz: 'America/Montevideo', es: '🇺🇾 Uruguay', en: '🇺🇾 Uruguay' },
  { tz: 'America/Caracas', es: '🇻🇪 Venezuela', en: '🇻🇪 Venezuela' },
  { tz: 'America/Toronto', es: '🇨🇦 Canadá (Toronto)', en: '🇨🇦 Canada (Toronto)' },
  { tz: 'Europe/London', es: '🇬🇧 Reino Unido', en: '🇬🇧 United Kingdom' },
  { tz: 'Europe/Paris', es: '🇫🇷 Francia', en: '🇫🇷 France' },
  { tz: 'Europe/Berlin', es: '🇩🇪 Alemania', en: '🇩🇪 Germany' },
  { tz: 'Europe/Rome', es: '🇮🇹 Italia', en: '🇮🇹 Italy' },
  { tz: 'Europe/Lisbon', es: '🇵🇹 Portugal', en: '🇵🇹 Portugal' },
  { tz: 'Africa/Casablanca', es: '🇲🇦 Marruecos', en: '🇲🇦 Morocco' },
  { tz: 'Asia/Tokyo', es: '🇯🇵 Japón', en: '🇯🇵 Japan' },
  { tz: 'Asia/Seoul', es: '🇰🇷 Corea del Sur', en: '🇰🇷 South Korea' },
  { tz: 'Asia/Riyadh', es: '🇸🇦 Arabia Saudita', en: '🇸🇦 Saudi Arabia' },
  { tz: 'Australia/Sydney', es: '🇦🇺 Australia (Sídney)', en: '🇦🇺 Australia (Sydney)' },
];

const LIVE_STATUSES = new Set(['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE', 'IN PLAY']);
const FT_STATUSES = new Set(['FT', 'AET', 'PEN', 'AP', 'FIN', 'MATCH FINISHED', 'AOT']);

const state = {
  lang: localStorage.getItem('wc.lang') || 'es',
  view: 'matches',
  selectedDate: null,
  selectedTeam: null,
  activeTz: localStorage.getItem('wc.activeTz') || 'Europe/Madrid',
  customTzs: JSON.parse(localStorage.getItem('wc.customTzs') || '[]'),
  matches: [],
  teams: {},
  squads: {},
  offline: false,
  updatedAt: null,
};

const $ = (sel) => document.querySelector(sel);
const t = (key) => (I18N[state.lang] && I18N[state.lang][key]) || I18N.es[key] || key;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------- Utilidades de tiempo ---------------- */

function matchDateUTC(m) {
  // strTimestamp de TheSportsDB es UTC sin sufijo Z
  return new Date(m.strTimestamp + (m.strTimestamp.endsWith('Z') ? '' : 'Z'));
}

function dateInTz(date, tz) {
  // YYYY-MM-DD del instante `date` visto desde la zona `tz`
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

function timeInTz(date, tz) {
  return new Intl.DateTimeFormat(state.lang === 'es' ? 'es-ES' : 'en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}

function tzLabel(tz) {
  const entry = TZ_CATALOG.find((z) => z.tz === tz);
  if (entry) return entry[state.lang] || entry.es;
  if (tz === Intl.DateTimeFormat().resolvedOptions().timeZone) return `📍 ${t('tzLocal')}`;
  return tz.split('/').pop().replace(/_/g, ' ');
}

function activeTzList() {
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const pinned = TZ_CATALOG.filter((z) => z.pinned).map((z) => z.tz);
  const list = [...pinned];
  if (!list.includes(local)) list.push(local);
  for (const tz of state.customTzs) if (!list.includes(tz)) list.push(tz);
  return list;
}

function* dateRange(from, to) {
  const d = new Date(from + 'T00:00:00Z');
  const end = new Date(to + 'T00:00:00Z');
  while (d <= end) {
    yield d.toISOString().slice(0, 10);
    d.setUTCDate(d.getUTCDate() + 1);
  }
}

/* ---------------- Estado de los partidos ---------------- */

function normStatus(m) {
  const raw = (m.strStatus || '').toUpperCase().trim();
  if (m.strPostponed === 'yes' || raw === 'PST' || raw === 'POSTPONED') return 'PST';
  if (LIVE_STATUSES.has(raw)) return raw === 'HT' ? 'HT' : 'LIVE';
  if (FT_STATUSES.has(raw)) return 'FT';
  if ((raw === 'NS' || raw === '' || raw === 'NOT STARTED') && m.intHomeScore != null && m.intAwayScore != null) {
    // Algunos partidos terminados quedan con estado NS pero ya tienen marcador
    return matchDateUTC(m).getTime() < Date.now() - 3 * 3600e3 ? 'FT' : 'LIVE';
  }
  return 'NS';
}

function statusBadge(m) {
  const s = normStatus(m);
  if (s === 'LIVE') {
    const raw = (m.strStatus || '').toUpperCase();
    const extra = raw === 'ET' ? ` · ${t('statusET')}` : raw === 'P' ? ` · ${t('statusPEN')}` : raw && raw !== 'LIVE' && raw !== 'IN PLAY' ? ` · ${raw}` : '';
    return `<span class="badge-status live">● ${t('statusLive')}${extra}</span>`;
  }
  if (s === 'HT') return `<span class="badge-status live">${t('statusHT')}</span>`;
  if (s === 'FT') return `<span class="badge-status ft">${t('statusFT')}</span>`;
  if (s === 'PST') return `<span class="badge-status">${t('statusPST')}</span>`;
  return `<span class="badge-status">${t('statusNS')}</span>`;
}

function isLive(m) { const s = normStatus(m); return s === 'LIVE' || s === 'HT'; }
function isFinished(m) { return normStatus(m) === 'FT'; }

/* ---------------- Carga de datos ---------------- */

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function loadStaticData() {
  const [teams, squads] = await Promise.all([
    fetchJson('data/teams.json'),
    fetchJson('data/squads.json'),
  ]);
  state.teams = teams;
  state.squads = squads;
}

async function fetchRound(round) {
  const d = await fetchJson(`${API}/eventsround.php?id=${LEAGUE_ID}&r=${round}&s=${SEASON}`);
  return d.events || [];
}

async function loadMatches() {
  try {
    const rounds = [...GROUP_ROUNDS];
    if (dateInTz(new Date(), 'UTC') >= KO_START) rounds.push(...KO_ROUNDS);
    const results = await Promise.all(rounds.map((r) => fetchRound(r).catch(() => [])));
    const events = results.flat();
    if (!events.length) throw new Error('empty');
    state.matches = events.sort((a, b) => a.strTimestamp.localeCompare(b.strTimestamp));
    state.offline = false;
  } catch (e) {
    if (!state.matches.length) {
      try {
        state.matches = await fetchJson('data/schedule-fallback.json');
      } catch (_) { state.matches = []; }
    }
    state.offline = true;
  }
  state.updatedAt = new Date();
}

/* ---------------- Wikipedia (fotos y biografías) ---------------- */

const wikiCache = {
  get(key) {
    try {
      const raw = localStorage.getItem('wiki:' + key);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (Date.now() - obj.ts > 7 * 86400e3) return null;
      return obj.v;
    } catch (_) { return null; }
  },
  set(key, v) {
    try { localStorage.setItem('wiki:' + key, JSON.stringify({ ts: Date.now(), v })); } catch (_) { /* lleno */ }
  },
};

async function wikiSummary(lang, title) {
  const key = `${lang}:${title}`;
  const cached = wikiCache.get(key);
  if (cached) return cached.notFound ? null : cached;
  try {
    const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`);
    if (!res.ok) throw new Error('404');
    const d = await res.json();
    const v = {
      extract: d.extract || '',
      thumb: d.thumbnail ? d.thumbnail.source : null,
      url: d.content_urls ? d.content_urls.desktop.page : null,
      desc: d.description || '',
    };
    wikiCache.set(key, v);
    return v;
  } catch (_) {
    wikiCache.set(key, { notFound: true });
    return null;
  }
}

async function wikiSummaryLocalized(enTitle) {
  // Biografía en el idioma de la interfaz; si no existe, en inglés
  if (state.lang === 'es') {
    let s = await wikiSummary('es', enTitle);
    if (s && s.extract) return { ...s, lang: 'es' };
    // buscamos el título del artículo en español vía langlinks
    try {
      const key = `eslink:${enTitle}`;
      let esTitle = wikiCache.get(key);
      if (esTitle === null || esTitle === undefined) {
        const d = await fetchJson(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(enTitle)}&prop=langlinks&lllang=es&format=json&formatversion=2&redirects=1&origin=*`);
        const page = d.query && d.query.pages && d.query.pages[0];
        esTitle = (page && page.langlinks && page.langlinks[0] && page.langlinks[0].title) || '';
        wikiCache.set(key, esTitle);
      }
      if (esTitle) {
        s = await wikiSummary('es', esTitle);
        if (s && s.extract) return { ...s, lang: 'es' };
      }
    } catch (_) { /* seguimos con inglés */ }
  }
  const en = await wikiSummary('en', enTitle);
  return en ? { ...en, lang: 'en' } : null;
}

/* ---------------- Render: barra superior ---------------- */

function applyI18nStatic() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
}

function renderTzBar() {
  const chips = $('#tzChips');
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  chips.innerHTML = activeTzList().map((tz) => {
    const removable = !TZ_CATALOG.find((z) => z.tz === tz && z.pinned) && tz !== local;
    return `<button class="tz-chip ${tz === state.activeTz ? 'active' : ''}" data-tz="${esc(tz)}" title="${esc(tz)}">
      ${esc(tzLabel(tz))}${removable ? `<span class="rm" data-rm="${esc(tz)}">✕</span>` : ''}
    </button>`;
  }).join('');

  const used = new Set(activeTzList());
  const sel = $('#tzAdd');
  sel.innerHTML = `<option value="">${esc(t('tzAddPlaceholder'))}</option>` +
    TZ_CATALOG.filter((z) => !used.has(z.tz)).map((z) => `<option value="${esc(z.tz)}">${esc(z[state.lang] || z.es)}</option>`).join('');
}

/* ---------------- Render: vista Partidos ---------------- */

function teamEs(tsdbName) {
  const tm = state.teams[tsdbName];
  return tm ? (state.lang === 'es' ? tm.es : tm.en) : tsdbName;
}

function renderMatchCard(m) {
  const d = matchDateUTC(m);
  const fin = isFinished(m);
  const live = isLive(m);
  const hs = m.intHomeScore, as = m.intAwayScore;
  const hasScore = hs != null && as != null;
  let homeCls = '', awayCls = '';
  if (fin && hasScore) {
    if (+hs > +as) { homeCls = 'winner'; awayCls = 'loser'; }
    else if (+as > +hs) { awayCls = 'winner'; homeCls = 'loser'; }
  }
  const tm = state.teams[m.strHomeTeam];
  const groupTxt = ['1', '2', '3'].includes(String(m.intRound)) && tm ? `${t('group')} ${tm.group}` : (KO_LABELS[m.intRound] ? KO_LABELS[m.intRound][state.lang] : '');
  const times = activeTzList().map((tz) =>
    `<span class="time-pill">${esc(tzLabel(tz))} <b>${timeInTz(d, tz)}</b></span>`).join('');

  return `<article class="match-card ${live ? 'live' : ''}" data-event="${esc(m.idEvent)}">
    <div class="match-top">
      <span class="match-meta">${groupTxt ? `<span>${esc(groupTxt)}</span>` : ''}<span>🏟️ ${esc(m.strVenue || '')}${m.strCountry ? ' · ' + esc(m.strCountry) : ''}</span></span>
      ${statusBadge(m)}
    </div>
    <div class="match-row">
      <div class="team-cell ${homeCls}" data-team="${esc(m.strHomeTeam)}">
        <img src="${esc(m.strHomeTeamBadge || '')}" alt="" loading="lazy"><span class="tname">${esc(teamEs(m.strHomeTeam))}</span>
      </div>
      <div class="score-cell">${hasScore && (live || fin)
        ? `<div class="score">${esc(hs)} - ${esc(as)}</div>`
        : `<div class="vs">${timeInTz(d, state.activeTz)}</div>`}
      </div>
      <div class="team-cell right ${awayCls}" data-team="${esc(m.strAwayTeam)}">
        <img src="${esc(m.strAwayTeamBadge || '')}" alt="" loading="lazy"><span class="tname">${esc(teamEs(m.strAwayTeam))}</span>
      </div>
    </div>
    <div class="times-row">${times}</div>
  </article>`;
}

function renderMatchesView() {
  const tz = state.activeTz;
  const byDay = new Map();
  for (const m of state.matches) {
    const day = dateInTz(matchDateUTC(m), tz);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(m);
  }
  const today = dateInTz(new Date(), tz);
  if (!state.selectedDate) {
    state.selectedDate = (today >= TOURNAMENT_START && today <= TOURNAMENT_END) ? today : TOURNAMENT_START;
  }

  const fmtDow = new Intl.DateTimeFormat(state.lang === 'es' ? 'es-ES' : 'en-GB', { weekday: 'short', timeZone: 'UTC' });
  const fmtMon = new Intl.DateTimeFormat(state.lang === 'es' ? 'es-ES' : 'en-GB', { month: 'short', timeZone: 'UTC' });
  let strip = '';
  for (const day of dateRange(TOURNAMENT_START, TOURNAMENT_END)) {
    const dObj = new Date(day + 'T00:00:00Z');
    const dayMatches = byDay.get(day) || [];
    const hasLive = dayMatches.some(isLive);
    strip += `<button class="date-pill ${day === state.selectedDate ? 'active' : ''} ${hasLive ? 'has-live' : ''} ${day === today ? 'today' : ''}" data-date="${day}">
      <div class="dow">${esc(fmtDow.format(dObj))}</div><div class="dnum">${dObj.getUTCDate()}</div><div class="mon">${esc(fmtMon.format(dObj))}</div>
    </button>`;
  }

  const dayMatches = byDay.get(state.selectedDate) || [];
  const fmtLong = new Intl.DateTimeFormat(state.lang === 'es' ? 'es-ES' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const dayLabel = fmtLong.format(new Date(state.selectedDate + 'T00:00:00Z'));

  $('#view').innerHTML = `
    ${state.offline ? `<div class="error-banner">${esc(t('offline'))}</div>` : ''}
    <div class="date-strip">${strip}</div>
    <h2 class="day-title">${esc(t('matchesOf'))} <b>${esc(dayLabel)}</b> · ${esc(tzLabel(tz))}</h2>
    <div class="match-list">
      ${dayMatches.length ? dayMatches.map(renderMatchCard).join('') : `<p class="empty-day">😴 ${esc(t('noMatches'))}</p>`}
    </div>`;

  const active = $('.date-pill.active');
  if (active) active.scrollIntoView({ inline: 'center', block: 'nearest' });
}

/* ---------------- Render: vista Grupos ---------------- */

function computeStandings() {
  const groups = {};
  for (const [name, tm] of Object.entries(state.teams)) {
    if (!groups[tm.group]) groups[tm.group] = {};
    groups[tm.group][name] = { name, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 };
  }
  for (const m of state.matches) {
    if (!['1', '2', '3'].includes(String(m.intRound))) continue;
    if (!isFinished(m) || m.intHomeScore == null || m.intAwayScore == null) continue;
    const tmH = state.teams[m.strHomeTeam], tmA = state.teams[m.strAwayTeam];
    if (!tmH || !tmA) continue;
    const h = groups[tmH.group][m.strHomeTeam], a = groups[tmA.group][m.strAwayTeam];
    const hs = +m.intHomeScore, as = +m.intAwayScore;
    h.pj++; a.pj++; h.gf += hs; h.gc += as; a.gf += as; a.gc += hs;
    if (hs > as) { h.g++; a.p++; h.pts += 3; }
    else if (as > hs) { a.g++; h.p++; a.pts += 3; }
    else { h.e++; a.e++; h.pts++; a.pts++; }
  }
  const sorted = {};
  for (const g of Object.keys(groups).sort()) {
    sorted[g] = Object.values(groups[g]).sort((x, y) =>
      y.pts - x.pts || (y.gf - y.gc) - (x.gf - x.gc) || y.gf - x.gf || teamEs(x.name).localeCompare(teamEs(y.name)));
  }
  return sorted;
}

function standingsRow(row, pos, cls) {
  const tm = state.teams[row.name];
  return `<tr class="${cls}">
    <td><span class="team-mini" data-team="${esc(row.name)}"><img src="${esc(tm.badge)}" alt="" loading="lazy">${esc(teamEs(row.name))}</span></td>
    <td>${row.pj}</td><td>${row.g}</td><td>${row.e}</td><td>${row.p}</td>
    <td>${row.gf}</td><td>${row.gc}</td><td>${row.gf - row.gc}</td><td class="pts">${row.pts}</td>
  </tr>`;
}

function renderGroupsView() {
  const standings = computeStandings();
  const header = `<tr><th>${esc(t('thTeam'))}</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th></tr>`;
  let html = `<div class="legend">
      <span><i style="background:var(--accent)"></i>${esc(t('standingsLegend1'))}</span>
      <span><i style="background:var(--gold)"></i>${esc(t('standingsLegend2'))}</span>
    </div><div class="groups-grid">`;
  const thirds = [];
  for (const [g, rows] of Object.entries(standings)) {
    html += `<div class="group-card"><h3>${esc(t('group'))} ${g}</h3><table class="standings">${header}
      ${rows.map((r, i) => { if (i === 2) thirds.push({ ...r, group: g }); return standingsRow(r, i, i < 2 ? 'q1' : i === 2 ? 'q3' : ''); }).join('')}
    </table></div>`;
  }
  html += '</div>';

  thirds.sort((x, y) => y.pts - x.pts || (y.gf - y.gc) - (x.gf - x.gc) || y.gf - x.gf);
  html += `<h3 class="section-title">${esc(t('bestThirds'))}</h3>
    <div class="group-card"><table class="standings">
      <tr><th>${esc(t('thTeam'))}</th><th>${esc(t('group'))}</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th></tr>
      ${thirds.map((r, i) => {
        const tm = state.teams[r.name];
        return `<tr class="${i < 8 ? 'q3' : ''}">
          <td><span class="team-mini" data-team="${esc(r.name)}"><img src="${esc(tm.badge)}" alt="" loading="lazy">${esc(teamEs(r.name))}</span></td>
          <td>${r.group}</td><td>${r.pj}</td><td>${r.g}</td><td>${r.e}</td><td>${r.p}</td><td>${r.gf}</td><td>${r.gc}</td><td>${r.gf - r.gc}</td><td class="pts">${r.pts}</td></tr>`;
      }).join('')}
    </table></div>`;
  $('#view').innerHTML = html;
}

/* ---------------- Render: vista Eliminatorias ---------------- */

function renderKnockoutView() {
  const koMatches = state.matches.filter((m) => KO_LABELS[m.intRound]);
  if (!koMatches.length) {
    $('#view').innerHTML = `<p class="ko-note">🏆 ${esc(t('koEmpty'))}</p>`;
    return;
  }
  let html = '';
  for (const round of KO_ROUNDS) {
    const ms = koMatches.filter((m) => String(m.intRound) === String(round));
    if (!ms.length) continue;
    html += `<section class="ko-stage"><h3>${esc(KO_LABELS[round][state.lang])}</h3>
      <div class="match-list">${ms.map(renderMatchCard).join('')}</div></section>`;
  }
  $('#view').innerHTML = html;
}

/* ---------------- Render: vista Equipos ---------------- */

function renderTeamsView() {
  if (state.selectedTeam) { renderTeamDetail(state.selectedTeam); return; }
  const entries = Object.entries(state.teams).sort((a, b) => a[1].group.localeCompare(b[1].group) || teamEs(a[0]).localeCompare(teamEs(b[0])));
  $('#view').innerHTML = `<div class="teams-grid">${entries.map(([name, tm]) => `
    <div class="team-tile" data-team="${esc(name)}">
      <img src="${esc(tm.badge)}" alt="" loading="lazy">
      <div class="tname">${esc(teamEs(name))}</div>
      <div class="tgroup">${esc(t('group'))} ${tm.group}</div>
    </div>`).join('')}</div>`;
}

function playerAge(dob) {
  if (!dob) return null;
  const b = new Date(dob + 'T00:00:00Z'), now = new Date();
  let age = now.getUTCFullYear() - b.getUTCFullYear();
  const mDiff = now.getUTCMonth() - b.getUTCMonth();
  if (mDiff < 0 || (mDiff === 0 && now.getUTCDate() < b.getUTCDate())) age--;
  return age;
}

function renderTeamDetail(tsdbName) {
  const tm = state.teams[tsdbName];
  const squad = state.squads[tm.wiki];
  if (!squad) { $('#view').innerHTML = '<p class="empty-day">—</p>'; return; }
  const byPos = { GK: [], DF: [], MF: [], FW: [] };
  for (const p of squad.players) (byPos[p.pos] || byPos.MF).push(p);

  let html = `<button class="back-btn" id="backTeams">${esc(t('back'))}</button>
    <div class="team-header">
      <img src="${esc(tm.badge)}" alt="">
      <div><h2>${esc(teamEs(tsdbName))}</h2><div class="tgroup">${esc(t('group'))} ${tm.group} · ${squad.players.length} ${esc(t('players'))}</div></div>
    </div>`;
  for (const pos of ['GK', 'DF', 'MF', 'FW']) {
    if (!byPos[pos].length) continue;
    html += `<h3 class="pos-title">${esc(t('pos' + pos))}</h3><div class="players-grid">
      ${byPos[pos].map((p) => {
        const age = playerAge(p.dob);
        return `<div class="player-card" data-player="${esc(p.wiki || p.name)}" data-team="${esc(tsdbName)}">
          <div class="player-photo" data-photo="${esc(p.wiki || '')}">👤</div>
          <div class="player-info">
            <div class="pname"><span class="pnum">${esc(p.no || '–')}</span> ${esc(p.name)}</div>
            <div class="pmeta">${age != null ? `${age} ${esc(t('age'))} · ` : ''}${esc(t('p' + p.pos) || p.pos)}</div>
            <div class="pclub">${esc(p.club || '')}</div>
          </div>
        </div>`;
      }).join('')}</div>`;
  }
  $('#view').innerHTML = html;
  lazyLoadPhotos();
}

function lazyLoadPhotos() {
  const obs = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target;
      observer.unobserve(el);
      const title = el.dataset.photo;
      if (!title) continue;
      wikiSummary('en', title).then((s) => {
        if (s && s.thumb) {
          const img = document.createElement('img');
          img.src = s.thumb; img.alt = ''; img.className = 'player-photo';
          el.replaceWith(img);
        }
      });
    }
  }, { rootMargin: '200px' });
  document.querySelectorAll('.player-photo[data-photo]').forEach((el) => obs.observe(el));
}

/* ---------------- Modal: biografía del jugador ---------------- */

async function openPlayerModal(wikiTitle, tsdbTeam) {
  const tm = state.teams[tsdbTeam];
  const squad = tm && state.squads[tm.wiki];
  const p = squad && squad.players.find((x) => (x.wiki || x.name) === wikiTitle);
  if (!p) return;
  const age = playerAge(p.dob);
  const dobFmt = p.dob ? new Intl.DateTimeFormat(state.lang === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(p.dob + 'T00:00:00Z')) : '—';

  $('#modalContent').innerHTML = `
    <div class="bio-header">
      <div class="bio-photo" id="bioPhoto"></div>
      <div>
        <h3>${p.no ? `<span class="pnum">${esc(p.no)}</span> ` : ''}${esc(p.name)}</h3>
        <div class="bmeta">
          ${esc(t('position'))}: <b>${esc(t('p' + p.pos) || p.pos)}</b><br>
          ${esc(t('nationality'))}: <b>${esc(teamEs(tsdbTeam))}</b><br>
          ${esc(t('born'))}: <b>${esc(dobFmt)}</b>${age != null ? ` (${age} ${esc(t('age'))})` : ''}<br>
          ${esc(t('club'))}: <b>${esc(p.club || '—')}</b>
        </div>
      </div>
    </div>
    <div class="bio-stats">
      <div class="bio-stat"><b>${esc(p.caps ?? '—')}</b><span>${esc(t('caps'))}</span></div>
      <div class="bio-stat"><b>${esc(p.goals ?? '—')}</b><span>${esc(t('goals'))}</span></div>
      <div class="bio-stat"><b>${esc(p.no ?? '—')}</b><span>${esc(t('number'))}</span></div>
    </div>
    <p class="bio-text bio-loading" id="bioText">${esc(t('bioLoading'))}</p>
    <p id="bioLink"></p>`;
  $('#modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  if (p.wiki) {
    const s = await wikiSummaryLocalized(p.wiki);
    const bioText = $('#bioText');
    if (!bioText) return; // el modal se cerró
    if (s) {
      bioText.classList.remove('bio-loading');
      bioText.textContent = s.extract || t('bioError');
      if (s.thumb) $('#bioPhoto').outerHTML = `<img class="bio-photo" src="${esc(s.thumb)}" alt="">`;
      if (s.url) $('#bioLink').innerHTML = `<a class="bio-link" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(t('readWiki'))}</a>`;
    } else {
      bioText.textContent = t('bioError');
    }
  } else {
    $('#bioText').textContent = t('bioError');
  }
}

function closeModal() {
  $('#modal').classList.add('hidden');
  document.body.style.overflow = '';
}

/* ---------------- Render principal ---------------- */

function render() {
  applyI18nStatic();
  renderTzBar();
  $('#langSelect').value = state.lang;
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.view === state.view));

  const anyLive = state.matches.some(isLive);
  $('#liveIndicator').classList.toggle('hidden', !anyLive);
  if (state.updatedAt) {
    $('#updatedAt').textContent = `${t('updated')} ${timeInTz(state.updatedAt, state.activeTz)}`;
  }

  if (state.view === 'matches') renderMatchesView();
  else if (state.view === 'groups') renderGroupsView();
  else if (state.view === 'knockout') renderKnockoutView();
  else renderTeamsView();
}

/* ---------------- Eventos ---------------- */

function bindEvents() {
  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => {
    state.view = b.dataset.view;
    if (state.view !== 'teams') state.selectedTeam = null;
    render();
  }));

  $('#langSelect').addEventListener('change', (e) => {
    state.lang = e.target.value;
    localStorage.setItem('wc.lang', state.lang);
    render();
  });

  $('#tzChips').addEventListener('click', (e) => {
    const rm = e.target.closest('[data-rm]');
    if (rm) {
      state.customTzs = state.customTzs.filter((z) => z !== rm.dataset.rm);
      localStorage.setItem('wc.customTzs', JSON.stringify(state.customTzs));
      if (state.activeTz === rm.dataset.rm) state.activeTz = 'Europe/Madrid';
      render();
      return;
    }
    const chip = e.target.closest('.tz-chip');
    if (chip) {
      state.activeTz = chip.dataset.tz;
      localStorage.setItem('wc.activeTz', state.activeTz);
      state.selectedDate = null; // recalcula el día según la nueva zona
      render();
    }
  });

  $('#tzAdd').addEventListener('change', (e) => {
    if (!e.target.value) return;
    state.customTzs.push(e.target.value);
    localStorage.setItem('wc.customTzs', JSON.stringify(state.customTzs));
    render();
  });

  $('#view').addEventListener('click', (e) => {
    const datePill = e.target.closest('.date-pill');
    if (datePill) { state.selectedDate = datePill.dataset.date; renderMatchesView(); return; }

    const playerCard = e.target.closest('.player-card');
    if (playerCard) { openPlayerModal(playerCard.dataset.player, playerCard.dataset.team); return; }

    if (e.target.closest('#backTeams')) { state.selectedTeam = null; render(); return; }

    const teamEl = e.target.closest('[data-team]');
    if (teamEl) {
      state.selectedTeam = teamEl.dataset.team;
      state.view = 'teams';
      render();
      window.scrollTo({ top: 0 });
    }
  });

  $('#modal').addEventListener('click', (e) => {
    if (e.target.closest('.modal-close') || e.target.classList.contains('modal-backdrop')) closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

/* ---------------- Inicio ---------------- */

async function init() {
  bindEvents();
  applyI18nStatic();
  await loadStaticData();
  await loadMatches();
  render();

  setInterval(async () => {
    if (document.hidden) return;
    await loadMatches();
    // re-render sin perder el estado de navegación
    if (state.view === 'matches' || state.view === 'groups' || state.view === 'knockout') render();
    else {
      const anyLive = state.matches.some(isLive);
      $('#liveIndicator').classList.toggle('hidden', !anyLive);
      if (state.updatedAt) $('#updatedAt').textContent = `${t('updated')} ${timeInTz(state.updatedAt, state.activeTz)}`;
    }
  }, REFRESH_MS);
}

init();
