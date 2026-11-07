-- Clear existing data

TRUNCATE clicks, links
RESTART IDENTITY
CASCADE;

-- Links

INSERT INTO links (
    code,
    target_url,
    click_count,
    created_at,
    expires_at
)
VALUES
(
    'github',
    'https://github.com',
    5,
    NOW() - INTERVAL '10 days',
    NULL
),
(
    'google',
    'https://google.com',
    3,
    NOW() - INTERVAL '5 days',
    NULL
),
(
    'expired-link',
    'https://example.com',
    2,
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '1 day'
);

-- Clicks for github

INSERT INTO clicks (
    link_id,
    referrer,
    user_agent,
    clicked_at
)
VALUES
(
    1,
    'https://twitter.com',
    'Mozilla/5.0 Chrome',
    NOW() - INTERVAL '5 hours'
),
(
    1,
    'https://linkedin.com',
    'Mozilla/5.0 Firefox',
    NOW() - INTERVAL '4 hours'
),
(
    1,
    NULL,
    'PostmanRuntime',
    NOW() - INTERVAL '3 hours'
),
(
    1,
    'https://dev.to',
    'Mozilla/5.0 Safari',
    NOW() - INTERVAL '2 hours'
),
(
    1,
    NULL,
    'curl/8.0',
    NOW() - INTERVAL '1 hours'
);

-- Clicks for google

INSERT INTO clicks (
    link_id,
    referrer,
    user_agent,
    clicked_at
)
VALUES
(
    2,
    'https://facebook.com',
    'Mozilla/5.0 Chrome',
    NOW() - INTERVAL '3 hours'
),
(
    2,
    NULL,
    'PostmanRuntime',
    NOW() - INTERVAL '2 hours'
),
(
    2,
    'https://reddit.com',
    'Mozilla/5.0 Firefox',
    NOW() - INTERVAL '1 hours'
);

-- Clicks for expired-link

INSERT INTO clicks (
    link_id,
    referrer,
    user_agent,
    clicked_at
)
VALUES
(
    3,
    NULL,
    'PostmanRuntime',
    NOW() - INTERVAL '2 days'
),
(
    3,
    'https://x.com',
    'Mozilla/5.0 Chrome',
    NOW() - INTERVAL '1 day'
);