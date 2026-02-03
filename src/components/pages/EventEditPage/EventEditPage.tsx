'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/common/Layout/Layout';
import './EventEditPage.css';

interface Calendar {
  id: string;
  title: string;
  provider: 'google' | 'microsoft' | 'apple';
}

export default function EventEditPage() {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    provider: '',
    eventId: '',
    recurringEventId: '',
    calendarId: '',
    title: 'Event title',
    description: 'Event description',
    location: '',
    attendees: '',
    allDay: false,
    startDate: '',
    endDate: '',
    mode: 'this',
    recurrenceEnabled: false,
    recurrenceFrequency: 'DAILY',
    recurrenceInterval: 1,
    recurrenceCount: 3,
    recurrenceByDay: 'MO,TU,WE,TH,FR,SA,SU',
  });

  useEffect(() => {
    const now = new Date();
    const later = new Date(now.getTime() + 60 * 60 * 1000);

    setFormData((prev) => ({
      ...prev,
      startDate: now.toISOString().slice(0, 16),
      endDate: later.toISOString().slice(0, 16),
    }));
  }, []);

  const loadCalendars = async () => {
    try {
      const response = await fetch('/api/calendars');
      if (response.ok) {
        const data = await response.json();
        const filteredCals = data.filter((cal: Calendar) => !formData.provider || cal.provider === formData.provider);
        setCalendars(filteredCals);
      }
    } catch (err) {
      console.error('Failed to load calendars', err);
    }
  };

  useEffect(() => {
    if (formData.provider) {
      loadCalendars();
    }
  }, [formData.provider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const isUpdate = !!formData.eventId;
    const method = isUpdate ? 'PUT' : 'POST';

    const eventData: any = {
      provider: formData.provider,
      calendarId: formData.calendarId,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      start: `${formData.startDate}:00Z`,
      end: `${formData.endDate}:00Z`,
      allDay: formData.allDay,
    };

    if (isUpdate) {
      eventData.eventId = formData.eventId;
      if (formData.recurringEventId) {
        eventData.recurringEventId = formData.recurringEventId;
      }
      eventData.updateMode = formData.mode;
    }

    if (formData.attendees) {
      eventData.attendees = formData.attendees.split('\n').filter((e) => e.trim());
    }

    if (formData.recurrenceEnabled) {
      eventData.recurrence = {
        frequency: formData.recurrenceFrequency,
        interval: formData.recurrenceInterval,
        count: formData.recurrenceCount,
      };

      if (formData.recurrenceByDay) {
        eventData.recurrence.byDay = formData.recurrenceByDay.split(',').map((d) => d.trim());
      }
    }

    try {
      const response = await fetch('/api/events', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          type: 'success',
          message: isUpdate ? 'Event updated successfully!' : 'Event created successfully!',
        });
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Operation failed',
        });
      }
    } catch (err) {
      setResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Network error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.eventId || !confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setLoading(true);
    setResult(null);

    const deleteData: any = {
      provider: formData.provider,
      calendarId: formData.calendarId,
      eventId: formData.eventId,
    };

    if (formData.recurringEventId) {
      deleteData.recurringEventId = formData.recurringEventId;
      deleteData.deleteMode = formData.mode;
    }

    try {
      const response = await fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deleteData),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          type: 'success',
          message: 'Event deleted successfully!',
        });
        setFormData((prev) => ({ ...prev, eventId: '', recurringEventId: '' }));
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Delete failed',
        });
      }
    } catch (err) {
      setResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Network error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Create/Edit Calendar Event</h1>

      {result && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            result.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700'
          }`}
        >
          {result.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-section">
          <h3 className="section-title">Event Settings</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Provider *</label>
              <select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value, calendarId: '' })}
                required
              >
                <option value="">Select provider...</option>
                <option value="google">Google</option>
                <option value="microsoft">Microsoft</option>
                <option value="apple">Apple</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="mode">Update/Delete Mode</label>
              <select id="mode" value={formData.mode} onChange={(e) => setFormData({ ...formData, mode: e.target.value })}>
                <option value="this">This event only</option>
                <option value="following">This and following events</option>
                <option value="all">All events in series</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="eventId">Event ID</label>
            <input
              type="text"
              id="eventId"
              value={formData.eventId}
              onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              placeholder="Leave blank to create a new event"
            />
            <div className="help-text">Leave blank to create a new event, or provide an ID to update/delete</div>
          </div>

          <div className="form-group">
            <label htmlFor="recurringEventId">Recurring Event ID</label>
            <input
              type="text"
              id="recurringEventId"
              value={formData.recurringEventId}
              onChange={(e) => setFormData({ ...formData, recurringEventId: e.target.value })}
              placeholder="Only for recurring event instances"
            />
            <div className="help-text">Only needed when editing a specific instance of a recurring event</div>
          </div>

          <div className="form-group">
            <label htmlFor="calendarId">Calendar ID *</label>
            <select
              id="calendarId"
              value={formData.calendarId}
              onChange={(e) => setFormData({ ...formData, calendarId: e.target.value })}
              required
              disabled={!formData.provider}
            >
              <option value="">{formData.provider ? 'Select a calendar...' : 'Select a provider first'}</option>
              {calendars.map((cal) => (
                <option key={cal.id} value={cal.id}>
                  {cal.title} ({cal.provider})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Event Details</h3>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Conference Room A"
            />
          </div>

          <div className="form-group">
            <label htmlFor="attendees">Attendees</label>
            <textarea
              id="attendees"
              value={formData.attendees}
              onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
              placeholder="email1@example.com&#10;email2@example.com"
            />
            <div className="help-text">Enter one email address per line</div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Date & Time</h3>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
            />
            <label htmlFor="allDay">All day event</label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date & Time *</label>
              <input
                type="datetime-local"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date & Time *</label>
              <input
                type="datetime-local"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="recurrence-toggle">
            <input
              type="checkbox"
              id="recurrenceEnabled"
              checked={formData.recurrenceEnabled}
              onChange={(e) => setFormData({ ...formData, recurrenceEnabled: e.target.checked })}
            />
            <label htmlFor="recurrenceEnabled">Add Recurrence</label>
          </div>

          {formData.recurrenceEnabled && (
            <div className="recurrence-content show">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="frequency">Frequency</label>
                  <select
                    id="frequency"
                    value={formData.recurrenceFrequency}
                    onChange={(e) => setFormData({ ...formData, recurrenceFrequency: e.target.value })}
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="interval">Interval</label>
                  <input
                    type="number"
                    id="interval"
                    min="1"
                    value={formData.recurrenceInterval}
                    onChange={(e) => setFormData({ ...formData, recurrenceInterval: Number.parseInt(e.target.value) })}
                  />
                  <div className="help-text">Repeat every N days/weeks/months</div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="count">Count</label>
                <input
                  type="number"
                  id="count"
                  min="1"
                  value={formData.recurrenceCount}
                  onChange={(e) => setFormData({ ...formData, recurrenceCount: Number.parseInt(e.target.value) })}
                />
                <div className="help-text">Number of occurrences</div>
              </div>

              <div className="form-group">
                <label htmlFor="byDay">By Day</label>
                <input
                  type="text"
                  id="byDay"
                  value={formData.recurrenceByDay}
                  onChange={(e) => setFormData({ ...formData, recurrenceByDay: e.target.value })}
                  placeholder="MO,TU,WE,TH,FR"
                />
                <div className="help-text">Comma-separated days: SU,MO,TU,WE,TH,FR,SA</div>
              </div>
            </div>
          )}
        </div>

        <div className="btn-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Processing...' : 'Create/Update Event'}
          </button>
          <button type="button" onClick={handleDelete} className="btn btn-danger" disabled={loading || !formData.eventId}>
            Delete Event
          </button>
        </div>
      </form>
    </Layout>
  );
}
