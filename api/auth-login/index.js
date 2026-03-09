const { getUser, getProfile } = require('../shared/store')
const { hashPassword } = require('../shared/crypto')
const { signToken } = require('../shared/auth')
const { json } = require('../shared/response')

module.exports = async function (context, req) {
  const { email, password } = req.body || {}

  if (!email || !password) {
    context.res = json(400, { error: 'Email and password are required.' })
    return
  }

  const user = getUser(email)
  if (!user || user.passwordHash !== hashPassword(password)) {
    context.res = json(401, { error: 'Invalid credentials.' })
    return
  }

  const profileCompleted = Boolean(getProfile(email))
  const token = signToken({ email })
  context.res = json(200, { token, profileCompleted })
}
