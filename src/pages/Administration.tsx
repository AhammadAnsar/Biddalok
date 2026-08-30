import React from 'react';
import { SubModuleGrid } from '../components/SubModuleGrid';
import { adminModules } from '../data/erpData';

const Administration = () => {
  return (
    <SubModuleGrid
      titleEn="Administration"
      titleBn="প্রশাসন"
      descriptionEn="Manage committees, notices, meetings, and official documents."
      descriptionBn="কমিটি, নোটিশ, মিটিং এবং দাপ্তরিক নথিপত্র পরিচালনা করুন।"
      modules={adminModules}
    />
  );
};

export default Administration;
