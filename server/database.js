const Database = require('better-sqlite3');
const path = require('path');

class WarDatabase {
  constructor(dbPath = null) {
    if (!dbPath) {
      dbPath = path.join(__dirname, 'clash_royale_wars.db');
    }
    this.db = new Database(dbPath);
    this.initDb();
  }

  initDb() {
    // Members table - track names even after they leave
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS members (
        tag TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        clan_tag TEXT,
        last_updated TEXT
      )
    `);

    // War contributions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS war_contributions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_tag TEXT NOT NULL,
        clan_tag TEXT NOT NULL,
        war_start_date TEXT NOT NULL,
        war_end_date TEXT NOT NULL,
        fame INTEGER NOT NULL,
        UNIQUE(member_tag, clan_tag, war_start_date)
      )
    `);

    // Clan update tracking table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS clan_updates (
        clan_tag TEXT PRIMARY KEY,
        last_update TEXT NOT NULL,
        last_war_end TEXT
      )
    `);
  }

  getMostRecentWarEnd() {
    // Calculate the most recent war end date (Sunday before the most recent Monday 10am)
    const now = new Date();
    let daysSinceMonday = now.getDay() === 0 ? 6 : now.getDay() - 1; // Monday = 0

    if (daysSinceMonday === 0 && now.getHours() < 10) {
      // It's Monday before 10am, so last war completed previous Monday
      daysSinceMonday = 7;
    }

    const lastMonday10am = new Date(now);
    lastMonday10am.setDate(now.getDate() - daysSinceMonday);
    lastMonday10am.setHours(10, 0, 0, 0);

    // The war that completed on this Monday ended on Sunday (1 day before)
    const warEndSunday = new Date(lastMonday10am);
    warEndSunday.setDate(lastMonday10am.getDate() - 1);
    warEndSunday.setHours(0, 0, 0, 0);

    return warEndSunday;
  }

  getWarDates(weeksAgo, referenceEndDate = null) {
    // Use most recent war end if not specified
    if (!referenceEndDate) {
      referenceEndDate = this.getMostRecentWarEnd();
    }

    // Calculate the end date for the requested week
    const endDate = new Date(referenceEndDate);
    endDate.setDate(endDate.getDate() - (weeksAgo * 7));

    // Start date is Thursday (3 days before Sunday)
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 3);

    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  }

  needsUpdate(clanTag) {
    const row = this.db.prepare('SELECT last_update, last_war_end FROM clan_updates WHERE clan_tag = ?').get(clanTag);

    if (!row) return true;

    const lastUpdate = new Date(row.last_update);
    const mostRecentWarEnd = this.getMostRecentWarEnd();

    // Check if we've updated since the most recent war completed (Monday 10am after war end)
    const warCompleteTime = new Date(mostRecentWarEnd);
    warCompleteTime.setDate(warCompleteTime.getDate() + 1);
    warCompleteTime.setHours(10, 0, 0, 0);

    return lastUpdate < warCompleteTime;
  }

  markUpdated(clanTag) {
    const now = new Date().toISOString();
    const warEnd = this.getMostRecentWarEnd().toISOString().split('T')[0];

    this.db.prepare(`
      INSERT INTO clan_updates (clan_tag, last_update, last_war_end)
      VALUES (?, ?, ?)
      ON CONFLICT(clan_tag) DO UPDATE SET
        last_update = excluded.last_update,
        last_war_end = excluded.last_war_end
    `).run(clanTag, now, warEnd);
  }

  saveMember(tag, name, clanTag) {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO members (tag, name, clan_tag, last_updated)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(tag) DO UPDATE SET
        name = excluded.name,
        clan_tag = excluded.clan_tag,
        last_updated = excluded.last_updated
    `).run(tag, name, clanTag, now);
  }

  saveWarContribution(memberTag, clanTag, warStart, warEnd, fame) {
    this.db.prepare(`
      INSERT INTO war_contributions (member_tag, clan_tag, war_start_date, war_end_date, fame)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(member_tag, clan_tag, war_start_date) DO UPDATE SET
        fame = excluded.fame,
        war_end_date = excluded.war_end_date
    `).run(memberTag, clanTag, warStart, warEnd, fame);
  }

  populateFromApiData(clanTag, riverRaceLog) {
    const referenceEndDate = this.getMostRecentWarEnd();

    for (let i = 0; i < riverRaceLog.length; i++) {
      const race = riverRaceLog[i];
      const { start: warStart, end: warEnd } = this.getWarDates(i, referenceEndDate);

      // Find our clan in standings
      const standings = race.standings || [];
      for (const standing of standings) {
        const clanInfo = standing.clan || {};
        if (clanInfo.tag === clanTag) {
          const participants = clanInfo.participants || [];
          for (const p of participants) {
            const memberTag = p.tag || '';
            const memberName = p.name || 'Unknown';
            const fame = p.fame || 0;

            this.saveMember(memberTag, memberName, clanTag);
            this.saveWarContribution(memberTag, clanTag, warStart, warEnd, fame);
          }
          break;
        }
      }
    }

    this.markUpdated(clanTag);
  }

  getMemberWars(memberTag, clanTag) {
    return this.db.prepare(`
      SELECT war_start_date as start, war_end_date as end, fame
      FROM war_contributions
      WHERE member_tag = ? AND clan_tag = ?
      ORDER BY war_start_date DESC
    `).all(memberTag, clanTag);
  }

  getAllMembersForClan(clanTag) {
    return this.db.prepare(`
      SELECT DISTINCT m.tag, m.name
      FROM members m
      JOIN war_contributions wc ON m.tag = wc.member_tag
      WHERE wc.clan_tag = ?
    `).all(clanTag);
  }

  getWarHistory(clanTag) {
    // Get unique war dates
    const wars = this.db.prepare(`
      SELECT DISTINCT war_start_date, war_end_date
      FROM war_contributions
      WHERE clan_tag = ?
      ORDER BY war_start_date DESC
      LIMIT 10
    `).all(clanTag);

    // For each war, get all contributions
    return wars.map(war => {
      const contributions = this.db.prepare(`
        SELECT wc.member_tag, m.name, wc.fame
        FROM war_contributions wc
        LEFT JOIN members m ON wc.member_tag = m.tag
        WHERE wc.clan_tag = ? AND wc.war_start_date = ?
      `).all(clanTag, war.war_start_date);

      return {
        start: war.war_start_date,
        end: war.war_end_date,
        contributions
      };
    });
  }
}

module.exports = { WarDatabase };
