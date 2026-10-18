import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';
import { calculateUniqueGuardians, calculateEligibleTeachers } from '../utils/committeeUtils';
import { initializeElectionCommittee, advanceElectionStep } from '../services/committeeElectionService';

describe('Phase 13: Evidence-based Committee Lifecycle', () => {
  beforeEach(() => {
    // Reset store
    useAppStore.setState({
      students: [],
      staff: [],
      managingCommitteesList: [],
    });
  });

  it('An empty institution has zero actual voters and nominees', () => {
    const { students, staff } = useAppStore.getState();
    expect(calculateUniqueGuardians(students)).toBe(0);
    expect(calculateEligibleTeachers(staff)).toBe(0);
  });

  it('Two siblings do not duplicate one guardian where the eligibility rule treats them as one voter', () => {
    const students: any[] = [
      { id: '1', studentId: 'S1', fatherNid: '1234567890', fatherMobile: '01700000000', fatherName: 'Abul', motherName: 'Banu', village: 'Dhaka' },
      { id: '2', studentId: 'S2', fatherNid: '1234567890', fatherMobile: '01700000000', fatherName: 'Abul', motherName: 'Banu', village: 'Dhaka' },
    ];
    useAppStore.setState({ students });

    const guardians = calculateUniqueGuardians(students);
    expect(guardians).toBe(1); // 2 siblings, 1 unique guardian
  });

  it('A filename without bytes cannot satisfy evidence (activation fails without explicit approval/evidence)', () => {
    const committee = initializeElectionCommittee('2026', 'regular');
    
    // Attempt activation with no resolution or evidence
    const store = useAppStore.getState();
    const activatedRecord = {
      ...committee,
      status: 'active' as const,
      approvalResolutionNo: '',
      approvalDate: ''
    };

    expect(() => {
      store.saveManagingCommitteeRecord(activatedRecord);
    }).toThrow('Cannot activate committee without explicit approval resolution and date');

    // Attempt with resolution but missing file
    const activatedRecord2 = {
      ...activatedRecord,
      approvalResolutionNo: 'RES-01',
      approvalDate: '2026-01-01',
      electionState: {
        currentStep: 'approval',
        approvalAttachmentUrl: '' // Missing attachment bytes/url
      }
    };

    expect(() => {
      store.saveManagingCommitteeRecord(activatedRecord2);
    }).toThrow('Activation without required approval file/evidence is rejected');

    // Success case
    const activatedRecord3 = {
      ...activatedRecord2,
      electionState: {
        currentStep: 'approval',
        approvalAttachmentUrl: 'blob:http://localhost/1234'
      }
    };
    store.saveManagingCommitteeRecord(activatedRecord3);
    expect(useAppStore.getState().managingCommitteesList.find(c => c.id === committee.id)?.status).toBe('active');
  });

  it('Same-year committee histories stay separate', () => {
    const comm1 = initializeElectionCommittee('2026', 'regular');
    const comm2 = initializeElectionCommittee('2026', 'adhoc');

    expect(comm1.id).not.toBe(comm2.id);
    const store = useAppStore.getState();
    expect(store.managingCommitteesList.length).toBe(2);
  });
});
