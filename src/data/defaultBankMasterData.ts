import { BankMasterItem } from '../types';

export const defaultMasterBanks: BankMasterItem[] = [
  {
    id: 'bank_sonali',
    nameEn: 'Sonali Bank PLC',
    nameBn: 'সোনালী ব্যাংক পিএলসি',
    bankCode: '200',
    shortCode: 'SBL',
    category: 'state_owned',
    categoryBn: 'রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক',
    branches: [
      { id: 'br_sonali_01', bankId: 'bank_sonali', nameEn: 'Local Office, Motijheel', nameBn: 'লোকাল অফিস (মতিঝিল)', routingNumber: '200260107', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Motijheel C/A, Dhaka' },
      { id: 'br_sonali_02', bankId: 'bank_sonali', nameEn: 'Ramna Corporate Branch', nameBn: 'রমনা কর্পোরেট শাখা', routingNumber: '200263447', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Segunbagicha, Dhaka' },
      { id: 'br_sonali_03', bankId: 'bank_sonali', nameEn: 'Gulshan Corporate Branch', nameBn: 'গুলশান কর্পোরেট শাখা', routingNumber: '200261546', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Gulshan-2, Dhaka' },
      { id: 'br_sonali_04', bankId: 'bank_sonali', nameEn: 'Dhanmondi Branch', nameBn: 'ধানমন্ডি শাখা', routingNumber: '200261177', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Road 7, Dhanmondi, Dhaka' },
      { id: 'br_sonali_05', bankId: 'bank_sonali', nameEn: 'Mirpur Section-1 Branch', nameBn: 'মিরপুর শাখা', routingNumber: '200262648', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Mirpur-1, Dhaka' },
      { id: 'br_sonali_06', bankId: 'bank_sonali', nameEn: 'Uttara Model Town Branch', nameBn: 'উত্তরা মডেল টাউন শাখা', routingNumber: '200264102', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Sector 3, Uttara, Dhaka' },
      { id: 'br_sonali_07', bankId: 'bank_sonali', nameEn: 'Laldighi Corporate Branch, Ctg', nameBn: 'লালদিঘী কর্পোরেট শাখা (চট্টগ্রাম)', routingNumber: '200153097', district: 'Chattogram', districtBn: 'চট্টগ্রাম', address: 'Laldighi, Chattogram' },
      { id: 'br_sonali_08', bankId: 'bank_sonali', nameEn: 'Agrabad Corporate Branch', nameBn: 'আগ্রাবাদ কর্পোরেট শাখা', routingNumber: '200150106', district: 'Chattogram', districtBn: 'চট্টগ্রাম', address: 'Agrabad C/A, Chattogram' },
      { id: 'br_sonali_09', bankId: 'bank_sonali', nameEn: 'Rajshahi Main Branch', nameBn: 'রাজশাহী প্রধান শাখা', routingNumber: '200810486', district: 'Rajshahi', districtBn: 'রাজশাহী', address: 'Saheb Bazar, Rajshahi' },
      { id: 'br_sonali_10', bankId: 'bank_sonali', nameEn: 'Khulna Corporate Branch', nameBn: 'খুলনা কর্পোরেট শাখা', routingNumber: '200470200', district: 'Khulna', districtBn: 'খুলনা', address: 'Sir Iqbal Road, Khulna' },
      { id: 'br_sonali_11', bankId: 'bank_sonali', nameEn: 'Sylhet Main Branch', nameBn: 'সিলেট প্রধান শাখা', routingNumber: '200910540', district: 'Sylhet', districtBn: 'সিলেট', address: 'Zinda Bazar, Sylhet' },
      { id: 'br_sonali_12', bankId: 'bank_sonali', nameEn: 'Barishal Main Branch', nameBn: 'বরিশাল প্রধান শাখা', routingNumber: '200100412', district: 'Barishal', districtBn: 'বরিশাল', address: 'Sadar Road, Barishal' },
      { id: 'br_sonali_13', bankId: 'bank_sonali', nameEn: 'Rangpur Main Branch', nameBn: 'রংপুর প্রধান শাখা', routingNumber: '200850257', district: 'Rangpur', districtBn: 'রংপুর', address: 'Station Road, Rangpur' },
      { id: 'br_sonali_14', bankId: 'bank_sonali', nameEn: 'Mymensingh Main Branch', nameBn: 'ময়মনসিংহ প্রধান শাখা', routingNumber: '200610360', district: 'Mymensingh', districtBn: 'ময়মনসিংহ', address: 'Choto Bazar, Mymensingh' },
      { id: 'br_sonali_15', bankId: 'bank_sonali', nameEn: 'Cumilla Main Branch', nameBn: 'কুমিল্লা প্রধান শাখা', routingNumber: '200190184', district: 'Cumilla', districtBn: 'কুমিল্লা', address: 'Kandirpar, Cumilla' }
    ]
  },
  {
    id: 'bank_janata',
    nameEn: 'Janata Bank PLC',
    nameBn: 'জনতা ব্যাংক পিএলসি',
    bankCode: '135',
    shortCode: 'JBL',
    category: 'state_owned',
    categoryBn: 'রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক',
    branches: [
      { id: 'br_janata_01', bankId: 'bank_janata', nameEn: 'Local Office, Dilkusha', nameBn: 'লোকাল অফিস (দিলকুশা)', routingNumber: '135260126', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Dilkusha C/A, Dhaka' },
      { id: 'br_janata_02', bankId: 'bank_janata', nameEn: 'Janata Bhaban Corporate', nameBn: 'জনতা ভবন কর্পোরেট শাখা', routingNumber: '135260139', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Motijheel, Dhaka' },
      { id: 'br_janata_03', bankId: 'bank_janata', nameEn: 'Dhanmondi Corporate Branch', nameBn: 'ধানমন্ডি কর্পোরেট শাখা', routingNumber: '135261179', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Mirpur Road, Dhanmondi, Dhaka' },
      { id: 'br_janata_04', bankId: 'bank_janata', nameEn: 'Gulshan Corporate Branch', nameBn: 'গুলশান কর্পোরেট শাখা', routingNumber: '135261548', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Gulshan Avenue, Dhaka' },
      { id: 'br_janata_05', bankId: 'bank_janata', nameEn: 'Laldighi Corporate, Ctg', nameBn: 'লালদিঘী কর্পোরেট শাখা (চট্টগ্রাম)', routingNumber: '135150117', district: 'Chattogram', districtBn: 'চট্টগ্রাম', address: 'Laldighi, Chattogram' },
      { id: 'br_janata_06', bankId: 'bank_janata', nameEn: 'Rajshahi Corporate Branch', nameBn: 'রাজশাহী কর্পোরেট শাখা', routingNumber: '135810081', district: 'Rajshahi', districtBn: 'রাজশাহী', address: 'Saheb Bazar, Rajshahi' },
      { id: 'br_janata_07', bankId: 'bank_janata', nameEn: 'Khulna Corporate Branch', nameBn: 'খুলনা কর্পোরেট শাখা', routingNumber: '135470125', district: 'Khulna', districtBn: 'খুলনা', address: 'Lower Jessore Road, Khulna' },
      { id: 'br_janata_08', bankId: 'bank_janata', nameEn: 'Sylhet Corporate Branch', nameBn: 'সিলেট কর্পোরেট শাখা', routingNumber: '135910123', district: 'Sylhet', districtBn: 'সিলেট', address: 'Bandar Bazar, Sylhet' }
    ]
  },
  {
    id: 'bank_agrani',
    nameEn: 'Agrani Bank PLC',
    nameBn: 'অগ্রণী ব্যাংক পিএলসি',
    bankCode: '010',
    shortCode: 'ABL',
    category: 'state_owned',
    categoryBn: 'রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক',
    branches: [
      { id: 'br_agrani_01', bankId: 'bank_agrani', nameEn: 'Principal Branch, Motijheel', nameBn: 'প্রধান শাখা (মতিঝিল)', routingNumber: '010260113', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Motijheel C/A, Dhaka' },
      { id: 'br_agrani_02', bankId: 'bank_agrani', nameEn: 'Ramna Corporate Branch', nameBn: 'রমনা কর্পোরেট শাখা', routingNumber: '010263385', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Kakrail, Dhaka' },
      { id: 'br_agrani_03', bankId: 'bank_agrani', nameEn: 'Agrabad Corporate, Ctg', nameBn: 'আগ্রাবাদ কর্পোরেট শাখা (চট্টগ্রাম)', routingNumber: '010150106', district: 'Chattogram', districtBn: 'চট্টগ্রাম', address: 'Agrabad C/A, Chattogram' },
      { id: 'br_agrani_04', bankId: 'bank_agrani', nameEn: 'Sylhet Corporate Branch', nameBn: 'সিলেট কর্পোরেট শাখা', routingNumber: '010910110', district: 'Sylhet', districtBn: 'সিলেট', address: 'Laldighirpar, Sylhet' },
      { id: 'br_agrani_05', bankId: 'bank_agrani', nameEn: 'Rajshahi Corporate Branch', nameBn: 'রাজশাহী কর্পোরেট শাখা', routingNumber: '010810107', district: 'Rajshahi', districtBn: 'রাজশাহী', address: 'Saheb Bazar, Rajshahi' }
    ]
  },
  {
    id: 'bank_rupali',
    nameEn: 'Rupali Bank PLC',
    nameBn: 'রূপালী ব্যাংক পিএলসি',
    bankCode: '190',
    shortCode: 'RBL',
    category: 'state_owned',
    categoryBn: 'রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক',
    branches: [
      { id: 'br_rupali_01', bankId: 'bank_rupali', nameEn: 'Local Office, Dilkusha', nameBn: 'লোকাল অফিস (দিলকুশা)', routingNumber: '190260116', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Dilkusha C/A, Dhaka' },
      { id: 'br_rupali_02', bankId: 'bank_rupali', nameEn: 'Motijheel Corporate Branch', nameBn: 'মতিঝিল কর্পোরেট শাখা', routingNumber: '190262965', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Motijheel, Dhaka' },
      { id: 'br_rupali_03', bankId: 'bank_rupali', nameEn: 'Agrabad Corporate, Ctg', nameBn: 'আগ্রাবাদ কর্পোরেট শাখা', routingNumber: '190150105', district: 'Chattogram', districtBn: 'চট্টগ্রাম', address: 'Agrabad C/A, Chattogram' },
      { id: 'br_rupali_04', bankId: 'bank_rupali', nameEn: 'Rajshahi Corporate Branch', nameBn: 'রাজশাহী কর্পোরেট শাখা', routingNumber: '190810103', district: 'Rajshahi', districtBn: 'রাজশাহী', address: 'Saheb Bazar, Rajshahi' }
    ]
  },
  {
    id: 'bank_ibbl',
    nameEn: 'Islami Bank Bangladesh PLC',
    nameBn: 'ইসলামী ব্যাংক বাংলাদেশ পিএলসি',
    bankCode: '125',
    shortCode: 'IBBL',
    category: 'islamic',
    categoryBn: 'ইসলামী শরীয়াহ্ ভিত্তিক ব্যাংক',
    branches: [
      { id: 'br_ibbl_01', bankId: 'bank_ibbl', nameEn: 'Head Office Complex, Dilkusha', nameBn: 'প্রধান কার্যালয় কর্পোরেট (দিলকুশা)', routingNumber: '125260100', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Dilkusha C/A, Dhaka' },
      { id: 'br_ibbl_02', bankId: 'bank_ibbl', nameEn: 'Dhanmondi Branch', nameBn: 'ধানমন্ডি শাখা', routingNumber: '125261170', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Road 27, Dhanmondi, Dhaka' },
      { id: 'br_ibbl_03', bankId: 'bank_ibbl', nameEn: 'Gulshan Branch', nameBn: 'গুলশান শাখা', routingNumber: '125261549', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Gulshan-1, Dhaka' },
      { id: 'br_ibbl_04', bankId: 'bank_ibbl', nameEn: 'Mirpur Branch', nameBn: 'মিরপুর শাখা', routingNumber: '125262641', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Mirpur-10, Dhaka' },
      { id: 'br_ibbl_05', bankId: 'bank_ibbl', nameEn: 'Agrabad Corporate Branch, Ctg', nameBn: 'আগ্রাবাদ কর্পোরেট শাখা (চট্টগ্রাম)', routingNumber: '125150104', district: 'Chattogram', districtBn: 'চট্টগ্রাম', address: 'Agrabad C/A, Chattogram' },
      { id: 'br_ibbl_06', bankId: 'bank_ibbl', nameEn: 'Sylhet Main Branch', nameBn: 'সিলেট প্রধান শাখা', routingNumber: '125910108', district: 'Sylhet', districtBn: 'সিলেট', address: 'Bandar Bazar, Sylhet' },
      { id: 'br_ibbl_07', bankId: 'bank_ibbl', nameEn: 'Bogura Branch', nameBn: 'বগুড়া প্রধান শাখা', routingNumber: '125200109', district: 'Bogura', districtBn: 'বগুড়া', address: 'Borogola, Bogura' }
    ]
  },
  {
    id: 'bank_dbbl',
    nameEn: 'Dutch-Bangla Bank PLC',
    nameBn: 'ডাচ-বাংলা ব্যাংক পিএলসি',
    bankCode: '090',
    shortCode: 'DBBL',
    category: 'private_commercial',
    categoryBn: 'বেসরকারি বাণিজ্যিক ব্যাংক',
    branches: [
      { id: 'br_dbbl_01', bankId: 'bank_dbbl', nameEn: 'Local Office, Motijheel', nameBn: 'লোকাল অফিস (মতিঝিল)', routingNumber: '090260102', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Sena Kalyan Bhaban, Motijheel, Dhaka' },
      { id: 'br_dbbl_02', bankId: 'bank_dbbl', nameEn: 'Gulshan Branch', nameBn: 'গুলশান শাখা', routingNumber: '090261545', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Gulshan-1, Dhaka' },
      { id: 'br_dbbl_03', bankId: 'bank_dbbl', nameEn: 'Dhanmondi Branch', nameBn: 'ধানমন্ডি শাখা', routingNumber: '090261176', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Dhanmondi R/A, Dhaka' },
      { id: 'br_dbbl_04', bankId: 'bank_dbbl', nameEn: 'Uttara Branch', nameBn: 'উত্তরা শাখা', routingNumber: '090264103', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Sector 7, Uttara, Dhaka' },
      { id: 'br_dbbl_05', bankId: 'bank_dbbl', nameEn: 'Agrabad Branch, Ctg', nameBn: 'আগ্রাবাদ শাখা (চট্টগ্রাম)', routingNumber: '090150103', district: 'Chattogram', districtBn: 'চট্টগ্রাম', address: 'Agrabad C/A, Chattogram' }
    ]
  },
  {
    id: 'bank_brac',
    nameEn: 'BRAC Bank PLC',
    nameBn: 'ব্র্যাক ব্যাংক পিএলসি',
    bankCode: '060',
    shortCode: 'BBL',
    category: 'private_commercial',
    categoryBn: 'বেসরকারি বাণিজ্যিক ব্যাংক',
    branches: [
      { id: 'br_brac_01', bankId: 'bank_brac', nameEn: 'Gulshan Head Office Branch', nameBn: 'গুলশান প্রধান কার্যালয় শাখা', routingNumber: '060261542', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Anik Tower, Gulshan-1, Dhaka' },
      { id: 'br_brac_02', bankId: 'bank_brac', nameEn: 'Motijheel Branch', nameBn: 'মতিঝিল শাখা', routingNumber: '060262961', district: 'Dhaka', districtBn: 'ঢাকা', address: 'DIT Avenue, Motijheel, Dhaka' },
      { id: 'br_brac_03', bankId: 'bank_brac', nameEn: 'Dhanmondi Branch', nameBn: 'ধানমন্ডি শাখা', routingNumber: '060261173', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Satmasjid Road, Dhanmondi, Dhaka' },
      { id: 'br_brac_04', bankId: 'bank_brac', nameEn: 'Agrabad Branch, Ctg', nameBn: 'আগ্রাবাদ শাখা (চট্টগ্রাম)', routingNumber: '060150100', district: 'Chattogram', districtBn: 'চট্টগ্রাম', address: 'Agrabad C/A, Chattogram' }
    ]
  },
  {
    id: 'bank_pubali',
    nameEn: 'Pubali Bank PLC',
    nameBn: 'পূবালী ব্যাংক পিএলসি',
    bankCode: '185',
    shortCode: 'PBL',
    category: 'private_commercial',
    categoryBn: 'বেসরকারি বাণিজ্যিক ব্যাংক',
    branches: [
      { id: 'br_pubali_01', bankId: 'bank_pubali', nameEn: 'Principal Branch, Motijheel', nameBn: 'প্রধান শাখা (মতিঝিল)', routingNumber: '185260104', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Motijheel C/A, Dhaka' },
      { id: 'br_pubali_02', bankId: 'bank_pubali', nameEn: 'Gulshan Corporate Branch', nameBn: 'গুলশান কর্পোরেট শাখা', routingNumber: '185261540', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Gulshan Circle-2, Dhaka' },
      { id: 'br_pubali_03', bankId: 'bank_pubali', nameEn: 'Laldighi Branch, Ctg', nameBn: 'লালদিঘী শাখা (চট্টগ্রাম)', routingNumber: '185150103', district: 'Chattogram', districtBn: 'চট্টগ্রাম', address: 'Laldighi East, Chattogram' }
    ]
  },
  {
    id: 'bank_city',
    nameEn: 'The City Bank PLC',
    nameBn: 'সিটি ব্যাংক পিএলসি',
    bankCode: '225',
    shortCode: 'CBL',
    category: 'private_commercial',
    categoryBn: 'বেসরকারি বাণিজ্যিক ব্যাংক',
    branches: [
      { id: 'br_city_01', bankId: 'bank_city', nameEn: 'Principal Branch, VIP Road', nameBn: 'প্রধান শাখা (ভিআইপি রোড)', routingNumber: '225260103', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Topkhana Road, Dhaka' },
      { id: 'br_city_02', bankId: 'bank_city', nameEn: 'Gulshan Branch', nameBn: 'গুলশান শাখা', routingNumber: '225261540', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Gulshan Avenue, Dhaka' },
      { id: 'br_city_03', bankId: 'bank_city', nameEn: 'Dhanmondi Branch', nameBn: 'ধানমন্ডি শাখা', routingNumber: '225261171', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Road 2, Dhanmondi, Dhaka' }
    ]
  },
  {
    id: 'bank_krishi',
    nameEn: 'Bangladesh Krishi Bank',
    nameBn: 'বাংলাদেশ কৃষি ব্যাংক',
    bankCode: '035',
    shortCode: 'BKB',
    category: 'specialized',
    categoryBn: 'বিশেষায়িত ব্যাংক',
    branches: [
      { id: 'br_bkb_01', bankId: 'bank_krishi', nameEn: 'Principal Branch, Motijheel', nameBn: 'প্রধান শাখা (মতিঝিল)', routingNumber: '035260109', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Krishi Bank Bhaban, Motijheel, Dhaka' },
      { id: 'br_bkb_02', bankId: 'bank_krishi', nameEn: 'Chattogram Divisional Branch', nameBn: 'চট্টগ্রাম বিভাগীয় শাখা', routingNumber: '035150102', district: 'Chattogram', districtBn: 'চট্টগ্রাম', address: 'Agrabad, Chattogram' },
      { id: 'br_bkb_03', bankId: 'bank_krishi', nameEn: 'Rajshahi Main Branch', nameBn: 'রাজশাহী প্রধান শাখা', routingNumber: '035810103', district: 'Rajshahi', districtBn: 'রাজশাহী', address: 'Saheb Bazar, Rajshahi' }
    ]
  },
  {
    id: 'bank_ucb',
    nameEn: 'United Commercial Bank PLC',
    nameBn: 'ইউনাইটেড কমার্শিয়াল ব্যাংক পিএলসি',
    bankCode: '245',
    shortCode: 'UCB',
    category: 'private_commercial',
    categoryBn: 'বেসরকারি বাণিজ্যিক ব্যাংক',
    branches: [
      { id: 'br_ucb_01', bankId: 'bank_ucb', nameEn: 'Principal Branch', nameBn: 'প্রিন্সিপাল ব্রাঞ্চ', routingNumber: '245260107', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Motijheel, Dhaka' },
      { id: 'br_ucb_02', bankId: 'bank_ucb', nameEn: 'Gulshan Corporate Branch', nameBn: 'গুলশান কর্পোরেট শাখা', routingNumber: '245261544', district: 'Dhaka', districtBn: 'ঢাকা', address: 'Gulshan-1, Dhaka' }
    ]
  }
];
