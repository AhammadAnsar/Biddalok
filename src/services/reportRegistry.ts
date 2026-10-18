import { ExportFormat } from './exportService';

export interface ReportDefinition {
  id: string;
  name: string;
  nameBn: string;
  category: 'student' | 'staff' | 'exam' | 'finance' | 'committee' | 'attendance';
  supportedFormats: ExportFormat[];
  requiredPermissions: string[];
  readinessCheck?: () => { isReady: boolean; reason?: string };
  sourceQuery: (filters?: any) => Promise<any[]>;
  dtoMapper: (raw: any, language: 'en' | 'bn') => any;
}

export const reportRegistry = new Map<string, ReportDefinition>();

export function registerReport(def: ReportDefinition) {
  reportRegistry.set(def.id, def);
}

export function getAvailableReports(userPermissions: string[]): ReportDefinition[] {
  return Array.from(reportRegistry.values()).filter(report => {
    return report.requiredPermissions.every(p => userPermissions.includes(p));
  });
}
