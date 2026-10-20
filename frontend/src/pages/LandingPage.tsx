import { useEffect, useState } from "react";
import { CityDiscovery } from "../components/marketing/CityDiscovery";
import { FeaturedEditorial } from "../components/marketing/FeaturedEditorial";
import { LandingHero } from "../components/marketing/LandingHero";
import { TicketBanner } from "../components/marketing/TicketBanner";
import { RequestState } from "../components/ui/RequestState";
import { getPublicEvents, mapDtoToEvent } from "../api/events";
import type { Event } from "../types/event";

export function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    getPublicEvents({ size: 6 }).then(res => { if (active) setEvents(res.content.map(dto => mapDtoToEvent(dto))); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  return <div className="ev-editorial-page ev-home-page">
    <LandingHero event={events[0]} />
    <RequestState loading={loading} error={error} onRetry={() => setRetry(n => n + 1)} />
    {!loading && !error && !events.length && <p className="notice" role="status">Chưa có sự kiện được công bố.</p>}
    {events.length > 0 && <FeaturedEditorial events={events} />}
    <CityDiscovery /><TicketBanner />
  </div>;
}
