import React from 'react';
import { SubModuleGrid } from '../components/SubModuleGrid';
import { studentModules } from '../data/erpData';

const StudentsHome = () => {
  return (
    <SubModuleGrid
      titleEn="Student Management"
      titleBn="শিক্ষার্থী ব্যবস্থাপনা"
      descriptionEn="Manage student admission, profiles, attendance, and alumni."
      descriptionBn="শিক্ষার্থীদের ভর্তি, প্রোফাইল, উপস্থিতি এবং অ্যালামনাই পরিচালনা করুন।"
      modules={studentModules}
    />
  );
};

export default StudentsHome;
