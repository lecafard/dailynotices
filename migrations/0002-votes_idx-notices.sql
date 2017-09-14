CREATE TABLE votes (
	user_id CHAR(9) REFERENCES users(id) ON DELETE CASCADE,
	notice_id CHAR(24) REFERENCES notice(id) ON DELETE CASCADE,
	CONSTRAINT vote_unq UNIQUE(notice_id, user_id)
);

CREATE index idx_votes_userid ON votes(user_id);
CREATE INDEX idx_notice_ts ON notices(timestamp);