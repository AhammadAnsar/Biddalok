import { ManagingCommitteeInfo, Institution } from '../types';
import { useAppStore } from '../store/useAppStore';

export function getActiveElectionCommittee(): ManagingCommitteeInfo | undefined {
  const store = useAppStore.getState();
  return store.managingCommitteesList.find(c => c.status === 'in_election');
}

export function initializeElectionCommittee(year: string, type: string): ManagingCommitteeInfo {
  const store = useAppStore.getState();
  // Ensure same-year committees don't overwrite if one exists
  const existing = store.managingCommitteesList.find(c => c.year === year && c.committeeType === type);
  if (existing) return existing;

  const newComm: ManagingCommitteeInfo = {
    id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    year,
    committeeType: type,
    status: 'in_election',
    members: [],
    electionState: {
      currentStep: 'voters'
    }
  };
  store.saveManagingCommitteeRecord(newComm);
  return newComm;
}

export async function advanceElectionStep(
  committeeId: string, 
  nextStep: string, 
  payload: any = {}
): Promise<void> {
  const store = useAppStore.getState();
  const committee = store.managingCommitteesList.find(c => c.id === committeeId);
  
  if (!committee) throw new Error('Committee not found');

  const newState = { ...(committee.electionState || { currentStep: 'voters' }), ...payload, currentStep: nextStep };
  
  store.saveManagingCommitteeRecord({
    ...committee,
    electionState: newState
  });
}
