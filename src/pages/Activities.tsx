import React from 'react';
import { SubModuleGrid } from '../components/SubModuleGrid';
import { getModulesByCategory } from '../data/capabilityRegistry';

const Activities = () => {
  return (
    <SubModuleGrid
      titleEn="Student Activities"
      titleBn="শিক্ষার্থী কার্যক্রম"
      descriptionEn="Manage clubs, sports, events, and co-curricular activities."
      descriptionBn="ক্লাব, খেলাধুলা, ইভেন্ট এবং সহপাঠ্যক্রমিক কার্যক্রম পরিচালনা করুন।"
      modules={getModulesByCategory('activities')}
    />
  );
};

export default Activities;
