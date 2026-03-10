import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  Clock3,
  Dumbbell,
  Flame,
  Gauge,
  HeartPulse,
  LogIn,
  Ruler,
  Sparkles,
  UserPlus,
  UserRound,
  Weight
} from 'lucide-react'
import {
  createCardioLog,
  createStrengthLog,
  getRecentLogs,
  getSuggestions,
  login,
  saveProfile,
  signup
} from './services/api'

const initialAuth = { email: '', password: '' }
const initialProfile = { heightCm: '', weightKg: '', fatPercent: '', muscleMass: '' }
const initialStrength = { exerciseName: '', sets: '', reps: '', weight: '' }
const initialCardio = { distanceKm: '', timeMinutes: '', caloriesBurned: '' }

function Card({ title, icon: Icon, children }) {
  return (
    <section className="glass interactive rounded-2xl p-5 shadow-lg shadow-black/20">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400">
          <Icon size={18} />
        </div>
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Input({ label, icon: Icon, ...props }) {
  return (
    <label className="mb-3 block text-sm text-slate-300">
      <span className="mb-1 flex items-center gap-2">
        <Icon size={14} className="text-emerald-400" />
        {label}
      </span>
      <input
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-emerald-500 transition focus:ring-2"
        {...props}
      />
    </label>
  )
}

function App() {
  const [mode, setMode] = useState('landing')
  const [authForm, setAuthForm] = useState(initialAuth)
  const [token, setToken] = useState(localStorage.getItem('fitToken') || '')
  const [profileDone, setProfileDone] = useState(localStorage.getItem('fitProfileDone') === 'true')
  const [isGuest, setIsGuest] = useState(false)
  const [profileForm, setProfileForm] = useState(initialProfile)
  const [strengthForm, setStrengthForm] = useState(initialStrength)
  const [cardioForm, setCardioForm] = useState(initialCardio)
  const [recentLogs, setRecentLogs] = useState([])
  const [suggestion, setSuggestion] = useState({ category: '', exercises: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isAuthenticated = Boolean(token)
  const authTitle = useMemo(() => (mode === 'login' ? 'Welcome Back' : 'Create Account'), [mode])

  useEffect(() => {
    if (isGuest) {
      setSuggestion({
        category: 'Maintenance',
        exercises: ['Push-ups', 'Cycling', 'Plank Holds']
      })
      setRecentLogs([
        {
          id: 'guest-1',
          type: 'strength',
          exerciseName: 'Bench Press',
          sets: 4,
          reps: 8,
          weight: 60,
          createdAt: new Date().toISOString()
        },
        {
          id: 'guest-2',
          type: 'cardio',
          distanceKm: 3.5,
          timeMinutes: 22,
          caloriesBurned: 260,
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        }
      ])
      return
    }

    if (!isAuthenticated || !profileDone) {
      return
    }

    refreshDashboard()
  }, [isAuthenticated, profileDone, isGuest])

  async function refreshDashboard() {
    try {
      const [suggestionsData, logsData] = await Promise.all([getSuggestions(token), getRecentLogs(token)])
      setSuggestion({
        category: suggestionsData.category,
        exercises: suggestionsData.exercises || []
      })
      setRecentLogs(logsData.logs || [])
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const action = mode === 'login' ? login : signup
      const data = await action(authForm)
      setToken(data.token)
      localStorage.setItem('fitToken', data.token)
      localStorage.setItem('fitProfileDone', data.profileCompleted ? 'true' : 'false')
      setProfileDone(Boolean(data.profileCompleted))
      setAuthForm(initialAuth)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await saveProfile(token, {
        heightCm: Number(profileForm.heightCm),
        weightKg: Number(profileForm.weightKg),
        fatPercent: Number(profileForm.fatPercent),
        muscleMass: Number(profileForm.muscleMass)
      })
      setProfileDone(true)
      localStorage.setItem('fitProfileDone', 'true')
      setProfileForm(initialProfile)
      await refreshDashboard()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function submitStrength(event) {
    event.preventDefault()
    setError('')

    try {
      if (isGuest) {
        const entry = {
          id: `${Date.now()}-guest-strength`,
          type: 'strength',
          exerciseName: strengthForm.exerciseName,
          sets: Number(strengthForm.sets),
          reps: Number(strengthForm.reps),
          weight: Number(strengthForm.weight),
          createdAt: new Date().toISOString()
        }
        setRecentLogs((prev) => [entry, ...prev].slice(0, 5))
        setStrengthForm(initialStrength)
        return
      }

      await createStrengthLog(token, {
        exerciseName: strengthForm.exerciseName,
        sets: Number(strengthForm.sets),
        reps: Number(strengthForm.reps),
        weight: Number(strengthForm.weight)
      })
      setStrengthForm(initialStrength)
      await refreshDashboard()
    } catch (err) {
      setError(err.message)
    }
  }

  async function submitCardio(event) {
    event.preventDefault()
    setError('')

    try {
      if (isGuest) {
        const entry = {
          id: `${Date.now()}-guest-cardio`,
          type: 'cardio',
          distanceKm: Number(cardioForm.distanceKm),
          timeMinutes: Number(cardioForm.timeMinutes),
          caloriesBurned: Number(cardioForm.caloriesBurned),
          createdAt: new Date().toISOString()
        }
        setRecentLogs((prev) => [entry, ...prev].slice(0, 5))
        setCardioForm(initialCardio)
        return
      }

      await createCardioLog(token, {
        distanceKm: Number(cardioForm.distanceKm),
        timeMinutes: Number(cardioForm.timeMinutes),
        caloriesBurned: Number(cardioForm.caloriesBurned)
      })
      setCardioForm(initialCardio)
      await refreshDashboard()
    } catch (err) {
      setError(err.message)
    }
  }

  function logout() {
    setToken('')
    setProfileDone(false)
    setIsGuest(false)
    setMode('landing')
    localStorage.removeItem('fitToken')
    localStorage.removeItem('fitProfileDone')
  }

  function openAuth(nextMode) {
    setError('')
    setMode(nextMode)
  }

  function openGuest() {
    setError('')
    setIsGuest(true)
    setMode('guest')
  }

  if (!isAuthenticated && !isGuest && mode === 'landing') {
    return (
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />

        <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-8 md:px-6">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1 text-xs font-semibold tracking-wide text-emerald-300">
                <Sparkles size={14} />
                AI-INFORMED FITNESS GUIDANCE
              </p>
              <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
                Crush Every Session.
                <span className="block text-emerald-400">Track Smarter.</span>
              </h1>
              <p className="mt-4 max-w-xl text-slate-300 md:text-lg">
                FitAzure blends workout logging with body-composition-based suggestions so your training plan changes with your goals.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  className="interactive inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-900"
                  onClick={() => openAuth('signup')}
                >
                  Get Started
                  <ArrowRight size={16} />
                </button>
                <button
                  className="interactive inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-900/70 px-5 py-3 font-semibold text-slate-100"
                  onClick={() => openAuth('login')}
                >
                  <LogIn size={16} />
                  Login
                </button>
                <button
                  className="interactive inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-5 py-3 font-semibold text-emerald-200"
                  onClick={openGuest}
                >
                  Explore as Guest
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass interactive rounded-2xl p-4">
                <Dumbbell className="mb-2 text-emerald-400" />
                <p className="text-sm text-slate-400">Strength Tracking</p>
                <p className="text-xl font-bold text-white">Sets, Reps, Weight</p>
              </div>
              <div className="glass interactive rounded-2xl p-4">
                <HeartPulse className="mb-2 text-emerald-400" />
                <p className="text-sm text-slate-400">Cardio Analytics</p>
                <p className="text-xl font-bold text-white">Distance, Time, Calories</p>
              </div>
              <div className="glass interactive rounded-2xl p-4">
                <Gauge className="mb-2 text-emerald-400" />
                <p className="text-sm text-slate-400">Goal Category</p>
                <p className="text-xl font-bold text-white">Bulking / Cutting / Maintain</p>
              </div>
              <div className="glass interactive rounded-2xl p-4">
                <Activity className="mb-2 text-emerald-400" />
                <p className="text-sm text-slate-400">Recent Progress</p>
                <p className="text-xl font-bold text-white">Last 5 Workouts</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (!isAuthenticated && !isGuest) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
        <Card title={authTitle} icon={mode === 'login' ? LogIn : UserPlus}>
          <form onSubmit={handleAuthSubmit}>
            <Input
              label="Email"
              icon={UserRound}
              type="email"
              required
              value={authForm.email}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <Input
              label="Password"
              icon={Weight}
              type="password"
              required
              minLength={6}
              value={authForm.password}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
            />
            {error ? <p className="mb-3 text-sm text-rose-400">{error}</p> : null}
            <button
              className="interactive mb-3 w-full rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-900"
              disabled={loading}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <button
            type="button"
            className="interactive mb-2 w-full rounded-xl border border-slate-600 px-4 py-2 text-sm"
            onClick={() => setMode((prev) => (prev === 'login' ? 'signup' : 'login'))}
          >
            {mode === 'login' ? 'Need an account? Sign up' : 'Already registered? Login'}
          </button>
          <button
            type="button"
            className="interactive w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-300"
            onClick={() => setMode('landing')}
          >
            Back to Landing Page
          </button>
          <button
            type="button"
            className="interactive mt-2 w-full rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200"
            onClick={openGuest}
          >
            Explore as Guest
          </button>
        </Card>
      </main>
    )
  }

  if (!profileDone && !isGuest) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-8">
        <Card title="Profile Setup" icon={Activity}>
          <form onSubmit={handleProfileSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Height (cm)"
                icon={Ruler}
                type="number"
                min="50"
                required
                value={profileForm.heightCm}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, heightCm: e.target.value }))}
              />
              <Input
                label="Weight (kg)"
                icon={Weight}
                type="number"
                min="20"
                required
                value={profileForm.weightKg}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, weightKg: e.target.value }))}
              />
              <Input
                label="Fat %"
                icon={Flame}
                type="number"
                min="1"
                max="60"
                required
                value={profileForm.fatPercent}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, fatPercent: e.target.value }))}
              />
              <Input
                label="Muscle Mass"
                icon={Dumbbell}
                type="number"
                min="1"
                max="100"
                required
                value={profileForm.muscleMass}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, muscleMass: e.target.value }))}
              />
            </div>
            {error ? <p className="mb-3 text-sm text-rose-400">{error}</p> : null}
            <button
              className="interactive w-full rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-900"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 md:text-3xl">Fitness Tracker Dashboard</h1>
          <p className="text-sm text-slate-400">Log workouts and track your progress in real-time.</p>
        </div>
        <button
          className="interactive rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200"
          onClick={logout}
        >
          {isGuest ? 'Exit Guest' : 'Logout'}
        </button>
      </header>

      {isGuest ? (
        <p className="mb-4 rounded-lg border border-emerald-700/50 bg-emerald-900/30 p-3 text-sm text-emerald-200">
          You are exploring in guest mode. Workouts added here are temporary and won’t be saved.
        </p>
      ) : null}

      {error ? <p className="mb-4 rounded-lg border border-rose-700 bg-rose-900/40 p-3 text-sm text-rose-300">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Smart Suggestions" icon={Gauge}>
          <p className="mb-3 text-sm text-slate-300">
            Category: <span className="font-semibold text-emerald-400">{suggestion.category || 'Loading...'}</span>
          </p>
          <ul className="space-y-2 text-sm text-slate-200">
            {(suggestion.exercises || []).map((exercise) => (
              <li key={exercise} className="rounded-lg bg-slate-800/70 px-3 py-2">
                {exercise}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Strength Log" icon={Dumbbell}>
          <form onSubmit={submitStrength}>
            <Input
              label="Exercise Name"
              icon={Dumbbell}
              required
              value={strengthForm.exerciseName}
              onChange={(e) => setStrengthForm((prev) => ({ ...prev, exerciseName: e.target.value }))}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Sets"
                icon={Activity}
                type="number"
                required
                value={strengthForm.sets}
                onChange={(e) => setStrengthForm((prev) => ({ ...prev, sets: e.target.value }))}
              />
              <Input
                label="Reps"
                icon={Activity}
                type="number"
                required
                value={strengthForm.reps}
                onChange={(e) => setStrengthForm((prev) => ({ ...prev, reps: e.target.value }))}
              />
              <Input
                label="Weight"
                icon={Weight}
                type="number"
                required
                value={strengthForm.weight}
                onChange={(e) => setStrengthForm((prev) => ({ ...prev, weight: e.target.value }))}
              />
            </div>
            <button className="interactive mt-2 w-full rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-900">
              Add Strength Log
            </button>
          </form>
        </Card>

        <Card title="Cardio Log" icon={HeartPulse}>
          <form onSubmit={submitCardio}>
            <Input
              label="Distance (km)"
              icon={Ruler}
              type="number"
              required
              value={cardioForm.distanceKm}
              onChange={(e) => setCardioForm((prev) => ({ ...prev, distanceKm: e.target.value }))}
            />
            <Input
              label="Time (minutes)"
              icon={Clock3}
              type="number"
              required
              value={cardioForm.timeMinutes}
              onChange={(e) => setCardioForm((prev) => ({ ...prev, timeMinutes: e.target.value }))}
            />
            <Input
              label="Calories Burned"
              icon={Flame}
              type="number"
              required
              value={cardioForm.caloriesBurned}
              onChange={(e) => setCardioForm((prev) => ({ ...prev, caloriesBurned: e.target.value }))}
            />
            <button className="interactive mt-1 w-full rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-900">
              Add Cardio Log
            </button>
          </form>
        </Card>
      </div>

      <section className="glass interactive mt-5 rounded-2xl p-5 shadow-lg shadow-black/20">
        <h2 className="mb-4 text-lg font-semibold">Last 5 Workout Logs</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {recentLogs.length === 0 ? (
            <p className="text-sm text-slate-400">No logs yet. Start by adding a workout.</p>
          ) : (
            recentLogs.map((log) => (
              <article key={log.id} className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
                <p className="mb-1 text-sm font-semibold text-emerald-400">{log.type.toUpperCase()}</p>
                <p className="text-sm text-slate-300">{new Date(log.createdAt).toLocaleString()}</p>
                {log.type === 'strength' ? (
                  <p className="text-sm text-slate-100">
                    {log.exerciseName}: {log.sets}x{log.reps} @ {log.weight}kg
                  </p>
                ) : (
                  <p className="text-sm text-slate-100">
                    {log.distanceKm}km in {log.timeMinutes}m, {log.caloriesBurned} cal
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  )
}

export default App
