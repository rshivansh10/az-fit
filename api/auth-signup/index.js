const { getUser, upsertUser, getProfile } = require('../shared/store')
const { hashPassword } = require('../shared/crypto')
const { signToken } = require('../shared/auth')
const { json } = require('../shared/response')

module.exports = async function (context, req) {
  const { email, password } = req.body || {}

  if (!email || !password || password.length < 6) {
    context.res = json(400, { error: 'Email and password (min 6 chars) are required.' })
    return
  }

  if (await getUser(email)) {
    context.res = json(409, { error: 'Account already exists.' })
    return
  }

  await upsertUser(email, hashPassword(password))
  const profileCompleted = Boolean(await getProfile(email))
  const token = signToken({ email })

  context.res = json(201, { token, profileCompleted })
}
