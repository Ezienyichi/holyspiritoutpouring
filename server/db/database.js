const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

async function query(text, params) {
  return pool.query(text, params);
}

async function initializeDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS config (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT DEFAULT ''
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS speakers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      title TEXT DEFAULT '',
      church TEXT DEFAULT '',
      topic TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      "photoUrl" TEXT DEFAULT '',
      "socialYoutube" TEXT DEFAULT '',
      "socialInstagram" TEXT DEFAULT '',
      "socialFacebook" TEXT DEFAULT '',
      "displayOrder" INTEGER DEFAULT 0,
      role TEXT DEFAULT 'minister',
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      day INTEGER DEFAULT 1,
      time TEXT DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      speaker TEXT DEFAULT '',
      type TEXT DEFAULT 'teaching',
      description TEXT DEFAULT '',
      "isCurrentlyLive" INTEGER DEFAULT 0,
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS prayers (
      id SERIAL PRIMARY KEY,
      name TEXT DEFAULT 'Anonymous',
      email TEXT DEFAULT '',
      category TEXT DEFAULT 'Other',
      text TEXT NOT NULL DEFAULT '',
      "prayCount" INTEGER DEFAULT 0,
      approved INTEGER DEFAULT 0,
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS media (
      id SERIAL PRIMARY KEY,
      title TEXT DEFAULT '',
      url TEXT NOT NULL DEFAULT '',
      type TEXT DEFAULT 'photo',
      caption TEXT DEFAULT '',
      "thumbnailUrl" TEXT,
      "youtubeUrl" TEXT,
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS giving (
      id SERIAL PRIMARY KEY,
      name TEXT DEFAULT '',
      email TEXT DEFAULT '',
      amount REAL,
      tier TEXT DEFAULT 'Custom',
      reason_for_giving TEXT DEFAULT '',
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      "firstName" TEXT DEFAULT '',
      "lastName" TEXT DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      location TEXT DEFAULT '',
      church TEXT DEFAULT '',
      "attendanceType" TEXT DEFAULT 'online',
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS chat (
      id SERIAL PRIMARY KEY,
      username TEXT,
      message TEXT,
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'content_manager',
      name TEXT DEFAULT '',
      email TEXT DEFAULT '',
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS previous_events (
      id SERIAL PRIMARY KEY,
      year TEXT DEFAULT '',
      title TEXT DEFAULT '',
      tagline TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      highlights_url TEXT DEFAULT '',
      display_order INTEGER DEFAULT 0,
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS past_ministers (
      id SERIAL PRIMARY KEY,
      name TEXT DEFAULT '',
      ministry_role TEXT DEFAULT '',
      year TEXT DEFAULT '',
      photo_url TEXT DEFAULT '',
      display_order INTEGER DEFAULT 0,
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS sponsors (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      logo_url TEXT DEFAULT '',
      website_url TEXT DEFAULT '',
      display_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id SERIAL PRIMARY KEY,
      name TEXT DEFAULT 'Anonymous',
      location TEXT DEFAULT '',
      year TEXT DEFAULT '',
      text TEXT NOT NULL DEFAULT '',
      approved INTEGER DEFAULT 0,
      visible INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Add columns to existing tables that may already exist (safe ALTER TABLE IF NOT EXISTS)
  await query(`ALTER TABLE speakers ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'minister'`).catch(() => {});
  await query(`ALTER TABLE speakers ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE`).catch(() => {});
  await query(`ALTER TABLE media ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE`).catch(() => {});
  await query(`ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE`).catch(() => {});
  await query(`INSERT INTO config (key, value) VALUES ('about_image_url', '') ON CONFLICT (key) DO NOTHING`).catch(() => {});

  // Visible column for content visibility control
  await query(`ALTER TABLE speakers ADD COLUMN IF NOT EXISTS visible INTEGER DEFAULT 1`).catch(() => {});
  await query(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS visible INTEGER DEFAULT 1`).catch(() => {});
  await query(`ALTER TABLE media ADD COLUMN IF NOT EXISTS visible INTEGER DEFAULT 1`).catch(() => {});
  await query(`ALTER TABLE past_ministers ADD COLUMN IF NOT EXISTS visible INTEGER DEFAULT 1`).catch(() => {});
  await query(`ALTER TABLE previous_events ADD COLUMN IF NOT EXISTS visible INTEGER DEFAULT 1`).catch(() => {});
  await query(`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS visible INTEGER DEFAULT 1`).catch(() => {});

  await seed();
}

async function seed() {
  // Config — always upsert with DO NOTHING to preserve admin changes
  const configPairs = [
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
    ['announcement_active', 'false'],
    ['site_title', 'Holy Spirit Outpouring Conference'],
    ['site_tagline', 'A Divine Encounter Awaits'],
    ['site_description', 'Join thousands for three days of powerful worship, anointed teaching, and a fresh encounter with the Holy Spirit in Port Harcourt, Nigeria.'],
    ['site_keywords', 'Holy Spirit, outpouring, conference, revival, Port Harcourt, Nigeria, 2025'],
    ['site_logo_url', ''],
    ['favicon_url', ''],
    ['conference_name', 'Holy Spirit Outpouring Conference'],
    ['conference_dates', 'August 15–17, 2025'],
    ['conference_year', '2025'],
    ['venue_name', 'The Arena'],
    ['venue_address', '#7A Covenant Avenue, off Stadium Road'],
    ['venue_city', 'Port Harcourt'],
    ['venue_state', 'Rivers State'],
    ['venue_country', 'Nigeria'],
    ['venue_postal_code', '500201'],
    ['venue_map_url', ''],
    ['contact_whatsapp', ''],
    ['social_instagram', ''],
    ['social_facebook', ''],
    ['social_youtube', ''],
    ['social_twitter', ''],
    ['social_tiktok', ''],
    ['stream_description', ''],
    ['youtube_channel_url', ''],
    ['youtube_channel_id', ''],
    ['about_heading', 'A Divine Gathering for Such a Time'],
    ['about_stats_attendees', '10K+'],
    ['about_stats_speakers', '8+'],
    ['about_stats_days', '3'],
    ['about_stats_sessions', '40+'],
    ['registration_open', 'true'],
    ['registration_deadline', ''],
    ['max_attendees', ''],
    ['og_title', 'Holy Spirit Outpouring Conference 2025'],
    ['og_description', 'Three days of powerful worship and revival — Port Harcourt, August 15–17, 2025'],
    ['og_image_url', ''],
    ['twitter_card', 'summary_large_image'],
    ['canonical_url', 'https://holyspiritoutpouring-ha9z.vercel.app'],
    ['footer_tagline', 'Moving in the Spirit. Transforming Nations.'],
    ['copyright_text', ''],
    ['show_social_links', 'true'],
  ];
  for (const [key, value] of configPairs) {
    await query('INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [key, value]);
  }

  // Speakers
  const spCount = parseInt((await query('SELECT COUNT(*) FROM speakers')).rows[0].count, 10);
  if (spCount === 0) {
    const speakers = [
      ['Pastor David Okonkwo', 'Lead Minister', 'Revival Fire Church', 'The Fire Must Not Go Out', 'Pastor David Okonkwo is a revivalist and apostolic leader with over 20 years of ministry.', '', '', '', '', 1, 'minister'],
      ['Dr. Jonathan Mitchell', 'Bible Teacher', 'Word Foundation', 'Doctrine of the Holy Spirit', 'Dr. Jonathan Mitchell is a renowned Bible teacher and theologian.', '', '', '', '', 2, 'minister'],
      ['Evang. Grace Adeyemi', 'Evangelist', 'Nations Outreach', 'Evening Revival Service', 'Evangelist Grace Adeyemi carries a powerful evangelistic anointing.', '', '', '', '', 3, 'minister'],
      ['Minister Carlos Rivera', 'Worship Leader', 'Global Praise', 'Worship & Praise', 'Minister Carlos Rivera is an internationally recognized worship leader.', '', '', '', '', 4, 'minister'],
    ];
    for (const [name, title, church, topic, bio, photoUrl, socialYoutube, socialInstagram, socialFacebook, displayOrder, role] of speakers) {
      await query(
        'INSERT INTO speakers (name, title, church, topic, bio, "photoUrl", "socialYoutube", "socialInstagram", "socialFacebook", "displayOrder", role) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
        [name, title, church, topic, bio, photoUrl, socialYoutube, socialInstagram, socialFacebook, displayOrder, role]
      );
    }
  }

  // Conveners — seed only if none exist yet
  const convCount = parseInt((await query("SELECT COUNT(*) FROM speakers WHERE role = 'convener'")).rows[0].count, 10);
  if (convCount === 0) {
    const conveners = [
      ['Convener Name 1', 'Lead Convener', '', '', '', '', '', '', '', 1, 'convener'],
      ['Convener Name 2', 'Co-Convener', '', '', '', '', '', '', '', 2, 'convener'],
      ['Host Name 1', 'Conference Host', '', '', '', '', '', '', '', 3, 'convener'],
      ['Host Name 2', 'Conference Host', '', '', '', '', '', '', '', 4, 'convener'],
      ['Host Name 3', 'Programme Host', '', '', '', '', '', '', '', 5, 'convener'],
    ];
    for (const [name, title, church, topic, bio, photoUrl, socialYoutube, socialInstagram, socialFacebook, displayOrder, role] of conveners) {
      await query(
        'INSERT INTO speakers (name, title, church, topic, bio, "photoUrl", "socialYoutube", "socialInstagram", "socialFacebook", "displayOrder", role) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
        [name, title, church, topic, bio, photoUrl, socialYoutube, socialInstagram, socialFacebook, displayOrder, role]
      );
    }
  }

  // Management — seed only if none exist yet
  const mgmtCount = parseInt((await query("SELECT COUNT(*) FROM speakers WHERE role = 'management'")).rows[0].count, 10);
  if (mgmtCount === 0) {
    const mgmt = [
      ['Manager Name 1', 'Conference Director', '', '', '', '', '', '', '', 1, 'management'],
      ['Manager Name 2', 'Operations Manager', '', '', '', '', '', '', '', 2, 'management'],
      ['Manager Name 3', 'Creative Director', '', '', '', '', '', '', '', 3, 'management'],
      ['Manager Name 4', 'Finance Manager', '', '', '', '', '', '', '', 4, 'management'],
      ['Manager Name 5', 'Communications Manager', '', '', '', '', '', '', '', 5, 'management'],
    ];
    for (const [name, title, church, topic, bio, photoUrl, socialYoutube, socialInstagram, socialFacebook, displayOrder, role] of mgmt) {
      await query(
        'INSERT INTO speakers (name, title, church, topic, bio, "photoUrl", "socialYoutube", "socialInstagram", "socialFacebook", "displayOrder", role) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
        [name, title, church, topic, bio, photoUrl, socialYoutube, socialInstagram, socialFacebook, displayOrder, role]
      );
    }
  }

  // Sub team heads — seed only if none exist yet
  const subCount = parseInt((await query("SELECT COUNT(*) FROM speakers WHERE role = 'sub_team_head'")).rows[0].count, 10);
  if (subCount === 0) {
    const subRoles = ['Worship Lead','Prayer Lead','Media Lead','Hospitality Lead','Ushering Lead','Creative Arts Lead','Security Lead','Registration Lead','Children Ministry Lead','Welfare Lead','Transport Lead','Communications Lead'];
    for (let i = 0; i < subRoles.length; i++) {
      await query(
        'INSERT INTO speakers (name, title, "displayOrder", role) VALUES ($1,$2,$3,$4)',
        [`Sub Team Head ${i+1}`, subRoles[i], i+1, 'sub_team_head']
      );
    }
  }

  // Volunteers — seed only if none exist yet
  const volCount = parseInt((await query("SELECT COUNT(*) FROM speakers WHERE role = 'volunteer'")).rows[0].count, 10);
  if (volCount === 0) {
    const volRoles = ['Worship Team','Prayer Team','Media Team','Hospitality Team','Ushering Team','Registration Team','Children Ministry','Welfare Team','Transport Team','Creative Team','Security Team','Communications Team'];
    for (let i = 0; i < 30; i++) {
      await query(
        'INSERT INTO speakers (name, title, "displayOrder", role) VALUES ($1,$2,$3,$4)',
        [`Volunteer ${i+1}`, volRoles[i % volRoles.length], i+1, 'volunteer']
      );
    }
  }

  // Sponsors — seed only if none exist yet
  const spnCount = parseInt((await query('SELECT COUNT(*) FROM sponsors')).rows[0].count, 10);
  if (spnCount === 0) {
    const sps = ['Sponsor One','Partner Two','Ministry Three','Church Four','Brand Five','Foundation Six','Network Seven','Media Eight','Church Nine','Ministry Ten'];
    for (let i = 0; i < sps.length; i++) {
      await query('INSERT INTO sponsors (name, display_order, active) VALUES ($1,$2,$3)', [sps[i], i+1, 1]);
    }
  }

  // Sessions
  const sessCount = parseInt((await query('SELECT COUNT(*) FROM sessions')).rows[0].count, 10);
  if (sessCount === 0) {
    const sessions = [
      [1, '6:00 PM', 'Opening Ceremony', '', 'worship', "The official commencement of Outpouring '25."],
      [1, '7:00 PM', 'Worship Night', 'Minister Carlos Rivera', 'worship', 'An evening of unhindered, Spirit-led worship.'],
      [1, '8:30 PM', 'Keynote: "Fresh Fire"', 'Ps. David Okonkwo', 'preaching', 'The opening message — a prophetic call to the Church.'],
      [2, '8:00 AM', 'Morning Prayer', '', 'prayer', 'Corporate intercession to set the spiritual atmosphere.'],
      [2, '9:30 AM', 'Worship', 'Minister Carlos Rivera', 'worship', 'Morning praise and worship session.'],
      [2, '11:00 AM', 'Teaching: "Doctrine of the Holy Spirit"', 'Dr. Jonathan Mitchell', 'teaching', 'An in-depth biblical examination of the Holy Spirit.'],
      [2, '2:00 PM', 'Workshop Sessions', '', 'workshop', 'Breakout sessions: Gifts of the Spirit | Prayer | Evangelism'],
      [2, '5:00 PM', 'Evening Revival', 'Evang. Grace Adeyemi', 'preaching', 'A powerful revival service with extended altar calls.'],
      [3, '9:00 AM', 'Prayer & Devotion', '', 'prayer', 'Final morning of corporate prayer.'],
      [3, '10:30 AM', 'Final Teaching', 'Dr. Jonathan Mitchell', 'teaching', 'The concluding word — equipping believers.'],
      [3, '12:00 PM', 'Commissioning Service', '', 'worship', 'A solemn commissioning of all attendees.'],
      [3, '3:00 PM', 'Closing Worship & Altar Call', '', 'worship', 'The grand finale — extended worship and sending prayer.'],
    ];
    for (const [day, time, title, speaker, type, description] of sessions) {
      await query(
        'INSERT INTO sessions (day, time, title, speaker, type, description, "isCurrentlyLive") VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [day, time, title, speaker, type, description, 0]
      );
    }
  }

  // Prayers
  const prCount = parseInt((await query('SELECT COUNT(*) FROM prayers')).rows[0].count, 10);
  if (prCount === 0) {
    const prayers = [
      ['Sister Comfort Obi', '', 'Healing', 'Please pray for complete healing from the fibroid condition I have been dealing with for years.', 34, 1],
      ['Bro. Emeka Eze', '', 'Salvation', 'Pray for my brother Emmanuel who has been far from God for 10 years.', 21, 1],
      ['Pastor Funmi Adeyemi', '', 'Direction', "I need divine direction for a major ministry decision.", 45, 1],
      ['Anonymous', '', 'Family', 'Please pray for my marriage. We are going through a very difficult season.', 67, 1],
    ];
    for (const [name, email, category, text, prayCount, approved] of prayers) {
      await query(
        'INSERT INTO prayers (name, email, category, text, "prayCount", approved) VALUES ($1,$2,$3,$4,$5,$6)',
        [name, email, category, text, prayCount, approved]
      );
    }
  }

  // Media
  const medCount = parseInt((await query('SELECT COUNT(*) FROM media')).rows[0].count, 10);
  if (medCount === 0) {
    const photos = [
      ['Conference Hall', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop', 'photo', 'The main hall during worship', null, null],
      ['Hands Raised', 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=800&fit=crop', 'photo', 'Hands lifted in praise', null, null],
      ['Night Session', 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop', 'photo', 'Evening session crowd', null, null],
      ['Outdoor Praise', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop', 'photo', 'Outdoor praise session', null, null],
      ['Altar Call', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=500&fit=crop', 'photo', 'Altar call moments', null, null],
    ];
    const videos = [
      ['Min Moses Bliss — High Praise at the HolySpirit Outpouring', 'https://img.youtube.com/vi/MRZT865hYZc/maxresdefault.jpg', 'video', 'Min Moses Bliss', 'https://img.youtube.com/vi/MRZT865hYZc/maxresdefault.jpg', 'https://www.youtube.com/watch?v=MRZT865hYZc'],
      ['Min GUC — Deep Worship during the HolySpirit Outpouring', 'https://img.youtube.com/vi/-grmFq9vEL4/maxresdefault.jpg', 'video', 'Min GUC', 'https://img.youtube.com/vi/-grmFq9vEL4/maxresdefault.jpg', 'https://www.youtube.com/watch?v=-grmFq9vEL4'],
      ['Identify Dimensions in Man | Micheal Orokpo', 'https://img.youtube.com/vi/fFZ4-1OdNGA/maxresdefault.jpg', 'video', 'Micheal Orokpo', 'https://img.youtube.com/vi/fFZ4-1OdNGA/maxresdefault.jpg', 'https://www.youtube.com/watch?v=fFZ4-1OdNGA'],
      ['Micah (Praise Prophet) — High Praise at the HolySpirit Outpouring', 'https://img.youtube.com/vi/SAdpDo04EFI/maxresdefault.jpg', 'video', 'Min Micah', 'https://img.youtube.com/vi/SAdpDo04EFI/maxresdefault.jpg', 'https://www.youtube.com/watch?v=SAdpDo04EFI'],
      ['Young Teenagers in deep Worship | Generation of Light', 'https://img.youtube.com/vi/hQ_vo1u9QLY/maxresdefault.jpg', 'video', 'Generation of Light', 'https://img.youtube.com/vi/hQ_vo1u9QLY/maxresdefault.jpg', 'https://www.youtube.com/watch?v=hQ_vo1u9QLY'],
      ["Why You NEED God's Spirit | Rev Ikechukwu", 'https://img.youtube.com/vi/DMsrcXV50Yk/maxresdefault.jpg', 'video', 'Rev Ikechukwu', 'https://img.youtube.com/vi/DMsrcXV50Yk/maxresdefault.jpg', 'https://www.youtube.com/watch?v=DMsrcXV50Yk'],
      ['Min Judikay — High Praise during the HolySpirit Outpouring', 'https://img.youtube.com/vi/mM-fmYIdhTU/maxresdefault.jpg', 'video', 'Min Judikay', 'https://img.youtube.com/vi/mM-fmYIdhTU/maxresdefault.jpg', 'https://www.youtube.com/watch?v=mM-fmYIdhTU'],
      ['Min Empraiz with High at the HolySpirit Outpouring', 'https://img.youtube.com/vi/kqZ0nryrDjU/maxresdefault.jpg', 'video', 'Min Empraiz', 'https://img.youtube.com/vi/kqZ0nryrDjU/maxresdefault.jpg', 'https://www.youtube.com/watch?v=kqZ0nryrDjU'],
      ['High Traditional Praise at HolySpirit Outpouring | Min Elekwu', 'https://img.youtube.com/vi/T2_rseKY9Tg/maxresdefault.jpg', 'video', 'Min Elekwu', 'https://img.youtube.com/vi/T2_rseKY9Tg/maxresdefault.jpg', 'https://www.youtube.com/watch?v=T2_rseKY9Tg'],
      ['SHOCKED at the Generation of Power at the Holy Spirit Outpouring', 'https://img.youtube.com/vi/K4dnGEVBHkI/maxresdefault.jpg', 'video', 'Generation of Power', 'https://img.youtube.com/vi/K4dnGEVBHkI/maxresdefault.jpg', 'https://www.youtube.com/watch?v=K4dnGEVBHkI'],
      ['HolySpirit Outpouring | Deep Worship with Min GP Samz', 'https://img.youtube.com/vi/IcqTnYpLArc/maxresdefault.jpg', 'video', 'Min GP Samz', 'https://img.youtube.com/vi/IcqTnYpLArc/maxresdefault.jpg', 'https://www.youtube.com/watch?v=IcqTnYpLArc'],
      ['HolySpirit Outpouring | Deep Worship with Min DFO', 'https://img.youtube.com/vi/-lF45IFHtvA/maxresdefault.jpg', 'video', 'Min DFO', 'https://img.youtube.com/vi/-lF45IFHtvA/maxresdefault.jpg', 'https://www.youtube.com/watch?v=-lF45IFHtvA'],
      ['HolySpirit Outpouring | Min Sax', 'https://img.youtube.com/vi/JAfHTjb3_r0/maxresdefault.jpg', 'video', 'Min Sax', 'https://img.youtube.com/vi/JAfHTjb3_r0/maxresdefault.jpg', 'https://www.youtube.com/watch?v=JAfHTjb3_r0'],
      ['Min Wealth — Deep Worship during the HolySpirit Outpouring', 'https://img.youtube.com/vi/BsV05k71cnM/maxresdefault.jpg', 'video', 'Min Wealth', 'https://img.youtube.com/vi/BsV05k71cnM/maxresdefault.jpg', 'https://www.youtube.com/watch?v=BsV05k71cnM'],
      ['CASOR with High at the HolySpirit Outpouring', 'https://img.youtube.com/vi/DRDzLU1Dc68/maxresdefault.jpg', 'video', 'CASOR', 'https://img.youtube.com/vi/DRDzLU1Dc68/maxresdefault.jpg', 'https://www.youtube.com/watch?v=DRDzLU1Dc68'],
      ['Deep Saxophone HolySpirit Outpouring', 'https://img.youtube.com/vi/yx1Igevlkwg/maxresdefault.jpg', 'video', 'Deep Saxophone', 'https://img.youtube.com/vi/yx1Igevlkwg/maxresdefault.jpg', 'https://www.youtube.com/watch?v=yx1Igevlkwg'],
      ['Min Caleb with High at the HolySpirit Outpouring Conference', 'https://img.youtube.com/vi/IvKj7z8v6rk/maxresdefault.jpg', 'video', 'Min Caleb', 'https://img.youtube.com/vi/IvKj7z8v6rk/maxresdefault.jpg', 'https://www.youtube.com/watch?v=IvKj7z8v6rk'],
    ];
    for (const [title, url, type, caption, thumbnailUrl, youtubeUrl] of [...photos, ...videos]) {
      await query(
        'INSERT INTO media (title, url, type, caption, "thumbnailUrl", "youtubeUrl") VALUES ($1,$2,$3,$4,$5,$6)',
        [title, url, type, caption, thumbnailUrl, youtubeUrl]
      );
    }
  }

  // Chat
  const chatCount = parseInt((await query('SELECT COUNT(*) FROM chat')).rows[0].count, 10);
  if (chatCount === 0) {
    const chatMessages = [
      ['PrayerWarrior', 'Praying for everyone here!'],
      ['FireStarter', 'The worship last night was incredible! Ready for today'],
      ['Overcomer22', "I drove 6 hours to be here and it's worth every mile!"],
      ['GlobalMission', "Joining from Tokyo! God's presence has no borders"],
      ['PraiseKing', 'The Holy Spirit is moving right now!'],
      ['RevivalFire', "First time at Outpouring and I'm already transformed"],
    ];
    for (const [username, message] of chatMessages) {
      await query('INSERT INTO chat (username, message) VALUES ($1, $2)', [username, message]);
    }
  }

  // Previous events
  const evCount = parseInt((await query('SELECT COUNT(*) FROM previous_events')).rows[0].count, 10);
  if (evCount === 0) {
    const events = [
      ['2018', "Outpouring 2018", 'The First Outpouring — Where It All Began', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=640&h=853&fit=crop', '', 1],
      ['2019', "Outpouring 2019", 'Deeper Waters — A Year of Miracles', 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=640&h=853&fit=crop', '', 2],
      ['2020', "Outpouring 2020", 'Against All Odds — The Virtual Outpouring', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=640&h=853&fit=crop', '', 3],
      ['2021', "Outpouring 2021", 'Rising Again — Post Pandemic Revival', 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=640&h=853&fit=crop', '', 4],
      ['2022', "Outpouring 2022", 'Fire Across the Nation', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=640&h=853&fit=crop', '', 5],
      ['2023', "Outpouring 2023", 'Generation of Power', 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=640&h=853&fit=crop', '', 6],
      ['2024', "Outpouring 2024", 'Heaven Came Down', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=640&h=853&fit=crop', 'https://www.youtube.com/@holyspiritoutpouring-o6s', 7],
      ['2025', "Outpouring 2025", 'The Greatest Yet — Coming August 15', 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=640&h=853&fit=crop', '', 8],
    ];
    for (const [year, title, tagline, image_url, highlights_url, display_order] of events) {
      await query(
        'INSERT INTO previous_events (year, title, tagline, image_url, highlights_url, display_order) VALUES ($1,$2,$3,$4,$5,$6)',
        [year, title, tagline, image_url, highlights_url, display_order]
      );
    }
  }

  // Past ministers
  const pmCount = parseInt((await query('SELECT COUNT(*) FROM past_ministers')).rows[0].count, 10);
  if (pmCount === 0) {
    const ministers = [
      ['Min Moses Bliss', 'Worship Leader', '2024', 'https://img.youtube.com/vi/MRZT865hYZc/maxresdefault.jpg', 1],
      ['Min GUC', 'Gospel Artist', '2024', 'https://img.youtube.com/vi/-grmFq9vEL4/maxresdefault.jpg', 2],
      ['Min Judikay', 'Gospel Artist', '2023', 'https://img.youtube.com/vi/mM-fmYIdhTU/maxresdefault.jpg', 3],
      ['Min Empraiz', 'Worship Leader', '2023', 'https://img.youtube.com/vi/kqZ0nryrDjU/maxresdefault.jpg', 4],
      ['Micah (Praise Prophet)', 'Minister', '2023', 'https://img.youtube.com/vi/SAdpDo04EFI/maxresdefault.jpg', 5],
      ['Min GP Samz', 'Worship Leader', '2024', 'https://img.youtube.com/vi/IcqTnYpLArc/maxresdefault.jpg', 6],
      ['Min Elekwu', 'Traditional Praise', '2024', 'https://img.youtube.com/vi/T2_rseKY9Tg/maxresdefault.jpg', 7],
      ['Min Caleb', 'Gospel Artist', '2025', 'https://img.youtube.com/vi/IvKj7z8v6rk/maxresdefault.jpg', 8],
      ['Min DFO', 'Deep Worship', '2024', 'https://img.youtube.com/vi/-lF45IFHtvA/maxresdefault.jpg', 9],
      ['Min Wealth', 'Worship Leader', '2024', 'https://img.youtube.com/vi/BsV05k71cnM/maxresdefault.jpg', 10],
    ];
    for (const [name, ministry_role, year, photo_url, display_order] of ministers) {
      await query(
        'INSERT INTO past_ministers (name, ministry_role, year, photo_url, display_order) VALUES ($1,$2,$3,$4,$5)',
        [name, ministry_role, year, photo_url, display_order]
      );
    }
  }

  // Default admin users — only if no users exist
  const userCount = parseInt((await query('SELECT COUNT(*) FROM users')).rows[0].count, 10);
  if (userCount === 0) {
    const adminHash = bcrypt.hashSync('outpouring2025', 10);
    const managerHash = bcrypt.hashSync('outpouring@media', 10);
    await query(
      'INSERT INTO users (username, password, name, role) VALUES ($1,$2,$3,$4) ON CONFLICT (username) DO NOTHING',
      ['admin', adminHash, 'Administrator', 'super_admin']
    );
    await query(
      'INSERT INTO users (username, password, name, role) VALUES ($1,$2,$3,$4) ON CONFLICT (username) DO NOTHING',
      ['manager', managerHash, 'Content Manager', 'content_manager']
    );
  }
}

initializeDatabase().catch(err => console.error('[DB init]', err.message));

module.exports = { query };
