// Pure JSON file store with a better-sqlite3-compatible synchronous API.
// Replaces better-sqlite3 to avoid native compilation on Windows.
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'outpouring25.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const TABLES = ['config', 'speakers', 'sessions', 'prayers', 'media', 'giving', 'registrations', 'chat', 'users'];

let store = {};
TABLES.forEach(t => { store[t] = []; });
store._seqs = {};

function load() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      TABLES.forEach(t => { if (Array.isArray(raw[t])) store[t] = raw[t]; });
      if (raw._seqs) store._seqs = raw._seqs;
    } catch {}
  }
}

function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2));
}

function nextId(table) {
  const maxExisting = store[table].reduce((m, r) => Math.max(m, r.id || 0), 0);
  const seq = Math.max(store._seqs[table] || 0, maxExisting) + 1;
  store._seqs[table] = seq;
  return seq;
}

function now() { return new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, ''); }

// Extract table name from SQL
function tableFrom(sql) {
  const m = sql.match(/(?:from|into|update)\s+(\w+)/i);
  return m ? m[1].toLowerCase() : null;
}

// Parse WHERE id=? style conditions - returns a filter function factory
function parseWhere(sql, params) {
  const s = sql.toLowerCase();
  // WHERE id=? (single equality)
  const idEq = s.match(/where\s+id\s*=\s*\?/);
  if (idEq) {
    const id = Number(params[params.length - 1]);
    return row => row.id === id;
  }
  // WHERE approved=1
  const approvedEq = s.match(/where\s+approved\s*=\s*1/);
  if (approvedEq) return row => row.approved == 1;

  // WHERE day=?
  const dayEq = s.match(/where\s+day\s*=\s*\?/);
  if (dayEq) {
    const day = Number(params[0]);
    return row => Number(row.day) === day;
  }
  // WHERE id > ?
  const idGt = s.match(/where\s+id\s*>\s*\?/);
  if (idGt) {
    const since = Number(params[0]);
    return row => row.id > since;
  }
  // WHERE username=?
  const usernameEq = s.match(/where\s+username\s*=\s*\?/);
  if (usernameEq) {
    const username = params[0];
    return row => row.username === username;
  }
  return null;
}

function sortRows(rows, sql) {
  const s = sql.toLowerCase();
  const orderMatch = s.match(/order by\s+([\w,\s]+?)(?:\s+limit|\s*$)/);
  if (!orderMatch) return rows;
  const cols = orderMatch[1].split(',').map(c => c.trim().split(/\s+/));
  return [...rows].sort((a, b) => {
    for (const [col, dir] of cols) {
      const asc = !dir || dir.toLowerCase() !== 'desc';
      const av = a[col], bv = b[col];
      if (av == null && bv == null) continue;
      if (av == null) return asc ? -1 : 1;
      if (bv == null) return asc ? 1 : -1;
      if (typeof av === 'number' || typeof bv === 'number') {
        const diff = Number(av) - Number(bv);
        if (diff !== 0) return asc ? diff : -diff;
      } else {
        const diff = String(av).localeCompare(String(bv));
        if (diff !== 0) return asc ? diff : -diff;
      }
    }
    return 0;
  });
}

function applyLimit(rows, sql) {
  const m = sql.toLowerCase().match(/limit\s+(\d+)/);
  return m ? rows.slice(0, Number(m[1])) : rows;
}

// Parse INSERT column list
function parseInsertCols(sql) {
  const m = sql.match(/insert\s+(?:or\s+\w+\s+)?into\s+\w+\s*\(([^)]+)\)/i);
  if (!m) return [];
  return m[1].split(',').map(c => c.trim());
}

// Parse UPDATE SET assignments (returns array of col names in order)
function parseSetCols(sql) {
  const m = sql.match(/set\s+(.+?)\s+where/i);
  if (!m) return [];
  return m[1].split(',').map(s => {
    const kv = s.split('=');
    return kv[0].trim();
  });
}

function executeAll(sql, params) {
  const norm = sql.trim().replace(/\s+/g, ' ');
  const low = norm.toLowerCase();
  const table = tableFrom(low);

  // COUNT(*)
  if (low.includes('count(*)')) {
    return [{ c: store[table].length }];
  }

  let rows = [...store[table]];

  // WHERE
  const filter = parseWhere(norm, params);
  if (filter) rows = rows.filter(filter);

  // ORDER BY
  rows = sortRows(rows, low);

  // LIMIT
  rows = applyLimit(rows, low);

  // SELECT specific columns (e.g. SELECT prayCount FROM prayers WHERE id=?)
  const selMatch = norm.match(/^SELECT\s+(.+?)\s+FROM\s/i);
  if (selMatch && selMatch[1] !== '*') {
    const cols = selMatch[1].split(',').map(c => c.trim());
    if (cols.length === 1 && cols[0].toLowerCase() !== 'count(*)') {
      const col = cols[0];
      return rows.map(r => ({ [col]: r[col] }));
    }
  }

  return rows;
}

function executeRun(sql, params) {
  const norm = sql.trim().replace(/\s+/g, ' ');
  const low = norm.toLowerCase();
  const table = tableFrom(low);

  // INSERT (including INSERT OR REPLACE/IGNORE)
  if (low.startsWith('insert')) {
    const cols = parseInsertCols(norm);
    const record = {};
    cols.forEach((col, i) => { record[col] = params[i] !== undefined ? params[i] : ''; });
    record.createdAt = record.createdAt || now();

    if (low.includes('insert or replace') && table === 'config') {
      // Upsert by key for config
      const existing = store.config.findIndex(r => r.key === record.key);
      if (existing >= 0) {
        store.config[existing].value = record.value;
      } else {
        if (!record.id) record.id = nextId(table);
        store.config.push(record);
      }
      save();
      return { changes: 1, lastInsertRowid: record.id || store.config.length };
    }

    if (low.includes('insert or ignore')) {
      // Check uniqueness by key if config
      if (table === 'config' && store.config.some(r => r.key === record.key)) {
        return { changes: 0, lastInsertRowid: 0 };
      }
      // Check uniqueness by username if users
      if (table === 'users' && store.users.some(r => r.username === record.username)) {
        return { changes: 0, lastInsertRowid: 0 };
      }
    }

    record.id = nextId(table);
    store[table].push(record);
    save();
    return { changes: 1, lastInsertRowid: record.id };
  }

  // UPDATE
  if (low.startsWith('update')) {
    const id = Number(params[params.length - 1]);
    const idx = store[table].findIndex(r => r.id === id);
    if (idx < 0) return { changes: 0 };

    // Special: prayCount=prayCount+1
    if (low.includes('praycount=praycount+1')) {
      store[table][idx].prayCount = (store[table][idx].prayCount || 0) + 1;
      save();
      return { changes: 1 };
    }

    const setCols = parseSetCols(norm);
    setCols.forEach((col, i) => {
      store[table][idx][col] = params[i];
    });
    save();
    return { changes: 1 };
  }

  // DELETE
  if (low.startsWith('delete')) {
    const id = Number(params[0]);
    const before = store[table].length;
    store[table] = store[table].filter(r => r.id !== id);
    const changes = before - store[table].length;
    if (changes > 0) save();
    return { changes };
  }

  return { changes: 0 };
}

// Public API — mirrors better-sqlite3's synchronous prepare/statement interface
function prepare(sql) {
  return {
    all(...params) {
      const flat = params.flat();
      if (sql.toLowerCase().includes('count(*)')) {
        return executeAll(sql, flat);
      }
      return executeAll(sql, flat);
    },
    get(...params) {
      const flat = params.flat();
      if (sql.toLowerCase().includes('count(*)')) {
        return executeAll(sql, flat)[0];
      }
      return executeAll(sql, flat)[0];
    },
    run(...params) {
      return executeRun(sql, params.flat());
    },
  };
}

// Thin transaction shim — JSON store is synchronous so just run inline
function transaction(fn) {
  return () => fn();
}

// No-op for pragma/exec — schema is implicit in the seed data
function pragma() {}
function exec() {}

load();

// ---- Seed ----
function seed() {
  if (store.config.length === 0) {
    const pairs = [
      ['title', 'Holy Spirit Outpouring Conference'],
      ['dates', 'August 15–17, 2025'],
      ['location', '#7A Covenant Avenue, off Stadium Road, Port Harcourt, Nigeria, 500201'],
      ['countdownDate', '2025-08-15T18:00:00'],
      ['isLive', 'false'],
      ['streamUrl', ''],
      ['streamTitle', 'Opening Night — Holy Spirit Outpouring Conference'],
      ['heroVideoUrl', ''],
      ['aboutText1', "The Holy Spirit Outpouring Conference is more than an event — it's a movement. For three transformative days, believers from every nation will gather to seek the face of God, receive fresh fire, and be equipped for end-time harvest."],
      ['aboutText2', 'Whether you attend in person in Port Harcourt or join our global livestream, prepare for an encounter that will ignite your faith, restore your passion, and release the supernatural in your life.'],
      ['contactEmail', 'info@outpouring25.org'],
      ['contactPhone', '+234 800 000 0000'],
      ['contactAddress', '#7A Covenant Avenue, off Stadium Road, Port Harcourt, Nigeria, 500201'],
      ['announcement_text', ''],
    ];
    pairs.forEach(([key, value]) => {
      store.config.push({ id: nextId('config'), key, value });
    });
    save();
  }

  if (store.speakers.length === 0) {
    [
      ['Pastor David Okonkwo', 'Lead Minister', 'Revival Fire Church', 'The Fire Must Not Go Out', 'Pastor David Okonkwo is a revivalist and apostolic leader with over 20 years of ministry. Known for his fiery preaching and passion for the Holy Spirit, he has ministered in over 40 nations.', 1],
      ['Dr. Jonathan Mitchell', 'Bible Teacher', 'Word Foundation', 'Doctrine of the Holy Spirit', 'Dr. Jonathan Mitchell is a renowned Bible teacher and theologian whose systematic teaching on the Holy Spirit has transformed thousands of believers worldwide.', 2],
      ['Evang. Grace Adeyemi', 'Evangelist', 'Nations Outreach', 'Evening Revival Service', 'Evangelist Grace Adeyemi carries a powerful evangelistic anointing with documented signs and wonders. Her altar calls have led tens of thousands to salvation across West Africa.', 3],
      ['Minister Carlos Rivera', 'Worship Leader', 'Global Praise', 'Worship & Praise', 'Minister Carlos Rivera is an internationally recognized worship leader whose music ushers congregations into deep encounters with God. He has released 8 worship albums.', 4],
    ].forEach(([name, title, church, topic, bio, displayOrder]) => {
      store.speakers.push({ id: nextId('speakers'), name, title, church, topic, bio, photoUrl: '', socialYoutube: '', socialInstagram: '', socialFacebook: '', displayOrder });
    });
    save();
  }

  if (store.sessions.length === 0) {
    [
      [1, '6:00 PM', 'Opening Ceremony', '', 'worship', "The official commencement of Outpouring '25. Welcoming thousands to this historic gathering."],
      [1, '7:00 PM', 'Worship Night', 'Minister Carlos Rivera', 'worship', 'An evening of unhindered, Spirit-led worship that ushers us into the presence of God.'],
      [1, '8:30 PM', 'Keynote: "Fresh Fire"', 'Ps. David Okonkwo', 'preaching', 'The opening message — a prophetic call to the Church to return to the fire of the Holy Spirit.'],
      [2, '8:00 AM', 'Morning Prayer', '', 'prayer', 'Corporate intercession to set the spiritual atmosphere for the day.'],
      [2, '9:30 AM', 'Worship', 'Minister Carlos Rivera', 'worship', 'Morning praise and worship session.'],
      [2, '11:00 AM', 'Teaching: "Doctrine of the Holy Spirit"', 'Dr. Jonathan Mitchell', 'teaching', 'An in-depth biblical examination of the person, work, and gifts of the Holy Spirit.'],
      [2, '2:00 PM', 'Workshop Sessions', '', 'workshop', 'Breakout sessions: Gifts of the Spirit | Prayer & Intercession | Evangelism & Outreach'],
      [2, '5:00 PM', 'Evening Revival', 'Evang. Grace Adeyemi', 'preaching', 'A powerful revival service with extended altar calls and ministry time.'],
      [3, '9:00 AM', 'Prayer & Devotion', '', 'prayer', 'Final morning of corporate prayer and personal devotion before God.'],
      [3, '10:30 AM', 'Final Teaching', 'Dr. Jonathan Mitchell', 'teaching', 'The concluding word — equipping believers to carry the fire back to their nations.'],
      [3, '12:00 PM', 'Commissioning Service', '', 'worship', 'A solemn commissioning of all attendees to go forth as carriers of Holy Spirit revival.'],
      [3, '3:00 PM', 'Closing Worship & Altar Call', '', 'worship', 'The grand finale — extended worship, final altar call, and sending prayer.'],
    ].forEach(([day, time, title, speaker, type, description]) => {
      store.sessions.push({ id: nextId('sessions'), day, time, title, speaker, type, description, isCurrentlyLive: 0 });
    });
    save();
  }

  if (store.prayers.length === 0) {
    [
      ['Sister Comfort Obi', '', 'Healing', 'Please pray for complete healing from the fibroid condition I have been dealing with for years. I believe God will show Himself strong at this conference.', 34, 1, '2025-07-10 08:00:00'],
      ['Bro. Emeka Eze', '', 'Salvation', 'Pray for my brother Emmanuel who has been far from God for 10 years. I believe this is his year of return to the Father.', 21, 1, '2025-07-12 10:30:00'],
      ['Pastor Funmi Adeyemi', '', 'Direction', "I need divine direction for a major ministry decision. Please stand with me in prayer as I seek God's perfect will for this season.", 45, 1, '2025-07-14 14:00:00'],
      ['Anonymous', '', 'Family', 'Please pray for my marriage. We are going through a very difficult season and only God can restore what the enemy has stolen from us.', 67, 1, '2025-07-15 09:00:00'],
    ].forEach(([name, email, category, text, prayCount, approved, createdAt]) => {
      store.prayers.push({ id: nextId('prayers'), name, email, category, text, prayCount, approved, createdAt });
    });
    save();
  }

  if (store.media.length === 0) {
    [
      ['Conference Hall', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop', 'photo', 'The main hall during worship', null],
      ['Hands Raised', 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=800&fit=crop', 'photo', 'Hands lifted in praise', null],
      ['Night Session', 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop', 'photo', 'Evening session crowd', null],
      ['Outdoor Praise', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop', 'photo', 'Outdoor praise session', null],
      ['Altar Call', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=500&fit=crop', 'photo', 'Altar call moments', null],
      ['Min Moses Bliss — High Praise at the HolySpirit Outpouring', 'https://img.youtube.com/vi/MRZT865hYZc/maxresdefault.jpg', 'video', 'Min Moses Bliss', 'https://www.youtube.com/watch?v=MRZT865hYZc'],
      ['Min GUC — Deep Worship during the HolySpirit Outpouring', 'https://img.youtube.com/vi/-grmFq9vEL4/maxresdefault.jpg', 'video', 'Min GUC', 'https://www.youtube.com/watch?v=-grmFq9vEL4'],
      ['Identify Dimensions in Man | Micheal Orokpo', 'https://img.youtube.com/vi/fFZ4-1OdNGA/maxresdefault.jpg', 'video', 'Micheal Orokpo', 'https://www.youtube.com/watch?v=fFZ4-1OdNGA'],
      ['Micah (Praise Prophet) — High Praise at the HolySpirit Outpouring', 'https://img.youtube.com/vi/SAdpDo04EFI/maxresdefault.jpg', 'video', 'Min Micah', 'https://www.youtube.com/watch?v=SAdpDo04EFI'],
      ['Young Teenagers in deep Worship | Generation of Light', 'https://img.youtube.com/vi/hQ_vo1u9QLY/maxresdefault.jpg', 'video', 'Generation of Light', 'https://www.youtube.com/watch?v=hQ_vo1u9QLY'],
      ['Why You NEED God\'s Spirit | Rev Ikechukwu', 'https://img.youtube.com/vi/DMsrcXV50Yk/maxresdefault.jpg', 'video', 'Rev Ikechukwu', 'https://www.youtube.com/watch?v=DMsrcXV50Yk'],
      ['Min Judikay — High Praise during the HolySpirit Outpouring', 'https://img.youtube.com/vi/mM-fmYIdhTU/maxresdefault.jpg', 'video', 'Min Judikay', 'https://www.youtube.com/watch?v=mM-fmYIdhTU'],
      ['Min Empraiz with High at the HolySpirit Outpouring', 'https://img.youtube.com/vi/kqZ0nryrDjU/maxresdefault.jpg', 'video', 'Min Empraiz', 'https://www.youtube.com/watch?v=kqZ0nryrDjU'],
      ['High Traditional Praise at HolySpirit Outpouring | Min Elekwu', 'https://img.youtube.com/vi/T2_rseKY9Tg/maxresdefault.jpg', 'video', 'Min Elekwu', 'https://www.youtube.com/watch?v=T2_rseKY9Tg'],
      ['SHOCKED at the Generation of Power at the Holy Spirit Outpouring', 'https://img.youtube.com/vi/K4dnGEVBHkI/maxresdefault.jpg', 'video', 'Generation of Power', 'https://www.youtube.com/watch?v=K4dnGEVBHkI'],
      ['HolySpirit Outpouring | Deep Worship with Min GP Samz', 'https://img.youtube.com/vi/IcqTnYpLArc/maxresdefault.jpg', 'video', 'Min GP Samz', 'https://www.youtube.com/watch?v=IcqTnYpLArc'],
      ['HolySpirit Outpouring | Deep Worship with Min DFO', 'https://img.youtube.com/vi/-lF45IFHtvA/maxresdefault.jpg', 'video', 'Min DFO', 'https://www.youtube.com/watch?v=-lF45IFHtvA'],
      ['HolySpirit Outpouring | Min Sax', 'https://img.youtube.com/vi/JAfHTjb3_r0/maxresdefault.jpg', 'video', 'Min Sax', 'https://www.youtube.com/watch?v=JAfHTjb3_r0'],
      ['Min Wealth — Deep Worship during the HolySpirit Outpouring', 'https://img.youtube.com/vi/BsV05k71cnM/maxresdefault.jpg', 'video', 'Min Wealth', 'https://www.youtube.com/watch?v=BsV05k71cnM'],
      ['CASOR with High at the HolySpirit Outpouring', 'https://img.youtube.com/vi/DRDzLU1Dc68/maxresdefault.jpg', 'video', 'CASOR', 'https://www.youtube.com/watch?v=DRDzLU1Dc68'],
      ['Deep Saxophone HolySpirit Outpouring', 'https://img.youtube.com/vi/yx1Igevlkwg/maxresdefault.jpg', 'video', 'Deep Saxophone', 'https://www.youtube.com/watch?v=yx1Igevlkwg'],
      ['Min Caleb with High at the HolySpirit Outpouring Conference', 'https://img.youtube.com/vi/IvKj7z8v6rk/maxresdefault.jpg', 'video', 'Min Caleb', 'https://www.youtube.com/watch?v=IvKj7z8v6rk'],
    ].forEach(([title, url, type, caption, youtubeUrl]) => {
      const item = { id: nextId('media'), title, url, type, caption, createdAt: now() };
      if (youtubeUrl) { item.youtubeUrl = youtubeUrl; item.thumbnailUrl = url; }
      store.media.push(item);
    });
    save();
  }

  // Migration: add YouTube videos to existing installs that only have photos
  if (store.media.length > 0 && !store.media.some(m => m.youtubeUrl)) {
    const ytVideos = [
      ['Min Moses Bliss — High Praise at the HolySpirit Outpouring', 'https://img.youtube.com/vi/MRZT865hYZc/maxresdefault.jpg', 'https://www.youtube.com/watch?v=MRZT865hYZc'],
      ['Min GUC — Deep Worship during the HolySpirit Outpouring', 'https://img.youtube.com/vi/-grmFq9vEL4/maxresdefault.jpg', 'https://www.youtube.com/watch?v=-grmFq9vEL4'],
      ['Identify Dimensions in Man | Micheal Orokpo', 'https://img.youtube.com/vi/fFZ4-1OdNGA/maxresdefault.jpg', 'https://www.youtube.com/watch?v=fFZ4-1OdNGA'],
      ['Micah (Praise Prophet) — High Praise at the HolySpirit Outpouring', 'https://img.youtube.com/vi/SAdpDo04EFI/maxresdefault.jpg', 'https://www.youtube.com/watch?v=SAdpDo04EFI'],
      ['Young Teenagers in deep Worship | Generation of Light', 'https://img.youtube.com/vi/hQ_vo1u9QLY/maxresdefault.jpg', 'https://www.youtube.com/watch?v=hQ_vo1u9QLY'],
      ['Why You NEED God\'s Spirit | Rev Ikechukwu', 'https://img.youtube.com/vi/DMsrcXV50Yk/maxresdefault.jpg', 'https://www.youtube.com/watch?v=DMsrcXV50Yk'],
      ['Min Judikay — High Praise during the HolySpirit Outpouring', 'https://img.youtube.com/vi/mM-fmYIdhTU/maxresdefault.jpg', 'https://www.youtube.com/watch?v=mM-fmYIdhTU'],
      ['Min Empraiz with High at the HolySpirit Outpouring', 'https://img.youtube.com/vi/kqZ0nryrDjU/maxresdefault.jpg', 'https://www.youtube.com/watch?v=kqZ0nryrDjU'],
      ['High Traditional Praise at HolySpirit Outpouring | Min Elekwu', 'https://img.youtube.com/vi/T2_rseKY9Tg/maxresdefault.jpg', 'https://www.youtube.com/watch?v=T2_rseKY9Tg'],
      ['SHOCKED at the Generation of Power at the Holy Spirit Outpouring', 'https://img.youtube.com/vi/K4dnGEVBHkI/maxresdefault.jpg', 'https://www.youtube.com/watch?v=K4dnGEVBHkI'],
      ['HolySpirit Outpouring | Deep Worship with Min GP Samz', 'https://img.youtube.com/vi/IcqTnYpLArc/maxresdefault.jpg', 'https://www.youtube.com/watch?v=IcqTnYpLArc'],
      ['HolySpirit Outpouring | Deep Worship with Min DFO', 'https://img.youtube.com/vi/-lF45IFHtvA/maxresdefault.jpg', 'https://www.youtube.com/watch?v=-lF45IFHtvA'],
      ['HolySpirit Outpouring | Min Sax', 'https://img.youtube.com/vi/JAfHTjb3_r0/maxresdefault.jpg', 'https://www.youtube.com/watch?v=JAfHTjb3_r0'],
      ['Min Wealth — Deep Worship during the HolySpirit Outpouring', 'https://img.youtube.com/vi/BsV05k71cnM/maxresdefault.jpg', 'https://www.youtube.com/watch?v=BsV05k71cnM'],
      ['CASOR with High at the HolySpirit Outpouring', 'https://img.youtube.com/vi/DRDzLU1Dc68/maxresdefault.jpg', 'https://www.youtube.com/watch?v=DRDzLU1Dc68'],
      ['Deep Saxophone HolySpirit Outpouring', 'https://img.youtube.com/vi/yx1Igevlkwg/maxresdefault.jpg', 'https://www.youtube.com/watch?v=yx1Igevlkwg'],
      ['Min Caleb with High at the HolySpirit Outpouring Conference', 'https://img.youtube.com/vi/IvKj7z8v6rk/maxresdefault.jpg', 'https://www.youtube.com/watch?v=IvKj7z8v6rk'],
    ];
    ytVideos.forEach(([title, thumbUrl, youtubeUrl]) => {
      store.media.push({ id: nextId('media'), title, url: thumbUrl, thumbnailUrl: thumbUrl, youtubeUrl, type: 'video', caption: title, createdAt: now() });
    });
    save();
  }

  // Migration: update old placeholder address to real address
  const newAddress = '#7A Covenant Avenue, off Stadium Road, Port Harcourt, Nigeria, 500201';
  const oldAddress = 'The Arena, Victoria Island, Lagos, Nigeria';
  ['location', 'contactAddress'].forEach(key => {
    const entry = store.config.find(c => c.key === key && c.value === oldAddress);
    if (entry) { entry.value = newAddress; save(); }
  });

  // Migration: update aboutText2 Lagos → Port Harcourt
  const at2 = store.config.find(c => c.key === 'aboutText2' && c.value && c.value.includes('in person in Lagos'));
  if (at2) { at2.value = at2.value.replace('in person in Lagos', 'in person in Port Harcourt'); save(); }

  if (store.chat.length === 0) {
    [
      ['PrayerWarrior', 'Praying for everyone here!', '2025-08-15 17:45:00'],
      ['FireStarter', 'The worship last night was incredible! Ready for today', '2025-08-15 17:50:00'],
      ['Overcomer22', "I drove 6 hours to be here and it's worth every mile!", '2025-08-15 17:55:00'],
      ['GlobalMission', "Joining from Tokyo! God's presence has no borders", '2025-08-15 17:58:00'],
      ['PraiseKing', 'The Holy Spirit is moving right now!', '2025-08-15 18:00:00'],
      ['RevivalFire', "First time at Outpouring and I'm already transformed", '2025-08-15 18:02:00'],
    ].forEach(([username, message, createdAt]) => {
      store.chat.push({ id: nextId('chat'), username, message, createdAt });
    });
    save();
  }

  // Seed default admin users
  if (store.users.length === 0) {
    [
      ['admin', bcrypt.hashSync('outpouring2025', 10), 'Administrator', 'super_admin'],
      ['manager', bcrypt.hashSync('outpouring@media', 10), 'Content Manager', 'content_manager'],
    ].forEach(([username, password, name, role]) => {
      store.users.push({ id: nextId('users'), username, password, name, role, createdAt: now() });
    });
    save();
  }
}

seed();

module.exports = { prepare, transaction, pragma, exec };
