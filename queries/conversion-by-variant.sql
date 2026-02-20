-- Conversion rate by variant (unique visitors by IP)
-- Primary metric: what % of unique visitors sign up, per variant
SELECT
    a.variant,
    COUNT(DISTINCT a.ip) AS unique_visitors,
    COUNT(DISTINCT s.visitor_id) AS signups,
    ROUND(COUNT(DISTINCT s.visitor_id) * 100.0 / COUNT(DISTINCT a.ip), 2) AS conversion_pct
FROM assignments a
LEFT JOIN signups s ON a.id = s.visitor_id
GROUP BY a.variant;
