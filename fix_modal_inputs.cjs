const fs = require('fs');
let code = fs.readFileSync('src/components/StudentEnrollmentModal.tsx', 'utf8');

// replace all LocationSelect with input tags
code = code.replace(/<LocationSelect type="village" value={formData\.village \|\| ''} onChange={\(val\) => setFormData\(p => \(\{ \.\.\.p, village: val \}\)\)} \/>/g,
  `<input type="text" value={formData.village || ''} onChange={(e) => setFormData(p => ({ ...p, village: e.target.value }))} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />`);

code = code.replace(/<LocationSelect type="postOffice" value={formData\.postOffice \|\| ''} onChange={\(val\) => setFormData\(p => \(\{ \.\.\.p, postOffice: val \}\)\)} \/>/g,
  `<input type="text" value={formData.postOffice || ''} onChange={(e) => setFormData(p => ({ ...p, postOffice: e.target.value }))} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />`);

code = code.replace(/<LocationSelect type="upazila" value={formData\.upazila \|\| ''} onChange={\(val\) => setFormData\(p => \(\{ \.\.\.p, upazila: val \}\)\)} \/>/g,
  `<input type="text" value={formData.upazila || ''} onChange={(e) => setFormData(p => ({ ...p, upazila: e.target.value }))} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />`);

code = code.replace(/<LocationSelect type="district" value={formData\.district \|\| ''} onChange={\(val\) => setFormData\(p => \(\{ \.\.\.p, district: val \}\)\)} \/>/g,
  `<input type="text" value={formData.district || ''} onChange={(e) => setFormData(p => ({ ...p, district: e.target.value }))} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />`);

code = code.replace(/<LocationSelect type="village" value={formData\.presentVillage \|\| ''} onChange={\(val\) => setFormData\(p => \(\{ \.\.\.p, presentVillage: val \}\)\)} \/>/g,
  `<input type="text" value={formData.presentVillage || ''} onChange={(e) => setFormData(p => ({ ...p, presentVillage: e.target.value }))} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />`);

code = code.replace(/<LocationSelect type="postOffice" value={formData\.presentPostOffice \|\| ''} onChange={\(val\) => setFormData\(p => \(\{ \.\.\.p, presentPostOffice: val \}\)\)} \/>/g,
  `<input type="text" value={formData.presentPostOffice || ''} onChange={(e) => setFormData(p => ({ ...p, presentPostOffice: e.target.value }))} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />`);

code = code.replace(/<LocationSelect type="upazila" value={formData\.presentUpazila \|\| ''} onChange={\(val\) => setFormData\(p => \(\{ \.\.\.p, presentUpazila: val \}\)\)} \/>/g,
  `<input type="text" value={formData.presentUpazila || ''} onChange={(e) => setFormData(p => ({ ...p, presentUpazila: e.target.value }))} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />`);

code = code.replace(/<LocationSelect type="district" value={formData\.presentDistrict \|\| ''} onChange={\(val\) => setFormData\(p => \(\{ \.\.\.p, presentDistrict: val \}\)\)} \/>/g,
  `<input type="text" value={formData.presentDistrict || ''} onChange={(e) => setFormData(p => ({ ...p, presentDistrict: e.target.value }))} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />`);

fs.writeFileSync('src/components/StudentEnrollmentModal.tsx', code);
