# 🎬 toStream — Complete Vibe Coding Guide
> Zero budget · India-safe · No prior knowledge needed · Build with AI prompts

---

## Table of Contents

1. [What You're Building](#1-what-youre-building)
2. [India-Safe Technology Notice](#2-india-safe-technology-notice)
3. [Tech Stack](#3-tech-stack)
4. [Accounts to Create](#4-accounts-to-create)
5. [Software to Install](#5-software-to-install)
6. [Project File Structure](#6-project-file-structure)
7. [Database Design](#7-database-design)
8. [Environment Variables](#8-environment-variables)
9. [Phase 0 — One-Time Account Setup](#9-phase-0--one-time-account-setup)
10. [Phase 1 — Project Initialization](#10-phase-1--project-initialization)
11. [Phase 2 — Database Connection](#11-phase-2--database-connection)
12. [Phase 3 — Authentication System](#12-phase-3--authentication-system)
13. [Phase 4 — Room Management](#13-phase-4--room-management)
14. [Phase 5 — Signaling Server (Socket.io)](#14-phase-5--signaling-server-socketio)
15. [Phase 6 — WebRTC Core (Frontend)](#15-phase-6--webrtc-core-frontend)
16. [Phase 7 — Stream Modes](#16-phase-7--stream-modes)
17. [Phase 8 — Frontend Pages](#17-phase-8--frontend-pages)
18. [Phase 9 — UI & Styling](#18-phase-9--ui--styling)
19. [Phase 10 — Security Hardening](#19-phase-10--security-hardening)
20. [Phase 11 — SEO, Meta & Extras](#20-phase-11--seo-meta--extras)
21. [Phase 12 — Deployment](#21-phase-12--deployment)
22. [Phase 13 — Review & QA Checklist](#22-phase-13--review--qa-checklist)
23. [Testing Guide](#23-testing-guide)
24. [Pages & Navigation Map](#24-pages--navigation-map)
25. [Stitch Theme Prompts](#25-stitch-theme-prompts)
26. [Common Errors Quick Reference](#26-common-errors-quick-reference)
27. [Future Improvements](#27-future-improvements)
28. [Complete File List](#28-complete-file-list)

---

## 1. What You're Building

**toStream** is a private, secure, lag-free streaming app for exactly two friends.

### Features
- **Camera + Voice** — see and talk to each other in real time (like a private video call)
- **URL Video + Voice** — paste a YouTube link or any video URL, watch it together in perfect sync while talking
- **Music + Voice** — play music from your device while your friend hears both the music and your voice
- **Private Rooms** — each room has a unique link you share only with your friend
- **Optional Room Password** — extra protection on sensitive rooms
- **Room History** — see your past rooms on the dashboard
- **Secure by default** — all video/audio is peer-to-peer encrypted (WebRTC DTLS-SRTP)

### How It Works (simple)
```
You open toStream → create a room → copy the link → send to friend
Friend opens link → joins room → WebRTC connects you directly
No video/audio touches the server — it's peer-to-peer and encrypted
```

---

## 2. India-Safe Technology Notice

These services are **blocked or unreliable** in India — this guide does NOT use them:

| Service | Status in India | Why Avoided |
|---|---|---|
| Supabase | ❌ Hard blocked since Feb 24 2026 | Section 69A IT Act block on Jio, Airtel, ACT |
| Firebase | ⚠️ Risky (ISP disruptions on Jio) | Realtime DB failures reported Jul 2025 |
| PlanetScale | ⚠️ Reportedly slow in India | No India region |

This guide uses only services confirmed working in India on Jio/Airtel/BSNL/ACT.

---

## 3. Tech Stack

| Layer | Technology | Cost | Why This |
|---|---|---|---|
| Frontend | HTML + CSS + Vanilla JS | Free | No build step, works everywhere, easy to vibe code |
| Backend | Node.js 20 + Express 5 | Free | Most supported, huge community, runs on Render free |
| Real-time | Socket.io 4 | Free | Signaling for WebRTC + video sync |
| P2P Streaming | WebRTC (browser built-in) | Free | Direct encrypted peer-to-peer, no server cost for media |
| TURN Server | OpenRelayProject | Free (20GB/mo) | NAT traversal so WebRTC works on Jio/Airtel, India accessible |
| Database | MongoDB Atlas | Free (512MB) | Mumbai region available, no India blocks, generous free tier |
| Auth | Custom JWT + bcrypt | Free | No external dependency, cannot be blocked |
| Backend Hosting | Render.com | Free | Node.js hosting, no credit card, India accessible |
| Frontend Hosting | Vercel | Free | Global CDN with India PoPs, instant deploy from GitHub |
| Code & CI/CD | GitHub | Free | Connects to both Render and Vercel for auto-deploy |
| Security | Helmet + express-rate-limit + cors | Free | npm packages, no cost |

---

## 4. Accounts to Create

Create all of these before writing a single line of code. All are free, all work in India.

### 4.1 GitHub — https://github.com
- Click Sign Up → email + password + username
- Verify email
- Used for: storing your code, auto-deploying to Render and Vercel

### 4.2 MongoDB Atlas — https://cloud.mongodb.com
- Click Try Free → email signup or Google
- Choose **FREE tier (M0 Sandbox)** — do not add a credit card
- Cloud provider: AWS · Region: **ap-south-1 (Mumbai)** — closest to India
- Cluster name: `tostream-cluster`
- Create a database user: username + strong password → **save these** → you'll put them in your `.env`
- Network Access → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`) for now
- Connect → Drivers → Copy the connection string (looks like `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`)

### 4.3 OpenRelayProject — https://openrelayproject.org
- Click Get Started → create free account
- Go to your dashboard → copy your TURN credentials:
  - **URL:** `turn:openrelay.metered.ca:80`
  - **Username:** `openrelayproject`
  - **Credential:** `openrelayproject`
- Free plan: 20GB relay per month (enough for ~60 hours of video)
- Used for: helping WebRTC connect when your friend is behind a strict firewall/NAT (very common on mobile data in India)

### 4.4 Render.com — https://render.com
- Click Get Started → Sign up with GitHub (easiest)
- Used for: running your Node.js server 24/7 for free
- Free tier: 512MB RAM, sleeps after 15 min of inactivity (acceptable for MVP)

### 4.5 Vercel — https://vercel.com
- Click Sign Up → Continue with GitHub
- Used for: hosting your HTML/CSS/JS frontend with global CDN
- Free tier: unlimited static deployments

---

## 5. Software to Install

### On Your Computer

**Node.js 20 LTS** → https://nodejs.org
- Download the "LTS" version (not Current)
- Run the installer
- Verify: open terminal → type `node --version` → should show `v20.x.x`
- npm comes bundled — verify: `npm --version` → should show `10.x.x`

**Git** → https://git-scm.com
- Download for your OS, run installer, keep all defaults
- Verify: `git --version`
- First-time setup (run these in terminal):
  ```
  git config --global user.name "Your Name"
  git config --global user.email "your@email.com"
  ```

**VS Code** → https://code.visualstudio.com
- Download and install
- Recommended extensions (search in Extensions tab):
  - `ESLint` — catches code errors
  - `Prettier` — auto-formats code
  - `GitLens` — shows git history
  - `Thunder Client` — test your API without Postman

**Chrome or Firefox** — latest version, for testing WebRTC

---

## 6. Project File Structure

Every single file you will create. Build them in this exact order.

```
tostream/
│
├── .env                          ← Secrets. NEVER push to GitHub.
├── .env.example                  ← Template with no real values. Push this.
├── .gitignore                    ← Tells git what to ignore.
├── .nvmrc                        ← Locks Node.js version to 20
├── package.json                  ← Dependencies and scripts
├── server.js                     ← Main entry point. Starts everything.
├── README.md                     ← Project docs
│
├── config/
│   └── db.js                     ← MongoDB Atlas connection
│
├── middleware/
│   ├── auth.js                   ← JWT verification (protects routes)
│   ├── rateLimit.js              ← Stops brute-force attacks
│   └── validate.js               ← Input validation helpers
│
├── models/
│   ├── User.js                   ← User schema (MongoDB)
│   └── Room.js                   ← Room schema (MongoDB)
│
├── routes/
│   ├── auth.js                   ← /api/auth/register, login, me, logout
│   └── rooms.js                  ← /api/rooms/create, join, history, delete
│
├── socket/
│   └── signaling.js              ← All Socket.io real-time events
│
└── public/                       ← Everything the browser sees
    │
    ├── index.html                ← Landing page (/)
    ├── login.html                ← Login (/login.html)
    ├── register.html             ← Register (/register.html)
    ├── dashboard.html            ← Dashboard after login (/dashboard.html)
    ├── room.html                 ← Streaming room (/room.html?id=ROOM_ID)
    ├── 404.html                  ← Page not found
    ├── favicon.ico               ← Browser tab icon
    ├── robots.txt                ← Search engine instructions
    ├── manifest.json             ← PWA metadata
    │
    ├── css/
    │   ├── main.css              ← Global styles, CSS variables, reset
    │   ├── auth.css              ← Login + register styles
    │   ├── dashboard.css         ← Dashboard styles
    │   └── room.css              ← Streaming room styles
    │
    └── js/
        ├── config.js             ← Frontend constants (server URL, etc.)
        ├── utils.js              ← Shared helpers (toast, token, redirect)
        ├── auth.js               ← Login/register form logic
        ├── dashboard.js          ← Dashboard: create/join room
        ├── room.js               ← Room coordinator (entry point for room page)
        ├── webrtc.js             ← WebRTC peer connection manager
        ├── socket-client.js      ← Socket.io client connection
        ├── video-sync.js         ← YouTube + URL video sync
        └── music.js              ← Music + voice Web Audio mixer
```

**Total: 32 files.** Build one at a time.

---

## 7. Database Design

### Collection 1: `users`

```
Field          Type        Constraints                     Purpose
────────────────────────────────────────────────────────────────────
_id            ObjectId    auto-generated                  Primary key
username       String      required, unique, 3–20 chars,   Display name
                           alphanumeric + underscore only
email          String      required, unique, lowercase     Login identifier
password       String      required, bcrypt hash           Security
createdAt      Date        default: Date.now               Audit
lastLoginAt    Date        updated on every login          Activity tracking
isActive       Boolean     default: true                   Soft delete / ban
roomHistory    [String]    max 20 room IDs                 Recent rooms list
```

**Indexes:**
- `email` — unique index (fast login lookup)
- `username` — unique index (fast username check)

---

### Collection 2: `rooms`

```
Field              Type        Constraints                  Purpose
──────────────────────────────────────────────────────────────────────
_id                ObjectId    auto-generated               Internal key
roomId             String      required, unique, 10 chars   Used in share URLs
name               String      optional, max 50 chars       Display name
createdBy          ObjectId    ref: User                    Owner
participants       Array       max 2 objects                Who is currently in
  └ userId         ObjectId    ref: User
  └ socketId       String      current socket ID
  └ joinedAt       Date
maxParticipants    Number      default: 2                   Limit enforcement
mode               String      enum: camera/url-video/music Current stream mode
isActive           Boolean     default: true                Is room usable
roomPassword       String      optional, bcrypt hash        Private room
videoUrl           String      optional                     For url-video mode
videoState         Object      { playing, currentTime, ts } Sync state
  └ playing        Boolean
  └ currentTime    Number      seconds
  └ lastUpdated    Date
createdAt          Date        default: Date.now             Audit
expiresAt          Date        createdAt + 24 hours          Auto cleanup
```

**Indexes:**
- `roomId` — unique index
- `expiresAt` — TTL index (MongoDB auto-deletes documents after this date)
- `isActive + createdBy` — compound index for dashboard history query

---

## 8. Environment Variables

### `.env` — Never commit this file

```env
# ─── Server ───────────────────────────────────────
PORT=3000
NODE_ENV=development

# ─── MongoDB Atlas ────────────────────────────────
MONGODB_URI=mongodb+srv://YOUR_DB_USER:YOUR_DB_PASS@cluster0.xxxxx.mongodb.net/tostream?retryWrites=true&w=majority

# ─── JWT Auth ─────────────────────────────────────
# Generate a secret: open terminal, type: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=paste_your_64_character_random_string_here
JWT_EXPIRES_IN=7d

# ─── CORS ─────────────────────────────────────────
CLIENT_URL=http://localhost:3000

# ─── TURN Server (OpenRelayProject) ───────────────
TURN_SERVER_URL=turn:openrelay.metered.ca:80
TURN_SERVER_URL_TCP=turn:openrelay.metered.ca:443?transport=tcp
TURN_SERVER_USERNAME=openrelayproject
TURN_SERVER_CREDENTIAL=openrelayproject
STUN_SERVER_URL=stun:stun.l.google.com:19302

# ─── Rate Limiting ────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10
ROOM_CREATE_RATE_LIMIT_MAX=5
```

### `.env.example` — Safe to commit

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_uri_here
JWT_SECRET=your_64_character_random_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
TURN_SERVER_URL=your_turn_server_url
TURN_SERVER_URL_TCP=your_turn_server_url_tcp
TURN_SERVER_USERNAME=your_turn_username
TURN_SERVER_CREDENTIAL=your_turn_credential
STUN_SERVER_URL=stun:stun.l.google.com:19302
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10
ROOM_CREATE_RATE_LIMIT_MAX=5
```

---

## 9. Phase 0 — One-Time Account Setup

### Step 0.1 — Generate a JWT Secret

Open your terminal and run:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output — paste it as `JWT_SECRET` in your `.env`.

**Error:** `node: command not found`
→ Node.js is not installed. Go back to Section 5 and install it.

### Step 0.2 — Create GitHub Repository

```bash
# In your terminal, create a new folder and initialize git:
mkdir tostream
cd tostream
git init
git branch -M main
```

Then on GitHub.com: New repository → name it `tostream` → **do not** add README (you'll push your own) → Copy the repo URL.

```bash
git remote add origin https://github.com/YOUR_USERNAME/tostream.git
```

### Step 0.3 — Confirm MongoDB Connection String

Your connection string from Atlas should look like:
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/tostream?retryWrites=true&w=majority
```

**Important:** If your password contains `@`, `#`, `%`, `+`, `:`, `/`, or `?` — replace them with their URL-encoded versions:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `+` → `%2B`
- `:` → `%3A`

---

## 10. Phase 1 — Project Initialization

### Step 1.1 — package.json

**AI Prompt (paste this exactly):**
```
Create a package.json for a Node.js project called "tostream".

Description: "Private streaming app for two friends"
Version: 1.0.0
Main: server.js
Node engine: >=20.0.0

Scripts:
  start: node server.js
  dev: nodemon server.js

Dependencies (exact packages):
  express: ^5.0.0
  mongoose: ^8.0.0
  socket.io: ^4.7.0
  bcryptjs: ^2.4.3
  jsonwebtoken: ^9.0.0
  cors: ^2.8.5
  helmet: ^7.0.0
  express-rate-limit: ^7.0.0
  express-validator: ^7.0.0
  dotenv: ^16.0.0
  nanoid: ^3.3.7
  morgan: ^1.10.0
  compression: ^1.7.4

DevDependencies:
  nodemon: ^3.0.0

Note: nanoid v3 (not v4) because v4 is ESM-only and this project uses CommonJS (require).
```

After generating `package.json`, run in terminal:
```bash
npm install
```

**Error:** `npm WARN deprecated`
→ Safe to ignore. Warnings are not errors.

**Error:** `EACCES: permission denied`
→ Mac/Linux: `sudo npm install`  
→ Windows: Open terminal as Administrator

**Error:** `npm ERR! code ERESOLVE`
→ Run: `npm install --legacy-peer-deps`

### Step 1.2 — .gitignore

**AI Prompt:**
```
Create a .gitignore for a Node.js project. Include:
node_modules/
.env
.DS_Store
*.log
npm-debug.log*
.nyc_output
coverage/
dist/
.cache/
*.local
Thumbs.db
```

### Step 1.3 — .nvmrc

Create a file called `.nvmrc` with this single line:
```
20
```
This tells any tool to use Node.js 20.

### Step 1.4 — server.js

**AI Prompt:**
```
Create server.js for the tostream Node.js app. Use CommonJS (require syntax, not import).

Requirements in order:
1. Load dotenv at the very top: require('dotenv').config()
2. Import: express, http (built-in), cors, helmet, morgan, compression, path (built-in)
3. Import routes: ./routes/auth and ./routes/rooms
4. Import: ./config/db (database connection)
5. Import: ./socket/signaling

Create Express app:
- app.use(helmet()) for security headers
- app.use(compression()) for gzip
- CORS: origin is CLIENT_URL from env (allow credentials: true, methods: GET,POST,DELETE,OPTIONS, allowedHeaders: Content-Type,Authorization)
- app.use(express.json({ limit: '10kb' })) — body parser, limited to 10kb to prevent payload attacks
- In development only: app.use(morgan('dev'))
- Mount /api/auth from routes/auth
- Mount /api/rooms from routes/rooms (will add JWT protection in Phase 3)
- Serve public/ folder as static files: app.use(express.static(path.join(__dirname, 'public')))
- Catch-all route: any GET not matched → serve public/404.html
- Create HTTP server: const server = http.createServer(app)
- Attach Socket.io to server with CORS same as Express
- Call initSignaling(io) from signaling.js
- Call connectDB() from db.js
- server.listen(PORT) where PORT = process.env.PORT || 3000
- Log: `toStream running on port ${PORT}`

Add process-level error handlers:
- process.on('uncaughtException') → log error + process.exit(1)
- process.on('unhandledRejection') → log reason + process.exit(1)
- process.on('SIGTERM') → close server gracefully then exit

All other files (routes, models, etc.) don't exist yet — add a try/catch or comment that they'll be created.
```

**Error:** `Cannot find module './routes/auth'`
→ Create empty placeholder files first:
```bash
mkdir config middleware models routes socket public public/css public/js
touch config/db.js middleware/auth.js middleware/rateLimit.js middleware/validate.js
touch models/User.js models/Room.js routes/auth.js routes/rooms.js socket/signaling.js
```

**Error:** `Error: listen EADDRINUSE :::3000`
→ Something is already using port 3000. Change `PORT=3001` in your `.env`.

---

## 11. Phase 2 — Database Connection

### Step 2.1 — config/db.js

**AI Prompt:**
```
Create config/db.js — MongoDB connection module for tostream. Use CommonJS.

Requirements:
- Import mongoose
- Export an async function called connectDB
- Set mongoose.set('strictQuery', false) before connecting
- Connect using MONGODB_URI from process.env
- On success: console.log(`MongoDB connected: ${connection.connection.host}`)
- On failure: console.error the error message + process.exit(1)
- Export the function as module.exports = connectDB
```

**Error:** `MongoServerSelectionError: Could not connect to any servers`
→ Fix 1: Check your MONGODB_URI in .env is exactly copied from Atlas (no spaces, no line breaks)
→ Fix 2: MongoDB Atlas → Network Access → confirm 0.0.0.0/0 is in the list
→ Fix 3: Your Atlas password has special characters — URL-encode them (see Phase 0 Step 0.3)
→ Fix 4: Your IP was auto-removed from Atlas whitelist — re-add 0.0.0.0/0

**Error:** `MongoParseError: URI malformed`
→ Your connection string has a typo. Copy it fresh from Atlas.

**Edge Case:** App starts before MongoDB connects.
→ Make sure `connectDB()` is called and awaited before `server.listen()` in server.js.

---

## 12. Phase 3 — Authentication System

### Step 3.1 — models/User.js

**AI Prompt:**
```
Create models/User.js — Mongoose user schema for tostream. Use CommonJS.

Schema fields:
- username: String, required, unique, trim, minlength: 3, maxlength: 20, match: /^[a-zA-Z0-9_]+$/ (only letters, numbers, underscore)
- email: String, required, unique, lowercase, trim
- password: String, required, minlength: 8 (will be hashed, not validated as readable)
- createdAt: Date, default: Date.now
- lastLoginAt: Date, no default
- isActive: Boolean, default: true
- roomHistory: [String], default: [], max 20 entries (trim oldest when adding new)

Pre-save middleware:
- If password is not modified, skip
- If password IS modified: hash with bcryptjs, cost factor 12
- this.password = await bcrypt.hash(this.password, 12)

Instance methods:
- comparePassword(candidatePassword): async, returns boolean, uses bcrypt.compare
- addToHistory(roomId): adds roomId to front of roomHistory, keeps max 20, saves

Static methods:
- findByEmail(email): returns User.findOne({ email: email.toLowerCase() })

Model export: use mongoose.models.User || mongoose.model('User', UserSchema) to avoid OverwriteModelError
```

**Error:** `OverwriteModelError: Cannot overwrite User model once compiled`
→ The `mongoose.models.User ||` guard in the export fixes this. Make sure it's there.

**Error:** `ValidationError: username: Path username is required`
→ The request body isn't being parsed. Ensure `express.json()` is in server.js.

### Step 3.2 — models/Room.js

**AI Prompt:**
```
Create models/Room.js — Mongoose room schema for tostream. Use CommonJS.

Schema fields:
- roomId: String, required, unique, trim (10-char nanoid)
- name: String, optional, maxlength: 50, trim, default: ''
- createdBy: ObjectId, ref: 'User', required
- participants: Array of:
    { userId: { type: ObjectId, ref: 'User' }, socketId: String, joinedAt: { type: Date, default: Date.now } }
  default: []
- maxParticipants: Number, default: 2
- mode: String, enum: ['camera', 'url-video', 'music'], default: 'camera'
- isActive: Boolean, default: true
- roomPassword: String, optional (bcrypt hash, stored if user sets a password)
- videoUrl: String, optional, default: ''
- videoState: {
    playing: { type: Boolean, default: false },
    currentTime: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }
- createdAt: Date, default: Date.now
- expiresAt: Date, default: () => new Date(Date.now() + 24*60*60*1000)  ← 24 hours from now

Instance methods:
- isFull(): return this.participants.length >= this.maxParticipants
- hasParticipant(userId): return this.participants.some(p => p.userId.toString() === userId.toString())
- isExpired(): return new Date() > this.expiresAt

Static methods:
- findActiveByRoomId(roomId): findOne where roomId matches, isActive true, expiresAt > now

Indexes:
- roomId: unique
- expiresAt: TTL index with expireAfterSeconds: 0 (MongoDB uses the date value itself)
- Compound: { isActive: 1, createdBy: 1 }

Export: mongoose.models.Room || mongoose.model('Room', RoomSchema)
```

### Step 3.3 — middleware/auth.js

**AI Prompt:**
```
Create middleware/auth.js — JWT authentication middleware for tostream. Use CommonJS.

Export a single function: protect(req, res, next)

Logic:
1. Get the Authorization header from req.headers.authorization
2. If header doesn't start with 'Bearer ' → return 401 { success: false, message: 'No token provided' }
3. Extract token: header.split(' ')[1]
4. Verify token with jwt.verify(token, process.env.JWT_SECRET)
5. If token is expired (catch TokenExpiredError) → return 401 { success: false, message: 'Token expired. Please login again.' }
6. If token is invalid (catch JsonWebTokenError) → return 401 { success: false, message: 'Invalid token.' }
7. Find user: User.findById(decoded.id).select('-password')
8. If user not found → return 401 { success: false, message: 'User not found.' }
9. If user.isActive === false → return 403 { success: false, message: 'Account has been disabled.' }
10. Attach user to req: req.user = user
11. Call next()

Import User model and jsonwebtoken. Use CommonJS.
```

### Step 3.4 — middleware/rateLimit.js

**AI Prompt:**
```
Create middleware/rateLimit.js for tostream. Use CommonJS. Use express-rate-limit.

Export three rate limiters:

1. apiLimiter:
   - windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000 (15 min)
   - max: process.env.RATE_LIMIT_MAX || 100
   - message: { success: false, message: 'Too many requests. Please wait 15 minutes.' }
   - standardHeaders: true
   - legacyHeaders: false

2. authLimiter:
   - windowMs: 900000 (15 min)
   - max: process.env.AUTH_RATE_LIMIT_MAX || 10
   - message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' }
   - standardHeaders: true
   - legacyHeaders: false

3. roomCreateLimiter:
   - windowMs: 3600000 (1 hour)
   - max: process.env.ROOM_CREATE_RATE_LIMIT_MAX || 5
   - message: { success: false, message: 'Room creation limit reached. Try again in an hour.' }

module.exports = { apiLimiter, authLimiter, roomCreateLimiter }
```

### Step 3.5 — middleware/validate.js

**AI Prompt:**
```
Create middleware/validate.js for tostream input validation. Use CommonJS. Use express-validator.

Export a function: validate(req, res, next)
- Use validationResult(req) to get errors
- If errors is not empty: return 422 { success: false, errors: errors.array().map(e => ({ field: e.path, message: e.msg })) }
- If no errors: next()

Also export these validation rule arrays:

registerRules: [
  username: required, trim, isLength(3,20), matches /^[a-zA-Z0-9_]+$/ with message 'Username: letters, numbers, underscore only'
  email: required, normalizeEmail, isEmail with message 'Valid email required'
  password: required, isLength(8, 128), custom validator: must contain at least one letter and one number
  confirmPassword: required, custom validator: must equal password field
]

loginRules: [
  email: required, normalizeEmail, isEmail
  password: required, notEmpty
]

createRoomRules: [
  name: optional, trim, isLength(0, 50)
  mode: optional, isIn(['camera', 'url-video', 'music'])
  password: optional, if provided: isLength(4, 128)
]

joinRoomRules: [
  roomId: required, trim, isLength(10, 10), isAlphanumeric
  password: optional
]

Export: module.exports = { validate, registerRules, loginRules, createRoomRules, joinRoomRules }
```

### Step 3.6 — routes/auth.js

**AI Prompt:**
```
Create routes/auth.js — Express router for tostream authentication. Use CommonJS.

Import: express Router, User model, jsonwebtoken, express-validator body, auth middleware (protect), rateLimit (authLimiter), validate middleware and validation rules.

Helper function at top:
  generateToken(userId, username) → return jwt.sign({ id: userId, username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

Routes:

POST /register:
  Apply: authLimiter, registerRules, validate
  1. Check if email exists → 409 { success: false, message: 'Email already in use.' }
  2. Check if username exists (case-insensitive) → 409 { success: false, message: 'Username already taken.' }
  3. Create user: await User.create({ username, email, password }) — password hashed by pre-save hook
  4. Generate token
  5. Return 201 { success: true, token, user: { id: user._id, username: user.username, email: user.email, createdAt: user.createdAt } }
  Catch: 500 { success: false, message: 'Server error during registration.' }

POST /login:
  Apply: authLimiter, loginRules, validate
  1. Find user by email → if not found: 401 { success: false, message: 'Invalid email or password.' } (NEVER say which field is wrong)
  2. Compare password with user.comparePassword(password) → if false: same 401 message
  3. If user.isActive === false → 403 { success: false, message: 'Account disabled.' }
  4. Update user.lastLoginAt = Date.now(), save
  5. Generate token
  6. Return 200 { success: true, token, user: { id, username, email, lastLoginAt } }
  Catch: 500

GET /me:
  Apply: protect middleware
  Return 200 { success: true, user: req.user }

POST /logout:
  No auth required (stateless — client discards token)
  Return 200 { success: true, message: 'Logged out successfully.' }

module.exports = router
```

**Error:** `Cast to ObjectId failed for value undefined`
→ The `decoded.id` from JWT is wrong. Check your generateToken function is passing `user._id` not `user.id`.

**Error:** `ReferenceError: body is not defined`
→ You didn't import `body` from `express-validator`. Add it to the import.

**Edge Case:** User registers with email `User@Email.COM`
→ The `normalizeEmail()` in validators converts to lowercase before checking — so this matches `user@email.com`.

**Edge Case:** Username check is case-sensitive in MongoDB by default.
→ Use a case-insensitive regex: `User.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } })`

---

## 13. Phase 4 — Room Management

### Step 4.1 — routes/rooms.js

**AI Prompt:**
```
Create routes/rooms.js — Express router for tostream room management. Use CommonJS.

Import: express Router, Room model, User model, bcryptjs, nanoid (v3 destructured: const { nanoid } = require('nanoid')), protect middleware, roomCreateLimiter, createRoomRules, joinRoomRules, validate

All routes apply protect middleware first (require JWT).

POST /create:
  Apply: roomCreateLimiter, createRoomRules, validate
  1. Generate roomId: let roomId = nanoid(10). Make it URL-safe (nanoid default is safe).
  2. Check collision: if await Room.findOne({ roomId }) exists, regenerate up to 3 times. If still collides, 500 error.
  3. Build roomData object: { roomId, createdBy: req.user._id, participants: [{ userId: req.user._id }], mode: body.mode || 'camera', name: body.name || '' }
  4. If body.password provided and not empty: hash with bcrypt cost 10, set roomData.roomPassword = hash
  5. Create room: await Room.create(roomData)
  6. Add roomId to user's history: await User.findByIdAndUpdate(req.user._id, { $addToSet: { roomHistory: roomId } })
  7. Return 201 { success: true, room: { roomId, name, mode, createdAt, expiresAt, hasPassword: !!body.password } }
  Catch: 500

POST /join:
  Apply: joinRoomRules, validate
  1. Find room: Room.findActiveByRoomId(body.roomId)
  2. If not found: 404 { success: false, message: 'Room not found or has expired.' }
  3. If room.isExpired(): 410 { success: false, message: 'This room has expired.' }
  4. If room.isFull() and user is not already a participant: 403 { success: false, message: 'Room is full. Maximum 2 people.' }
  5. If room.hasParticipant(req.user._id) and room is not expired: user is already in, return room data (they may be rejoining after refresh)
  6. If room has roomPassword and !body.password: 401 { success: false, message: 'This room requires a password.' }
  7. If room has roomPassword: await bcrypt.compare(body.password, room.roomPassword) → if false: 403 { success: false, message: 'Incorrect room password.' }
  8. Add user to participants: room.participants.push({ userId: req.user._id })
  9. Save room
  10. Add to user history: User.findByIdAndUpdate(req.user._id, { $addToSet: { roomHistory: body.roomId } })
  11. Return 200 { success: true, room: { roomId, name, mode, createdAt, expiresAt } }
  Catch: 500

GET /history:
  1. Get user's roomHistory array from req.user (already populated by protect middleware)
  2. Find rooms: Room.find({ roomId: { $in: req.user.roomHistory } }).select('roomId name mode isActive createdAt expiresAt').sort({ createdAt: -1 }).limit(10)
  3. Map rooms to add isExpired boolean
  4. Return 200 { success: true, rooms }

GET /:roomId:
  1. Find room by roomId and isActive: true
  2. If not found: 404
  3. If not participant: 403 { success: false, message: 'You are not a participant in this room.' }
  4. Return 200 { success: true, room } (exclude roomPassword from response)

DELETE /:roomId:
  1. Find room
  2. If not found: 404
  3. If room.createdBy.toString() !== req.user._id.toString(): 403 { success: false, message: 'Only the room creator can delete this room.' }
  4. Set room.isActive = false, save
  5. Return 200 { success: true, message: 'Room closed.' }

module.exports = router
```

**Error:** `TypeError: nanoid is not a function`
→ nanoid v3 uses `const { nanoid } = require('nanoid')`. Make sure you installed v3 (`nanoid@3.3.7`) not v4.

**Error:** `CastError: Cast to ObjectId failed`
→ The userId comparison is wrong. Use `.toString()` on both sides when comparing ObjectIds.

**Edge Case:** Room ID contains characters that break URLs (`+`, `/`).
→ nanoid default alphabet is URL-safe (A-Z a-z 0-9 _-). No issue.

**Edge Case:** User joins their own room via the join endpoint (creator joining).
→ They're already in participants from /create. The hasParticipant check handles this — return room data without adding them twice.

**Edge Case:** Room password is an empty string `""`.
→ Treat as no password. Add check: `if (body.password && body.password.trim().length > 0)`.

---

## 14. Phase 5 — Signaling Server (Socket.io)

### Step 5.1 — socket/signaling.js

**AI Prompt:**
```
Create socket/signaling.js — All Socket.io real-time logic for tostream. Use CommonJS.

Export: module.exports = function initSignaling(io) { ... }

── Authentication Middleware ──
io.use(async (socket, next) => {
  - Get token from socket.handshake.auth.token
  - If no token: return next(new Error('Authentication required'))
  - Verify with JWT_SECRET
  - Find user by decoded.id (exclude password)
  - If not found: return next(new Error('User not found'))
  - Attach to socket: socket.user = { id: user._id.toString(), username: user.username }
  - Call next()
  - Catch any error: next(new Error('Authentication failed'))
})

── Connection Handler ──
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.user.username} [${socket.id}]`)

  ── Event: 'join-room' ──
  socket.on('join-room', async ({ roomId, password }) => {
    try:
      - Find room: Room.findActiveByRoomId(roomId)
      - If not found: emit 'room-error' { message: 'Room not found or expired.' } → return
      - If room.isExpired(): emit 'room-error' { message: 'Room has expired.' } → return
      - If room is full and user not already in it: emit 'room-error' { message: 'Room is full.' } → return
      - If room has password: compare with bcrypt → if wrong: emit 'room-error' { message: 'Wrong room password.' } → return
      - If user NOT already in participants: push { userId: socket.user.id, socketId: socket.id, joinedAt: new Date() }
      - If user IS in participants: update their socketId (they reconnected)
      - Save room
      - socket.join(roomId) — join the Socket.io room
      - socket.currentRoom = roomId — remember which room this socket is in
      - Get other sockets in this room: const others = await io.in(roomId).fetchSockets()
      - Emit 'room-joined' to THIS socket: { roomId, participants: room.participants.length, mode: room.mode, videoUrl: room.videoUrl }
      - Emit 'user-joined' to OTHER sockets in room: { userId: socket.user.id, username: socket.user.username }
      - If there are now exactly 2 people in the room: emit 'start-call' to the socket that joined FIRST (not the newcomer). The first joiner creates the WebRTC offer.
    catch (err): emit 'room-error' { message: 'Failed to join room.' }
  })

  ── Event: 'offer' ──
  socket.on('offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('offer', { offer, from: socket.user.id })
  })

  ── Event: 'answer' ──
  socket.on('answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('answer', { answer, from: socket.user.id })
  })

  ── Event: 'ice-candidate' ──
  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', { candidate, from: socket.user.id })
  })

  ── Event: 'video-sync' ──
  socket.on('video-sync', async ({ roomId, event, currentTime, videoUrl }) => {
    - Forward to others: socket.to(roomId).emit('video-sync', { event, currentTime, videoUrl, from: socket.user.id })
    - If event === 'play' or 'pause' or 'change-url': update room.videoState and room.videoUrl in DB (don't update DB on every seek, too frequent)
    catch: ignore errors silently (non-critical)
  })

  ── Event: 'mode-change' ──
  socket.on('mode-change', async ({ roomId, mode }) => {
    - Validate mode is in ['camera', 'url-video', 'music']
    - Update room.mode in DB
    - Forward to others: socket.to(roomId).emit('mode-changed', { mode, by: socket.user.username })
  })

  ── Event: 'leave-room' ──
  socket.on('leave-room', async ({ roomId }) => {
    handleLeave(socket, roomId)
  })

  ── Event: 'disconnect' ──
  socket.on('disconnect', async (reason) => {
    console.log(`Socket disconnected: ${socket.user.username} reason: ${reason}`)
    if (socket.currentRoom) {
      handleLeave(socket, socket.currentRoom)
    }
  })
})

── Helper: handleLeave ──
async function handleLeave(socket, roomId) {
  try:
    - socket.leave(roomId)
    - Find room by roomId
    - If room: remove this participant from room.participants (filter by socketId or userId)
    - If room.participants is now empty: set room.isActive = false
    - Save room
    - Emit 'user-left' to remaining sockets in room: { userId: socket.user.id, username: socket.user.username }
  catch: log error, don't throw
}
```

**Error:** `Error: Namespace / has no socket with id`
→ The target socket disconnected before the emit. Wrap all `io.to(socketId).emit()` calls in try/catch.

**Error:** `TypeError: Cannot read property 'join' of undefined`
→ You're calling socket.join before Socket.io authenticated the socket. Make sure the `io.use()` auth middleware runs first.

**Edge Case:** User opens two browser tabs and joins the same room.
→ They'd appear as two participants. Fix: in the 'join-room' handler, check if this user's userId already exists in participants. If so, update their socketId rather than adding a new entry.

**Edge Case:** Both users send 'start-call' signal at same time (race condition).
→ The first-joiner always creates the offer. Determine who joined first by checking joinedAt timestamp in participants array. The one with the earlier joinedAt gets the 'start-call' event.

**Edge Case:** Server restarts mid-call. All socket state is lost.
→ Users must rejoin. Frontend should detect disconnect (Socket.io reconnect event) and automatically re-emit 'join-room'.

**Edge Case:** Ice candidate arrives before remote description is set.
→ Buffer ICE candidates on the frontend until remote description is set. (Handled in webrtc.js in Phase 6.)

---

## 15. Phase 6 — WebRTC Core (Frontend)

### Step 6.1 — public/js/config.js

**AI Prompt:**
```
Create public/js/config.js — Frontend configuration constants for tostream.

Window-based constants (not module, use var/window for global access across script tags):

const TOSTREAM_CONFIG = {
  SERVER_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://YOUR_RENDER_APP_NAME.onrender.com',   // ← Replace before deploying

  TOKEN_KEY: 'tostream_token',
  USER_KEY: 'tostream_user',
  ROOM_KEY: 'tostream_current_room',

  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ]
}
```

**Important:** After deploying to Render, replace `YOUR_RENDER_APP_NAME` with your actual Render URL.

### Step 6.2 — public/js/utils.js

**AI Prompt:**
```
Create public/js/utils.js — Shared utility functions for tostream frontend. No modules, just global functions using var/function.

Functions:

getToken(): return localStorage.getItem(TOSTREAM_CONFIG.TOKEN_KEY)

setToken(token): localStorage.setItem(TOSTREAM_CONFIG.TOKEN_KEY, token)

removeToken(): localStorage.removeItem(TOSTREAM_CONFIG.TOKEN_KEY), localStorage.removeItem(TOSTREAM_CONFIG.USER_KEY)

getUser(): try { return JSON.parse(localStorage.getItem(TOSTREAM_CONFIG.USER_KEY)) } catch { return null }

setUser(user): localStorage.setItem(TOSTREAM_CONFIG.USER_KEY, JSON.stringify(user))

isLoggedIn(): return !!getToken()

redirectIfNotLoggedIn(): if (!isLoggedIn()) { window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.href); return true; } return false;

redirectIfLoggedIn(to): if (isLoggedIn()) { window.location.href = to || '/dashboard.html'; return true; } return false;

async apiFetch(endpoint, options):
  - Base URL from TOSTREAM_CONFIG.SERVER_URL
  - Always include headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() }
  - Merge with passed options
  - If response.status === 401: removeToken(), redirect to /login.html
  - Return response.json()
  - Catch: show toast error 'Cannot connect to server. Check your internet.'

showToast(message, type):
  - type: 'success' | 'error' | 'warning' | 'info' (default 'info')
  - Create div with class 'toast toast-{type}'
  - Set innerHTML to message
  - Append to #toast-container (create it if not exists, position: fixed bottom-left)
  - After 3500ms: add 'toast-hide' class, after 400ms more: remove from DOM
  - Max 3 toasts at once — remove oldest if more

copyToClipboard(text):
  - navigator.clipboard.writeText(text)
  - showToast('Copied to clipboard!', 'success')

getRoomIdFromUrl():
  - const params = new URLSearchParams(window.location.search)
  - return params.get('id')

formatDate(dateString): return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

isValidUrl(string): try { new URL(string); return true } catch { return false }
```

### Step 6.3 — public/js/socket-client.js

**AI Prompt:**
```
Create public/js/socket-client.js — Socket.io client module for tostream. No ES modules.

Assumes socket.io client is loaded from CDN in the HTML page.

Create and configure the socket (but don't connect automatically — wait for explicit connect call):

const socket = io(TOSTREAM_CONFIG.SERVER_URL, {
  autoConnect: false,
  auth: { token: getToken() },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
  timeout: 10000
})

socket.on('connect', function() {
  console.log('[Socket] Connected:', socket.id)
})

socket.on('connect_error', function(err) {
  console.error('[Socket] Connection error:', err.message)
  if (err.message === 'Authentication required' || err.message === 'Authentication failed' || err.message === 'User not found') {
    removeToken()
    window.location.href = '/login.html'
  }
})

socket.on('disconnect', function(reason) {
  console.log('[Socket] Disconnected:', reason)
  if (reason === 'io server disconnect') {
    showToast('Disconnected from server.', 'error')
  }
})

socket.on('reconnect', function(attemptNumber) {
  console.log('[Socket] Reconnected after', attemptNumber, 'attempts')
  showToast('Reconnected!', 'success')
})

socket.on('reconnect_attempt', function() {
  showToast('Reconnecting...', 'warning')
})

socket.on('reconnect_failed', function() {
  showToast('Could not reconnect. Please refresh the page.', 'error')
})

function connectSocket():
  socket.auth.token = getToken()  // refresh token in case it changed
  socket.connect()

function disconnectSocket(): socket.disconnect()
```

### Step 6.4 — public/js/webrtc.js

**AI Prompt:**
```
Create public/js/webrtc.js — WebRTC peer connection manager for tostream. No ES modules, global class.

class WebRTCManager {

  constructor(socket, roomId) {
    this.socket = socket
    this.roomId = roomId
    this.peerConnection = null
    this.localStream = null
    this.remoteStream = null
    this.iceCandidateBuffer = []  // buffer ICE candidates until remote desc is set
    this.remoteDescSet = false
    this.isMuted = false
    this.isCameraOff = false

    // Callbacks — room.js sets these
    this.onRemoteStream = null
    this.onConnectionStateChange = null
    this.onIceCandidateError = null
  }

  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection({ iceServers: TOSTREAM_CONFIG.ICE_SERVERS })

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', { roomId: this.roomId, candidate: event.candidate })
      }
    }

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0]
      if (this.onRemoteStream) this.onRemoteStream(this.remoteStream)
    }

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState
      console.log('[WebRTC] Connection state:', state)
      if (this.onConnectionStateChange) this.onConnectionStateChange(state)
      if (state === 'failed') this.handleConnectionFailed()
      if (state === 'disconnected') this.handleConnectionDropped()
    }

    this.peerConnection.onicecandidateerror = (event) => {
      console.warn('[WebRTC] ICE candidate error:', event.errorCode, event.errorText)
    }
  }

  async startLocalStream(constraints) {
    // constraints example: { video: true, audio: true }
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      return this.localStream
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('PERMISSION_DENIED')
      } else if (err.name === 'NotFoundError') {
        throw new Error('DEVICE_NOT_FOUND')
      } else {
        throw err
      }
    }
  }

  addLocalStreamToPeer() {
    if (!this.localStream || !this.peerConnection) return
    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream)
    })
  }

  async createOffer() {
    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)
    this.socket.emit('offer', { roomId: this.roomId, offer })
  }

  async handleOffer(offer) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    this.remoteDescSet = true
    await this.flushIceCandidateBuffer()
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    this.socket.emit('answer', { roomId: this.roomId, answer })
  }

  async handleAnswer(answer) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    this.remoteDescSet = true
    await this.flushIceCandidateBuffer()
  }

  async addIceCandidate(candidate) {
    if (this.remoteDescSet) {
      try { await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)) }
      catch (err) { console.warn('[WebRTC] addIceCandidate error:', err) }
    } else {
      this.iceCandidateBuffer.push(candidate)
    }
  }

  async flushIceCandidateBuffer() {
    while (this.iceCandidateBuffer.length > 0) {
      const candidate = this.iceCandidateBuffer.shift()
      try { await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)) }
      catch (err) { console.warn('[WebRTC] buffered ICE candidate error:', err) }
    }
  }

  toggleMute() {
    if (!this.localStream) return this.isMuted
    const audioTrack = this.localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      this.isMuted = !audioTrack.enabled
    }
    return this.isMuted
  }

  toggleCamera() {
    if (!this.localStream) return this.isCameraOff
    const videoTrack = this.localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      this.isCameraOff = !videoTrack.enabled
    }
    return this.isCameraOff
  }

  async replaceAudioTrack(newTrack) {
    const sender = this.peerConnection.getSenders().find(s => s.track && s.track.kind === 'audio')
    if (sender) await sender.replaceTrack(newTrack)
  }

  async replaceVideoTrack(newTrack) {
    const sender = this.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video')
    if (sender) await sender.replaceTrack(newTrack)
  }

  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      const videoTrack = screenStream.getVideoTracks()[0]
      await this.replaceVideoTrack(videoTrack)
      videoTrack.onended = () => this.stopScreenShare()
      return screenStream
    } catch (err) {
      if (err.name === 'NotAllowedError') throw new Error('SCREEN_SHARE_DENIED')
      throw err
    }
  }

  async stopScreenShare() {
    const videoTrack = this.localStream && this.localStream.getVideoTracks()[0]
    if (videoTrack) await this.replaceVideoTrack(videoTrack)
  }

  handleConnectionFailed() {
    showToast('Connection failed. Your network may be blocking video. Try a different network or refresh.', 'error')
  }

  handleConnectionDropped() {
    showToast('Connection dropped. Attempting to recover...', 'warning')
  }

  destroy() {
    if (this.localStream) this.localStream.getTracks().forEach(t => t.stop())
    if (this.peerConnection) this.peerConnection.close()
    this.localStream = null
    this.peerConnection = null
    this.remoteStream = null
    this.iceCandidateBuffer = []
    this.remoteDescSet = false
  }
}
```

**Error:** `DOMException: Failed to execute 'getUserMedia'` on insecure origin
→ WebRTC requires HTTPS or localhost. In development use `localhost` always. In production, Vercel and Render both provide free HTTPS.

**Error:** `NotAllowedError: Permission denied`
→ User didn't grant camera/mic access. Show instructions modal: "Click the camera icon in your browser's address bar → Allow".

**Error:** `ICE connection state: failed`
→ The TURN server isn't working. Check your OpenRelayProject credentials in `config.js` match exactly.

**Edge Case (Jio/mobile):** Jio uses strict symmetric NAT. STUN alone will fail. TURN with TCP fallback (`turn:...?transport=tcp`) is essential. The config.js includes both UDP and TCP TURN URLs — this is critical for India.

**Edge Case:** User is on a university/corporate network that blocks UDP entirely.
→ Include TCP TURN fallback. Both are in ICE_SERVERS already.

---

## 16. Phase 7 — Stream Modes

### Step 7.1 — public/js/video-sync.js

**AI Prompt:**
```
Create public/js/video-sync.js — Synchronized video player for tostream. Global class, no ES modules.

class VideoSync {

  constructor(containerElement, socket, roomId) {
    this.container = containerElement
    this.socket = socket
    this.roomId = roomId
    this.player = null          // YouTube or HTML5 element
    this.playerType = null      // 'youtube' or 'html5'
    this.isSyncing = false      // Flag: true when applying remote sync (don't re-emit)
    this.seekDebounceTimer = null
    this.isYouTubeApiReady = false
  }

  isYouTubeUrl(url) {
    return url.includes('youtube.com/watch') || url.includes('youtu.be/')
  }

  extractYouTubeId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/)
    return match ? match[1] : null
  }

  async loadVideo(url) {
    this.destroy()
    if (!isValidUrl(url)) { showToast('Invalid URL. Paste a YouTube or direct video URL.', 'error'); return }
    if (this.isYouTubeUrl(url)) {
      await this.loadYouTube(url)
    } else {
      this.loadHTML5(url)
    }
    this.socket.emit('video-sync', { roomId: this.roomId, event: 'change-url', videoUrl: url, currentTime: 0 })
  }

  async loadYouTube(url) {
    this.playerType = 'youtube'
    const videoId = this.extractYouTubeId(url)
    if (!videoId) { showToast('Could not extract YouTube video ID.', 'error'); return }

    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      await new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = 'https://www.youtube.com/iframe_api'
        script.onload = () => {
          window.onYouTubeIframeAPIReady = resolve
          document.head.appendChild(script)
        }
        document.head.appendChild(script)
      })
    }

    const div = document.createElement('div')
    div.id = 'youtube-player'
    this.container.appendChild(div)

    this.player = new YT.Player('youtube-player', {
      height: '100%', width: '100%', videoId,
      playerVars: { autoplay: 0, controls: 1, rel: 0, modestbranding: 1 },
      events: {
        onStateChange: (event) => this.onYouTubeStateChange(event)
      }
    })
  }

  onYouTubeStateChange(event) {
    if (this.isSyncing) return
    if (event.data === YT.PlayerState.PLAYING) {
      this.socket.emit('video-sync', { roomId: this.roomId, event: 'play', currentTime: this.player.getCurrentTime() })
    } else if (event.data === YT.PlayerState.PAUSED) {
      this.socket.emit('video-sync', { roomId: this.roomId, event: 'pause', currentTime: this.player.getCurrentTime() })
    }
  }

  loadHTML5(url) {
    this.playerType = 'html5'
    const video = document.createElement('video')
    video.src = url
    video.controls = true
    video.style.width = '100%'
    video.style.height = '100%'
    video.crossOrigin = 'anonymous'
    this.player = video
    this.container.appendChild(video)

    video.addEventListener('play', () => {
      if (this.isSyncing) return
      this.socket.emit('video-sync', { roomId: this.roomId, event: 'play', currentTime: video.currentTime })
    })
    video.addEventListener('pause', () => {
      if (this.isSyncing) return
      this.socket.emit('video-sync', { roomId: this.roomId, event: 'pause', currentTime: video.currentTime })
    })
    video.addEventListener('seeked', () => {
      if (this.isSyncing) return
      clearTimeout(this.seekDebounceTimer)
      this.seekDebounceTimer = setTimeout(() => {
        this.socket.emit('video-sync', { roomId: this.roomId, event: 'seek', currentTime: video.currentTime })
      }, 500)
    })
  }

  applyRemoteSync({ event, currentTime, videoUrl }) {
    this.isSyncing = true
    setTimeout(() => { this.isSyncing = false }, 1000)  // reset after 1s

    if (event === 'change-url') { this.loadVideo(videoUrl); return }

    if (this.playerType === 'youtube' && this.player && this.player.seekTo) {
      if (event === 'play') { this.player.seekTo(currentTime, true); this.player.playVideo() }
      else if (event === 'pause') { this.player.seekTo(currentTime, true); this.player.pauseVideo() }
      else if (event === 'seek') { this.player.seekTo(currentTime, true) }
    } else if (this.playerType === 'html5' && this.player) {
      if (Math.abs(this.player.currentTime - currentTime) > 2) this.player.currentTime = currentTime
      if (event === 'play') this.player.play()
      else if (event === 'pause') this.player.pause()
    }
  }

  destroy() {
    if (this.playerType === 'youtube' && this.player && this.player.destroy) this.player.destroy()
    if (this.playerType === 'html5' && this.player) { this.player.pause(); this.player.remove() }
    this.container.innerHTML = ''
    this.player = null
    this.playerType = null
  }
}
```

**Error:** `YouTube: Video unavailable`
→ The video is region-blocked on YouTube's side. Show toast: "This video may be region-restricted. Try a different video."

**Error:** `HTML5 video: MEDIA_ERR_SRC_NOT_SUPPORTED`
→ URL is not a direct video file. Only MP4, WebM, OGG work with HTML5. YouTube links go through the YT API.

**Edge Case:** Both users paste a URL simultaneously.
→ Both emit 'change-url'. The last one wins. For MVP this is acceptable. Fix: only room creator can change URL; others can suggest.

**Edge Case:** Very slow internet — video buffers differently on each side.
→ Sync only play/pause/seek events. Don't try to sync buffer state. This matches how Netflix Party / Teleparty works.

### Step 7.2 — public/js/music.js

**AI Prompt:**
```
Create public/js/music.js — Music + Voice audio mixer for tostream. Global class, no ES modules.

class MusicMixer {

  constructor() {
    this.audioContext = null
    this.micSource = null
    this.musicSource = null
    this.musicBuffer = null
    this.micGain = null
    this.musicGain = null
    this.destination = null
    this.isPlaying = false
    this.startTime = 0
    this.pauseOffset = 0
  }

  async init() {
    // Must be called inside a user click event handler
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.micGain = this.audioContext.createGain()
    this.musicGain = this.audioContext.createGain()
    this.destination = this.audioContext.createMediaStreamDestination()
    this.micGain.gain.value = 1.0     // default mic at 100%
    this.musicGain.gain.value = 0.7   // default music at 70%
    this.micGain.connect(this.destination)
    this.musicGain.connect(this.destination)
  }

  async loadMic() {
    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    this.micSource = this.audioContext.createMediaStreamSource(micStream)
    this.micSource.connect(this.micGain)
    return micStream
  }

  async loadMusicFile(file) {
    if (file.size > 52428800) { showToast('Music file is too large (max 50MB). Use a smaller file.', 'error'); return false }
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac']
    if (!allowedTypes.includes(file.type)) { showToast('Unsupported format. Use MP3, WAV, OGG, or AAC.', 'error'); return false }

    const arrayBuffer = await file.arrayBuffer()
    try {
      this.musicBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      return true
    } catch (err) {
      showToast('Could not decode audio file. Try a different file.', 'error')
      return false
    }
  }

  play() {
    if (!this.musicBuffer) return
    if (this.musicSource) { try { this.musicSource.stop() } catch {} }
    this.musicSource = this.audioContext.createBufferSource()
    this.musicSource.buffer = this.musicBuffer
    this.musicSource.connect(this.musicGain)
    this.musicSource.start(0, this.pauseOffset)
    this.startTime = this.audioContext.currentTime - this.pauseOffset
    this.isPlaying = true
    this.musicSource.onended = () => { this.isPlaying = false; this.pauseOffset = 0 }
  }

  pause() {
    if (!this.isPlaying) return
    this.pauseOffset = this.audioContext.currentTime - this.startTime
    try { this.musicSource.stop() } catch {}
    this.isPlaying = false
  }

  setMicVolume(value) {
    // value: 0.0 to 1.0
    if (this.micGain) this.micGain.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.01)
  }

  setMusicVolume(value) {
    if (this.musicGain) this.musicGain.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.01)
  }

  getMixedStream() {
    return this.destination ? this.destination.stream : null
  }

  getCurrentTime() {
    if (!this.isPlaying) return this.pauseOffset
    return this.audioContext.currentTime - this.startTime
  }

  destroy() {
    try { if (this.musicSource) this.musicSource.stop() } catch {}
    try { if (this.audioContext) this.audioContext.close() } catch {}
    this.isPlaying = false
  }
}
```

**Error:** `AudioContext was not allowed to start`
→ AudioContext must be created inside a user gesture (a click). Never call `init()` on page load.

**Error:** `DOMException: The buffer is not in the correct format`
→ File is corrupted or not a valid audio format. Prompt user to try another file.

**Edge Case:** Music ends while call is ongoing.
→ `musicSource.onended` sets `isPlaying = false`. Friend hears silence from music channel but still hears your mic. Show replay button.

**Edge Case:** User switches from Music mode to Camera mode.
→ Call `mixer.destroy()`, then `webrtc.replaceAudioTrack()` with the original mic track.

---

## 17. Phase 8 — Frontend Pages

### Page 1: Landing Page — `public/index.html`

**Purpose:** First impression. Explain toStream, get visitors to sign up.

**Components on this page:**
- Navigation bar with logo and Login/Sign Up buttons
- Hero section: headline ("Stream Together, Privately"), sub-headline, two CTA buttons (Get Started, How It Works)
- Features section: 3 cards (Camera + Voice, URL Video Together, Music + Voice)
- How it works: 3 numbered steps
- Footer: copyright, GitHub link

**AI Prompt:**
```
Create public/index.html for the toStream app landing page. Pure HTML5.

Load in <head>:
- Google Fonts: Inter (400,500) and Space Grotesk (500,600,700)
- Link: css/main.css

Load before </body>:
- js/config.js
- js/utils.js

Inline <script> at bottom:
- Check if user is logged in: if (isLoggedIn()) window.location.href = '/dashboard.html'

Content sections:
1. <nav>: logo text "toStream", nav links: Features, How it Works, Login button, Sign Up button (links to /login.html and /register.html)
2. <section id="hero">: h1 "Stream Together, Privately.", p tagline, two buttons: "Create a Room" → /register.html, "Learn More" → #features
3. <section id="features">: h2 "Everything you need to stream", 3 feature cards each with icon emoji, title, and 2-line description:
   - 🎥 Camera + Voice | "See and talk to your friend in real time. Crystal clear, peer-to-peer."
   - 🎬 Watch Together | "Paste any YouTube or video URL and watch in perfect sync — with voice."
   - 🎵 Share Music | "Stream music from your device while your friend hears you both."
4. <section id="how-it-works">: h2 "Up and running in 3 steps", 3 numbered steps:
   1. Create a private room
   2. Share the link with your friend
   3. Start streaming together
5. <footer>: "© 2024 toStream · Built for privacy", GitHub link placeholder

All links correct. No JavaScript errors. Valid HTML5 doctype.
```

**Errors:** None expected (static page).

**Edge Cases:**
- JS disabled: add `<noscript>Please enable JavaScript to use toStream.</noscript>`
- Already logged in: redirect to dashboard (inline script handles this)
- Slow internet: don't autoplay any video/animation. Use CSS animations only.

---

### Page 2: Register — `public/register.html`

**Purpose:** Create a new toStream account.

**Components:**
- Logo link back to home
- Registration form: username, email, password, confirm password
- Password strength indicator (4 levels: weak/fair/good/strong)
- Show/hide password toggle on each password field
- "Already have an account? Login" link
- Submit button with loading spinner state

**AI Prompt:**
```
Create public/register.html for toStream. Pure HTML5.

Load: css/main.css, css/auth.css (after body opens)
Scripts: js/config.js, js/utils.js, js/auth.js (before </body>)

Form fields (id attributes matter — auth.js uses them):
- id="username" type="text" placeholder="e.g. cooluser_99" autocomplete="username"
- id="email" type="email" placeholder="your@email.com" autocomplete="email"
- id="password" type="password" placeholder="At least 8 characters" autocomplete="new-password"
- id="confirm-password" type="password" placeholder="Repeat password" autocomplete="new-password"
- id="register-btn" type="submit" text: "Create Account"

Extra elements:
- id="password-strength" div below password field (empty by default, filled by JS)
- id="register-error" div for showing error messages (hidden by default)
- Eye icon buttons next to each password field with onclick to toggle type

No <form action> — JS handles submission. Add onsubmit="return false" or use button type="button".
```

**Errors:**
- `409 Email already in use` → show under email: "This email is already registered. Login instead?"
- `409 Username taken` → show under username: "Username taken. Try another."
- `422 Validation failed` → show each field error under its input
- Network down → showToast('Cannot connect. Check your internet.', 'error')

**Edge Cases:**
- Password and confirm-password don't match → catch client-side before API call
- Username with spaces → strip spaces, show "No spaces allowed in username"
- User submits and immediately hits back → form resets (expected). Don't double-submit.
- Paste into password → update strength indicator
- Caps Lock on → browser may warn, don't override that

---

### Page 3: Login — `public/login.html`

**Purpose:** Sign in to existing account.

**Components:**
- Logo link to home
- Login form: email, password
- Show/hide password toggle
- "Forgot password?" link (shows toast: "Password reset coming soon. Contact support.")
- "Don't have an account? Register" link
- Submit button with loading state

**AI Prompt:**
```
Create public/login.html for toStream. Pure HTML5.

Load: css/main.css, css/auth.css
Scripts: js/config.js, js/utils.js, js/auth.js

Form fields:
- id="login-email" type="email" autocomplete="email"
- id="login-password" type="password" autocomplete="current-password"
- id="login-btn" type="button" text "Sign In"
- id="login-error" div hidden by default

Inline script: if (isLoggedIn()) window.location.href = '/dashboard.html'

After login success, redirect to the URL in query param ?redirect= if present, otherwise /dashboard.html.
```

**Errors:**
- `401 Invalid credentials` → show single message "Invalid email or password." Never say which is wrong.
- `429 Too many attempts` → "Too many attempts. Wait 15 minutes." (shows countdown timer if possible)
- Network error → toast

**Edge Cases:**
- Already logged in → redirect to dashboard (inline script)
- Caps Lock on → show a small indicator near password field
- Browser autofill → don't prevent it. Works with proper autocomplete attributes.
- Login from shared computer → remind user to log out (add "Logout when done" reminder in footer)

---

### Page 4: Dashboard — `public/dashboard.html`

**Purpose:** Main hub. Create or join rooms. View history.

**Components:**
- Top navbar: "toStream" logo, username display, logout button
- "Create Room" panel: room name input (optional), mode selector (Camera/URL Video/Music), password input (optional, toggle with checkbox), Create button
- "Join Room" panel: room ID or paste full link input, password input (appears if needed), Join button
- Recent rooms section: list of last 10 rooms with name, mode badge, created date, status (Active/Expired), "Rejoin" or "Copy Link" buttons
- Empty state when no rooms yet: illustration + "Create your first room" prompt
- Toast container

**AI Prompt:**
```
Create public/dashboard.html for toStream. Pure HTML5.

Load: css/main.css, css/dashboard.css
Scripts (before </body>): js/config.js, js/utils.js, js/dashboard.js

Important IDs (dashboard.js uses these):
- id="user-display-name" (shows username from localStorage)
- id="logout-btn"
- id="room-name-input"
- id="room-mode-select" (options: camera, url-video, music)
- id="room-password-toggle" (checkbox: show/hide password input)
- id="room-password-input" (hidden by default)
- id="create-room-btn"
- id="create-room-error"
- id="join-room-input" (paste room ID or full link)
- id="join-password-input"
- id="join-room-btn"
- id="join-room-error"
- id="recent-rooms-list" (ul/div for rendering room cards)
- id="rooms-empty-state" (shown when no rooms)
- id="toast-container"

Mode select options: Camera + Voice (value: camera), Watch Together (value: url-video), Music + Voice (value: music)
```

**Errors:**
- JWT expired on page load → redirect to `/login.html?redirect=/dashboard.html`
- `403 Room full` → toast: "This room is full (max 2 people)."
- `404 Room not found` → toast: "Room not found or expired."
- `403 Wrong password` → add shake CSS animation on password input, show "Incorrect room password."
- `422` validation → show inline error

**Edge Cases:**
- User pastes full URL like `https://tostream.vercel.app/room.html?id=abc123def4` → extract just `abc123def4`
- Recent rooms: show "Expired" badge for rooms past expiresAt. Disable rejoin button.
- No rooms yet → show empty state with call to action
- Long room name (>40 chars) → truncate with ellipsis in the list
- User creates room then closes browser → room still exists in DB for 24h. They can rejoin from history.

---

### Page 5: Stream Room — `public/room.html`

**Purpose:** The core feature. Where streaming actually happens.

**Components:**
- Video grid: two tiles (local + remote). Each tile has: video element, username label, connection quality indicator, audio activity animation
- "Waiting for friend…" overlay: covers remote tile, shows room link with copy button
- Mode tab bar: Camera | Watch Together | Music (switching destroys and reinits the active mode)
- Control bar (floating at bottom): Mute, Camera On/Off, Screen Share, Leave Room buttons
- Mode panels:
  - Camera mode: no extra panel, just video grid
  - URL Video mode: URL input + Paste button + Load button, embedded player container, sync status "In sync" / "Syncing..."
  - Music mode: file drag-and-drop zone, file name display, Play/Pause controls, Music Volume slider, Mic Volume slider
- Share link button (in header or control bar)
- Reconnecting banner (hidden by default, shown when socket disconnects)
- Toast container

**AI Prompt:**
```
Create public/room.html for toStream. Pure HTML5.

Load: css/main.css, css/room.css
Scripts (before </body> in order):
  https://cdn.socket.io/4.7.5/socket.io.min.js
  js/config.js
  js/utils.js
  js/socket-client.js
  js/webrtc.js
  js/video-sync.js
  js/music.js
  js/room.js

Important IDs:
Video:
- id="local-video" (video element, muted autoplay playsinline)
- id="remote-video" (video element, autoplay playsinline)
- id="local-username-label"
- id="remote-username-label"
- id="remote-connection-indicator" (dot: green/yellow/red)
- id="waiting-overlay" (shown until friend joins)
- id="waiting-room-link" (text of share link)
- id="copy-room-link-btn"

Mode tabs:
- id="tab-camera" id="tab-url" id="tab-music"

URL Video mode panel (id="url-video-panel"):
- id="video-url-input"
- id="load-video-btn"
- id="video-player-container"

Music mode panel (id="music-panel"):
- id="music-file-input" type="file" accept="audio/*"
- id="music-file-drop-zone"
- id="music-file-name"
- id="music-play-btn"
- id="music-pause-btn"
- id="music-volume" type="range" min="0" max="1" step="0.05" value="0.7"
- id="mic-volume" type="range" min="0" max="1" step="0.05" value="1"

Controls:
- id="mute-btn"
- id="camera-btn"
- id="screen-share-btn"
- id="leave-btn"

Banners:
- id="reconnecting-banner" (hidden by default, yellow, says "Reconnecting...")

At top of page: inline script — if (!isLoggedIn()) window.location.href = '/login.html'
```

**Errors:**
- `room-error: Room not found` → toast + setTimeout redirect to /dashboard.html after 3s
- `room-error: Room full` → same pattern
- Camera permission denied → show permission modal with step-by-step instructions
- WebRTC connection failed → toast "Connection failed. Try a different network."
- Socket disconnects → show reconnecting banner. On reconnect: re-emit join-room.

**Edge Cases:**
- User refreshes mid-call → sessionStorage.getItem('current_room_id') to auto-rejoin
- Friend leaves → show "Friend disconnected" toast, pause URL video if active, show waiting overlay again
- User switches to URL Video tab mid-call → camera stream continues; video sync starts additionally
- Both switch tabs simultaneously → race condition. Last emitted mode wins. Acceptable for MVP.
- Mobile browser — camera/mic APIs need HTTPS to work. Vercel provides this automatically.
- iOS Safari: use `playsinline` attribute on video elements (already in the IDs above). Required for iOS.
- Slow internet: remote video may lag or freeze. Show connection quality indicator.
- Leaving room: always emit 'leave-room', stop all media tracks, redirect to /dashboard.html
- Browser close: add `window.addEventListener('beforeunload', cleanup)` in room.js to stop streams and emit leave.

---

### Page 6: 404 — `public/404.html`

**Purpose:** Friendly page when URL doesn't match anything.

**AI Prompt:**
```
Create public/404.html for toStream. Pure HTML5. No JS dependencies needed except utils.js.

Content:
- Logo "toStream" linking to /
- Large "404" text
- Heading: "Page not found"
- Paragraph: "This room might have expired, or the link is wrong."
- Two buttons: "Go to Dashboard" → /dashboard.html, "Go Home" → /index.html
- Load: css/main.css only
```

---

### Step 8.x — public/js/auth.js

**AI Prompt:**
```
Create public/js/auth.js — Login and register form logic for toStream. Global functions, no ES modules.

Password strength checker:
function checkPasswordStrength(password):
  - length < 8: 'weak'
  - length >= 8 and only letters or only numbers: 'fair'
  - length >= 8, has letters and numbers: 'good'
  - length >= 12, has letters, numbers, and special chars: 'strong'
  - Updates #password-strength element with text and CSS class

Register form handler (runs on DOMContentLoaded if #register-btn exists):
- Input: #username, #email, #password, #confirm-password
- Client-side validation first: all fields filled, passwords match, username no spaces
- If validation fails: show error inline, don't call API
- Set button loading state (disabled + text "Creating account...")
- POST to /api/auth/register via apiFetch
- On 409: show field-specific error message
- On 422: loop through errors array, show each under its field
- On success: setToken(response.token), setUser(response.user), redirect to /dashboard.html
- Always restore button state in finally block

Login form handler (runs on DOMContentLoaded if #login-btn exists):
- Input: #login-email, #login-password
- Set button loading state
- POST to /api/auth/login via apiFetch
- On 401: show #login-error "Invalid email or password."
- On 429: show rate limit message
- On success: setToken, setUser, redirect to query param ?redirect= or /dashboard.html
- Always restore button state

Password toggle buttons: onclick toggle input type between 'password' and 'text'

Show/hide password-strength indicator on input event of #password if element exists
```

---

### Step 8.x — public/js/dashboard.js

**AI Prompt:**
```
Create public/js/dashboard.js — Dashboard page logic for toStream.

On DOMContentLoaded:
1. redirectIfNotLoggedIn()
2. Display username: document.getElementById('user-display-name').textContent = getUser()?.username || 'User'
3. Load recent rooms: call loadRecentRooms()
4. Setup event listeners

logout-btn click: removeToken(), window.location.href = '/index.html'

room-password-toggle change: show/hide #room-password-input

create-room-btn click:
- Get values from inputs
- Validate room name max 50 chars
- Show loading state on button
- POST /api/rooms/create via apiFetch({ body: JSON.stringify({ name, mode, password }) })
- On success: window.location.href = '/room.html?id=' + response.room.roomId
- On 429: showToast('Room creation limit reached. Try again later.', 'warning')
- On error: show #create-room-error
- Restore button in finally

join-room-btn click:
- Get value from #join-room-input
- Extract room ID: if input contains '/', take the last segment. Trim whitespace.
- Show loading
- POST /api/rooms/join via apiFetch({ body: JSON.stringify({ roomId, password: joinPasswordInput.value }) })
- On 200: window.location.href = '/room.html?id=' + response.room.roomId
- On 403/404: show error with shake animation
- Restore button in finally

async loadRecentRooms():
- GET /api/rooms/history via apiFetch
- If no rooms: show #rooms-empty-state
- For each room: create a card element with:
    - Room name (or 'Unnamed Room' if empty)
    - Mode badge (Camera / Watch Together / Music)
    - Date: formatDate(room.createdAt)
    - Status: 'Active' or 'Expired'
    - If active: "Rejoin" button → /room.html?id=roomId
    - Always: "Copy Link" button → copyToClipboard(window.location.origin + '/room.html?id=' + room.roomId)
- Append cards to #recent-rooms-list
- Catch: show error toast
```

---

### Step 8.x — public/js/room.js

**AI Prompt:**
```
Create public/js/room.js — Main coordinator for the toStream streaming room. All logic for room.html.

On DOMContentLoaded:
1. redirectIfNotLoggedIn()
2. const roomId = getRoomIdFromUrl()
3. If no roomId: showToast('No room ID found.', 'error') + redirect to /dashboard.html
4. Store in sessionStorage: sessionStorage.setItem('current_room_id', roomId)
5. Display room link in #waiting-room-link and set share URL
6. Initialize: connectSocket()
7. Initialize WebRTC: const rtcManager = new WebRTCManager(socket, roomId)

Socket event listeners:
- 'room-joined' ({ participants, mode }): update UI, if participants===1 show waiting overlay, init mode
- 'user-joined' ({ username }): showToast(username + ' joined the room!', 'success'), hide waiting overlay, update remote label
- 'user-left' ({ username }): showToast(username + ' left the room.', 'warning'), show waiting overlay, pause video if url mode, pause music if music mode
- 'room-error' ({ message }): showToast(message, 'error'), setTimeout(() => window.location.href = '/dashboard.html', 3000)
- 'start-call': caller = true → start camera → create offer
- 'offer' ({ offer }): caller = false → start camera → handle offer
- 'answer' ({ answer }): rtcManager.handleAnswer(answer)
- 'ice-candidate' ({ candidate }): rtcManager.addIceCandidate(candidate)
- 'video-sync' (data): if videoSync exists: videoSync.applyRemoteSync(data)
- 'mode-changed' ({ mode }): switch to that mode

WebRTC callbacks:
- onRemoteStream: attach to #remote-video.srcObject
- onConnectionStateChange: update #remote-connection-indicator class ('connecting'/'connected'/'disconnected')

Control bar:
- #mute-btn click: const muted = rtcManager.toggleMute(); update button appearance (Mute/Unmute + icon change)
- #camera-btn click: const off = rtcManager.toggleCamera(); update button
- #screen-share-btn click: try startScreenShare, catch show toast
- #leave-btn click: leaveRoom()

Mode tabs:
- Tab click: destroyCurrentMode(), initMode(newMode), emit 'mode-change' to socket

initMode(mode):
- 'camera': startCamera() — getUserMedia → show in local video, add tracks to peer, no extra panel
- 'url-video': show #url-video-panel, init VideoSync, show URL input. Camera continues for voice.
- 'music': show #music-panel, audio-only for video (disable local video track), init MusicMixer

startCamera() async:
  try: stream = await rtcManager.startLocalStream({ video: true, audio: true })
       localVideo.srcObject = stream
       rtcManager.createPeerConnection()
       rtcManager.addLocalStreamToPeer()
  catch PERMISSION_DENIED: show modal with instructions to allow camera/mic
  catch DEVICE_NOT_FOUND: showToast('Camera/microphone not found. Check connections.', 'error')

#music-file-drop-zone: dragover, drop events — get file from drop event, call mixer.loadMusicFile
#music-file-input change: mixer.loadMusicFile(file)
#music-play-btn click: mixer.play()
#music-pause-btn click: mixer.pause()
#music-volume input: mixer.setMusicVolume(event.target.value)
#mic-volume input: mixer.setMicVolume(event.target.value)
#load-video-btn click: videoSync.loadVideo(#video-url-input.value)

#copy-room-link-btn click: copyToClipboard(window.location.origin + '/room.html?id=' + roomId)

leaveRoom():
  socket.emit('leave-room', { roomId })
  rtcManager.destroy()
  if videoSync exists: videoSync.destroy()
  if musicMixer exists: musicMixer.destroy()
  sessionStorage.removeItem('current_room_id')
  disconnectSocket()
  window.location.href = '/dashboard.html'

window.addEventListener('beforeunload', leaveRoom)

Join the room last (after all listeners set up):
socket.emit('join-room', { roomId })
```

---

## 18. Phase 9 — UI & Styling

### Step 9.1 — public/css/main.css

**AI Prompt:**
```
Create public/css/main.css for toStream. This is the global stylesheet.

Import Google Fonts at top: Inter (400,500) and Space Grotesk (500,600,700) from fonts.googleapis.com

CSS custom properties on :root:
  --bg-primary: #080812
  --bg-surface: #12121E
  --bg-elevated: #1A1A2E
  --accent: #7C3AED
  --accent-light: #A855F7
  --accent-cyan: #06B6D4
  --success: #10B981
  --warning: #F59E0B
  --danger: #EF4444
  --text-primary: #F9FAFB
  --text-secondary: #9CA3AF
  --text-muted: #4B5563
  --border: #2D2D4A
  --border-light: #3D3D5A
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
  --font-display: 'Space Grotesk', sans-serif
  --font-mono: 'JetBrains Mono', 'Courier New', monospace
  --radius-sm: 6px
  --radius-md: 10px
  --radius-lg: 16px
  --radius-xl: 24px
  --transition: 150ms ease
  --shadow-md: 0 4px 16px rgba(0,0,0,0.5)
  --shadow-glow: 0 0 20px rgba(124,58,237,0.25)

Reset: *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
html { scroll-behavior: smooth }
body { background: var(--bg-primary); color: var(--text-primary); font-family: var(--font-sans); font-size: 16px; line-height: 1.6; min-height: 100vh; -webkit-font-smoothing: antialiased }

Utility classes:
.font-display { font-family: var(--font-display) }
.font-mono { font-family: var(--font-mono) }
.text-muted { color: var(--text-muted) }
.text-secondary { color: var(--text-secondary) }
.text-danger { color: var(--danger) }
.text-success { color: var(--success) }

Button base:
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px; border-radius: var(--radius-md); border: 1px solid transparent; font-family: var(--font-sans); font-size: 14px; font-weight: 500; cursor: pointer; transition: all var(--transition); text-decoration: none; white-space: nowrap }
.btn:disabled { opacity: 0.5; cursor: not-allowed }
.btn-primary { background: var(--accent); color: white; border-color: var(--accent) }
.btn-primary:hover:not(:disabled) { background: var(--accent-light); box-shadow: var(--shadow-glow) }
.btn-secondary { background: transparent; color: var(--text-primary); border-color: var(--border-light) }
.btn-secondary:hover:not(:disabled) { background: var(--bg-elevated); border-color: var(--border-light) }
.btn-danger { background: var(--danger); color: white }
.btn-danger:hover:not(:disabled) { opacity: 0.9 }
.btn-ghost { background: transparent; color: var(--text-secondary); border-color: transparent }
.btn-ghost:hover { color: var(--text-primary); background: var(--bg-elevated) }
.btn-sm { padding: 6px 14px; font-size: 13px }
.btn-lg { padding: 14px 28px; font-size: 16px }

Input base:
.input { width: 100%; padding: 10px 14px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); font-family: var(--font-sans); font-size: 14px; transition: border-color var(--transition), box-shadow var(--transition); outline: none }
.input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(124,58,237,0.15) }
.input::placeholder { color: var(--text-muted) }
.input-error { border-color: var(--danger) }

Form helpers:
.form-group { display: flex; flex-direction: column; gap: 6px }
.form-label { font-size: 13px; font-weight: 500; color: var(--text-secondary) }
.form-error { font-size: 12px; color: var(--danger) }
.form-hint { font-size: 12px; color: var(--text-muted) }

Card:
.card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px }

Badge/pill:
.badge { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 500 }
.badge-camera { background: rgba(124,58,237,0.15); color: var(--accent-light) }
.badge-url { background: rgba(6,182,212,0.15); color: var(--accent-cyan) }
.badge-music { background: rgba(236,72,153,0.15); color: #f472b6 }
.badge-active { background: rgba(16,185,129,0.15); color: var(--success) }
.badge-expired { background: rgba(75,85,99,0.3); color: var(--text-muted) }

Toast notifications:
#toast-container { position: fixed; bottom: 24px; left: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; max-width: 320px }
.toast { padding: 12px 16px; border-radius: var(--radius-md); background: var(--bg-elevated); border-left: 3px solid; color: var(--text-primary); font-size: 14px; box-shadow: var(--shadow-md); animation: slideInLeft 0.3s ease; max-width: 320px }
.toast-success { border-color: var(--success) }
.toast-error { border-color: var(--danger) }
.toast-warning { border-color: var(--warning) }
.toast-info { border-color: var(--accent) }
.toast-hide { animation: slideOutLeft 0.3s ease forwards }
@keyframes slideInLeft { from { transform: translateX(-100%); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
@keyframes slideOutLeft { from { transform: translateX(0); opacity: 1 } to { transform: translateX(-100%); opacity: 0 } }

Loading spinner:
.spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.2); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite }
@keyframes spin { to { transform: rotate(360deg) } }

Shake animation (for wrong password):
@keyframes shake { 0%,100% { transform: translateX(0) } 20%,60% { transform: translateX(-6px) } 40%,80% { transform: translateX(6px) } }
.shake { animation: shake 0.4s ease }

Strength indicator:
.strength-bar { height: 3px; border-radius: 2px; transition: all 0.3s ease; margin-top: 4px }
.strength-weak { background: var(--danger); width: 25% }
.strength-fair { background: var(--warning); width: 50% }
.strength-good { background: #3b82f6; width: 75% }
.strength-strong { background: var(--success); width: 100% }

Modal overlay:
.modal-overlay { position: fixed; inset: 0; background: rgba(8,8,18,0.8); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px }
.modal { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 32px; max-width: 400px; width: 100% }

Responsive:
@media (max-width: 768px) { .card { padding: 16px } }
```

### Step 9.2 — public/css/room.css

**AI Prompt:**
```
Create public/css/room.css for toStream's streaming room.

Room layout:
- Full viewport height (100vh), no scroll
- Dark background (var(--bg-primary))

Video grid:
.video-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px; height: calc(100vh - 120px) }
.video-tile { position: relative; background: #000; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border) }
.video-tile video { width: 100%; height: 100%; object-fit: cover }
.video-tile-label { position: absolute; bottom: 12px; left: 12px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); padding: 4px 10px; border-radius: 999px; font-size: 13px; font-weight: 500; color: white }
.connection-dot { position: absolute; top: 12px; right: 12px; width: 10px; height: 10px; border-radius: 50%; border: 2px solid rgba(0,0,0,0.5) }
.dot-connected { background: var(--success) }
.dot-connecting { background: var(--warning); animation: pulse 1.5s infinite }
.dot-disconnected { background: var(--danger) }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }

Waiting overlay:
.waiting-overlay { position: absolute; inset: 0; background: rgba(8,8,18,0.85); backdrop-filter: blur(8px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; border-radius: var(--radius-lg) }
.waiting-ring { width: 60px; height: 60px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 1.2s linear infinite }
.waiting-overlay p { font-size: 15px; color: var(--text-secondary); text-align: center }
.room-link-display { font-family: var(--font-mono); font-size: 13px; background: var(--bg-elevated); border: 1px solid var(--border); padding: 8px 14px; border-radius: var(--radius-md); color: var(--text-primary); word-break: break-all }

Mode tabs:
.mode-tabs { display: flex; gap: 4px; padding: 6px; background: var(--bg-elevated); border-radius: var(--radius-xl); margin: 0 12px 8px }
.mode-tab { flex: 1; padding: 8px 12px; border-radius: var(--radius-lg); border: none; background: transparent; color: var(--text-secondary); font-size: 13px; font-weight: 500; cursor: pointer; transition: all var(--transition) }
.mode-tab.active { background: var(--accent); color: white }
.mode-tab:not(.active):hover { background: var(--bg-primary); color: var(--text-primary) }

Control bar:
.control-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 72px; display: flex; align-items: center; justify-content: center; gap: 12px; background: rgba(18,18,30,0.9); backdrop-filter: blur(12px); border-top: 1px solid var(--border); padding: 0 24px }
.control-btn { width: 48px; height: 48px; border-radius: 50%; border: 1px solid var(--border-light); background: var(--bg-elevated); color: var(--text-secondary); font-size: 20px; cursor: pointer; transition: all var(--transition); display: flex; align-items: center; justify-content: center }
.control-btn:hover { background: var(--border); color: var(--text-primary) }
.control-btn.active { background: var(--accent); border-color: var(--accent); color: white }
.control-btn.muted, .control-btn.camera-off { background: var(--danger); border-color: var(--danger); color: white }
.control-btn.leave { background: var(--danger); border-color: var(--danger); color: white; width: auto; padding: 0 20px; border-radius: var(--radius-md); font-size: 14px; font-weight: 500 }

URL Video panel:
.url-panel { padding: 0 12px 8px; display: flex; gap: 8px; align-items: center }
.url-panel .input { flex: 1 }
.video-player-container { margin: 0 12px; background: #000; border-radius: var(--radius-md); overflow: hidden; aspect-ratio: 16/9 }

Music panel:
.music-panel { padding: 0 12px 8px }
.music-drop-zone { border: 2px dashed var(--border-light); border-radius: var(--radius-lg); padding: 24px; text-align: center; color: var(--text-muted); cursor: pointer; transition: border-color var(--transition) }
.music-drop-zone:hover, .music-drop-zone.drag-over { border-color: var(--accent); color: var(--text-primary) }
.volume-row { display: flex; align-items: center; gap: 12px; margin-top: 12px }
.volume-row label { font-size: 13px; color: var(--text-secondary); width: 80px }
.volume-row input[type="range"] { flex: 1; accent-color: var(--accent) }

Reconnecting banner:
.reconnecting-banner { position: fixed; top: 0; left: 0; right: 0; background: var(--warning); color: #000; text-align: center; padding: 8px; font-size: 13px; font-weight: 500; z-index: 500 }

Mobile responsive:
@media (max-width: 768px) {
  .video-grid { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr }
  .mode-tabs .mode-tab { font-size: 11px; padding: 6px 8px }
}
```

---

## 19. Phase 10 — Security Hardening

Apply these after core functionality is working and tested.

### 10.1 — Update Helmet Configuration

**AI Prompt:**
```
Update the helmet configuration in server.js for toStream.

Replace app.use(helmet()) with a detailed helmet config:

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://www.youtube.com", "https://s.ytimg.com", "https://cdn.socket.io", "'unsafe-inline'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://*.ytimg.com", "https://i.ytimg.com"],
      mediaSrc: ["'self'", "blob:", "https://*.youtube.com"],
      frameSrc: ["https://www.youtube.com"],
      connectSrc: ["'self'", "wss:", "ws:", "https://openrelay.metered.ca"],
      workerSrc: ["blob:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginEmbedderPolicy: false,  // needed for WebRTC
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}))
```

### 10.2 — Request Size & Parameter Limits

**AI Prompt:**
```
Add these security middleware to server.js for toStream after the existing helmet setup:

1. Limit URL parameters: app.use(express.urlencoded({ extended: false, limit: '10kb' }))
2. Prevent HTTP Parameter Pollution: add hpp package (npm install hpp), app.use(hpp())
3. Add X-Request-ID header to all responses for tracing:
   app.use((req, res, next) => { res.setHeader('X-Request-ID', require('crypto').randomUUID()); next() })
4. Remove X-Powered-By (helmet does this, but verify)
5. Add a health check endpoint: GET /health → { status: 'ok', timestamp: new Date().toISOString() }

Run: npm install hpp
```

### 10.3 — MongoDB Query Injection Prevention

**AI Prompt:**
```
Add mongoose query injection prevention for toStream.

Install: npm install express-mongo-sanitize

In server.js after express.json(): app.use(mongoSanitize()) from express-mongo-sanitize.

This removes any keys starting with $ or containing . from req.body, req.query, req.params — preventing MongoDB operator injection.
```

### 10.4 — Frontend Security

**AI Prompt:**
```
Review public/js/utils.js for toStream and add these security improvements:

1. Token validation on every apiFetch: before making a request, check if token exists. If not, redirect to login.
2. XSS prevention: create a function escapeHtml(str) that replaces <, >, ", ', & with HTML entities. Use this whenever inserting user-provided strings into innerHTML.
3. In dashboard.js: wrap all .innerHTML = user_content with escapeHtml().
4. Room link validation: before redirecting to a room link from URL params, validate the room ID matches /^[a-zA-Z0-9_-]{10}$/ to prevent open redirect attacks.
5. Content-Security-Policy meta tag is already handled by helmet in the server. Do NOT add inline event handlers — use addEventListener instead.
```

### 10.5 — Security Checklist

Before going live, manually verify:
- [ ] `.env` is in `.gitignore` and NOT visible in GitHub repository
- [ ] JWT_SECRET is a random 64-character string (not "secret" or "test")
- [ ] MongoDB Atlas password contains no unencoded special characters in the URI
- [ ] MongoDB Atlas has an IP access list (or 0.0.0.0/0 for MVP)
- [ ] All API responses never expose password fields (use `.select('-password')` in queries)
- [ ] Rate limiting is applied to auth routes
- [ ] CORS only allows your Vercel domain in production (not `*`)
- [ ] All user-input strings inserted into DOM use escapeHtml()
- [ ] WebRTC only connects after room is verified server-side (socket auth + join-room event validation)
- [ ] Room passwords are hashed with bcrypt (never stored in plain text)

---

## 20. Phase 11 — SEO, Meta & Extras

These are often forgotten but matter for real users.

### 20.1 — Meta Tags for All Pages

**AI Prompt:**
```
Add these meta tags to the <head> of every HTML page in toStream (index.html, login.html, register.html, dashboard.html, room.html):

Essential:
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">

SEO (for index.html only — other pages should be noindex):
<meta name="description" content="toStream — Private, lag-free streaming for two friends. Watch videos together, share music, and video call securely.">
<meta name="robots" content="index, follow"> (index.html only)
<meta name="robots" content="noindex, nofollow"> (all other pages)

Open Graph (for sharing on WhatsApp, Twitter etc.) — index.html only:
<meta property="og:title" content="toStream — Stream Together, Privately">
<meta property="og:description" content="Private video calls, synchronized video watching, and music sharing for two friends.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://tostream.vercel.app">
<meta property="og:image" content="https://tostream.vercel.app/og-image.png">

Theme color (browser bar on Android Chrome):
<meta name="theme-color" content="#7C3AED">

Title format:
index.html: <title>toStream — Stream Together, Privately</title>
login.html: <title>Login — toStream</title>
register.html: <title>Create Account — toStream</title>
dashboard.html: <title>Dashboard — toStream</title>
room.html: <title>Room — toStream</title>
```

### 20.2 — Favicon

**AI Prompt:**
```
Create a simple SVG favicon for toStream. Save it as public/favicon.svg.

Design: dark background (#080812), a purple (7C3AED) play button triangle inside a rounded rectangle. Simple, works at 16x16px.

Then in every HTML <head>:
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="alternate icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/favicon.svg">
```

### 20.3 — robots.txt

Create `public/robots.txt`:
```
User-agent: *
Disallow: /dashboard.html
Disallow: /room.html
Disallow: /api/
Allow: /
Allow: /index.html
Allow: /login.html
Allow: /register.html

Sitemap: https://tostream.vercel.app/sitemap.xml
```

### 20.4 — manifest.json (PWA basics)

Create `public/manifest.json`:
```json
{
  "name": "toStream",
  "short_name": "toStream",
  "description": "Private streaming for two friends",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#080812",
  "theme_color": "#7C3AED",
  "icons": [
    { "src": "/favicon.svg", "sizes": "any", "type": "image/svg+xml" }
  ]
}
```

Add to every HTML `<head>`:
```html
<link rel="manifest" href="/manifest.json">
```

### 20.5 — README.md

**AI Prompt:**
```
Create a README.md for the toStream GitHub repository.

Sections:
1. Title + badges (Node.js version, License: MIT)
2. Short description (2 sentences)
3. Features list (bullet points)
4. Tech Stack table
5. Getting Started: prerequisites, clone, npm install, .env setup, npm run dev
6. Environment Variables: list all keys with descriptions (no real values)
7. Project Structure: paste the file tree
8. Deployment: link to Render and Vercel
9. Security: brief note on WebRTC encryption
10. License: MIT
```

---

## 21. Phase 12 — Deployment

### Step 12.1 — Pre-Deployment Checklist

Before pushing to GitHub:
```bash
# 1. Confirm .env is gitignored
cat .gitignore | grep .env   # should output: .env

# 2. Check no .env is tracked
git status   # .env should NOT appear

# 3. Final install
npm install

# 4. Test locally
npm run dev
# Open http://localhost:3000 in browser
# Register → Login → Create Room → Open in new tab → Join → Test video call
```

### Step 12.2 — Push to GitHub

```bash
git add .
git commit -m "feat: initial toStream build"
git push -u origin main
```

### Step 12.3 — Deploy Backend to Render

1. Go to https://render.com → Dashboard → **New → Web Service**
2. Connect GitHub → select `tostream` repository
3. Configure:
   - **Name:** `tostream-api`
   - **Region:** Singapore (SEA — closest to India on free tier)
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. **Environment Variables** → Add all from your `.env`:
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `MONGODB_URI` = your full Atlas URI
   - `JWT_SECRET` = your 64-char secret
   - `JWT_EXPIRES_IN` = `7d`
   - `CLIENT_URL` = (leave blank for now — fill after Vercel deploy)
   - `TURN_SERVER_URL`, `TURN_SERVER_URL_TCP`, `TURN_SERVER_USERNAME`, `TURN_SERVER_CREDENTIAL`
5. Click **Create Web Service** → wait 3–5 minutes
6. Copy your Render URL: `https://tostream-api.onrender.com`

**⚠️ Render Free Tier Caveat:** Services sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds. Fix:
- Go to https://cron-job.org (free) → create a job that pings your Render URL every 10 minutes
- Ping URL: `https://tostream-api.onrender.com/health`

### Step 12.4 — Deploy Frontend to Vercel

1. Before deploying: update `public/js/config.js` — replace `YOUR_RENDER_APP_NAME` with your actual Render URL
2. Commit and push: `git add . && git commit -m "fix: update server URL for production" && git push`
3. Go to https://vercel.com → **New Project** → Import `tostream`
4. Configure:
   - **Root Directory:** `public`
   - **Framework Preset:** Other
   - **Build Command:** *(leave empty)*
   - **Output Directory:** `.`
5. Click **Deploy** → wait ~1 minute
6. Copy your Vercel URL: `https://tostream.vercel.app`

### Step 12.5 — Connect Them Together

1. Go to Render → `tostream-api` → Environment → Edit `CLIENT_URL`
2. Set it to your Vercel URL: `https://tostream.vercel.app`
3. Click **Save Changes** → Render will auto-redeploy

### Step 12.6 — Test Production

1. Open `https://tostream.vercel.app` in Chrome
2. Register a new account
3. Create a room → copy link
4. Open the link in an Incognito window (or different device)
5. Register second account → join room
6. Verify: video call works, URL video syncs, music mode works

**Common production issues:**
- Video call fails → Check TURN credentials in Render env vars
- API calls fail → Open browser DevTools → Network tab → check error responses
- Socket won't connect → Check CLIENT_URL in Render matches your exact Vercel URL (no trailing slash)

---

## 22. Phase 13 — Review & QA Checklist

### Security Review
- [ ] `.env` not in GitHub (check repo on github.com — it should NOT be there)
- [ ] JWT_SECRET is strong (run: `echo -n "your_secret" | wc -c` → should be 64+)
- [ ] Passwords stored as bcrypt hashes in MongoDB (check Atlas → Browse Collections → users → password field should start with `$2b$`)
- [ ] API auth routes rate-limited (try logging in 11 times → should get 429)
- [ ] Room join validates user is authenticated (try joining without a token in DevTools)
- [ ] User can't see other users' rooms in history
- [ ] CORS blocks requests from other origins in production

### Functionality Review
- [ ] Register with new email → token saved → redirected to dashboard
- [ ] Login with wrong password → error shown, not which field is wrong
- [ ] Create room → appears in recent rooms list
- [ ] Share room link → friend opens it → join works
- [ ] Camera + Voice: both users see and hear each other
- [ ] Mute button: your voice stops at friend's end (not just locally)
- [ ] Camera off: video tile shows label, not frozen frame
- [ ] URL Video mode: paste YouTube link → both see video → play on one side starts on other
- [ ] URL Video: seek from one side → other side jumps to same position (within 2s)
- [ ] Music mode: upload MP3 → play → friend hears music + your voice
- [ ] Leave button → both redirected to dashboard
- [ ] Room history shows last 10 rooms with correct mode badges
- [ ] Expired rooms show "Expired" badge and disable rejoin
- [ ] 404 page loads for invalid paths
- [ ] HTTPS works on Vercel (https:// in the URL)
- [ ] WebRTC works (camera call succeeds end-to-end)

### Browser Compatibility Review
- [ ] Chrome (desktop) — primary
- [ ] Firefox (desktop)
- [ ] Edge (desktop)
- [ ] Chrome (Android)
- [ ] Safari (iOS) — test on real iPhone if possible, simulators don't expose camera

### Performance Review
- [ ] Landing page loads in <3 seconds on 4G (use Chrome DevTools → Throttle → Fast 4G)
- [ ] No images larger than 200KB (or use SVG)
- [ ] CSS and JS files load correctly (check Network tab — no 404s)
- [ ] gzip compression active (check response headers for `Content-Encoding: gzip`)

---

## 23. Testing Guide

### Test Flow 1: Basic Registration & Login
```
1. Open https://tostream.vercel.app in Chrome
2. Click "Sign Up" → fill in username, email, password
3. Submit → should redirect to /dashboard.html
4. Check localStorage in DevTools → Application tab → should have 'tostream_token'
5. Refresh page → should stay on dashboard (token valid)
6. Click Logout → should go to /index.html → token removed
7. Login with same credentials → should reach dashboard again
```

### Test Flow 2: Create and Join a Room
```
1. Login as User A in Chrome (normal window)
2. Login as User B in Chrome (Incognito window)
3. User A: Create Room (Camera mode, no password) → copy the room link
4. User A: sees "Waiting for friend..." overlay
5. User B: paste the link in address bar → opens room → joins
6. Both: should see "Connected" (green dot) and each other's video
7. Both: hear each other's audio
```

### Test Flow 3: URL Video Sync
```
1. Both users in room
2. User A: click "Watch Together" tab
3. User A: paste https://www.youtube.com/watch?v=dQw4w9WgXcQ
4. User A: click "Load"
5. Expected: both see the video embed
6. User A: click Play
7. Expected: video plays on BOTH screens within 1-2 seconds
8. User A: pause → User B's video pauses too
9. User B: seek to 30s → User A's video jumps to 30s
```

### Test Flow 4: Music Mode
```
1. Both users in room
2. User A: click "Music" tab
3. User A: upload an MP3 file (any music file)
4. User A: click Play
5. Expected: User B hears the music AND User A's voice
6. User A: adjust Music volume slider to 0 → User B hears only voice
7. User A: adjust Mic volume to 0 → User B hears only music
```

### Test Flow 5: Reconnection
```
1. Both users in room, video call active
2. User A: open browser DevTools → Network tab → toggle "Offline" mode for 5 seconds
3. User A: toggle back to Online
4. Expected: socket reconnects, call recovers, "Reconnected!" toast shown
5. If call doesn't recover: User A refresh → should auto-rejoin from sessionStorage
```

### Test Flow 6: Security Tests
```
1. Delete tostream_token from localStorage → refresh any protected page → should redirect to login
2. Try to open /room.html?id=invalidroomid → should get 'Room not found' error and redirect to dashboard
3. Try to join a room that already has 2 people → should get 'Room is full' error
4. Try the API directly: curl https://tostream-api.onrender.com/api/rooms/history (no token) → should get 401
5. Login 11 times with wrong password → 11th attempt should get rate-limited (429)
```

---

## 24. Pages & Navigation Map

```
                              toStream Navigation
                              ═══════════════════

        ╔════════════╗
        ║ index.html ║  (Landing Page — /)
        ║            ╠─── [logged in] ──────────────────────────────╗
        ╚══════╤═════╝                                               │
               │ Not logged in                                       │
        ┌──────┴───────┐                                             │
        │              │                                             ▼
  ┌─────▼──────┐  ┌────▼───────┐                         ╔══════════════════╗
  │ login.html │  │register    │                         ║  dashboard.html  ║
  │            │  │.html       │◄──── "Have account?" ───╢                  ║
  │            ├──► dashboard ─┤                         ║  Create Room     ╠──► room.html?id=X
  └────────────┘  └───────────┘      "New here?" ───────►║  Join Room       ╠──► room.html?id=Y
        ▲                                                 ║  Recent Rooms    ║
        │                ◄────────────── Logout ──────────╢                  ║
        │                                                 ╚══════════════════╝
        │
        │                                     ╔══════════════════════════════╗
        └──────────────── [token expired] ◄───╢         room.html?id=X       ║
                                               ║                              ║
                                               ║  Tabs: Camera │ Watch │ Music║
                                               ║  Control: Mute Cam Share     ║
                                               ║  Leave ──────────────────────╬──► dashboard.html
                                               ╚══════════════════════════════╝

 Any 404 URL ──────────────────────────────► 404.html ──► dashboard.html or index.html
```

### Route Summary

| URL | Page | Auth Required | Redirects If |
|---|---|---|---|
| `/` or `/index.html` | Landing | No | Logged in → `/dashboard.html` |
| `/login.html` | Login | No | Logged in → `/dashboard.html` |
| `/register.html` | Register | No | Logged in → `/dashboard.html` |
| `/dashboard.html` | Dashboard | Yes | Not logged in → `/login.html` |
| `/room.html?id=X` | Stream Room | Yes | Not logged in → `/login.html`; bad ID → `/dashboard.html` |
| `/404.html` | Not Found | No | — |
| Any other URL | — | No | → `/404.html` (handled by server.js) |

---

## 25. Stitch Theme Prompts

These prompts are designed for **Stitch** (Google's AI UI designer). Paste each one into Stitch to generate the design. Do NOT include position or layout instructions — let Stitch decide the layout.

---

### Global Design System Prompt (use this first)

```
Design a UI design system for an app called toStream.

App concept: Private, peer-to-peer streaming app for two friends. Dark, intimate, premium feel.

Color palette:
- Deep background: #080812
- Surface (cards, panels): #12121E
- Elevated elements (inputs, buttons): #1A1A2E
- Primary accent: #7C3AED (electric purple)
- Secondary accent: #06B6D4 (cyan)
- Success: #10B981
- Warning: #F59E0B
- Error/Danger: #EF4444
- Text primary: #F9FAFB
- Text secondary: #9CA3AF
- Text muted/placeholder: #4B5563
- Borders: #2D2D4A
- Border hover: #3D3D5A

Typography:
- Logo and display headings: Space Grotesk, weights 600 and 700
- UI headings and labels: Space Grotesk, weight 500
- Body text, inputs, buttons: Inter, weights 400 and 500
- Room codes, IDs, technical strings: JetBrains Mono, weight 500
- Base size: 16px · Line height: 1.6

Spacing: 4px base unit. Common values: 4, 8, 12, 16, 24, 32, 48, 64px.

Component styles:
- Primary buttons: filled with accent purple, 10px radius, glow shadow on hover
- Secondary buttons: transparent, 1px border (#3D3D5A), same radius
- Danger buttons: filled with #EF4444
- Inputs: dark elevated background, 1px border, purple glow ring on focus, 44px height
- Cards: surface background, 1px border, 16px radius
- Badges and pills: 24px radius, 12px font, semi-transparent background matching their type color
- Connection indicator dot: 10px circle, color matches status (green/yellow/red)
- Tabs: pill-style with no underline, active tab has purple fill
- Modals: surface background, blurred dark overlay

Mood: Dark and cinematic. Like a private cinema or late-night streaming session with a friend. Premium but not corporate. Intimate but polished.
```

---

### Page Prompt 1 — Landing Page

```
Design the landing page for toStream.

Page title: "toStream"
Tagline: "Stream Together, Privately."
Sub-tagline: "A private room for you and one friend. Camera, video sync, music — all in one."

Features to show:
- Feature card 1: "Camera + Voice" — private video call, peer-to-peer, end-to-end encrypted
- Feature card 2: "Watch Together" — paste any YouTube URL, synced playback with voice
- Feature card 3: "Share Music" — stream music from your device with your voice

Section titles:
- Hero section (no explicit heading, just the tagline above)
- "Everything in one room" (features section)
- "Up in 3 steps" (how it works section)

How it works steps:
- Step 1: "Create a private room"
- Step 2: "Share the link with your friend"
- Step 3: "Start streaming together"

Navigation items: Features, How it Works, Login, Sign Up (with Login as ghost button, Sign Up as primary button)

Footer text: "© 2024 toStream · Private by default."

Colors: use the global design system. Purple accent for CTAs. Cyan for secondary highlights.
Font: Space Grotesk for headings, Inter for body.
Spacing: generous, airy layout. 64px between major sections.
Badges: encrypted badge ("🔒 End-to-End Encrypted") in green, peer-to-peer badge in cyan.
```

---

### Page Prompt 2 — Register Page

```
Design the account creation (register) page for toStream.

Page title: "Create your account"
Sub-title: "Join toStream and start streaming with friends."

Form fields:
- Username field: label "Username", placeholder "e.g. cooluser_99", hint "3–20 characters, letters, numbers, underscore"
- Email field: label "Email address", placeholder "your@email.com"
- Password field: label "Password", placeholder "At least 8 characters", with show/hide toggle icon
- Confirm password field: label "Confirm password", placeholder "Repeat password", with show/hide toggle icon
- Password strength indicator bar below password field: 4 states — Weak (red), Fair (amber), Good (blue), Strong (green)

Actions:
- Primary button text: "Create Account"
- Button loading state text: "Creating..."
- Below form: "Already have an account? Sign in" (link to login page)
- Error area: shows inline errors under each field in red

Colors from design system. Surface card background. Purple accent on primary button.
Font: Inter for form fields, Space Grotesk for the page heading.
Spacing: 8px between label and input, 16px between fields, 24px before submit button.
```

---

### Page Prompt 3 — Login Page

```
Design the sign-in page for toStream.

Page title: "Welcome back"
Sub-title: "Sign in to your toStream account."

Form fields:
- Email field: label "Email address", placeholder "your@email.com"
- Password field: label "Password", placeholder "Enter your password", show/hide toggle icon

Actions:
- "Forgot password?" link (right-aligned under password field)
- Primary button text: "Sign In"
- Button loading state text: "Signing in..."
- Below form: "Don't have an account? Create one" link
- Error area: single error message "Invalid email or password." shown in danger red

Colors from global design system.
Font: Space Grotesk heading, Inter inputs.
Spacing: 8px label-to-input, 16px between fields, 24px before submit.
```

---

### Page Prompt 4 — Dashboard

```
Design the dashboard page for toStream.

Page header:
- App logo "toStream" on the left
- Right side: username display and "Logout" button

Create Room section title: "Start a new room"
Create Room form inputs:
- "Room name" text input (optional), placeholder "Give your room a name..."
- "Stream mode" select dropdown — options: "Camera + Voice", "Watch Together", "Music + Voice"
- "Set a room password" toggle checkbox — reveals password input when checked
- Password input (hidden by default): label "Room password", placeholder "Enter a password..."
- Create button: "Create Room" (primary purple)

Join Room section title: "Join a friend's room"
Join Room inputs:
- Room link or ID input: placeholder "Paste room link or ID..."
- Password input: placeholder "Room password (if required)"
- Join button: "Join Room" (secondary style)

Recent Rooms section title: "Recent rooms"
Room card elements (shown for each room):
- Room name (or "Unnamed Room")
- Mode badge: camera → purple "Camera", url-video → cyan "Watch Together", music → pink "Music"
- Date created: formatted as "12 Jan 2024"
- Status badge: green "Active" or muted "Expired"
- "Rejoin" button (disabled if expired) and "Copy Link" button
Empty state: "No rooms yet. Create your first room above."

Toast component:
- Bottom-left of screen
- Types: success (green left border), error (red), warning (amber), info (purple)

Colors, font, spacing from global design system.
```

---

### Page Prompt 5 — Stream Room

```
Design the streaming room page for toStream.

Room header elements:
- App logo "toStream" small on the left
- Room ID displayed in monospace font with a "Copy Link" button next to it
- Connection status: small dot indicator for remote user (green = connected, yellow = connecting, red = disconnected)

Video area:
- Two video tiles side by side (16:9 aspect ratio each)
- Each tile has a dark background (#000000)
- Username label at the bottom of each tile (small pill with semi-transparent dark background)
- "Waiting for friend..." overlay on the remote tile when no one else is in the room — shows the room link and a pulsing loading animation

Mode tab bar (3 tabs):
- Tab 1: "Camera" (camera emoji or icon)
- Tab 2: "Watch Together" (film icon)
- Tab 3: "Music" (music note icon)
- Active tab: purple filled background
- Inactive tabs: transparent with hover state

Camera mode (default): no extra panel, just the two video tiles

Watch Together mode panel:
- URL input bar: placeholder "Paste YouTube or video URL...", "Load" button
- Video player container below (16:9, full width)
- Sync status text: "In sync" in green or "Syncing..." in amber

Music mode panel:
- Drag-and-drop file zone: dashed border, centered text "Drop music file here or click to browse", accepts audio files
- File name display once loaded
- Play and Pause buttons
- "Music Volume" slider with label
- "Mic Volume" slider with label

Floating control bar at the bottom (always visible):
- Mute button: microphone icon, turns red with slash when muted
- Camera button: camera icon, turns red with slash when camera is off
- Screen Share button: screen icon, turns purple when active
- Leave Room button: red, text "Leave"
- Share Link button: link icon with "Share" text

Toast notification component:
- Bottom-left area
- Appears on: friend joined, friend left, connection change, errors

Reconnecting banner:
- Amber/warning colored full-width banner at the top of the page
- Text: "Reconnecting to server..."
- Hidden by default, shown on disconnect

Mobile behavior note: on narrow screens the two video tiles stack vertically instead of side by side.

Colors, font, spacing from global design system. Purple accent throughout.
```

---

## 26. Common Errors Quick Reference

| Error | Where You See It | Fix |
|---|---|---|
| `Cannot find module 'dotenv'` | Terminal on startup | Run `npm install` |
| `MongoServerSelectionError` | Terminal on startup | Check MONGODB_URI in .env, check Atlas IP whitelist |
| `Error: listen EADDRINUSE` | Terminal | Change PORT in .env to 3001 |
| `MongoParseError: URI malformed` | Terminal | Re-copy the MongoDB URI from Atlas |
| `JsonWebTokenError: invalid signature` | API response | JWT_SECRET changed or mismatched — re-login |
| `TokenExpiredError` | API response | Token is >7 days old — re-login |
| `OverwriteModelError: Cannot overwrite User model` | Terminal | Use `mongoose.models.User \|\| mongoose.model(...)` |
| `DOMException: Permission denied` | Browser | Allow camera/mic in the browser prompt |
| `NotFoundError: Requested device not found` | Browser | No camera/mic connected to device |
| `ICE connection state: failed` | Browser console | TURN server wrong — check config.js credentials |
| `AudioContext was not allowed to start` | Browser console | Init AudioContext inside a click handler, not on page load |
| `TypeError: nanoid is not a function` | Terminal | Use nanoid v3 with `const { nanoid } = require('nanoid')` |
| `CORS error in browser` | Browser console | CLIENT_URL in Render env doesn't match Vercel URL |
| `WebSocket closed before connection` | Browser console | Render server is sleeping — wait 30s, refresh |
| `net::ERR_CONNECTION_REFUSED` | Browser console | Server not running — check Render deployment logs |
| `TypeError: Cannot read properties of null` | Browser console | HTML element ID in JS doesn't match an actual element in HTML |
| `422 Validation failed` | API response | Input doesn't meet validation rules — check the errors array |
| `429 Too Many Requests` | API response | Rate limited — wait 15 minutes |
| `cast to ObjectId failed` | API response | Invalid ID format being passed to MongoDB query |
| YouTube video not loading | Browser | Extract video ID is failing — check the regex or try a different URL format |
| Music file won't decode | Browser | File is corrupted or unsupported format — try MP3 or WAV |

---

## 27. Future Improvements

### Immediate Next Steps (Phase 2)
- **Text Chat:** Real-time chat via Socket.io — messages stored in Room document, max 100 messages
- **Screen Share:** `getDisplayMedia()` as 4th tab in the room. Use `replaceVideoTrack()` from webrtc.js
- **Emoji Reactions:** Floating emoji animation on button click, synced via socket event
- **Picture in Picture:** Use browser PiP API on remote video element

### Authentication Improvements
- **Email verification:** Send confirmation link on register using Resend.com (free tier — 100 emails/day)
- **Password reset:** Email a signed JWT link valid for 1 hour
- **HttpOnly cookie auth:** More secure than localStorage — prevents XSS token theft (production upgrade)
- **Refresh tokens:** 7-day access token + 30-day refresh token rotation

### Performance Improvements
- **Connection quality stats:** Use `RTCPeerConnection.getStats()` to show bitrate/latency in the room
- **Adaptive video quality:** Reduce resolution on poor connections automatically
- **Video quality selector:** Let user choose 720p / 480p / 360p manually

### Infrastructure
- **Redis session cache:** Replace in-memory rate limiting with Redis for multi-server scaling
- **Self-hosted TURN:** Deploy coturn on a $5 VPS for reliable 24/7 TURN instead of relying on OpenRelayProject
- **Error tracking:** Sentry.io free tier — capture and alert on production JS errors
- **Analytics:** Umami (self-hosted) or Plausible — privacy-first, no cookie banner needed
- **Health monitoring:** UptimeRobot (free) — pings Render URL + alerts if it goes down
- **CI/CD pipeline:** GitHub Actions — run ESLint on every push to catch errors before deploy

### Legal Pages (needed when you have real users)
- **Privacy Policy page** — list: what data you collect (email, username, room history), how long you keep it (accounts: until deleted, rooms: 24h TTL), who sees it (only you)
- **Terms of Service page** — no illegal streaming, no harassment, 2-person limit per room
- **Cookie notice** — even localStorage use should be disclosed in an EU-compliant banner if you have EU users

### Monetisation (optional future)
- **Pro plan:** Longer room expiry (7 days vs 24h), room history (50 vs 10), custom room names
- **Payment:** Razorpay (India-first, works on Jio/Airtel) for UPI/cards — cheapest fee structure for Indian users

---

## 28. Complete File List

Build these files in this exact order. Each number = one AI conversation / one prompt.

```
Order  File                          Phase     AI Prompt In Section
─────────────────────────────────────────────────────────────────────
 1.    package.json                  Phase 1   §10 Step 1.1
 2.    .gitignore                    Phase 1   §10 Step 1.2
 3.    .nvmrc                        Phase 1   §10 Step 1.3 (manual)
 4.    server.js                     Phase 1   §10 Step 1.4
 5.    config/db.js                  Phase 2   §11 Step 2.1
 6.    models/User.js                Phase 3   §12 Step 3.1
 7.    models/Room.js                Phase 3   §12 Step 3.2 (wait, Phase 4)
 8.    middleware/auth.js            Phase 3   §12 Step 3.3
 9.    middleware/rateLimit.js       Phase 3   §12 Step 3.4
10.    middleware/validate.js        Phase 3   §12 Step 3.5
11.    routes/auth.js                Phase 3   §12 Step 3.6
12.    routes/rooms.js               Phase 4   §13 Step 4.1
13.    socket/signaling.js           Phase 5   §14 Step 5.1
14.    public/js/config.js           Phase 6   §15 Step 6.1
15.    public/js/utils.js            Phase 6   §15 Step 6.2
16.    public/js/socket-client.js    Phase 6   §15 Step 6.3
17.    public/js/webrtc.js           Phase 6   §15 Step 6.4
18.    public/js/video-sync.js       Phase 7   §16 Step 7.1
19.    public/js/music.js            Phase 7   §16 Step 7.2
20.    public/js/auth.js             Phase 8   §17 auth.js
21.    public/js/dashboard.js        Phase 8   §17 dashboard.js
22.    public/js/room.js             Phase 8   §17 room.js
23.    public/index.html             Phase 8   §17 Page 1
24.    public/register.html          Phase 8   §17 Page 2
25.    public/login.html             Phase 8   §17 Page 3
26.    public/dashboard.html         Phase 8   §17 Page 4
27.    public/room.html              Phase 8   §17 Page 5
28.    public/404.html               Phase 8   §17 Page 6
29.    public/css/main.css           Phase 9   §18 Step 9.1
30.    public/css/room.css           Phase 9   §18 Step 9.2
31.    public/css/auth.css           Phase 9   (prompt: style login and register cards, auth.css)
32.    public/css/dashboard.css      Phase 9   (prompt: style dashboard.html cards and room history list)
33.    public/favicon.svg            Phase 11  §20 Step 20.2
34.    public/robots.txt             Phase 11  §20 Step 20.3 (manual)
35.    public/manifest.json          Phase 11  §20 Step 20.4 (manual)
36.    .env.example                  Phase 8   §8 (manual copy of .env without values)
37.    README.md                     Phase 11  §20 Step 20.5
```

**Total: 37 files. Build 1-5 first and test that the server starts and MongoDB connects before continuing.**

---

*Guide version 1.0 · toStream · India-safe zero-budget build · WebRTC + Node.js + MongoDB Atlas*
