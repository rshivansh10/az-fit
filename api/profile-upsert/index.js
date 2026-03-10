const { upsertProfile } = require('../shared/store')
const { requireUser } = require('../shared/guards')
const { json } = require('../shared/response')

module.exports = async function (context, req) {
  const auth = requireUser(req)
  if (!auth.email) {
    context.res = auth.errorResponse
    return
  }

  const { heightCm, weightKg, fatPercent, muscleMass } = req.body || {}

  if (![heightCm, weightKg, fatPercent, muscleMass].every((value) => Number.isFinite(value) && value > 0)) {
    context.res = json(400, { error: 'All profile fields must be valid positive numbers.' })
    return
  }

  await upsertProfile(auth.email, { heightCm, weightKg, fatPercent, muscleMass })
  context.res = json(200, { success: true })
}
