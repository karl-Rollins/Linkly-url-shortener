CREATE TABLE IF NOT EXISTS clicks (
    id BIGSERIAL PRIMARY KEY,
    link_id BIGINT NOT NULL
        REFERENCES links(id)
        ON DELETE CASCADE,
    referrer TEXT,
    user_agent TEXT,
    clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS
idx_clicks_link_id_clicked_at
ON clicks(link_id, clicked_at);