export interface LocationItem {
  id: string;
  name: string;      // English Name
  nameBn: string;    // Bengali Name
  parentId?: string; // ID of parent (e.g. Division ID for District)
}

// Initial default list of Divisions
export const defaultDivisions: LocationItem[] = [
  { id: 'div_dhaka', name: 'Dhaka', nameBn: 'ঢাকা' },
  { id: 'div_chittagong', name: 'Chattogram', nameBn: 'চট্টগ্রাম' },
  { id: 'div_rajshahi', name: 'Rajshahi', nameBn: 'রাজশাহী' },
  { id: 'div_khulna', name: 'Khulna', nameBn: 'খুলনা' },
  { id: 'div_barishal', name: 'Barishal', nameBn: 'বরিশাল' },
  { id: 'div_sylhet', name: 'Sylhet', nameBn: 'সিলেট' },
  { id: 'div_rangpur', name: 'Rangpur', nameBn: 'রংপুর' },
  { id: 'div_mymensingh', name: 'Mymensingh', nameBn: 'ময়মনসিংহ' },
];

// Initial default list of few common districts mapped to divisions
export const defaultDistricts: LocationItem[] = [
  // Dhaka Division (13)
  { id: 'dist_dhaka', name: 'Dhaka', nameBn: 'ঢাকা', parentId: 'div_dhaka' },
  { id: 'dist_faridpur', name: 'Faridpur', nameBn: 'ফরিদপুর', parentId: 'div_dhaka' },
  { id: 'dist_gazipur', name: 'Gazipur', nameBn: 'গাজীপুর', parentId: 'div_dhaka' },
  { id: 'dist_gopalganj', name: 'Gopalganj', nameBn: 'গোপালগঞ্জ', parentId: 'div_dhaka' },
  { id: 'dist_kishoreganj', name: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', parentId: 'div_dhaka' },
  { id: 'dist_madaripur', name: 'Madaripur', nameBn: 'মাদারীপুর', parentId: 'div_dhaka' },
  { id: 'dist_manikganj', name: 'Manikganj', nameBn: 'মানিকগঞ্জ', parentId: 'div_dhaka' },
  { id: 'dist_munshiganj', name: 'Munshiganj', nameBn: 'মুন্সিগঞ্জ', parentId: 'div_dhaka' },
  { id: 'dist_narayanganj', name: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', parentId: 'div_dhaka' },
  { id: 'dist_narsingdi', name: 'Narsingdi', nameBn: 'নরসিংদী', parentId: 'div_dhaka' },
  { id: 'dist_rajbari', name: 'Rajbari', nameBn: 'রাজবাড়ী', parentId: 'div_dhaka' },
  { id: 'dist_shariatpur', name: 'Shariatpur', nameBn: 'শরীয়তপুর', parentId: 'div_dhaka' },
  { id: 'dist_tangail', name: 'Tangail', nameBn: 'টাঙ্গাইল', parentId: 'div_dhaka' },

  // Chattogram Division (11)
  { id: 'dist_bandarban', name: 'Bandarban', nameBn: 'বান্দরবান', parentId: 'div_chittagong' },
  { id: 'dist_brahmanbaria', name: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', parentId: 'div_chittagong' },
  { id: 'dist_chandpur', name: 'Chandpur', nameBn: 'চাঁদপুর', parentId: 'div_chittagong' },
  { id: 'dist_chittagong', name: 'Chattogram', nameBn: 'চট্টগ্রাম', parentId: 'div_chittagong' },
  { id: 'dist_comilla', name: 'Cumilla', nameBn: 'কুমিল্লা', parentId: 'div_chittagong' },
  { id: 'dist_coxsbazar', name: "Cox's Bazar", nameBn: 'কক্সবাজার', parentId: 'div_chittagong' },
  { id: 'dist_feni', name: 'Feni', nameBn: 'ফেনী', parentId: 'div_chittagong' },
  { id: 'dist_khagrachhari', name: 'Khagrachhari', nameBn: 'খাগড়াছড়ি', parentId: 'div_chittagong' },
  { id: 'dist_lakshmipur', name: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', parentId: 'div_chittagong' },
  { id: 'dist_noakhali', name: 'Noakhali', nameBn: 'নোয়াখালী', parentId: 'div_chittagong' },
  { id: 'dist_rangamati', name: 'Rangamati', nameBn: 'রাঙ্গামাটি', parentId: 'div_chittagong' },

  // Rajshahi Division (8)
  { id: 'dist_bogra', name: 'Bogra', nameBn: 'বগুড়া', parentId: 'div_rajshahi' },
  { id: 'dist_chapainawabganj', name: 'Chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', parentId: 'div_rajshahi' },
  { id: 'dist_joypurhat', name: 'Joypurhat', nameBn: 'জয়পুরহাট', parentId: 'div_rajshahi' },
  { id: 'dist_naogaon', name: 'Naogaon', nameBn: 'নওগাঁ', parentId: 'div_rajshahi' },
  { id: 'dist_natore', name: 'Natore', nameBn: 'নাটোর', parentId: 'div_rajshahi' },
  { id: 'dist_pabna', name: 'Pabna', nameBn: 'পাবনা', parentId: 'div_rajshahi' },
  { id: 'dist_rajshahi', name: 'Rajshahi', nameBn: 'রাজশাহী', parentId: 'div_rajshahi' },
  { id: 'dist_sirajganj', name: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', parentId: 'div_rajshahi' },

  // Khulna Division (10)
  { id: 'dist_bagerhat', name: 'Bagerhat', nameBn: 'বাগেরহাট', parentId: 'div_khulna' },
  { id: 'dist_chuadanga', name: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', parentId: 'div_khulna' },
  { id: 'dist_jessore', name: 'Jashore', nameBn: 'যশোর', parentId: 'div_khulna' },
  { id: 'dist_jhenaidah', name: 'Jhenaidah', nameBn: 'ঝিনাইদহ', parentId: 'div_khulna' },
  { id: 'dist_khulna', name: 'Khulna', nameBn: 'খুলনা', parentId: 'div_khulna' },
  { id: 'dist_kushtia', name: 'Kushtia', nameBn: 'কুষ্টিয়া', parentId: 'div_khulna' },
  { id: 'dist_magura', name: 'Magura', nameBn: 'মাগুরা', parentId: 'div_khulna' },
  { id: 'dist_meherpur', name: 'Meherpur', nameBn: 'মেহেরপুর', parentId: 'div_khulna' },
  { id: 'dist_narail', name: 'Narail', nameBn: 'নড়াইল', parentId: 'div_khulna' },
  { id: 'dist_satkhira', name: 'Satkhira', nameBn: 'সাতক্ষীরা', parentId: 'div_khulna' },

  // Barishal Division (6)
  { id: 'dist_barguna', name: 'Barguna', nameBn: 'বরগুনা', parentId: 'div_barishal' },
  { id: 'dist_barishal', name: 'Barishal', nameBn: 'বরিশাল', parentId: 'div_barishal' },
  { id: 'dist_bhola', name: 'Bhola', nameBn: 'ভোলা', parentId: 'div_barishal' },
  { id: 'dist_jhalokati', name: 'Jhalokati', nameBn: 'ঝালকাঠি', parentId: 'div_barishal' },
  { id: 'dist_patuakhali', name: 'Patuakhali', nameBn: 'পটুয়াখালী', parentId: 'div_barishal' },
  { id: 'dist_pirojpur', name: 'Pirojpur', nameBn: 'পিরোজপুর', parentId: 'div_barishal' },

  // Sylhet Division (4)
  { id: 'dist_habiganj', name: 'Habiganj', nameBn: 'হবিগঞ্জ', parentId: 'div_sylhet' },
  { id: 'dist_moulvibazar', name: 'Moulvibazar', nameBn: 'মৌলভীবাজার', parentId: 'div_sylhet' },
  { id: 'dist_sunamganj', name: 'Sunamganj', nameBn: 'সুনামগঞ্জ', parentId: 'div_sylhet' },
  { id: 'dist_sylhet', name: 'Sylhet', nameBn: 'সিলেট', parentId: 'div_sylhet' },

  // Rangpur Division (8)
  { id: 'dist_dinajpur', name: 'Dinajpur', nameBn: 'দিনাজপুর', parentId: 'div_rangpur' },
  { id: 'dist_gaibandha', name: 'Gaibandha', nameBn: 'গাইবান্ধা', parentId: 'div_rangpur' },
  { id: 'dist_kurigram', name: 'Kurigram', nameBn: 'কুড়িগ্রাম', parentId: 'div_rangpur' },
  { id: 'dist_lalmonirhat', name: 'Lalmonirhat', nameBn: 'লালমনিরহাট', parentId: 'div_rangpur' },
  { id: 'dist_nilphamari', name: 'Nilphamari', nameBn: 'নীলফামারী', parentId: 'div_rangpur' },
  { id: 'dist_panchagarh', name: 'Panchagarh', nameBn: 'পঞ্চগড়', parentId: 'div_rangpur' },
  { id: 'dist_rangpur', name: 'Rangpur', nameBn: 'রংপুর', parentId: 'div_rangpur' },
  { id: 'dist_thakurgaon', name: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও', parentId: 'div_rangpur' },

  // Mymensingh Division (4)
  { id: 'dist_jamalpur', name: 'Jamalpur', nameBn: 'জামালপুর', parentId: 'div_mymensingh' },
  { id: 'dist_mymensingh', name: 'Mymensingh', nameBn: 'ময়মনসিংহ', parentId: 'div_mymensingh' },
  { id: 'dist_netrokona', name: 'Netrokona', nameBn: 'নেত্রকোণা', parentId: 'div_mymensingh' },
  { id: 'dist_sherpur', name: 'Sherpur', nameBn: 'শেরপুর', parentId: 'div_mymensingh' },
];

export const defaultUpazilas: LocationItem[] = [
  // Nangalkot mapped to Cumilla as requested before
  { id: 'upz_nangalkot', name: 'Nangalkot', nameBn: 'নাঙ্গলকোট', parentId: 'dist_comilla' },
  { id: 'upz_laksam', name: 'Laksam', nameBn: 'লাকসাম', parentId: 'dist_comilla' },
  { id: 'upz_chauddagram', name: 'Chauddagram', nameBn: 'চৌদ্দগ্রাম', parentId: 'dist_comilla' },
  { id: 'upz_sadar_south', name: 'Sadar South', nameBn: 'সদর দক্ষিণ', parentId: 'dist_comilla' },
  { id: 'upz_comilla_sadar', name: 'Cumilla Sadar', nameBn: 'কুমিল্লা সদর', parentId: 'dist_comilla' },
];

export const defaultUnions: LocationItem[] = [
  { id: 'uni_hesakhal', name: 'Hesakhal', nameBn: 'হেসাখাল', parentId: 'upz_nangalkot' },
  { id: 'uni_mokara', name: 'Mokara', nameBn: 'মৌকরা', parentId: 'upz_nangalkot' },
];
