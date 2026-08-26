const fs = require('fs');
let content = fs.readFileSync('src/components/CertificateTemplate.tsx', 'utf8');

content = content.replace(
  "const boardRoll = ('boardRollNo' in s) ? s.boardRollNo : boardRoll;",
  "const boardRoll = ('boardRollNo' in s) ? s.boardRollNo : s.roll;"
);

fs.writeFileSync('src/components/CertificateTemplate.tsx', content);
