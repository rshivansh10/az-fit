const { extractToken, verifyToken } = require('./auth')
const { json } = require('./response')

function requireUser(req) {
  const token = extractToken(req)
  const payload = verifyToken(token)

  if (!payload?.email) {
    return { errorResponse: json(401, { error: 'Unauthorized' }) }
  }

  return { email: payload.email }
}

module.exports = { requireUser }
