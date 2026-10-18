import React from 'react';
import { SubModuleGrid } from '../components/SubModuleGrid';
import { getModulesByCategory } from '../data/capabilityRegistry';

const Website = () => {
  return (
    <SubModuleGrid
      titleEn="Website & Communication"
      titleBn="ওয়েবসাইট ও যোগাযোগ"
      descriptionEn="Manage public website content, notices, and communications."
      descriptionBn="পাবলিক ওয়েবসাইটের কন্টেন্ট, নোটিশ এবং যোগাযোগ পরিচালনা করুন।"
      modules={getModulesByCategory('website')}
    />
  );
};

export default Website;
