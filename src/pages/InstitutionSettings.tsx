import React, { useState, useRef, useMemo } from 'react';
import { Upload, Trash2, Building2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { translations, TranslationKey } from '../locales';
import { LocationSelect } from '../components/LocationSelect';
import { compressImageBase64 } from '../utils/imageUtils';

const InstitutionSettings = () => {
  const { language, institution, updateInstitution, learnedLocations, learnLocation, whiteLabel, updateWhiteLabel } = useAppStore();
  const t = (key: TranslationKey) => translations[language][key];

  const [formData, setFormData] = useState(institution);
  const [saved, setSaved] = useState(false);
  const [wlData, setWlData] = useState(whiteLabel || { appName: '', appIcon: '', enabled: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const divisions = useMemo(() => learnedLocations?.filter(l => l.id.startsWith('div_')) || [], [learnedLocations]);
  const districts = useMemo(() => learnedLocations?.filter(l => l.id.startsWith('dist_')) || [], [learnedLocations]);
  const upazilas = useMemo(() => learnedLocations?.filter(l => l.id.startsWith('upz_')) || [], [learnedLocations]);
  const unions = useMemo(() => learnedLocations?.filter(l => l.id.startsWith('uni_')) || [], [learnedLocations]);
  const postOffices = useMemo(() => learnedLocations?.filter(l => l.id.startsWith('po_')) || [], [learnedLocations]);
  const villages = useMemo(() => learnedLocations?.filter(l => l.id.startsWith('vil_')) || [], [learnedLocations]);
  
  const filteredDistricts = useMemo(() => districts.filter(d => formData.defaultDivision ? d.parentId === formData.defaultDivision : true), [districts, formData.defaultDivision]);
  const filteredUpazilas = useMemo(() => upazilas.filter(u => formData.defaultDistrict ? u.parentId === formData.defaultDistrict : true), [upazilas, formData.defaultDistrict]);
  const filteredUnions = useMemo(() => unions.filter(u => formData.defaultUpazila ? u.parentId === formData.defaultUpazila : true), [unions, formData.defaultUpazila]);
  const filteredPostOffices = useMemo(() => postOffices.filter(po => formData.defaultUpazila ? po.parentId === formData.defaultUpazila : true), [postOffices, formData.defaultUpazila]);
  const filteredVillages = useMemo(() => villages.filter(v => formData.defaultUnion ? v.parentId === formData.defaultUnion : true), [villages, formData.defaultUnion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateInstitution(formData);
    updateWhiteLabel(wlData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear dependent fields when a parent field changes
    let updates: any = { [name]: value };
    if (name === 'defaultDivision') {
      updates = { ...updates, defaultDistrict: '', defaultUpazila: '', defaultUnion: '', defaultPostOffice: '', defaultVillage: '' };
    } else if (name === 'defaultDistrict') {
      updates = { ...updates, defaultUpazila: '', defaultUnion: '', defaultPostOffice: '', defaultVillage: '' };
    } else if (name === 'defaultUpazila') {
      updates = { ...updates, defaultUnion: '', defaultPostOffice: '', defaultVillage: '' };
    } else if (name === 'defaultUnion') {
      updates = { ...updates, defaultVillage: '' };
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleAddLocation = (type: 'defaultDivision' | 'defaultDistrict' | 'defaultUpazila' | 'defaultUnion' | 'defaultPostOffice' | 'defaultVillage', name: string, nameBn: string, parentId?: string) => {
    const prefix = type === 'defaultDivision' ? 'div_' : type === 'defaultDistrict' ? 'dist_' : type === 'defaultUpazila' ? 'upz_' : type === 'defaultUnion' ? 'uni_' : type === 'defaultPostOffice' ? 'po_' : 'vil_';
    const newId = `${prefix}${Date.now()}`;
    learnLocation({ id: newId, name, nameBn, parentId });
    setFormData(prev => ({ ...prev, [type]: newId }));
  };

  const handleWlPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageBase64(file, 256, 256, 0.9);
        setWlData({ ...wlData, appIcon: compressed });
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setWlData({ ...wlData, appIcon: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageBase64(file, 300, 300, 0.85);
        setFormData({ ...formData, logoUrl: compressed });
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({ ...formData, logoUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeLogo = () => {
    setFormData({ ...formData, logoUrl: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('institution')}</h1>
        <p className="text-slate-500 mt-1">{t('settings')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            
            {/* Logo Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Institution Logo</h3>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden relative group">
                  {formData.logoUrl ? (
                    <>
                      <img src={formData.logoUrl} alt="Institution Logo" className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Remove Logo"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <Building2 className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors cursor-pointer shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </label>
                  <p className="text-xs text-slate-500 mt-2">Recommended: PNG or SVG, transparent background. Max 1MB.</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Institution Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('eiin')}</label>
                  <input
                    type="text"
                    name="eiin"
                    value={formData.eiin || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('established')}</label>
                  <input
                    type="text"
                    name="established"
                    value={formData.established || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">MPO Code (এমপিও কোড)</label>
                  <input
                    type="text"
                    name="mpoCode"
                    value={formData.mpoCode || ''}
                    onChange={handleChange}
                    placeholder="e.g. 0802131403"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">School Code (বিদ্যালয় কোড)</label>
                  <input
                    type="text"
                    name="schoolCode"
                    value={formData.schoolCode || ''}
                    onChange={handleChange}
                    placeholder="e.g. 8209"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Names */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('instituteName')} (English)</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('instituteName')} (বাংলা)</label>
                  <input
                    type="text"
                    name="nameBn"
                    value={formData.nameBn || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Headmaster Names */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('headmasterName')} (English)</label>
                  <input
                    type="text"
                    name="headmasterName"
                    value={formData.headmasterName || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('headmasterName')} (বাংলা)</label>
                  <input
                    type="text"
                    name="headmasterNameBn"
                    value={formData.headmasterNameBn || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Headmaster Designation / Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Designation / Title (English)</label>
                  <input
                    type="text"
                    name="headmasterTitle"
                    value={formData.headmasterTitle || ''}
                    onChange={handleChange}
                    placeholder="e.g. Headmaster / Principal"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">পদবি (বাংলা)</label>
                  <input
                    type="text"
                    name="headmasterTitleBn"
                    value={formData.headmasterTitleBn || ''}
                    onChange={handleChange}
                    placeholder="যেমন: প্রধান শিক্ষক / অধ্যক্ষ"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Addresses */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('address')} (English)</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{t('address')} (বাংলা)</label>
                  <input
                    type="text"
                    name="addressBn"
                    value={formData.addressBn || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Mobile</label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Exam Center</label>
                  <input
                    type="text"
                    name="examCenter"
                    value={formData.examCenter || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. Nangalkot-9"
                  />
                </div>
              </div>
            </div>

            {/* Default Location Settings */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Default Address Configuration</h3>
              <p className="text-sm text-slate-500 mb-4">Set default locations to speed up student data entry. These will be pre-filled when adding a new student.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Default Division</label>
                  <LocationSelect
                    options={divisions}
                    value={formData.defaultDivision || ''}
                    onChange={(val) => handleChange({ target: { name: 'defaultDivision', value: val } } as any)}
                    onAdd={(name, nameBn) => handleAddLocation('defaultDivision', name, nameBn)}
                    placeholder="Select Division"
                    language={language}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Default District</label>
                  <LocationSelect
                    options={filteredDistricts}
                    value={formData.defaultDistrict || ''}
                    onChange={(val) => handleChange({ target: { name: 'defaultDistrict', value: val } } as any)}
                    onAdd={(name, nameBn) => handleAddLocation('defaultDistrict', name, nameBn, formData.defaultDivision || '')}
                    placeholder="Select District"
                    disabled={!formData.defaultDivision}
                    language={language}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Default Upazila</label>
                  <LocationSelect
                    options={filteredUpazilas}
                    value={formData.defaultUpazila || ''}
                    onChange={(val) => handleChange({ target: { name: 'defaultUpazila', value: val } } as any)}
                    onAdd={(name, nameBn) => handleAddLocation('defaultUpazila', name, nameBn, formData.defaultDistrict || '')}
                    placeholder="Select Upazila"
                    disabled={!formData.defaultDistrict}
                    language={language}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Default Union</label>
                  <LocationSelect
                    options={filteredUnions}
                    value={formData.defaultUnion || ''}
                    onChange={(val) => handleChange({ target: { name: 'defaultUnion', value: val } } as any)}
                    onAdd={(name, nameBn) => handleAddLocation('defaultUnion', name, nameBn, formData.defaultUpazila || '')}
                    placeholder="Select Union"
                    disabled={!formData.defaultUpazila}
                    language={language}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Default Post Office</label>
                  <LocationSelect
                    options={filteredPostOffices}
                    value={formData.defaultPostOffice || ''}
                    onChange={(val) => handleChange({ target: { name: 'defaultPostOffice', value: val } } as any)}
                    onAdd={(name, nameBn) => handleAddLocation('defaultPostOffice', name, nameBn, formData.defaultUpazila || '')}
                    placeholder="Select Post Office"
                    disabled={!formData.defaultUpazila}
                    language={language}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Default Village</label>
                  <LocationSelect
                    options={filteredVillages}
                    value={formData.defaultVillage || ''}
                    onChange={(val) => handleChange({ target: { name: 'defaultVillage', value: val } } as any)}
                    onAdd={(name, nameBn) => handleAddLocation('defaultVillage', name, nameBn, formData.defaultUnion || '')}
                    placeholder="Select Village"
                    disabled={!formData.defaultUnion}
                    language={language}
                  />
                </div>
              </div>
            </div>

            
            {/* White Label Settings */}
            <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-slate-800">White Label (Software Branding)</h3>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <input 
                  type="checkbox" 
                  id="wl-enabled" 
                  checked={wlData.enabled} 
                  onChange={e => setWlData({...wlData, enabled: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="wl-enabled" className="text-sm font-medium text-slate-700">Enable White Label Branding</label>
              </div>

              {wlData.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Institution Name for Software</label>
                    <input
                      type="text"
                      value={wlData.appName}
                      onChange={e => setWlData({...wlData, appName: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Aziara High School"
                    />
                    <p className="text-xs text-slate-500">Will be shown as: {wlData.appName ? `${wlData.appName.split(' ').map(w => w[0]).join('').toUpperCase()} ERP by SoftDows` : 'Biddalok by SoftDows'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Software Icon / Logo</label>
                    <div className="flex items-center gap-4">
                      {wlData.appIcon ? (
                        <div className="relative">
                          <img src={wlData.appIcon} alt="Icon" className="w-12 h-12 rounded-lg border border-slate-200 object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setWlData({...wlData, appIcon: ''})} 
                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <input type="file" accept="image/*" id="wl-icon-upload" className="hidden" onChange={handleWlPhotoUpload} />
                        <label htmlFor="wl-icon-upload" className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors">
                          Upload Icon
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center gap-4 border-t border-slate-100">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                {t('save')}
              </button>
              {saved && (
                <span className="text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full text-sm">Saved successfully!</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InstitutionSettings;
