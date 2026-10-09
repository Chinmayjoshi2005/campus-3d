# Campus Guide 3D — Data Analysis Report

**Source:** `data/Faculty data.json` (exported from Smartracker SQLite)  
**Companion:** `data/faculty-profiles.json` (22 faculty profile records)

---

## Dataset Summary

| Metric | Value |
|--------|-------|
| Faculty members | 22 |
| Timetable entries | 242 |
| Unique rooms (timetable) | 24 |
| Faculty with cabin/office | 9 |
| Faculty with department | 9 |
| Days covered | Mon–Sat (primary) |

---

## Faculty data.json Schema (Legacy Smartracker Format)

Each row is a **timetable slot**, not a faculty profile:

```json
{
  "faculty": "Prof. Kamlesh Patidar",
  "day": "Monday",
  "start_time": "09:40",
  "end_time": "10:35",
  "room": "150",
  "subject": "JAVA(L)",
  "course": "",
  "year": "",
  "semester": "",
  "branch": ""
}
```

### Field Analysis

| Field | Type | Completeness | Notes |
|-------|------|--------------|-------|
| `faculty` | string | 100% | Display name, used as join key |
| `day` | enum string | 100% | Monday–Saturday |
| `start_time` | HH:mm | 100% | 24h format after normalization |
| `end_time` | HH:mm | 100% | |
| `room` | string | 100% | Mixed formats — see below |
| `subject` | string | ~95% | Lab codes like `ITS(L)`, `JAVA(L)` |
| `course` | string | ~5% | Mostly empty in live data |
| `year` | string | ~5% | Mostly empty |
| `semester` | string | ~5% | Mostly empty |
| `branch` | string | ~5% | Mostly empty |

---

## Room Number Formats (Data Quality Issue)

Timetable rooms use **inconsistent naming** vs 3D model bindings:

| Format | Examples | Count (top) | Maps to GLB? |
|--------|----------|-------------|--------------|
| Numeric | `150`, `221`, `213`, `226` | High | Partial — needs alias table |
| Cabin codes | `C-205`, `C-213` | In profiles only | Yes — `CABIN_TO_MESH` |
| DIP codes | `DIP-I ME`, `DIP-VI` | Medium | No — diploma wing, not in GLB |
| Lab codes | `214` (lab suffix in subject) | Medium | Partial |

### Top Timetable Rooms

| Room | Entries | Likely Floor |
|------|---------|--------------|
| 150 | 23 | 1st |
| 221 | 19 | 2nd |
| 222 | 19 | 2nd |
| 213 | 16 | 1st |
| 226 | 16 | 1st |
| 223 | 16 | 2nd |
| DIP-VI | 15 | Annex |
| DIP-IV | 13 | Annex |

**Action required:** Build `data/room-aliases.json` mapping timetable room codes → canonical `roomNumber` + `meshName` + `position`.

---

## Faculty Profiles (faculty-profiles.json)

### Complete Records (9 faculty)

| Name | Department | Cabin | Status |
|------|------------|-------|--------|
| Prof. Kamlesh Patidar | computer science | C-205 | HOD CSE |
| Prof. Sarthak Mahajan | computer science | C-206 | |
| Prof. Hitesh Soni | computer science | C-226 | |
| Prof. Suryakant Patidar | computer science | C-206 | |
| Prof. Yunus Khan | CSE-AIML | C-232 | HOD AIML |
| Shiwani Yadav | computer science | C-213 | |
| Swati Yadav | computer science | C-213 | |
| Shubhi Gupta | computer science | C-213 | |
| Sudhir Patidar | computer science | C-205 | |

### Incomplete Records (13 faculty)

Have timetable entries but **no cabin, department, or 3D position**:
Abhay Mundra, Dinkal Bhawasar, Hariom Patidar, Ishika Patidar, Manisha Sendankar, Nandni Gangle, Devendra Kaushal, Vijay Yadav, Ranu Soni, Sachin Mahajan, Sakshi Patidar, Shradha Karma, Vidhi Patidar

**Resolution:** Derive default position from most frequent timetable room per faculty.

---

## Target Platform Schema (MongoDB)

Faculty records in production require:

```json
{
  "id": "faculty_039",
  "name": "Prof. Kamlesh Patidar",
  "department": "Computer Science",
  "room": "C-205",
  "floor": 1,
  "position": { "x": 8, "y": 3, "z": -4 }
}
```

### Import Pipeline

```
Faculty data.json (timetable rows)
        +
faculty-profiles.json (profiles)
        +
room-aliases.json (room → 3D coords)
        ↓
database/scripts/import-seed.ts
        ↓
MongoDB: faculty + timetables collections
```

---

## Department Inference

From profile data:

| Department | Faculty Count |
|------------|---------------|
| computer science | 8 |
| CSE-AIML | 1 |
| (unknown) | 13 |

Recommended canonical departments in `data/departments.json`:
- Computer Science & Engineering (CSE)
- CSE — AIML
- *(Expand after admin data entry for other branches)*

---

## Timetable → Live Status Engine

Status can be computed at runtime:

```
IF now ∈ [start_time, end_time] on today's day_of_week
  → status = "in_class", location = room
ELSE IF faculty has timetable today
  → status = "available"
ELSE
  → status = "offline"
```

This replaces Smartracker's Django `computed_status` property.

---

## Data Gaps Before Implementation

| Gap | Priority | Owner |
|-----|----------|-------|
| 13 faculty missing cabin/position | P0 | Admin coordinate tool |
| Room alias table (150→?, 221→?) | P0 | Data + 3D team |
| DIP wing rooms not in GLB | P1 | Blender model update |
| Character GLB not exported | P1 | Blender pipeline |
| Navigation graph empty in DB | P0 | Admin node placement |
| course/year/semester empty | P2 | Optional enrichment |

---

## Files in `data/`

| File | Records | Purpose |
|------|---------|---------|
| `Faculty data.json` | 242 | Original timetable import source |
| `faculty-profiles.json` | 22 | Faculty profile records from Smartracker |
| `faculty.json` | 9 | Normalized faculty with 3D positions |
| `faculty-raw-export.json` | 22 | Raw SQLite export (backup) |
| `rooms.json` | 15 | Room catalog with mesh bindings |
| `departments.json` | 6 | Department catalog |
| `navigation-nodes.json` | 9 | Indoor nav graph nodes |
| `navigation-edges.json` | 8 | Nav graph edges |
