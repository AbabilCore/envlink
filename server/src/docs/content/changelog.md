# Changelog

Track EnvLink's evolution through our complete release history. From major security improvements to minor bug fixes, stay updated with all changes.

## v2.5.2

_Released: October 16, 2026_

<details>
<summary><strong>Bug Fixes & UX Improvements</strong></summary>

- **Fixed CLI Error Handling:** Resolved issue where `install`, `info`, and `expire` commands threw unhandled exceptions with stack traces when missing or invalid EnvLink IDs were provided
- **Added Issue Reporting:** All error messages now include a helpful link to report bugs on GitHub
- **Improved Error Messages:** Replaced ugly stack traces with clean, user-friendly error messages

</details>

<details>
<summary><strong>Benefits</strong></summary>

- Better user experience with clear error messages
- Easy bug reporting directly from error output
- More robust error handling across CLI commands
- Cleaner terminal output without technical stack traces

</details>

## v2.5.1

_Released: October 14, 2026_

<details>
<summary><strong>Documentation & Infrastructure</strong></summary>

- **Unified Repository:** Server moved into main EnvLink repository at [`/server`](https://github.com/AbabilCore/envlink/tree/main/server) for easier maintenance and self-hosting
- **Self-Hosting Documentation:** Comprehensive self-hosting guide added with complete server setup instructions
- **API Documentation:** Simplified API endpoint documentation with clear descriptions

</details>

<details>
<summary><strong>Benefits</strong></summary>

- Self-hosting is now fully documented and accessible with server included in main repo

</details>

## v2.5.0

_Released: October 7, 2026_

<details>
<summary><strong>Bug Fixes</strong></summary>

- **Fixed Password Update Encryption Bug:** Resolved critical issue where updating only the password left data encrypted with the old password, causing decryption failures on subsequent installs
- When updating password without changing files, the system now properly re-encrypts stored data with the new password
- Improved error handling for password update operations

</details>

<details>
<summary><strong>Technical Details</strong></summary>

- Added automatic data re-encryption during password-only updates
- System now fetches current encrypted data, decrypts with old password, and re-encrypts with new password
- Ensures data remains accessible after password changes

</details>

<details>
<summary><strong>Benefits</strong></summary>

- Password-protected EnvLinks can now be updated safely without breaking subsequent installs
- Better data consistency between password and encryption key
- Enhanced reliability for password management workflows

</details>

## v2.4.5

_Released: October 7, 2026_

<details>
<summary><strong>Code Quality & Refactoring</strong></summary>

- **Removed Unused Types:** Eliminated `ApiErrorResponse` interface that was no longer being used
- **Simplified Error Handling:** Streamlined API client error handling logic without functional changes
- **Code Cleanup:** Removed unnecessary type abstractions to improve maintainability

</details>

<details>
<summary><strong>Technical Improvements</strong></summary>

- Cleaner error handling implementation in API client
- Reduced code complexity by removing unused interfaces
- Better code maintainability through simplified architecture
- No functional changes - internal refactoring only

</details>

<details>
<summary><strong>Benefits</strong></summary>

- Improved code readability and maintainability
- Reduced technical debt through cleanup of unused code
- Simplified codebase without affecting user functionality
- Better developer experience for future contributions

</details>

## v2.4.4

_Released: October 6, 2026_

<details>
<summary><strong>Bug Fixes</strong></summary>

- **Fixed Reference Updates:** Resolved issue where `--ref` option in update command was not being recognized as a valid update option
- **Improved Error Handling:** Enhanced network error detection to show user-friendly messages for connection issues while preserving server error messages

</details>

<details>
<summary><strong>Technical Improvements</strong></summary>

- Updated validation logic to include reference updates alongside other update options
- Better distinction between network failures and HTTP errors in API client
- More informative error messages for update command usage

</details>

<details>
<summary><strong>Benefits</strong></summary>

- Reference labels can now be properly updated using `envlink update <id> --ref <new-reference> --current-pass <password>`
- Clearer error messages help users understand available update options
- Better user experience with appropriate error messaging

</details>

## v2.4.3

_Released: October 6, 2026_

<details>
<summary><strong>Configuration & Error Handling</strong></summary>

- **Refactored Environment Configuration:** Introduced centralized `ENV` object with `IS_DEV` property and dynamic `API_URL` getter
- **Enhanced Error Handling:** Environment-aware error messages - detailed errors in development, user-friendly generic messages in production
- **Improved API Client:** Updated to use new configuration structure for better maintainability

</details>

<details>
<summary><strong>Technical Improvements</strong></summary>

- Better separation between development and production error messaging
- Cleaner configuration management with getter methods
- Improved code maintainability and consistency

</details>

<details>
<summary><strong>Benefits</strong></summary>

- Better user experience with appropriate error messages per environment
- Enhanced developer experience with detailed development errors
- More maintainable configuration structure

</details>

## v2.4.1

_Released: October 4, 2026_

<details>
<summary><strong>Code Quality & Architecture</strong></summary>

- **Refactored Crypto Constants:** Consolidated `PBKDF2_CONFIG` and `CRYPTO_CONFIG` into unified configuration
- **Simplified Module Structure:** Removed redundant shared crypto module and consolidated functionality
- **Enhanced Code Consistency:** Aligned crypto implementations between CLI and server codebases
- **Improved Error Handling:** Streamlined encryption/decryption error messages
- **Better Code Organization:** Moved interfaces and utility functions to appropriate modules

</details>

<details>
<summary><strong>Technical Improvements</strong></summary>

- Unified crypto configuration across client and server
- Simplified `deriveKey` function implementation using `util.promisify`
- Eliminated duplicate code patterns
- Enhanced maintainability through better module organization
- Consistent naming conventions across projects

</details>

<details>
<summary><strong>Benefits</strong></summary>

- Cleaner, more maintainable codebase
- Reduced complexity in crypto module management
- Better separation of concerns
- Consistent API patterns between CLI and server

</details>

## v2.4.0

_Released: October 2, 2026_

<details>
<summary><strong>UX Improvement</strong></summary>

- **Breaking Change:** Default behavior now creates optional-password EnvLinks (no password required)
- Use `--pass` flag to create password-protected EnvLinks
- `--pass` without value prompts for password interactively
- Maintains backward compatibility with `--optional-pass` flag (now deprecated)
- Updated commands documentation to reflect new defaults

</details>

<details>
<summary><strong>Benefits</strong></summary>

- Simpler default experience for quick file sharing
- Zero-knowledge security by default
- More intuitive command structure
- Better alignment with modern CLI patterns

</details>

## v2.3.0

_Released: October 2, 2026_

<details>
<summary><strong>Major Security Enhancement</strong></summary>

- **Ultra-Clean Zero-Knowledge Architecture:** Optional-password EnvLinks now provide complete zero-knowledge security
- Server can no longer decrypt any user data for both EnvLink types
- Access keys never leave client machines - embedded in extended IDs only
- **Note:** This change makes previous tutorials about optional-password security outdated

</details>

<details>
<summary><strong>ID Format Changes</strong></summary>

- **Breaking Change:** Optional-password IDs now use concatenated format (35 chars total)
- Old format: `el_baseId_accessKey`
- New format: `el_baseIdaccessKey`

</details>

<details>
<summary><strong>Documentation & Terminology</strong></summary>

- Added dedicated changelog page
- Updated documentation theme consistency
- Clarified access keys are for decryption, not authentication
- Enhanced security model explanations
- Updated terminology consistency
- Improved documentation accuracy

</details>

<details>
<summary><strong>Breaking Changes</strong></summary>

- Optional-password EnvLinks created with previous versions will not work
- Server API no longer accepts accessKey in request payload
- CLI automatically uses new format for all new optional-password EnvLinks

</details>

## v2.2.4

_Released: October 1, 2026_

<details>
<summary><strong>Performance & Reliability</strong></summary>

- Improved error handling for invalid password proofs
- Enhanced CLI test suite with 100% success rate
- Optimized server authentication middleware
- Enhanced file selection UI for install command

</details>

## v2.2.3

_Released: September 30, 2026_

<details>
<summary><strong>Bug Fixes</strong></summary>

- Fixed optional-password creation with reference validation
- Improved error messages for invalid EnvLink IDs
- Enhanced file selection UI for install command

</details>

<details>
<summary><strong>Documentation</strong></summary>

- Updated FAQ with security comparison table
- Added workflow examples in commands documentation

</details>

## v2.2.2

_Released: September 30, 2026_

<details>
<summary><strong>Bug Fixes</strong></summary>

- Resolved CLI installation issues on certain Node.js versions
- Fixed file path handling on Windows systems
- Improved error handling for network connectivity issues

</details>

## v2.0.4

_Released: September 27, 2026_

<details>
<summary><strong>Bug Fixes</strong></summary>

- Fixed compatibility issues with latest Node.js LTS versions
- Improved CLI startup performance
- Resolved dependency conflicts in certain environments

</details>

## v1.0.0

_Released: September 24, 2026_

<details>
<summary><strong>Initial Stable Release</strong></summary>

- **Core Features:** Create, install, update, and expire password-protected EnvLinks
- **Security:** PBKDF2-based zero-knowledge authentication
- **Encryption:** AES-256-GCM encryption for all data
- **Expiration:** Flexible expiration options from minutes to never
- **Multi-file Support:** Handle multiple environment files in single EnvLink

</details>

## v0.0.1

_Released: September 24, 2026_

<details>
<summary><strong>Package Reservation</strong></summary>

- Initial npm package registration

</details>

## Version History

For complete version history including security patches and detailed technical changes:

```bash
npm view envlink versions --json
```

View detailed commit history and technical changes on our [GitHub repository](https://github.com/AbabilCore/envlink).

## Stay Updated

Keep your EnvLink CLI up to date for the latest security improvements and features.

```bash
# Check for updates
envlink version-check

# Update to latest version
npm install -g envlink@latest
```
