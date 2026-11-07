CREATE TABLE IF NOT EXISTS links (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(16) NOT NULL UNIQUE,
    target_url TEXT NOT NULL,
    click_count INTEGER NOT NULL DEFAULT 0
        CHECK (click_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

