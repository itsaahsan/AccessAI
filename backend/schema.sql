-- AccessAI relational schema (PostgreSQL). Sensible, not overbuilt.
-- users -> profiles (1:1), preferences (1:1)
-- users -> goals -> milestones -> tasks
-- users -> learning_sessions, ai_interactions, progress

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_level TEXT NOT NULL DEFAULT 'beginner',
  explanation_style TEXT NOT NULL DEFAULT 'simple',
  struggle TEXT DEFAULT '',
  streak INT NOT NULL DEFAULT 0,
  last_active_date DATE
);

CREATE TABLE IF NOT EXISTS preferences (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'light',
  large_text BOOLEAN NOT NULL DEFAULT FALSE,
  high_readability BOOLEAN NOT NULL DEFAULT FALSE,
  reduced_complexity BOOLEAN NOT NULL DEFAULT FALSE,
  focus_mode BOOLEAN NOT NULL DEFAULT FALSE,
  reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
  simplified_language BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  goal_id INT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  position INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  goal_id INT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  milestone_id INT REFERENCES milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  estimate_min INT NOT NULL DEFAULT 25,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learning_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id INT REFERENCES goals(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  time_spent_minutes INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ai_interactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  input_type TEXT NOT NULL,
  input_content TEXT DEFAULT '',
  ai_response TEXT DEFAULT '',
  model_used TEXT DEFAULT '',
  mode TEXT NOT NULL DEFAULT 'demo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS progress (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id INT REFERENCES goals(id) ON DELETE SET NULL,
  concept TEXT DEFAULT '',
  score INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
