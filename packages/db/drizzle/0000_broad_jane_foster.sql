-- Custom SQL migration file, put you code below! --
CREATE VIEW comment_digest AS
SELECT
  pc.id,
  pc.proposal_id,
  pc.user_key,
  pc.content,
  pc.created_at,
  COALESCE(SUM(CASE WHEN ci.vote_type = 'UP' THEN 1 ELSE 0 END), 0) AS upvotes,
  COALESCE(SUM(CASE WHEN ci.vote_type = 'DOWN' THEN 1 ELSE 0 END), 0) AS downvotes
FROM
  proposal_comment pc
LEFT JOIN
  comment_interaction ci ON pc.id = ci.comment_id
WHERE
  pc.deleted_at IS NULL
GROUP BY
  pc.id,
  pc.proposal_id,
  pc.user_key,
  pc.content,
  pc.created_at
ORDER BY
  pc.created_at ASC;