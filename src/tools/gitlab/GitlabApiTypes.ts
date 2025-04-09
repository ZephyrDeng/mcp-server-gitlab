import { z } from "zod";

export const OperationType = z.enum([
  'raw',
  'getCurrentUserTasks',
  'searchUserWithProjects',
  'searchProjectWithDetails',
  'createMRComment',
  'acceptMR'
]);

export interface GitlabRestfulApiInput {
  operation: z.infer<typeof OperationType>;
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, any>;
  data?: Record<string, any>;
  username?: string;
  projectName?: string;
  projectId?: string;
  mergeRequestId?: number;
  comment?: string;
  mergeOptions?: {
    mergeCommitMessage?: string;
    squash?: boolean;
    shouldRemoveSourceBranch?: boolean;
  };
  includeAssignedMRs?: boolean | "true" | "false";
  includeReviewMRs?: boolean | "true" | "false";
  includePipelines?: boolean | "true" | "false";
  includeIssues?: boolean | "true" | "false";
  fields?: string[];
}

export interface GitlabApiConfig {
  baseUrl: string;
  privateToken: string;
  timeout?: number;
}

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