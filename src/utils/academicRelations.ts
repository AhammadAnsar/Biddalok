import { 
  Student, 
  AcademicClass, 
  AcademicSection, 
  AcademicGroup, 
  AcademicSession, 
  SubjectItem, 
  ExamResult, 
  ExamRoutineItem,
  MasterLookupItem 
} from '../types';

import {
  defaultMasterGenders,
  defaultMasterReligions,
  defaultMasterBloodGroups,
  defaultMasterNationalities,
  defaultMasterMaritalStatuses,
  defaultMasterDisabilities,
  defaultMasterProfessions,
  defaultMasterRelations,
  defaultMasterBoards,
  defaultMasterFacilities,
  defaultMasterInstitutions
} from '../constants/masterLookups';

/**
 * Normalizes text for resilient comparison (trims, lowers, removes extra spacing)
 */
export function normalizeText(text?: string | null): string {
  if (!text) return '';
  return text.trim().toLowerCase();
}

/**
 * Generic finder for any Master Lookup item by ID, English name, code, or Bengali name
 */
export function findMasterLookup(
  identifier: string | undefined | null,
  list: MasterLookupItem[] = []
): MasterLookupItem | undefined {
  if (!identifier) return undefined;
  const idStr = String(identifier).trim();
  const lower = idStr.toLowerCase();

  return (
    list.find(item => item.id === idStr) ||
    list.find(item => item.name.toLowerCase() === lower) ||
    list.find(item => item.nameBn && item.nameBn.trim().toLowerCase() === lower) ||
    list.find(item => item.code && item.code.toLowerCase() === lower) ||
    list.find(item => item.name.toLowerCase().includes(lower) || (item.nameBn && item.nameBn.includes(idStr)))
  );
}

/**
 * Helper to resolve bilingual text for any master item or ID
 */
export function getBilingualLookupText(
  identifier: string | MasterLookupItem | undefined | null,
  list: MasterLookupItem[] = [],
  isBn: boolean = true
): string {
  if (!identifier) return '';
  if (typeof identifier === 'object' && identifier.name) {
    return isBn ? (identifier.nameBn || identifier.name) : identifier.name;
  }
  const item = findMasterLookup(identifier as string, list);
  if (!item) return String(identifier);
  return isBn ? (item.nameBn || item.name) : item.name;
}

/**
 * Finds matching AcademicClass by ID or name / nameBn
 */
export function findClass(
  identifier: string | undefined | null,
  classes: AcademicClass[] = []
): AcademicClass | undefined {
  if (!identifier) return undefined;
  const idStr = String(identifier).trim();
  const lower = idStr.toLowerCase();

  return (
    classes.find(c => c.id === idStr) ||
    classes.find(c => c.name.toLowerCase() === lower) ||
    classes.find(c => c.nameBn && c.nameBn.trim().toLowerCase() === lower) ||
    classes.find(c => c.name.toLowerCase().includes(lower) || (c.nameBn && c.nameBn.includes(idStr)))
  );
}

/**
 * Finds matching AcademicSection by ID or name / nameBn
 */
export function findSection(
  identifier: string | undefined | null,
  sections: AcademicSection[] = []
): AcademicSection | undefined {
  if (!identifier) return undefined;
  const idStr = String(identifier).trim();
  const lower = idStr.toLowerCase();

  return (
    sections.find(s => s.id === idStr) ||
    sections.find(s => s.name.toLowerCase() === lower) ||
    sections.find(s => s.nameBn && s.nameBn.trim().toLowerCase() === lower)
  );
}

/**
 * Finds matching AcademicGroup by ID or name / nameBn
 */
export function findGroup(
  identifier: string | undefined | null,
  groups: AcademicGroup[] = []
): AcademicGroup | undefined {
  if (!identifier) return undefined;
  const idStr = String(identifier).trim();
  const lower = idStr.toLowerCase();

  return (
    groups.find(g => g.id === idStr) ||
    groups.find(g => g.name.toLowerCase() === lower) ||
    groups.find(g => g.nameBn && g.nameBn.trim().toLowerCase() === lower)
  );
}

/**
 * Finds matching AcademicSession by ID or name / nameBn
 */
export function findSession(
  identifier: string | undefined | null,
  sessions: AcademicSession[] = []
): AcademicSession | undefined {
  if (!identifier) return undefined;
  const idStr = String(identifier).trim();
  const lower = idStr.toLowerCase();

  return (
    sessions.find(s => s.id === idStr) ||
    sessions.find(s => s.name.toLowerCase() === lower) ||
    sessions.find(s => s.nameBn && s.nameBn.trim().toLowerCase() === lower)
  );
}

/**
 * Checks if student/item matches the given class filter (which could be 'all', a class ID, or class name)
 */
export function isClassMatch(
  item: { classId?: string; class?: string; className?: string },
  targetClassOrId: string | undefined | null,
  classes: AcademicClass[] = []
): boolean {
  if (!targetClassOrId || targetClassOrId === 'all') return true;

  const targetClassObj = findClass(targetClassOrId, classes);
  const targetId = targetClassObj?.id || targetClassOrId;
  const targetName = targetClassObj?.name || targetClassOrId;
  const targetNameBn = targetClassObj?.nameBn || '';

  const itemClassName = item.class || item.className || '';

  if (item.classId && item.classId === targetId) return true;
  if (itemClassName === targetName) return true;
  if (targetNameBn && itemClassName === targetNameBn) return true;

  // If item only has class name, see if resolving item's class matches targetClassObj's id
  if (itemClassName) {
    const itemClassObj = findClass(itemClassName, classes);
    if (itemClassObj && itemClassObj.id === targetId) return true;
  }

  return false;
}

/**
 * Checks if student/item matches the given section filter
 */
export function isSectionMatch(
  item: { sectionId?: string; section?: string },
  targetSectionOrId: string | undefined | null,
  sections: AcademicSection[] = []
): boolean {
  if (!targetSectionOrId || targetSectionOrId === 'all') return true;

  const targetSecObj = findSection(targetSectionOrId, sections);
  const targetId = targetSecObj?.id || targetSectionOrId;
  const targetName = targetSecObj?.name || targetSectionOrId;
  const targetNameBn = targetSecObj?.nameBn || '';

  const itemSecName = item.section || '';

  if (item.sectionId && item.sectionId === targetId) return true;
  if (itemSecName === targetName) return true;
  if (targetNameBn && itemSecName === targetNameBn) return true;

  if (itemSecName) {
    const itemSecObj = findSection(itemSecName, sections);
    if (itemSecObj && itemSecObj.id === targetId) return true;
  }

  return false;
}

/**
 * Checks if student/item matches the given group filter
 */
export function isGroupMatch(
  item: { groupId?: string; group?: string; groupName?: string },
  targetGroupOrId: string | undefined | null,
  groups: AcademicGroup[] = []
): boolean {
  if (!targetGroupOrId || targetGroupOrId === 'all') return true;

  const targetGrpObj = findGroup(targetGroupOrId, groups);
  const targetId = targetGrpObj?.id || targetGroupOrId;
  const targetName = targetGrpObj?.name || targetGroupOrId;
  const targetNameBn = targetGrpObj?.nameBn || '';

  const itemGrpName = item.group || item.groupName || '';

  if (item.groupId && item.groupId === targetId) return true;
  if (itemGrpName === targetName) return true;
  if (targetNameBn && itemGrpName === targetNameBn) return true;

  if (itemGrpName) {
    const itemGrpObj = findGroup(itemGrpName, groups);
    if (itemGrpObj && itemGrpObj.id === targetId) return true;
  }

  return false;
}

/**
 * Checks if student/item matches the given session filter
 */
export function isSessionMatch(
  item: { sessionId?: string; session?: string },
  targetSessionOrId: string | undefined | null,
  sessions: AcademicSession[] = []
): boolean {
  if (!targetSessionOrId || targetSessionOrId === 'all') return true;

  const targetSessObj = findSession(targetSessionOrId, sessions);
  const targetId = targetSessObj?.id || targetSessionOrId;
  const targetName = targetSessObj?.name || targetSessionOrId;
  const targetNameBn = targetSessObj?.nameBn || '';

  const itemSessName = item.session || '';

  if (item.sessionId && item.sessionId === targetId) return true;
  if (itemSessName === targetName) return true;
  if (targetNameBn && itemSessName === targetNameBn) return true;

  if (itemSessName) {
    const itemSessObj = findSession(itemSessName, sessions);
    if (itemSessObj && itemSessObj.id === targetId) return true;
  }

  return false;
}

/**
 * Auto-links a Student record with master entity IDs (academic, demographic, address, guardian, and facility).
 * Preserves existing text fields while attaching the primary keys.
 */
export function linkStudentIds(
  student: Student,
  master: {
    classes?: AcademicClass[];
    sections?: AcademicSection[];
    groups?: AcademicGroup[];
    sessions?: AcademicSession[];
    genders?: MasterLookupItem[];
    religions?: MasterLookupItem[];
    bloodGroups?: MasterLookupItem[];
    nationalities?: MasterLookupItem[];
    maritalStatuses?: MasterLookupItem[];
    disabilities?: MasterLookupItem[];
    professions?: MasterLookupItem[];
    relations?: MasterLookupItem[];
    boards?: MasterLookupItem[];
    facilities?: MasterLookupItem[];
    institutions?: MasterLookupItem[];
  }
): Student {
  const classes = master.classes || [];
  const sections = master.sections || [];
  const groups = master.groups || [];
  const sessions = master.sessions || [];
  const genders = master.genders || defaultMasterGenders;
  const religions = master.religions || defaultMasterReligions;
  const bloodGroups = master.bloodGroups || defaultMasterBloodGroups;
  const nationalities = master.nationalities || defaultMasterNationalities;
  const maritalStatuses = master.maritalStatuses || defaultMasterMaritalStatuses;
  const disabilities = master.disabilities || defaultMasterDisabilities;
  const professions = master.professions || defaultMasterProfessions;
  const relations = master.relations || defaultMasterRelations;
  const boards = master.boards || defaultMasterBoards;
  const facilities = master.facilities || defaultMasterFacilities;
  const institutions = master.institutions || defaultMasterInstitutions;

  // Academic IDs - match by current field name first, then by ID
  let matchedClass = student.class ? findClass(student.class, classes) : undefined;
  if (!matchedClass && student.classId) {
    matchedClass = findClass(student.classId, classes);
  }
  const classId = matchedClass ? matchedClass.id : student.classId;
  const className = matchedClass ? matchedClass.name : student.class;

  let matchedSection = student.section ? findSection(student.section, sections) : undefined;
  if (!matchedSection && student.sectionId) {
    matchedSection = findSection(student.sectionId, sections);
  }
  const sectionId = matchedSection ? matchedSection.id : student.sectionId;
  const sectionName = matchedSection ? matchedSection.name : student.section;

  let matchedGroup = student.group ? findGroup(student.group, groups) : undefined;
  if (!matchedGroup && student.groupId) {
    matchedGroup = findGroup(student.groupId, groups);
  }
  const groupId = matchedGroup ? matchedGroup.id : student.groupId;
  const groupName = matchedGroup ? matchedGroup.name : student.group;

  let matchedSession = student.session ? findSession(student.session, sessions) : undefined;
  if (!matchedSession && student.sessionId) {
    matchedSession = findSession(student.sessionId, sessions);
  }
  const sessionId = matchedSession ? matchedSession.id : student.sessionId;
  const sessionName = matchedSession ? matchedSession.name : student.session;

  // Demographics Lookups
  let matchedGen = student.gender ? findMasterLookup(student.gender, genders) : undefined;
  if (!matchedGen && student.genderId) {
    matchedGen = findMasterLookup(student.genderId, genders);
  }
  const genderId = matchedGen ? matchedGen.id : student.genderId;
  const gender = matchedGen 
    ? (matchedGen.name === 'Female' ? 'Female' : matchedGen.name === 'Other' ? 'Other' : 'Male')
    : student.gender;

  let matchedRel = student.religion ? findMasterLookup(student.religion, religions) : undefined;
  if (!matchedRel && student.religionId) {
    matchedRel = findMasterLookup(student.religionId, religions);
  }
  const religionId = matchedRel ? matchedRel.id : student.religionId;
  const religion = matchedRel ? matchedRel.name : student.religion;

  let matchedBg = student.bloodGroup ? findMasterLookup(student.bloodGroup, bloodGroups) : undefined;
  if (!matchedBg && student.bloodGroupId) {
    matchedBg = findMasterLookup(student.bloodGroupId, bloodGroups);
  }
  const bloodGroupId = matchedBg ? matchedBg.id : student.bloodGroupId;
  const bloodGroup = matchedBg ? matchedBg.name : student.bloodGroup;

  let matchedNat = student.nationality ? findMasterLookup(student.nationality, nationalities) : undefined;
  if (!matchedNat && student.nationalityId) {
    matchedNat = findMasterLookup(student.nationalityId, nationalities);
  }
  const nationalityId = matchedNat ? matchedNat.id : student.nationalityId;
  const nationality = matchedNat ? matchedNat.name : student.nationality;

  let matchedMs = student.maritalStatus ? findMasterLookup(student.maritalStatus, maritalStatuses) : undefined;
  if (!matchedMs && student.maritalStatusId) {
    matchedMs = findMasterLookup(student.maritalStatusId, maritalStatuses);
  }
  const maritalStatusId = matchedMs ? matchedMs.id : student.maritalStatusId;
  const maritalStatus = matchedMs ? matchedMs.name : student.maritalStatus;

  let matchedDis = student.disability ? findMasterLookup(student.disability, disabilities) : undefined;
  if (!matchedDis && student.disabilityId) {
    matchedDis = findMasterLookup(student.disabilityId, disabilities);
  }
  const disabilityId = matchedDis ? matchedDis.id : student.disabilityId;
  const disability = matchedDis ? matchedDis.name : student.disability;

  // Professions & Relations
  let matchedFatherProf = student.fatherProfession ? findMasterLookup(student.fatherProfession, professions) : undefined;
  if (!matchedFatherProf && student.fatherProfessionId) {
    matchedFatherProf = findMasterLookup(student.fatherProfessionId, professions);
  }
  const fatherProfessionId = matchedFatherProf ? matchedFatherProf.id : student.fatherProfessionId;
  const fatherProfession = matchedFatherProf ? matchedFatherProf.name : student.fatherProfession;

  let matchedMotherProf = student.motherProfession ? findMasterLookup(student.motherProfession, professions) : undefined;
  if (!matchedMotherProf && student.motherProfessionId) {
    matchedMotherProf = findMasterLookup(student.motherProfessionId, professions);
  }
  const motherProfessionId = matchedMotherProf ? matchedMotherProf.id : student.motherProfessionId;
  const motherProfession = matchedMotherProf ? matchedMotherProf.name : student.motherProfession;

  let matchedGuardProf = student.guardianProfession ? findMasterLookup(student.guardianProfession, professions) : undefined;
  if (!matchedGuardProf && student.guardianProfessionId) {
    matchedGuardProf = findMasterLookup(student.guardianProfessionId, professions);
  }
  const guardianProfessionId = matchedGuardProf ? matchedGuardProf.id : student.guardianProfessionId;
  const guardianProfession = matchedGuardProf ? matchedGuardProf.name : student.guardianProfession;

  let matchedReln = student.guardianRelation ? findMasterLookup(student.guardianRelation, relations) : undefined;
  if (!matchedReln && student.guardianRelationId) {
    matchedReln = findMasterLookup(student.guardianRelationId, relations);
  }
  const guardianRelationId = matchedReln ? matchedReln.id : student.guardianRelationId;
  const guardianRelation = matchedReln ? matchedReln.name : student.guardianRelation;

  // Boards & Facilities
  const rawBoard = student.board || student.prevBoard || '';
  let matchedBoard = rawBoard ? findMasterLookup(rawBoard, boards) : undefined;
  if (!matchedBoard && (student.prevBoardId || student.boardId)) {
    matchedBoard = findMasterLookup(student.prevBoardId || student.boardId || '', boards);
  }
  const prevBoardId = matchedBoard ? matchedBoard.id : (student.prevBoardId || student.boardId);
  const boardName = student.board || student.prevBoard || (matchedBoard ? matchedBoard.name : '');

  let matchedFac = student.specialFacility ? findMasterLookup(student.specialFacility, facilities) : undefined;
  if (!matchedFac && student.specialFacilityId) {
    matchedFac = findMasterLookup(student.specialFacilityId, facilities);
  }
  const specialFacilityId = matchedFac ? matchedFac.id : student.specialFacilityId;
  const specialFacility = student.specialFacility || (matchedFac ? matchedFac.name : '');

  // Previous Institution
  let matchedInst = student.prevSchoolId ? findMasterLookup(student.prevSchoolId, institutions) : undefined;
  if (!matchedInst && student.prevSchoolName) {
    matchedInst = findMasterLookup(student.prevSchoolName, institutions);
  }
  const prevSchoolId = matchedInst ? matchedInst.id : student.prevSchoolId;
  const prevSchoolName = student.prevSchoolName || (matchedInst ? (matchedInst.nameBn || matchedInst.name) : '');

  const yearVal = student.year || student.admissionYear || '';
  const passingYearVal = student.passingYear || student.prevPassingYear || '';
  const registrationNoVal = student.registrationNo || student.prevRegistrationNo || '';

  return {
    ...student,
    classId,
    class: className,
    sectionId,
    section: sectionName,
    groupId,
    group: groupName,
    sessionId,
    session: sessionName,
    year: yearVal,
    admissionYear: yearVal,
    passingYear: passingYearVal,
    prevPassingYear: passingYearVal,
    registrationNo: registrationNoVal,
    prevRegistrationNo: registrationNoVal,
    genderId,
    gender: student.gender || gender,
    religionId,
    religion: student.religion || religion,
    bloodGroupId,
    bloodGroup: student.bloodGroup || bloodGroup,
    nationalityId,
    nationality: student.nationality || nationality,
    maritalStatusId,
    maritalStatus: student.maritalStatus || maritalStatus,
    disabilityId,
    disability: student.disability || disability,
    fatherProfessionId,
    fatherProfession: student.fatherProfession || fatherProfession,
    motherProfessionId,
    motherProfession: student.motherProfession || motherProfession,
    guardianProfessionId,
    guardianProfession: student.guardianProfession || guardianProfession,
    guardianRelationId,
    guardianRelation: student.guardianRelation || guardianRelation,
    board: boardName,
    prevBoard: boardName,
    prevBoardId,
    specialFacilityId,
    specialFacility,
    prevSchoolId,
    prevSchoolName
  };
}

/**
 * Auto-links a SubjectItem record with classId and groupId
 */
export function linkSubjectIds(
  subject: SubjectItem,
  master: {
    classes?: AcademicClass[];
    groups?: AcademicGroup[];
  }
): SubjectItem {
  const classes = master.classes || [];
  const groups = master.groups || [];

  let classId = subject.classId;
  let className = subject.className;
  const matchedClass = classId ? findClass(classId, classes) : findClass(subject.className, classes);
  if (matchedClass) {
    classId = matchedClass.id;
    if (!className) className = matchedClass.name;
  }

  let groupId = subject.groupId;
  let groupName = subject.groupName;
  if (subject.groupName || subject.groupId) {
    const matchedGroup = groupId ? findGroup(groupId, groups) : findGroup(subject.groupName, groups);
    if (matchedGroup) {
      groupId = matchedGroup.id;
      if (!groupName) groupName = matchedGroup.name;
    }
  }

  return {
    ...subject,
    classId,
    className,
    groupId,
    groupName,
  };
}

/**
 * Auto-links an ExamRoutineItem record with classId
 */
export function linkExamRoutineIds(
  routine: ExamRoutineItem,
  master: {
    classes?: AcademicClass[];
    subjects?: SubjectItem[];
  }
): ExamRoutineItem {
  const classes = master.classes || [];
  const subjects = master.subjects || [];

  let classId = routine.classId;
  let className = routine.className;
  const matchedClass = classId ? findClass(classId, classes) : findClass(routine.className, classes);
  if (matchedClass) {
    classId = matchedClass.id;
    if (!className) className = matchedClass.name;
  }

  let subjectId = routine.subjectId;
  if (!subjectId && routine.subjectName) {
    const matchedSubj = subjects.find(
      s => s.name.toLowerCase() === routine.subjectName.toLowerCase() || (s.nameBn && s.nameBn === routine.subjectName)
    );
    if (matchedSubj) {
      subjectId = matchedSubj.id;
    }
  }

  return {
    ...routine,
    classId,
    className,
    subjectId,
  };
}

/**
 * Auto-links an ExamResult record with classId, groupId, sessionId
 */
export function linkExamResultIds(
  result: ExamResult,
  master: {
    classes?: AcademicClass[];
    groups?: AcademicGroup[];
    sessions?: AcademicSession[];
  }
): ExamResult {
  const classes = master.classes || [];
  const groups = master.groups || [];
  const sessions = master.sessions || [];

  let classId = result.classId;
  let className = result.className;
  if (result.className || result.classId) {
    const matchedClass = classId ? findClass(classId, classes) : findClass(result.className, classes);
    if (matchedClass) {
      classId = matchedClass.id;
      if (!className) className = matchedClass.name;
    }
  }

  let groupId = result.groupId;
  let groupName = result.group;
  if (result.group || result.groupId) {
    const matchedGroup = groupId ? findGroup(groupId, groups) : findGroup(result.group, groups);
    if (matchedGroup) {
      groupId = matchedGroup.id;
      if (!groupName) groupName = matchedGroup.name;
    }
  }

  let sessionId = result.sessionId;
  let sessionName = result.session;
  if (result.session || result.sessionId) {
    const matchedSession = sessionId ? findSession(sessionId, sessions) : findSession(result.session, sessions);
    if (matchedSession) {
      sessionId = matchedSession.id;
      if (!sessionName) sessionName = matchedSession.name;
    }
  }

  return {
    ...result,
    classId,
    className,
    groupId,
    group: groupName,
    sessionId,
    session: sessionName,
  };
}
