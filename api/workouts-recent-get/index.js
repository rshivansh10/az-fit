const { getRecentWorkouts } = require('../shared/store')
const { requireUser } = require('../shared/guards')
const { json } = require('../shared/response')

module.exports = async function (context, req) {
  const auth = requireUser(req)
  if (!auth.email) {
    context.res = auth.errorResponse
    return
  }

  const limit = Number(req.query?.limit || 5)
  const logs = getRecentWorkouts(auth.email, Number.isFinite(limit) ? limit : 5)

  context.res = json(200, { logs })
}
