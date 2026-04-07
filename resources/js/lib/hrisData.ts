import type {
    ApplicantRecord,
    AttendanceLogEntry,
    AttendanceRecord,
    AttendanceStatus,
    ArchiveEntry,
    DepartmentOption,
    DocumentRegistryEntry,
    DocumentCategory,
    DocumentStatus,
    DocumentType,
    EmployeeRecordFileSummary,
    EmployeeAttendanceHistoryEntry,
    EmployeeDocument,
    EmployeeOption,
    EmployeeRecordProfile,
    EmployeeStatus,
    FormManagementEntry,
    LogMethod,
    PrintableForm,
    RawLogEntry,
    RawLogStatus,
    ShiftDefinition,
} from '@/types';

type DepartmentConfig = DepartmentOption & {
    positions: string[];
    workLocation: string;
    supervisor: string;
};

type DocumentTemplate = {
    category: DocumentCategory;
    documentName: string;
    type: DocumentType;
};

const attendanceDate = '2026-04-07';

const departmentConfigs: DepartmentConfig[] = [
    {
        id: 'hr',
        name: 'Human Resources',
        positions: ['HR Officer II', 'Recruitment Analyst', 'Administrative Aide VI'],
        workLocation: 'HR Service Center, 4F Main Building',
        supervisor: 'Maricel S. Villanueva',
    },
    {
        id: 'finance',
        name: 'Finance',
        positions: ['Budget Analyst II', 'Payroll Officer I', 'Accounting Clerk IV'],
        workLocation: 'Finance Division, 2F Annex Building',
        supervisor: 'Ramon P. Javier',
    },
    {
        id: 'operations',
        name: 'Operations',
        positions: ['Operations Officer III', 'Program Coordinator II', 'Monitoring Officer I'],
        workLocation: 'Operations Command Room, 3F East Wing',
        supervisor: 'Leah M. Santos',
    },
    {
        id: 'it',
        name: 'Information Technology',
        positions: ['Systems Developer II', 'IT Officer I', 'Data Management Specialist'],
        workLocation: 'Digital Services Hub, 5F Main Building',
        supervisor: 'Jan Michael C. Torres',
    },
    {
        id: 'admin',
        name: 'General Services',
        positions: ['Administrative Officer IV', 'Records Officer II', 'Property Custodian'],
        workLocation: 'Admin and Records Unit, Ground Floor',
        supervisor: 'Rosalinda A. Mercado',
    },
    {
        id: 'field',
        name: 'Field Services',
        positions: ['Field Supervisor', 'Community Affairs Officer', 'Monitoring Assistant'],
        workLocation: 'North Cluster Satellite Office',
        supervisor: 'Enrico B. Velasco',
    },
];

const employeeNames = [
    'Alyssa Mae Dela Cruz',
    'John Carlo Reyes',
    'Patricia Anne Mendoza',
    'Mark Joseph Santos',
    'Camille Joy Bautista',
    'Rafael Luis Navarro',
    'Bianca Therese Garcia',
    'Paolo Miguel Ramos',
    'Jasmine Claire Flores',
    'Kevin Adrian Castillo',
    'Mae Lorraine Villanueva',
    'Joshua Daniel Aquino',
    'Angela Mae Torres',
    'Carl Vincent Domingo',
    'Sophia Nicole Perez',
    'Jerome Francis Valdez',
    'Andrea Mae Lim',
    'Nathan Paul Cabrera',
    'Kristine Joy Fajardo',
    'Miguel Antonio Herrera',
    'Hazel Anne Ignacio',
    'Tristan Louie Robles',
    'Danica Rose Alonzo',
    'Vincent Earl Salazar',
    'Maria Isabel Evangelista',
    'Carlo Benjamin Padilla',
    'Rica Mae Soriano',
    'Lorenzo David Pineda',
    'Arianne Kate Gutierrez',
    'Francis Xavier Manalo',
    'Samantha Joy de Leon',
    'Paulo Emilio Natividad',
    'Clarisse Anne Ocampo',
    'Joseph Martin Relova',
    'Nicole Grace Fernandez',
    'Alvin Theodore Macapagal',
    'Tricia Mae Yumul',
    'Marco Paolo Galang',
    'Jeanette Marie Tolentino',
    'Christian James Samonte',
    'Shiela Mae Canlas',
    'Aaron Miguel Pascual',
    'Monique Therese Caballero',
    'Dominic Karl Serrano',
    'Vanessa Louise Rosales',
    'Katherine Joy Umali',
    'Noel Patrick Javier',
    'Rina Mae Magtoto',
    'Gabriel Anton Tecson',
    'Patricia Joy Malabanan',
    'Harold Brian Nicolas',
    'Frances Mae Arceo',
    'Louie Mark Estrella',
];

const documentTemplates: DocumentTemplate[] = [
    {
        category: 'Personal',
        documentName: 'Personal Data Sheet',
        type: 'CS Form 212',
    },
    {
        category: 'Personal',
        documentName: 'Birth Certificate',
        type: 'Birth Certificate',
    },
    {
        category: 'Appointment',
        documentName: 'Appointment Paper',
        type: 'Appointment Paper',
    },
    {
        category: 'Appointment',
        documentName: 'Oath of Office',
        type: 'CS Form 33',
    },
    {
        category: 'Medical',
        documentName: 'Annual Medical Certificate',
        type: 'Medical Certificate',
    },
    {
        category: 'Clearances',
        documentName: 'NBI Clearance',
        type: 'NBI Clearance',
    },
    {
        category: 'Clearances',
        documentName: 'SALN',
        type: 'SALN',
    },
    {
        category: 'Performance',
        documentName: 'Performance Rating 2025',
        type: 'Performance Rating',
    },
    {
        category: 'Performance',
        documentName: 'Training Certificates',
        type: 'Training Certificate',
    },
    {
        category: 'Disciplinary',
        documentName: 'Notice of Explanation',
        type: 'Memorandum Receipt',
    },
    {
        category: 'Others',
        documentName: 'Service Record',
        type: 'Service Record',
    },
    {
        category: 'Others',
        documentName: 'Transcript of Records',
        type: 'Transcript of Records',
    },
];

const employmentStatuses = ['Permanent', 'Permanent', 'Permanent', 'Contractual', 'Probationary'] as const;
const civilStatuses = ['Single', 'Married', 'Single', 'Married', 'Separated'] as const;
const nationalities = ['Filipino'] as const;
const employeeStatuses: EmployeeStatus[] = ['On Site', 'On Site', 'On Site', 'Field Duty'];

function createEmployeeCode(index: number): string {
    return `HR-${String(index + 1).padStart(4, '0')}`;
}

function slugifyName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/(^\.|\.$)/g, '');
}

function formatDate(year: number, month: number, day: number): string {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function timeWithOffset(time: string): string {
    return `${attendanceDate}T${time}:00+08:00`;
}

function formatTimeFromMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function differenceLabel(startMinutes: number, endMinutes: number): string {
    const totalMinutes = endMinutes - startMinutes - 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

function statusForIndex(index: number): AttendanceStatus {
    if (index >= 50) {
        return 'absent';
    }

    if (index >= 45) {
        return 'late';
    }

    return 'present';
}

function rawStatusForLog(status: AttendanceStatus, order: number, index: number): RawLogStatus {
    if (status === 'late' && order === 0) {
        return 'Adjusted';
    }

    if (index % 14 === 0 && order === 3) {
        return 'Missing Pair';
    }

    return 'Verified';
}

function methodForEmployee(employee: EmployeeOption, order: number): LogMethod {
    if (employee.departmentId === 'field' || employee.status === 'Field Duty') {
        return order < 2 ? 'GPS' : 'Biometric';
    }

    return order % 2 === 0 ? 'Biometric' : 'GPS';
}

export const departments: DepartmentOption[] = departmentConfigs.map(({ id, name }) => ({
    id,
    name,
}));

export const documentCategories: DocumentCategory[] = [
    'Personal',
    'Appointment',
    'Medical',
    'Clearances',
    'Performance',
    'Disciplinary',
    'Others',
];

export const documentTypeOptions: DocumentType[] = [
    'CS Form 212',
    'CS Form 33',
    'Medical Certificate',
    'NBI Clearance',
    'Service Record',
    'Appointment Paper',
    'Performance Rating',
    'Memorandum Receipt',
    'Training Certificate',
    'Birth Certificate',
    'Marriage Certificate',
    'SALN',
    'Diploma',
    'Transcript of Records',
];

export const shifts: ShiftDefinition[] = [
    {
        id: 'shift-regular',
        name: 'Regular Day Shift',
        timeIn: '08:00',
        timeOut: '17:00',
        breakDuration: '1 hour',
    },
    {
        id: 'shift-flex',
        name: 'Flex Shift A',
        timeIn: '08:30',
        timeOut: '17:30',
        breakDuration: '1 hour',
    },
    {
        id: 'shift-support',
        name: 'Support Desk Shift',
        timeIn: '07:30',
        timeOut: '16:30',
        breakDuration: '1 hour',
    },
    {
        id: 'shift-field',
        name: 'Field Operations Shift',
        timeIn: '08:00',
        timeOut: '17:00',
        breakDuration: '1 hour',
    },
];

export const employees: EmployeeOption[] = employeeNames.map((name, index) => {
    const department = departmentConfigs[index % departmentConfigs.length];
    const status = statusForIndex(index);
    const employeeStatus =
        status === 'absent'
            ? index % 2 === 0
                ? 'On Leave'
                : 'Field Duty'
            : employeeStatuses[index % employeeStatuses.length];

    return {
        id: `employee-${index + 1}`,
        employeeCode: createEmployeeCode(index),
        name,
        position: department.positions[index % department.positions.length],
        departmentId: department.id,
        departmentName: department.name,
        avatarHue: (index * 29) % 360,
        status: employeeStatus,
        employmentStatus: employmentStatuses[index % employmentStatuses.length],
    };
});

function buildAttendanceLogs(employee: EmployeeOption, status: AttendanceStatus, index: number): AttendanceLogEntry[] {
    if (status === 'absent') {
        return [];
    }

    const timeInMinutes = status === 'late' ? 490 + (index % 5) * 3 : 478 + (index % 7);
    const lunchOutMinutes = 720 + (index % 4);
    const lunchInMinutes = 780 + (index % 4);
    const timeOutMinutes = status === 'late' ? 1025 + (index % 7) : 1020 + (index % 9);

    return [
        {
            id: `${employee.id}-log-1`,
            time: formatTimeFromMinutes(timeInMinutes),
            type: 'IN',
            timestamp: timeWithOffset(formatTimeFromMinutes(timeInMinutes)),
            method: methodForEmployee(employee, 0),
            status: rawStatusForLog(status, 0, index),
        },
        {
            id: `${employee.id}-log-2`,
            time: formatTimeFromMinutes(lunchOutMinutes),
            type: 'BREAK OUT',
            timestamp: timeWithOffset(formatTimeFromMinutes(lunchOutMinutes)),
            method: methodForEmployee(employee, 1),
            status: rawStatusForLog(status, 1, index),
        },
        {
            id: `${employee.id}-log-3`,
            time: formatTimeFromMinutes(lunchInMinutes),
            type: 'BREAK IN',
            timestamp: timeWithOffset(formatTimeFromMinutes(lunchInMinutes)),
            method: methodForEmployee(employee, 2),
            status: rawStatusForLog(status, 2, index),
        },
        {
            id: `${employee.id}-log-4`,
            time: formatTimeFromMinutes(timeOutMinutes),
            type: 'OUT',
            timestamp: timeWithOffset(formatTimeFromMinutes(timeOutMinutes)),
            method: methodForEmployee(employee, 3),
            status: rawStatusForLog(status, 3, index),
        },
    ];
}

export const attendanceRecords: AttendanceRecord[] = employees.map((employee, index) => {
    const status = statusForIndex(index);
    const logs = buildAttendanceLogs(employee, status, index);
    const firstLog = logs[0] ?? null;
    const lastLog = logs.at(-1) ?? null;

    return {
        id: `attendance-${index + 1}`,
        employeeId: employee.id,
        employeeCode: employee.employeeCode,
        employeeName: employee.name,
        position: employee.position,
        departmentId: employee.departmentId,
        departmentName: employee.departmentName,
        date: attendanceDate,
        shiftName: employee.departmentId === 'field' ? 'Field Operations Shift' : 'Regular Day Shift',
        timeIn: firstLog?.time ?? null,
        timeOut: lastLog?.time ?? null,
        totalHours:
            firstLog && lastLog
                ? differenceLabel(
                      Number(firstLog.time.slice(0, 2)) * 60 + Number(firstLog.time.slice(3, 5)),
                      Number(lastLog.time.slice(0, 2)) * 60 + Number(lastLog.time.slice(3, 5)),
                  )
                : '0h 00m',
        status,
        logs,
    };
});

export const rawLogs: RawLogEntry[] = attendanceRecords
    .flatMap((record) =>
        record.logs.map((log, index) => {
            const type: RawLogEntry['type'] =
                log.type === 'IN' || log.type === 'BREAK IN' ? 'IN' : 'OUT';

            return {
                id: `${record.id}-raw-${index + 1}`,
                employeeId: record.employeeId,
                employeeName: record.employeeName,
                employeeCode: record.employeeCode,
                timestamp: log.timestamp,
                type,
                method: log.method,
                status: log.status,
            };
        }),
    )
    .sort((left, right) => right.timestamp.localeCompare(left.timestamp));

function historyStatus(mainStatus: AttendanceStatus, dayOffset: number): AttendanceStatus {
    if (dayOffset === 0) {
        return mainStatus;
    }

    if (dayOffset === 3 && mainStatus === 'late') {
        return 'late';
    }

    if (dayOffset === 4 && mainStatus === 'absent') {
        return 'absent';
    }

    return 'present';
}

function buildAttendanceHistory(employee: EmployeeOption, index: number): EmployeeAttendanceHistoryEntry[] {
    return Array.from({ length: 5 }, (_, dayOffset) => {
        const status = historyStatus(statusForIndex(index), dayOffset);
        const date = new Date(`${attendanceDate}T00:00:00`);
        date.setDate(date.getDate() - dayOffset);

        const formattedDate = date.toISOString().slice(0, 10);

        if (status === 'absent') {
            return {
                id: `${employee.id}-history-${dayOffset + 1}`,
                date: formattedDate,
                shiftName: employee.departmentId === 'field' ? 'Field Operations Shift' : 'Regular Day Shift',
                timeIn: null,
                timeOut: null,
                totalHours: '0h 00m',
                status,
            };
        }

        const timeIn = status === 'late' ? '08:16' : '08:01';
        const timeOut = status === 'late' ? '17:08' : '17:04';

        return {
            id: `${employee.id}-history-${dayOffset + 1}`,
            date: formattedDate,
            shiftName: employee.departmentId === 'field' ? 'Field Operations Shift' : 'Regular Day Shift',
            timeIn,
            timeOut,
            totalHours: status === 'late' ? '7h 52m' : '8h 03m',
            status,
        };
    });
}

function resolveDocumentStatus(employeeIndex: number, documentIndex: number): DocumentStatus {
    const token = (employeeIndex + documentIndex) % 6;

    if (token === 4) {
        return 'Missing';
    }

    if (token === 2) {
        return 'Draft';
    }

    return 'Done';
}

function createDocuments(employee: EmployeeOption, employeeIndex: number): EmployeeDocument[] {
    return documentTemplates.map((template, documentIndex) => ({
        id: `${employee.id}-document-${documentIndex + 1}`,
        employeeId: employee.id,
        category: template.category,
        type: template.type,
        documentName: template.documentName,
        title: `${template.documentName} - ${employee.employeeCode}`,
        status: resolveDocumentStatus(employeeIndex, documentIndex),
        uploadedBy: documentIndex % 2 === 0 ? 'Ana Perez, HR Records' : 'Lito Garcia, Department Clerk',
        uploadedAt: formatDate(2026, ((documentIndex + employeeIndex) % 3) + 1, ((documentIndex * 2 + employeeIndex) % 20) + 6),
        remarks:
            template.category === 'Medical'
                ? 'Cleared for on-site work and annual deployment.'
                : template.category === 'Performance'
                  ? 'Latest signed copy filed for Q4 review.'
                  : 'Scanned copy filed in the 201 jacket for reference.',
    }));
}

export function createEmployeeProfiles(): EmployeeRecordProfile[] {
    return employees.map((employee, index) => {
        const lastName = employee.name.split(' ').at(-1) ?? 'Santos';

        return {
            employeeId: employee.id,
            birthDate: formatDate(1988 + (index % 11), (index % 12) + 1, ((index * 2) % 27) + 1),
            age: 26 + (index % 15),
            civilStatus: civilStatuses[index % civilStatuses.length],
            sex: index % 2 === 0 ? 'Female' : 'Male',
            nationality: nationalities[0],
            address: `${50 + index} Mabini Street, ${['Quezon City', 'Pasig City', 'Makati City', 'Taguig City', 'Caloocan City'][index % 5]}`,
            email: `${slugifyName(employee.name)}@agency.gov.ph`,
            phone: `09${String(170000000 + index * 1397).slice(0, 9)}`,
            hireDate: formatDate(2017 + (index % 7), ((index + 4) % 12) + 1, ((index + 7) % 27) + 1),
            supervisor: departmentConfigs[index % departmentConfigs.length].supervisor,
            workLocation: departmentConfigs[index % departmentConfigs.length].workLocation,
            emergencyContact: `Maria ${lastName}`,
            emergencyPhone: `09${String(180000000 + index * 1773).slice(0, 9)}`,
            gsisNumber: `GSIS-${String(200000 + index * 17).padStart(6, '0')}`,
            philHealthNumber: `PH-${String(100000000000 + index * 211).padStart(12, '0')}`,
            pagIbigNumber: `PBI-${String(500000 + index * 19).padStart(6, '0')}`,
            tinNumber: `${String(120000000 + index * 37).padStart(9, '0')}`,
            attendanceSummary: {
                present: 19 - (index % 3),
                late: index % 4 === 0 ? 2 : 1,
                absent: index % 8 === 0 ? 1 : 0,
                lastClockIn: statusForIndex(index) === 'absent' ? 'No log' : attendanceRecords[index].timeIn ?? 'No log',
            },
            attendanceHistory: buildAttendanceHistory(employee, index),
            documents: createDocuments(employee, index),
        };
    });
}

export const demoDateRange = {
    from: attendanceDate,
    to: attendanceDate,
};

const applicantSeedRecords: Omit<ApplicantRecord, 'id' | 'applicantCode'>[] = [
    {
        name: 'Elaine Joy Marcial',
        positionApplied: 'Administrative Officer II',
        departmentName: 'General Services',
        stage: 'For Requirements',
        status: 'Active',
        recruiter: 'Ana Perez',
        documentProgress: '8 / 10 documents',
        submittedAt: '2026-04-04',
    },
    {
        name: 'Michael Adrian Lopez',
        positionApplied: 'Systems Developer II',
        departmentName: 'Information Technology',
        stage: 'Panel Interview',
        status: 'Active',
        recruiter: 'Jessa Martin',
        documentProgress: '5 / 10 documents',
        submittedAt: '2026-04-03',
    },
    {
        name: 'Rhea Mae Catindig',
        positionApplied: 'Payroll Officer I',
        departmentName: 'Finance',
        stage: 'For Appointment',
        status: 'Active',
        recruiter: 'Carla Lim',
        documentProgress: '10 / 10 documents',
        submittedAt: '2026-04-01',
    },
    {
        name: 'Joshua Neil Ong',
        positionApplied: 'Monitoring Officer I',
        departmentName: 'Operations',
        stage: 'For Examination',
        status: 'Active',
        recruiter: 'Ana Perez',
        documentProgress: '3 / 10 documents',
        submittedAt: '2026-04-05',
    },
    {
        name: 'Mikaela Rose Santiago',
        positionApplied: 'Records Officer II',
        departmentName: 'General Services',
        stage: 'Initial Screening',
        status: 'For Pooling',
        recruiter: 'Jessa Martin',
        documentProgress: '2 / 10 documents',
        submittedAt: '2026-04-06',
    },
    {
        name: 'Luis Marco Almeda',
        positionApplied: 'Community Affairs Officer',
        departmentName: 'Field Services',
        stage: 'For Requirements',
        status: 'On Hold',
        recruiter: 'Carla Lim',
        documentProgress: '6 / 10 documents',
        submittedAt: '2026-03-29',
    },
];

export const applicantRecords: ApplicantRecord[] = applicantSeedRecords.map(
    (record, index) => ({
        id: `applicant-${index + 1}`,
        applicantCode: `APP-${String(index + 1).padStart(4, '0')}`,
        ...record,
    }),
);

const recordProfiles = createEmployeeProfiles();

export const employeeRecordFiles: EmployeeRecordFileSummary[] = employees.map(
    (employee, index) => {
        const documents = recordProfiles[index]?.documents ?? [];

        return {
            employeeId: employee.id,
            employeeCode: employee.employeeCode,
            employeeName: employee.name,
            position: employee.position,
            departmentName: employee.departmentName,
            employmentStatus: employee.employmentStatus,
            filingStatus:
                index % 6 === 0
                    ? 'Pending Transfer'
                    : index % 4 === 0
                      ? 'For Update'
                      : 'Complete',
            lastUpdated: formatDate(2026, ((index + 1) % 3) + 1, ((index + 5) % 20) + 6),
            documentCounts: {
                done: documents.filter((document) => document.status === 'Done').length,
                missing: documents.filter((document) => document.status === 'Missing').length,
                draft: documents.filter((document) => document.status === 'Draft').length,
            },
        };
    },
);

export const documentRegistryEntries: DocumentRegistryEntry[] = [
    ...applicantRecords.map((applicant, index) => {
        const status: DocumentRegistryEntry['status'] =
            index % 3 === 0 ? 'Draft' : 'Done';

        return {
            id: `registry-applicant-${index + 1}`,
            ownerType: 'Applicant' as const,
            ownerName: applicant.name,
            ownerCode: applicant.applicantCode,
            documentName:
                index % 2 === 0
                    ? 'Applicant Personal Data Sheet'
                    : 'Pre-employment Requirements Checklist',
            category: index % 2 === 0 ? 'Recruitment' : 'Requirements',
            status,
            lastUpdated: applicant.submittedAt,
            storageTag: `APP-FOLDER-${String(index + 11).padStart(3, '0')}`,
        };
    }),
    ...employeeRecordFiles.slice(0, 10).flatMap((employeeFile, index) => {
        const documents = recordProfiles[index]?.documents.slice(0, 2) ?? [];

        return documents.map((document, documentIndex) => ({
            id: `registry-employee-${index + 1}-${documentIndex + 1}`,
            ownerType: 'Employee' as const,
            ownerName: employeeFile.employeeName,
            ownerCode: employeeFile.employeeCode,
            documentName: document.documentName,
            category: document.category,
            status: document.status,
            lastUpdated: document.uploadedAt,
            storageTag: `201-JACKET-${String(index + 101).padStart(3, '0')}`,
        }));
    }),
];

export const formManagementEntries: FormManagementEntry[] = [
    {
        id: 'form-management-1',
        ownerType: 'Applicant',
        ownerName: 'Rhea Mae Catindig',
        formName: 'Appointment Checklist',
        formCode: 'REC-APPT-01',
        status: 'For Signature',
        assignedTo: 'Ana Perez',
        updatedAt: '2026-04-05',
    },
    {
        id: 'form-management-2',
        ownerType: 'Employee',
        ownerName: 'Alyssa Mae Dela Cruz',
        formName: 'Personal Data Sheet',
        formCode: '201-PDS-01',
        status: 'Released',
        assignedTo: 'Lito Garcia',
        updatedAt: '2026-04-04',
    },
    {
        id: 'form-management-3',
        ownerType: 'Employee',
        ownerName: 'John Carlo Reyes',
        formName: 'Medical Clearance Routing Slip',
        formCode: 'MED-CLR-02',
        status: 'Ready to Print',
        assignedTo: 'Mae Villanueva',
        updatedAt: '2026-04-03',
    },
    {
        id: 'form-management-4',
        ownerType: 'Applicant',
        ownerName: 'Michael Adrian Lopez',
        formName: 'Interview Assessment Sheet',
        formCode: 'REC-INT-03',
        status: 'Draft',
        assignedTo: 'Jessa Martin',
        updatedAt: '2026-04-06',
    },
    {
        id: 'form-management-5',
        ownerType: 'Employee',
        ownerName: 'Patricia Anne Mendoza',
        formName: 'SALN Acknowledgment',
        formCode: 'ADM-SALN-01',
        status: 'For Signature',
        assignedTo: 'Carla Lim',
        updatedAt: '2026-04-02',
    },
];

export const printableForms: PrintableForm[] = [
    {
        id: 'printable-form-1',
        formCode: 'REC-001',
        name: 'Applicant Information Sheet',
        category: 'Recruitment',
        audience: 'Applicants and Recruitment Team',
        description: 'Initial intake form used before a person is converted into an employee record.',
    },
    {
        id: 'printable-form-2',
        formCode: 'REC-002',
        name: 'Interview Evaluation Form',
        category: 'Recruitment',
        audience: 'Panel Interviewers',
        description: 'Printable panel evaluation sheet for recruitment screening.',
    },
    {
        id: 'printable-form-3',
        formCode: '201-001',
        name: 'CS Form 212 - Personal Data Sheet',
        category: '201 File',
        audience: 'Applicants and Employees',
        description: 'Blank printable PDS form for personnel records.',
    },
    {
        id: 'printable-form-4',
        formCode: '201-002',
        name: 'CS Form 33 - Oath of Office',
        category: '201 File',
        audience: 'Newly appointed employees',
        description: 'Printable oath of office form for appointment processing.',
    },
    {
        id: 'printable-form-5',
        formCode: 'MED-001',
        name: 'Medical Certificate Routing Slip',
        category: 'Medical',
        audience: 'Employees',
        description: 'Form used to track annual medical submission requirements.',
    },
    {
        id: 'printable-form-6',
        formCode: 'CLR-001',
        name: 'NBI Clearance Transmittal',
        category: 'Clearance',
        audience: 'Applicants and Employees',
        description: 'Used when submitting or renewing NBI clearance copies.',
    },
    {
        id: 'printable-form-7',
        formCode: 'PERF-001',
        name: 'Performance Rating Cover Sheet',
        category: 'Performance',
        audience: 'Supervisors and HR',
        description: 'Attached to semi-annual performance rating documents.',
    },
    {
        id: 'printable-form-8',
        formCode: 'ADM-001',
        name: 'Records Borrowing Slip',
        category: 'Administrative',
        audience: 'Records Office',
        description: 'Tracks temporary withdrawal of physical 201 jackets and folders.',
    },
];

export const archiveEntries: ArchiveEntry[] = [
    {
        id: 'archive-1',
        title: '201 File - Theresa Ramos',
        recordType: 'Employee',
        archivedAt: '2026-02-12',
        retention: '5 years after separation',
        storageLocation: 'Archive Room A · Shelf 04',
    },
    {
        id: 'archive-2',
        title: 'Applicant Folder - Batch March 2025',
        recordType: 'Applicant',
        archivedAt: '2026-01-20',
        retention: '2 years',
        storageLocation: 'Archive Room B · Box 12',
    },
    {
        id: 'archive-3',
        title: 'Blank Forms Revision 2024',
        recordType: 'General File',
        archivedAt: '2025-12-18',
        retention: 'Permanent reference copy',
        storageLocation: 'Archive Room C · Cabinet 02',
    },
];
