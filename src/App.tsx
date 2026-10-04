import { useEffect, useMemo, useState } from 'react'
import { exercises } from './data/exercises'
import type { Equipment, Exercise, WorkoutExercise, WorkoutSet } from './types'

const equipmentFilters: Array<'All' | Equipment> = [
  'All',
  'Machine',
  'Cable',
  'Dumbbell',
  'Barbell',
  'Smith',
  'Bodyweight',
]

const createSet = (kind: WorkoutSet['kind'] = 'Working'): WorkoutSet => ({
  id: crypto.randomUUID(),
  weight: kind === 'Warm-up' ? 20 : 40,
  reps: kind === 'Warm-up' ? 10 : 8,
  kind,
})

function MetricCard({ eyebrow, title, value, detail }: { eyebrow: string; title: string; value: string; detail: string }) {
  return (
    <article className="metric-card lift-card">
      <span className="eyebrow">{eyebrow}</span>
      <h3>{title}</h3>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  )
}

function App() {
  const [scrollY, setScrollY] = useState(0)
  const [builderOpen, setBuilderOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [equipment, setEquipment] = useState<'All' | Equipment>('All')
  const [session, setSession] = useState<WorkoutExercise[]>([])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const filteredExercises = useMemo(() => {
    const term = query.trim().toLowerCase()
    return exercises.filter((exercise) => {
      const matchesEquipment = equipment === 'All' || exercise.equipment === equipment
      const haystack = `${exercise.name} ${exercise.primaryMuscle} ${exercise.secondaryMuscles?.join(' ') ?? ''}`.toLowerCase()
      return matchesEquipment && (!term || haystack.includes(term))
    })
  }, [equipment, query])

  const addExercise = (exercise: Exercise) => {
    if (session.some((item) => item.exercise.id === exercise.id)) return
    setSession((current) => [...current, { exercise, sets: [createSet('Working')] }])
  }

  const removeExercise = (exerciseId: string) => {
    setSession((current) => current.filter((item) => item.exercise.id !== exerciseId))
  }

  const addSet = (exerciseId: string, kind: WorkoutSet['kind']) => {
    setSession((current) => current.map((item) => (
      item.exercise.id === exerciseId
        ? { ...item, sets: [...item.sets, createSet(kind)] }
        : item
    )))
  }

  const updateSet = (
    exerciseId: string,
    setId: string,
    field: 'weight' | 'reps',
    amount: number,
  ) => {
    setSession((current) => current.map((item) => {
      if (item.exercise.id !== exerciseId) return item
      return {
        ...item,
        sets: item.sets.map((set) => set.id === setId
          ? { ...set, [field]: Math.max(0, set[field] + amount) }
          : set),
      }
    }))
  }

  return (
    <main>
      <div
        className="ambient-shape"
        aria-hidden="true"
        style={{ transform: `translate3d(0, ${scrollY * 0.08}px, 0) rotate(${scrollY * 0.035}deg)` }}
      >
        <span />
        <span />
        <span />
      </div>

      <header className="site-header">
        <a className="brand" href="#top">FITNESS OS</a>
        <nav>
          <a href="#overview">Overview</a>
          <a href="#workout">Workout</a>
          <a href="#roadmap">Roadmap</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">YOUR OVERVIEW</span>
          <h1>Every day<br />adds up.</h1>
          <p className="hero-lead">Training, fuel and recovery. All in one place.</p>
          <div className="hero-actions">
            <button className="primary" onClick={() => setBuilderOpen(true)}>Start workout</button>
            <a className="text-link" href="#overview">View dashboard ↓</a>
          </div>
          <p className="demo-note">4 October 2026 · Interactive demo · Sample data. Changes reset on refresh.</p>
        </div>
        <div className="hero-orbit lift-card" aria-hidden="true">
          <div className="orbit-ring ring-one" />
          <div className="orbit-ring ring-two" />
          <div className="orbit-core">OS</div>
        </div>
      </section>

      <section className="section" id="overview">
        <div className="section-heading">
          <span className="eyebrow">TODAY · THIS MONTH · THIS YEAR</span>
          <h2>Your health, without the spreadsheet sprawl.</h2>
        </div>
        <div className="metric-grid">
          <MetricCard eyebrow="TRAIN WITH INTENT" title="Workouts" value="2 sessions" detail="4 working sets logged" />
          <MetricCard eyebrow="FUEL YOUR PROGRESS" title="Nutrition" value="2,565 kcal" detail="173 g protein / logged day" />
          <MetricCard eyebrow="MAKE RECOVERY COUNT" title="Sleep" value="6h 53m" detail="average sleep · 4 nights logged" />
          <MetricCard eyebrow="SEE THE BIGGER PICTURE" title="Body progress" value="79.8 kg" detail="latest · 0.0 kg in this period" />
        </div>
      </section>

      <section className="section progress-section">
        <div className="section-heading">
          <span className="eyebrow">THE LONG VIEW</span>
          <h2>Your progress</h2>
        </div>
        <div className="progress-card lift-card">
          <div className="progress-topline">
            <div>
              <span>Progress metric</span>
              <strong>Workouts</strong>
            </div>
            <div>
              <span>Month to date</span>
              <strong>2</strong>
            </div>
          </div>
          <div className="chart" aria-label="Demo workout chart">
            <div className="bar bar-one"><span>1 Oct</span></div>
            <div className="bar bar-two"><span>2 Oct</span></div>
            <div className="bar bar-three"><span>3 Oct</span></div>
            <div className="bar bar-four"><span>4 Oct</span></div>
          </div>
          <small>Illustrative only in v0.1. Real trend calculations arrive after persistence.</small>
        </div>
      </section>

      <section className="section" id="workout">
        <div className="section-heading split-heading">
          <div>
            <span className="eyebrow">TRAIN WITH INTENT</span>
            <h2>Build the session your way.</h2>
          </div>
          <button className="primary" onClick={() => setBuilderOpen((open) => !open)}>
            {builderOpen ? 'Close builder' : 'Open workout builder'}
          </button>
        </div>

        {builderOpen && (
          <div className="builder-grid">
            <aside className="exercise-browser lift-card">
              <label>
                <span>Find an exercise</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exercise or muscle…" />
              </label>
              <div className="filter-row">
                {equipmentFilters.map((filter) => (
                  <button
                    key={filter}
                    className={equipment === filter ? 'filter active' : 'filter'}
                    onClick={() => setEquipment(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="exercise-results">
                {filteredExercises.slice(0, 30).map((exercise) => (
                  <button className="exercise-option" key={exercise.id} onClick={() => addExercise(exercise)}>
                    <span>
                      <strong>{exercise.name}</strong>
                      <small>{exercise.equipment} · {exercise.primaryMuscle}</small>
                    </span>
                    <b>+</b>
                  </button>
                ))}
              </div>
            </aside>

            <section className="session lift-card">
              <div className="session-heading">
                <div>
                  <span className="eyebrow">CURRENT SESSION</span>
                  <h3>{session.length ? `${session.length} exercises` : 'Nothing added yet'}</h3>
                </div>
                <span className="status-pill">Demo only</span>
              </div>

              {!session.length && (
                <div className="empty-state">
                  <p>Search the library and add movements in the order you want to perform them.</p>
                </div>
              )}

              {session.map((item, index) => (
                <article className="session-exercise" key={item.exercise.id}>
                  <div className="exercise-title-row">
                    <div>
                      <span className="order">{String(index + 1).padStart(2, '0')}</span>
                      <h4>{item.exercise.name}</h4>
                      <small>{item.exercise.primaryMuscle} · {item.exercise.equipment}</small>
                    </div>
                    <button className="ghost-danger" onClick={() => removeExercise(item.exercise.id)}>Remove</button>
                  </div>

                  <div className="sets">
                    {item.sets.map((set, setIndex) => (
                      <div className="set-row" key={set.id}>
                        <span className="set-label">{set.kind === 'Warm-up' ? 'W' : setIndex + 1}</span>
                        <div className="stepper">
                          <button onClick={() => updateSet(item.exercise.id, set.id, 'weight', -2.5)}>−</button>
                          <span><strong>{set.weight}</strong> kg</span>
                          <button onClick={() => updateSet(item.exercise.id, set.id, 'weight', 2.5)}>+</button>
                        </div>
                        <div className="stepper">
                          <button onClick={() => updateSet(item.exercise.id, set.id, 'reps', -1)}>−</button>
                          <span><strong>{set.reps}</strong> reps</span>
                          <button onClick={() => updateSet(item.exercise.id, set.id, 'reps', 1)}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="set-actions">
                    <button onClick={() => addSet(item.exercise.id, 'Warm-up')}>+ warm-up</button>
                    <button onClick={() => addSet(item.exercise.id, 'Working')}>+ working set</button>
                  </div>
                </article>
              ))}
            </section>
          </div>
        )}
      </section>

      <section className="section logbook">
        <div className="section-heading">
          <span className="eyebrow">IN THE LOGBOOK</span>
          <h2>Recent activity</h2>
        </div>
        <div className="activity-list lift-card">
          <div><strong>Fair sleep</strong><span>4 Oct · 6.5 hours</span></div>
          <div><strong>Weigh-in</strong><span>4 Oct · 79.8 kg</span></div>
          <div><strong>Daily food log</strong><span>4 Oct · 2,400 kcal</span></div>
          <div><strong>Good sleep</strong><span>3 Oct · 6.75 hours</span></div>
        </div>
      </section>

      <section className="section roadmap-preview" id="roadmap">
        <span className="eyebrow">WHERE THIS GOES NEXT</span>
        <h2>Demo first. Persistence second. Intelligence after the data is trustworthy.</h2>
        <p>Supabase is deliberately not wired into this preview. The next vertical slice is authentication plus persisted workouts, then previous-performance comparisons, templates and trend analysis.</p>
      </section>

      <footer>
        <strong>FITNESS OS / FIRST EDITION</strong>
        <span>One session at a time.</span>
      </footer>
    </main>
  )
}

export default App
