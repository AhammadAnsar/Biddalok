const fs = require('fs');
let code = fs.readFileSync('src/components/AddStudentHubModal.tsx', 'utf8');

const replacement = `  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const newStudents: Student[] = data.map((row: any, index) => {
        const cls = String(row['Class'] || '');
        const generatedId = generateStudentId(cls, students);
        const fallbackId = \`\${generatedId.slice(0,4)}\${(parseInt(generatedId.slice(4)) + index).toString().padStart(3, '0')}\`;
        
        return {
          id: Date.now().toString() + index,
          studentId: String(row['Student ID'] || fallbackId),
          formNo: String(row['Form No'] || ''),
          applicationDate: String(row['Application Date'] || new Date().toISOString().split('T')[0]),
          session: String(row['Session'] || ''),
          class: String(row['Class'] || ''),
          roll: String(row['Roll'] || ''),
          name: String(row['Name (English)'] || row['Name'] || ''),
          nameBn: String(row['Name (Bangla)'] || ''),
          birthRegistrationNo: String(row['Birth Registration No'] || ''),
          dateOfBirth: String(row['Date of Birth'] || row['DOB'] || ''),
          gender: (row['Gender'] === 'Female' ? 'Female' : row['Gender'] === 'Other' ? 'Other' : 'Male') as any,
          religion: String(row['Religion'] || ''),
          nationality: String(row['Nationality'] || 'বাংলাদেশি'),
          bloodGroup: String(row['Blood Group'] || 'পরীক্ষা করা হয় নাই'),
          village: String(row['Permanent Village'] || ''),
          postOffice: String(row['Permanent Post Office'] || ''),
          upazila: String(row['Permanent Upazila'] || ''),
          district: String(row['Permanent District'] || ''),
          isAddressSame: false,
          presentVillage: String(row['Present Village'] || ''),
          presentPostOffice: String(row['Present Post Office'] || ''),
          presentUpazila: String(row['Present Upazila'] || ''),
          presentDistrict: String(row['Present District'] || ''),
          fatherName: String(row['Father Name (English)'] || row["Father's Name (English)"] || ''),
          fatherNameBn: String(row['Father Name (Bangla)'] || row["Father's Name (Bangla)"] || ''),
          fatherNid: String(row['Father NID'] || ''),
          fatherMobile: String(row['Father Mobile'] || ''),
          fatherProfession: String(row['Father Profession'] || ''),
          motherName: String(row['Mother Name (English)'] || row["Mother's Name (English)"] || ''),
          motherNameBn: String(row['Mother Name (Bangla)'] || row["Mother's Name (Bangla)"] || ''),
          motherNid: String(row['Mother NID'] || ''),
          motherMobile: String(row['Mother Mobile'] || ''),
          motherProfession: String(row['Mother Profession'] || ''),
          parentsStatus: String(row['Parents Status'] || 'দুজনেই জীবিত'),
          prevSchoolName: String(row['Previous School'] || ''),
          prevClass: String(row['Previous Class'] || ''),
          admissionPayment: String(row['Admission Payment'] || ''),
          paymentMethod: String(row['Payment Method'] || 'নগদ / ক্যাশ'),
          transactionNo: String(row['Transaction No'] || ''),
          passingYear: String(row['Passing Year'] || ''),
          gpa: String(row['GPA'] || ''),
          registrationNo: String(row['Registration No'] || ''),
          board: String(row['Board'] || ''),
          group: String(row['Group'] || ''),
          photo: ''
        } as Student;
      });
      setExcelData(newStudents);
    } catch (error: any) {
      console.error(error);
      alert(language === 'bn' ? 'ফাইল পড়তে সমস্যা হয়েছে: ' + (error?.message || '') : 'Error reading file: ' + (error?.message || ''));
    } finally {
      setIsImporting(false);
      if (e.target) e.target.value = '';
    }
  };`;

const startIndex = code.indexOf('const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {');
const endIndex = code.indexOf('const handleCellChange = (index: number, field: keyof Student, value: string) => {');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + replacement + '\n\n  ' + code.substring(endIndex);
  fs.writeFileSync('src/components/AddStudentHubModal.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Could not find start or end index");
}
