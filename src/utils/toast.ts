import toast from 'react-hot-toast';

const enhancedToast = Object.assign(toast, {
  info: (message: any, opts?: any) => toast(message, { icon: 'ℹ️', ...opts })
});

export { enhancedToast as toast };

/**
 * Standard Toast Notification System for Bidyalok
 * Provides uniform feedback for critical actions across all modules.
 */

export const notifySuccess = (message: string, duration = 3000) => {
  return toast.success(message, { duration });
};

export const notifyError = (message: string, duration = 4000) => {
  return toast.error(message, { duration });
};

export const notifyInfo = (message: string, duration = 3000) => {
  return toast(message, {
    icon: 'ℹ️',
    duration,
  });
};

/**
 * Module-specific notification helpers
 */

// HR / Teachers
export const notifyTeacherAdded = (name?: string) => {
  const msg = name 
    ? `শিক্ষক/কর্মচারী "${name}" সফলভাবে যুক্ত করা হয়েছে` 
    : 'শিক্ষক/কর্মচারী সফলভাবে যুক্ত করা হয়েছে (Teacher Added)';
  return toast.success(msg);
};

export const notifyTeacherUpdated = (name?: string) => {
  const msg = name 
    ? `শিক্ষক/কর্মচারী "${name}"-এর তথ্য সফলভাবে হালনাগাদ করা হয়েছে` 
    : 'শিক্ষক/কর্মচারীর তথ্য সফলভাবে হালনাগাদ করা হয়েছে (Teacher Updated)';
  return toast.success(msg);
};

export const notifyTeacherDeleted = (name?: string) => {
  const msg = name 
    ? `"${name}"-এর তথ্য সফলভাবে মুছে ফেলা হয়েছে` 
    : 'শিক্ষক/কর্মচারীর তথ্য সফলভাবে মুছে ফেলা হয়েছে';
  return toast.success(msg);
};

// ID Cards
export const notifyIdCardGenerated = (details?: string | number) => {
  let msg = 'আইডি কার্ড সফলভাবে তৈরি হয়েছে (ID Card Generated)';
  if (typeof details === 'number') {
    msg = `${details} টি আইডি কার্ড সফলভাবে তৈরি হয়েছে (ID Cards Generated)`;
  } else if (typeof details === 'string' && details) {
    msg = `${details} - আইডি কার্ড তৈরি হয়েছে`;
  }
  return toast.success(msg);
};

// Data & System Sync
export const notifyDataSynced = (details?: string) => {
  const msg = details 
    ? `ডাটা সফলভাবে সিঙ্ক হয়েছে: ${details} (Data Synced)` 
    : 'ডাটাবেজ সফলভাবে সিঙ্ক ও সংরক্ষিত হয়েছে (Data Synced)';
  return toast.success(msg);
};

export const notifyBackupSaved = () => {
  return toast.success('ডাটাবেজ ব্যাকআপ সফলভাবে সংরক্ষিত হয়েছে (Backup Created)');
};

export const notifyBackupRestored = () => {
  return toast.success('ডাটাবেজ ব্যাকআপ সফলভাবে রিস্টোর ও সিঙ্ক হয়েছে (Data Restored)');
};

// Student Actions
export const notifyStudentAdded = (name?: string) => {
  const msg = name 
    ? `শিক্ষার্থী "${name}" সফলভাবে ভর্তি ও নিবন্ধিত হয়েছে` 
    : 'শিক্ষার্থী সফলভাবে ভর্তি করা হয়েছে (Student Enrolled)';
  return toast.success(msg);
};

export const notifyStudentUpdated = (name?: string) => {
  const msg = name 
    ? `শিক্ষার্থী "${name}"-এর তথ্য আপডেট হয়েছে` 
    : 'শিক্ষার্থীর তথ্য সফলভাবে সংরক্ষিত হয়েছে';
  return toast.success(msg);
};
