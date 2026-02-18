'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/common/Layout/Layout';
import JsonViewer from '@/components/common/JsonViewer/JsonViewer';
import './EventsPage.css';

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  provider: 'google' | 'microsoft' | 'apple';
  calendarId: string;
  description?: string;
  location?: string;
  allDay?: boolean;
  color?: string;
}

interface EventsResponse {
  events: Event[];
  paging?: string;
}

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [latestResponse, setLatestResponse] = useState<EventsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paging, setPaging] = useState<string | undefined>(undefined);
  const [apiInfo, setApiInfo] = useState<{ method: string; url: string; params: any }>({ method: '', url: '', params: {} });

  const [filters, setFilters] = useState({
    timeMin: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 31);
      return date.toISOString().slice(0, 16);
    })(),
    timeMax: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 90);
      return date.toISOString().slice(0, 16);
    })(),
    pageSize: 100,
    singleEvents: true,
    calendarIds: {
      google: [],
      microsoft: [],
      apple: [],
      caldav: [],
    },
  });

  const loadEvents = async (reset = false, loadMore = false) => {
    setLoading(true);
    setError(null);

    if (reset) {
      setAllEvents([]);
      setLatestResponse(null);
      setPaging(undefined);
    }

    const params = new URLSearchParams({
      start: `${filters.timeMin}:00Z`,
      end: `${filters.timeMax}:59Z`,
      pageSize: filters.pageSize.toString(),
      singleEvents: filters.singleEvents.toString(),
      calendarIds: JSON.stringify(filters.calendarIds),
    });

    if (loadMore && paging) {
      params.append('paging', paging);
    }

    const apiUrl = `/api/events?${params.toString()}`;

    try {
      const response = await fetch(apiUrl);

      if (response.status === 401) {
        globalThis.location.href = '/api/logout';
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: EventsResponse = await response.json();

      setApiInfo({
        method: 'GET',
        url: apiUrl,
        params: {
          start: `${filters.timeMin}:00Z`,
          end: `${filters.timeMax}:59Z`,
          pageSize: filters.pageSize,
          singleEvents: filters.singleEvents,
          calendarIds: filters.calendarIds,
          paging: loadMore && paging ? paging : undefined,
        },
      });

      setLatestResponse(data);

      if (loadMore) {
        setAllEvents((prev) => [...prev, ...data.events]);
      } else {
        setAllEvents(data.events);
      }

      setPaging(data.paging);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(true);
  }, []);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Calendar Events</h1>
      <button className="refresh mb-4" onClick={() => loadEvents(true)}>
        Refresh
      </button>

      {paging && (
        <button className="sticky-load-more" onClick={() => loadEvents(false, true)} disabled={loading}>
          Load More
        </button>
      )}

      <div className="filter-form">
        <div className="filter-row">
          <div className="filter-group">
            <label>Start date</label>
            <input type="datetime-local" value={filters.timeMin} onChange={(e) => setFilters({ ...filters, timeMin: e.target.value })} />
          </div>
          <div className="filter-group">
            <label>End date</label>
            <input type="datetime-local" value={filters.timeMax} onChange={(e) => setFilters({ ...filters, timeMax: e.target.value })} />
          </div>
          <div className="filter-group">
            <label>Page size</label>
            <input
              type="number"
              min="1"
              max="100"
              value={filters.pageSize}
              onChange={(e) => setFilters({ ...filters, pageSize: Number.parseInt(e.target.value) })}
            />
          </div>
          <button className="btn btn-primary" onClick={() => loadEvents(true)}>
            Load
          </button>
        </div>
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="singleEvents"
            checked={filters.singleEvents}
            onChange={(e) => setFilters({ ...filters, singleEvents: e.target.checked })}
          />
          <label htmlFor="singleEvents">Single Events</label>
        </div>
      </div>

      {apiInfo.url && (
        <>
          <div className="api-info-compact">
            <span className="api-badge api-method">{apiInfo.method}</span>
            <span className="api-url font-mono text-sm break-all">{apiInfo.url}</span>
          </div>
          <JsonViewer src={apiInfo.params} title="Query parameters" collapsed={3} copyable={false} />
        </>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}

      {error && (
        <div className="error bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {allEvents.length > 0 && (
        <>
          <JsonViewer src={allEvents} title={`All events loaded (${allEvents.length} events)`} collapsed={2} className="mb-4" />

          {latestResponse && (
            <JsonViewer src={latestResponse} title={`Latest API response (${latestResponse.events.length} events)`} collapsed={3} />
          )}
        </>
      )}
    </Layout>
  );
}
