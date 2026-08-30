import React from 'react';
import { SubModuleGrid } from '../components/SubModuleGrid';
import { websiteModules } from '../data/erpData';

const Website = () => {
  return (
    <SubModuleGrid
      titleEn="Website & Communication"
      titleBn="ওয়েবসাইট ও যোগাযোগ"
      descriptionEn="Manage public website content, notices, and communications."
      descriptionBn="পাবলিক ওয়েবসাইটের কন্টেন্ট, নোটিশ এবং যোগাযোগ পরিচালনা করুন।"
      modules={websiteModules}
    />
  );
};

export default Website;
