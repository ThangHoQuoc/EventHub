import { useEffect, useState } from "react";
import { CityDiscovery } from "../components/marketing/CityDiscovery";
import { EventMatchShowcase } from "../components/marketing/EventMatchShowcase";
import { FeaturedEditorial } from "../components/marketing/FeaturedEditorial";
import { LandingHero } from "../components/marketing/LandingHero";
import { TicketBanner } from "../components/marketing/TicketBanner";
import { WaitlistShowcase } from "../components/marketing/WaitlistShowcase";
import { mockEvents } from "../data/mockEvents";
import { getPublicEvents, mapDtoToEvent } from "../api/events";
import type { Event } from "../types/event";

export function LandingPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents);

  useEffect(() => {
    let isMounted = true;
    getPublicEvents({ size: 6 })
      .then((res) => {
        if (!isMounted) return;
        if (res.content && res.content.length > 0) {
          const mapped = res.content.map((dto) => mapDtoToEvent(dto, 250000));
          setEvents(mapped);
        }
      })
      .catch(() => {
        // Fallback to mock
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const heroEvent = events[0] || mockEvents[0];

  return (
    <div className="ev-editorial-page ev-home-page">
      <LandingHero event={heroEvent} />
      <FeaturedEditorial events={events} />
      <EventMatchShowcase events={events} />
      <WaitlistShowcase />
      <CityDiscovery />
      <TicketBanner />
    </div>
  );
}
