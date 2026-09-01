## [1.0.10](https://github.com/WYRE-AI/node-datto-rmm/compare/v1.0.9...v1.0.10) (2026-09-01)


### Bug Fixes

* surface the real Datto error body in thrown error messages ([#66](https://github.com/WYRE-AI/node-datto-rmm/issues/66)) ([77df1ac](https://github.com/WYRE-AI/node-datto-rmm/commit/77df1acc556e79f6a948cce6ef526b5a1ce67edc)), closes [connectwise-automate-mcp#54](https://github.com/connectwise-automate-mcp/issues/54)

## [1.0.9](https://github.com/WYRE-AI/node-datto-rmm/compare/v1.0.8...v1.0.9) (2026-08-25)


### Bug Fixes

* **deps:** ignore undici (nested-unreachable) and esbuild (peer-capped) in dependabot ([#63](https://github.com/WYRE-AI/node-datto-rmm/issues/63)) ([399060e](https://github.com/WYRE-AI/node-datto-rmm/commit/399060e0e6223123591b71a6edc0a6bf4eb38baf))

## [1.0.8](https://github.com/WYRE-AI/node-datto-rmm/compare/v1.0.7...v1.0.8) (2026-08-25)


### Bug Fixes

* migrate to WYRE-AI org (npm scope, ghcr namespace, registry) ([#62](https://github.com/WYRE-AI/node-datto-rmm/issues/62)) ([9a4cdde](https://github.com/WYRE-AI/node-datto-rmm/commit/9a4cdde9b70914a90b39b337990caa2dd7a634c4))

## [1.0.7](https://github.com/WYRE-AI/node-datto-rmm/compare/v1.0.6...v1.0.7) (2026-08-13)


### Bug Fixes

* **deps:** pin typescript back to ^5.9.3, main is broken on 7.0.2 (again) ([#57](https://github.com/WYRE-AI/node-datto-rmm/issues/57)) ([1d0443e](https://github.com/WYRE-AI/node-datto-rmm/commit/1d0443ea61f8448631101298dae7815cabf53205)), closes [#54](https://github.com/WYRE-AI/node-datto-rmm/issues/54) [#49](https://github.com/WYRE-AI/node-datto-rmm/issues/49) [#43](https://github.com/WYRE-AI/node-datto-rmm/issues/43) [#49](https://github.com/WYRE-AI/node-datto-rmm/issues/49) [#49](https://github.com/WYRE-AI/node-datto-rmm/issues/49)

## [1.0.6](https://github.com/WYRE-AI/node-datto-rmm/compare/v1.0.5...v1.0.6) (2026-07-21)


### Bug Fixes

* **deps:** pin typescript back to ^5.9.3, main is broken on 7.0.2 ([#49](https://github.com/WYRE-AI/node-datto-rmm/issues/49)) ([4ab6573](https://github.com/WYRE-AI/node-datto-rmm/commit/4ab65736836121665fb78302816d666b81879acc)), closes [#46](https://github.com/WYRE-AI/node-datto-rmm/issues/46) [45/#46](https://github.com/WYRE-AI/node-datto-rmm/issues/46) [#46](https://github.com/WYRE-AI/node-datto-rmm/issues/46) [#43](https://github.com/WYRE-AI/node-datto-rmm/issues/43)

## [1.0.5](https://github.com/WYRE-AI/node-datto-rmm/compare/v1.0.4...v1.0.5) (2026-07-18)


### Bug Fixes

* read HTTP response bodies exactly once ([#44](https://github.com/WYRE-AI/node-datto-rmm/issues/44)) ([d22d392](https://github.com/WYRE-AI/node-datto-rmm/commit/d22d392b6cc48b3c5269eaa6159f89f66a956235))

## [1.0.4](https://github.com/WYRE-AI/node-datto-rmm/compare/v1.0.3...v1.0.4) (2026-06-08)


### Bug Fixes

* **security:** bump vitest + @vitest/coverage-v8 1.x -> 3.2.6 ([#25](https://github.com/WYRE-AI/node-datto-rmm/issues/25)) ([b2a431c](https://github.com/WYRE-AI/node-datto-rmm/commit/b2a431c0642c2ad1403e5f720914ed729480b8fe))

## [1.0.3](https://github.com/WYRE-AI/node-datto-rmm/compare/v1.0.2...v1.0.3) (2026-05-20)


### Bug Fixes

* repair broken package exports and standardize on Node 22 ([#2](https://github.com/WYRE-AI/node-datto-rmm/issues/2)) ([6c10201](https://github.com/WYRE-AI/node-datto-rmm/commit/6c10201da1a5afc03994aac0f57666928d901df3))

## [1.0.2](https://github.com/WYRE-AI/node-datto-rmm/compare/v1.0.1...v1.0.2) (2026-04-06)


### Bug Fixes

* defensively unwrap API responses to handle direct returns ([62fa082](https://github.com/WYRE-AI/node-datto-rmm/commit/62fa082dc8ccaaea0cb4e6fcacdc36c4c3353192)), closes [wyre-technology/msp-claude-plugins#43](https://github.com/wyre-technology/msp-claude-plugins/issues/43)

## [1.0.1](https://github.com/WYRE-AI/node-datto-rmm/compare/v1.0.0...v1.0.1) (2026-03-02)


### Bug Fixes

* require Node 22+ (semantic-release@25 compatibility) ([0884c17](https://github.com/WYRE-AI/node-datto-rmm/commit/0884c17016342b041fc0165e9a29bc1efe18e553))
* require Node 22+ (semantic-release@25 compatibility) ([f9508a5](https://github.com/WYRE-AI/node-datto-rmm/commit/f9508a5f592236f4495f999e06738cd62f0f6815))

# 1.0.0 (2026-02-05)


### Bug Fixes

* Add semantic-release plugins as devDependencies ([f2d1138](https://github.com/asachs01/node-datto-rmm/commit/f2d1138f039524d12a38be783654b8b5cfe43c81))


### Features

* Initial project structure and core implementation ([6a200c8](https://github.com/asachs01/node-datto-rmm/commit/6a200c8bee492599b7d43ab6fc45067d33560077))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-04

### Added

- Initial release of node-datto-rmm library
- Complete Datto RMM API v2 coverage (50+ endpoints)
- OAuth 2.0 token lifecycle management with auto-refresh
- Platform-aware configuration (6 platforms: Pinotage, Merlot, Concord, Vidal, Zinfandel, Syrah)
- Automatic pagination with nextPageUrl following
- Rate limiting with IP block protection (600 req/60s)
- All 25+ typed alert context discriminated unions
- Configurable timestamp handling (Date, Unix ms, ISO string)

#### Resources Implemented

- **Account**: get, users, sites, devices, components, alertsOpen, alertsResolved, variables CRUD, dnetSiteMappings
- **Sites**: create, get, update, devices, networkInterfaces, settings, filters, alerts, variables CRUD, proxy settings
- **Devices**: get (by UID/ID/MAC), alertsOpen, alertsResolved, move, createQuickJob, updateWarranty, setUdf
- **Alerts**: get, resolve, mute (deprecated), unmute (deprecated)
- **Audit**: device, deviceSoftware, deviceByMac, esxiHost, printer
- **Jobs**: get, results, stdout, stderr, components
- **Filters**: defaults, custom
- **System**: status, requestRate, pagination
- **Users**: resetApiKeys
- **ActivityLogs**: list

#### Error Handling

- DattoRmmError (base class)
- DattoRmmAuthenticationError (400, 401)
- DattoRmmNotFoundError (404)
- DattoRmmRateLimitError (429)
- DattoRmmIpBlockedError (403 rate limit escalation)
- DattoRmmForbiddenError (403 permission)
- DattoRmmServerError (500+)

#### Development

- Package.json with ESM and CJS dual exports
- TypeScript configuration with strict mode
- Vitest configuration with MSW for mocking
- ESLint configuration for TypeScript
- Comprehensive test suite (127 tests)
- 80%+ code coverage (excluding type definitions)

[0.1.0]: https://github.com/asachs01/node-datto-rmm/releases/tag/v0.1.0
