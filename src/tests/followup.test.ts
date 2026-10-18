import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';
import { FollowupCampaign, FollowupAssignment, FollowupVisit } from '../types';

describe('Followup Module Characterization Tests', () => {
  beforeEach(() => {
    useAppStore.setState({
      followupCampaigns: [],
      followupTeams: [],
      followupAssignments: [],
      followupVisits: [],
    });
  });

  it('creates and updates a followup campaign', () => {
    const campaign: FollowupCampaign = {
      id: 'camp-01',
      title: 'HSC Candidate Regular Attendance Campaign',
      titleBn: 'এইচএসসি পরীক্ষার্থী নিয়মিত উপস্থিতি ক্যাম্পেইন',
      description: 'Focusing on irregular attendees',
      status: 'active',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      targetClassIds: ['cls_10'],
      totalStudentsTargeted: 25,
      completedVisits: 0,
    };

    useAppStore.getState().addFollowupCampaign(campaign);
    expect(useAppStore.getState().followupCampaigns.length).toBe(1);

    useAppStore.getState().updateFollowupCampaign('camp-01', {
      completedVisits: 5,
    });
    const updated = useAppStore.getState().followupCampaigns.find(c => c.id === 'camp-01');
    expect(updated?.completedVisits).toBe(5);
  });

  it('assigns students to teams and supports bulk assignments', () => {
    const assignments: FollowupAssignment[] = [
      {
        id: 'asg-01',
        campaignId: 'camp-01',
        studentId: 'st-101',
        assignedToStaffId: 'staff-01',
        status: 'pending',
        priority: 'high',
        assignedAt: '2026-03-01',
      },
      {
        id: 'asg-02',
        campaignId: 'camp-01',
        studentId: 'st-102',
        assignedToStaffId: 'staff-02',
        status: 'pending',
        priority: 'medium',
        assignedAt: '2026-03-01',
      },
    ];

    useAppStore.getState().bulkAddFollowupAssignments(assignments);
    const stored = useAppStore.getState().followupAssignments;
    expect(stored.length).toBe(2);
    expect(stored[0].studentId).toBe('st-101');
    expect(stored[1].studentId).toBe('st-102');
  });

  it('logs a visit record and transitions assignment status', () => {
    const assignment: FollowupAssignment = {
      id: 'asg-01',
      campaignId: 'camp-01',
      studentId: 'st-101',
      assignedToStaffId: 'staff-01',
      status: 'pending',
      priority: 'high',
      assignedAt: '2026-03-01',
    };
    useAppStore.getState().addFollowupAssignment(assignment);

    const visit: FollowupVisit = {
      id: 'visit-01',
      campaignId: 'camp-01',
      assignmentId: 'asg-01',
      studentId: 'st-101',
      teamId: 'team-01',
      visitorStaffId: 'staff-01',
      visitDate: '2026-03-05',
      studentFound: true,
      visitType: 'home_visit',
      outcome: 'positive',
      summary: 'Parent committed to ensuring regular attendance',
      nextFollowupDate: '2026-03-20',
      status: 'submitted',
      createdAt: '2026-03-05T10:00:00.000Z',
      updatedAt: '2026-03-05T10:00:00.000Z',
    };

    useAppStore.getState().addFollowupVisit(visit);
    useAppStore.getState().updateFollowupAssignment('asg-01', {
      status: 'completed',
    });

    expect(useAppStore.getState().followupVisits.length).toBe(1);
    const asg = useAppStore.getState().followupAssignments.find(a => a.id === 'asg-01');
    expect(asg?.status).toBe('completed');
  });
});
