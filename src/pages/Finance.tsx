import React from 'react';
import { SubModuleGrid } from '../components/SubModuleGrid';
import { financeModules } from '../data/erpData';

const Finance = () => {
  return (
    <SubModuleGrid
      titleEn="Finance & Accounts"
      titleBn="অর্থ ও হিসাব"
      descriptionEn="Manage fees, income, expenses, and financial reports."
      descriptionBn="ফি, আয়, ব্যয় এবং আর্থিক প্রতিবেদন পরিচালনা করুন।"
      modules={financeModules}
    />
  );
};

export default Finance;
