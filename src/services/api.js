const jsonHeaders = { 'Content-Type': 'application/json' }

async function request(path, options = {}) {
  try {
    const response = await fetch(`/api/${path}`, options)
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = data?.error || `Request failed (${response.status})`
      throw new Error(message)
    }
    return data
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('API unreachable. Start Azure Functions on http://localhost:7071.')
    }
    throw error
  }
}

export function signup(payload) {
  return request('auth-signup', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  })
}

export function login(payload) {
  return request('auth-login', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  })
}

export function saveProfile(token, payload) {
  return request('profile-upsert', {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  })
}

export function getSuggestions(token) {
  return request('suggestions-get', {
    headers: { Authorization: `Bearer ${token}` }
  })
}

export function createStrengthLog(token, payload) {
  return request('workouts-strength-create', {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  })
}

export function createCardioLog(token, payload) {
  return request('workouts-cardio-create', {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  })
}

export function getRecentLogs(token) {
  return request('workouts-recent-get', {
    headers: { Authorization: `Bearer ${token}` }
  })
}
