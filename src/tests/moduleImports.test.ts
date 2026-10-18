import { describe, it, expect } from 'vitest';

describe('Page Modules Import & Integrity Verification', () => {
  it('imports StudentsHome successfully', async () => {
    const mod = await import('../pages/StudentsHome');
    expect(mod.default).toBeDefined();
  });

  it('imports Academic successfully', async () => {
    const mod = await import('../pages/Academic');
    expect(mod.default).toBeDefined();
  });

  it('imports HumanResources successfully', async () => {
    const mod = await import('../pages/HumanResources');
    expect(mod.default).toBeDefined();
  });

  it('imports CommitteeModule successfully', async () => {
    const mod = await import('../pages/committee/CommitteeModule');
    expect(mod.default).toBeDefined();
  });

  it('imports ExamHome successfully', async () => {
    const mod = await import('../pages/exam/ExamHome');
    expect(mod.default).toBeDefined();
  });

  it('imports Testimonial successfully', async () => {
    const mod = await import('../pages/Testimonial');
    expect(mod.default).toBeDefined();
  });

  it('imports Institution successfully', async () => {
    const mod = await import('../pages/Institution');
    expect(mod.default).toBeDefined();
  });

  it('imports SystemAdmin successfully', async () => {
    const mod = await import('../pages/SystemAdmin');
    expect(mod.default).toBeDefined();
  });

  it('imports Support successfully', async () => {
    const mod = await import('../pages/Support');
    expect(mod.default).toBeDefined();
  });

  it('imports Communication successfully', async () => {
    const mod = await import('../pages/communication/Communication');
    expect(mod.default).toBeDefined();
  });

  it('imports AdmissionEnrollment successfully', async () => {
    const mod = await import('../pages/AdmissionEnrollment');
    expect(mod.default).toBeDefined();
  });

  it('imports ClassAndSection successfully', async () => {
    const mod = await import('../pages/ClassAndSection');
    expect(mod.default).toBeDefined();
  });
});
