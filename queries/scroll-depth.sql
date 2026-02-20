-- Scroll depth distribution per variant
SELECT
    variant,
    value AS depth_pct,
    COUNT(*) AS count
FROM events
WHERE event_type = 'scroll_depth'
GROUP BY variant, value
ORDER BY variant, CAST(value AS INTEGER);

-- Average time on page per variant
SELECT
    variant,
    COUNT(*) AS samples,
    ROUND(AVG(CAST(value AS REAL)), 1) AS avg_seconds,
    MIN(CAST(value AS INTEGER)) AS min_seconds,
    MAX(CAST(value AS INTEGER)) AS max_seconds
FROM events
WHERE event_type = 'time_on_page'
GROUP BY variant;

-- Traffic source breakdown
SELECT
    variant,
    COALESCE(utm_source, 'direct') AS source,
    COALESCE(utm_campaign, '(none)') AS campaign,
    COUNT(*) AS visitors
FROM assignments
GROUP BY variant, utm_source, utm_campaign
ORDER BY variant, visitors DESC;

-- CTA click distribution
SELECT
    variant,
    value AS cta_id,
    COUNT(*) AS clicks
FROM events
WHERE event_type = 'cta_click'
GROUP BY variant, value
ORDER BY variant, clicks DESC;
