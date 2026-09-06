PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS repo_snapshots (
  captured_at TEXT NOT NULL,
  repo TEXT NOT NULL,
  stars INTEGER NOT NULL DEFAULT 0,
  watchers INTEGER NOT NULL DEFAULT 0,
  forks INTEGER NOT NULL DEFAULT 0,
  open_issues INTEGER NOT NULL DEFAULT 0,
  open_prs INTEGER NOT NULL DEFAULT 0,
  views_14d INTEGER NOT NULL DEFAULT 0,
  unique_views_14d INTEGER NOT NULL DEFAULT 0,
  clones_14d INTEGER NOT NULL DEFAULT 0,
  unique_clones_14d INTEGER NOT NULL DEFAULT 0,
  attention INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (captured_at, repo)
);
CREATE INDEX IF NOT EXISTS idx_repo_snapshots_repo_time ON repo_snapshots(repo, captured_at DESC);

CREATE TABLE IF NOT EXISTS traffic_daily (
  day TEXT NOT NULL,
  repo TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  unique_views INTEGER NOT NULL DEFAULT 0,
  clones INTEGER NOT NULL DEFAULT 0,
  unique_clones INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, repo)
);
CREATE INDEX IF NOT EXISTS idx_traffic_day ON traffic_daily(day DESC);

CREATE TABLE IF NOT EXISTS referrers (
  captured_on TEXT NOT NULL,
  repo TEXT NOT NULL,
  referrer TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  uniques INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (captured_on, repo, referrer)
);

CREATE TABLE IF NOT EXISTS popular_paths (
  captured_on TEXT NOT NULL,
  repo TEXT NOT NULL,
  path TEXT NOT NULL,
  title TEXT,
  count INTEGER NOT NULL DEFAULT 0,
  uniques INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (captured_on, repo, path)
);

CREATE TABLE IF NOT EXISTS actor_state (
  kind TEXT NOT NULL,
  repo TEXT NOT NULL,
  login TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  PRIMARY KEY (kind, repo, login)
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at TEXT NOT NULL,
  kind TEXT NOT NULL,
  repo TEXT NOT NULL DEFAULT '',
  actor TEXT,
  delta INTEGER NOT NULL DEFAULT 0,
  details TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_time ON events(occurred_at DESC);

CREATE TABLE IF NOT EXISTS account_snapshots (
  captured_at TEXT PRIMARY KEY,
  followers INTEGER NOT NULL DEFAULT 0
);
