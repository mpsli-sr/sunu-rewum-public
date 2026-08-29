"use client";
import { useEffect, useState } from "react";
import StatsWidget from "@/components/dashboard/StatsWidget";
import UpcomingEventsWidget from "@/components/dashboard/UpcomingEventsWidget";
import LatestPostsWidget from "@/components/dashboard/LatestPostsWidget";
import PopularProposalsWidget from "@/components/dashboard/PopularProposalsWidget";
import MemberChartWidget from "@/components/dashboard/MemberChartWidget";
import { http } from "@/lib/api";

const widgetMap: Record<string, React.ComponentType> = {
  stats: StatsWidget,
  memberChart: MemberChartWidget,
  events: UpcomingEventsWidget,
  posts: LatestPostsWidget,
  proposals: PopularProposalsWidget,
};

export default function DashboardPage() {
  const [widgets, setWidgets] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    http
      .get<any>("/api/auth/me")
      .then((u) => {
        setUser(u);
        const role = u?.role || "VISITOR";
        return http.get<string[]>(`/api/dashboard-config?role=${role}`);
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setWidgets(data);
        } else {
          setWidgets(["stats", "memberChart", "posts", "proposals", "events"]);
        }
      })
      .catch(() => {
        setWidgets(["stats", "memberChart", "posts", "proposals", "events"]);
      });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        📊 Bienvenue, {user?.firstName ?? "Admin"}
      </h1>
      <div className="space-y-8">
        {widgets.map((w) => {
          const WidgetComponent = widgetMap[w];
          return WidgetComponent ? <WidgetComponent key={w} /> : null;
        })}
      </div>
    </div>
  );
}
