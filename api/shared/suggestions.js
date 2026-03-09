const exercisesByCategory = {
  Bulking: ['Barbell Squat', 'Romanian Deadlift', 'Incline Dumbbell Press'],
  Cutting: ['Kettlebell Swings', 'Jump Rope Intervals', 'Burpees'],
  Maintenance: ['Push-ups', 'Cycling', 'Plank Holds']
}

function categorizeProfile(profile) {
  if (!profile) {
    return 'Maintenance'
  }

  if (profile.muscleMass <= 35) {
    return 'Bulking'
  }

  if (profile.fatPercent >= 25) {
    return 'Cutting'
  }

  return 'Maintenance'
}

function buildSuggestion(profile) {
  const category = categorizeProfile(profile)
  return {
    category,
    exercises: exercisesByCategory[category]
  }
}

module.exports = {
  categorizeProfile,
  buildSuggestion
}
