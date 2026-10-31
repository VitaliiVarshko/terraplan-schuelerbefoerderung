
import { useEffect, useMemo, useState } from 'react'
import './App.css'

function App() {
  const [trips, setTrips] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTripId, setEditingTripId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [updatingTripId, setUpdatingTripId] = useState(null)
  const [statusError, setStatusError] = useState('')
  const [formError, setFormError] = useState('')
  const [sort, setSort] = useState({
    field: 'date',
    direction: 'asc',
  })
  const [form, setForm] = useState({
    studentName: '',
    schoolName: '',
    date: '',
    driverName: '',
  })

  async function loadTrips() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/trips')

      if (!response.ok) {
        throw new Error('Die Fahrten konnten nicht geladen werden.')
      }

      setTrips(await response.json())
    } catch (err) {
      setError(err.message || 'Verbindungsfehler zum Server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function fetchTrips() {
      try {
        const response = await fetch('/api/trips')

        if (!response.ok) {
          throw new Error('Die Fahrten konnten nicht geladen werden.')
        }

        setTrips(await response.json())
      } catch (err) {
        setError(err.message || 'Verbindungsfehler zum Server.')
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [])

  function handleSort(field) {
    setSort((current) => ({
      field,
      direction:
        current.field === field && current.direction === 'asc'
          ? 'desc'
          : 'asc',
    }))
  }


  const filteredTrips = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('de')

    return trips.filter((trip) => {
      const matchesSearch =
        !query ||
        [
          trip.studentName,
          trip.schoolName,
          trip.driverName,
        ].some((value) =>
          String(value ?? '').toLocaleLowerCase('de').includes(query)
        )

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !trip.cancelled) ||
        (statusFilter === 'cancelled' && trip.cancelled)

      const today = new Date()
      const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
      ].join('-')

      const startOfWeek = new Date(today)
      const dayOfWeek = (today.getDay() + 6) % 7
      startOfWeek.setDate(today.getDate() - dayOfWeek)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      const toDateString = (date) =>
        [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, '0'),
          String(date.getDate()).padStart(2, '0'),
        ].join('-')

      const startOfWeekString = toDateString(startOfWeek)
      const endOfWeekString = toDateString(endOfWeek)

      const startOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )

      const endOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      )

      const startOfMonthString = toDateString(startOfMonth)
      const endOfMonthString = toDateString(endOfMonth)

      const matchesDate =
        dateFilter === 'all' ||
        (dateFilter === 'today' && trip.date === todayString) ||
        (dateFilter === 'week' &&
          trip.date >= startOfWeekString &&
          trip.date <= endOfWeekString) ||
        (dateFilter === 'month' &&
          trip.date >= startOfMonthString &&
          trip.date <= endOfMonthString)

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [trips, searchTerm, statusFilter, dateFilter])



  const sortedTrips = useMemo(() => {
    return [...filteredTrips].sort((a, b) => {
      let first = a[sort.field]
      let second = b[sort.field]

      if (sort.field === 'cancelled') {
        first = Boolean(first)
        second = Boolean(second)
      } else {
        first = String(first ?? '').toLocaleLowerCase('de')
        second = String(second ?? '').toLocaleLowerCase('de')
      }

      let result = 0

      if (first < second) result = -1
      if (first > second) result = 1

      return sort.direction === 'asc' ? result : -result
    })
  }, [filteredTrips, sort])

  function sortLabel(field, label) {
    if (sort.field !== field) return label
    return `${label} ${sort.direction === 'asc' ? '↑' : '↓'}`
  }


  
  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setFormError('')

    try {
      const isEditing = editingTripId !== null

      const response = await fetch(
        isEditing ? `/api/trips/${editingTripId}` : '/api/trips',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(form),
        }
      )

      if (!response.ok) {
        throw new Error(
          isEditing
            ? 'Die Fahrt konnte nicht aktualisiert werden.'
            : 'Die Fahrt konnte nicht gespeichert werden.'
        )
      }

      setForm({
        studentName: '',
        schoolName: '',
        date: '',
        driverName: '',
      })

      setEditingTripId(null)
      setShowForm(false)

      await loadTrips()
    } catch (err) {
      setFormError(err.message || 'Verbindungsfehler zum Server.')
    } finally {
      setSaving(false)
    }
  }


  async function handleToggleStatus(trip) {
    setUpdatingTripId(trip.id)
    setStatusError('')

    try {
      const response = await fetch(
        `/api/trips/${trip.id}/status?cancelled=${!trip.cancelled}`,
        { method: 'PATCH' }
      )

      if (!response.ok) {
        throw new Error('Der Status der Fahrt konnte nicht geändert werden.')
      }

      await loadTrips()
    } catch (err) {
      setStatusError(
        err.message || 'Verbindungsfehler zum Server.'
      )
    } finally {
      setUpdatingTripId(null)
    }
  }



  function handleEditTrip(trip) {
    setEditingTripId(trip.id)

    setForm({
      studentName: trip.studentName,
      schoolName: trip.schoolName,
      date: trip.date,
      driverName: trip.driverName,
    })

    setFormError('')
    setShowForm(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }


  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">T</div>
          <div>
            <h1>TerraPlan</h1>
            <p>Schülerbeförderung</p>
          </div>
        </div>
        <span className="system-label">Transportverwaltung</span>
      </header>

      <main className="main">
        <section className="page-heading">
          <div>
            <p className="eyebrow">ÜBERSICHT</p>
            <h2>Fahrten verwalten</h2>
            <p className="subtitle">
              Übersicht aller geplanten Schülerfahrten.
            </p>
          </div>

          <div className="page-actions">
            <button
              className="refresh-button"
              onClick={loadTrips}
              disabled={loading}
            >
              ↻ Aktualisieren
            </button>
              <input
                className="search-input"
                type="search"
                placeholder="Schüler, Schule oder Fahrer suchen ..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
                        
            <select
              className="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Alle Status</option>
              <option value="active">Aktiv</option>
              <option value="cancelled">Storniert</option>
            </select>

            <select
              className="date-filter"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            >
              <option value="all">Alle Daten</option>
              <option value="today">Heute</option>
              <option value="week">Diese Woche</option>
              <option value="month">Diesen Monat</option>
            </select>
            <button
              className="add-button"
              onClick={() => {
                setFormError('')
                setShowForm((current) => !current)
              }}
            >
              + Fahrt hinzufügen
            </button>
          </div>
        </section>

        {showForm && (
          <section className="form-card">
            <div className="table-heading">
              <div>
                <h3>{editingTripId !== null ? 'Fahrt bearbeiten' : 'Neue Fahrt'}</h3>
                <p>Bitte alle Angaben ausfüllen.</p>
              </div>
            </div>

            <form className="trip-form" onSubmit={handleSubmit}>
              <label>
                Schüler/in
                <input
                  required
                  maxLength={150}
                  value={form.studentName}
                  onChange={(event) =>
                    setForm({ ...form, studentName: event.target.value })
                  }
                  placeholder="Name des Schülers"
                />
              </label>

              <label>
                Schule
                <input
                  required
                  maxLength={200}
                  value={form.schoolName}
                  onChange={(event) =>
                    setForm({ ...form, schoolName: event.target.value })
                  }
                  placeholder="Name der Schule"
                />
              </label>

              <label>
                Datum
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                />
              </label>

              <label>
                Fahrer/in
                <input
                  required
                  maxLength={150}
                  value={form.driverName}
                  onChange={(event) =>
                    setForm({ ...form, driverName: event.target.value })
                  }
                  placeholder="Name des Fahrers"
                />
              </label>

              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="refresh-button"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="add-button"
                  disabled={saving}
                >
                  {saving ? 'Wird gespeichert …' : 'Fahrt speichern'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="stats">
          <div className="stat-card">
            <span className="stat-label">Alle Fahrten</span>
            <strong>{trips.length}</strong>
            <span className="stat-note">Gesamt im System</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Aktive Fahrten</span>
            <strong>{trips.filter((trip) => !trip.cancelled).length}</strong>
            <span className="stat-note">Nicht storniert</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Stornierte Fahrten</span>
            <strong>{trips.filter((trip) => trip.cancelled).length}</strong>
            <span className="stat-note">Nicht aktiv</span>
          </div>
        </section>

        <section className="table-card">
          {statusError && (
            <div className="error-panel" role="alert">
            <p>{statusError}</p>
            </div>
          )}
          <div className="table-heading">
            <div>
              <h3>Fahrtenübersicht</h3>
              <p>Schüler, Schulen, Termine und Fahrer</p>
            </div>
            <span className="record-count">{trips.length} Einträge</span>
          </div>

          {loading ? (
            <p className="message">Fahrten werden geladen …</p>
          ) : error ? (
            <div className="error-panel">
              <p>{error}</p>
              <button onClick={loadTrips}>Erneut versuchen</button>
            </div>
          ) : trips.length === 0 ? (
            <p className="message">Keine Fahrten vorhanden.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>
                      <button className="sort-button" onClick={() => handleSort('studentName')}>
                        {sortLabel('studentName', 'Schüler/in')}
                      </button>
                    </th>
                    <th>
                      <button className="sort-button" onClick={() => handleSort('schoolName')}>
                        {sortLabel('schoolName', 'Schule')}
                      </button>
                    </th>
                    <th>
                      <button className="sort-button" onClick={() => handleSort('date')}>
                        {sortLabel('date', 'Datum')}
                      </button>
                    </th>
                    <th>
                      <button className="sort-button" onClick={() => handleSort('driverName')}>
                        {sortLabel('driverName', 'Fahrer/in')}
                      </button>
                    </th>
                    <th>
                      <button className="sort-button" onClick={() => handleSort('cancelled')}>
                        {sortLabel('cancelled', 'Status')}
                      </button>
                    </th>
                    <th>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTrips.map((trip) => (
                    <tr key={trip.id}>
                      <td>
                        <div className="student-cell">
                          <span className="student-avatar">
                            {trip.studentName?.charAt(0) || '?'}
                          </span>
                          <span>{trip.studentName}</span>
                        </div>
                      </td>
                      <td>{trip.schoolName}</td>
                      <td>
                        {new Date(`${trip.date}T00:00:00`).toLocaleDateString(
                          'de-DE',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          },
                        )}
                      </td>
                      <td>{trip.driverName}</td>
                      <td>
                        <span
                          className={`status ${
                            trip.cancelled ? 'status-cancelled' : 'status-active'
                          }`}
                        >
                          {trip.cancelled ? 'Storniert' : 'Aktiv'}
                        </span>
                      </td>


                      <td>
                        <div className="row-actions">
                          <button
                            className="edit-button"
                            onClick={() => handleEditTrip(trip)}
                          >
                            Bearbeiten
                          </button>

                          <button
                            className="status-action-button"
                            onClick={() => handleToggleStatus(trip)}
                            disabled={updatingTripId === trip.id}
                          >
                            {updatingTripId === trip.id
                              ? 'Wird gespeichert …'
                              : trip.cancelled
                                ? 'Reaktivieren'
                                : 'Stornieren'}
                          </button>
                        </div>
                      </td>


                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer>
          <span>TerraPlan · Schülerbeförderung</span>
          <span>Demonstrationsprojekt</span>
        </footer>
      </main>
    </div>
  )
}

export default App
