import type { WorkingHours, Incident } from '../contexts/IncidentsContext';

export interface AgentWorkingSummary {
  technicianId: number;
  technicianName: string;
  technicianEmail: string;
  totalHours: number;
  totalCost: number;
  sessions: WorkingHours[];
  billiableHours: number;
  nonBilliableHours: number;
}

export interface WorkingHoursSummary {
  totalHours: number;
  totalCost: number;
  billiableHours: number;
  nonBilliableHours: number;
  agentBreakdown: AgentWorkingSummary[];
  totalSessions: number;
}

/**
 * Calculate the duration in hours between two date strings
 */
export const calculateHoursDuration = (startTime: string, endTime: string): number => {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn('Invalid date format in working hours:', { startTime, endTime });
      return 0;
    }

    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return Math.max(0, diffHours); // Ensure non-negative duration
  } catch (error) {
    console.error('Error calculating hours duration:', error);
    return 0;
  }
};

/**
 * Calculate the cost for a working hours session
 */
export const calculateSessionCost = (workingHour: WorkingHours): number => {
  const duration = calculateHoursDuration(workingHour.StartWorkHour, workingHour.EndWorkHour);
  return duration * workingHour.RateAmount;
};

/**
 * Get working hours summary for a single incident
 */
export const getIncidentWorkingHoursSummary = (incident: Incident): WorkingHoursSummary => {
  const workingHours = incident.Working_Hours || [];

  if (workingHours.length === 0) {
    return {
      totalHours: 0,
      totalCost: 0,
      billiableHours: 0,
      nonBilliableHours: 0,
      agentBreakdown: [],
      totalSessions: 0,
    };
  }

  // Group by technician
  const agentGroups = new Map<number, WorkingHours[]>();
  workingHours.forEach(wh => {
    const techId = wh.TechnicianContactID;
    if (!agentGroups.has(techId)) {
      agentGroups.set(techId, []);
    }
    agentGroups.get(techId)!.push(wh);
  });

  // Calculate summary for each agent
  const agentBreakdown: AgentWorkingSummary[] = [];
  let totalHours = 0;
  let totalCost = 0;
  let billiableHours = 0;
  let nonBilliableHours = 0;

  agentGroups.forEach((sessions, techId) => {
    const firstSession = sessions[0];
    let agentTotalHours = 0;
    let agentTotalCost = 0;
    let agentBilliableHours = 0;
    let agentNonBilliableHours = 0;

    sessions.forEach(session => {
      const duration = calculateHoursDuration(session.StartWorkHour, session.EndWorkHour);
      const cost = calculateSessionCost(session);

      agentTotalHours += duration;
      agentTotalCost += cost;

      if (session.Billiable) {
        agentBilliableHours += duration;
      } else {
        agentNonBilliableHours += duration;
      }
    });

    // Add to totals
    totalHours += agentTotalHours;
    totalCost += agentTotalCost;
    billiableHours += agentBilliableHours;
    nonBilliableHours += agentNonBilliableHours;

    agentBreakdown.push({
      technicianId: techId,
      technicianName: firstSession.TechnicianFullName,
      technicianEmail: firstSession.TechnicianEmail,
      totalHours: agentTotalHours,
      totalCost: agentTotalCost,
      sessions,
      billiableHours: agentBilliableHours,
      nonBilliableHours: agentNonBilliableHours,
    });
  });

  // Sort agents by total hours descending
  agentBreakdown.sort((a, b) => b.totalHours - a.totalHours);

  return {
    totalHours,
    totalCost,
    billiableHours,
    nonBilliableHours,
    agentBreakdown,
    totalSessions: workingHours.length,
  };
};

/**
 * Format hours as a human-readable string
 */
export const formatHours = (hours: number): string => {
  if (hours === 0) return '0h';

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (wholeHours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${wholeHours}h`;
  }

  return `${wholeHours}h ${minutes}m`;
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Get a quick total hours for display in tables
 */
export const getQuickTotalHours = (incident: Incident): number => {
  const workingHours = incident.Working_Hours || [];
  return workingHours.reduce((total, wh) => {
    return total + calculateHoursDuration(wh.StartWorkHour, wh.EndWorkHour);
  }, 0);
};

/**
 * Get a quick total cost for display in tables
 */
export const getQuickTotalCost = (incident: Incident): number => {
  const workingHours = incident.Working_Hours || [];
  return workingHours.reduce((total, wh) => {
    return total + calculateSessionCost(wh);
  }, 0);
};