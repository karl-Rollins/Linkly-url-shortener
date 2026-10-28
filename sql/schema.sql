CREATE TABLE links (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(16) NOT NULL UNIQUE,
    target_url TEXT NOT NULL,
    click_count INT NOT NULL DEFAULT 0 CHECK( click_count >= 0 ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE clicks (
    id BIGSERIAL PRIMARY KEY,
    link_id BIGINT NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    referrer TEXT,
    user_agent TEXT,
    clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clicks_link_id_clicked_at 
ON clicks( link_id, clicked_at );