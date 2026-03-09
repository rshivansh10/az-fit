const data = {
  users: new Map(),
  profiles: new Map(),
  workouts: []
}

function upsertUser(email, passwordHash) {
  data.users.set(email, {
    email,
    passwordHash,
    createdAt: new Date().toISOString()
  })
}

function getUser(email) {
  return data.users.get(email)
}

function upsertProfile(email, profile) {
  data.profiles.set(email, {
    email,
    ...profile,
    updatedAt: new Date().toISOString()
  })
}

function getProfile(email) {
  return data.profiles.get(email)
}

function addWorkout(email, workout) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    email,
    createdAt: new Date().toISOString(),
    ...workout
  }

  data.workouts.push(entry)
  return entry
}

function getRecentWorkouts(email, limit = 5) {
  return data.workouts
    .filter((item) => item.email === email)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
}

module.exports = {
  upsertUser,
  getUser,
  upsertProfile,
  getProfile,
  addWorkout,
  getRecentWorkouts
}
