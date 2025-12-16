# WmsSchedule - AI Coding Agent Instructions

## Project Overview
This is a **Warehouse Management System (WMS)** for 화인통상 (Fine Logistics) built as a vanilla JavaScript SPA with Firebase Realtime Database backend. The system manages container cargo (InCargo) with Korean UI/UX.

## Architecture

### File Structure
- [index.html](../index.html) - Main application with cargo management and weekly summary tabs
- [rawdata.html](../rawdata.html) - Raw data processing page for bulk imports
- [script.js](../script.js) - Core application logic (~3700 lines, monolithic)
- [firebase-config.js](../firebase-config.js) - Firebase initialization with global exports
- [style.css](../style.css) - All styling (~1500 lines)

### Data Flow
1. Firebase SDK loaded via ES Modules from CDN
2. Firebase functions exposed globally via `window.firebase*` (e.g., `window.firebaseDb`, `window.firebaseRef`)
3. Data loaded on page init into `allInCargoData` global array
4. Filtered view stored in `filteredData` global array
5. UI updates through direct DOM manipulation

### Firebase Database Structure
```
DeptName/WareHouseDept2/InCargo/{yyyy}/{mm}/{dd}/{recordKey}
```
- `recordKey` format: `{bl}{description}{count}_{container}` (version 3.0)
- All special characters stripped except Korean characters (AC00-D7A3 unicode range)

## Critical Patterns

### Global State Management
Key globals in [script.js](../script.js):
- `allInCargoData` - Complete dataset from Firebase
- `filteredData` - Currently displayed subset
- `currentSortColumn`, `currentSortDirection` - Table sort state

### Firebase Operations Pattern
Always use the global window references:
```javascript
const ref = window.firebaseRef(window.firebaseDb, 'path/to/data');
window.firebaseOnValue(ref, (snapshot) => { ... }, { onlyOnce: true });
await window.firebaseSet(ref, data);
```

### Date Handling
- Internal format: `yyyy-mm-dd` strings
- Firebase path format: `yyyy/mm/dd`
- Date filtering via `getDateRange(period)` and `isDateInRange(date, start, end)`
- Korean date periods: 'thisYear', 'thisMonth', 'thisWeek', 'today', 'tomorrow', 'nextWeek'

### Container Record Schema
```javascript
{
  date: "yyyy-mm-dd",
  consignee: string,      // 화주명 (shipper)
  container: string,      // Container number
  count: string,          // SEAL number
  bl: string,             // Bill of Lading
  description: string,    // 품명 (item name)
  qtyEa: number,
  qtyPlt: number,
  spec: string,           // 규격
  shape: string,          // 형태
  remark: string,
  working: string,
  structureVersion: "3.0"
}
```

## UI Conventions

### Tab System
- Main tabs: `화물관리` (cargo), `주간요약` (summary)
- Tab switching via `switchMainTab(tabName)` triggers data refresh

### Table Updates
After data changes, always:
1. Call `displayFilteredData()` to refresh table
2. Call `updateTableShipperSelect()` to update filter dropdown
3. Call `enforceFixedHeader()` for sticky header

### Modal Pattern
```javascript
addNewArrival();           // Opens modal
closeModal();              // Closes and resets form
submitNewArrival();        // Validates, uploads, refreshes UI
```

## Development Notes

### No Build System
- Direct ES Module imports from Firebase CDN
- No bundler, transpiler, or package manager
- Test by opening HTML files directly or via local server

### Console Logging Convention
Uses emoji prefixes for log categories:
- 🚀 Start/upload operations
- ✅ Success states
- ❌ Errors
- 📅 Date operations
- 📋 Table/data operations
- 🔍 Search/analysis operations

### Korean Language
- All UI text is Korean
- Field names maintain Korean-English mapping:
  - 화주명 = consignee/shipper
  - 품명 = description/itemName
  - 반입일 = date (import date)

### Form Validation
Required fields for new arrivals: `importDate`, `shipper`, `container`, `bl`, `itemName`
Duplicate container check via `checkDuplicateContainer()` before insert.
