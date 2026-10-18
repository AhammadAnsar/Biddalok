import { 
  useAppStore, 
  defaultClasses, 
  defaultGroups, 
  defaultSections, 
  defaultSessions, 
  defaultAdmissionYears 
} from '../store/useAppStore';
import { useAuthStore, checkIsOnboarded } from '../store/useAuthStore';
import { DatabaseProvider } from './DatabaseProvider';
import { isDesktopApp } from '../store/sqliteBridge';
import { get, del } from 'idb-keyval';
import { 
  hydrateAllDexieData, 
  syncStudentsToDexie, 
  syncStaffToDexie,
  syncClassesToDexie, 
  syncGroupsToDexie, 
  syncSectionsToDexie, 
  syncSessionsToDexie, 
  syncAdmissionYearsToDexie,
  migrateZustandToDexie 
} from './database';
import { migratePhase09Finance } from './migrations/phase09FinanceMigration';

export type StartupStage = 'open' | 'migrate' | 'reconcile' | 'hydrate' | 'ready' | 'error';

class Orchestrator {
  private stage: StartupStage = 'open';

  public async runStartupSequence() {
    try {
      this.setStage('open');
      
      this.setStage('migrate');
      try {
        await migratePhase09Finance();
      } catch (err) {
        console.error('Phase 09 finance migration failed:', err);
      }

      this.setStage('reconcile');
      // Phase 02: Check if legacy idb-keyval blob exists and migrate it to canonical store.
      const legacyJson = await get('biddalok-app-storage');
      if (legacyJson) {
        console.log('[Startup] Found legacy idb-keyval blob, migrating to canonical store...');
        const parsed = typeof legacyJson === 'string' ? JSON.parse(legacyJson) : legacyJson;
        await migrateZustandToDexie(parsed?.state || parsed, true);
        await del('biddalok-app-storage');
        console.log('[Startup] Legacy blob migrated and archived.');
      }

      this.setStage('hydrate');
      try {
        const dexieData = await hydrateAllDexieData();
        const currentStore = useAppStore.getState();
        const patch: Record<string, any> = {};
        const isDesktop = isDesktopApp();

        // 0. Institution: Primary from SQLite system_settings, fallback to store
        let persistedInstitution = null;
        try {
          persistedInstitution = await DatabaseProvider.getSettings('institution');
        } catch (e) {
          console.warn('[Startup] Could not read institution from DatabaseProvider:', e);
        }

        if (persistedInstitution && (persistedInstitution.name || persistedInstitution.nameBn || persistedInstitution.eiin)) {
          patch.institution = { ...currentStore.institution, ...persistedInstitution };
          try {
            localStorage.setItem('isOnboarded', 'true');
          } catch (e) {}
        } else if (currentStore.institution && (currentStore.institution.name || currentStore.institution.nameBn)) {
          await DatabaseProvider.saveSettings('institution', currentStore.institution).catch(() => {});
        }

        // 1. Students: In Desktop mode, SQLite is primary source of truth
        let loadedStudents = null;
        if (isDesktop) {
          try {
            const sqliteStudents = await DatabaseProvider.getAll<any>('students');
            if (Array.isArray(sqliteStudents) && sqliteStudents.length > 0) {
              loadedStudents = sqliteStudents;
              await syncStudentsToDexie(sqliteStudents);
            }
          } catch (e) {
            console.warn('[Startup] Error reading students from SQLite:', e);
          }
        }

        if (!loadedStudents) {
          if (dexieData.students && dexieData.students.length > 0) {
            loadedStudents = dexieData.students;
            if (isDesktop) {
              await DatabaseProvider.bulkInsertOrReplace('students', dexieData.students).catch(() => {});
            }
          } else if (currentStore.students && currentStore.students.length > 0) {
            loadedStudents = currentStore.students;
            await syncStudentsToDexie(currentStore.students);
            if (isDesktop) {
              await DatabaseProvider.bulkInsertOrReplace('students', currentStore.students).catch(() => {});
            }
          }
        }

        if (loadedStudents && loadedStudents.length > 0) {
          patch.students = loadedStudents;
        }

        // 2. Staff: In Desktop mode, SQLite is primary source of truth
        let loadedStaff = null;
        if (isDesktop) {
          try {
            const sqliteStaff = await DatabaseProvider.getAll<any>('staff');
            if (Array.isArray(sqliteStaff) && sqliteStaff.length > 0) {
              loadedStaff = sqliteStaff;
              await syncStaffToDexie(sqliteStaff);
            }
          } catch (e) {
            console.warn('[Startup] Error reading staff from SQLite:', e);
          }
        }

        if (!loadedStaff) {
          if (dexieData.staff && dexieData.staff.length > 0) {
            loadedStaff = dexieData.staff;
            if (isDesktop) {
              await DatabaseProvider.bulkInsertOrReplace('staff', dexieData.staff).catch(() => {});
            }
          } else if (currentStore.staff && currentStore.staff.length > 0) {
            loadedStaff = currentStore.staff;
            await syncStaffToDexie(currentStore.staff);
            if (isDesktop) {
              await DatabaseProvider.bulkInsertOrReplace('staff', currentStore.staff).catch(() => {});
            }
          }
        }

        if (loadedStaff && loadedStaff.length > 0) {
          patch.staff = loadedStaff;
        }

        // 3. Exam Results
        if (dexieData.examResults && dexieData.examResults.length > 0) {
          patch.examResults = dexieData.examResults;
        }

        // 4. Academic Classes
        let loadedClasses = null;
        try {
          const fromDb = await DatabaseProvider.getSettings('academicClasses');
          if (Array.isArray(fromDb) && fromDb.length > 0) loadedClasses = fromDb;
        } catch (e) {}

        if (loadedClasses) {
          patch.academicClasses = loadedClasses;
          await syncClassesToDexie(loadedClasses);
        } else if (dexieData.academicClasses && dexieData.academicClasses.length > 0) {
          patch.academicClasses = dexieData.academicClasses;
          await DatabaseProvider.saveSettings('academicClasses', dexieData.academicClasses).catch(() => {});
        } else {
          const classesToSeed = (currentStore.academicClasses && currentStore.academicClasses.length > 0)
            ? currentStore.academicClasses
            : defaultClasses;
          await syncClassesToDexie(classesToSeed);
          await DatabaseProvider.saveSettings('academicClasses', classesToSeed).catch(() => {});
          patch.academicClasses = classesToSeed;
        }

        // 5. Academic Groups
        let loadedGroups = null;
        try {
          const fromDb = await DatabaseProvider.getSettings('academicGroups');
          if (Array.isArray(fromDb) && fromDb.length > 0) loadedGroups = fromDb;
        } catch (e) {}

        if (loadedGroups) {
          patch.academicGroups = loadedGroups;
          await syncGroupsToDexie(loadedGroups);
        } else if (dexieData.academicGroups && dexieData.academicGroups.length > 0) {
          patch.academicGroups = dexieData.academicGroups;
          await DatabaseProvider.saveSettings('academicGroups', dexieData.academicGroups).catch(() => {});
        } else {
          const groupsToSeed = (currentStore.academicGroups && currentStore.academicGroups.length > 0)
            ? currentStore.academicGroups
            : defaultGroups;
          await syncGroupsToDexie(groupsToSeed);
          await DatabaseProvider.saveSettings('academicGroups', groupsToSeed).catch(() => {});
          patch.academicGroups = groupsToSeed;
        }

        // 6. Academic Sections
        let loadedSections = null;
        try {
          const fromDb = await DatabaseProvider.getSettings('academicSections');
          if (Array.isArray(fromDb) && fromDb.length > 0) loadedSections = fromDb;
        } catch (e) {}

        if (loadedSections) {
          patch.academicSections = loadedSections;
          await syncSectionsToDexie(loadedSections);
        } else if (dexieData.academicSections && dexieData.academicSections.length > 0) {
          patch.academicSections = dexieData.academicSections;
          await DatabaseProvider.saveSettings('academicSections', dexieData.academicSections).catch(() => {});
        } else {
          const sectionsToSeed = (currentStore.academicSections && currentStore.academicSections.length > 0)
            ? currentStore.academicSections
            : defaultSections;
          await syncSectionsToDexie(sectionsToSeed);
          await DatabaseProvider.saveSettings('academicSections', sectionsToSeed).catch(() => {});
          patch.academicSections = sectionsToSeed;
        }

        // 7. Academic Sessions
        let loadedSessions = null;
        try {
          const fromDb = await DatabaseProvider.getSettings('academicSessions');
          if (Array.isArray(fromDb) && fromDb.length > 0) loadedSessions = fromDb;
        } catch (e) {}

        if (loadedSessions) {
          patch.academicSessions = loadedSessions;
          await syncSessionsToDexie(loadedSessions);
        } else if (dexieData.academicSessions && dexieData.academicSessions.length > 0) {
          patch.academicSessions = dexieData.academicSessions;
          await DatabaseProvider.saveSettings('academicSessions', dexieData.academicSessions).catch(() => {});
        } else {
          const sessionsToSeed = (currentStore.academicSessions && currentStore.academicSessions.length > 0)
            ? currentStore.academicSessions
            : defaultSessions;
          await syncSessionsToDexie(sessionsToSeed);
          await DatabaseProvider.saveSettings('academicSessions', sessionsToSeed).catch(() => {});
          patch.academicSessions = sessionsToSeed;
        }

        // 8. Admission Years
        let loadedYears = null;
        try {
          const fromDb = await DatabaseProvider.getSettings('admissionYears');
          if (Array.isArray(fromDb) && fromDb.length > 0) loadedYears = fromDb;
        } catch (e) {}

        if (loadedYears) {
          patch.admissionYears = loadedYears;
          await syncAdmissionYearsToDexie(loadedYears);
        } else if (dexieData.admissionYears && dexieData.admissionYears.length > 0) {
          patch.admissionYears = dexieData.admissionYears;
          await DatabaseProvider.saveSettings('admissionYears', dexieData.admissionYears).catch(() => {});
        } else {
          const yearsToSeed = (currentStore.admissionYears && currentStore.admissionYears.length > 0)
            ? currentStore.admissionYears
            : defaultAdmissionYears;
          await syncAdmissionYearsToDexie(yearsToSeed);
          await DatabaseProvider.saveSettings('admissionYears', yearsToSeed).catch(() => {});
          patch.admissionYears = yearsToSeed;
        }

        // 9. Other relational modules
        if (dexieData.issuedTestimonials && dexieData.issuedTestimonials.length > 0) patch.issuedTestimonials = dexieData.issuedTestimonials;
        if (dexieData.curriculums && dexieData.curriculums.length > 0) patch.curriculums = dexieData.curriculums;
        if (dexieData.curriculumMappings && dexieData.curriculumMappings.length > 0) patch.curriculumMappings = dexieData.curriculumMappings;
        if (dexieData.masterSubjects && dexieData.masterSubjects.length > 0) patch.masterSubjects = dexieData.masterSubjects;
        if (dexieData.examRoutines && dexieData.examRoutines.length > 0) patch.examRoutines = dexieData.examRoutines;
        if (dexieData.classTeacherAssignments && dexieData.classTeacherAssignments.length > 0) patch.classTeacherAssignments = dexieData.classTeacherAssignments;
        if (dexieData.subjectTeacherAssignments && dexieData.subjectTeacherAssignments.length > 0) patch.subjectTeacherAssignments = dexieData.subjectTeacherAssignments;
        if (dexieData.payrollMonthlySheets && dexieData.payrollMonthlySheets.length > 0) patch.payrollMonthlySheets = dexieData.payrollMonthlySheets;
        if (dexieData.financialTransactions && dexieData.financialTransactions.length > 0) patch.financialTransactions = dexieData.financialTransactions;
        if (dexieData.followupCampaigns && dexieData.followupCampaigns.length > 0) patch.followupCampaigns = dexieData.followupCampaigns;
        if (dexieData.followupTeams && dexieData.followupTeams.length > 0) patch.followupTeams = dexieData.followupTeams;
        if (dexieData.followupAssignments && dexieData.followupAssignments.length > 0) patch.followupAssignments = dexieData.followupAssignments;
        if (dexieData.followupVisits && dexieData.followupVisits.length > 0) patch.followupVisits = dexieData.followupVisits;

        // 10. Scholarships & Settings
        try {
          const fromDbSchol = await DatabaseProvider.getSettings('scholarships');
          if (Array.isArray(fromDbSchol) && fromDbSchol.length > 0) {
            patch.scholarships = fromDbSchol;
          }
          const fromDbScholSettings = await DatabaseProvider.getSettings('scholarshipSettings');
          if (fromDbScholSettings && typeof fromDbScholSettings === 'object') {
            patch.scholarshipSettings = fromDbScholSettings;
          }
        } catch (e) {}

        if (Object.keys(patch).length > 0) {
          useAppStore.setState(patch);
        }

        const isInstitutionConfigured = !!(
          patch.institution?.name?.trim() || 
          useAppStore.getState().institution?.name?.trim()
        );

        if (isInstitutionConfigured) {
          try {
            localStorage.setItem('isOnboarded', 'true');
          } catch (e) {}
          useAuthStore.setState({ isOnboarded: true });
        } else {
          useAuthStore.setState({ isOnboarded: checkIsOnboarded() });
        }
      } catch (err) {
        console.warn('[Startup] Cache pre-hydration note:', err);
      }

      this.setStage('ready');
      console.log('[Startup] Sequence complete. Application Ready.');
      useAuthStore.getState().setHasHydrated(true);
    } catch (e) {
      console.error('[Startup] Sequence failed:', e);
      this.setStage('error');
      useAuthStore.setState({ isOnboarded: checkIsOnboarded() });
      useAuthStore.getState().setHasHydrated(true);
    }
  }

  private setStage(stage: StartupStage) {
    this.stage = stage;
    console.log(`[Startup] Stage: ${stage.toUpperCase()}`);
  }
}

export const startupOrchestrator = new Orchestrator();
