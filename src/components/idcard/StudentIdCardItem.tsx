import React from 'react';
import { Student, Institution, StudentIdCardSettings } from '../../types';
import { Format1StudentCard } from './Format1StudentCard';

interface StudentIdCardItemProps {
  student: Student;
  institution: Institution;
  settings: StudentIdCardSettings;
  side: 'front' | 'back';
  isPrintMode?: boolean;
}

/**
 * Standard Student ID Card Item.
 * Uses Format1StudentCard (Islamic Teal & Amber Curves) with dynamic institution branding,
 * Bengali formatting, and front/back side configuration.
 */
export const StudentIdCardItem: React.FC<StudentIdCardItemProps> = ({
  student,
  institution,
  settings,
  side,
}) => {
  return (
    <Format1StudentCard
      student={student}
      institution={institution}
      settings={settings}
      side={side}
    />
  );
};
