-- Survey completion rate by variant
SELECT
    s.variant,
    COUNT(DISTINCT s.visitor_id) AS signups,
    COUNT(DISTINCT sr.visitor_id) AS surveys_completed,
    ROUND(COUNT(DISTINCT sr.visitor_id) * 100.0 / COUNT(DISTINCT s.visitor_id), 2) AS survey_pct
FROM signups s
LEFT JOIN survey_responses sr ON s.visitor_id = sr.visitor_id
GROUP BY s.variant;

-- Self-reported role distribution per variant
SELECT
    variant,
    role,
    COUNT(*) AS count
FROM signups
GROUP BY variant, role
ORDER BY variant, count DESC;

-- "How are you solving this today?" distribution
SELECT
    variant,
    current_solution,
    COUNT(*) AS count
FROM survey_responses
WHERE current_solution IS NOT NULL
GROUP BY variant, current_solution
ORDER BY variant, count DESC;

-- Data sources frequency
SELECT
    variant,
    value AS data_source,
    COUNT(*) AS mentions
FROM survey_responses, json_each(survey_responses.data_sources)
WHERE data_sources IS NOT NULL
GROUP BY variant, value
ORDER BY variant, mentions DESC;
