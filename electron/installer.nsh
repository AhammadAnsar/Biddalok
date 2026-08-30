; ==============================================================================
; Biddalok by SoftDows - Modern NSIS Custom Installer Script
; Developed by: Ansar Ahammad (Founder, SoftDows)
; ==============================================================================

!macro customInit
  ; Check if previous version is already installed in HKLM or HKCU
  ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.softdows.biddalok" "UninstallString"
  ${If} $0 == ""
    ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.softdows.biddalok" "UninstallString"
  ${EndIf}

  ${If} $0 != ""
    ReadRegStr $1 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.softdows.biddalok" "DisplayVersion"
    ${If} $1 == ""
      ReadRegStr $1 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.softdows.biddalok" "DisplayVersion"
    ${EndIf}

    ; Show update confirmation dialog
    MessageBox MB_YESNO|MB_ICONQUESTION \
      "Biddalok by SoftDows ($1) আগে থেকেই আপনার কম্পিউটারে ইনস্টল করা আছে!$\n$\n• [Yes / হ্যাঁ] : সফটওয়্যার নতুন সংস্করণে আপডেট / মেরামত করুন (আপনার সমস্ত সংরক্ষিত ডেটা অক্ষত থাকবে)।$\n• [No / না]    : ইনস্টলেশন বাতিল করুন।" \
      /SD IDYES IDYES proceed_update IDNO cancel_install

    cancel_install:
      Quit

    proceed_update:
  ${EndIf}
!macroend

!macro customInstall
  ; Executed after installation is complete
!macroend

!macro customUnInstall
  MessageBox MB_YESNO|MB_ICONQUESTION \
    "আপনি কি আপনার বিদ্যালয়ের ডাটাবেজ ব্যাকআপ ও সেটিংস কম্পিউটারে সুরক্ষিত রেখে প্রোগ্রাম আনইনস্টল করতে চান?$\n$\n• [Yes / হ্যাঁ] : ডেটাবেজ ও সার্টিফিকেট রেকর্ড সুরক্ষিত থাকবে।$\n• [No / না]    : সম্পূর্ণ মুছে ফেলা হবে।" \
    /SD IDYES IDYES keep_data IDNO remove_all

  keep_data:
    Goto finish_uninst

  remove_all:

  finish_uninst:
!macroend

