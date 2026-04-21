
var programsData = [
  {
    icon:  '⚽',
    title: 'Grassroots',
    ages:  'Ages U8 – U12',
    desc:  'Fundamentals of the game in a fun, safe environment. Ball mastery, teamwork, and a lifelong love of football.'
  },
  {
    icon:  '🏃',
    title: 'Development',
    ages:  'Ages U13 – U16',
    desc:  'Tactical awareness, physical conditioning and positional play. Academy standard training five days a week.'
  },
  {
    icon:  '🏅',
    title: 'Elite Program',
    ages:  'Ages U17 – U21',
    desc:  'Pre-professional training designed to prepare players for senior club football and beyond. Video analysis included.'
  },
  {
    icon:  '🧤',
    title: 'GK Academy',
    ages:  'All Ages',
    desc:  'Specialist goalkeeper coaching covering distribution, shot-stopping, aerial dominance, and sweeper-keeper play.'
  },
  {
    icon:  '💪',
    title: 'Senior Performance',
    ages:  '18+',
    desc:  'High-intensity sessions for adult players looking to compete at the highest amateur and semi-professional level.'
  },
  {
    icon:  '🎓',
    title: 'Scholarship Program',
    ages:  'U14 – U18',
    desc:  'Combined education and elite football for gifted players. Full scholarships available for exceptional talent.'
  }
];


/* ── PLAYERS ── */
var playersData = [
  { name: 'Lucas Ferreira', pos: 'FWD', emoji: '🧑', num: 9,  goals: 24, assists: 11, apps: 32 },
  { name: 'Matteo Ricci',   pos: 'MID', emoji: '👦', num: 8,  goals: 7,  assists: 18, apps: 34 },
  { name: 'Artan Hoxha',    pos: 'DEF', emoji: '🧔', num: 5,  goals: 2,  assists: 4,  apps: 28 },
  { name: 'Diego Sosa',     pos: 'FWD', emoji: '🧑', num: 11, goals: 19, assists: 8,  apps: 30 },
  { name: 'Kaan Yilmaz',    pos: 'GK',  emoji: '👨', num: 1,  goals: 0,  assists: 0,  apps: 30 },
  { name: 'Besnik Gjoka',   pos: 'DEF', emoji: '🧑', num: 4,  goals: 3,  assists: 2,  apps: 26 },
  { name: 'Rafael Lima',    pos: 'MID', emoji: '👦', num: 6,  goals: 5,  assists: 14, apps: 33 },
  { name: 'Omar Dridi',     pos: 'FWD', emoji: '🧔', num: 10, goals: 21, assists: 9,  apps: 31 },
  { name: 'Nikos Papadop.', pos: 'DEF', emoji: '🧑', num: 3,  goals: 1,  assists: 3,  apps: 27 },
  { name: 'Tariq Hassan',   pos: 'MID', emoji: '👨', num: 7,  goals: 6,  assists: 12, apps: 35 },
  { name: 'Emil Kovač',     pos: 'GK',  emoji: '👦', num: 12, goals: 0,  assists: 1,  apps: 8  },
  { name: 'Ivan Petrov',    pos: 'DEF', emoji: '🧔', num: 2,  goals: 2,  assists: 5,  apps: 29 }
];


/* ── COACHES ── */
var coachesData = [
  {
    name:  'Marco De Luca',
    role:  'Head Coach',
    emoji: '👨‍💼',
    bio:   'Former Serie A midfielder. UEFA Pro Licence. 15 years in elite youth development.'
  },
  {
    name:  'Alban Shehu',
    role:  'Assistant Coach',
    emoji: '🧑‍💼',
    bio:   'Ex-Albanian national team player. Specialist in tactical periodisation and video analysis.'
  },
  {
    name:  'Sara Fernandez',
    role:  'Fitness & Conditioning',
    emoji: '👩‍⚕️',
    bio:   'MSc Sports Science. Designed physical programmes for top clubs across Europe.'
  },
  {
    name:  'John Blackwell',
    role:  'GK Coach',
    emoji: '🧤',
    bio:   'Professional goalkeeper for 12 years. UEFA A Licence. Developed 8 pro-level goalkeepers.'
  }
];


/* ── SCHEDULE ── */
var scheduleData = [
  { day: '21', month: 'Apr', title: 'Morning Training – Elite Group',    detail: 'Titan Park Pitch A · 07:30–10:00',            type: 'training' },
  { day: '23', month: 'Apr', title: 'U17 League Match vs Star FC',       detail: 'Away · 15:00 KO · City Stadium',              type: 'match'    },
  { day: '26', month: 'Apr', title: 'Open Trial Day – U14 & U16',        detail: 'Titan Park · 09:00–13:00 · Register online',  type: 'trial'    },
  { day: '28', month: 'Apr', title: 'Goalkeeper Academy Session',        detail: 'Titan Park Pitch B · 16:00–18:30',            type: 'training' },
  { day: '02', month: 'May', title: 'Parent Information Evening',        detail: 'Titan FC Club House · 19:00',                 type: 'training' },
  { day: '05', month: 'May', title: 'U21 Cup Semi-Final',                detail: 'Home · 14:00 KO · Titan Park',                type: 'match'    }
];