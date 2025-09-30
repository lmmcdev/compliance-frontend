import React, { createContext, useContext, useCallback } from 'react';
import { useApiQuery, useApiMutation } from '../hooks/data';

export interface IncidentComment {
  Date: string;
  Comment: string;
  CommentHtml: string;
  EndUserID?: number | null;
  TechnicianContactID?: number | null;
  Email?: string;
  FirstName?: string;
  LastName?: string;
  IsInternal: boolean;
}

export interface WorkingHours {
  TicketID: number;
  WorkHoursID: number;
  StartWorkHour: string;
  EndWorkHour: string;
  TechnicianContactID: number;
  Billiable: boolean;
  OnCustomerSite: boolean;
  TechnicianFullName: string;
  TechnicianEmail: string;
  RateID: number;
  RateAmount: number;
}

export interface Incident {
  id: string;
  doc_type: string;
  row_number: string;
  Ticket_ID: string;
  Ticket_impact: string;
  Ticket_number: string;
  Activity_status: string;
  Ticket_priority: string;
  Ticket_resolved_Date: string;
  Ticket_resolved_Time: string;
  Ticket_source: string;
  Ticket_title: string;
  Ticket_type: string;
  Agent_name: string;
  Public_IP_address: string;
  Machine_name: string;
  Machine_ID: string;
  Comment_contact_ID: string;
  Comment_end_user_ID: string;
  Comment_ID: string;
  Comment_is_internal: string;
  Comment_source: string;
  End_User_email: string;
  End_User_full_name: string;
  End_User_phone: string;
  End_User_status: string;
  Department_ID: string;
  Site_ID: string;
  Site_name: string;
  Site_phone: string;
  Work_hour_start_Time: string;
  Work_hour_end_Time: string;
  Count: string;
  Count2: string;
  _rid: string;
  _self: string;
  _etag: string;
  _attachments: string;
  _ts: number;
  // New fields
  comments?: IncidentComment[];
  Working_Hours?: WorkingHours[];
}

export interface CreateIncidentData {
  Ticket_title: string;
  Ticket_type: string;
  Ticket_priority: string;
  Ticket_impact: string;
  Ticket_source: string;
  Agent_name?: string;
  End_User_email?: string;
  End_User_full_name?: string;
  Site_name?: string;
}

export interface UpdateIncidentData extends Partial<CreateIncidentData> {
  Activity_status?: string;
  Ticket_resolved_Date?: string;
  Ticket_resolved_Time?: string;
}

interface IncidentsContextType {
  // Data state
  incidents: Incident[];
  loading: boolean;
  error: string | null;

  // Pagination and filtering
  pagination: {
    hasMore: boolean;
    continuationToken?: string;
    pageSize: number;
    currentPage: number;
    totalLoaded: number;
  };

  // Operations
  refresh: () => void;
  createIncident: (data: CreateIncidentData) => Promise<Incident>;
  updateIncident: (id: string, data: UpdateIncidentData) => Promise<Incident>;
  deleteIncident: (id: string) => Promise<void>;
  getIncidentById: (id: string) => Promise<Incident>;

  // Bulk operations
  bulkUpdateStatus: (ids: string[], status: string) => Promise<void>;
  bulkAssign: (ids: string[], assignedTo: string) => Promise<void>;

  // Filtering and search
  loadMore: () => void;
  setPageSize: (pageSize: number) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setPriorityFilter: (priority: string) => void;
  searchQuery: string;
  statusFilter: string;
  priorityFilter: string;
}

const IncidentsContext = createContext<IncidentsContextType | undefined>(undefined);

interface IncidentsProviderProps {
  children: React.ReactNode;
}

export const IncidentsProvider: React.FC<IncidentsProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [priorityFilter, setPriorityFilter] = React.useState('all');
  const [pageSize, setPageSize] = React.useState(25);
  const [continuationToken, setContinuationToken] = React.useState<string | undefined>();
  const [allIncidents, setAllIncidents] = React.useState<Incident[]>([]);
  const [currentPage, setCurrentPage] = React.useState(0);

  // Build query parameters for API calls
  const queryParams = React.useMemo(() => {
    const params = new URLSearchParams();
    params.set('pageSize', pageSize.toString());

    if (continuationToken) {
      params.set('continuationToken', continuationToken);
    }

    if (searchQuery) {
      params.set('search', searchQuery);
    }

    if (statusFilter !== 'all') {
      params.set('status', statusFilter);
    }

    if (priorityFilter !== 'all') {
      params.set('priority', priorityFilter);
    }

    return params.toString();
  }, [pageSize, continuationToken, searchQuery, statusFilter, priorityFilter]);

  // Fetch incidents with query parameters
  const {
    data: apiResponse,
    loading,
    error,
    refetch: fetchData
  } = useApiQuery('incidents', `/incidents?${queryParams}`);

  // Process response and update incidents list
  React.useEffect(() => {
    if (apiResponse && apiResponse.success) {
      const incidentsData = apiResponse.data;
      const newIncidents = incidentsData?.items || [];

      if (continuationToken) {
        // Append to existing incidents for "load more" functionality
        setAllIncidents(prev => [...prev, ...newIncidents]);
      } else {
        // Replace incidents for new search/filter
        setAllIncidents(newIncidents);
      }

      // Update continuation token for next page (if provided in response)
      setContinuationToken(incidentsData?.continuationToken);
    } else if (apiResponse && !apiResponse.success) {
      // Handle API error response
      console.error('[IncidentsContext] API returned error:', apiResponse);
      setAllIncidents([]);
    }
  }, [apiResponse, continuationToken]);

  // Reset incidents when search/filters change
  React.useEffect(() => {
    setAllIncidents([]);
    setContinuationToken(undefined);
    setCurrentPage(0);
  }, [searchQuery, statusFilter, priorityFilter]);

  // Extract data with fallbacks
  const incidents = allIncidents;
  const pagination = {
    hasMore: !!(apiResponse?.success && apiResponse?.data?.continuationToken),
    continuationToken: apiResponse?.success ? apiResponse?.data?.continuationToken : undefined,
    pageSize,
    currentPage,
    totalLoaded: allIncidents.length
  };

  // Mutations
  const createMutation = useApiMutation<Incident>('/incidents', 'POST', {
    onSuccess: () => {
      console.log('[IncidentsContext] Incident created successfully');
      fetchData();
    },
    onError: (error: string) => {
      console.error('[IncidentsContext] Failed to create incident:', error);
    }
  });

  const updateMutation = useApiMutation<Incident>('/incidents/:id', 'PUT', {
    onSuccess: () => {
      console.log('[IncidentsContext] Incident updated successfully');
      fetchData();
    },
    onError: (error: string) => {
      console.error('[IncidentsContext] Failed to update incident:', error);
    }
  });

  const deleteMutation = useApiMutation<void>('/incidents/:id', 'DELETE', {
    onSuccess: () => {
      console.log('[IncidentsContext] Incident deleted successfully');
      fetchData();
    },
    onError: (error: string) => {
      console.error('[IncidentsContext] Failed to delete incident:', error);
    }
  });

  const bulkUpdateMutation = useApiMutation<void>('/incidents/bulk/status', 'PUT', {
    onSuccess: () => {
      console.log('[IncidentsContext] Bulk status update successful');
      fetchData();
    },
    onError: (error: string) => {
      console.error('[IncidentsContext] Failed to bulk update status:', error);
    }
  });

  const bulkAssignMutation = useApiMutation<void>('/incidents/bulk/assign', 'PUT', {
    onSuccess: () => {
      console.log('[IncidentsContext] Bulk assignment successful');
      fetchData();
    },
    onError: (error: string) => {
      console.error('[IncidentsContext] Failed to bulk assign:', error);
    }
  });

  // Operation handlers
  const createIncident = useCallback(async (data: CreateIncidentData): Promise<Incident> => {
    return await createMutation.mutate(data);
  }, [createMutation]);

  const updateIncident = useCallback(async (_id: string, data: UpdateIncidentData): Promise<Incident> => {
    return await updateMutation.mutate(data);
  }, [updateMutation]);

  const deleteIncident = useCallback(async (_id: string): Promise<void> => {
    await deleteMutation.mutate(undefined);
  }, [deleteMutation]);

  const getIncidentById = useCallback(async (id: string): Promise<Incident> => {
    // For single incident fetching, we can use a separate query or find in current data
    const existingIncident = incidents.find((incident: Incident) => incident.id === id);
    if (existingIncident) {
      return existingIncident;
    }

    // If not found in current data, fetch from API
    const response = await fetch(`/api/incidents/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch incident');
    }

    const apiResponse = await response.json();
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    } else {
      throw new Error('API returned error or no data');
    }
  }, [incidents]);

  const bulkUpdateStatus = useCallback(async (ids: string[], status: string): Promise<void> => {
    await bulkUpdateMutation.mutate({ ids, status });
  }, [bulkUpdateMutation]);

  const bulkAssign = useCallback(async (ids: string[], assignedTo: string): Promise<void> => {
    await bulkAssignMutation.mutate({ ids, assignedTo });
  }, [bulkAssignMutation]);

  const value: IncidentsContextType = {
    // Data state
    incidents,
    loading,
    error,
    pagination,

    // Operations
    refresh: fetchData,
    createIncident,
    updateIncident,
    deleteIncident,
    getIncidentById,
    bulkUpdateStatus,
    bulkAssign,

    // Filtering and search
    loadMore: () => {
      if (pagination.hasMore && !loading) {
        setCurrentPage(prev => prev + 1);
        fetchData();
      }
    },
    setPageSize,
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    searchQuery,
    statusFilter,
    priorityFilter
  };

  return (
    <IncidentsContext.Provider value={value}>
      {children}
    </IncidentsContext.Provider>
  );
};

export const useIncidents = (): IncidentsContextType => {
  const context = useContext(IncidentsContext);
  if (context === undefined) {
    throw new Error('useIncidents must be used within an IncidentsProvider');
  }
  return context;
};

export const useIncidentOperations = () => {
  const context = useIncidents();

  return {
    create: {
      mutate: context.createIncident,
      loading: false // We could track individual operation loading if needed
    },
    update: {
      mutate: context.updateIncident,
      loading: false
    },
    delete: {
      mutate: context.deleteIncident,
      loading: false
    },
    bulkUpdateStatus: {
      mutate: context.bulkUpdateStatus,
      loading: false
    },
    bulkAssign: {
      mutate: context.bulkAssign,
      loading: false
    }
  };
};

export default IncidentsContext;