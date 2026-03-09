const { addWorkout } = require('../shared/store')
const { requireUser } = require('../shared/guards')
const { json } = require('../shared/response')

module.exports = async function (context, req) {
  const auth = requireUser(req)
  if (!auth.email) {
    context.res = auth.errorResponse
    return
  }

  const { exerciseName, sets, reps, weight } = req.body || {}

  if (!exerciseName || ![sets, reps, weight].every((value) => Number.isFinite(value) && value > 0)) {
    context.res = json(400, { error: 'Strength log requires valid exercise, sets, reps, and weight.' })
    return
  }

  const entry = addWorkout(auth.email, { type: 'strength', exerciseName, sets, reps, weight })
  context.res = json(201, { log: entry })
}
