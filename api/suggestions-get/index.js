const { getProfile } = require('../shared/store')
const { requireUser } = require('../shared/guards')
const { buildSuggestion } = require('../shared/suggestions')

module.exports = async function (context, req) {
  const auth = requireUser(req)
  if (!auth.email) {
    context.res = auth.errorResponse
    return
  }

  const profile = await getProfile(auth.email)
  const suggestion = buildSuggestion(profile)
  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(suggestion)
  }
}
