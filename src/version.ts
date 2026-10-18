/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import packageJson from '../package.json';

/**
 * Canonical Single Source of Truth for Application Versioning & Identity.
 * Follows Semantic Versioning (SemVer 2.0.0).
 */
export const APP_VERSION = packageJson.version; // e.g. "1.1.0"
export const APP_CANONICAL_NAME = 'বিদ্যালোক';
export const APP_CANONICAL_NAME_EN = 'Biddalok';
export const APP_TECHNICAL_NAME = 'biddalok';
export const APP_ID = 'com.softdows.biddalok';
export const APP_AUTHOR = 'SoftDows (Developed by Ansar Ahammad)';
export const APP_WEBSITE = 'https://softdows.com/biddalok';
export const APP_CONTACT_PHONE = '01813011052';
export const APP_CONTACT_EMAIL = 'ahammadansar75@gmail.com';

/**
 * Canonical Schema Versioning for Migration & Compatibility Gates
 */
export const CURRENT_SCHEMA_VERSION = 6;
export const MIN_COMPATIBLE_SCHEMA_VERSION = 4;
export const MIN_SUPPORTED_APP_VERSION = '1.0.0';

/**
 * Migration-safe Canonical App-Owned File & Directory Paths (Windows/Electron)
 */
export const CANONICAL_APP_DATA_DIR = 'Biddalok by SoftDows';
export const CANONICAL_UNINSTALL_REG_KEY = 'Software\\Biddalok by SoftDows';
