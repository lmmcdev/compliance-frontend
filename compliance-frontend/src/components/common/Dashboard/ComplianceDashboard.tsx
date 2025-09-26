import React, { useMemo } from 'react';
import {
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { Dashboard } from './Dashboard';
import { useComplianceReports, useComplianceFindings, useComplianceRules } from '../../../contexts';
import type { DashboardSection } from './Dashboard';

export const ComplianceDashboard: React.FC = () => {
  const { data: reports, loading: reportsLoading, error: reportsError } = useComplianceReports();
  const { data: findings, loading: findingsLoading, error: findingsError } = useComplianceFindings();
  const { data: rules, loading: rulesLoading, error: rulesError } = useComplianceRules();

  const loading = reportsLoading || findingsLoading || rulesLoading;
  const error = reportsError || findingsError || rulesError || undefined;

  // Calculate metrics from data
  const metrics = useMemo(() => {
    if (!reports || !findings || !rules) {
      return {
        totalReports: 0,
        completedReports: 0,
        averageScore: 0,
        totalFindings: 0,
        criticalFindings: 0,
        highFindings: 0,
        openFindings: 0,
        activeRules: 0,
        totalRules: 0,
      };
    }

    const totalReports = reports.length;
    const completedReports = reports.filter(r => r.status === 'completed').length;
    const averageScore = reports.length > 0
      ? reports.reduce((sum, r) => sum + r.score, 0) / reports.length
      : 0;

    const totalFindings = findings.length;
    const criticalFindings = findings.filter(f => f.severity === 'critical').length;
    const highFindings = findings.filter(f => f.severity === 'high').length;
    const openFindings = findings.filter(f => f.status === 'open').length;

    const totalRules = rules.length;
    const activeRules = rules.filter(r => r.isActive).length;

    return {
      totalReports,
      completedReports,
      averageScore,
      totalFindings,
      criticalFindings,
      highFindings,
      openFindings,
      activeRules,
      totalRules,
    };
  }, [reports, findings, rules]);

  const sections: DashboardSection[] = [
    {
      title: 'Compliance Reports',
      columns: { xs: 12, sm: 6, md: 4, lg: 3 },
      metrics: [
        {
          id: 'total-reports',
          title: 'Total Reports',
          value: metrics.totalReports,
          icon: <AssessmentIcon />,
          color: 'primary',
          subtitle: 'All compliance reports',
          trend: {
            value: 5.2,
            direction: 'up',
            label: '%',
            period: 'vs last month',
          },
        },
        {
          id: 'completed-reports',
          title: 'Completed',
          value: metrics.completedReports,
          icon: <CheckCircleIcon />,
          color: 'success',
          subtitle: 'Successfully processed',
          trend: {
            value: 12,
            direction: 'up',
            label: 'reports',
            period: 'this month',
          },
        },
        {
          id: 'completion-rate',
          title: 'Completion Rate',
          value: metrics.totalReports > 0 ? (metrics.completedReports / metrics.totalReports) * 100 : 0,
          format: 'percentage',
          icon: <ScheduleIcon />,
          color: 'info',
          subtitle: 'Reports completed',
        },
        {
          id: 'average-score',
          title: 'Average Score',
          value: metrics.averageScore,
          unit: '/100',
          icon: <SecurityIcon />,
          color: metrics.averageScore >= 80 ? 'success' : metrics.averageScore >= 60 ? 'warning' : 'error',
          subtitle: 'Compliance score',
          trend: {
            value: 2.1,
            direction: 'up',
            label: 'points',
            period: 'vs last period',
          },
        },
      ],
    },
    {
      title: 'Compliance Findings',
      columns: { xs: 12, sm: 6, md: 4, lg: 3 },
      metrics: [
        {
          id: 'total-findings',
          title: 'Total Findings',
          value: metrics.totalFindings,
          icon: <WarningIcon />,
          color: 'warning',
          subtitle: 'All compliance issues',
        },
        {
          id: 'critical-findings',
          title: 'Critical Issues',
          value: metrics.criticalFindings,
          icon: <ErrorIcon />,
          color: 'error',
          subtitle: 'Requires immediate attention',
          status: metrics.criticalFindings > 0 ? 'error' : 'success',
        },
        {
          id: 'high-findings',
          title: 'High Priority',
          value: metrics.highFindings,
          icon: <WarningIcon />,
          color: 'warning',
          subtitle: 'Important issues',
          status: metrics.highFindings > 5 ? 'warning' : 'info',
        },
        {
          id: 'open-findings',
          title: 'Open Issues',
          value: metrics.openFindings,
          icon: <ScheduleIcon />,
          color: 'info',
          subtitle: 'Awaiting resolution',
          trend: {
            value: -8,
            direction: 'down',
            label: 'issues',
            period: 'this week',
          },
        },
      ],
    },
    {
      title: 'Compliance Rules',
      columns: { xs: 12, sm: 6, md: 4, lg: 4 },
      metrics: [
        {
          id: 'total-rules',
          title: 'Total Rules',
          value: metrics.totalRules,
          icon: <SecurityIcon />,
          color: 'primary',
          subtitle: 'All compliance rules',
        },
        {
          id: 'active-rules',
          title: 'Active Rules',
          value: metrics.activeRules,
          icon: <CheckCircleIcon />,
          color: 'success',
          subtitle: 'Currently enforced',
        },
        {
          id: 'rule-coverage',
          title: 'Rule Coverage',
          value: metrics.totalRules > 0 ? (metrics.activeRules / metrics.totalRules) * 100 : 0,
          format: 'percentage',
          icon: <AssessmentIcon />,
          color: 'info',
          subtitle: 'Active vs total rules',
        },
      ],
    },
  ];

  return (
    <Dashboard
      title="Compliance Dashboard"
      subtitle="Monitor compliance status, findings, and rules across your organization"
      sections={sections}
      loading={loading}
      error={error}
    />
  );
};

export default ComplianceDashboard;