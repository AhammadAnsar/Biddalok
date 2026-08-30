import React from 'react';
import { SubModuleGrid } from '../components/SubModuleGrid';
import { hrModules } from '../data/erpData';

const HumanResources = () => {
  return (
    <SubModuleGrid
      titleEn="Human Resources"
      titleBn="মানবসম্পদ"
      descriptionEn="Manage employees, payroll, attendance, and recruitment."
      descriptionBn="কর্মচারী, বেতন, উপস্থিতি এবং নিয়োগ পরিচালনা করুন।"
      modules={hrModules}
    />
  );
};

export default HumanResources;
