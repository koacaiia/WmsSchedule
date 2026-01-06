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

## Advanced Features

### Weekly Summary Tab (`loadWeeklySummaryData`)
- Loads 7-day data range and groups by day (Mon-Fri visible, Mon is week start)
- **Key functions**: `generateWeeklySummaryReportWithData()`, `generateWeeklyGridData()`, `populateDayBoxWithItems()`
- **Drag-and-drop**: Container items can be dragged between days; updates Firebase + refreshes summary
- **Shipper filtering**: Each day can show different shippers via dropdown filter
- **Day boxes**: Display container groups with first product name + "외 N개" if multiple; shows spec (20FT/40FT/LCL) and shape (Pallet/Bulk)
- **Long-press on Summary tab** (1+ sec) loads next week data without switching tabs (`window.isLongPressingTab` flag)

### Report Mode & List Selection
- **Report Mode** (`window.reportModeActive`): Rows turn gray, clicking selects (Ctrl+click for multi-select), enabled via "보고서 모드" button
- **List Select Mode** (`window.listSelectModeActive`): Same UI as report mode, different purpose (selection without generation)
- Both modes disable "신규입고" button and show "선택 완료" when done
- Prevent nested activation: check mode flags before opening modal

### Database Bulk Operations
- **`getInCargoLeafData(startDate, endDate)`**: Returns leaf nodes from Firebase with proper date filtering; recursively finds actual data (not just folders)
- **`deleteDataByDateRange()`**: Modal for date selection → deletes entire path hierarchies; shows progress bar with count
- **`restructureDatabaseByConsignee()`**: Fixes invalid paths (non-yyyy/mm/dd structures) → moves to new consignee-based hierarchy
- All bulk ops show progress UI, handle errors gracefully, and prompt for data reload after completion

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
- 🟣/🟡/🟢/🔵 Debug colors for specific workflows (summary tab long-press, weekly grid generation)

### Korean Language
- All UI text is Korean
- Field names maintain Korean-English mapping:
  - 화주명 = consignee/shipper
  - 품명 = description/itemName
  - 반입일 = date (import date)

### Form Validation
Required fields for new arrivals: `importDate`, `shipper`, `container`, `bl`, `itemName`
Duplicate container check via `checkDuplicateContainer()` before insert.
Shipper field toggles between select dropdown and text input via `#shipperToggleBtn`

### Important Patterns to Preserve
- **Spec normalization**: Always convert to uppercase; "40FT", "20FT", "LCL" are canonical values
- **Consignee extraction**: Extract shipper name from parentheses: `shipper.match(/\(([^)]+)\)/)` to get short name
- **Container grouping**: Rows are visually grouped by container; first row has `group-first`, last has `group-last` class with border
- **Merged cells in export**: Excel export handles rowspan by storing values in `mergedCellValues` map
- **FirebaseRef paths**: Always include `DeptName/WareHouseDept2/InCargo/` prefix; paths with yyyy/mm/dd format

## Critical Gotchas

### Data Loading & Refresh Timing
- `loadInCargoDataOnPageLoad()` waits 2 seconds for Firebase init; if called immediately after page load, may fail
- After any write operation (create/update/delete), **always** call `loadInCargoDataOnPageLoad()` to sync UI with database
- `displayFilteredData()` must be called AFTER data update to re-render table rows

### Weekly Summary State
- `window.daySummaryData` object stores computed summaries for each day (accessed on hover)
- `window.weeklyTotalData` stores summary HTML for total box; reset when new week loaded
- `generateWeeklySummaryReportWithData()` expects pre-filtered data array, NOT entire `allInCargoData`

### Date Parsing Edge Cases
- All internal dates are `yyyy-mm-dd` strings; avoid Date object comparisons
- `new Date(dateStr)` without 'T' may use local timezone; use `new Date(dateStr + 'T00:00:00')` for consistency
- Firebase path dates are always zero-padded (01, 02, not 1, 2)

### Modal & Form Management
- `currentModalRecordKey` global tracks which record is being edited (used for delete operations)
- If editing existing record, "삭제" button becomes visible; set to `display: none` when closing modal
- `closeModal()` resets form and reinitializes shipper select/input toggle; must be called to clean up
- Don't open modal during `window.listSelectModeActive` or `window.reportModeActive` - check flags first

### Drag-and-Drop Container Groups
- Single container can appear in multiple rows if it has different products
- `findContainerGroupInFirebase()` returns ALL records with same `container` field
- Moving a container moves the **entire group** atomically (delete old path, upload to new date path)
