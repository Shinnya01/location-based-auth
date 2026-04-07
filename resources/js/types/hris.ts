export type AttendanceStatus = 'present' | 'late' | 'absent';

export type AttendanceLogType = 'IN' | 'BREAK OUT' | 'BREAK IN' | 'OUT';

export type RawLogType = 'IN' | 'OUT';

export type LogMethod = 'Biometric' | 'GPS';

export type RawLogStatus = 'Verified' | 'Adjusted' | 'Missing Pair';

export type EmployeeStatus = 'On Site' | 'On Leave' | 'Field Duty';

export type EmploymentStatus = 'Permanent' | 'Contractual' | 'Probationary';

export type DocumentStatus = 'Done' | 'Missing' | 'Draft';

export type DocumentCategory =
    | 'Personal'
    | 'Appointment'
    | 'Medical'
    | 'Clearances'
    | 'Performance'
    | 'Disciplinary'
    | 'Others';

export type DocumentType =
    | 'CS Form 212'
    | 'CS Form 33'
    | 'Medical Certificate'
    | 'NBI Clearance'
    | 'Service Record'
    | 'Appointment Paper'
    | 'Performance Rating'
    | 'Memorandum Receipt'
    | 'Training Certificate'
    | 'Birth Certificate'
    | 'Marriage Certificate'
    | 'SALN'
    | 'Diploma'
    | 'Transcript of Records';

export type RecordOwnerType = 'Applicant' | 'Employee';

export type ApplicantStage =
    | 'Initial Screening'
    | 'For Examination'
    | 'Panel Interview'
    | 'For Requirements'
    | 'For Appointment';

export type ApplicantStatus = 'Active' | 'For Pooling' | 'On Hold';

export type FormLifecycleStatus =
    | 'Draft'
    | 'For Signature'
    | 'Ready to Print'
    | 'Released';

export type PrintableFormCategory =
    | 'Recruitment'
    | '201 File'
    | 'Medical'
    | 'Clearance'
    | 'Performance'
    | 'Administrative';

export type DepartmentOption = {
    id: string;
    name: string;
};

export type EmployeeOption = {
    id: string;
    employeeCode: string;
    name: string;
    position: string;
    departmentId: string;
    departmentName: string;
    avatarHue: number;
    status: EmployeeStatus;
    employmentStatus: EmploymentStatus;
};

export type AttendanceLogEntry = {
    id: string;
    time: string;
    type: AttendanceLogType;
    timestamp: string;
    method: LogMethod;
    status: RawLogStatus;
};

export type AttendanceRecord = {
    id: string;
    employeeId: string;
    employeeCode: string;
    employeeName: string;
    position: string;
    departmentId: string;
    departmentName: string;
    date: string;
    shiftName: string;
    timeIn: string | null;
    timeOut: string | null;
    totalHours: string;
    status: AttendanceStatus;
    logs: AttendanceLogEntry[];
};

export type RawLogEntry = {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    timestamp: string;
    type: RawLogType;
    method: LogMethod;
    status: RawLogStatus;
};

export type ShiftDefinition = {
    id: string;
    name: string;
    timeIn: string;
    timeOut: string;
    breakDuration: string;
};

export type EmployeeAttendanceHistoryEntry = {
    id: string;
    date: string;
    shiftName: string;
    timeIn: string | null;
    timeOut: string | null;
    totalHours: string;
    status: AttendanceStatus;
};

export type EmployeeDocument = {
    id: string;
    employeeId: string;
    category: DocumentCategory;
    type: DocumentType;
    documentName: string;
    title: string;
    status: DocumentStatus;
    uploadedBy: string;
    uploadedAt: string;
    remarks: string;
};

export type EmployeeRecordProfile = {
    employeeId: string;
    birthDate: string;
    age: number;
    civilStatus: string;
    sex: string;
    nationality: string;
    address: string;
    email: string;
    phone: string;
    hireDate: string;
    supervisor: string;
    workLocation: string;
    emergencyContact: string;
    emergencyPhone: string;
    gsisNumber: string;
    philHealthNumber: string;
    pagIbigNumber: string;
    tinNumber: string;
    attendanceSummary: {
        present: number;
        late: number;
        absent: number;
        lastClockIn: string;
    };
    attendanceHistory: EmployeeAttendanceHistoryEntry[];
    documents: EmployeeDocument[];
};

export type ApplicantRecord = {
    id: string;
    applicantCode: string;
    name: string;
    positionApplied: string;
    departmentName: string;
    stage: ApplicantStage;
    status: ApplicantStatus;
    recruiter: string;
    documentProgress: string;
    submittedAt: string;
};

export type EmployeeRecordFileSummary = {
    employeeId: string;
    employeeCode: string;
    employeeName: string;
    position: string;
    departmentName: string;
    employmentStatus: EmploymentStatus;
    filingStatus: 'Complete' | 'For Update' | 'Pending Transfer';
    lastUpdated: string;
    documentCounts: {
        done: number;
        missing: number;
        draft: number;
    };
};

export type DocumentRegistryEntry = {
    id: string;
    ownerType: RecordOwnerType;
    ownerName: string;
    ownerCode: string;
    documentName: string;
    category: string;
    status: DocumentStatus;
    lastUpdated: string;
    storageTag: string;
};

export type FormManagementEntry = {
    id: string;
    ownerType: RecordOwnerType;
    ownerName: string;
    formName: string;
    formCode: string;
    status: FormLifecycleStatus;
    assignedTo: string;
    updatedAt: string;
};

export type PrintableForm = {
    id: string;
    formCode: string;
    name: string;
    category: PrintableFormCategory;
    audience: string;
    description: string;
};

export type ArchiveEntry = {
    id: string;
    title: string;
    recordType: RecordOwnerType | 'General File';
    archivedAt: string;
    retention: string;
    storageLocation: string;
};
