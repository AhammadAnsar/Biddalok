const fs = require('fs');
let content = fs.readFileSync('src/components/TestimonialImportModal.tsx', 'utf8');

content = content.replace(
  "studentId: row['Student ID'] || \\`IMP-\\${Date.now()}-\\${index}\\`,",
  "studentId: row['Student ID'] || `IMP-${Date.now()}-${index}`,"
);

fs.writeFileSync('src/components/TestimonialImportModal.tsx', content);
