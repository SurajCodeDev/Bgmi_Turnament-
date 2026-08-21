export type TournamentStatus = "LIVE" | "UPCOMING" | "REGISTRATION OPEN" | "COMPLETED";

export type TournamentMode = "SOLO" | "DUO" | "SQUAD" | "TDM";

export interface Tournament {
  id: string;
  name: string;
  short: string;
  game: string;
  status: TournamentStatus;
  mode: TournamentMode;
  prizePool: string;
  entryFee: string;
  teams: number;
  teamsJoined: number;
  date: string;
  time: string;
  format: string;
  map: string;
  rules: string[];
  image: string;
}

export interface Team {
  id: string;
  name: string;
  short: string;
  tag: string;
  points: number;
  matches: number;
  wins: number;
  kills: number;
  placement: number;
  earnings: string;
  captain: string;
  roster: string[];
}

export interface Player {
  id: string;
  name: string;
  igl: string;
  uid: string;
  team: string;
  teamId: string;
  role: string;
  matches: number;
  wins: number;
  kills: number;
  kd: number;
  winRate: number;
  earnings: string;
}

export interface LiveMatch {
  id: string;
  map: string;
  roomId: string;
  password: string;
  startTime: string;
  status: string;
  timer: string;
  teams: Team[];
  killFeed: { killer: string; victim: string; weapon: string }[];
}

export const tournaments: Tournament[] = [
  {
    id: "t-001",
    name: "BGMI Championship Series",
    short: "CHAMPIONSHIP SERIES",
    game: "BGMI",
    status: "LIVE",
    mode: "SQUAD",
    prizePool: "₹5,00,000",
    entryFee: "₹199",
    teams: 128,
    teamsJoined: 128,
    date: "21 AUG",
    time: "08:30 PM",
    format: "League + Grand Final",
    map: "ERANGEL",
    image: "/images/bgmi-1.jpg",
    rules: [
      "Each team must have 4 players + 1 substitute.",
      "Custom room to be provided by organizer.",
      "Screenshots required for every match result.",
      "Any form of cheating leads to instant ban.",
      "No refund after tournament starts.",
    ],
  },
  {
    id: "t-002",
    name: "BGMI Rising Stars Cup",
    short: "RISING STARS CUP",
    game: "BGMI",
    status: "REGISTRATION OPEN",
    mode: "SQUAD",
    prizePool: "₹1,00,000",
    entryFee: "₹99",
    teams: 64,
    teamsJoined: 47,
    date: "24 AUG",
    time: "07:00 PM",
    format: "Point-Based League",
    map: "MIRAMAR",
    image: "/images/bgmi-2.jpg",
    rules: [
      "Amateur teams only, max rank Ace.",
      "3 matches guaranteed.",
      "Room details shared 30 min before start.",
    ],
  },
  {
    id: "t-003",
    name: "BGMI Pro League S3",
    short: "PRO LEAGUE S3",
    game: "BGMI",
    status: "UPCOMING",
    mode: "SQUAD",
    prizePool: "₹10,00,000",
    entryFee: "₹499",
    teams: 256,
    teamsJoined: 182,
    date: "02 SEP",
    time: "08:00 PM",
    format: "Group Stage + Playoffs",
    map: "ERANGEL",
    image: "/images/bgmi-3.jpg",
    rules: [
      "Open qualifiers for all teams.",
      "Top 16 teams reach playoffs.",
      "LAN finals for top 8.",
    ],
  },
  {
    id: "t-004",
    name: "BGMI TDM Showdown",
    short: "TDM SHOWDOWN",
    game: "BGMI",
    status: "UPCOMING",
    mode: "TDM",
    prizePool: "₹75,000",
    entryFee: "₹49",
    teams: 32,
    teamsJoined: 21,
    date: "28 AUG",
    time: "06:30 PM",
    format: "Knockout",
    map: "WAREHOUSE",
    image: "/images/bgmi-4.jpg",
    rules: [
      "1v1 TDM format.",
      "Best of 3 rounds.",
      "M416 + AKM only.",
    ],
  },
  {
    id: "t-005",
    name: "BGMI Solo Survivor",
    short: "SOLO SURVIVOR",
    game: "BGMI",
    status: "REGISTRATION OPEN",
    mode: "SOLO",
    prizePool: "₹50,000",
    entryFee: "₹29",
    teams: 96,
    teamsJoined: 64,
    date: "30 AUG",
    time: "09:00 PM",
    format: "Solo Point Battle",
    map: "SANHOK",
    image: "/images/bgmi-5.jpg",
    rules: [
      "Solo entry only.",
      "2 matches, combined points.",
      "Kill points +1, placement points as per scoring.",
    ],
  },
  {
    id: "t-006",
    name: "BGMI Community Clash",
    short: "COMMUNITY CLASH",
    game: "BGMI",
    status: "COMPLETED",
    mode: "SQUAD",
    prizePool: "₹25,000",
    entryFee: "FREE",
    teams: 48,
    teamsJoined: 48,
    date: "15 AUG",
    time: "05:00 PM",
    format: "Single League",
    map: "ERANGEL",
    image: "/images/bgmi-6.jpg",
    rules: ["Community event, results published."],
  },
  {
    id: "t-007",
    name: "BGMI Scrim Showcase",
    short: "SCRIM SHOWCASE",
    game: "BGMI",
    status: "UPCOMING",
    mode: "SQUAD",
    prizePool: "₹15,000",
    entryFee: "FREE",
    teams: 24,
    teamsJoined: 12,
    date: "01 SEP",
    time: "10:00 PM",
    format: "Practice Scrims",
    map: "LIVIK",
    image: "/images/bgmi-7.jpg",
    rules: ["Practice scrims, no entry fee."],
  },
  {
    id: "t-008",
    name: "BGMI Champions Invite",
    short: "CHAMPIONS INVITE",
    game: "BGMI",
    status: "UPCOMING",
    mode: "SQUAD",
    prizePool: "₹20,00,000",
    entryFee: "INVITE",
    teams: 24,
    teamsJoined: 0,
    date: "15 SEP",
    time: "07:30 PM",
    format: "Invitational LAN",
    map: "ERANGEL",
    image: "/images/bgmi-8.jpg",
    rules: ["Invite-only top teams.", "LAN finals in Mumbai."],
  },
];

export const teams: Team[] = [
  {
    id: "team-nova",
    name: "Team Nova",
    short: "NOVA",
    tag: "NV",
    points: 42,
    matches: 6,
    wins: 3,
    kills: 64,
    placement: 1.8,
    earnings: "₹2,10,000",
    captain: "Viper",
    roster: ["Viper", "Blitz", "Cipher", "Frost", "Rogue"],
  },
  {
    id: "team-titans",
    name: "Team Titans",
    short: "TITANS",
    tag: "TT",
    points: 39,
    matches: 6,
    wins: 2,
    kills: 58,
    placement: 2.3,
    earnings: "₹1,60,000",
    captain: "Apex",
    roster: ["Apex", "Shadow", "Kraken", "Echo", "Volt"],
  },
  {
    id: "team-phoenix",
    name: "Team Phoenix",
    short: "PHOENIX",
    tag: "PX",
    points: 37,
    matches: 6,
    wins: 2,
    kills: 61,
    placement: 2.7,
    earnings: "₹1,25,000",
    captain: "Blaze",
    roster: ["Blaze", "Nitro", "Ghost", "Vortex", "Sage"],
  },
  {
    id: "team-legacy",
    name: "Team Legacy",
    short: "LEGACY",
    tag: "LG",
    points: 31,
    matches: 6,
    wins: 1,
    kills: 49,
    placement: 3.4,
    earnings: "₹90,000",
    captain: "Reaper",
    roster: ["Reaper", "Falcon", "Drift", "Onyx", "Titan"],
  },
  {
    id: "team-viper",
    name: "Team Vipers",
    short: "VIPERS",
    tag: "VP",
    points: 28,
    matches: 6,
    wins: 1,
    kills: 45,
    placement: 3.9,
    earnings: "₹75,000",
    captain: "Fang",
    roster: ["Fang", "Venom", "Strike", "Hawk", "Cyclone"],
  },
  {
    id: "team-renegade",
    name: "Team Renegade",
    short: "RENEGADE",
    tag: "RG",
    points: 25,
    matches: 6,
    wins: 1,
    kills: 42,
    placement: 4.2,
    earnings: "₹60,000",
    captain: "Outlaw",
    roster: ["Outlaw", "Maestro", "Zenith", "Comet", "Rider"],
  },
  {
    id: "team-rogue",
    name: "Team Rogue",
    short: "ROGUE",
    tag: "RQ",
    points: 22,
    matches: 6,
    wins: 0,
    kills: 39,
    placement: 4.8,
    earnings: "₹40,000",
    captain: "Maverick",
    roster: ["Maverick", "Pulse", "Orion", "Dusk", "Flare"],
  },
  {
    id: "team-cyclone",
    name: "Team Cyclone",
    short: "CYCLONE",
    tag: "CY",
    points: 19,
    matches: 6,
    wins: 0,
    kills: 35,
    placement: 5.1,
    earnings: "₹25,000",
    captain: "Storm",
    roster: ["Storm", "Raze", "Bolt", "Phantom", "Kilo"],
  },
];

export const players: Player[] = [
  { id: "p-001", name: "Viper", igl: "Nova", uid: "5401234567", team: "Team Nova", teamId: "team-nova", role: "IGL / Assault", matches: 128, wins: 24, kills: 643, kd: 5.02, winRate: 18.7, earnings: "₹8,50,000" },
  { id: "p-002", name: "Apex", igl: "Titans", uid: "5407654321", team: "Team Titans", teamId: "team-titans", role: "IGL / Sniper", matches: 141, wins: 22, kills: 598, kd: 4.24, winRate: 15.6, earnings: "₹6,20,000" },
  { id: "p-003", name: "Blaze", igl: "Phoenix", uid: "5402345678", team: "Team Phoenix", teamId: "team-phoenix", role: "Assault", matches: 110, wins: 19, kills: 571, kd: 5.19, winRate: 17.2, earnings: "₹4,90,000" },
  { id: "p-004", name: "Reaper", igl: "Legacy", uid: "5408765432", team: "Team Legacy", teamId: "team-legacy", role: "Support", matches: 135, wins: 18, kills: 512, kd: 3.79, winRate: 13.3, earnings: "₹3,70,000" },
  { id: "p-005", name: "Fang", igl: "Vipers", uid: "5403456789", team: "Team Vipers", teamId: "team-viper", role: "Assault", matches: 98, wins: 15, kills: 463, kd: 4.72, winRate: 15.3, earnings: "₹2,90,000" },
  { id: "p-006", name: "Outlaw", igl: "Renegade", uid: "5409876543", team: "Team Renegade", teamId: "team-renegade", role: "IGL", matches: 120, wins: 14, kills: 428, kd: 3.56, winRate: 11.6, earnings: "₹2,30,000" },
  { id: "p-007", name: "Maverick", igl: "Rogue", uid: "5404567890", team: "Team Rogue", teamId: "team-rogue", role: "Sniper", matches: 87, wins: 11, kills: 391, kd: 4.49, winRate: 12.6, earnings: "₹1,60,000" },
  { id: "p-008", name: "Storm", igl: "Cyclone", uid: "5401098765", team: "Team Cyclone", teamId: "team-cyclone", role: "Assault", matches: 76, wins: 9, kills: 344, kd: 4.52, winRate: 11.8, earnings: "₹1,10,000" },
];

export const leaderboard: Team[] = [...teams].sort((a, b) => b.points - a.points);

export const liveMatch: LiveMatch = {
  id: "MATCH 04",
  map: "ERANGEL",
  roomId: "12345678",
  password: "ARENA2024",
  startTime: "08:30 PM",
  status: "LIVE",
  timer: "24:18",
  teams: [
    teams[0],
    teams[1],
    teams[2],
    teams[3],
  ],
  killFeed: [
    { killer: "Viper", victim: "Shadow", weapon: "M416" },
    { killer: "Blaze", victim: "Falcon", weapon: "AKM" },
    { killer: "Apex", victim: "Kraken", weapon: "DP-28" },
    { killer: "Reaper", victim: "Ghost", weapon: "M762" },
    { killer: "Fang", victim: "Echo", weapon: "UMP45" },
    { killer: "Outlaw", victim: "Nitro", weapon: "M416" },
  ],
};

export const heroStats = [
  { value: 128, label: "TEAMS" },
  { value: 512, label: "PLAYERS" },
  { value: 500000, label: "PRIZE POOL", currency: true },
  { value: 4, label: "LIVE MATCHES", pad: true },
];

export const modes = ["SOLO", "DUO", "SQUAD", "TDM", "CHAMPIONSHIP", "SCRIMS"];

export const bracketStages = ["QUALIFIERS", "ROUND 16", "SEMIFINAL", "GRAND FINAL"];

export const scoringRules = [
  { placement: 1, points: 15 },
  { placement: 2, points: 12 },
  { placement: 3, points: 10 },
  { placement: 4, points: 8 },
  { placement: 5, points: 6 },
  { placement: 6, points: 5 },
  { placement: 7, points: 4 },
  { placement: 8, points: 3 },
];

export const navLinks = [
  { label: "ARENA", href: "#arena" },
  { label: "TOURNAMENTS", href: "#tournaments" },
  { label: "LIVE", href: "#live" },
  { label: "LEADERBOARD", href: "#leaderboard" },
  { label: "CHAMPIONS", href: "#champions" },
];
