import React from 'react';
import { SubModuleGrid } from '../components/SubModuleGrid';
import { academicModules } from '../data/erpData';

const Academic = () => {
  return (
    <SubModuleGrid
      titleEn="Academic"
      titleBn="একাডেমিক"
      descriptionEn="Manage classes, subjects, routines, and examinations."
      descriptionBn="ক্লাস, বিষয়, রুটিন এবং পরীক্ষা পরিচালনা করুন।"
      modules={academicModules}
    />
  );
};

export default Academic;
