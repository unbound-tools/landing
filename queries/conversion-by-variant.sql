-- Conversion rate by variant
-- Primary metric: what % of visitors sign up, per variant
SELECT
    a.variant,
    COUNT(DISTINCT a.id) AS visitors,
    COUNT(DISTINCT s.visitor_id) AS signups,
    ROUND(COUNT(DISTINCT s.visitor_id) * 100.0 / COUNT(DISTINCT a.id), 2) AS conversion_pct
FROM assignments a
LEFT JOIN signups s ON a.id = s.visitor_id
GROUP BY a.variant;
