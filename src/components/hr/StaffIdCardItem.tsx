import React, { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { StaffMember, StaffIdCardSettings, Institution } from '../../types';
import { toBengaliNumber } from '../../utils/bengaliUtils';
import './staff-id-card.css';

interface StaffIdCardItemProps {
  staff: StaffMember;
  institution: Institution;
  settings: StaffIdCardSettings;
  side?: 'front' | 'back' | 'both';
  principalSignatureUrl?: string;
}

const resolvePath = (source: any, path: string) => {
  if (!path || typeof path !== 'string') return undefined;
  return path.split('.').reduce((value, key) => value?.[key], source);
};

const isPresent = (value: any) => {
  return value !== undefined && value !== null && String(value).trim() !== '';
};

export const StaffIdCardItem: React.FC<StaffIdCardItemProps> = ({ 
  staff, 
  institution, 
  settings, 
  side = 'both',
  principalSignatureUrl
}) => {
  // Map fields dynamically based on the exact structure expected by the template
  const cardData = useMemo(() => {
    return {
      institution: {
        name: institution?.name,
        logoUrl: institution?.logoUrl,
      },
      employee: {
        name: staff.nameBn || staff.name,
        designation: staff.designationBn || staff.designation,
        indexNumber: staff.pdsId || staff.customStaffId,
        subject: staff.subject,
        joiningDate: staff.joiningDate ? toBengaliNumber(staff.joiningDate) : null,
        validUntil: null, // Removed hardcoded '৩১ ডিসেম্বর ২০২৭ খ্রি.'. Data should come from db
        bloodGroup: staff.bloodGroup,
        mobile: staff.mobile ? toBengaliNumber(staff.mobile) : null,
        emergencyContact: staff.emergencyContactPhone ? toBengaliNumber(staff.emergencyContactPhone) : (institution?.mobile ? toBengaliNumber(institution.mobile) : null),
        addressDisplay: [staff.village ? `গ্রাম: ${staff.village}` : '', staff.postOffice ? `ডাকঘর: ${staff.postOffice}` : '', staff.upazila ? `উপজেলা: ${staff.upazila}` : '', staff.district ? `জেলা: ${staff.district}` : ''].filter(Boolean).join(', ')
      },
      verification: {
        qrImageUrl: `${window.location.origin}/verify/staff/${staff.id}`
      },
      authorization: {
        signatureUrl: principalSignatureUrl
      }
    };
  }, [staff, institution, principalSignatureUrl]);

  const appLogo = resolvePath(cardData, settings.media.logoPath) || '';
  const photo = resolvePath(cardData, settings.media.photoPath) || '';
  const qrDataText = resolvePath(cardData, settings.media.qrPath) || '';
  const signatureUrl = resolvePath(cardData, settings.media.signaturePath) || '';
  
  // Theme css variables mapping
  const styleVars: any = useMemo(() => {
    const vars: any = {};
    Object.entries(settings.theme || {}).forEach(([k, v]) => {
      // CamelCase to kebab-case
      const cssKey = `--id-${k.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`;
      vars[cssKey] = v;
    });
    return vars;
  }, [settings.theme]);

  // Duplicate Check Validation
  const duplicateWarnings = useMemo(() => {
    const fieldPaths = new Map();
    const warnings: string[] = [];

    ['front', 'back'].forEach((currentSide) => {
      const layoutSide = currentSide as 'front' | 'back';
      settings.layout[layoutSide].fields
        .filter((field) => field.visible !== false)
        .forEach((field) => {
          if (field.allowDuplicate === true) return;
          const previousSide = fieldPaths.get(field.valuePath);
          if (previousSide) {
            warnings.push(`একই তথ্য দুইবার ব্যবহার করা হয়েছে: ${field.valuePath} (${previousSide} এবং ${currentSide})`);
          }
          fieldPaths.set(field.valuePath, currentSide);
        });
    });
    return warnings;
  }, [settings.layout]);

  if (duplicateWarnings.length > 0) {
    console.warn("StaffIdCard Validation Errors:", duplicateWarnings);
  }

  const renderFieldRow = (field: any) => {
    if (field.visible === false) return null;
    const value = resolvePath(cardData, field.valuePath);
    if (!isPresent(value)) return null;

    const labelText = settings.labels?.fields?.[field.labelKey] || field.labelKey;
    const variantClass = field.variant ? `id-card__field--${field.variant}` : '';

    return (
      <div key={field.id} className={`id-card__field ${variantClass}`} data-field-id={field.id}>
        <span className="id-card__label">{labelText}</span>
        <span className="id-card__separator">{settings.fieldSeparator}</span>
        <span className="id-card__value">{value}</span>
      </div>
    );
  };

  const renderSection = (section: string, isFront: boolean) => {
    if (settings.visibility[section] === false) return null;

    switch (section) {
      case 'header':
        return (
          <header className="id-card__section id-card__header">
            {settings.visibility.logo !== false && (
              <div className="id-card__logo-holder">
                {appLogo ? <img src={appLogo} className="id-card__logo" alt={settings.labels.logoAlt} /> : <span className="id-card__missing-media">{settings.labels.logoFallback}</span>}
              </div>
            )}
            {isPresent(resolvePath(cardData, settings.content.schoolNamePath)) && (
              <h2 className="id-card__school-name">{resolvePath(cardData, settings.content.schoolNamePath)}</h2>
            )}
            {isPresent(settings.labels.cardType) && (
              <p className="id-card__type">{settings.labels.cardType}</p>
            )}
          </header>
        );
      case 'photo':
        return (
          <section className="id-card__section id-card__photo-wrap">
            <div className="id-card__photo-frame">
              {photo ? (
                <img src={photo} className="id-card__photo" alt={settings.labels.photoAltTemplate.replace("{name}", resolvePath(cardData, settings.content.employeeNamePath) || "")} />
              ) : (
                <span className="id-card__missing-media">{settings.labels.photoFallback}</span>
              )}
            </div>
          </section>
        );
      case 'identity':
        return (
          <section className="id-card__section id-card__identity">
            {isPresent(resolvePath(cardData, settings.content.employeeNamePath)) && (
              <h3 className="id-card__name">{resolvePath(cardData, settings.content.employeeNamePath)}</h3>
            )}
            {isPresent(resolvePath(cardData, settings.content.designationPath)) && (
              <p className="id-card__designation">{resolvePath(cardData, settings.content.designationPath)}</p>
            )}
          </section>
        );
      case 'fields': {
        const layoutFields = isFront ? settings.layout.front.fields : settings.layout.back.fields;
        return (
          <section className="id-card__section id-card__fields" data-side={isFront ? 'front' : 'back'}>
            {layoutFields.map(renderFieldRow)}
          </section>
        );
      }
      case 'mark':
        return (
          <header className="id-card__section id-card__back-mark">
            {settings.visibility.backLogo !== false && (
              <div className="id-card__logo-holder">
                {appLogo ? <img src={appLogo} className="id-card__logo" alt={settings.labels.logoAlt} /> : <span className="id-card__missing-media">{settings.labels.logoFallback}</span>}
              </div>
            )}
          </header>
        );
      case 'verification':
        return (
          <section className="id-card__section id-card__verification">
            <div className="id-card__qr-holder">
              {qrDataText ? (
                <QRCodeSVG value={qrDataText} className="id-card__qr" size={256} level="M" />
              ) : (
                <span className="id-card__missing-media">{settings.labels.qrFallback}</span>
              )}
            </div>
            <div className="id-card__verification-copy">
              <p className="id-card__verification-title">{settings.labels.verificationTitle}</p>
              <p className="id-card__verification-text">{settings.labels.verificationHelp}</p>
            </div>
          </section>
        );
      case 'notice':
        return (
          <p className="id-card__section id-card__notice">{settings.labels.nonTransferableNotice}</p>
        );
      case 'signature':
        return (
          <section className="id-card__section id-card__signature">
            {signatureUrl && (
              <img src={signatureUrl} alt={settings.labels.signatureAlt} className="id-card__signature-image" />
            )}
            <div className="id-card__signature-line"></div>
            <span className="id-card__signature-label">{settings.labels.signatureLabel}</span>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card-pair" style={styleVars}>
      {(side === 'both' || side === 'front') && (
        <article className="id-card id-card__front" data-side="front" aria-label={settings.labels.frontAriaLabel}>
          <div className="id-card__content">
            {settings.layout.front.sections.map(s => <React.Fragment key={s}>{renderSection(s, true)}</React.Fragment>)}
          </div>
        </article>
      )}

      {(side === 'both' || side === 'back') && (
        <article className="id-card id-card__back" data-side="back" aria-label={settings.labels.backAriaLabel}>
          <div className="id-card__content">
            {settings.layout.back.sections.map(s => <React.Fragment key={s}>{renderSection(s, false)}</React.Fragment>)}
          </div>
        </article>
      )}
    </div>
  );
};
