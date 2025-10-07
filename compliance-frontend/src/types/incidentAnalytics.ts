// Incident Analytics Types

export interface IncidentSummary {
  id: string;
  title: string;
  created: string;
  resolved: string;
}

export interface TimelineEntry {
  date: string;
  category: string;
  count: number;
  incidents: IncidentSummary[];
}

export interface HeatmapEntry {
  hour: number;
  activity: string;
  count: number;
  incidents: string[];
}

export interface BlockedTool {
  tool: string;
  count: number;
  incidents: string[];
  firstOccurrence: string;
  lastOccurrence: string;
}

export interface GeographicEntry {
  ip: string;
  count: number;
  incidents: string[];
}

export interface IncidentAnalyticsSummary {
  totalIncidents: number;
  dateRange: {
    start: string;
    end: string;
  };
  uniqueCategories: number;
  uniqueIPs: number;
}

export interface IncidentAnalyticsData {
  summary: IncidentAnalyticsSummary;
  timeline: TimelineEntry[];
  heatmap: HeatmapEntry[];
  blockedTools: BlockedTool[];
  geographicMap: GeographicEntry[];
  timestamp: string;
}

export interface IncidentAnalyticsResponse {
  success: boolean;
  data: IncidentAnalyticsData;
  meta: {
    traceId: string;
  };
}
