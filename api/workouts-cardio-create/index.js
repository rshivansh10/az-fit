const { addWorkout } = require('../shared/store')
const { requireUser } = require('../shared/guards')
const { json } = require('../shared/response')

module.exports = async function (context, req) {
  const auth = requireUser(req)
  if (!auth.email) {
    context.res = auth.errorResponse
    return
  }

  const { distanceKm, timeMinutes, caloriesBurned } = req.body || {}

  if (![distanceKm, timeMinutes, caloriesBurned].every((value) => Number.isFinite(value) && value > 0)) {
    context.res = json(400, { error: 'Cardio log requires valid distance, time, and calories burned.' })
    return
  }

  const entry = addWorkout(auth.email, { type: 'cardio', distanceKm, timeMinutes, caloriesBurned })
  context.res = json(201, { log: entry })
}
