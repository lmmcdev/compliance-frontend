// Domain-specific contexts
export {
  AccountProvider,
  useAccountContext,
  useAccounts,
  useAccountSearch,
  useAccountOperations,
} from './AccountContext';

export {
  LicenseProvider,
  useLicenseContext,
  useCurrentLicense,
  useLicenses,
  useLicenseOperations,
  type License,
} from './LicenseContext';

export {
  ComplianceProvider,
  useComplianceContext,
  useComplianceReports,
  useComplianceRules,
  useComplianceFindings,
  useComplianceOperations,
} from './ComplianceContext';

export {
  IncidentsProvider,
  useIncidents,
  useIncidentOperations,
} from './IncidentsContext';

export {
  IncidentAnalyticsProvider,
  useIncidentAnalytics,
} from './IncidentAnalyticsContext';

// Legacy context (will be gradually replaced)
export {
  DataProvider,
  useData,
  useAccounts as useLegacyAccounts,
} from './DataContext';