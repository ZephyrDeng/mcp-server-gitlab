export interface GitlabApiResponse {
  status?: number;
  message?: string;
  error?: boolean;
  details?: any;
  fieldsInfo?: {
    requestedFields: string[];
    availableFields: string[];
    missingFields: string[];
    suggestedPaths?: string[];
    processedFields?: string[];
    message: string;
  };
  availableOperations?: string[];
  examples?: any[];
  [key: string]: any;
}