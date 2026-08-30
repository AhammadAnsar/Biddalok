import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateSalt, hashPassword, verifyPassword, verifySupportOTP } from '../utils/security';
import { Institution } from '../types';
import { asyncNonBlockingStorage } from './asyncStorage';

export interface AuthState {
  isOnboarded: boolean;
  adminUser: string;
  adminPassHash: string;
  adminSalt: string;
  recoveryPinHash?: string;
  recoveryPinSalt?: string;
  // Legacy fallback support for pre-existing installations
  legacyAdminPass?: string;
  isAuthenticated: boolean;
  login: (user: string, pass: string, instEiin?: string) => Promise<boolean>;
  logout: () => void;
  setOnboarded: (user: string, pass: string, recoveryPin?: string) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  recoverPassword: (
    newPass: string, 
    verification: {
      inputEiin?: string;
      inputContact?: string;
      inputPin?: string;
      challengeCode?: string;
      supportOtp?: string;
      institution?: Institution;
    },
    newUsername?: string
  ) => Promise<{ success: boolean; message: string; username?: string }>;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isOnboarded: false,
      adminUser: '',
      adminPassHash: '',
      adminSalt: '',
      recoveryPinHash: undefined,
      recoveryPinSalt: undefined,
      legacyAdminPass: undefined,
      isAuthenticated: false,

      login: async (user: string, pass: string, instEiin?: string): Promise<boolean> => {
        const state = get();
        // If not onboarded and has no credentials stored at all
        if (!state.isOnboarded && !state.adminPassHash && !state.legacyAdminPass) {
          return false;
        }

        const inputUser = (user || '').trim().toLowerCase();
        const storedAdminUser = (state.adminUser || '').trim().toLowerCase();
        const currentEiin = (instEiin || '').trim().toLowerCase();

        // Allow flexible login username matching:
        // 1. Matches stored adminUser
        // 2. OR user typed 'admin'
        // 3. OR user typed institution EIIN
        // 4. OR storedAdminUser is not yet defined
        const isUserMatch = !storedAdminUser || 
          inputUser === storedAdminUser || 
          inputUser === 'admin' || 
          (currentEiin && inputUser === currentEiin);

        if (!isUserMatch) {
          return false;
        }

        const cleanPass = (pass || '').trim();

        // 1. Secure Hash Authentication (Modern SHA-256 + Salt)
        if (state.adminPassHash && state.adminSalt) {
          const isValid = await verifyPassword(cleanPass, state.adminSalt, state.adminPassHash);
          if (isValid) {
            set({ 
              isAuthenticated: true,
              isOnboarded: true,
              adminUser: state.adminUser || (user ? user.trim() : 'admin'),
            });
            return true;
          }
          return false;
        }

        // 2. Migration path for legacy plaintext passwords
        if (state.legacyAdminPass && cleanPass === state.legacyAdminPass.trim()) {
          const salt = generateSalt();
          const passHash = await hashPassword(cleanPass, salt);
          set({
            isOnboarded: true,
            adminUser: state.adminUser || (user ? user.trim() : 'admin'),
            adminPassHash: passHash,
            adminSalt: salt,
            legacyAdminPass: undefined,
            isAuthenticated: true,
          });
          return true;
        }

        return false;
      },

      logout: () => set({ isAuthenticated: false }),

      setOnboarded: async (user: string, pass: string, recoveryPin?: string): Promise<void> => {
        const cleanUser = (user || 'admin').trim();
        const cleanPass = (pass || '').trim();
        const salt = generateSalt();
        const passHash = await hashPassword(cleanPass, salt);
        
        let pinHash = undefined;
        let pinSalt = undefined;
        if (recoveryPin && recoveryPin.trim()) {
          pinSalt = generateSalt();
          pinHash = await hashPassword(recoveryPin.trim(), pinSalt);
        }

        set({
          isOnboarded: true,
          adminUser: cleanUser,
          adminPassHash: passHash,
          adminSalt: salt,
          recoveryPinHash: pinHash,
          recoveryPinSalt: pinSalt,
          legacyAdminPass: undefined,
          isAuthenticated: true,
        });
      },

      changePassword: async (oldPass: string, newPass: string) => {
        const state = get();
        const cleanNewPass = (newPass || '').trim();
        const cleanOldPass = (oldPass || '').trim();

        if (!cleanNewPass || cleanNewPass.length < 4) {
          return { success: false, message: 'Password must be at least 4 characters long.' };
        }

        // Verify old password
        if (state.adminPassHash && state.adminSalt) {
          const isValid = await verifyPassword(cleanOldPass, state.adminSalt, state.adminPassHash);
          if (!isValid) {
            return { success: false, message: 'Current password is incorrect.' };
          }
        } else if (state.legacyAdminPass && cleanOldPass !== state.legacyAdminPass.trim()) {
          return { success: false, message: 'Current password is incorrect.' };
        }

        // Update to new salt and hash
        const salt = generateSalt();
        const passHash = await hashPassword(cleanNewPass, salt);
        set({
          adminPassHash: passHash,
          adminSalt: salt,
          legacyAdminPass: undefined,
        });

        return { success: true, message: 'Password updated successfully.' };
      },

      recoverPassword: async (newPass: string, verification, newUsername?: string) => {
        const state = get();
        const { inputEiin, inputContact, inputPin, challengeCode, supportOtp, institution } = verification;

        const cleanPass = (newPass || '').trim();
        if (!cleanPass || cleanPass.length < 4) {
          return { success: false, message: 'New password must be at least 4 characters long.' };
        }

        // Resolve target admin username to keep it consistent
        const resolvedUser = (
          newUsername?.trim() || 
          inputEiin?.trim() || 
          state.adminUser?.trim() || 
          institution?.eiin?.trim() || 
          'admin'
        );

        // Helper to commit new password
        const commitPassword = async () => {
          const salt = generateSalt();
          const passHash = await hashPassword(cleanPass, salt);
          set({
            isOnboarded: true,
            adminUser: resolvedUser,
            adminPassHash: passHash,
            adminSalt: salt,
            legacyAdminPass: undefined,
          });
        };

        // Strategy 1: Dynamic Challenge-Response Support OTP (From SoftDows Support)
        if (challengeCode && supportOtp) {
          const isOtpValid = await verifySupportOTP(challengeCode, supportOtp);
          if (isOtpValid) {
            await commitPassword();
            return { 
              success: true, 
              message: 'One-Time Support Master OTP verified! Password successfully reset.',
              username: resolvedUser
            };
          }
          return { success: false, message: 'Invalid or expired Support One-Time OTP.' };
        }

        // Strategy 2: Recovery PIN verification
        if (inputPin && state.recoveryPinHash && state.recoveryPinSalt) {
          const isPinVerified = await verifyPassword(inputPin.trim(), state.recoveryPinSalt, state.recoveryPinHash);
          if (isPinVerified) {
            await commitPassword();
            return { 
              success: true, 
              message: 'Security PIN verified! Password successfully reset.',
              username: resolvedUser
            };
          }
        }

        // Strategy 3: Official Institution EIIN + Contact (Phone or Email) Verification
        if (institution) {
          const cleanInputEiin = inputEiin ? inputEiin.trim().toLowerCase() : '';
          const cleanInstEiin = institution.eiin ? institution.eiin.trim().toLowerCase() : '';
          const cleanContact = inputContact ? inputContact.trim().replace(/[\s\-\+]/g, '') : '';
          const instMobile = institution.mobile ? institution.mobile.replace(/[\s\-\+]/g, '') : '';
          const instEmail = institution.email ? institution.email.trim().toLowerCase() : '';

          const isEiinMatched = Boolean(
            cleanInputEiin && (
              cleanInputEiin === cleanInstEiin || 
              cleanInputEiin === (state.adminUser || '').toLowerCase() ||
              cleanInputEiin === 'admin'
            )
          );
          
          let isContactMatched = false;
          if (cleanContact.length >= 4) {
            if (instMobile && (instMobile.includes(cleanContact) || cleanContact.includes(instMobile))) {
              isContactMatched = true;
            } else if (instEmail && instEmail.toLowerCase() === inputContact.trim().toLowerCase()) {
              isContactMatched = true;
            }
          }

          if (isEiinMatched && isContactMatched) {
            await commitPassword();
            return { 
              success: true, 
              message: 'Institution details verified! Password successfully reset.',
              username: resolvedUser
            };
          }
        }

        return { 
          success: false, 
          message: 'Verification failed. Input details do not match institution records.' 
        };
      },

      resetAuth: () => set({
        isOnboarded: false,
        adminUser: '',
        adminPassHash: '',
        adminSalt: '',
        recoveryPinHash: undefined,
        recoveryPinSalt: undefined,
        legacyAdminPass: undefined,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'biddalok-auth',
      storage: createJSONStorage(() => asyncNonBlockingStorage),
      partialize: (state) => ({
        isOnboarded: state.isOnboarded,
        adminUser: state.adminUser,
        adminPassHash: state.adminPassHash,
        adminSalt: state.adminSalt,
        recoveryPinHash: state.recoveryPinHash,
        recoveryPinSalt: state.recoveryPinSalt,
      }),
    }
  )
);
