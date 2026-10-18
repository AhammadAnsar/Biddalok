import { registerReport } from './reportRegistry';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';

export function initializeReports() {
  registerReport({
    id: 'staff_list_roster',
    name: 'Staff List Roster',
    nameBn: 'শিক্ষক ও কর্মচারী তালিকা',
    category: 'staff',
    supportedFormats: ['pdf', 'xlsx', 'docx'],
    requiredPermissions: ['view_staff'],
    sourceQuery: async () => {
      return useAppStore.getState().staff;
    },
    dtoMapper: (raw: any, language: 'en' | 'bn') => {
      const isBn = language === 'bn';
      return {
        id: raw.customStaffId || raw.id,
        name: isBn ? (raw.nameBn || raw.name) : raw.name,
        mobile: raw.mobile || '',
        designation: isBn ? (raw.designationBn || raw.designation) : raw.designation,
        type: isBn && raw.staffType === 'Teaching' ? 'শিক্ষক' : raw.staffType
      };
    }
  });

  registerReport({
    id: 'committee_members',
    name: 'Managing Committee Members',
    nameBn: 'পরিচালনা পর্ষদ সদস্য তালিকা',
    category: 'committee',
    supportedFormats: ['pdf', 'xlsx', 'docx'],
    requiredPermissions: ['view_committee'],
    sourceQuery: async () => {
      return await (db as any).committeeMembers.toArray();
    },
    dtoMapper: (raw: any, language: 'en' | 'bn') => {
      const isBn = language === 'bn';
      return {
        name: isBn ? (raw.nameBn || raw.name) : raw.name,
        mobile: raw.mobile || '',
        role: isBn ? (raw.roleBn || raw.role) : raw.role,
        type: raw.memberType,
        status: raw.status
      };
    }
  });

  // More reports can be registered similarly
}
