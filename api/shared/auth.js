const crypto = require('crypto')

const SECRET = process.env.AUTH_SECRET || 'fit-azure-secret'

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  return `${body}.${signature}`
}

function verifyToken(token) {
  if (!token || !token.includes('.')) {
    return null
  }

  const [body, signature] = token.split('.')
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')

  if (signature !== expected) {
    return null
  }

  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

function extractToken(req) {
  const raw = req.headers?.authorization || ''
  if (!raw.startsWith('Bearer ')) {
    return null
  }
  return raw.slice('Bearer '.length)
}

module.exports = {
  signToken,
  verifyToken,
  extractToken
}
