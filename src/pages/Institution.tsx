import React from 'react';
import { SubModuleGrid } from '../components/SubModuleGrid';
import { institutionModules } from '../data/erpData';

const Institution = () => {
  return (
    <SubModuleGrid
      titleEn="Institution & Resources"
      titleBn="প্রতিষ্ঠান ও সম্পদ"
      descriptionEn="Manage campus, inventory, library, and other institutional resources."
      descriptionBn="ক্যাম্পাস, ইনভেন্টরি, লাইব্রেরি এবং অন্যান্য প্রাতিষ্ঠানিক সম্পদ পরিচালনা করুন।"
      modules={institutionModules}
    />
  );
};

export default Institution;
