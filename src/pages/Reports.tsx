import React from 'react';
import { SubModuleGrid } from '../components/SubModuleGrid';
import { reportModules } from '../data/erpData';

const Reports = () => {
  return (
    <SubModuleGrid
      titleEn="Reports & Analytics"
      titleBn="রিপোর্ট ও অ্যানালিটিক্স"
      descriptionEn="View comprehensive reports, statistics, and KPI dashboards."
      descriptionBn="বিস্তৃত প্রতিবেদন, পরিসংখ্যান এবং কেপিআই ড্যাশবোর্ড দেখুন।"
      modules={reportModules}
    />
  );
};

export default Reports;
