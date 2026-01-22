# Clash Royale Stats Web

A web-based application to view Clash Royale clan and player statistics.

## Features

- **Clan Statistics** - View clan overview, score, war trophies, donations, and member count
- **Clan Members** - See all members with their roles, trophies, donation stats, and war contributions
- **Player Statistics** - View trophies, battle stats, challenge wins, cards, and current deck
- **Battle Log** - See recent battle results with scores and opponents
- **War History** - Persistent database tracking war contributions even after members leave
- **River Race Chart** - Visual graph of clan war performance

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React
- **Database**: SQLite (better-sqlite3)
- **Charts**: Recharts

## Setup

### 1. Install dependencies

```bash
npm run install-all
```

### 2. Configure API Key

Create a `.env` file in the `server` directory:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and add your Clash Royale API key:

```
CLASH_ROYALE_API_KEY=your_api_key_here
PORT=3001
```

Get your API key from [developer.clashroyale.com](https://developer.clashroyale.com)

### 3. Run the application

Development mode (runs both server and client):

```bash
npm run dev
```

Or run them separately:

```bash
npm run server  # Backend on port 3001
npm run client  # Frontend on port 3000
```

### 4. Open in browser

Navigate to [http://localhost:3000](http://localhost:3000)

## Production Build

```bash
npm run build
npm start
```

## License

MIT License
