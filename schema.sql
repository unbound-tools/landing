-- Variant assignments (one per visitor)
CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    variant TEXT NOT NULL,
    source TEXT,
    ip TEXT,
    utm_source TEXT,
    utm_campaign TEXT,
    referrer TEXT,
    created_at TEXT NOT NULL
);

-- Signups (conversion event — primary metric)
CREATE TABLE IF NOT EXISTS signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    variant TEXT NOT NULL,
    utm_source TEXT,
    utm_campaign TEXT,
    created_at TEXT NOT NULL
);

-- Survey responses (optional, thank-you page)
CREATE TABLE IF NOT EXISTS survey_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL,
    signup_id INTEGER,
    building_what TEXT,
    data_sources TEXT,
    current_solution TEXT,
    variant TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Analytics events
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    variant TEXT NOT NULL,
    page TEXT,
    value TEXT,
    utm_source TEXT,
    utm_campaign TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_variant ON events(variant, event_type);
CREATE INDEX IF NOT EXISTS idx_signups_variant ON signups(variant);
