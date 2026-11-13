import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import officeBuilding from "./office-bg.png.png";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

/* ================= SETTINGS ================= */

const DEFAULT_SETTINGS = {
  notifications: true,
  deadlineAlerts: true,
  currency: true,
  dateTime: true,
  dashboardStats: true,
  overdueWarning: true,
  employeeAutoBackup: false,
};

/* ================= CURRENCY ================= */

const RATES = {
  AFN: 1,
  USD: 64.69,
  EUR: 74.15,
  GBP: 85.75,
};

/* ================= TRANSLATION ================= */

const TEXT = {
  en: {
    add: "ADD",
    save: "SAVE",
    cancel: "CANCEL",
    createNew: "CREATE NEW",
    receipt: "RECEIPT",
    rememberMe: "REMEMBER ME",
    forgotPassword: "FORGOT PASSWORD",
    dashboard: "DASHBOARD",
    customers: "CUSTOMERS",
    users: "USERS",
    attendance: "ATTENDANCE",
    instructions: "INSTRUCTIONS / ORDERS",
    instructionsDescription:
      "Create and issue administrative instructions with a clear title and detailed description.",
    payments: "PAYMENTS",
    finance: "FINANCE",
    financeOverview: "FINANCE OVERVIEW",
    incomeRecords: "INCOME",
    expenses: "EXPENSES",
    debts: "DEBTS / UNPAID MONEY",
    source: "SOURCE",
    expenseTitle: "EXPENSE TITLE",
    category: "CATEGORY",
    customerDebt: "CUSTOMER DEBT",
    paidAmount: "PAID AMOUNT",
    remaining: "REMAINING",
    dueDate: "DUE DATE",
    pending: "PENDING",
    partiallyPaid: "PARTIALLY PAID",
    settled: "SETTLED",
    financeTotalIncome: "TOTAL INCOME",
    financeTotalExpense: "TOTAL EXPENSES",
    financeReceivable: "UNPAID / RECEIVABLE",
    financeNet: "NET BALANCE",
    recordIncome: "RECORD INCOME",
    recordExpense: "RECORD EXPENSE",
    recordDebt: "RECORD DEBT",
    financeDescription: "FINANCE DESCRIPTION",
    projects: "PROJECTS",
    settings: "SETTINGS",
    account: "Account",
    instructionTitle: "INSTRUCTION TITLE",
    instructionDescription: "INSTRUCTION DETAILS",
    issueInstruction: "ISSUE INSTRUCTION",
    permissions: "PERMISSIONS",
    accountInformation: "ACCOUNT INFORMATION",
    changePassword: "CHANGE PASSWORD",
    currentPassword: "CURRENT PASSWORD",
    newPassword: "NEW PASSWORD",
    saveChanges: "SAVE CHANGES",
    granted: "GRANTED",
    notGranted: "NOT GRANTED",

    logout: "LOGOUT",
    welcome: "WELCOME BACK",
    overview: "OFFICE MANAGEMENT OVERVIEW",

    customer: "CUSTOMER",
    employee: "EMPLOYEE",
    attendanceToday: "ATTENDANCE TODAY",

    add: "ADD",
    save: "SAVE",
    cancel: "CANCEL",
    edit: "EDIT",
    delete: "DELETE",
    action: "ACTION",

    name: "NAME",
    email: "EMAIL",
    username: "USERNAME",
    password: "PASSWORD",
    role: "ROLE",
    accountStatus: "ACCOUNT STATUS",
    active: "ACTIVE",
    disabled: "DISABLED",

    phone: "PHONE",
    shopName: "SHOP NAME",
    shopNumber: "SHOP NUMBER",
    address: "ADDRESS",
    contractId: "CONTRACT ID",
    dateId: "DATE ID",

    date: "DATE",
    checkIn: "CHECK IN",
    checkOut: "CHECK OUT",
    status: "STATUS",

    amount: "AMOUNT",
    type: "TYPE",
    description: "DESCRIPTION",

    title: "TITLE",
    assignedUser: "ASSIGNED USER",
    projectEmployee: "EMPLOYEE",
    testing: "TESTING",
    deadline: "DEADLINE",
    endDate: "END DATE",

    language: "LANGUAGE",
    theme: "THEME",
    dayMode: "DAY MODE",
    nightMode: "NIGHT MODE",

    english: "ENGLISH",
    persian: "فارسی",

    notifications: "NOTIFICATIONS",
    deadlineAlerts: "DEADLINE ALERTS",
    currency: "CURRENCY",
    translatorSetting: "TRANSLATOR",
    dateTime: "DATE & TIME",
    dashboardStats: "DASHBOARD STATS",
    overdueWarning: "OVERDUE WARNING",
    employeeAutoBackup: "AUTOMATIC EMPLOYEE BACKUP",

    on: "ON",
    off: "OFF",

    currencyConverter: "CURRENCY CONVERTER",
    from: "FROM",
    to: "TO",
    result: "RESULT",

    currentTime: "CURRENT DATE & TIME",

    recentProjects: "RECENT PROJECTS",
    recentPayments: "RECENT PAYMENTS",
    quickActions: "QUICK ACTIONS",

    projectWarning: "PROJECT DEADLINE WARNING",
    overdue: "OVERDUE",
    today: "TODAY",
    daysLeft: "DAYS LEFT",

    completed: "COMPLETED",
    noData: "NO DATA FOUND",

    present: "PRESENT",
    absent: "ABSENT",
    late: "LATE",

    paid: "PAID",
    unpaid: "UNPAID",

    income: "INCOME",
    expense: "EXPENSE",
    balance: "BALANCE",

    search: "SEARCH",
    refresh: "REFRESH",

    translatorTitle: "TRANSLATOR",
    translateFrom: "TRANSLATE FROM",
    translateTo: "TRANSLATE TO",
    translation: "TRANSLATION",
    clear: "CLEAR",

    systemDescription:
      "CONTROL WHICH FEATURES ARE ACTIVE IN THE SYSTEM.",

    welcomeText:
      "Manage customers, employees, attendance, payments and projects from one office management system.",

    login: "LOGIN",
    loginTitle: "OFFICE MANAGEMENT",
    loginSubtitle: "SIGN IN TO YOUR ACCOUNT",
  },

  fa: {
    add: "افزودن",
    save: "ذخیره",
    cancel: "لغو",
    createNew: "ایجاد جدید",
    receipt: "رسید",
    rememberMe: "مرا به خاطر بسپار",
    forgotPassword: "رمز عبور را فراموش کرده‌اید؟",
    dashboard: "داشبورد",
    customers: "مشتریان",
    users: "کاربران",
    attendance: "حاضری",
    instructions: "دستورها / اوامر",
    instructionsDescription:
      "دستورهای اداری را با عنوان روشن و توضیحات کامل ایجاد و صادر کنید.",
    payments: "پرداخت‌ها",
    finance: "فایننس",
    financeOverview: "نمای کلی فایننس",
    incomeRecords: "درآمدها",
    expenses: "مصارف",
    debts: "قرض / پول‌های ناداده",
    source: "منبع درآمد",
    expenseTitle: "عنوان مصرف",
    category: "دسته‌بندی",
    customerDebt: "قرض مشتری",
    paidAmount: "مبلغ پرداخت‌شده",
    remaining: "باقی‌مانده",
    dueDate: "تاریخ سررسید",
    pending: "در انتظار",
    partiallyPaid: "قسمتی پرداخت شده",
    settled: "تسویه شده",
    financeTotalIncome: "مجموع درآمد",
    financeTotalExpense: "مجموع مصارف",
    financeReceivable: "پول‌های ناداده / طلب",
    financeNet: "بیلانس خالص",
    recordIncome: "ثبت درآمد",
    recordExpense: "ثبت مصرف",
    recordDebt: "ثبت قرض",
    financeDescription: "توضیحات فایننس",
    projects: "پروژه‌ها",
    settings: "تنظیمات",
    account: "حساب کاربری",
    instructionTitle: "عنوان دستور",
    instructionDescription: "جزئیات دستور",
    issueInstruction: "صدور دستور",
    permissions: "دسترسی‌ها",
    accountInformation: "اطلاعات حساب",
    changePassword: "تغییر رمز عبور",
    currentPassword: "رمز عبور فعلی",
    newPassword: "رمز عبور جدید",
    saveChanges: "ذخیره تغییرات",
    granted: "فعال",
    notGranted: "غیرفعال",

    logout: "خروج",
    welcome: "خوش آمدید",
    overview: "نمای کلی مدیریت دفتر",

    customer: "مشتری",
    employee: "کارمند",
    attendanceToday: "حاضری امروز",

    add: "افزودن",
    save: "ذخیره",
    cancel: "لغو",
    edit: "ویرایش",
    delete: "حذف",
    action: "عملیات",

    name: "نام",
    email: "ایمیل",
    username: "نام کاربری",
    password: "رمز عبور",
    role: "نقش",
    accountStatus: "وضعیت حساب",
    active: "فعال",
    disabled: "غیرفعال",

    phone: "شماره تماس",
    shopName: "نام فروشگاه",
    shopNumber: "شماره فروشگاه",
    address: "آدرس",
    contractId: "شماره قرارداد",
    dateId: "شناسه تاریخ",

    date: "تاریخ",
    checkIn: "ورود",
    checkOut: "خروج",
    status: "وضعیت",

    amount: "مبلغ",
    type: "نوع",
    description: "توضیحات",

    title: "عنوان",
    assignedUser: "مسئول پروژه",
    projectEmployee: "کارمند",
    testing: "تست",
    deadline: "سررسید",
    endDate: "تاریخ پایان",

    language: "زبان",
    theme: "حالت نمایش",
    dayMode: "حالت روز",
    nightMode: "حالت شب",

    english: "ENGLISH",
    persian: "فارسی",

    notifications: "اعلان‌ها",
    deadlineAlerts: "هشدار سررسید",
    currency: "تبدیل ارز",
    translatorSetting: "مترجم",
    dateTime: "تاریخ و ساعت",
    dashboardStats: "آمار داشبورد",
    overdueWarning: "هشدار تأخیر",
    employeeAutoBackup: "پشتیبان‌گیری خودکار کارمندان",

    on: "فعال",
    off: "خاموش",

    currencyConverter: "تبدیل ارز",
    from: "از",
    to: "به",
    result: "نتیجه",

    currentTime: "تاریخ و ساعت فعلی",

    recentProjects: "پروژه‌های اخیر",
    recentPayments: "پرداخت‌های اخیر",
    quickActions: "دسترسی سریع",

    projectWarning: "هشدار سررسید پروژه",
    overdue: "تأخیر کرده",
    today: "امروز",
    daysLeft: "روز باقی مانده",

    completed: "تکمیل شده",
    noData: "داده‌ای پیدا نشد",

    present: "حاضر",
    absent: "غایب",
    late: "ناوقت",

    paid: "پرداخت شده",
    unpaid: "پرداخت نشده",

    income: "درآمد",
    expense: "مصرف",
    balance: "موجودی",

    search: "جستجو",
    refresh: "تازه‌سازی",

    translatorTitle: "مترجم",
    translateFrom: "ترجمه از",
    translateTo: "ترجمه به",
    translation: "ترجمه",
    clear: "پاک کردن",

    systemDescription:
      "مشخص کنید کدام امکانات سیستم فعال یا خاموش باشند.",

    welcomeText:
      "مشتریان، کارمندان، حاضری، پرداخت‌ها و پروژه‌ها را از یک سیستم مدیریت دفتر کنترل کنید.",

    login: "ورود",
    loginTitle: "مدیریت دفتر",
    loginSubtitle: "به حساب خود وارد شوید",
  },
};

function normalizeRoleValue(role) {
  return String(role ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function isSuperAdminRole(role) {
  const normalized = normalizeRoleValue(role);
  return normalized === "super_admin" || normalized === "superadmin";
}

function canManageRecordsAs(user, record) {
  if (typeof record?.can_edit === "boolean") {
    return record.can_edit;
  }

  return isSuperAdminRole(user?.role);
}

function canManageAccountsAs(user) {
  return isSuperAdminRole(user?.role);
}

function canManageUserAs(user) {
  return isSuperAdminRole(user?.role);
}

function isAdminRole(role) {
  return normalizeRoleValue(role) === "admin";
}

function isSupportedRole(role) {
  return ["super_admin", "superadmin", "admin", "user"].includes(
    normalizeRoleValue(role)
  );
}

function getRoleLabel(role, language) {
  if (isSuperAdminRole(role)) {
    return language === "fa" ? "سوپر ادمین" : "Super Admin";
  }
  if (isAdminRole(role)) {
    return language === "fa" ? "مدیر" : "Admin";
  }
  return language === "fa" ? "کاربر" : "User";
}

function canCreateRecordAs(user, targetPage) {
  const role = normalizeRoleValue(user?.role);
  if (isSuperAdminRole(role)) return true;
  if (role === "admin") return targetPage === "attendance";

  return [
    "customers",
    "employees",
    "contracts",
    "payments",
    "projects",
    "income",
    "expenses",
    "debts",
  ].includes(targetPage);
}

function getTodayInputDate() {
  const now = new Date();
  const local = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 10);
}

function getTodayKabulInputDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kabul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

const todayInputDate = getTodayInputDate();

/* ================= EMPTY FORMS ================= */

const emptyCustomer = {
  name: "",
  phone: "",
  shop_name: "",
  shop_number: "",
  address: "",
  contract_id: "",
  date_id: "",
  photo: "",
};

const emptyUser = {
  name: "",
  email: "",
  username: "",
  password: "",
  role: "user",
  is_active: 1,
  photo: "",
};

const emptyAttendance = {
  employee_id: "",
  date: getTodayKabulInputDate(),
  check_in: "",
  check_out: "",
  status: "Present",
  notes: "",
};

const emptyPayment = {
  customer_id: "",
  amount: "",
  type: "Paid",
  date: todayInputDate,
  description: "",
};

const emptyIncome = {
  source: "",
  amount: "",
  date: todayInputDate,
  description: "",
};

const emptyExpense = {
  title: "",
  amount: "",
  category: "",
  date: todayInputDate,
  description: "",
};

const emptyDebt = {
  customer_id: "",
  amount: "",
  paid_amount: "",
  due_date: "",
  status: "Pending",
  description: "",
};

const emptyProject = {
  title: "",
  description: "",
  user_id: "",
  status: "Pending",
  deadline: "",
  employee: "",
  testing: "",
  end_date: "",
};

const emptyEmployee = {
  name: "",
  phone: "",
  email: "",
  position: "",
  province: "",
  address: "",
  photo: "",
};

const emptyContract = {
  person_name: "",
  line_number: "",
  shop_name: "",
  shop_number: "",
  shop_location: "",
  province: "",
  tazkira_id: "",
  contract_start: todayInputDate,
  contract_end: "",
  amount: "",
  photo: "",
};

function DailyAttendanceWorkspace({
  attendance,
  canRecord,
  canCorrect,
  language,
  api,
  onRefresh,
  onEdit,
  onDelete,
}) {
  const [date, setDate] = useState(getTodayKabulInputDate);
  const [register, setRegister] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [holidayInput, setHolidayInput] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const loadRequestRef = useRef(0);
  const isPersian = language === "fa";
  const labels = isPersian
    ? {
        date: "تاریخ حاضری",
        search: "جستجوی کارمند",
        all: "همه وضعیت‌ها",
        present: "حاضر",
        absent: "غایب",
        late: "ناوقت",
        halfDay: "نیمه‌وقت",
        leave: "رخصتی",
        holiday: "تعطیل",
        notMarked: "ثبت‌نشده",
        printTitle: "ثبت روزانه حاضری",
        total: "مجموع کارمندان",
        myAttendance: "حاضری من",
        onLeave: "در رخصتی",
        marked: "ثبت‌شده",
        employees: "کارمند",
        identifier: "شناسه",
        status: "وضعیت",
        checkIn: "ورود",
        checkOut: "خروج",
        duration: "مدت کار",
        notes: "یادداشت",
        actions: "عملیات",
        submit: "ثبت",
        submitAll: "ثبت همه موارد آماده",
        checkInAction: "ثبت ورود",
        checkOutAction: "ثبت خروج",
        loading: "در حال بارگذاری حاضری...",
        empty: "برای این تاریخ کارمندی موجود نیست.",
        noMatch: "موردی با این جستجو یا فیلتر پیدا نشد.",
        saveSuccess: "حاضری ذخیره شد.",
        bulkSuccess: "حاضری روزانه ذخیره شد.",
        week: "گزارش هفتگی",
        month: "گزارش ماهانه",
        records: "ثبت",
        print: "چاپ گزارش روزانه",
        correction: "اصلاح",
        delete: "حذف",
        history: "سوابق حاضری",
        readOnly: "فقط مشاهده",
        settings: "تنظیمات حاضری",
        opening: "ساعت آغاز کار",
        closing: "ساعت پایان کار",
        grace: "مهلت تأخیر (دقیقه)",
        workDays: "روزهای کاری",
        holidays: "تاریخ‌های تعطیل (هر تاریخ در یک خط)",
        shifts: "شیفت‌ها",
        addShift: "افزودن شیفت",
        shiftName: "نام شیفت",
        saveSettings: "ذخیره تنظیمات",
      }
    : {
        date: "Attendance date",
        search: "Search employees",
        all: "All statuses",
        present: "Present",
        absent: "Absent",
        late: "Late",
        halfDay: "Half Day",
        leave: "On Leave",
        holiday: "Holiday",
        notMarked: "Not Yet Marked",
        printTitle: "Daily attendance register",
        total: "Total Employees",
        myAttendance: "My attendance",
        onLeave: "On Leave",
        marked: "Marked",
        employees: "Employee",
        identifier: "Identifier",
        status: "Status",
        checkIn: "Check-in",
        checkOut: "Check-out",
        duration: "Duration",
        notes: "Notes",
        actions: "Actions",
        submit: "Save",
        submitAll: "Submit all unmarked",
        checkInAction: "Check in",
        checkOutAction: "Check out",
        loading: "Loading attendance...",
        empty: "No employees are available for this date.",
        noMatch: "No records match this search or filter.",
        saveSuccess: "Attendance saved.",
        bulkSuccess: "Daily attendance saved.",
        week: "Weekly report",
        month: "Monthly report",
        records: "records",
        print: "Print daily register",
        correction: "Correct",
        delete: "Delete",
        history: "Attendance history",
        readOnly: "Read only",
        settings: "Attendance settings",
        opening: "Office opening time",
        closing: "Office closing time",
        grace: "Late grace period (minutes)",
        workDays: "Work days",
        holidays: "Holiday dates (one per line)",
        shifts: "Shifts",
        addShift: "Add shift",
        shiftName: "Shift name",
        saveSettings: "Save settings",
      };
  const statusOptions = [
    ["Present", labels.present],
    ["Absent", labels.absent],
    ["Late", labels.late],
    ["Half Day", labels.halfDay],
    ["Leave", labels.leave],
    ["Holiday", labels.holiday],
  ];

  const loadDaily = useCallback(async () => {
    if (!canRecord) return;
    const requestId = ++loadRequestRef.current;
    setLoading(true);
    setError("");
    try {
      const result = await api(`/attendance/daily?date=${encodeURIComponent(date)}`);
      if (!result || !Array.isArray(result.employees) || !result.summary) {
        throw new Error(isPersian ? "پاسخ سرور حاضری معتبر نیست." : "The attendance service returned an invalid register.");
      }
      if (requestId !== loadRequestRef.current) return;
      setRegister(result);
      setDrafts({});
    } catch (loadError) {
      if (requestId === loadRequestRef.current) {
        setError(loadError.message || (isPersian ? "بارگذاری حاضری ناموفق بود." : "Attendance could not be loaded."));
      }
    } finally {
      if (requestId === loadRequestRef.current) setLoading(false);
    }
  }, [api, canRecord, date, isPersian]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadDaily();
    });
    return () => {
      active = false;
      loadRequestRef.current += 1;
    };
  }, [loadDaily]);

  useEffect(() => {
    if (!canCorrect) return;
    api("/attendance/settings")
      .then((result) => {
        setSettings(result);
        setHolidayInput((result.holidays || []).join("\n"));
      })
      .catch((settingsError) => {
        setError(settingsError.message || (isPersian ? "بارگذاری تنظیمات حاضری ناموفق بود." : "Attendance settings could not be loaded."));
      });
  }, [api, canCorrect, isPersian]);

  const entries = canRecord && register
    ? register.employees.map((employee) => ({
        ...employee,
        attendance: employee.attendance || null,
      }))
    : [];
  const recordedForDate = attendance.filter((item) => String(item.date || "").slice(0, 10) === date);
  const summary = register?.summary || {
    total_employees: entries.length,
    present: 0,
    absent: 0,
    late: 0,
    half_day: 0,
    on_leave: 0,
    not_marked: 0,
  };
  const summaryAvailable = !canRecord || Boolean(register);
  const statusLabel = (value) => ({
    Present: labels.present,
    Absent: labels.absent,
    Late: labels.late,
    "Half Day": labels.halfDay,
    Leave: labels.leave,
    Holiday: labels.holiday,
  }[value] || value || labels.notMarked);
  const makeDraft = (employee) => drafts[String(employee.id)] || {
    status: "Present",
    check_in: "",
    check_out: "",
    notes: "",
  };
  const shownEntries = entries.filter((employee) => {
    const record = employee.attendance;
    const query = search.trim().toLocaleLowerCase();
    const employeeMatch = !query ||
      String(employee.name || "").toLocaleLowerCase().includes(query) ||
      String(employee.employee_id || employee.id || "").toLocaleLowerCase().includes(query);
    const statusMatch = statusFilter === "all" ||
      (statusFilter === "Not Marked" ? !record : record?.status === statusFilter);
    return employeeMatch && statusMatch;
  });
  const dayMilliseconds = Date.parse(`${date}T00:00:00Z`);
  const weekStart = dayMilliseconds - new Date(dayMilliseconds).getUTCDay() * 86400000;
  const weekEnd = weekStart + 7 * 86400000;
  const monthDate = new Date(dayMilliseconds);
  const monthStart = Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1);
  const nextMonthStart = Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 1);
  const rangeSummary = (start, end) => {
    const records = attendance.filter((item) => {
      const timestamp = Date.parse(`${String(item.date || "").slice(0, 10)}T00:00:00Z`);
      return Number.isFinite(timestamp) && timestamp >= start && timestamp < end;
    });
    return {
      total: records.length,
      present: records.filter((item) => item.status === "Present").length,
      absent: records.filter((item) => item.status === "Absent").length,
      late: records.filter((item) => item.status === "Late").length,
    };
  };
  const weeklySummary = rangeSummary(weekStart, weekEnd);
  const monthlySummary = rangeSummary(monthStart, nextMonthStart);
  const reportSummaryText = (result) => isPersian
    ? `${result.total} ${labels.records} · ${labels.present}: ${result.present} · ${labels.absent}: ${result.absent}`
    : `${result.total} ${labels.records} · ${result.present} ${labels.present.toLowerCase()} · ${result.absent} ${labels.absent.toLowerCase()}`;
  const isSelectedDateToday = date === getTodayKabulInputDate();
  const canSubmitSelectedDate = canCorrect || isSelectedDateToday;
  const workingDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "—";
    const toMinutes = (time) => {
      const match = String(time).match(/^(\d{1,2}):(\d{2})/);
      return match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
    };
    const minutes = toMinutes(checkOut) - toMinutes(checkIn);
    return Number.isFinite(minutes) && minutes >= 0
      ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
      : "—";
  };
  const formatDate = (value) => {
    const parsed = new Date(`${value}T12:00:00Z`);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleDateString(isPersian ? "fa-AF" : "en-US", {
          timeZone: "UTC",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };
  const updateDraft = (id, key, value) => {
    setDrafts((current) => ({
      ...current,
      [String(id)]: { ...makeDraft({ id }), ...current[String(id)], [key]: value },
    }));
  };

  async function saveEntries(selectedEmployees, successMessage) {
    if (!selectedEmployees.length || saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await api("/attendance/daily", {
        method: "POST",
        body: JSON.stringify({
          date,
          entries: selectedEmployees.map((employee) => ({
            employee_id: employee.id,
            ...makeDraft(employee),
          })),
        }),
      });
      setNotice(successMessage);
      await Promise.all([loadDaily(), onRefresh()]);
    } catch (saveError) {
      setError(saveError.message || (isPersian ? "ثبت حاضری ناموفق بود." : "Attendance could not be saved."));
      await loadDaily();
    } finally {
      setSaving(false);
    }
  }

  async function recordTime(record, action) {
    if (saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await api(`/attendance/${record.id}/${action}`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setNotice(isPersian ? "زمان حاضری ثبت شد." : "Attendance time recorded.");
      await Promise.all([loadDaily(), onRefresh()]);
    } catch (timeError) {
      setError(timeError.message || (isPersian ? "ثبت زمان ناموفق بود." : "Attendance time could not be recorded."));
      await loadDaily();
    } finally {
      setSaving(false);
    }
  }

  async function saveAttendanceSettings(event) {
    event.preventDefault();
    if (!settings || settingsSaving) return;
    setSettingsSaving(true);
    setError("");
    setNotice("");
    try {
      const saved = await api("/attendance/settings", {
        method: "PUT",
        body: JSON.stringify({
          office_open: settings.office_open || null,
          office_close: settings.office_close || null,
          grace_period_minutes: Number(settings.grace_period_minutes || 0),
          work_days: settings.work_days || [],
          holidays: holidayInput.split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
          shifts: settings.shifts || [],
        }),
      });
      setSettings(saved);
      setHolidayInput((saved.holidays || []).join("\n"));
      setNotice(isPersian ? "تنظیمات ذخیره شد." : "Attendance settings saved.");
      await loadDaily();
    } catch (settingsError) {
      setError(settingsError.message || (isPersian ? "ذخیره تنظیمات ناموفق بود." : "Attendance settings could not be saved."));
    } finally {
      setSettingsSaving(false);
    }
  }

  const updateSettings = (key, value) => setSettings((current) => ({ ...current, [key]: value }));
  const weekdays = isPersian
    ? [[1, "دوشنبه"], [2, "سه‌شنبه"], [3, "چهارشنبه"], [4, "پنجشنبه"], [5, "جمعه"], [6, "شنبه"], [7, "یکشنبه"]]
    : [[1, "Monday"], [2, "Tuesday"], [3, "Wednesday"], [4, "Thursday"], [5, "Friday"], [6, "Saturday"], [7, "Sunday"]];

  const setRecordDraft = (employee, key, value) => updateDraft(employee.id, key, value);

  return (
    <section className="daily-attendance" dir={isPersian ? "rtl" : "ltr"}>
      <header className="daily-attendance-heading">
        <div>
          <h2>{labels.printTitle}</h2>
          <p>{formatDate(date)}</p>
        </div>
        <span className={isSelectedDateToday ? "is-today" : ""}>
          {isSelectedDateToday ? labels.today : labels.date}
        </span>
      </header>
      <div className="daily-attendance-toolbar">
        <label className="daily-attendance-date">
          <span>{labels.date}</span>
          <input
            type="date"
            value={date}
            max={canRecord && !canCorrect ? getTodayKabulInputDate() : undefined}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <div className="daily-attendance-toolbar-actions">
          {canRecord && canSubmitSelectedDate && (
            <button type="button" className="primary-button" disabled={saving || loading} onClick={() => saveEntries(entries.filter((employee) => !employee.attendance), labels.bulkSuccess)}>
              {labels.submitAll}
            </button>
          )}
          <button type="button" className="secondary-button" onClick={() => window.print()}>{labels.print}</button>
        </div>
      </div>

      {canCorrect && (
        <div className="daily-attendance-settings">
          <button type="button" className="secondary-button" onClick={() => setSettingsOpen((open) => !open)}>
            {labels.settings}
          </button>
          {settingsOpen && (
            <form className="daily-attendance-settings-form" onSubmit={saveAttendanceSettings}>
              {!settings ? <div className="daily-attendance-state">{labels.loading}</div> : (
                <>
                  <label><span>{labels.opening}</span><input type="time" value={settings.office_open || ""} onChange={(event) => updateSettings("office_open", event.target.value || null)} /></label>
                  <label><span>{labels.closing}</span><input type="time" value={settings.office_close || ""} onChange={(event) => updateSettings("office_close", event.target.value || null)} /></label>
                  <label><span>{labels.grace}</span><input type="number" min="0" max="360" value={settings.grace_period_minutes ?? 0} onChange={(event) => updateSettings("grace_period_minutes", Number(event.target.value))} /></label>
                  <fieldset>
                    <legend>{labels.workDays}</legend>
                    <div className="daily-attendance-weekdays">
                      {weekdays.map(([day, label]) => (
                        <label key={day}>
                          <input
                            type="checkbox"
                            checked={(settings.work_days || []).includes(day)}
                            onChange={(event) => updateSettings("work_days", event.target.checked
                              ? [...(settings.work_days || []), day].sort((a, b) => a - b)
                              : (settings.work_days || []).filter((item) => item !== day))}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label className="daily-attendance-holidays"><span>{labels.holidays}</span><textarea rows="4" value={holidayInput} onChange={(event) => setHolidayInput(event.target.value)} placeholder="YYYY-MM-DD" /></label>
                  <fieldset className="daily-attendance-shifts">
                    <legend>{labels.shifts}</legend>
                    {(settings.shifts || []).map((shift, index) => (
                      <div className="daily-attendance-shift" key={`${shift.name}-${index}`}>
                        <input aria-label={labels.shiftName} value={shift.name} onChange={(event) => updateSettings("shifts", settings.shifts.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} />
                        <input aria-label={labels.opening} type="time" value={shift.start} onChange={(event) => updateSettings("shifts", settings.shifts.map((item, itemIndex) => itemIndex === index ? { ...item, start: event.target.value } : item))} />
                        <input aria-label={labels.closing} type="time" value={shift.end} onChange={(event) => updateSettings("shifts", settings.shifts.map((item, itemIndex) => itemIndex === index ? { ...item, end: event.target.value } : item))} />
                        <input aria-label={labels.grace} type="number" min="0" max="360" value={shift.grace_period_minutes || 0} onChange={(event) => updateSettings("shifts", settings.shifts.map((item, itemIndex) => itemIndex === index ? { ...item, grace_period_minutes: Number(event.target.value) } : item))} />
                        <button type="button" className="danger-button" onClick={() => updateSettings("shifts", settings.shifts.filter((_, itemIndex) => itemIndex !== index))}>{labels.delete}</button>
                      </div>
                    ))}
                    <button type="button" className="secondary-button" onClick={() => updateSettings("shifts", [...(settings.shifts || []), { name: "", start: settings.office_open || "09:00", end: settings.office_close || "17:00", grace_period_minutes: 0 }])}>{labels.addShift}</button>
                  </fieldset>
                  <button type="submit" className="primary-button" disabled={settingsSaving}>{settingsSaving ? labels.loading : labels.saveSettings}</button>
                </>
              )}
            </form>
          )}
        </div>
      )}

      <div className="daily-attendance-summary">
        {[
          [canRecord ? labels.total : labels.myAttendance, canRecord ? summary.total_employees : recordedForDate.length, "navy"],
          [labels.present, canRecord ? summary.present : recordedForDate.filter((row) => row.status === "Present").length, "green"],
          [labels.absent, canRecord ? summary.absent : recordedForDate.filter((row) => row.status === "Absent").length, "orange"],
          [labels.late, canRecord ? summary.late : recordedForDate.filter((row) => row.status === "Late").length, "blue"],
          [labels.halfDay, canRecord ? summary.half_day : recordedForDate.filter((row) => row.status === "Half Day").length, "purple"],
          [labels.onLeave, canRecord ? summary.on_leave : recordedForDate.filter((row) => row.status === "Leave").length, "teal"],
          [labels.holiday, canRecord ? summary.holiday : recordedForDate.filter((row) => row.status === "Holiday").length, "blue"],
          [labels.notMarked, canRecord ? summary.not_marked : 0, "gray"],
        ].map(([label, value, tone]) => (
          <article className={`daily-attendance-stat tone-${tone}`} key={label}>
            <span>{label}</span>
            <strong>{summaryAvailable ? value : "—"}</strong>
          </article>
        ))}
      </div>

      <div className="daily-attendance-reports">
        <article><span>{labels.week}</span><strong>{reportSummaryText(weeklySummary)}</strong></article>
        <article><span>{labels.month}</span><strong>{reportSummaryText(monthlySummary)}</strong></article>
      </div>

      {error && <div className="daily-attendance-message is-error" role="alert">{error}</div>}
      {notice && <div className="daily-attendance-message is-success" role="status">{notice}</div>}

      {canRecord ? (
        <>
          <h2 className="daily-attendance-print-title">{labels.printTitle} · {formatDate(date)}</h2>
          <div className="daily-attendance-filters">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={labels.search}
              aria-label={labels.search}
            />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label={labels.status}>
              <option value="all">{labels.all}</option>
              <option value="Not Marked">{labels.notMarked}</option>
              {statusOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </div>
          {loading && <div className="daily-attendance-state" role="status">{labels.loading}</div>}
          {!loading && entries.length === 0 && <div className="daily-attendance-state">{labels.empty}</div>}
          {!loading && entries.length > 0 && shownEntries.length === 0 && <div className="daily-attendance-state">{labels.noMatch}</div>}
          {!loading && shownEntries.length > 0 && (
            <div className="daily-attendance-table-wrap">
              <table className="daily-attendance-table">
                <thead><tr>
                  <th>{labels.employees}</th><th>{labels.identifier}</th><th>{labels.status}</th>
                  <th>{labels.checkIn}</th><th>{labels.checkOut}</th><th>{labels.duration}</th>
                  <th>{labels.notes}</th><th>{labels.actions}</th>
                </tr></thead>
                <tbody>
                  {shownEntries.map((employee) => {
                    const record = employee.attendance;
                    const draft = makeDraft(employee);
                    return (
                      <tr key={employee.id}>
                        <td data-label={labels.employees}>{employee.name || "—"}</td>
                        <td data-label={labels.identifier}>{employee.employee_number || employee.employee_code || employee.id || "—"}</td>
                        <td data-label={labels.status}>
                          {record ? <span className={`attendance-status status-${String(record.status || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{statusLabel(record.status)}</span> : <span className="attendance-status status-not-marked">{labels.notMarked}</span>}
                        </td>
                        <td data-label={labels.checkIn}>
                          {record || !canSubmitSelectedDate ? record?.check_in || "—" : <input type="time" value={draft.check_in} onChange={(event) => setRecordDraft(employee, "check_in", event.target.value)} aria-label={`${labels.checkIn}: ${employee.name}`} />}
                        </td>
                        <td data-label={labels.checkOut}>
                          {record || !canSubmitSelectedDate ? record?.check_out || "—" : <input type="time" value={draft.check_out} onChange={(event) => setRecordDraft(employee, "check_out", event.target.value)} aria-label={`${labels.checkOut}: ${employee.name}`} />}
                        </td>
                        <td data-label={labels.duration}>{workingDuration(record?.check_in || draft.check_in, record?.check_out || draft.check_out)}</td>
                        <td data-label={labels.notes}>{record || !canSubmitSelectedDate ? record?.notes || "—" : <input type="text" value={draft.notes} onChange={(event) => setRecordDraft(employee, "notes", event.target.value)} aria-label={`${labels.notes}: ${employee.name}`} />}</td>
                        <td data-label={labels.actions} className="daily-attendance-actions">
                          {!record ? (
                            canSubmitSelectedDate ? <>
                              <select value={draft.status} onChange={(event) => setRecordDraft(employee, "status", event.target.value)} aria-label={`${labels.status}: ${employee.name}`}>
                                {statusOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                              </select>
                              <button type="button" className="primary-button" disabled={saving} onClick={() => saveEntries([employee], labels.saveSuccess)}>{labels.submit}</button>
                            </> : <span>{labels.readOnly}</span>
                          ) : (
                            <>
                              {canRecord && (canCorrect || isSelectedDateToday) && !record.check_in && <button type="button" className="secondary-button" disabled={saving} onClick={() => recordTime(record, "check-in")}>{labels.checkInAction}</button>}
                              {canRecord && (canCorrect || isSelectedDateToday) && !record.check_out && <button type="button" className="secondary-button" disabled={saving} onClick={() => recordTime(record, "check-out")}>{labels.checkOutAction}</button>}
                              {canCorrect && <button type="button" className="secondary-button" onClick={() => onEdit(record)}>{labels.correction}</button>}
                              {canCorrect && <button type="button" className="danger-button" onClick={() => onDelete(record.id)}>{labels.delete}</button>}
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <section className="daily-attendance-history">
          <h2>{labels.history} · {formatDate(date)}</h2>
          {recordedForDate.length === 0 ? <div className="daily-attendance-state">{labels.noMatch}</div> : (
            <div className="daily-attendance-table-wrap">
              <table className="daily-attendance-table">
                <thead><tr><th>{labels.employees}</th><th>{labels.status}</th><th>{labels.checkIn}</th><th>{labels.checkOut}</th></tr></thead>
                <tbody>{recordedForDate.map((record) => (
                  <tr key={record.id}>
                    <td data-label={labels.employees}>{record.employee_name || labels.employees}</td>
                    <td data-label={labels.status}><span className={`attendance-status status-${String(record.status || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{statusLabel(record.status)}</span></td>
                    <td data-label={labels.checkIn}>{record.check_in || "—"}</td>
                    <td data-label={labels.checkOut}>{record.check_out || "—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </section>
  );
}

/* ================= APP ================= */

function App() {
  const [loggedIn, setLoggedIn] = useState(() => {
    const localToken =
      localStorage.getItem("office_token");

    const sessionToken =
      sessionStorage.getItem("office_token");

    const localLogged =
      localStorage.getItem("office_logged_in") === "true";

    const sessionLogged =
      sessionStorage.getItem("office_logged_in") === "true";

    return (
      (localLogged || sessionLogged) &&
      !!(localToken || sessionToken)
    );
  });

  const [currentUser, setCurrentUser] =
    useState(() => {
      try {
        const savedUser =
          localStorage.getItem("office_user") ||
          sessionStorage.getItem("office_user");

        return JSON.parse(
          savedUser || "null"
        );
      } catch {
        return null;
      }
    });
  const [accountVerified, setAccountVerified] = useState(false);
  const [accountVerificationError, setAccountVerificationError] = useState("");
  const [accountForm, setAccountForm] = useState(() => ({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
  }));
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [language, setLanguage] = useState(
    localStorage.getItem("office_language") || "en"
  );

  // Start with the refreshed sky-blue/lavender design for existing installations.
  // Save future choices separately, so a legacy saved "night" value does not
  // override the redesigned default on the first run after upgrading.
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("office_theme_v2");
    return savedTheme === "night" || savedTheme === "day" ? savedTheme : "day";
  });

  const [settings, setSettings] = useState(() => {
    try {
      return {
        ...DEFAULT_SETTINGS,
        ...JSON.parse(
          localStorage.getItem("office_settings") || "{}"
        ),
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [page, setPage] = useState(() =>
    "dashboard"
  );

  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [instructionForm, setInstructionForm] = useState({
    title: "",
    description: "",
  });
  const [editingInstruction, setEditingInstruction] = useState(null);
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [financeIncome, setFinanceIncome] = useState([]);
  const [financeExpenses, setFinanceExpenses] = useState([]);
  const [financeDebts, setFinanceDebts] = useState([]);

  const [employees, setEmployees] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("office_employees") || "[]");
    } catch {
      return [];
    }
  });

  const [contracts, setContracts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("office_contracts") || "[]");
    } catch {
      return [];
    }
  });

  const [photoStore, setPhotoStore] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("office_photo_store") || "{}");
    } catch {
      return {};
    }
  });

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [employeeForm, setEmployeeForm] = useState(emptyEmployee);
  const [contractForm, setContractForm] = useState(emptyContract);

  const [openMenu, setOpenMenu] = useState("finance");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    localStorage.getItem("office_sidebar_collapsed") === "true"
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customerContractFilter, setCustomerContractFilter] = useState("all");
  const [settingsTab, setSettingsTab] = useState("general");

  const [toast, setToast] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [recordFormOpen, setRecordFormOpen] = useState(false);

  const [rememberMe, setRememberMe] =
    useState(
      localStorage.getItem("office_remember_me") === "true"
    );
  const [forgotOpen, setForgotOpen] =
    useState(false);
  const [forgotEmail, setForgotEmail] =
    useState("");

  const [now, setNow] = useState(new Date());

  /* LOGIN */

  const [loginForm, setLoginForm] = useState({
    identity: "",
    password: "",
  });

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [registerForm, setRegisterForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

   
  /* FORMS */

  const [customerForm, setCustomerForm] =
    useState(emptyCustomer);

  const [userForm, setUserForm] =
    useState(emptyUser);

  const [attendanceForm, setAttendanceForm] =
    useState(emptyAttendance);

  const [paymentForm, setPaymentForm] =
    useState(emptyPayment);

  const [projectForm, setProjectForm] =
    useState(emptyProject);

  const [incomeForm, setIncomeForm] = useState(emptyIncome);
  const [expenseForm, setExpenseForm] = useState(emptyExpense);
  const [debtForm, setDebtForm] = useState(emptyDebt);

  const [editingCustomer, setEditingCustomer] =
    useState(null);

  const [editingUser, setEditingUser] =
    useState(null);

  const [editingAttendance, setEditingAttendance] =
    useState(null);

  const [editingPayment, setEditingPayment] =
    useState(null);

  const [editingProject, setEditingProject] =
    useState(null);
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingDebt, setEditingDebt] = useState(null);
  

  /* CURRENCY */

  const [currencyFrom, setCurrencyFrom] =
    useState("USD");

  const [currencyTo, setCurrencyTo] =
    useState("AFN");

  const [currencyAmount, setCurrencyAmount] =
    useState("1");

  /* ================= EFFECTS ================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "office_language",
      language
    );
  }, [language]);

  useEffect(() => {
    localStorage.setItem("office_theme", theme);
    localStorage.setItem("office_theme_v2", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(
      "office_settings",
      JSON.stringify(settings)
    );
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("office_employees", JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem("office_contracts", JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem("office_photo_store", JSON.stringify(photoStore));
  }, [photoStore]);

  useEffect(() => {
    localStorage.setItem(
      "office_sidebar_collapsed",
      sidebarCollapsed ? "true" : "false"
    );
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (loggedIn) {
      refreshAll();
    }
  }, [loggedIn]);

  useEffect(() => {
    if (page === "users" && !canManageAccountsAs(currentUser)) {
      setPage(isAdminRole(currentUser?.role) ? "attendance" : "dashboard");
      setRecordFormOpen(false);
    }
  }, [page, currentUser]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const t = TEXT[language];

  /* ================= API ================= */

  async function api(url, options = {}) {
    const token =
      localStorage.getItem("office_token") ||
      sessionStorage.getItem("office_token");

    const response = await fetch(`${API}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("office_logged_in");
        localStorage.removeItem("office_token");
        localStorage.removeItem("office_user");
        sessionStorage.removeItem("office_logged_in");
        sessionStorage.removeItem("office_token");
        sessionStorage.removeItem("office_user");
        setLoggedIn(false);
        setCurrentUser(null);
        setAccountVerified(false);
        setAccountVerificationError("");
      }

      throw new Error(
        data.error ||
          data.message ||
          "Something went wrong"
      );
    }

    return data;
  }

  /* ================= FETCH ================= */

  async function fetchCustomers() {
    const data = await api("/customers");
    setCustomers(data);
  }

  async function fetchUsers(account = currentUser) {
    if (!canManageAccountsAs(account)) {
      setUsers([]);
      return;
    }

    const data = await api("/users");
    setUsers(data);
  }

  async function fetchAccount() {
    const account = await api("/api/me");
    setCurrentUser(account);
    if (!isSupportedRole(account.role)) {
      throw new Error("This account role is not active.");
    }
    if (
      normalizeRoleValue(currentUser?.role) !==
      normalizeRoleValue(account.role)
    ) {
      setPage("dashboard");
      setRecordFormOpen(false);
    }
    setAccountForm({
      name: account.name || "",
      email: account.email || "",
      phone: account.phone || "",
    });

    const storage = localStorage.getItem("office_token")
      ? localStorage
      : sessionStorage;
    storage.setItem("office_user", JSON.stringify(account));
    setAccountVerificationError("");
    setAccountVerified(true);
    return account;
  }

  async function fetchEmployees() {
    let cached = [];
    try {
      cached = JSON.parse(localStorage.getItem("office_employees") || "[]");
      if (!Array.isArray(cached)) cached = [];
    } catch {
      cached = [];
    }

    try {
      let data = await api("/employees");
      if (!Array.isArray(data)) data = [];

      // Preserve existing employees created by the earlier local-only version.
      if (
        data.length === 0 &&
        cached.length > 0 &&
        canManageAccountsAs(currentUser)
      ) {
        for (const item of cached) {
          const { id, created_at, ...payload } = item;
          await api("/employees", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }
        data = await api("/employees");
      }

      setEmployees(Array.isArray(data) ? data : []);
      saveLocalList("office_employees", Array.isArray(data) ? data : []);
    } catch (error) {
      setEmployees(isAdminRole(currentUser?.role) ? [] : cached);
      console.warn("Could not load employees from API:", error.message);
    }
  }

  async function fetchContracts() {
    let cached = [];
    try {
      cached = JSON.parse(localStorage.getItem("office_contracts") || "[]");
      if (!Array.isArray(cached)) cached = [];
    } catch {
      cached = [];
    }

    try {
      let data = await api("/contracts");
      if (!Array.isArray(data)) data = [];

      // Preserve existing contracts created by the earlier local-only version.
      if (
        data.length === 0 &&
        cached.length > 0 &&
        canManageAccountsAs(currentUser)
      ) {
        for (const item of cached) {
          const { id, created_at, days_left, contract_status, ...payload } = item;
          await api("/contracts", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }
        data = await api("/contracts");
      }

      setContracts(Array.isArray(data) ? data : []);
      saveLocalList("office_contracts", Array.isArray(data) ? data : []);
    } catch (error) {
      setContracts(cached);
      console.warn("Could not load contracts from API:", error.message);
    }
  }

  async function fetchAttendance() {
    const data = await api("/attendance");
    setAttendance(Array.isArray(data) ? data : []);
  }

  async function fetchInstructions() {
    const data = await api("/instructions");
    setInstructions(Array.isArray(data) ? data : []);
  }

  async function saveInstruction(event) {
    event.preventDefault();
    try {
      if (editingInstruction) {
        await api(`/instructions/${editingInstruction}`, {
          method: "PUT",
          body: JSON.stringify(instructionForm),
        });
      } else {
        await api("/instructions", {
          method: "POST",
          body: JSON.stringify(instructionForm),
        });
      }
      setInstructionForm({ title: "", description: "" });
      setEditingInstruction(null);
      await fetchInstructions();
      showToast(language === "fa" ? "دستور صادر شد" : "Instruction issued");
    } catch (error) {
      showToast(error.message);
    }
  }

  async function deleteInstruction(id) {
    try {
      await api(`/instructions/${id}`, { method: "DELETE" });
      await fetchInstructions();
      showToast(language === "fa" ? "دستور حذف شد" : "Instruction deleted");
    } catch (error) {
      showToast(error.message);
    }
  }

  async function fetchPayments() {
    const data = await api("/payments");
    setPayments(data);
  }

  async function fetchProjects() {
    const data = await api("/projects");
    setProjects(data);
  }

  async function fetchFinanceIncome() {
    const data = await api("/finance/income");
    setFinanceIncome(data);
  }

  async function fetchFinanceExpenses() {
    const data = await api("/finance/expenses");
    setFinanceExpenses(data);
  }

  async function fetchFinanceDebts() {
    const data = await api("/finance/debts");
    setFinanceDebts(data);
  }

  async function refreshAll() {
    setRefreshing(true);

    try {
      const account = await fetchAccount();
      if (isAdminRole(account.role)) {
        setUsers([]);
        await Promise.all([
          fetchEmployees(),
          fetchAttendance(),
          fetchInstructions(),
        ]);
      } else {
        const businessData = [
          fetchCustomers(),
          fetchEmployees(),
          fetchContracts(),
          fetchAttendance(),
          fetchPayments(),
          fetchProjects(),
          fetchFinanceIncome(),
          fetchFinanceExpenses(),
          fetchFinanceDebts(),
          fetchInstructions(),
        ];
        if (canManageAccountsAs(account)) {
          businessData.push(fetchUsers(account));
        } else {
          setUsers([]);
        }
        await Promise.all(businessData);
      }

      showToast(
        language === "fa"
          ? "اطلاعات تازه شد"
          : "Data refreshed"
      );
    } catch (error) {
      showToast(error.message);
      if (!accountVerified) {
        setAccountVerificationError(error.message);
      }
      if (error.message.includes("not active")) {
        logout();
      }
    }

    setRefreshing(false);
  }

  function refreshPage() {
    setRefreshing(true);

    setTimeout(() => {
      window.location.reload();
    }, 250);
  }

  /* ================= TOAST ================= */

  function showToast(message) {
    setToast(message);
  }

  function getStoredPhoto(type, id) {
    return photoStore[`${type}:${id}`] || "";
  }

  function rememberPhoto(type, id, photo) {
    if (!id || !photo) return;
    setPhotoStore((old) => ({
      ...old,
      [`${type}:${id}`]: photo,
    }));
  }

  function backupVisibleTableToExcel(targetPage = page) {
    const table = document.querySelector(".table-card table");

    if (!table) {
      showToast(
        language === "fa"
          ? "جدول برای گرفتن Excel پیدا نشد."
          : "No table is available for Excel export."
      );
      return;
    }

    const cloned = table.cloneNode(true);
    cloned.querySelectorAll("tr").forEach((row) => {
      row.querySelectorAll("td:last-child, th:last-child").forEach((cell) => {
        cell.remove();
      });
    });

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${cloned.outerHTML}</body></html>`;
    const blob = new Blob(["\ufeff", html], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `office-${targetPage}-${getTodayInputDate()}.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showToast(
      language === "fa"
        ? "فایل Excel ساخته شد."
        : "Excel backup created."
    );
  }

  async function downloadExcelBackup(targetPage = page) {
    const entity = ({
      customers: "customers",
      employees: "employees",
      users: "users",
      attendance: "attendance",
      payments: "payments",
      projects: "projects",
      income: "income",
      expenses: "expenses",
      debts: "debts",
      contracts: "contracts",
    })[targetPage];

    if (!entity) {
      showToast(language === "fa" ? "برای این بخش Excel موجود نیست." : "Excel backup is not available for this section.");
      return;
    }

    try {
      const token =
        localStorage.getItem("office_token") ||
        sessionStorage.getItem("office_token");

      const response = await fetch(`${API}/backup/${entity}`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        let message = "Excel backup failed.";
        try {
          const problem = await response.json();
          message = problem.message || problem.error || message;
        } catch {
          // The server may return a plain-text error.
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `office-${entity}-${getTodayInputDate()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast(language === "fa" ? `فایل Excel کامل ${entity} دانلود شد.` : `${entity} Excel backup downloaded.`);
    } catch (error) {
      showToast(error.message || (language === "fa" ? "ساخت Excel ناکام شد." : "Could not create Excel backup."));
    }
  }

  function printVisibleTable(targetPage = page) {
    const table = document.querySelector(".table-card table");

    if (!table) {
      showToast(
        language === "fa"
          ? "جدول برای چاپ پیدا نشد."
          : "No table is available for printing."
      );
      return;
    }

    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) {
      showToast(
        language === "fa"
          ? "پنجره چاپ باز نشد."
          : "Print window was blocked."
      );
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="${language}" dir="${language === "fa" ? "rtl" : "ltr"}">
      <head>
        <meta charset="UTF-8" />
        <title>${targetPage}</title>
        <style>
          body{font-family:Arial,sans-serif;padding:24px;color:#111;background:#fff}
          h1{margin:0 0 18px;font-size:22px}
          table{width:100%;border-collapse:collapse}
          th,td{border:1px solid #999;padding:8px;text-align:start;font-size:12px}
          th{background:#eee}
          @media print{button{display:none}}
        </style>
      </head>
      <body>
        <h1>${targetPage}</h1>
        ${table.outerHTML}
        <script>window.onload=function(){window.print();};<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  function backupSectionSoon(targetPage) {
    window.setTimeout(() => downloadExcelBackup(targetPage), 500);
  }

  function contractDaysLeft(dateValue) {
    if (!dateValue) return null;
    const end = new Date(`${String(dateValue).slice(0, 10)}T23:59:59`);
    const nowDate = new Date();
    const diff = end.getTime() - nowDate.getTime();
    return Math.ceil(diff / 86400000);
  }

  function contractStatus(dateValue) {
    const days = contractDaysLeft(dateValue);
    if (days === null) return { label: "—", className: "" };
    if (days < 0) {
      return {
        label: language === "fa" ? "تمام شده" : "EXPIRED",
        className: "expired",
      };
    }
    if (days <= 7) {
      return {
        label: language === "fa" ? `نزدیک به ختم (${days} روز)` : `ENDING SOON (${days} DAYS)`,
        className: "ending-soon",
      };
    }
    return {
      label: language === "fa" ? `${days} روز باقی مانده` : `${days} DAYS LEFT`,
      className: "normal",
    };
  }

  function saveLocalList(key, next) {
    localStorage.setItem(key, JSON.stringify(next));
  }

  /* ================= LOGIN ================= */

  async function handleLogin(e) {
    e.preventDefault();

    setLoginLoading(true);
    setLoginError("");

    const identity = loginForm.identity.trim();
    const password = loginForm.password;

    if (!identity || !password) {
      setLoginError(
        language === "fa"
          ? "ایمیل و رمز عبور را وارد کنید."
          : "Please enter your email and password."
      );
      setLoginLoading(false);
      return;
    }

    try {
      const data = await api("/login", {
        method: "POST",
        body: JSON.stringify({
          email: identity,
          username: identity,
          password,
        }),
      });

      localStorage.removeItem("office_logged_in");
      localStorage.removeItem("office_token");
      localStorage.removeItem("office_user");

      sessionStorage.removeItem("office_logged_in");
      sessionStorage.removeItem("office_token");
      sessionStorage.removeItem("office_user");

      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      storage.setItem(
        "office_logged_in",
        "true"
      );
      storage.setItem(
        "office_token",
        data.token
      );
      storage.setItem(
        "office_user",
        JSON.stringify(data.user)
      );

      if (rememberMe) {
        localStorage.setItem(
          "office_remember_me",
          "true"
        );
      } else {
        localStorage.removeItem(
          "office_remember_me"
        );
      }

      setCurrentUser(data.user);
      setPage("dashboard");
      setLoggedIn(true);

      setLoginForm({
        identity: "",
        password: "",
      });

      showToast(
        language === "fa"
          ? "ورود موفقانه بود"
          : "Login successful"
      );
    } catch (error) {
      const needsActiveRole = String(error?.message || "")
        .toLowerCase()
        .includes("active role");
      const message = needsActiveRole
        ? language === "fa"
          ? "برای ورود، حساب باید توسط سوپر ادمین به یک نقش فعال اختصاص داده شود."
          : "A Super Admin must assign your account an active role before you can sign in."
        : language === "fa"
          ? "ایمیل یا رمز عبور اشتباه است."
          : "Incorrect email or password.";

      setLoginError(message);
      showToast(message);
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegisterError("");

    const { name, username, email, password, confirmPassword } = registerForm;

    if (!name.trim() || !username.trim() || !password) {
      setRegisterError(
        language === "fa"
          ? "نام، نام کاربری و رمز عبور الزامی است."
          : "Name, username and password are required."
      );
      return;
    }

    if (username.trim().length < 3) {
      setRegisterError(
        language === "fa"
          ? "نام کاربری باید حداقل ۳ حرف داشته باشد."
          : "Username must contain at least 3 characters."
      );
      return;
    }

    if (password.length < 8) {
      setRegisterError(
        language === "fa"
          ? "رمز عبور باید حداقل ۸ حرف داشته باشد."
          : "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setRegisterError(
        language === "fa"
          ? "رمز عبور و تکرار آن یکسان نیستند."
          : "Passwords do not match."
      );
      return;
    }

    setRegisterLoading(true);

    try {
      await api("/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      setLoginForm({ identity: username.trim(), password: "" });
      setRegisterForm({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setRegisterError("");
      setAuthMode("login");

      showToast(
        language === "fa"
          ? "حساب ساخته شد. پس از تعیین نقش توسط سوپر ادمین می‌توانید وارد شوید."
          : "Account created. A Super Admin must assign an active role before sign-in."
      );
    } catch (error) {
      const rawMessage = String(error?.message || "");
      let message = rawMessage || (
        language === "fa" ? "ساخت حساب موفق نشد." : "Could not create account."
      );

      if (rawMessage.includes("already exists")) {
        message = language === "fa"
          ? "این نام کاربری یا ایمیل قبلاً ثبت شده است."
          : "That username or email is already registered.";
      }

      setRegisterError(message);
    } finally {
      setRegisterLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("office_logged_in");
    localStorage.removeItem("office_token");
    localStorage.removeItem("office_user");

    sessionStorage.removeItem("office_logged_in");
    sessionStorage.removeItem("office_token");
    sessionStorage.removeItem("office_user");

    setLoggedIn(false);
    setCurrentUser(null);
    setAccountVerified(false);
    setAccountVerificationError("");
    setUsers([]);
    setPage("dashboard");
    setRecordFormOpen(false);
  }

  async function saveAccount(e) {
    e.preventDefault();

    try {
      await api("/api/me", {
        method: "PUT",
        body: JSON.stringify(accountForm),
      });
      await fetchAccount();
      showToast(
        language === "fa"
          ? "اطلاعات حساب ذخیره شد"
          : "Account information saved"
      );
    } catch (error) {
      showToast(error.message);
    }
  }

  async function changePassword(e) {
    e.preventDefault();

    try {
      await api("/api/me/password", {
        method: "POST",
        body: JSON.stringify(passwordForm),
      });
      setPasswordForm({ currentPassword: "", newPassword: "" });
      showToast(
        language === "fa"
          ? "رمز عبور تغییر کرد"
          : "Password changed"
      );
    } catch (error) {
      showToast(error.message);
    }
  }

  /* ================= SETTINGS ================= */

  function toggleSetting(key) {
    setSettings((old) => ({
      ...old,
      [key]: !old[key],
    }));
  }

  function focusEditForm() {
    setTimeout(() => {
      const form = document.querySelector(".form-card");
      if (form) {
        form.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);
  }

  function startNewRecord(targetPage = page) {
    if (
      (targetPage === "users" && !canManageAccountsAs(currentUser)) ||
      !canCreateRecordAs(currentUser, targetPage)
    ) {
      return;
    }

    setPage(targetPage);
    setSearch("");
    setRecordFormOpen(true);

    setEditingCustomer(null);
    setEditingUser(null);
    setEditingAttendance(null);
    setEditingPayment(null);
    setEditingProject(null);
    setEditingIncome(null);
    setEditingExpense(null);
    setEditingDebt(null);
    setEditingEmployee(null);
    setEditingContract(null);

    if (targetPage === "employees") {
      setEmployeeForm(emptyEmployee);
    }

    if (targetPage === "contracts") {
      setContractForm({
        ...emptyContract,
        contract_start: getTodayInputDate(),
      });
    }

    if (targetPage === "customers") {
      setCustomerForm(emptyCustomer);
    }

    if (targetPage === "users") {
      setUserForm(emptyUser);
    }

    if (targetPage === "attendance") {
      setAttendanceForm({
        ...emptyAttendance,
        date: getTodayKabulInputDate(),
      });
    }

    if (targetPage === "payments") {
      setPaymentForm({
        ...emptyPayment,
        date: getTodayInputDate(),
      });
    }

    if (targetPage === "projects") {
      setProjectForm(emptyProject);
    }

    if (targetPage === "income") {
      setIncomeForm({
        ...emptyIncome,
        date: getTodayInputDate(),
      });
    }

    if (targetPage === "expenses") {
      setExpenseForm({
        ...emptyExpense,
        date: getTodayInputDate(),
      });
    }

    if (targetPage === "debts") {
      setDebtForm(emptyDebt);
    }

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 80);
  }

  function showListPage(targetPage) {
    if (targetPage === "users" && !canManageAccountsAs(currentUser)) {
      setPage("dashboard");
      setRecordFormOpen(false);
      return;
    }

    setPage(targetPage);
    setSearch("");
    setRecordFormOpen(false);

    setEditingCustomer(null);
    setEditingUser(null);
    setEditingAttendance(null);
    setEditingPayment(null);
    setEditingProject(null);
    setEditingIncome(null);
    setEditingExpense(null);
    setEditingDebt(null);
    setEditingEmployee(null);
    setEditingContract(null);
  }

  function toggleSection(menu, targetPage) {
    setOpenMenu((current) =>
      current === menu ? "" : menu
    );

    setRecordFormOpen(false);

    if (targetPage) {
      showListPage(targetPage);
    }
  }

  /* ================= CUSTOMER ================= */

  async function saveCustomer(e) {
    e.preventDefault();

    try {
      let result;

      if (editingCustomer) {
        result = await api(
          `/customers/${editingCustomer}`,
          {
            method: "PUT",
            body: JSON.stringify(customerForm),
          }
        );

        if (customerForm.photo) {
          rememberPhoto("customer", editingCustomer, customerForm.photo);
        }

        showToast(
          language === "fa"
            ? "مشتری ویرایش شد"
            : "Customer updated"
        );
      } else {
        result = await api("/customers", {
          method: "POST",
          body: JSON.stringify(customerForm),
        });

        if (customerForm.photo && result?.id) {
          rememberPhoto("customer", result.id, customerForm.photo);
        }

        showToast(
          language === "fa"
            ? "مشتری اضافه شد"
            : "Customer added"
        );
      }

      setCustomerForm(emptyCustomer);
      setEditingCustomer(null);
      setRecordFormOpen(false);

      await fetchCustomers();
      backupSectionSoon("customers");
    } catch (error) {
      showToast(error.message);
    }
  }

  function editCustomer(item) {
    setEditingCustomer(item.id);
    setRecordFormOpen(true);

    setCustomerForm({
      name: item.name || "",
      phone: item.phone || "",
      shop_name: item.shop_name || "",
      shop_number: item.shop_number || "",
      address: item.address || "",
      contract_id: item.contract_id || "",
      date_id: item.date_id || "",
      photo: getStoredPhoto("customer", item.id),
    });

    focusEditForm();
  }

  async function deleteCustomer(id) {
    if (!window.confirm(
      language === "fa"
        ? "آیا مطمئن هستید؟"
        : "Are you sure?"
    )) {
      return;
    }

    try {
      await api(`/customers/${id}`, {
        method: "DELETE",
      });

      await fetchCustomers();

      showToast(
        language === "fa"
          ? "مشتری حذف شد"
          : "Customer deleted"
      );
    } catch (error) {
      showToast(error.message);
    }
  }

  /* ================= USER ================= */

  async function saveUser(e) {
    e.preventDefault();

    try {
      let result;

      if (editingUser) {
        result = await api(`/users/${editingUser}`, {
          method: "PUT",
          body: JSON.stringify(userForm),
        });

        if (userForm.photo) {
          rememberPhoto("user", editingUser, userForm.photo);
        }

        showToast(
          language === "fa"
            ? "کاربر ویرایش شد"
            : "User updated"
        );
      } else {
        result = await api("/users", {
          method: "POST",
          body: JSON.stringify(userForm),
        });

        if (userForm.photo && result?.id) {
          rememberPhoto("user", result.id, userForm.photo);
        }

        showToast(
          language === "fa"
            ? "کاربر اضافه شد"
            : "User added"
        );
      }

      setUserForm(emptyUser);
      setEditingUser(null);
      setRecordFormOpen(false);

      await fetchUsers();
      backupSectionSoon("users");
    } catch (error) {
      showToast(error.message);
    }
  }

  function editUser(item) {
    setEditingUser(item.id);
    setRecordFormOpen(true);

    setUserForm({
      name: item.name || "",
      email: item.email || "",
      username: item.username || "",
      password: "",
      role: item.role || "user",
      is_active: Number(item.is_active ?? 1),
      photo: getStoredPhoto("user", item.id),
    });

    focusEditForm();
  }

  async function deleteUser(id) {
    if (!window.confirm(
      language === "fa"
        ? "آیا مطمئن هستید؟"
        : "Are you sure?"
    )) {
      return;
    }

    try {
      await api(`/users/${id}`, {
        method: "DELETE",
      });

      await fetchUsers();

      showToast(
        language === "fa"
          ? "کاربر حذف شد"
          : "User deleted"
      );
    } catch (error) {
      showToast(error.message);
    }
  }

  /* ================= ATTENDANCE ================= */

  async function saveAttendance(e) {
    e.preventDefault();

    const selectedEmployeeId = String(
      attendanceForm.employee_id ?? ""
    ).trim();

    if (!selectedEmployeeId) {
      showToast(
        language === "fa"
          ? "لطفاً ابتدا کارمند را انتخاب کنید"
          : "Please select an employee first."
      );
      return;
    }

    if (!/^\d+$/.test(selectedEmployeeId)) {
      showToast(
        language === "fa"
          ? "شناسهٔ کارمند معتبر نیست"
          : "The selected employee ID is invalid."
      );
      return;
    }

    if (!attendanceForm.date) {
      showToast(
        language === "fa"
          ? "تاریخ حاضری را انتخاب کنید"
          : "Please select the attendance date."
      );
      return;
    }

    const payload = {
      employee_id: Number(selectedEmployeeId),
      date: attendanceForm.date,
      check_in: attendanceForm.check_in || null,
      check_out: attendanceForm.check_out || null,
      status: attendanceForm.status || "Present",
      notes: attendanceForm.notes || null,
    };

    try {
      if (editingAttendance) {
        await api(`/attendance/${editingAttendance}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/attendance", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      await fetchAttendance();

      setAttendanceForm({
        ...emptyAttendance,
        date: getTodayKabulInputDate(),
      });
      setEditingAttendance(null);
      setRecordFormOpen(false);

      showToast(
        language === "fa"
          ? "حاضری با موفقیت ذخیره شد"
          : "Attendance saved successfully."
      );
    } catch (error) {
      showToast(
        `${language === "fa" ? "ذخیرهٔ حاضری ناکام شد" : "Could not save attendance"}: ${error.message}`
      );
    }
  }

  function editAttendance(item) {
  setEditingAttendance(item.id);

  setAttendanceForm({
    employee_id: item.employee_id || "",
    date: formatInputDate(item.date),
    check_in: item.check_in || "",
    check_out: item.check_out || "",
    status: item.status || "Present",
    notes: item.notes || "",
  });

  setRecordFormOpen(true);

  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, 80);
}

  async function deleteAttendance(id) {
    if (!window.confirm(
      language === "fa"
        ? "آیا مطمئن هستید؟"
        : "Are you sure?"
    )) {
      return;
    }

    try {
      await api(`/attendance/${id}`, {
        method: "DELETE",
      });

      await fetchAttendance();

      showToast(
        language === "fa"
          ? "حاضری حذف شد"
          : "Attendance deleted"
      );
    } catch (error) {
      showToast(error.message);
    }
  }

  /* ================= PAYMENTS ================= */

  async function savePayment(e) {
    e.preventDefault();

    try {
      if (editingPayment) {
        await api(`/payments/${editingPayment}`, {
          method: "PUT",
          body: JSON.stringify(paymentForm),
        });
      } else {
        await api("/payments", {
          method: "POST",
          body: JSON.stringify(paymentForm),
        });
      }

      setPaymentForm({
        ...emptyPayment,
        date: getTodayInputDate(),
      });
      setEditingPayment(null);
      setRecordFormOpen(false);

      await fetchPayments();
      backupSectionSoon("payments");

      showToast(
        language === "fa"
          ? "پرداخت ذخیره شد"
          : "Payment saved"
      );
    } catch (error) {
      showToast(error.message);
    }
  }

  function editPayment(item) {
    setEditingPayment(item.id);
    setRecordFormOpen(true);

    setPaymentForm({
      customer_id: item.customer_id || "",
      amount: item.amount || "",
      type: item.type || "Paid",
      date: formatInputDate(item.date),
      description: item.description || "",
    });

    focusEditForm();
  }

  async function deletePayment(id) {
    if (!window.confirm(
      language === "fa"
        ? "آیا مطمئن هستید؟"
        : "Are you sure?"
    )) {
      return;
    }

    try {
      await api(`/payments/${id}`, {
        method: "DELETE",
      });

      await fetchPayments();

      showToast(
        language === "fa"
          ? "پرداخت حذف شد"
          : "Payment deleted"
      );
    } catch (error) {
      showToast(error.message);
    }
  }

  function printPaymentReceipt(item) {
    const customerName =
      getCustomerName(
        customers,
        item.customer_id
      );

    const receiptWindow =
      window.open(
        "",
        "_blank",
        "width=420,height=700"
      );

    if (!receiptWindow) {
      showToast(
        language === "fa"
          ? "پنجره رسید باز نشد."
          : "Receipt window was blocked."
      );
      return;
    }

    const title =
      language === "fa"
        ? "رسید پرداخت"
        : "PAYMENT RECEIPT";

    const customerLabel =
      language === "fa"
        ? "مشتری"
        : "Customer";

    const amountLabel =
      language === "fa"
        ? "مبلغ"
        : "Amount";

    const typeLabel =
      language === "fa"
        ? "نوع پرداخت"
        : "Payment Type";

    const dateLabel =
      language === "fa"
        ? "تاریخ"
        : "Date";

    const descriptionLabel =
      language === "fa"
        ? "توضیحات"
        : "Description";

    const printLabel =
      language === "fa"
        ? "چاپ رسید"
        : "PRINT RECEIPT";

    const dir =
      language === "fa"
        ? "rtl"
        : "ltr";

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html lang="${language}" dir="${dir}">
        <head>
          <meta charset="UTF-8" />
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 30px;
              background: #f4f6f8;
            }

            .receipt {
              width: 100%;
              max-width: 360px;
              margin: auto;
              background: white;
              padding: 28px;
              border-radius: 18px;
              box-sizing: border-box;
              box-shadow: 0 10px 35px rgba(0,0,0,.10);
            }

            h1 {
              text-align: center;
              margin-bottom: 25px;
            }

            .row {
              display: flex;
              justify-content: space-between;
              gap: 15px;
              padding: 11px 0;
              border-bottom: 1px solid #e5e7eb;
            }

            .label {
              font-weight: 700;
            }

            .print-btn {
              width: 100%;
              margin-top: 20px;
              padding: 12px;
              border: 0;
              border-radius: 10px;
              cursor: pointer;
              font-weight: 700;
            }

            @media print {
              body {
                background: white;
                padding: 0;
              }

              .receipt {
                box-shadow: none;
                max-width: 100%;
              }

              .print-btn {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <h1>${title}</h1>

            <div class="row">
              <span class="label">${customerLabel}</span>
              <span>${customerName}</span>
            </div>

            <div class="row">
              <span class="label">${amountLabel}</span>
              <span>${formatMoney(item.amount)}</span>
            </div>

            <div class="row">
              <span class="label">${typeLabel}</span>
              <span>${item.type || "-"}</span>
            </div>

            <div class="row">
              <span class="label">${dateLabel}</span>
              <span>${formatDisplayDate(item.date, language)}</span>
            </div>

            <div class="row">
              <span class="label">${descriptionLabel}</span>
              <span>${item.description || "-"}</span>
            </div>

            <button class="print-btn" onclick="window.print()">
              ${printLabel}
            </button>
          </div>
        </body>
      </html>
    `);

    receiptWindow.document.close();
    receiptWindow.focus();

    setTimeout(() => {
      receiptWindow.print();
    }, 300);
  }

  /* ================= FINANCE ================= */

  async function saveIncome(e) {
  e.preventDefault();

  try {
    const payload = {
      ...incomeForm,
      date: incomeForm.date || getTodayInputDate(),
    };

    if (editingIncome) {
      await api(`/finance/income/${editingIncome}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      await api("/finance/income", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    setIncomeForm({
      ...emptyIncome,
      date: getTodayInputDate(),
    });

    setEditingIncome(null);
    setRecordFormOpen(false);

    await fetchFinanceIncome();
    backupSectionSoon("income");

    showToast(
      language === "fa"
        ? "درآمد با موفقیت ثبت شد"
        : "Income saved successfully"
    );
  } catch (error) {
    showToast(
      error.message ||
        (language === "fa"
          ? "ثبت درآمد انجام نشد"
          : "Failed to save income")
    );
  }
}

  function editIncome(item) {
    setEditingIncome(item.id);
    setRecordFormOpen(true);
    setIncomeForm({
      source: item.source || "",
      amount: item.amount || "",
      date: formatInputDate(item.date),
      description: item.description || "",
    });
    focusEditForm();
  }

  async function deleteIncome(id) {
    if (!window.confirm(language === "fa" ? "آیا مطمئن هستید؟" : "Are you sure?")) return;
    try {
      await api(`/finance/income/${id}`, { method: "DELETE" });
      await fetchFinanceIncome();
      showToast(language === "fa" ? "درآمد حذف شد" : "Income deleted");
    } catch (error) { showToast(error.message); }
  }

  async function saveExpense(e) {
  e.preventDefault();

  try {
    const payload = {
      ...expenseForm,
      date: expenseForm.date || getTodayInputDate(),
    };

    if (editingExpense) {
      await api(`/finance/expenses/${editingExpense}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      await api("/finance/expenses", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    setExpenseForm({
      ...emptyExpense,
      date: getTodayInputDate(),
    });

    setEditingExpense(null);
    setRecordFormOpen(false);

    await fetchFinanceExpenses();
    backupSectionSoon("expenses");

    showToast(
      language === "fa"
        ? "مصرف با موفقیت ثبت شد"
        : "Expense saved successfully"
    );
  } catch (error) {
    showToast(
      error.message ||
        (language === "fa"
          ? "ثبت مصرف انجام نشد"
          : "Failed to save expense")
    );
  }
}

  function editExpense(item) {
    setEditingExpense(item.id);
    setRecordFormOpen(true);
    setExpenseForm({
      title: item.title || "",
      amount: item.amount || "",
      category: item.category || "",
      date: formatInputDate(item.date),
      description: item.description || "",
    });
    focusEditForm();
  }

  async function deleteExpense(id) {
    if (!window.confirm(language === "fa" ? "آیا مطمئن هستید؟" : "Are you sure?")) return;
    try {
      await api(`/finance/expenses/${id}`, { method: "DELETE" });
      await fetchFinanceExpenses();
      showToast(language === "fa" ? "مصرف حذف شد" : "Expense deleted");
    } catch (error) { showToast(error.message); }
  }

  async function saveDebt(e) {
    e.preventDefault();
    if (!customers.length) {
  showToast(
    language === "fa"
      ? "اول یک مشتری ثبت کنید، سپس قرض را ثبت کنید."
      : "Please add a customer before recording a debt."
  );

  return;
}
    try {
      const payload = { ...debtForm, paid_amount: debtForm.paid_amount || 0 };
      if (editingDebt) {
        await api(`/finance/debts/${editingDebt}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/finance/debts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setDebtForm(emptyDebt);
      setEditingDebt(null);
      setRecordFormOpen(false);
      await fetchFinanceDebts();
      backupSectionSoon("debts");
      showToast(language === "fa" ? "قرض ذخیره شد" : "Debt saved");
    } catch (error) { showToast(error.message); }
  }

  function editDebt(item) {
    setEditingDebt(item.id);
    setRecordFormOpen(true);
    setDebtForm({
      customer_id: item.customer_id || "",
      amount: item.amount || "",
      paid_amount: item.paid_amount || "",
      due_date: formatInputDate(item.due_date),
      status: item.status || "Pending",
      description: item.description || "",
    });
    focusEditForm();
  }

  async function deleteDebt(id) {
    if (!window.confirm(language === "fa" ? "آیا مطمئن هستید؟" : "Are you sure?")) return;
    try {
      await api(`/finance/debts/${id}`, { method: "DELETE" });
      await fetchFinanceDebts();
      showToast(language === "fa" ? "قرض حذف شد" : "Debt deleted");
    } catch (error) { showToast(error.message); }
  }

  const financeIncomeRecordsTotal = useMemo(() =>
    financeIncome.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [financeIncome]
  );

  const financePaymentIncomeTotal = useMemo(() =>
    payments
      .filter((p) => String(p.type).toLowerCase() === "paid")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payments]
  );

  const financePaymentUnpaidTotal = useMemo(() =>
    payments
      .filter((p) => String(p.type).toLowerCase() === "unpaid")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payments]
  );

  const financeExpenseTotal = useMemo(() =>
    financeExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [financeExpenses]
  );

  const financeIncomeTotal = financeIncomeRecordsTotal + financePaymentIncomeTotal;

  const financeReceivableTotal = useMemo(() =>
    financeDebts.reduce((sum, item) =>
      sum + Math.max(0, Number(item.amount || 0) - Number(item.paid_amount || 0)), 0) +
    financePaymentUnpaidTotal,
    [financeDebts, financePaymentUnpaidTotal]
  );

  /* ================= PROJECT ================= */

  async function saveProject(e) {
    e.preventDefault();

    try {
      if (editingProject) {
        await api(`/projects/${editingProject}`, {
          method: "PUT",
          body: JSON.stringify(projectForm),
        });
      } else {
        await api("/projects", {
          method: "POST",
          body: JSON.stringify(projectForm),
        });
      }

      setProjectForm(emptyProject);
      setEditingProject(null);
      setRecordFormOpen(false);

      await fetchProjects();
      backupSectionSoon("projects");

      showToast(
        language === "fa"
          ? "پروژه ذخیره شد"
          : "Project saved"
      );
    } catch (error) {
      showToast(error.message);
    }
  }

  function editProject(item) {
    setEditingProject(item.id);
    setRecordFormOpen(true);

    setProjectForm({
      title: item.title || "",
      description: item.description || "",
      user_id: item.user_id || "",
      status: item.status || "Pending",
      deadline: formatInputDate(item.deadline),
      employee: item.employee || "",
      testing: item.testing || "",
      end_date: formatInputDate(item.end_date),
    });

    focusEditForm();
  }

  async function deleteProject(id) {
    if (!window.confirm(
      language === "fa"
        ? "آیا مطمئن هستید؟"
        : "Are you sure?"
    )) {
      return;
    }

    try {
      await api(`/projects/${id}`, {
        method: "DELETE",
      });

      await fetchProjects();

      showToast(
        language === "fa"
          ? "پروژه حذف شد"
          : "Project deleted"
      );
    } catch (error) {
      showToast(error.message);
    }
  }

  /* ================= EMPLOYEES ================= */

  async function saveEmployee(e) {
    e.preventDefault();

    try {
      if (editingEmployee) {
        await api(`/employees/${editingEmployee}`, {
          method: "PUT",
          body: JSON.stringify(employeeForm),
        });
      } else {
        await api("/employees", {
          method: "POST",
          body: JSON.stringify(employeeForm),
        });
      }

      setEmployeeForm(emptyEmployee);
      setEditingEmployee(null);
      setRecordFormOpen(false);
      await fetchEmployees();

      showToast(
        language === "fa"
          ? "کارمند ذخیره شد"
          : "Employee saved"
      );

      // Employee auto-backup is OFF by default. Use the Excel button when needed.
      if (settings.employeeAutoBackup) {
        window.setTimeout(() => downloadExcelBackup("employees"), 500);
      }
    } catch (error) {
      showToast(error.message || (language === "fa" ? "ثبت کارمند انجام نشد" : "Could not save employee"));
    }
  }

  function editEmployee(item) {
    setEditingEmployee(item.id);
    setEmployeeForm({
      name: item.name || "",
      phone: item.phone || "",
      email: item.email || "",
      position: item.position || "",
      province: item.province || "",
      address: item.address || "",
      photo: item.photo || "",
    });
    setRecordFormOpen(true);
    focusEditForm();
  }

  async function deleteEmployee(id) {
    if (!window.confirm(language === "fa" ? "آیا مطمئن هستید؟" : "Are you sure?")) return;

    try {
      await api(`/employees/${id}`, {
        method: "DELETE",
      });
      await fetchEmployees();
      showToast(language === "fa" ? "کارمند حذف شد" : "Employee deleted");
    } catch (error) {
      showToast(error.message);
    }
  }

  /* ================= CONTRACTS ================= */

  async function saveContract(e) {
    e.preventDefault();

    try {
      if (editingContract) {
        await api(`/contracts/${editingContract}`, {
          method: "PUT",
          body: JSON.stringify(contractForm),
        });
      } else {
        await api("/contracts", {
          method: "POST",
          body: JSON.stringify(contractForm),
        });
      }

      setContractForm({
        ...emptyContract,
        contract_start: getTodayInputDate(),
      });
      setEditingContract(null);
      setRecordFormOpen(false);
      await fetchContracts();

      showToast(
        language === "fa"
          ? "قرارداد ذخیره شد"
          : "Contract saved"
      );

      // Contract backup remains available automatically, as requested for record saving.
      window.setTimeout(() => downloadExcelBackup("contracts"), 500);
    } catch (error) {
      showToast(error.message || (language === "fa" ? "ذخیره قرارداد انجام نشد" : "Could not save contract"));
    }
  }

  function editContract(item) {
    setEditingContract(item.id);
    setContractForm({
      person_name: item.person_name || "",
      line_number: item.line_number || "",
      shop_name: item.shop_name || "",
      shop_number: item.shop_number || "",
      shop_location: item.shop_location || "",
      province: item.province || "",
      tazkira_id: item.tazkira_id || "",
      contract_start: formatInputDate(item.contract_start),
      contract_end: formatInputDate(item.contract_end),
      amount: item.amount || "",
      photo: item.photo || "",
    });
    setRecordFormOpen(true);
    focusEditForm();
  }

  async function deleteContract(id) {
    if (!window.confirm(language === "fa" ? "آیا مطمئن هستید؟" : "Are you sure?")) return;

    try {
      await api(`/contracts/${id}`, {
        method: "DELETE",
      });
      await fetchContracts();
      showToast(language === "fa" ? "قرارداد حذف شد" : "Contract deleted");
    } catch (error) {
      showToast(error.message);
    }
  }

  /* ================= CURRENCY ================= */

  const convertedAmount = useMemo(() => {
    const amount =
      parseFloat(currencyAmount) || 0;

    const inAFN =
      currencyFrom === "AFN"
        ? amount
        : amount * RATES[currencyFrom];

    const result =
      currencyTo === "AFN"
        ? inAFN
        : inAFN / RATES[currencyTo];

    return result.toFixed(2);
  }, [
    currencyAmount,
    currencyFrom,
    currencyTo,
  ]);

  /* ================= DASHBOARD ================= */

  const income = useMemo(() => {
    return payments
      .filter(
        (p) =>
          String(p.type).toLowerCase() ===
          "paid"
      )
      .reduce(
        (sum, p) =>
          sum + Number(p.amount || 0),
        0
      );
  }, [payments]);

  const expense = useMemo(() => {
    return payments
      .filter(
        (p) =>
          String(p.type).toLowerCase() ===
          "unpaid"
      )
      .reduce(
        (sum, p) =>
          sum + Number(p.amount || 0),
        0
      );
  }, [payments]);

  const balance = income - expense;

  /* ================= SEARCH ================= */

  function searchItems(items) {
    if (!search.trim()) {
      return items;
    }

    const text = search.toLowerCase();

    return items.filter((item) =>
      Object.values(item).some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(text)
      )
    );
  }

  // Customer order is based on registration order (database ID).
  // The visible number stays stable: first registered = 1, second = 2, etc.
  function getCustomerRows(items) {
    const sorted = [...items].sort(
      (a, b) => Number(a.id) - Number(b.id)
    );

    const numbered = sorted.map((item, index) => ({
      item,
      serial: index + 1,
    }));

    if (!search.trim()) {
      return numbered;
    }

    const text = search.toLowerCase();

    return numbered.filter(({ item }) =>
      Object.values(item).some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(text)
      )
    );
  }

  function getVisibleCustomerRows() {
    return getCustomerRows(customers).filter(({ item }) =>
      customerContractFilter === "all" ||
      (customerContractFilter === "linked"
        ? Boolean(item.contract_id)
        : !item.contract_id)
    );
  }

  // Sequential numbering for all management tables.
  // Registration order is determined by the database ID; the real ID is never changed.
  function getNumberedRows(items) {
    const sorted = [...items].sort(
      (a, b) => Number(a.id) - Number(b.id)
    );

    const numbered = sorted.map((item, index) => ({
      item,
      serial: index + 1,
    }));

    if (!search.trim()) {
      return numbered;
    }

    const text = search.toLowerCase();

    return numbered.filter(({ item }) =>
      Object.values(item).some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(text)
      )
    );
  }

  function renderPageTools(targetPage, filters = null) {
    const supportedPages = [
      "customers",
      "employees",
      "users",
      "attendance",
      "payments",
      "income",
      "expenses",
      "debts",
      "projects",
      "contracts",
    ];

    if (
      page !== targetPage ||
      recordFormOpen ||
      !supportedPages.includes(targetPage) ||
      (targetPage === "users" && !canManageAccountsAs(currentUser))
    ) {
      return null;
    }

    return (
      <PageTools
        t={t}
        language={language}
        page={targetPage}
        search={search}
        setSearch={setSearch}
        onCreate={() => startNewRecord(targetPage)}
        onPrint={() => printVisibleTable(targetPage)}
        onExcel={() => downloadExcelBackup(targetPage)}
        showExcel={!isAdminRole(currentUser?.role)}
        filters={filters}
      />
    );
  }

  /* ================= LOGIN PAGE ================= */

  if (loggedIn && !accountVerified) {
    return (
      <>
        <style>{styles}</style>
        <div className={`login-page ${theme}`}>
          <div className="login-box account-verification" role="status" aria-live="polite">
            <h1>
              {accountVerificationError
                ? language === "fa" ? "تأیید حساب انجام نشد" : "ACCOUNT VERIFICATION FAILED"
                : language === "fa" ? "در حال تأیید حساب…" : "VERIFYING ACCOUNT…"}
            </h1>
            {accountVerificationError && (
              <p>{accountVerificationError}</p>
            )}
            {accountVerificationError && (
              <button
                type="button"
                className="primary-button login-button"
                onClick={refreshAll}
                disabled={refreshing}
              >
                {refreshing
                  ? "..."
                  : language === "fa" ? "تلاش دوباره" : "RETRY"}
              </button>
            )}
            <button
              type="button"
              className="secondary-button login-button"
              onClick={logout}
            >
              {t.logout}
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!loggedIn || !isSupportedRole(currentUser?.role)) {
    return (
      <>
        <style>{styles}</style>

        <div
          className={`login-page ${theme} ${language === "fa" ? "rtl" : ""}`}
          dir={language === "fa" ? "rtl" : "ltr"}
        >
          <div
            className="login-layout"
            style={{ "--office-image": `url("${officeBuilding}")` }}
          >
            <section className="login-showcase">
              <div className="showcase-brand">
                <span className="showcase-logo">OM</span>
                <span>
                  <strong>OFFICE</strong>
                  <small>MANAGEMENT</small>
                </span>
              </div>
              <div className="showcase-copy">
                <span className="showcase-kicker">
                  {language === "fa" ? "محیط کار هوشمند" : "SMARTER WORKPLACE"}
                </span>
                <h2>
                  {language === "fa"
                    ? "مدیریت دفتر، ساده و یکپارچه"
                    : "A clearer way to manage your office"}
                </h2>
                <p>
                  {language === "fa"
                    ? "مشتریان، تیم و امور روزانه خود را در یک فضای کاری امن مدیریت کنید."
                    : "Bring your team, customers and daily operations together in one secure workspace."}
                </p>
                <ul>
                  <li>
                    <span aria-hidden="true">✓</span>
                    {language === "fa" ? "مدیریت مشتریان و پروژه‌ها" : "Customer and project management"}
                  </li>
                  <li>
                    <span aria-hidden="true">✓</span>
                    {language === "fa" ? "حاضری و مدیریت کارمندان" : "Employee and attendance management"}
                  </li>
                  <li>
                    <span aria-hidden="true">✓</span>
                    {language === "fa" ? "گزارش‌ها و امور مالی" : "Finance and business insights"}
                  </li>
                </ul>
              </div>
              <div className="showcase-caption">
                {language === "fa"
                  ? "فضای کاری یکپارچه برای تیم شما"
                  : "One connected workspace for your team"}
              </div>
            </section>

          <div className="login-box">

            <div className="login-logo">
              OM
            </div>

            <h1>
              {authMode === "login"
                ? t.loginTitle
                : language === "fa" ? "ساخت حساب جدید" : "CREATE ACCOUNT"}
            </h1>

            <p>
              {authMode === "login"
                ? t.loginSubtitle
                : language === "fa"
                  ? "مشخصات خود را برای ساخت حساب وارد کنید."
                  : "Enter your details to create an account."}
            </p>

            {authMode === "login" ? (
            <form onSubmit={handleLogin}>

              <Input
                label={
                  language === "fa"
                    ? "ایمیل یا نام کاربری"
                    : "EMAIL OR USERNAME"
                }
                type="text"
                value={loginForm.identity}
                onChange={(value) => {
                  setLoginForm({
                    ...loginForm,
                    identity: value,
                  });

                  if (loginError) {
                    setLoginError("");
                  }
                }}
                required
              />

              <div className="password-input-wrapper">
                <Input
                  label={t.password}
                  type={
                    showLoginPassword
                      ? "text"
                      : "password"
                  }
                  value={loginForm.password}
                  onChange={(value) => {
                    setLoginForm({
                      ...loginForm,
                      password: value,
                    });

                    if (loginError) {
                      setLoginError("");
                    }
                  }}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowLoginPassword(
                      (value) => !value
                    )
                  }
                  aria-label={
                    showLoginPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  title={
                    showLoginPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <EyeIcon
                    off={!showLoginPassword}
                  />
                </button>
              </div>

              {loginError && (
                <div className="login-error">
                  {loginError}
                </div>
              )}

              <div className="login-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked
                      )
                    }
                  />
                  <span>
                    {language === "fa"
                      ? "مرا به خاطر بسپار"
                      : "Remember me"}
                  </span>
                </label>

                <button
                  type="button"
                  className="forgot-link"
                  onClick={() =>
                    setForgotOpen(true)
                  }
                >
                  {language === "fa"
                    ? "رمز عبور را فراموش کرده‌اید؟"
                    : "Forgot password?"}
                </button>
              </div>

              <button
                type="submit"
                className="primary-button login-button"
                disabled={loginLoading}
              >
                {loginLoading
                  ? "..."
                  : t.login}
              </button>

            </form>
            ) : (
              <form onSubmit={handleRegister}>
                <Input
                  label={language === "fa" ? "نام کامل" : "FULL NAME"}
                  value={registerForm.name}
                  onChange={(value) => setRegisterForm({ ...registerForm, name: value })}
                  required
                />

                <Input
                  label={language === "fa" ? "نام کاربری" : "USERNAME"}
                  value={registerForm.username}
                  onChange={(value) => setRegisterForm({ ...registerForm, username: value })}
                  required
                />

                <Input
                  label={language === "fa" ? "ایمیل (اختیاری)" : "EMAIL (OPTIONAL)"}
                  type="email"
                  value={registerForm.email}
                  onChange={(value) => setRegisterForm({ ...registerForm, email: value })}
                />

                <Input
                  label={language === "fa" ? "رمز عبور (حداقل ۸ حرف)" : "PASSWORD (MIN. 8 CHARACTERS)"}
                  type="password"
                  value={registerForm.password}
                  onChange={(value) => setRegisterForm({ ...registerForm, password: value })}
                  required
                />

                <Input
                  label={language === "fa" ? "تکرار رمز عبور" : "CONFIRM PASSWORD"}
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(value) => setRegisterForm({ ...registerForm, confirmPassword: value })}
                  required
                />

                {registerError && (
                  <div className="login-error">{registerError}</div>
                )}

                <p style={{ fontSize: 12, lineHeight: 1.7, marginTop: 10 }}>
                  {language === "fa"
                    ? "حساب تازه پس از تعیین نقش توسط سوپر ادمین فعال می‌شود."
                    : "A Super Admin must assign a role before a new account is active."}
                </p>

                <button
                  type="submit"
                  className="primary-button login-button"
                  disabled={registerLoading}
                >
                  {registerLoading
                    ? "..."
                    : language === "fa" ? "ایجاد حساب" : "CREATE ACCOUNT"}
                </button>
              </form>
            )}

            {authMode === "login" && forgotOpen && (
              <div className="forgot-modal-backdrop">
                <div className="forgot-modal">
                  <h2>
                    {language === "fa"
                      ? "بازیابی رمز عبور"
                      : "PASSWORD RECOVERY"}
                  </h2>

                  <p>
                    {language === "fa"
                      ? "ایمیل حساب خود را وارد کنید. برای تغییر رمز عبور با مدیر سیستم تماس بگیرید."
                      : "Enter your account email. Contact the system administrator to reset your password."}
                  </p>

                  <Input
                    label={t.email}
                    type="email"
                    value={forgotEmail}
                    onChange={setForgotEmail}
                  />

                  <div className="forgot-modal-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setForgotOpen(false);
                        setForgotEmail("");
                      }}
                    >
                      {language === "fa"
                        ? "بستن"
                        : "CLOSE"}
                    </button>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => {
                        if (!forgotEmail.trim()) {
                          showToast(
                            language === "fa"
                              ? "ایمیل را وارد کنید."
                              : "Enter your email."
                          );
                          return;
                        }

                        setForgotOpen(false);
                        setForgotEmail("");

                        showToast(
                          language === "fa"
                            ? "برای تغییر رمز با مدیر سیستم تماس بگیرید."
                            : "Contact the system administrator to reset your password."
                        );
                      }}
                    >
                      {language === "fa"
                        ? "ادامه"
                        : "CONTINUE"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 6,
                flexWrap: "wrap",
                marginTop: 18,
                marginBottom: 14,
                fontSize: 13,
              }}
            >
              <span>
                {authMode === "login"
                  ? language === "fa" ? "حساب ندارید؟" : "Don’t have an account?"
                  : language === "fa" ? "قبلاً حساب ساخته‌اید؟" : "Already have an account?"}
              </span>
              <button
                type="button"
                className="forgot-link"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setLoginError("");
                  setRegisterError("");
                }}
                style={{ fontWeight: 800 }}
              >
                {authMode === "login"
                  ? language === "fa" ? "ثبت‌نام کنید" : "Create account"
                  : language === "fa" ? "ورود به حساب" : "Sign in"}
              </button>
            </div>

            <div className="login-language">
              <button
                type="button"
                className={
                  language === "en"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setLanguage("en")
                }
              >
                ENGLISH
              </button>

              <button
                type="button"
                className={
                  language === "fa"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setLanguage("fa")
                }
              >
                فارسی
              </button>
            </div>

          </div>
          </div>
        </div>
      </>
    );
  }

  /* ================= MAIN ================= */

  return (
    <>
      <style>{`
        ${styles}



        /* LANGUAGE SWITCHER + CURRENCY VISIBILITY */
        .top-language {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px;
          border: 1px solid rgba(185,200,220,.18);
          border-radius: 10px;
          background: rgba(255,255,255,.04);
        }

        .top-language button {
          border: 0;
          background: transparent;
          color: inherit;
          min-height: 34px;
          padding: 6px 10px;
          border-radius: 7px;
          cursor: pointer;
          font-weight: 700;
        }

        .top-language button.selected {
          background: rgba(255,255,255,.12);
        }

        .currency-controls select {
          min-width: 210px !important;
          height: 46px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          padding: 8px 12px !important;
        }

        .currency-summary-label {
          display: block;
          margin-top: 8px;
          font-size: 12px;
          opacity: .72;
          font-weight: 500;
        }

        @media (max-width: 700px) {
          .top-language button {
            padding: 6px 7px;
            font-size: 11px;
          }

          .currency-controls select {
            min-width: 150px !important;
          }
        }

        /* FINAL ACTION + VISIBILITY FIX */
.action-buttons {
  position: relative !important;
  z-index: 999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  min-width: 150px !important;
  pointer-events: auto !important;
}

.action-buttons button {
  position: relative !important;
  z-index: 1000 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 68px !important;
  min-height: 42px !important;
  padding: 10px 14px !important;
  font-size: 14px !important;
  line-height: 1 !important;
  cursor: pointer !important;
  pointer-events: auto !important;
  user-select: none !important;
}

.action-buttons .edit-button {
  border: 1px solid rgba(185,200,220,.30) !important;
}

.action-buttons .delete-button {
  border: 1px solid rgba(190,110,110,.35) !important;
}

.table-scroll {
  position: relative !important;
}

.table-card {
  overflow: visible !important;
}

.form-card {
  scroll-margin-top: 90px !important;
}

@media (max-width: 700px) {
  .action-buttons {
    min-width: 135px !important;
    gap: 6px !important;
  }

  .action-buttons button {
    min-width: 60px !important;
    min-height: 40px !important;
    font-size: 12px !important;
    padding: 9px 10px !important;
  }
      }

      :root {
        color-scheme: light;
        --om-navy: #142b39;
        --om-navy-deep: #10232f;
        --om-teal: #087f70;
        --om-teal-strong: #06695d;
        --om-ink: #1b2c35;
        --om-muted: #63747d;
        --om-line: #dce5e7;
        --om-workspace: #f3f6f7;
        --om-surface: #ffffff;
        --om-shadow: 0 8px 24px rgba(24, 48, 57, .07);
      }

      html,
      body,
      #root {
        width: 100% !important;
        min-height: 100% !important;
        overflow-x: hidden !important;
      }

      body {
        background: var(--om-workspace) !important;
        color: var(--om-ink) !important;
        font-family: Inter, "Noto Sans Arabic", "Segoe UI", Arial, sans-serif !important;
      }

      .app,
      .app.day {
        min-height: 100vh !important;
        background: var(--om-workspace) !important;
        color: var(--om-ink) !important;
      }

      .app.rtl {
        font-family: "Noto Sans Arabic", Inter, "Segoe UI", Arial, sans-serif !important;
      }

      .app .sidebar,
      .app.day .sidebar,
      .app.night .sidebar {
        background: var(--om-navy) !important;
        border-color: #24404d !important;
        box-shadow: 8px 0 28px rgba(12, 31, 41, .12) !important;
      }

      .app .brand {
        min-height: 68px !important;
        align-items: center !important;
        padding: 5px 8px 18px !important;
        border-color: rgba(255,255,255,.13) !important;
      }

      .app .brand-logo,
      .app.day .brand-logo,
      .app.night .brand-logo,
      .login-page .login-logo {
        background: var(--om-teal) !important;
        border: 0 !important;
        border-radius: 12px !important;
        box-shadow: none !important;
        color: #fff !important;
      }

      .app .brand-copy strong,
      .app.day .brand-copy strong,
      .app.night .brand-copy strong {
        color: #f5faf9 !important;
        font-size: 13px !important;
        letter-spacing: 1.15px !important;
      }

      .app .brand-copy small,
      .app.day .brand-copy small,
      .app.night .brand-copy small {
        color: #a7bdc3 !important;
        font-size: 9px !important;
        letter-spacing: 1.7px !important;
      }

      .app .sidebar button.account-entry,
      .app.day .sidebar button.account-entry,
      .app.night .sidebar button.account-entry {
        min-height: 78px !important;
        margin: 16px 0 14px !important;
        border: 1px solid rgba(255,255,255,.14) !important;
        border-radius: 12px !important;
        background: #193644 !important;
        color: #f3f8f8 !important;
        box-shadow: none !important;
      }

      .app .sidebar button.account-entry:hover,
      .app .sidebar button.account-entry[aria-current="page"] {
        border-color: rgba(69, 190, 166, .62) !important;
        background: #1d414d !important;
      }

      .app .sidebar-profile-info strong,
      .app.day .sidebar-profile-info strong,
      .app.night .sidebar-profile-info strong {
        color: #f6f9fa !important;
      }

      .app .sidebar-role-badge {
        color: #b7ccc9 !important;
        background: rgba(255,255,255,.08) !important;
        border-color: rgba(255,255,255,.13) !important;
      }

      .app .account-entry-label {
        color: #6bd0b6 !important;
      }

      .app #primary-navigation {
        gap: 5px !important;
        margin-top: 8px !important;
        padding: 0 2px 12px !important;
      }

      .app .nav-button,
      .app.day .nav-button,
      .app.night .nav-button {
        min-height: 42px !important;
        padding: 9px 11px !important;
        border: 1px solid transparent !important;
        border-radius: 9px !important;
        background: transparent !important;
        color: #c0d0d4 !important;
        box-shadow: none !important;
        transform: none !important;
      }

      .app .nav-button .nav-icon {
        width: 22px !important;
        color: #9eb4b9 !important;
        font-size: 17px !important;
      }

      .app .nav-button .nav-label {
        color: inherit !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        letter-spacing: .1px !important;
      }

      .app .nav-button:hover,
      .app.day .nav-button:hover,
      .app.night .nav-button:hover {
        background: rgba(255,255,255,.07) !important;
        border-color: rgba(255,255,255,.08) !important;
        color: #fff !important;
      }

      .app .nav-button.active,
      .app.day .nav-button.active,
      .app.night .nav-button.active {
        background: rgba(12, 139, 119, .23) !important;
        border-color: rgba(73, 193, 169, .28) !important;
        color: #effcf8 !important;
        box-shadow: inset 3px 0 0 #28ad94 !important;
      }

      .app .nav-button.active .nav-icon {
        color: #69d6bd !important;
      }

      .app .finance-subnav,
      .app.day .finance-subnav,
      .app.night .finance-subnav {
        margin: 0 0 5px 8px !important;
        padding: 5px !important;
        border: 0 !important;
        border-left: 1px solid rgba(255,255,255,.17) !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .app.rtl .finance-subnav {
        margin: 0 8px 5px 0 !important;
        border-left: 0 !important;
        border-right: 1px solid rgba(255,255,255,.17) !important;
      }

      .app .finance-subnav button {
        min-height: 34px !important;
        border-radius: 7px !important;
        color: #b9cbce !important;
        text-align: start !important;
      }

      .app .finance-subnav button:hover,
      .app .finance-subnav button.active {
        background: rgba(255,255,255,.08) !important;
        color: #fff !important;
      }

      .app .logout-button {
        min-height: 42px !important;
        border: 1px solid rgba(255,255,255,.12) !important;
        border-radius: 9px !important;
        background: rgba(255,255,255,.045) !important;
        color: #d2e0e1 !important;
        box-shadow: none !important;
      }

      .app .logout-button:hover {
        background: rgba(255,255,255,.09) !important;
        color: #fff !important;
      }

      .app .main,
      .app.day .main,
      .app.night .main {
        min-width: 0 !important;
        background: var(--om-workspace) !important;
        color: var(--om-ink) !important;
      }

      .app .topbar,
      .app.day .topbar,
      .app.night .topbar {
        height: 72px !important;
        padding: 0 30px !important;
        border-bottom: 1px solid var(--om-line) !important;
        background: rgba(255,255,255,.96) !important;
        color: var(--om-ink) !important;
        box-shadow: 0 2px 8px rgba(24,48,57,.025) !important;
        backdrop-filter: none !important;
        z-index: 40 !important;
      }

      .app .topbar strong,
      .app.day .topbar strong,
      .app.night .topbar strong {
        color: var(--om-ink) !important;
        font-size: 13px !important;
        font-weight: 650 !important;
        letter-spacing: 0 !important;
      }

      .app .header-account-entry {
        min-height: 42px !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 8px !important;
        padding: 4px 10px 4px 5px !important;
        border: 1px solid var(--om-line) !important;
        border-radius: 10px !important;
        background: #fff !important;
        color: var(--om-ink) !important;
        box-shadow: none !important;
      }

      .app .header-account-entry:hover {
        border-color: #9bcfc4 !important;
        background: #f5faf8 !important;
      }

      .app .header-account-avatar {
        width: 30px !important;
        height: 30px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 50% !important;
        background: #e6f4f0 !important;
        color: var(--om-teal-strong) !important;
        font-size: 12px !important;
        font-weight: 700 !important;
      }

      .app .header-account-name {
        color: var(--om-ink) !important;
        font-size: 12px !important;
        font-weight: 600 !important;
      }

      .app .header-account-label {
        color: var(--om-teal-strong) !important;
        font-size: 12px !important;
        font-weight: 700 !important;
      }

      .app .header-account-entry .header-account-icon {
        width: 17px !important;
        height: 17px !important;
        color: var(--om-teal) !important;
      }

      .app .top-label {
        color: var(--om-muted) !important;
        font-size: 10px !important;
        letter-spacing: .6px !important;
      }

      .app .top-actions {
        gap: 8px !important;
      }

      .app .top-actions > button,
      .app .clock,
      .app .top-language {
        border-color: var(--om-line) !important;
        border-radius: 9px !important;
        background: #fff !important;
        color: #40545c !important;
        box-shadow: none !important;
      }

      .app .top-language button {
        min-height: 30px !important;
        color: #52666d !important;
      }

      .app .top-language button.selected {
        background: #e8f4f1 !important;
        color: var(--om-teal-strong) !important;
      }

      .app .top-actions > button:hover {
        border-color: #9bcfc4 !important;
        background: #f0f8f6 !important;
        color: var(--om-teal-strong) !important;
      }

      .app .content,
      .app.day .content,
      .app.night .content {
        width: auto !important;
        max-width: 1600px !important;
        min-height: calc(100vh - 72px) !important;
        margin: 0 auto !important;
        padding: 27px 30px 42px !important;
        overflow: visible !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        color: var(--om-ink) !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
      }

      .app .content::before {
        display: none !important;
      }

      .app .page-title,
      .app.day .page-title,
      .app.night .page-title {
        margin: 0 0 22px !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        color: var(--om-ink) !important;
        backdrop-filter: none !important;
      }

      .app .breadcrumbs {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        margin-bottom: 8px !important;
        color: #819198 !important;
        font-size: 10px !important;
        letter-spacing: .45px !important;
      }

      .app .page-title h1,
      .app.day .page-title h1,
      .app.night .page-title h1 {
        color: var(--om-ink) !important;
        font-size: clamp(20px, 2vw, 25px) !important;
        font-weight: 700 !important;
        line-height: 1.35 !important;
        letter-spacing: -.3px !important;
        text-transform: none !important;
      }

      .app .page-title p,
      .app .dashboard-intro {
        margin-top: 6px !important;
        color: var(--om-muted) !important;
        font-size: 13px !important;
        line-height: 1.65 !important;
      }

      .app .welcome-card,
      .app.day .welcome-card {
        min-height: 120px !important;
        margin-bottom: 18px !important;
        padding: 22px 24px !important;
        border: 1px solid var(--om-line) !important;
        border-radius: 14px !important;
        background: #fff !important;
        box-shadow: var(--om-shadow) !important;
      }

      .app .welcome-card::before,
      .app .welcome-card::after {
        display: none !important;
      }

      .app .welcome-card h2 {
        color: var(--om-ink) !important;
        font-size: 19px !important;
        letter-spacing: -.2px !important;
      }

      .app .welcome-card p,
      .app .welcome-card small {
        color: var(--om-muted) !important;
      }

      .app .stats-grid,
      .app .payment-summary {
        display: grid !important;
        grid-template-columns: repeat(auto-fit, minmax(185px, 1fr)) !important;
        gap: 14px !important;
        margin: 0 0 18px !important;
      }

      .app .stat,
      .app.day .stat,
      .app.night .stat {
        min-width: 0 !important;
        min-height: 94px !important;
        padding: 16px 18px !important;
        border: 1px solid var(--om-line) !important;
        border-radius: 12px !important;
        background: #fff !important;
        color: var(--om-ink) !important;
        box-shadow: var(--om-shadow) !important;
        backdrop-filter: none !important;
      }

      .app .stat > span {
        width: 36px !important;
        height: 36px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        border: 0 !important;
        border-radius: 10px !important;
        background: #e9f5f2 !important;
        color: var(--om-teal) !important;
        font-size: 11px !important;
        font-weight: 750 !important;
      }

      .app .stat small {
        color: var(--om-muted) !important;
        font-size: 11px !important;
      }

      .app .stat strong {
        color: var(--om-ink) !important;
        font-size: 21px !important;
        font-weight: 700 !important;
      }

      .app .dashboard-grid,
      .app .account-grid {
        gap: 16px !important;
      }

      .app .dashboard-panel,
      .app.day .dashboard-panel,
      .app .currency-card,
      .app .warning-card,
      .app .settings-card,
      .app .form-card,
      .app .table-card,
      .app .payment-box,
      .app .finance-card,
      .app .expense-chart-panel,
      .app .quick-actions,
      .app .quick-action,
      .app .empty,
      .app .search-card,
      .app .chart-card,
      .app .modal,
      .app .modal-card {
        border: 1px solid var(--om-line) !important;
        border-radius: 12px !important;
        background: var(--om-surface) !important;
        color: var(--om-ink) !important;
        box-shadow: var(--om-shadow) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      .app .dashboard-panel,
      .app .settings-card {
        padding: 18px !important;
      }

      .app .section-title {
        margin-bottom: 13px !important;
        border-color: var(--om-line) !important;
      }

      .app .section-title h2,
      .app .settings-header h2,
      .app .form-card-title,
      .app .dashboard-panel strong {
        color: var(--om-ink) !important;
      }

      .app .section-title h2,
      .app .settings-header h2 {
        font-size: 14px !important;
        font-weight: 700 !important;
        letter-spacing: 0 !important;
      }

      .app .recent-row,
      .app .admin-instruction-row {
        border-color: #edf1f2 !important;
      }

      .app .recent-row strong,
      .app .admin-instruction-row strong {
        color: var(--om-ink) !important;
      }

      .app .recent-row small,
      .app .admin-instruction-row span,
      .app .admin-instruction-row small {
        color: var(--om-muted) !important;
      }

      .app .currency-card,
      .app .warning-card {
        padding: 16px 18px !important;
      }

      .app .finance-card {
        min-height: 92px !important;
        padding: 16px !important;
      }

      .app .finance-card strong {
        color: var(--om-teal-strong) !important;
      }

      .app .page-tools,
      .app .global-search {
        gap: 12px !important;
        margin-bottom: 14px !important;
        border: 1px solid var(--om-line) !important;
        border-radius: 11px !important;
        background: #fff !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
      }

      .app .page-search input,
      .app .global-search input,
      .app .field input,
      .app .field select,
      .app .field textarea,
      .app input:not([type="checkbox"]):not([type="radio"]):not([type="file"]),
      .app select,
      .app textarea {
        min-height: 42px !important;
        border: 1px solid #d5e0e2 !important;
        border-radius: 8px !important;
        background: #fff !important;
        color: var(--om-ink) !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
      }

      .app .field textarea,
      .app textarea {
        min-height: 96px !important;
      }

      .app input::placeholder,
      .app textarea::placeholder {
        color: #87979d !important;
        opacity: 1 !important;
      }

      .app .field > span,
      .app .field label,
      .app .settings-header p {
        color: #53666e !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        letter-spacing: 0 !important;
      }

      .app .field input:focus,
      .app .field select:focus,
      .app .field textarea:focus,
      .app input:focus,
      .app select:focus,
      .app textarea:focus {
        border-color: #58a999 !important;
        box-shadow: 0 0 0 3px rgba(8, 127, 112, .12) !important;
        outline: none !important;
      }

      .app table {
        width: 100% !important;
        min-width: 720px !important;
        border-collapse: separate !important;
        border-spacing: 0 !important;
        background: #fff !important;
        color: var(--om-ink) !important;
      }

      .app th {
        padding: 12px 14px !important;
        border-bottom: 1px solid #dce6e7 !important;
        background: #f4f8f8 !important;
        color: #52666d !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        letter-spacing: 0 !important;
        text-align: start !important;
      }

      .app td {
        padding: 12px 14px !important;
        border-bottom: 1px solid #edf1f2 !important;
        background: #fff !important;
        color: #30434b !important;
        font-size: 12px !important;
        line-height: 1.55 !important;
      }

      .app tbody tr:hover td {
        background: #f7fbfa !important;
      }

      .app .table-card,
      .app .table-scroll {
        max-width: 100% !important;
        overflow-x: auto !important;
        border-radius: 12px !important;
        scrollbar-color: #b7c9c8 #f0f4f4;
      }

      .app .table-card {
        overflow: hidden !important;
      }

      .app .table-scroll {
        border: 0 !important;
        background: #fff !important;
      }

      .app .primary-button,
      .app .new-record-button,
      .app .login-button,
      .app .primary-btn {
        min-height: 40px !important;
        border: 1px solid var(--om-teal) !important;
        border-radius: 8px !important;
        background: var(--om-teal) !important;
        color: #fff !important;
        box-shadow: none !important;
        font-size: 12px !important;
        font-weight: 650 !important;
        letter-spacing: 0 !important;
      }

      .app .primary-button:hover,
      .app .new-record-button:hover,
      .app .login-button:hover {
        background: var(--om-teal-strong) !important;
        border-color: var(--om-teal-strong) !important;
        transform: translateY(-1px);
      }

      .app .secondary-button,
      .app .tool-button,
      .app .edit-button,
      .app .receipt-button,
      .app .refresh-button,
      .app .theme-button,
      .app .cancel-button {
        min-height: 38px !important;
        border: 1px solid #d5e0e2 !important;
        border-radius: 8px !important;
        background: #fff !important;
        color: #40565e !important;
        box-shadow: none !important;
        font-size: 12px !important;
        font-weight: 600 !important;
      }

      .app .secondary-button:hover,
      .app .tool-button:hover,
      .app .edit-button:hover,
      .app .cancel-button:hover {
        border-color: #94c6bc !important;
        background: #f2f8f6 !important;
        color: var(--om-teal-strong) !important;
      }

      .app .delete-button {
        border: 1px solid #efd2d5 !important;
        border-radius: 8px !important;
        background: #fff7f7 !important;
        color: #a34450 !important;
        box-shadow: none !important;
      }

      .app .action-buttons {
        min-width: 0 !important;
        flex-wrap: wrap !important;
        gap: 6px !important;
      }

      .app .action-buttons button {
        min-width: 58px !important;
        min-height: 34px !important;
        padding: 7px 10px !important;
        font-size: 11px !important;
      }

      .app .form-card {
        margin-bottom: 20px !important;
        overflow: hidden !important;
      }

      .app .form-card-title {
        min-height: 46px !important;
        padding: 12px 16px !important;
        border-bottom: 1px solid var(--om-line) !important;
        background: #f8fafb !important;
        font-size: 13px !important;
        letter-spacing: 0 !important;
      }

      .app .form-grid {
        gap: 14px !important;
        padding: 16px !important;
      }

      .app .instructions-description {
        max-width: 760px !important;
        margin: -10px 0 18px !important;
        color: var(--om-muted) !important;
        font-size: 13px !important;
        line-height: 1.7 !important;
      }

      .app .content:has(.instructions-description) .form-card {
        max-width: 1040px !important;
      }

      .app .content:has(.instructions-description) .form-grid {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr) auto !important;
        align-items: end !important;
      }

      .app .content:has(.instructions-description) .form-grid > button {
        white-space: nowrap !important;
      }

      .app .top-label {
        display: none !important;
      }

      .app .header-account-name {
        display: none !important;
      }

      .app .content:has(.instructions-description) .finance-cards-grid {
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) !important;
        gap: 14px !important;
      }

      .app .content:has(.instructions-description) .finance-card {
        align-items: flex-start !important;
        gap: 10px !important;
      }

      .app .account-grid {
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr)) !important;
        align-items: start !important;
      }

      .app .account-profile-summary {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        padding: 0 16px 14px !important;
      }

      .app .account-avatar {
        width: 48px !important;
        height: 48px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 50% !important;
        background: #e6f4f0 !important;
        color: var(--om-teal-strong) !important;
        font-size: 18px !important;
        font-weight: 700 !important;
      }

      .app .account-profile-copy {
        display: flex !important;
        min-width: 0 !important;
        flex-direction: column !important;
        gap: 4px !important;
      }

      .app .account-profile-copy strong {
        overflow-wrap: anywhere !important;
        color: var(--om-ink) !important;
        font-size: 14px !important;
      }

      .app .account-profile-copy span {
        color: var(--om-muted) !important;
        font-size: 12px !important;
      }

      .app .account-role {
        margin: 0 16px 16px !important;
        padding: 12px 14px !important;
        border: 1px solid var(--om-line) !important;
        border-radius: 9px !important;
        background: #f7f9fa !important;
      }

      .app .account-role span {
        display: inline-flex !important;
        padding: 4px 9px !important;
        border-radius: 999px !important;
        background: #e6f4f0 !important;
        color: var(--om-teal-strong) !important;
        font-size: 11px !important;
        font-weight: 700 !important;
      }

      .app .empty {
        min-height: 78px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 18px !important;
        color: #788890 !important;
        font-size: 12px !important;
        box-shadow: none !important;
      }

      .app .status {
        border-radius: 999px !important;
        font-size: 10px !important;
        font-weight: 650 !important;
      }

      .app .mobile-menu-toggle {
        border: 1px solid var(--om-line) !important;
        border-radius: 8px !important;
        background: #fff !important;
        color: var(--om-ink) !important;
        box-shadow: none !important;
      }

      .app :focus-visible,
      .login-page :focus-visible {
        outline: 3px solid rgba(8, 127, 112, .35) !important;
        outline-offset: 2px !important;
      }

      .app .toast {
        border-radius: 10px !important;
        background: #fff !important;
        color: var(--om-ink) !important;
        box-shadow: 0 12px 32px rgba(20,43,57,.16) !important;
      }

      .app.night {
        --om-ink: #e3edef;
        --om-muted: #a6b8bc;
        --om-line: #334951;
        --om-workspace: #172a33;
        --om-surface: #20363f;
        --om-shadow: 0 8px 24px rgba(5, 18, 24, .20);
        color-scheme: dark;
      }

      .app.night .topbar,
      .app.night .header-account-entry,
      .app.night .top-actions > button,
      .app.night .clock,
      .app.night .top-language,
      .app.night .page-tools,
      .app.night .global-search,
      .app.night .welcome-card,
      .app.night .stat,
      .app.night .dashboard-panel,
      .app.night .currency-card,
      .app.night .warning-card,
      .app.night .settings-card,
      .app.night .form-card,
      .app.night .table-card,
      .app.night .payment-box,
      .app.night .finance-card,
      .app.night .quick-action,
      .app.night .quick-actions,
      .app.night .empty,
      .app.night .search-card,
      .app.night .chart-card,
      .app.night .modal,
      .app.night .modal-card {
        background: var(--om-surface) !important;
        color: var(--om-ink) !important;
        border-color: var(--om-line) !important;
      }

      .app.night .form-card-title,
      .app.night th,
      .app.night .account-role {
        background: #1a3039 !important;
        color: var(--om-ink) !important;
        border-color: var(--om-line) !important;
      }

      .app.night .page-title h1,
      .app.night .header-account-name,
      .app.night .topbar strong,
      .app.night .section-title h2,
      .app.night .settings-header h2,
      .app.night .recent-row strong,
      .app.night .finance-card strong,
      .app.night .account-profile-copy strong {
        color: var(--om-ink) !important;
      }

      .app.night .field input,
      .app.night .field select,
      .app.night .field textarea,
      .app.night input:not([type="checkbox"]):not([type="radio"]):not([type="file"]),
      .app.night select,
      .app.night textarea {
        background: #182d36 !important;
        color: var(--om-ink) !important;
        border-color: var(--om-line) !important;
      }

      .app.night table,
      .app.night td,
      .app.night .table-scroll {
        background: var(--om-surface) !important;
        color: var(--om-ink) !important;
      }

      .app.night td {
        border-color: #30464f !important;
      }

      .app.night tbody tr:hover td {
        background: #29434b !important;
      }

      .login-page,
      .login-page.day {
        background: #edf2f3 !important;
        color: var(--om-ink) !important;
      }

      .login-page::before,
      .login-page::after {
        display: none !important;
      }

      .login-page .login-box,
      .login-page.day .login-box {
        border: 1px solid var(--om-line) !important;
        border-radius: 14px !important;
        background: #fff !important;
        color: var(--om-ink) !important;
        box-shadow: 0 18px 48px rgba(20,43,57,.11) !important;
        backdrop-filter: none !important;
      }

      .login-page .login-box h1,
      .login-page.day .login-box h1,
      .login-page .login-box label,
      .login-page.day .login-box label,
      .login-page .login-box p,
      .login-page.day .login-box p {
        color: var(--om-ink) !important;
      }

      .login-page .login-box input,
      .login-page.day .login-box input {
        border: 1px solid #d5e0e2 !important;
        border-radius: 8px !important;
        background: #fff !important;
        color: var(--om-ink) !important;
      }

      @media (max-width: 900px) {
        .app .topbar {
          padding-inline: 20px !important;
        }

        .app .content {
          padding: 22px 20px 34px !important;
        }
      }

      @media (max-width: 700px) {
        .app .topbar {
          height: auto !important;
          min-height: 64px !important;
          padding: 10px 14px !important;
          gap: 10px !important;
        }

        .app .topbar > div:first-child {
          min-width: 0 !important;
          gap: 8px !important;
        }

        .app .topbar > div:first-child strong {
          max-width: 34vw !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }

        .app .top-actions {
          flex-wrap: wrap !important;
          justify-content: flex-end !important;
          gap: 5px !important;
        }

        .app .top-actions > button {
          width: 34px !important;
          height: 34px !important;
        }

        .app .header-account-entry {
          min-height: 36px !important;
          gap: 6px !important;
          padding: 3px 8px 3px 4px !important;
        }

        .app .header-account-avatar {
          width: 26px !important;
          height: 26px !important;
        }

        .app .header-account-label {
          font-size: 11px !important;
        }

        .app .top-language {
          padding: 2px !important;
        }

        .app .top-language button {
          min-height: 28px !important;
          padding: 4px 7px !important;
          font-size: 10px !important;
        }

        .app .content {
          padding: 18px 14px 28px !important;
        }

        .app .dashboard-grid,
        .app .account-grid,
        .app .settings-grid,
        .app .principles {
          grid-template-columns: minmax(0, 1fr) !important;
        }

        .app .stats-grid,
        .app .payment-summary {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 9px !important;
        }

        .app .stat {
          min-height: 82px !important;
          padding: 12px !important;
          gap: 9px !important;
        }

        .app .stat strong {
          font-size: 17px !important;
        }

        .app .form-grid,
        .app .content:has(.instructions-description) .form-grid {
          grid-template-columns: minmax(0, 1fr) !important;
          padding: 13px !important;
        }

        .app .page-tools {
          align-items: stretch !important;
          flex-direction: column !important;
        }

        .app .page-tool-actions {
          flex-wrap: wrap !important;
        }

        .app .content:has(.instructions-description) .instructions-description {
          margin-top: -6px !important;
        }

        .app .table-card {
          width: 100% !important;
        }

        .app table {
          min-width: 640px !important;
        }
      }

      @media (max-width: 420px) {
        .app .stats-grid,
        .app .payment-summary {
          grid-template-columns: minmax(0, 1fr) !important;
        }
      }

      .app .sidebar {
        width: 248px !important;
        min-width: 248px !important;
        padding: 18px 14px !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
      }

      .app:not(.sidebar-collapsed) .main {
        width: calc(100% - 248px) !important;
        margin-left: 248px !important;
        margin-right: 0 !important;
      }

      .app.rtl:not(.sidebar-collapsed) .sidebar {
        left: auto !important;
        right: 0 !important;
      }

      .app.rtl:not(.sidebar-collapsed) .main {
        margin-left: 0 !important;
        margin-right: 248px !important;
      }

      .app .brand {
        position: relative !important;
        min-width: 0 !important;
        padding: 4px 38px 18px 4px !important;
      }

      .app.rtl .brand {
        padding: 4px 4px 18px 38px !important;
      }

      .app .brand-copy {
        min-width: 0 !important;
      }

      .app .sidebar-toggle {
        position: absolute !important;
        inset-inline-end: 0 !important;
        inset-inline-start: auto !important;
        top: 2px !important;
        width: 30px !important;
        height: 30px !important;
        border: 1px solid rgba(255,255,255,.2) !important;
        border-radius: 8px !important;
        background: rgba(255,255,255,.08) !important;
        color: #e7f2f1 !important;
      }

      .app .sidebar-mobile-close {
        display: none !important;
      }

      .app .sidebar-profile {
        display: flex !important;
        align-items: center !important;
        gap: 11px !important;
        min-width: 0 !important;
        min-height: 72px !important;
        margin: 14px 0 12px !important;
        padding: 10px !important;
        border: 1px solid rgba(255,255,255,.14) !important;
        border-radius: 12px !important;
        background: #193644 !important;
        color: #f3f8f8 !important;
        text-align: start !important;
      }

      .app .sidebar-profile-avatar {
        display: grid !important;
        width: 40px !important;
        height: 40px !important;
        flex: 0 0 40px !important;
        place-items: center !important;
        border: 1px solid rgba(255,255,255,.16) !important;
        border-radius: 50% !important;
        background: #087f70 !important;
        color: #fff !important;
        font-size: 15px !important;
        font-weight: 750 !important;
      }

      .app .sidebar-profile-info {
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        min-width: 0 !important;
        gap: 5px !important;
      }

      .app .sidebar-profile-info strong {
        max-width: 100% !important;
        color: #f6f9fa !important;
        font-size: 13px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      .app .sidebar-profile-info .sidebar-role-badge {
        display: inline-flex !important;
        width: fit-content !important;
        padding: 3px 8px !important;
        border: 1px solid rgba(255,255,255,.15) !important;
        border-radius: 999px !important;
        background: rgba(255,255,255,.08) !important;
        color: #b7ccc9 !important;
        font-size: 10px !important;
        font-weight: 650 !important;
        letter-spacing: 0 !important;
        text-transform: none !important;
      }

      .app .nav-button {
        min-height: 44px !important;
        gap: 12px !important;
        padding: 10px 11px !important;
        text-align: start !important;
      }

      .app .nav-button .nav-icon {
        display: grid !important;
        width: 22px !important;
        height: 22px !important;
        flex: 0 0 22px !important;
        place-items: center !important;
      }

      .app .nav-button .nav-icon svg {
        width: 19px !important;
        height: 19px !important;
        fill: none !important;
        stroke: currentColor !important;
        stroke-width: 1.8 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }

      .app .nav-button .nav-label {
        min-width: 0 !important;
        overflow-wrap: anywhere !important;
        white-space: normal !important;
      }

      .app .sidebar nav {
        gap: 6px !important;
      }

      .app .sidebar .finance-subnav {
        margin-inline: 8px 0 !important;
      }

      .app.rtl .sidebar .finance-subnav {
        margin-inline: 0 8px !important;
      }

      .app .topbar {
        min-width: 0 !important;
      }

      .app .header-account-entry {
        min-width: 0 !important;
      }

      .app .header-account-details {
        display: grid !important;
        min-width: 0 !important;
        gap: 2px !important;
        text-align: start !important;
      }

      .app .header-account-name {
        max-width: 190px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      .app .header-account-role {
        color: #71838a !important;
        font-size: 10px !important;
        font-weight: 550 !important;
        line-height: 1.2 !important;
      }

      .app .content[data-page] .dashboard-attendance-summary {
        min-width: 0;
      }

      .app .content[data-page="dashboard"] .dashboard-attendance-stats {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        margin-bottom: 0 !important;
      }

      .app .content[data-page="dashboard"] .dashboard-main-grid {
        grid-template-columns: minmax(0, 1.85fr) minmax(230px, 1fr) !important;
      }

      .app .content[data-page="dashboard"] .dashboard-activity {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }

      .app .content[data-page="dashboard"] .dashboard-activity > .dashboard-panel {
        min-width: 0 !important;
      }

      .app .content[data-page="dashboard"] .expense-chart-row {
        display: grid !important;
        gap: 7px !important;
      }

      .app .content[data-page="dashboard"] .expense-chart-head {
        align-items: flex-start !important;
        gap: 12px !important;
      }

      .app .content[data-page="dashboard"] .expense-chart-head > strong {
        min-width: 0 !important;
        overflow-wrap: anywhere !important;
      }

      .app .content[data-page="dashboard"] .financial-chart-value {
        display: grid !important;
        flex: 0 0 auto !important;
        gap: 2px !important;
        text-align: end !important;
      }

      .app .content[data-page="dashboard"] .financial-chart-value small,
      .app .content[data-page="dashboard"] .expense-chart-row > time {
        color: #71838a !important;
        font-size: 10px !important;
      }

      .app .content[data-page="dashboard"] .expense-chart-row.chart-income .expense-chart-bar {
        background: linear-gradient(90deg, #2586c7, #56a9e3) !important;
      }

      .app .content[data-page="dashboard"] .expense-chart-row.chart-expense .expense-chart-bar {
        background: linear-gradient(90deg, #e08b36, #f3b35f) !important;
      }

      .app .content[data-page="dashboard"] .dashboard-currency-card {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) minmax(260px, 1.1fr) !important;
        align-items: center !important;
        gap: 18px !important;
      }

      .app .content[data-page="dashboard"] .currency-controls {
        display: grid !important;
        grid-template-columns: minmax(70px, .7fr) minmax(0, 1fr) auto minmax(0, 1fr) !important;
        align-items: center !important;
        gap: 8px !important;
        min-width: 0 !important;
      }

      .app .content[data-page="dashboard"] .currency-controls input,
      .app .content[data-page="dashboard"] .currency-controls select {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        height: 42px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .app .content[data-page="dashboard"] .currency-card h2 {
        font-size: clamp(16px, 1.4vw, 21px) !important;
        line-height: 1.5 !important;
      }

      .app .content[data-page="customers"] .customer-identity {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 160px;
      }

      .app .content[data-page="customers"] .customer-identity strong {
        min-width: 0;
        color: #263d45;
        overflow-wrap: anywhere;
      }

      .app .content[data-page="customers"] .customer-contract-badge {
        display: inline-flex;
        align-items: center;
        max-width: 160px;
        padding: 5px 9px;
        border: 1px solid #c9dff5;
        border-radius: 999px;
        background: #eef6fd;
        color: #28669e;
        font-size: 11px;
        font-weight: 700;
        overflow-wrap: anywhere;
      }

      .app .page-tools .customer-contract-filter {
        display: grid;
        gap: 4px;
        min-width: 130px;
        color: #53666e;
        font-size: 10px;
        font-weight: 650;
      }

      .app .page-tools .customer-contract-filter select {
        min-height: 40px !important;
        min-width: 0 !important;
        padding: 7px 10px !important;
        border: 1px solid #d5e0e2 !important;
        border-radius: 8px !important;
        background: #fff !important;
        color: #30434b !important;
      }

      .app .content[data-page="settings"] .settings-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        padding: 14px 18px 0;
        border-bottom: 1px solid #e8edef;
      }

      .app .content[data-page="settings"] .settings-tabs button {
        min-height: 38px !important;
        padding: 8px 12px !important;
        border: 1px solid transparent !important;
        border-radius: 8px 8px 0 0 !important;
        background: transparent !important;
        color: #63747d !important;
        box-shadow: none !important;
        font-size: 12px !important;
        font-weight: 650 !important;
      }

      .app .content[data-page="settings"] .settings-tabs button.selected {
        border-color: #dce5e7 !important;
        border-bottom-color: #fff !important;
        background: #fff !important;
        color: #087f70 !important;
      }

      .app .content[data-page="settings"] .settings-section-heading {
        padding: 18px 20px 8px;
      }

      .app .content[data-page="settings"] .settings-section-heading h3 {
        margin: 0 0 4px;
        color: #1b2c35;
        font-size: 14px;
      }

      .app .content[data-page="settings"] .settings-section-heading p {
        color: #718087;
        font-size: 12px;
        line-height: 1.55;
      }

      .app .content[data-page="settings"] .settings-section .setting-row:last-child {
        border-bottom: 0 !important;
      }

      .app .content[data-page="attendance"] .daily-attendance-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-width: 0;
        padding: 16px 18px;
        border: 1px solid #dce5e7;
        border-radius: 12px;
        background: #fff;
      }

      .app .content[data-page="attendance"] .daily-attendance-heading h2 {
        margin: 0 0 4px;
        color: #1b2c35;
        font-size: 15px;
      }

      .app .content[data-page="attendance"] .daily-attendance-heading p {
        color: #63747d;
        font-size: 12px;
      }

      .app .content[data-page="attendance"] .daily-attendance-heading > span {
        flex: 0 0 auto;
        padding: 6px 10px;
        border: 1px solid #dce5e7;
        border-radius: 999px;
        background: #f4f7f8;
        color: #63747d;
        font-size: 11px;
        font-weight: 700;
      }

      .app .content[data-page="attendance"] .daily-attendance-heading > span.is-today {
        border-color: #b9e2d5;
        background: #eaf7f1;
        color: #167451;
      }

      .app.night .content[data-page="settings"] .settings-tabs {
        border-color: #334951;
      }

      .app.night .content[data-page="settings"] .settings-tabs button.selected {
        border-color: #334951 !important;
        border-bottom-color: #20363f !important;
        background: #20363f !important;
        color: #80d5c2 !important;
      }

      .app.night .content[data-page="settings"] .settings-section-heading h3,
      .app.night .content[data-page="attendance"] .daily-attendance-heading h2 {
        color: #e3edef;
      }

      .app.night .content[data-page="settings"] .settings-section-heading p,
      .app.night .content[data-page="attendance"] .daily-attendance-heading p {
        color: #a6b8bc;
      }

      .app.night .content[data-page="attendance"] .daily-attendance-heading,
      .app.night .content[data-page="attendance"] .daily-attendance-heading > span {
        border-color: #334951;
        background: #20363f;
        color: #a6b8bc;
      }

      .app.night .content[data-page="attendance"] .daily-attendance-heading > span.is-today {
        border-color: #286653;
        background: #1d433b;
        color: #9de0c9;
      }

      .app.night .content[data-page="customers"] .customer-identity strong {
        color: #e3edef;
      }

      @media (min-width: 651px) and (max-width: 1100px) {
        .app:not(.sidebar-collapsed) .sidebar {
          width: 220px !important;
          min-width: 220px !important;
        }

        .app:not(.sidebar-collapsed) .main {
          width: calc(100% - 220px) !important;
          margin-left: 220px !important;
        }

        .app.rtl:not(.sidebar-collapsed) .main {
          margin-right: 220px !important;
        }

        .app .content[data-page="dashboard"] .dashboard-stat-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        .app .content[data-page="dashboard"] .dashboard-activity {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        .app .content[data-page="dashboard"] .dashboard-main-grid {
          grid-template-columns: minmax(0, 1.6fr) minmax(210px, 1fr) !important;
        }
      }

      @media (max-width: 900px) {
        .app .content[data-page="dashboard"] .dashboard-currency-card {
          grid-template-columns: minmax(0, 1fr) !important;
        }
      }

      @media (max-width: 650px) {
        .app .sidebar,
        .app.sidebar-collapsed .sidebar {
          width: min(320px, 88vw) !important;
          min-width: 0 !important;
          padding: 16px !important;
        }

        .app .sidebar-toggle,
        .app.sidebar-collapsed .sidebar-toggle {
          display: none !important;
        }

        .app .sidebar-mobile-close {
          display: grid !important;
          width: 34px !important;
          height: 34px !important;
          flex: 0 0 34px !important;
          place-items: center !important;
          border: 1px solid rgba(255,255,255,.2) !important;
          border-radius: 8px !important;
          background: rgba(255,255,255,.08) !important;
          color: #f5faf9 !important;
          font-size: 22px !important;
        }

        .app .brand,
        .app.sidebar-collapsed .brand {
          justify-content: flex-start !important;
          padding: 4px 0 15px !important;
        }

        .app .brand-copy,
        .app.sidebar-collapsed .brand-copy,
        .app .sidebar-profile-info,
        .app.sidebar-collapsed .sidebar-profile-info,
        .app .nav-label,
        .app.sidebar-collapsed .nav-label,
        .app .finance-subnav,
        .app.sidebar-collapsed .finance-subnav,
        .app .logout-button,
        .app.sidebar-collapsed .logout-button {
          display: flex !important;
        }

        .app .brand-copy {
          flex-direction: column !important;
        }

        .app .finance-subnav {
          flex-direction: column !important;
        }

        .app .sidebar-profile,
        .app.sidebar-collapsed .sidebar-profile {
          justify-content: flex-start !important;
          padding: 10px !important;
        }

        .app .nav-button,
        .app.sidebar-collapsed .nav-button {
          justify-content: flex-start !important;
          min-height: 44px !important;
          padding: 10px 11px !important;
        }

        .app .nav-button .nav-icon,
        .app.sidebar-collapsed .nav-button .nav-icon {
          width: 22px !important;
          flex: 0 0 22px !important;
        }

        .app .main,
        .app.rtl .main,
        .app.sidebar-collapsed .main,
        .app.sidebar-collapsed.rtl .main {
          width: 100% !important;
          margin: 0 !important;
        }

        .app .topbar {
          flex-wrap: wrap !important;
          height: auto !important;
          min-height: 0 !important;
          padding: 9px 12px !important;
        }

        .app .topbar > div:first-child {
          width: 100% !important;
          justify-content: space-between !important;
        }

        .app .topbar .top-label {
          display: none !important;
        }

        .app .header-account-entry {
          margin-inline-start: auto !important;
        }

        .app .header-account-name {
          max-width: min(30vw, 150px) !important;
        }

        .app .top-actions {
          width: 100% !important;
          justify-content: flex-start !important;
          flex-wrap: wrap !important;
        }

        .app .content[data-page="dashboard"] .dashboard-stat-grid,
        .app .content[data-page="dashboard"] .dashboard-financial-summary {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        .app .content[data-page="dashboard"] .dashboard-attendance-stats {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }

        .app .content[data-page="dashboard"] .dashboard-main-grid,
        .app .content[data-page="dashboard"] .dashboard-activity {
          grid-template-columns: minmax(0, 1fr) !important;
        }

        .app .content[data-page="dashboard"] .currency-controls {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) auto minmax(0, 1.2fr) !important;
        }

        .app .page-tools .customer-contract-filter {
          flex: 1 1 100%;
        }
      }

      @media (max-width: 380px) {
        .app .header-account-label {
          display: none !important;
        }

        .app .content[data-page="dashboard"] .dashboard-stat-grid,
        .app .content[data-page="dashboard"] .dashboard-financial-summary {
          grid-template-columns: minmax(0, 1fr) !important;
        }

        .app .content[data-page="dashboard"] .dashboard-attendance-stats {
          grid-template-columns: minmax(0, 1fr) !important;
        }
      }

      #root .app .nav-button .nav-label {
        display: block !important;
        width: auto !important;
        min-width: 0 !important;
        flex: 1 1 auto !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
      }

      #root .app .header-account-entry {
        min-height: 46px !important;
        border: 1px solid #dce5e7 !important;
        border-radius: 10px !important;
        background: #fff !important;
        color: #1b2c35 !important;
        box-shadow: none !important;
      }

      #root .app .header-account-details {
        display: grid !important;
        min-width: 0 !important;
        gap: 2px !important;
      }

      #root .app .header-account-name,
      #root .app .header-account-role {
        display: block !important;
        max-width: 190px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      #root .app .header-account-role {
        color: #71838a !important;
        font-size: 10px !important;
        font-weight: 550 !important;
      }

      #root .app .content[data-page] .page-heading-row > .page-title {
        display: grid !important;
        align-content: start !important;
        gap: 5px !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      #root .app .content[data-page] .page-title p {
        margin: 0 !important;
        font-size: 12px !important;
        line-height: 1.55 !important;
      }

      #root .app.day {
        color: #1b2c35 !important;
        background: #f2f5f6 !important;
      }

      #root .app.day .sidebar {
        background: #142b39 !important;
        border-color: #24404d !important;
        box-shadow: 8px 0 28px rgba(12,31,41,.12) !important;
      }

      #root .app.day .brand {
        border-color: rgba(255,255,255,.13) !important;
        background: transparent !important;
      }

      #root .app.day .brand-logo,
      #root .app.day .sidebar-profile-avatar {
        border: 0 !important;
        border-radius: 12px !important;
        background: #087f70 !important;
        color: #fff !important;
        box-shadow: none !important;
      }

      #root .app.day .sidebar-profile {
        border-color: rgba(255,255,255,.14) !important;
        border-radius: 12px !important;
        background: #193644 !important;
        color: #f3f8f8 !important;
        box-shadow: none !important;
      }

      #root .app.day .sidebar-profile-info strong,
      #root .app.day .brand-copy strong,
      #root .app.day .brand-copy small {
        color: #f3f8f8 !important;
      }

      #root .app.day .sidebar-role-badge {
        border-color: rgba(255,255,255,.15) !important;
        background: rgba(255,255,255,.08) !important;
        color: #b7ccc9 !important;
      }

      #root .app.day .nav-button {
        border: 1px solid transparent !important;
        border-radius: 9px !important;
        background: transparent !important;
        color: #c0d0d4 !important;
        box-shadow: none !important;
      }

      #root .app.day .nav-button:hover {
        border-color: rgba(255,255,255,.1) !important;
        background: rgba(255,255,255,.07) !important;
        color: #fff !important;
      }

      #root .app.day .nav-button.active {
        border-color: rgba(73,193,169,.28) !important;
        background: rgba(12,139,119,.23) !important;
        color: #effcf8 !important;
        box-shadow: inset 3px 0 0 #28ad94 !important;
      }

      #root .app.day.rtl .nav-button.active {
        box-shadow: inset -3px 0 0 #28ad94 !important;
      }

      #root .app.day .topbar {
        border: 0 !important;
        border-bottom: 1px solid #dce5e7 !important;
        border-radius: 0 !important;
        background: #fff !important;
        color: #1b2c35 !important;
        box-shadow: 0 2px 8px rgba(24,48,57,.035) !important;
      }

      #root .app.day .top-actions > button,
      #root .app.day .clock,
      #root .app.day .top-language {
        border: 1px solid #dce5e7 !important;
        border-radius: 9px !important;
        background: #fff !important;
        color: #40545c !important;
        box-shadow: none !important;
      }

      #root .app.day .top-language button.selected {
        border-radius: 7px !important;
        background: #e8f4f1 !important;
        color: #06695d !important;
      }

      #root .app.day .top-language button {
        border: 0 !important;
        border-radius: 7px !important;
        background: transparent !important;
        color: #52666d !important;
      }

      #root .app.day .top-language button.selected {
        background: #e8f4f1 !important;
        color: #06695d !important;
      }

      #root .app.day .theme-button:hover,
      #root .app.day .refresh-button:hover {
        border-color: #9bcfc4 !important;
        background: #f0f8f6 !important;
        color: #06695d !important;
      }

      #root .app.day .content[data-page] .page-title h1,
      #root .app.day .content[data-page] .section-title h2 {
        color: #1b2c35 !important;
      }

      #root .app.day .content[data-page] .stat,
      #root .app.day .content[data-page] .module-summary,
      #root .app.day .content[data-page] .dashboard-date,
      #root .app.day .content[data-page] .dashboard-attendance,
      #root .app.day .content[data-page] .dashboard-panel,
      #root .app.day .content[data-page] .form-card,
      #root .app.day .content[data-page] .table-card,
      #root .app.day .content[data-page] .settings-card,
      #root .app.day .content[data-page] .finance-card,
      #root .app.day .content[data-page] .currency-card,
      #root .app.day .content[data-page] .empty {
        border-color: #dce5e7 !important;
        border-radius: 12px !important;
        background: #fff !important;
        color: #1b2c35 !important;
        box-shadow: 0 5px 18px rgba(24,48,57,.055) !important;
        backdrop-filter: none !important;
      }

      #root .app.day .content[data-page] .primary-button,
      #root .app.day .page-tools .new-record-button {
        border: 1px solid #087f70 !important;
        border-radius: 8px !important;
        background: #087f70 !important;
        color: #fff !important;
        box-shadow: 0 4px 10px rgba(8,127,112,.12) !important;
      }

      #root .app.day .content[data-page] .secondary-button,
      #root .app.day .content[data-page] .tool-button,
      #root .app.day .content[data-page] .edit-button,
      #root .app.day .content[data-page] .receipt-button {
        border: 1px solid #d5e0e2 !important;
        border-radius: 8px !important;
        background: #fff !important;
        color: #40565e !important;
        box-shadow: none !important;
      }

      #root .app.day .content[data-page] .customer-contract-badge {
        border-color: #c9dff5 !important;
        background: #eef6fd !important;
        color: #28669e !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-stat-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        align-items: stretch !important;
        gap: 14px !important;
        margin-bottom: 20px !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-stat-grid > .stat {
        height: 100% !important;
        min-height: 94px !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-finances {
        margin-bottom: 20px !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-finances > .section-title {
        margin-bottom: 14px !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-financial-summary {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        align-items: stretch !important;
        gap: 16px !important;
        margin: 0 !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-financial-summary > .stat {
        height: 100% !important;
        min-height: 94px !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-main-grid {
        grid-template-columns: minmax(0, 1.85fr) minmax(0, 1fr) !important;
        align-items: start !important;
        gap: 18px !important;
        margin-top: 20px !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-chart,
      #root .app .content[data-page="dashboard"] .dashboard-quick-actions {
        min-width: 0 !important;
        align-self: start !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-main-grid .section-title,
      #root .app .content[data-page="dashboard"] .dashboard-activity .section-title {
        margin-bottom: 14px !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-quick-actions .quick-buttons {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) !important;
        gap: 9px !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-quick-actions .quick-buttons > button {
        width: 100% !important;
        min-height: 42px !important;
        text-align: start !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-activity {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        align-items: start !important;
        gap: 16px !important;
        margin-top: 20px !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-activity > .dashboard-panel {
        min-width: 0 !important;
        height: auto !important;
        align-self: start !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-activity .recent-row {
        min-width: 0 !important;
        align-items: flex-start !important;
        gap: 10px !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-activity .recent-row > div {
        min-width: 0 !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-activity .recent-row strong,
      #root .app .content[data-page="dashboard"] .dashboard-activity .recent-row small {
        overflow-wrap: anywhere !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-currency-card {
        grid-template-columns: minmax(0, .8fr) minmax(0, 1.4fr) !important;
        gap: 20px !important;
        margin-top: 20px !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-currency-card > div:first-child {
        min-width: 0 !important;
      }

      #root .app .content[data-page="dashboard"] .dashboard-currency-card h2 {
        display: flex !important;
        flex-wrap: wrap !important;
        align-items: baseline !important;
        gap: 4px 8px !important;
        overflow-wrap: anywhere !important;
      }

      #root .app .content[data-page="dashboard"] .currency-summary-label {
        display: block !important;
        flex: 1 1 100% !important;
        max-width: 100% !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
      }

      #root .app .content[data-page="dashboard"] .currency-controls {
        grid-template-columns: minmax(90px, .55fr) minmax(0, 1.4fr) auto minmax(0, 1.4fr) !important;
        gap: 10px !important;
      }

      #root .app .content[data-page="dashboard"] .currency-field {
        display: grid !important;
        min-width: 0 !important;
        gap: 5px !important;
      }

      #root .app .content[data-page="dashboard"] .currency-field > span {
        color: #71838a !important;
        font-size: 10px !important;
        font-weight: 650 !important;
        line-height: 1.2 !important;
      }

      #root .app .content[data-page="dashboard"] .currency-field input,
      #root .app .content[data-page="dashboard"] .currency-field select {
        min-width: 0 !important;
        width: 100% !important;
        height: 44px !important;
        font-size: 13px !important;
      }

      #root .app .content[data-page="dashboard"] .currency-direction {
        align-self: end !important;
        padding-bottom: 13px !important;
      }

      #root .app .toast {
        position: fixed !important;
        top: 12px !important;
        right: auto !important;
        bottom: auto !important;
        left: 50% !important;
        z-index: 10000 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 12px !important;
        width: min(360px, calc(100vw - 32px)) !important;
        min-height: 44px !important;
        padding: 8px 10px 8px 14px !important;
        transform: translateX(-50%) !important;
        font-size: 13px !important;
        line-height: 1.4 !important;
      }

      #root .app .toast > span {
        min-width: 0 !important;
        overflow-wrap: anywhere !important;
      }

      #root .app .toast-dismiss {
        display: grid !important;
        flex: 0 0 28px !important;
        width: 28px !important;
        height: 28px !important;
        place-items: center !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 6px !important;
        background: transparent !important;
        color: inherit !important;
        font-size: 20px !important;
        line-height: 1 !important;
        cursor: pointer !important;
      }

      #root .app .toast-dismiss:hover {
        background: rgba(8, 127, 112, .1) !important;
      }

      @media (min-width: 1350px) {
        #root .app .content[data-page="dashboard"] .dashboard-stat-grid.has-users-kpi {
          grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
        }
      }

      @media (min-width: 651px) and (max-width: 1349px) {
        #root .app .content[data-page="dashboard"] .dashboard-stat-grid.has-users-kpi {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }
      }

      @media (min-width: 651px) and (max-width: 1100px) {
        #root .app .content[data-page="dashboard"] .dashboard-stat-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        #root .app .content[data-page="dashboard"] .dashboard-stat-grid.has-users-kpi {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        #root .app .content[data-page="dashboard"] .dashboard-main-grid {
          grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) !important;
        }

        #root .app .content[data-page="dashboard"] .dashboard-activity {
          grid-template-columns: minmax(0, 1fr) !important;
        }
      }

      @media (max-width: 1100px) {
        #root .app.has-toast .content[data-page] {
          padding-top: 64px !important;
        }

        #root .app .toast {
          top: 78px !important;
        }
      }

      @media (max-width: 650px) {
        #root .app .content[data-page="dashboard"] .dashboard-stat-grid,
        #root .app .content[data-page="dashboard"] .dashboard-stat-grid.has-users-kpi,
        #root .app .content[data-page="dashboard"] .dashboard-attendance-stats,
        #root .app .content[data-page="dashboard"] .dashboard-financial-summary,
        #root .app .content[data-page="dashboard"] .dashboard-main-grid,
        #root .app .content[data-page="dashboard"] .dashboard-activity {
          grid-template-columns: minmax(0, 1fr) !important;
        }

        #root .app.has-toast .content[data-page] {
          padding-top: 64px !important;
        }

        #root .app .toast {
          top: 116px !important;
        }

        #root .app .content[data-page="dashboard"] .dashboard-currency-card {
          grid-template-columns: minmax(0, 1fr) !important;
        }

        #root .app .content[data-page="dashboard"] .currency-controls {
          grid-template-columns: minmax(0, 1fr) !important;
          gap: 10px !important;
        }

        #root .app .content[data-page="dashboard"] .currency-direction {
          justify-self: center !important;
          align-self: center !important;
          padding: 0 !important;
          transform: rotate(90deg) !important;
        }

        #root .app:not(.sidebar-collapsed) .main,
        #root .app.sidebar-collapsed .main,
        #root .app.rtl:not(.sidebar-collapsed) .main,
        #root .app.sidebar-collapsed.rtl .main {
          width: 100% !important;
          margin: 0 !important;
        }

        #root .app .content[data-page] .page-heading-row > .page-title {
          width: 100% !important;
        }

        #root .app .header-account-name {
          max-width: min(35vw, 150px) !important;
          white-space: normal !important;
          line-height: 1.2 !important;
        }

        #root .app .header-account-entry {
          flex-shrink: 0 !important;
          max-width: calc(100vw - 64px) !important;
          gap: 6px !important;
          padding: 4px 7px 4px 4px !important;
        }

        #root .app .header-account-label {
          display: inline-flex !important;
        }

        #root .app .header-account-role {
          white-space: normal !important;
        }
      }
            `}</style>

      <div
        className={`app ${language === "fa" ? "rtl" : ""} ${theme} ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        } ${mobileMenuOpen ? "mobile-menu-open" : ""} ${
          isSuperAdminRole(currentUser?.role) ? "role-super-admin" : ""
        } ${toast ? "has-toast" : ""}`}
      >

        {/* SIDEBAR */}

        <aside className="sidebar">

          <div className="brand">
            <div className="brand-logo">
              OM
            </div>

            <div className="brand-copy">
              <strong>
                OFFICE
              </strong>

              <small>
                MANAGEMENT
              </small>
            </div>

            <button
              type="button"
              className="sidebar-mobile-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label={language === "fa" ? "بستن منو" : "Close navigation"}
              title={language === "fa" ? "بستن منو" : "Close navigation"}
            >
              ×
            </button>

            <button
              type="button"
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed((value) => !value)}
              aria-label={
                sidebarCollapsed
                  ? language === "fa"
                    ? "باز کردن منو"
                    : "Expand menu"
                  : language === "fa"
                    ? "جمع کردن منو"
                    : "Collapse menu"
              }
              title={
                sidebarCollapsed
                  ? language === "fa"
                    ? "باز کردن منو"
                    : "Expand menu"
                  : language === "fa"
                    ? "جمع کردن منو"
                    : "Collapse menu"
              }
            >
              {sidebarCollapsed ? "›" : "‹"}
            </button>
          </div>

          <div className="sidebar-profile" role="group" aria-label={t.account}>
            <div className="sidebar-profile-avatar">
              {(currentUser?.name || currentUser?.username || "U")
                .trim()
                .slice(0, 1)
                .toUpperCase()}
            </div>
            <div className="sidebar-profile-info">
              <strong>
                {currentUser?.name || currentUser?.username || "User"}
              </strong>
              <span className="sidebar-role-badge">
                {getRoleLabel(currentUser?.role, language)}
              </span>
            </div>
          </div>

          <nav id="primary-navigation" onClick={() => setMobileMenuOpen(false)}>

            {isAdminRole(currentUser?.role) && (
              <NavButton
                label={t.dashboard}
                icon="⌂"
                active={page === "dashboard"}
                onClick={() => {
                  setRecordFormOpen(false);
                  setPage("dashboard");
                  setOpenMenu("");
                }}
              />
            )}

            {!isAdminRole(currentUser?.role) && (
              <>
            <NavButton
              label={t.dashboard}
              icon="⌂"
              active={page === "dashboard"}
              onClick={() => {
                setRecordFormOpen(false);
                setPage("dashboard");
                setOpenMenu("");
              }}
            />

            <NavButton
              label={t.customers}
              icon="◉"
              active={
                openMenu === "customers" ||
                page === "customers"
              }
              onClick={() =>
                toggleSection(
                  "customers",
                  "customers"
                )
              }
            />

            {openMenu === "customers" && (
              <div className="finance-subnav">
                <button
                  type="button"
                  className={
                    page === "customers" &&
                    !recordFormOpen
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    showListPage("customers")
                  }
                >
                  ▸{" "}
                  {language === "fa"
                    ? "همه مشتریان"
                    : "ALL CUSTOMERS"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    startNewRecord("customers")
                  }
                >
                  ＋{" "}
                  {language === "fa"
                    ? "مشتری جدید"
                    : "NEW CUSTOMER"}
                </button>
              </div>
            )}

            <NavButton
              label={
                language === "fa"
                  ? "کارمندان"
                  : "EMPLOYEES"
              }
              icon="♙"
              active={
                openMenu === "employees" ||
                page === "employees"
              }
              onClick={() =>
                toggleSection(
                  "employees",
                  "employees"
                )
              }
            />

            {openMenu === "employees" && (
              <div className="finance-subnav">
                <button
                  type="button"
                  className={
                    page === "employees" &&
                    !recordFormOpen
                      ? "active"
                      : ""
                  }
                  onClick={() => showListPage("employees")}
                >
                  ▸ {language === "fa" ? "همه کارمندان" : "ALL EMPLOYEES"}
                </button>
                <button
                  type="button"
                  onClick={() => startNewRecord("employees")}
                >
                  ＋ {language === "fa" ? "کارمند جدید" : "NEW EMPLOYEE"}
                </button>
              </div>
            )}

            <NavButton
              label={
                language === "fa"
                  ? "قراردادها"
                  : "CONTRACTS"
              }
              icon="▤"
              active={
                openMenu === "contracts" ||
                page === "contracts"
              }
              onClick={() =>
                toggleSection(
                  "contracts",
                  "contracts"
                )
              }
            />

            {openMenu === "contracts" && (
              <div className="finance-subnav">
                <button
                  type="button"
                  className={
                    page === "contracts" &&
                    !recordFormOpen
                      ? "active"
                      : ""
                  }
                  onClick={() => showListPage("contracts")}
                >
                  ▸ {language === "fa" ? "همه قراردادها" : "ALL CONTRACTS"}
                </button>
                <button
                  type="button"
                  onClick={() => startNewRecord("contracts")}
                >
                  ＋ {language === "fa" ? "قرارداد جدید" : "NEW CONTRACT"}
                </button>
              </div>
            )}

            {canManageAccountsAs(currentUser) && (
              <NavButton
                label={t.users}
                icon="♙"
                active={
                  openMenu === "users" ||
                  page === "users"
                }
                onClick={() =>
                  toggleSection(
                    "users",
                    "users"
                  )
                }
              />
            )}

            {canManageAccountsAs(currentUser) && openMenu === "users" && (
              <div className="finance-subnav">
                <button
                  type="button"
                  className={
                    page === "users" &&
                    !recordFormOpen
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    showListPage("users")
                  }
                >
                  ▸{" "}
                  {language === "fa"
                    ? "همه کاربران"
                    : "ALL USERS"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    startNewRecord("users")
                  }
                >
                  ＋{" "}
                  {language === "fa"
                    ? "حساب جدید"
                    : "NEW ACCOUNT"}
                </button>
              </div>
            )}
              </>
            )}

            <NavButton
              label={t.attendance}
              icon="✓"
              active={
                openMenu === "attendance" ||
                page === "attendance"
              }
              onClick={() =>
                toggleSection(
                  "attendance",
                  "attendance"
                )
              }
            />

            {openMenu === "attendance" && (
              <div className="finance-subnav">
                <button
                  type="button"
                  className={
                    page === "attendance" &&
                    !recordFormOpen
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    showListPage("attendance")
                  }
                >
                  ▸{" "}
                  {language === "fa"
                    ? "همه حاضری‌ها"
                    : "ALL ATTENDANCE"}
                </button>

                <button
                  type="button"
                  onClick={() => showListPage("attendance")}
                >
                  ＋{" "}
                  {language === "fa"
                    ? "ثبت روزانه"
                    : "DAILY REGISTER"}
                </button>
              </div>
            )}

            <NavButton
              label={t.instructions}
              icon="▤"
              active={page === "instructions"}
              onClick={() => {
                setRecordFormOpen(false);
                setPage("instructions");
                setOpenMenu("");
              }}
            />

            {!isAdminRole(currentUser?.role) && (
              <>
            <NavButton
              label={t.finance}
              icon="₣"
              active={
                openMenu === "finance" ||
                [
                  "finance",
                  "payments",
                  "income",
                  "expenses",
                  "debts",
                ].includes(page)
              }
              onClick={() =>
                toggleSection(
                  "finance",
                  "finance"
                )
              }
            />

            {openMenu === "finance" && (
              <div className="finance-subnav">

                <button
                  type="button"
                  className={
                    page === "finance"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    showListPage("finance")
                  }
                >
                  ▸ {t.financeOverview}
                </button>

                <button
                  type="button"
                  className={
                    page === "payments" &&
                    !recordFormOpen
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    showListPage("payments")
                  }
                >
                  ▸ {t.payments}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    startNewRecord("payments")
                  }
                >
                  ＋{" "}
                  {language === "fa"
                    ? "پرداخت جدید"
                    : "NEW PAYMENT"}
                </button>

                <button
                  type="button"
                  className={
                    page === "income" &&
                    !recordFormOpen
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    showListPage("income")
                  }
                >
                  ▸ {t.incomeRecords}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    startNewRecord("income")
                  }
                >
                  ＋{" "}
                  {language === "fa"
                    ? "درآمد جدید"
                    : "NEW INCOME"}
                </button>

                <button
                  type="button"
                  className={
                    page === "expenses" &&
                    !recordFormOpen
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    showListPage("expenses")
                  }
                >
                  ▸ {t.expenses}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    startNewRecord("expenses")
                  }
                >
                  ＋{" "}
                  {language === "fa"
                    ? "مصرف جدید"
                    : "NEW EXPENSE"}
                </button>

                <button
                  type="button"
                  className={
                    page === "debts" &&
                    !recordFormOpen
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    showListPage("debts")
                  }
                >
                  ▸ {t.debts}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    startNewRecord("debts")
                  }
                >
                  ＋{" "}
                  {language === "fa"
                    ? "قرض جدید"
                    : "NEW DEBT"}
                </button>

              </div>
            )}

            <NavButton
              label={t.projects}
              icon="▣"
              active={
                openMenu === "projects" ||
                page === "projects"
              }
              onClick={() =>
                toggleSection(
                  "projects",
                  "projects"
                )
              }
            />

            {openMenu === "projects" && (
              <div className="finance-subnav">
                <button
                  type="button"
                  className={
                    page === "projects" &&
                    !recordFormOpen
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    showListPage("projects")
                  }
                >
                  ▸{" "}
                  {language === "fa"
                    ? "همه پروژه‌ها"
                    : "ALL PROJECTS"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    startNewRecord("projects")
                  }
                >
                  ＋{" "}
                  {language === "fa"
                    ? "پروژه جدید"
                    : "NEW PROJECT"}
                </button>
              </div>
            )}

            {isSuperAdminRole(currentUser?.role) && (
              <NavButton
                label={t.settings}
                icon="⚙"
                active={page === "settings"}
                onClick={() => {
                  setRecordFormOpen(false);
                  setPage("settings");
                  setOpenMenu("");
                }}
              />
            )}
              </>
            )}

          </nav>

          <button
            className="logout-button"
            onClick={logout}
          >
            ⇥ {t.logout}
          </button>

        </aside>

        {mobileMenuOpen && (
          <button
            type="button"
            className="mobile-menu-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-label={language === "fa" ? "بستن منو" : "Close navigation"}
          />
        )}

        {/* MAIN AREA */}

        <main className="main">

          {/* TOPBAR */}

          <header className="topbar">

            <div>
              <button
                type="button"
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-expanded={mobileMenuOpen}
                aria-controls="primary-navigation"
                aria-label={mobileMenuOpen
                  ? language === "fa" ? "بستن منو" : "Close navigation"
                  : language === "fa" ? "باز کردن منو" : "Open navigation"}
              >
                {mobileMenuOpen ? "×" : "☰"}
              </button>
              <span className="top-label">
                {t.welcome}
              </span>
              <button
                type="button"
                className="header-account-entry"
                onClick={() => {
                  setRecordFormOpen(false);
                  setPage("my-account");
                  setOpenMenu("");
                  setMobileMenuOpen(false);
                }}
                aria-label={`${t.account}: ${currentUser?.name || currentUser?.username || "User"}`}
              >
                <span className="header-account-avatar" aria-hidden="true">
                  {(currentUser?.name || currentUser?.username || "U")
                    .trim()
                    .slice(0, 1)
                    .toUpperCase()}
                </span>
                <span className="header-account-details">
                  <strong className="header-account-name" dir="auto">
                    {currentUser?.name || currentUser?.username || "User"}
                  </strong>
                  <small className="header-account-role" dir="auto">
                    {getRoleLabel(currentUser?.role, language)}
                  </small>
                </span>
                <span className="header-account-label">{t.account}</span>
                <ProfileIcon />
              </button>
            </div>

            <div className="top-actions">

              {settings.dateTime && (
                <div className="clock">
                  {formatTime(now)}
                </div>
              )}

              <div className="top-language">
                <button
                  type="button"
                  className={language === "en" ? "selected" : ""}
                  onClick={() => setLanguage("en")}
                  title="English"
                >
                  EN
                </button>
                <button
                  type="button"
                  className={language === "fa" ? "selected" : ""}
                  onClick={() => setLanguage("fa")}
                  title="فارسی"
                >
                  فارسی
                </button>
              </div>

              <button
                className="theme-button"
                title={theme === "night" ? t.dayMode : t.nightMode}
                onClick={() =>
                  setTheme(theme === "night" ? "day" : "night")
                }
              >
                {theme === "night" ? "☀" : "☾"}
              </button>

              <button
              type="button"
                className="refresh-button"
                onClick={refreshPage}
                title={
                  language === "fa"
                    ? "تازسازی صفحه"
                    : "Refresh page"
                }
              >
                {refreshing
                  ? "..."
                  : "↻"}
              </button>

            </div>

          </header>

          {/* DASHBOARD */}

          {page === "dashboard" && isAdminRole(currentUser?.role) && (
            <AdminDashboard
              t={t}
              language={language}
              attendance={attendance}
              employees={employees}
              instructions={instructions}
              now={now}
              setPage={setPage}
              startNewRecord={startNewRecord}
            />
          )}

          {page === "dashboard" && !isAdminRole(currentUser?.role) && (
            <Dashboard
              t={t}
              customers={customers}
              employees={employees}
              showUserManagementAction={canManageAccountsAs(currentUser)}
              showUsersCount={isSuperAdminRole(currentUser?.role)}
              users={users}
              attendance={attendance}
              payments={payments}
              projects={projects}
              instructions={instructions}
              financeIncome={financeIncome}
              financeExpenses={financeExpenses}
              income={income}
              expense={expense}
              balance={balance}
              now={now}
              settings={settings}
              currencyAmount={currencyAmount}
              setCurrencyAmount={
                setCurrencyAmount
              }
              currencyFrom={currencyFrom}
              setCurrencyFrom={setCurrencyFrom}
              currencyTo={currencyTo}
              setCurrencyTo={setCurrencyTo}
              convertedAmount={
                convertedAmount
              }
              setPage={setPage}
              language={language}
            />
          )}

          {/* CUSTOMERS */}

          {page === "customers" && (
            <Page
              title={t.customers}
              pageKey="customers"
              description={language === "fa" ? "فهرست و اطلاعات مشتریان دفتر." : "Manage customer records and contact details."}
              toolbar={renderPageTools(
                "customers",
                <label className="customer-contract-filter">
                  <span>{language === "fa" ? "فیلتر قرارداد" : "Contract"}</span>
                  <select
                    value={customerContractFilter}
                    onChange={(event) => setCustomerContractFilter(event.target.value)}
                    aria-label={language === "fa" ? "فیلتر مشتریان بر اساس قرارداد" : "Filter customers by contract"}
                  >
                    <option value="all">{language === "fa" ? "همه" : "All"}</option>
                    <option value="linked">{language === "fa" ? "دارای قرارداد" : "Linked"}</option>
                    <option value="unlinked">{language === "fa" ? "بدون قرارداد" : "Not linked"}</option>
                  </select>
                </label>
              )}
            >

              {recordFormOpen && (
                <FormCard
                  title={
                    editingCustomer
                      ? t.edit
                      : t.add
                  }
                >
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setRecordFormOpen(false);
                      setEditingCustomer(null);
                      setCustomerForm(emptyCustomer);
                    }}
                    style={{ marginBottom: "20px" }}
                  >
                    ←{" "}
                    {language === "fa"
                      ? "برگشت به لیست"
                      : "BACK TO LIST"}
                  </button>

                  <form
                    onSubmit={saveCustomer}
                    className="form-layout"
                  >
                    <div className="form-section">
                      <SectionTitle title={language === "fa" ? "اطلاعات مشتری" : "CUSTOMER DETAILS"} />
                      <div className="form-grid">
                        <PhotoInput
                          label={language === "fa" ? "عکس مشتری" : "CUSTOMER PHOTO"}
                          value={customerForm.photo}
                          onChange={(photo) => setCustomerForm({ ...customerForm, photo })}
                        />
                        <Input
                          label={t.name}
                          value={customerForm.name}
                          onChange={(value) => setCustomerForm({ ...customerForm, name: value })}
                          required
                        />
                        <Input
                          label={t.phone}
                          value={customerForm.phone}
                          onChange={(value) => setCustomerForm({ ...customerForm, phone: value })}
                        />
                      </div>
                    </div>

                    <div className="form-section">
                      <SectionTitle title={language === "fa" ? "اطلاعات دوکان و قرارداد" : "SHOP & CONTRACT DETAILS"} />
                      <div className="form-grid">
                        <Input
                          label={t.shopName}
                          value={customerForm.shop_name}
                          onChange={(value) => setCustomerForm({ ...customerForm, shop_name: value })}
                        />
                        <Input
                          label={t.shopNumber}
                          value={customerForm.shop_number}
                          onChange={(value) => setCustomerForm({ ...customerForm, shop_number: value })}
                        />
                        <Input
                          label={t.address}
                          value={customerForm.address}
                          onChange={(value) => setCustomerForm({ ...customerForm, address: value })}
                        />
                        <Input
                          label={t.contractId}
                          value={customerForm.contract_id}
                          onChange={(value) => setCustomerForm({ ...customerForm, contract_id: value })}
                        />
                        <Input
                          label={t.dateId}
                          value={customerForm.date_id}
                          onChange={(value) => setCustomerForm({ ...customerForm, date_id: value })}
                        />
                      </div>
                    </div>

                    <FormButtons
                      editing={editingCustomer}
                      t={t}
                      cancel={() => {
                        setEditingCustomer(null);
                        setCustomerForm(emptyCustomer);
                        setRecordFormOpen(false);
                      }}
                    />
                  </form>
                </FormCard>
              )}

              {!recordFormOpen && (
                <>
                  <ModuleOverview
                    items={[
                      { label: t.customers, value: customers.length, tone: "blue" },
                      { label: language === "fa" ? "نمایش داده‌شده" : "Showing", value: getVisibleCustomerRows().length, tone: "teal" },
                      { label: t.contractId, value: customers.filter((customer) => customer.contract_id).length, tone: "purple" },
                      { label: language === "fa" ? "دارای عکس" : "With photo", value: customers.filter((customer) => customer.photo || getStoredPhoto("customer", customer.id)).length, tone: "orange" },
                    ]}
                  />

                  {getVisibleCustomerRows().length === 0 ? (
                    <Empty text={t.noData} />
                  ) : (
                    <Table
                      headers={[
                        language === "fa" ? "شناسه" : "ID",
                        t.customer,
                        t.phone,
                        t.shopName,
                        t.contractId,
                        t.address,
                        t.action,
                      ]}
                    >
                      {getVisibleCustomerRows().map(
                        ({ item, serial }) => (
                          <tr key={item.id}>
                            <td>{serial}</td>
                            <td>
                              <div className="customer-identity">
                                <AvatarPhoto src={item.photo || getStoredPhoto("customer", item.id)} />
                                <strong>{item.name}</strong>
                              </div>
                            </td>
                            <td>{item.phone}</td>
                            <td>{item.shop_name}</td>
                            <td>
                              {item.contract_id
                                ? <span className="customer-contract-badge">{item.contract_id}</span>
                                : "—"}
                            </td>
                            <td>{item.address}</td>
                            <td>
                              <ActionButtons
                                edit={() => editCustomer(item)}
                                remove={() => deleteCustomer(item.id)}
                                canEdit={canManageRecordsAs(currentUser, item)}
                                canDelete={canManageRecordsAs(currentUser, item)}
                                t={t}
                              />
                            </td>
                          </tr>
                        )
                      )}
                    </Table>
                  )}
                </>
              )}

            </Page>
          )}


          {/* EMPLOYEES */}

          {page === "employees" && (
            <Page
              title={language === "fa" ? "کارمندان" : "EMPLOYEES"}
              pageKey="employees"
              description={language === "fa" ? "مدیریت اطلاعات و فهرست کارمندان." : "Manage employee profiles and contact information."}
              toolbar={renderPageTools("employees")}
            >
              {!recordFormOpen && (
                <ModuleOverview items={[
                  { label: language === "fa" ? "کارمندان" : "Employees", value: employees.length, tone: "blue" },
                  { label: language === "fa" ? "دارای سمت" : "With position", value: employees.filter((employee) => employee.position).length, tone: "teal" },
                  { label: language === "fa" ? "دارای ایمیل" : "With email", value: employees.filter((employee) => employee.email).length, tone: "purple" },
                ]} />
              )}
              {recordFormOpen && (
                <FormCard
                  title={editingEmployee ? t.edit : (language === "fa" ? "کارمند جدید" : "NEW EMPLOYEE")}
                >
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setRecordFormOpen(false);
                      setEditingEmployee(null);
                      setEmployeeForm(emptyEmployee);
                    }}
                    style={{ marginBottom: "20px" }}
                  >
                    ← {language === "fa" ? "برگشت به لیست" : "BACK TO LIST"}
                  </button>

                  <form onSubmit={saveEmployee} className="form-grid">
                    <PhotoInput
                      label={language === "fa" ? "عکس کارمند" : "EMPLOYEE PHOTO"}
                      value={employeeForm.photo}
                      onChange={(photo) => setEmployeeForm({ ...employeeForm, photo })}
                    />
                    <Input label={t.name} value={employeeForm.name} onChange={(value) => setEmployeeForm({ ...employeeForm, name: value })} required />
                    <Input label={t.phone} value={employeeForm.phone} onChange={(value) => setEmployeeForm({ ...employeeForm, phone: value })} required />
                    <Input label={t.email} value={employeeForm.email} onChange={(value) => setEmployeeForm({ ...employeeForm, email: value })} />
                    <Input label={language === "fa" ? "سمت / وظیفه" : "POSITION"} value={employeeForm.position} onChange={(value) => setEmployeeForm({ ...employeeForm, position: value })} />
                    <Input label={language === "fa" ? "ولایت" : "PROVINCE"} value={employeeForm.province} onChange={(value) => setEmployeeForm({ ...employeeForm, province: value })} />
                    <Input label={t.address} value={employeeForm.address} onChange={(value) => setEmployeeForm({ ...employeeForm, address: value })} />
                    <FormButtons editing={editingEmployee} t={t} cancel={() => { setEditingEmployee(null); setEmployeeForm(emptyEmployee); setRecordFormOpen(false); }} />
                  </form>
                </FormCard>
              )}

              {!recordFormOpen && (
                <>
                  <SectionTitle title={language === "fa" ? "لیست کارمندان" : "EMPLOYEE LIST"} />
                  {searchItems(employees).length === 0 ? (
                    <Empty text={t.noData} />
                  ) : (
                    <Table headers={["#", language === "fa" ? "عکس" : "PHOTO", t.name, t.phone, t.email, language === "fa" ? "سمت" : "POSITION", language === "fa" ? "ولایت" : "PROVINCE", t.action]}>
                      {getNumberedRows(employees).map(({ item, serial }) => (
                        <tr key={item.id}>
                          <td>{serial}</td>
                          <td><AvatarPhoto src={item.photo} /></td>
                          <td>{item.name}</td>
                          <td>{item.phone}</td>
                          <td>{item.email || "-"}</td>
                          <td>{item.position || "-"}</td>
                          <td>{item.province || "-"}</td>
                          <td><ActionButtons edit={() => editEmployee(item)} remove={() => deleteEmployee(item.id)} canEdit={canManageRecordsAs(currentUser, item)} canDelete={canManageRecordsAs(currentUser, item)} t={t} /></td>
                        </tr>
                      ))}
                    </Table>
                  )}
                </>
              )}
            </Page>
          )}

          {/* CONTRACTS */}

          {page === "contracts" && (
            <Page
              title={language === "fa" ? "قراردادها" : "CONTRACTS"}
              pageKey="contracts"
              description={language === "fa" ? "مدیریت قراردادها و وضعیت اعتبار آن‌ها." : "Track contract details, dates, and current status."}
              toolbar={renderPageTools("contracts")}
            >
              {!recordFormOpen && (
                <ModuleOverview items={[
                  { label: language === "fa" ? "تمام قراردادها" : "All contracts", value: contracts.length, tone: "blue" },
                  { label: language === "fa" ? "فعال" : "Active", value: contracts.filter((item) => contractStatus(item.contract_end).className !== "expired" && contractStatus(item.contract_end).className !== "").length, tone: "teal" },
                  { label: language === "fa" ? "منقضی" : "Expired", value: contracts.filter((item) => contractStatus(item.contract_end).className === "expired").length, tone: "orange" },
                ]} />
              )}
              {recordFormOpen && (
                <FormCard
                  title={editingContract ? t.edit : (language === "fa" ? "قرارداد جدید" : "NEW CONTRACT")}
                >
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setRecordFormOpen(false);
                      setEditingContract(null);
                      setContractForm({ ...emptyContract, contract_start: getTodayInputDate() });
                    }}
                    style={{ marginBottom: "20px" }}
                  >
                    ← {language === "fa" ? "برگشت به لیست" : "BACK TO LIST"}
                  </button>

                  <form onSubmit={saveContract} className="form-grid">
                    <PhotoInput
                      label={language === "fa" ? "عکس / اسکن قرارداد" : "CONTRACT PHOTO / SCAN"}
                      value={contractForm.photo}
                      onChange={(photo) => setContractForm({ ...contractForm, photo })}
                    />
                    <Input label={language === "fa" ? "نام شخص" : "PERSON NAME"} value={contractForm.person_name} onChange={(value) => setContractForm({ ...contractForm, person_name: value })} required />
                    <Input label={language === "fa" ? "شماره خط" : "PHONE / LINE"} value={contractForm.line_number} onChange={(value) => setContractForm({ ...contractForm, line_number: value })} />
                    <Input label={t.shopName} value={contractForm.shop_name} onChange={(value) => setContractForm({ ...contractForm, shop_name: value })} />
                    <Input label={t.shopNumber} value={contractForm.shop_number} onChange={(value) => setContractForm({ ...contractForm, shop_number: value })} />
                    <Input label={language === "fa" ? "موقعیت دوکان" : "SHOP LOCATION"} value={contractForm.shop_location} onChange={(value) => setContractForm({ ...contractForm, shop_location: value })} />
                    <Input label={language === "fa" ? "ولایت" : "PROVINCE"} value={contractForm.province} onChange={(value) => setContractForm({ ...contractForm, province: value })} />
                    <Input label={language === "fa" ? "آیدی تذکره" : "TAZKIRA ID"} value={contractForm.tazkira_id} onChange={(value) => setContractForm({ ...contractForm, tazkira_id: value })} />
                    <Input label={language === "fa" ? "تاریخ شروع قرارداد" : "CONTRACT START"} type="date" value={contractForm.contract_start} onChange={(value) => setContractForm({ ...contractForm, contract_start: value })} required />
                    <Input label={language === "fa" ? "تاریخ ختم قرارداد" : "CONTRACT END"} type="date" value={contractForm.contract_end} onChange={(value) => setContractForm({ ...contractForm, contract_end: value })} required />
                    <Input label={language === "fa" ? "مقدار پول" : "CONTRACT AMOUNT"} type="number" value={contractForm.amount} onChange={(value) => setContractForm({ ...contractForm, amount: value })} />
                    <FormButtons editing={editingContract} t={t} cancel={() => { setEditingContract(null); setContractForm({ ...emptyContract, contract_start: getTodayInputDate() }); setRecordFormOpen(false); }} />
                  </form>
                </FormCard>
              )}

              {!recordFormOpen && (
                <>
                  <SectionTitle title={language === "fa" ? "لیست قراردادها" : "CONTRACT LIST"} />
                  {searchItems(contracts).length === 0 ? (
                    <Empty text={t.noData} />
                  ) : (
                    <Table headers={["#", language === "fa" ? "شخص" : "PERSON", t.shopName, t.shopNumber, language === "fa" ? "ولایت" : "PROVINCE", language === "fa" ? "شروع" : "START", language === "fa" ? "ختم" : "END", language === "fa" ? "وضعیت قرارداد" : "CONTRACT STATUS", language === "fa" ? "مبلغ" : "AMOUNT", language === "fa" ? "عکس" : "PHOTO", t.action]}>
                      {getNumberedRows(contracts).map(({ item, serial }) => {
                        const status = contractStatus(item.contract_end);
                        return (
                          <tr key={item.id}>
                            <td>{serial}</td>
                            <td>{item.person_name}</td>
                            <td>{item.shop_name || "-"}</td>
                            <td>{item.shop_number || "-"}</td>
                            <td>{item.province || "-"}</td>
                            <td>{formatDisplayDate(item.contract_start, language)}</td>
                            <td>{formatDisplayDate(item.contract_end, language)}</td>
                            <td><span className={`contract-status ${status.className}`}>{status.label}</span></td>
                            <td>{formatMoney(item.amount)}</td>
                            <td><AvatarPhoto src={item.photo} /></td>
                            <td><ActionButtons edit={() => editContract(item)} remove={() => deleteContract(item.id)} canEdit={canManageRecordsAs(currentUser, item)} canDelete={canManageRecordsAs(currentUser, item)} t={t} /></td>
                          </tr>
                        );
                      })}
                    </Table>
                  )}
                </>
              )}
            </Page>
          )}


          {/* USERS */}

          {page === "users" && canManageAccountsAs(currentUser) && (
            <Page
              title={t.users}
              pageKey="users"
              description={language === "fa" ? "مدیریت حساب‌ها و نقش‌های دسترسی." : "Manage user accounts, roles, and access status."}
              toolbar={renderPageTools("users")}
            >
              {!recordFormOpen && (
                <ModuleOverview items={[
                  { label: language === "fa" ? "تمام حساب‌ها" : "All accounts", value: users.length, tone: "blue" },
                  { label: t.active, value: users.filter((item) => Number(item.is_active) === 1).length, tone: "teal" },
                  { label: language === "fa" ? "مدیران" : "Admins", value: users.filter((item) => isAdminRole(item.role) || isSuperAdminRole(item.role)).length, tone: "purple" },
                ]} />
              )}

              {recordFormOpen && (
                <FormCard
                  title={
                    editingUser
                      ? t.edit
                      : t.add
                  }
                >
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setRecordFormOpen(false);
                      setEditingUser(null);
                      setUserForm(emptyUser);
                    }}
                    style={{ marginBottom: "20px" }}
                  >
                    ←{" "}
                    {language === "fa"
                      ? "برگشت به لیست"
                      : "BACK TO LIST"}
                  </button>

                  <form
                    onSubmit={saveUser}
                    className="form-grid"
                  >
                    <PhotoInput
                      label={language === "fa" ? "عکس کاربر" : "USER PHOTO"}
                      value={userForm.photo}
                      onChange={(photo) =>
                        setUserForm({ ...userForm, photo })
                      }
                    />

                    <Input
                      label={t.name}
                      value={userForm.name}
                      onChange={(value) =>
                        setUserForm({
                          ...userForm,
                          name: value,
                        })
                      }
                      required
                    />

                    <Input
                      label={t.email}
                      type="email"
                      value={userForm.email}
                      onChange={(value) =>
                        setUserForm({
                          ...userForm,
                          email: value,
                        })
                      }
                      required
                    />

                    <Input
                      label={t.username}
                      value={userForm.username}
                      onChange={(value) =>
                        setUserForm({
                          ...userForm,
                          username: value,
                        })
                      }
                      required
                    />

                    <div className="password-input-wrapper user-password-field">
                      <Input
                        label={t.password}
                        type={
                          showUserPassword
                            ? "text"
                            : "password"
                        }
                        value={userForm.password}
                        onChange={(value) =>
                          setUserForm({
                            ...userForm,
                            password: value,
                          })
                        }
                        required={!editingUser}
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowUserPassword(
                            (value) => !value
                          )
                        }
                        aria-label={
                          showUserPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        title={
                          showUserPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        <EyeIcon
                          off={!showUserPassword}
                        />
                      </button>
                    </div>

                    <Select
                      label={t.role}
                      value={userForm.role}
                      onChange={(value) =>
                        setUserForm({
                          ...userForm,
                          role: value,
                        })
                      }
                      required
                    >
                      {!["super_admin", "admin", "user"].includes(userForm.role) && (
                        <option value={userForm.role} disabled>
                          {language === "fa"
                            ? "نقش قدیمی غیرفعال — یک نقش فعال انتخاب کنید"
                            : `Inactive legacy role (${userForm.role}) — select an active role`}
                        </option>
                      )}
                      <option value="admin">
                        {language === "fa" ? "مدیر (Admin)" : "Admin"}
                      </option>
                      {isSuperAdminRole(currentUser?.role) && (
                        <option value="super_admin">
                          {language === "fa" ? "سوپر ادمین" : "Super Admin"}
                        </option>
                      )}
                      <option value="user">
                        {language === "fa" ? "کاربر (User)" : "User"}
                      </option>
                    </Select>

                    <Select
                      label={t.accountStatus}
                      value={String(userForm.is_active)}
                      onChange={(value) =>
                        setUserForm({
                          ...userForm,
                          is_active: value,
                        })
                      }
                    >
                      <option value="1">{t.active}</option>
                      <option value="0">{t.disabled}</option>
                    </Select>

                    <FormButtons
                      editing={editingUser}
                      t={t}
                      cancel={() => {
                        setEditingUser(null);
                        setUserForm(emptyUser);
                        setRecordFormOpen(false);
                      }}
                    />
                  </form>
                </FormCard>
              )}

              {!recordFormOpen && (
                <>
                  <SectionTitle title={t.users} />

                  {searchItems(users).length === 0 ? (
                    <Empty text={t.noData} />
                  ) : (
                    <Table
                      headers={[
                        "#",
                        t.name,
                        t.email,
                        t.username,
                        t.role,
                        t.accountStatus,
                        language === "fa" ? "عکس" : "PHOTO",
                        t.action,
                      ]}
                    >
                      {getNumberedRows(users).map(
                        ({ item, serial }) => (
                          <tr key={item.id}>
                            <td>{serial}</td>
                            <td>{item.name}</td>
                            <td>{item.email}</td>
                            <td>{item.username}</td>
                            <td>
                              <span className={`user-role-badge role-${String(item.role || "user").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                                {isSuperAdminRole(item.role)
                                  ? language === "fa" ? "سوپر ادمین" : "Super Admin"
                                  : isAdminRole(item.role)
                                    ? language === "fa" ? "مدیر" : "Admin"
                                      : normalizeRoleValue(item.role) === "user"
                                        ? language === "fa" ? "کاربر" : "User"
                                        : item.role || (language === "fa" ? "کاربر" : "User")}
                              </span>
                            </td>
                            <td>
                              <span className={`account-status ${Number(item.is_active) === 1 ? "is-active" : "is-disabled"}`}>
                                {Number(item.is_active) === 1 ? t.active : t.disabled}
                              </span>
                            </td>
                            <td><AvatarPhoto src={item.photo || getStoredPhoto("user", item.id)} /></td>
                            <td>
                              <ActionButtons
                                edit={() => editUser(item)}
                                remove={() => deleteUser(item.id)}
                                canEdit={canManageUserAs(currentUser, item)}
                                canDelete={canManageUserAs(currentUser, item)}
                                t={t}
                              />
                            </td>
                          </tr>
                        )
                      )}
                    </Table>
                  )}
                </>
              )}

            </Page>
          )}


          {/* ATTENDANCE */}

          {page === "attendance" && (
            <Page
              title={t.attendance}
              pageKey="attendance"
              description={language === "fa" ? "مرور و ثبت حاضری کارمندان." : "Review employee attendance and record daily status."}
              toolbar={null}
            >
              {recordFormOpen && editingAttendance && (
                <FormCard
                  title={
                    editingAttendance
                      ? t.edit
                      : t.add
                  }
                >
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setRecordFormOpen(false);
                      setEditingAttendance(null);
                      setAttendanceForm({
                        ...emptyAttendance,
                        date: getTodayKabulInputDate(),
                      });
                    }}
                    style={{ marginBottom: "20px" }}
                  >
                    ←{" "}
                    {language === "fa"
                      ? "برگشت به لیست"
                      : "BACK TO LIST"}
                  </button>

                  <form
                    onSubmit={saveAttendance}
                    className="form-grid"
                  >
                    <Select
                      label={t.employee}
                      value={attendanceForm.employee_id}
                      onChange={(value) =>
                        setAttendanceForm({
                          ...attendanceForm,
                          employee_id: value,
                        })
                      }
                      required
                    >
                      <option value="">
                        {language === "fa"
                          ? "انتخاب کارمند"
                          : "Select employee"}
                      </option>

                      {employees.length === 0 ? (
                        <option value="" disabled>
                          {language === "fa"
                            ? "کارمندی ثبت نشده است؛ ابتدا در بخش کارمندان کارمند اضافه کنید"
                            : "No employees found. Add an employee first."}
                        </option>
                      ) : (
                        employees.map((employee) => (
                          <option
                            key={employee.id}
                            value={String(employee.id)}
                          >
                            {employee.name}
                          </option>
                        ))
                      )}
                    </Select>

                    <Input
                      label={t.date}
                      type="date"
                      value={attendanceForm.date}
                      onChange={(value) =>
                        setAttendanceForm({
                          ...attendanceForm,
                          date: value,
                        })
                      }
                      required
                    />

                    <Input
                      label={t.checkIn}
                      type="time"
                      value={attendanceForm.check_in}
                      onChange={(value) =>
                        setAttendanceForm({
                          ...attendanceForm,
                          check_in: value,
                        })
                      }
                    />

                    <Input
                      label={t.checkOut}
                      type="time"
                      value={attendanceForm.check_out}
                      onChange={(value) =>
                        setAttendanceForm({
                          ...attendanceForm,
                          check_out: value,
                        })
                      }
                    />

                    <Select
                      label={t.status}
                      value={attendanceForm.status}
                      onChange={(value) =>
                        setAttendanceForm({
                          ...attendanceForm,
                          status: value,
                        })
                      }
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                      <option value="Half Day">Half Day</option>
                      <option value="Leave">Leave</option>
                      <option value="Holiday">Holiday</option>
                    </Select>

                    <Input
                      label={language === "fa" ? "یادداشت" : "Notes"}
                      value={attendanceForm.notes}
                      onChange={(value) =>
                        setAttendanceForm({ ...attendanceForm, notes: value })
                      }
                    />

                    <FormButtons
                      editing={editingAttendance}
                      t={t}
                      cancel={() => {
                        setEditingAttendance(null);
                        setAttendanceForm({
                          ...emptyAttendance,
                          date: getTodayKabulInputDate(),
                        });
                        setRecordFormOpen(false);
                      }}
                    />
                  </form>
                </FormCard>
              )}

              {!(recordFormOpen && editingAttendance) && (
                <DailyAttendanceWorkspace
                  attendance={attendance}
                  canRecord={isAdminRole(currentUser?.role) || isSuperAdminRole(currentUser?.role)}
                  canCorrect={isSuperAdminRole(currentUser?.role)}
                  language={language}
                  api={api}
                  onRefresh={fetchAttendance}
                  onEdit={editAttendance}
                  onDelete={deleteAttendance}
                />
              )}

            </Page>
          )}


          {page === "instructions" && (
            <Page
              title={t.instructions}
              pageKey="instructions"
              description={language === "fa" ? "صدور و پیگیری دستورهای اداری." : "Issue and review administrative instructions."}
            >
              <p className="instructions-description">
                {t.instructionsDescription}
              </p>
              <ModuleOverview items={[
                { label: language === "fa" ? "تمام دستورها" : "All instructions", value: instructions.length, tone: "blue" },
                { label: language === "fa" ? "دستورهای اخیر" : "Recent instructions", value: instructions.slice(0, 4).length, tone: "teal" },
              ]} />
              {(isAdminRole(currentUser?.role) ||
                isSuperAdminRole(currentUser?.role)) && (
                <FormCard title={editingInstruction ? t.edit : t.issueInstruction}>
                  <form onSubmit={saveInstruction} className="form-grid">
                    <Input
                      label={t.instructionTitle}
                      value={instructionForm.title}
                      onChange={(value) =>
                        setInstructionForm({ ...instructionForm, title: value })
                      }
                      required
                    />
                    <Input
                      label={t.instructionDescription}
                      value={instructionForm.description}
                      onChange={(value) =>
                        setInstructionForm({
                          ...instructionForm,
                          description: value,
                        })
                      }
                    />
                    {editingInstruction && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          setEditingInstruction(null);
                          setInstructionForm({ title: "", description: "" });
                        }}
                      >
                        {t.cancel}
                      </button>
                    )}
                    <button className="primary-button" type="submit">
                      {editingInstruction ? t.save : t.issueInstruction}
                    </button>
                  </form>
                </FormCard>
              )}

              <SectionTitle title={t.instructions} />
              {instructions.length === 0 ? (
                <Empty text={t.noData} />
              ) : (
                <div className="finance-cards-grid">
                  {instructions.map((instruction) => (
                    <article className="finance-card" key={instruction.id}>
                      <strong>{instruction.title}</strong>
                      <small>{instruction.description || "—"}</small>
                      <small>
                        {instruction.created_at
                          ? formatDisplayDate(instruction.created_at, language)
                          : ""}
                      </small>
                      {isSuperAdminRole(currentUser?.role) && (
                        <ActionButtons
                          edit={() => {
                            setEditingInstruction(instruction.id);
                            setInstructionForm({
                              title: instruction.title || "",
                              description: instruction.description || "",
                            });
                          }}
                          remove={() => deleteInstruction(instruction.id)}
                          canEdit
                          canDelete
                          t={t}
                        />
                      )}
                    </article>
                  ))}
                </div>
              )}
            </Page>
          )}

          {/* FINANCE OVERVIEW */}
          {page === "finance" && (
            <Page
              title={t.finance}
              pageKey="finance"
              description={language === "fa" ? "نمای کلی درآمد، مصارف، قرض‌ها و پرداخت‌ها." : "A real-time overview of income, expenses, receivables, and payments."}
            >
              <div className="payment-summary finance-summary">
                <Stat number={formatMoney(financeIncomeTotal)} label={t.financeTotalIncome} code="IN" />
                <Stat number={formatMoney(financeExpenseTotal)} label={t.financeTotalExpense} code="EX" />
                <Stat number={formatMoney(financeReceivableTotal)} label={t.financeReceivable} code="DR" />
                <Stat number={formatMoney(financeIncomeTotal - financeExpenseTotal)} label={t.financeNet} code="BL" />
              </div>

              <div className="finance-cards-grid">
                <button type="button" className="finance-card" onClick={() => setPage("payments")}>
                  <strong>{t.payments}</strong><span>{payments.length}</span><small>{language === "fa" ? "تمام پرداخت‌های مشتریان" : "All customer payments"}</small>
                </button>
                <button type="button" className="finance-card" onClick={() => setPage("income")}>
                  <strong>{t.incomeRecords}</strong><span>{financeIncome.length}</span><small>{language === "fa" ? "درآمدهای مستقل دفتر" : "Office income records"}</small>
                </button>
                <button type="button" className="finance-card" onClick={() => setPage("expenses")}>
                  <strong>{t.expenses}</strong><span>{financeExpenses.length}</span><small>{language === "fa" ? "مصارف و هزینه‌های دفتر" : "Office expenses"}</small>
                </button>
                <button type="button" className="finance-card" onClick={() => setPage("debts")}>
                  <strong>{t.debts}</strong><span>{financeDebts.length}</span><small>{language === "fa" ? "قرض‌ها و پول‌های ناداده" : "Customer debts and receivables"}</small>
                </button>
              </div>
            </Page>
          )}

          {/* INCOME */}
          {page === "income" && (
            <Page
              title={t.incomeRecords}
              pageKey="income"
              description={language === "fa" ? "فهرست و ثبت درآمدهای دفتر." : "Review and record office income."}
              toolbar={renderPageTools("income")}
            >
              {!recordFormOpen && (
                <ModuleOverview items={[
                  { label: language === "fa" ? "ثبت‌های درآمد" : "Income records", value: financeIncome.length, tone: "blue" },
                  { label: t.financeTotalIncome, value: formatMoney(financeIncomeTotal), tone: "teal" },
                ]} />
              )}

              {recordFormOpen && (
                <FormCard
                  title={
                    editingIncome
                      ? t.edit
                      : t.recordIncome
                  }
                >
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setRecordFormOpen(false);
                      setEditingIncome(null);
                      setIncomeForm({
                        ...emptyIncome,
                        date: getTodayInputDate(),
                      });
                    }}
                    style={{ marginBottom: "20px" }}
                  >
                    ←{" "}
                    {language === "fa"
                      ? "برگشت به لیست"
                      : "BACK TO LIST"}
                  </button>

                  <form
                    onSubmit={saveIncome}
                    className="form-grid"
                  >
                    <Input
                      label={t.source}
                      value={incomeForm.source}
                      onChange={(value) =>
                        setIncomeForm({
                          ...incomeForm,
                          source: value,
                        })
                      }
                      required
                    />

                    <Input
                      label={t.amount}
                      type="number"
                      value={incomeForm.amount}
                      onChange={(value) =>
                        setIncomeForm({
                          ...incomeForm,
                          amount: value,
                        })
                      }
                      required
                    />

                    <Input
                      label={t.date}
                      type="date"
                      value={incomeForm.date}
                      onChange={(value) =>
                        setIncomeForm({
                          ...incomeForm,
                          date: value,
                        })
                      }
                      required
                    />

                    <Input
                      label={t.description}
                      value={incomeForm.description}
                      onChange={(value) =>
                        setIncomeForm({
                          ...incomeForm,
                          description: value,
                        })
                      }
                    />

                    <FormButtons
                      editing={editingIncome}
                      t={t}
                      cancel={() => {
                        setEditingIncome(null);
                        setIncomeForm({
                          ...emptyIncome,
                          date: getTodayInputDate(),
                        });
                        setRecordFormOpen(false);
                      }}
                    />
                  </form>
                </FormCard>
              )}

              {!recordFormOpen && (
                <>
                  <SectionTitle title={t.incomeRecords} />

                  {getNumberedRows(financeIncome).length === 0 ? (
                    <Empty text={t.noData} />
                  ) : (
                    <Table
                      headers={[
                        "#",
                        t.source,
                        t.amount,
                        t.date,
                        t.description,
                        t.action,
                      ]}
                    >
                      {getNumberedRows(financeIncome).map(
                        ({ item, serial }) => (
                          <tr key={item.id}>
                            <td>{serial}</td>
                            <td>{item.source}</td>
                            <td>{formatMoney(item.amount)}</td>
                            <td>
                              {formatDisplayDate(
                                item.date,
                                language
                              )}
                            </td>
                            <td>{item.description}</td>
                            <td>
                              <ActionButtons
                                edit={() => editIncome(item)}
                                remove={() => deleteIncome(item.id)}
                                canEdit={canManageRecordsAs(currentUser, item)}
                                canDelete={canManageRecordsAs(currentUser, item)}
                                t={t}
                              />
                            </td>
                          </tr>
                        )
                      )}
                    </Table>
                  )}
                </>
              )}
            </Page>
          )}


          {/* EXPENSES */}
          {page === "expenses" && (
            <Page
              title={t.expenses}
              pageKey="expenses"
              description={language === "fa" ? "مرور و ثبت مصارف دفتر." : "Review and record office expenses."}
              toolbar={renderPageTools("expenses")}
            >
              {!recordFormOpen && (
                <ModuleOverview items={[
                  { label: language === "fa" ? "ثبت‌های مصرف" : "Expense records", value: financeExpenses.length, tone: "blue" },
                  { label: t.financeTotalExpense, value: formatMoney(financeExpenseTotal), tone: "orange" },
                ]} />
              )}

              {recordFormOpen && (
                <FormCard
                  title={
                    editingExpense
                      ? t.edit
                      : t.recordExpense
                  }
                >
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setRecordFormOpen(false);
                      setEditingExpense(null);
                      setExpenseForm({
                        ...emptyExpense,
                        date: getTodayInputDate(),
                      });
                    }}
                    style={{ marginBottom: "20px" }}
                  >
                    ←{" "}
                    {language === "fa"
                      ? "برگشت به لیست"
                      : "BACK TO LIST"}
                  </button>

                  <form
                    onSubmit={saveExpense}
                    className="form-grid"
                  >
                    <Input
                      label={t.expenseTitle}
                      value={expenseForm.title}
                      onChange={(value) =>
                        setExpenseForm({
                          ...expenseForm,
                          title: value,
                        })
                      }
                      required
                    />

                    <Input
                      label={t.amount}
                      type="number"
                      value={expenseForm.amount}
                      onChange={(value) =>
                        setExpenseForm({
                          ...expenseForm,
                          amount: value,
                        })
                      }
                      required
                    />

                    <Input
                      label={t.category}
                      value={expenseForm.category}
                      onChange={(value) =>
                        setExpenseForm({
                          ...expenseForm,
                          category: value,
                        })
                      }
                    />

                    <Input
                      label={t.date}
                      type="date"
                      value={expenseForm.date}
                      onChange={(value) =>
                        setExpenseForm({
                          ...expenseForm,
                          date: value,
                        })
                      }
                      required
                    />

                    <Input
                      label={t.description}
                      value={expenseForm.description}
                      onChange={(value) =>
                        setExpenseForm({
                          ...expenseForm,
                          description: value,
                        })
                      }
                    />

                    <FormButtons
                      editing={editingExpense}
                      t={t}
                      cancel={() => {
                        setEditingExpense(null);
                        setExpenseForm({
                          ...emptyExpense,
                          date: getTodayInputDate(),
                        });
                        setRecordFormOpen(false);
                      }}
                    />
                  </form>
                </FormCard>
              )}

              {!recordFormOpen && (
                <>
                  <SectionTitle title={t.expenses} />

                  {getNumberedRows(financeExpenses).length === 0 ? (
                    <Empty text={t.noData} />
                  ) : (
                    <Table
                      headers={[
                        "#",
                        t.expenseTitle,
                        t.amount,
                        t.category,
                        t.date,
                        t.description,
                        t.action,
                      ]}
                    >
                      {getNumberedRows(financeExpenses).map(
                        ({ item, serial }) => (
                          <tr key={item.id}>
                            <td>{serial}</td>
                            <td>{item.title}</td>
                            <td>{formatMoney(item.amount)}</td>
                            <td>{item.category}</td>
                            <td>
                              {formatDisplayDate(
                                item.date,
                                language
                              )}
                            </td>
                            <td>{item.description}</td>
                            <td>
                              <ActionButtons
                                edit={() => editExpense(item)}
                                remove={() => deleteExpense(item.id)}
                                canEdit={canManageRecordsAs(currentUser, item)}
                                canDelete={canManageRecordsAs(currentUser, item)}
                                t={t}
                              />
                            </td>
                          </tr>
                        )
                      )}
                    </Table>
                  )}
                </>
              )}
            </Page>
          )}


          {/* DEBTS / RECEIVABLES */}
          {page === "debts" && (
            <Page
              title={t.debts}
              pageKey="debts"
              description={language === "fa" ? "پیگیری قرض‌ها، پرداخت‌شده‌ها و مانده‌حساب‌ها." : "Track debt records, payments, and outstanding balances."}
              toolbar={renderPageTools("debts")}
            >

              {!recordFormOpen && (
                <ModuleOverview items={[
                  { label: language === "fa" ? "تمام قرض‌ها" : "Debt records", value: financeDebts.length, tone: "blue" },
                  { label: t.financeReceivable, value: formatMoney(financeReceivableTotal), tone: "orange" },
                  { label: language === "fa" ? "تسویه‌شده" : "Settled", value: financeDebts.filter((item) => String(item.status).toLowerCase() === "settled").length, tone: "teal" },
                ]} />
              )}

              {recordFormOpen && (
                <FormCard
                  title={
                    editingDebt
                      ? t.edit
                      : t.recordDebt
                  }
                >
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setRecordFormOpen(false);
                      setEditingDebt(null);
                      setDebtForm(emptyDebt);
                    }}
                    style={{ marginBottom: "20px" }}
                  >
                    ←{" "}
                    {language === "fa"
                      ? "برگشت به لیست"
                      : "BACK TO LIST"}
                  </button>

                  <form
                    onSubmit={saveDebt}
                    className="form-grid"
                  >
                    <Select
                      label={t.customer}
                      value={debtForm.customer_id}
                      onChange={(value) =>
                        setDebtForm({
                          ...debtForm,
                          customer_id: value,
                        })
                      }
                      required
                    >
                      <option value="">
                        {language === "fa"
                          ? "انتخاب مشتری"
                          : "Select customer"}
                      </option>
                      {customers.map((customer) => (
                        <option
                          key={customer.id}
                          value={customer.id}
                        >
                          {customer.name}
                        </option>
                      ))}
                    </Select>

                    <Input
                      label={t.amount}
                      type="number"
                      value={debtForm.amount}
                      onChange={(value) =>
                        setDebtForm({
                          ...debtForm,
                          amount: value,
                        })
                      }
                      required
                    />

                    <Input
                      label={t.paidAmount}
                      type="number"
                      value={debtForm.paid_amount}
                      onChange={(value) =>
                        setDebtForm({
                          ...debtForm,
                          paid_amount: value,
                        })
                      }
                    />

                    <Input
                      label={t.dueDate}
                      type="date"
                      value={debtForm.due_date}
                      onChange={(value) =>
                        setDebtForm({
                          ...debtForm,
                          due_date: value,
                        })
                      }
                    />

                    <Select
                      label={t.status}
                      value={debtForm.status}
                      onChange={(value) =>
                        setDebtForm({
                          ...debtForm,
                          status: value,
                        })
                      }
                    >
                      <option value="Pending">{t.pending}</option>
                      <option value="Partially Paid">{t.partiallyPaid}</option>
                      <option value="Settled">{t.settled}</option>
                    </Select>

                    <Input
                      label={t.description}
                      value={debtForm.description}
                      onChange={(value) =>
                        setDebtForm({
                          ...debtForm,
                          description: value,
                        })
                      }
                    />

                    <FormButtons
                      editing={editingDebt}
                      t={t}
                      cancel={() => {
                        setEditingDebt(null);
                        setDebtForm(emptyDebt);
                        setRecordFormOpen(false);
                      }}
                    />
                  </form>
                </FormCard>
              )}

              {!recordFormOpen && (
                <>
                  <SectionTitle title={t.debts} />

                  {getNumberedRows(financeDebts).length === 0 ? (
                    <Empty text={t.noData} />
                  ) : (
                    <Table
                      headers={[
                        "#",
                        t.customer,
                        t.amount,
                        t.paidAmount,
                        t.remaining,
                        t.dueDate,
                        t.status,
                        t.description,
                        t.action,
                      ]}
                    >
                      {getNumberedRows(financeDebts).map(
                        ({ item, serial }) => {
                          const remaining = Math.max(
                            0,
                            Number(item.amount || 0) -
                              Number(item.paid_amount || 0)
                          );

                          return (
                            <tr key={item.id}>
                              <td>{serial}</td>
                              <td>
                                {item.customer_name ||
                                  getCustomerName(
                                    customers,
                                    item.customer_id
                                  )}
                              </td>
                              <td>{formatMoney(item.amount)}</td>
                              <td>{formatMoney(item.paid_amount)}</td>
                              <td>{formatMoney(remaining)}</td>
                              <td>
                                {formatDisplayDate(
                                  item.due_date,
                                  language
                                )}
                              </td>
                              <td>
                                <Status value={item.status} />
                              </td>
                              <td>{item.description}</td>
                              <td>
                                <ActionButtons
                                  edit={() => editDebt(item)}
                                  remove={() => deleteDebt(item.id)}
                                  canEdit={canManageRecordsAs(currentUser, item)}
                                  canDelete={canManageRecordsAs(currentUser, item)}
                                  t={t}
                                />
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </Table>
                  )}
                </>
              )}
            </Page>
          )}


          {/* PAYMENTS */}

          {page === "payments" && (
            <Page
              title={t.payments}
              pageKey="payments"
              description={language === "fa" ? "مرور تراکنش‌ها و ثبت پرداخت‌های مشتریان." : "Review customer transactions and record payments."}
              toolbar={renderPageTools("payments")}
            >

              {!recordFormOpen && (
                <ModuleOverview items={[
                  { label: language === "fa" ? "تمام پرداخت‌ها" : "Payment records", value: payments.length, tone: "blue" },
                  { label: t.income, value: formatMoney(income), tone: "teal" },
                  { label: t.expense, value: formatMoney(expense), tone: "orange" },
                  { label: t.balance, value: formatMoney(balance), tone: "purple" },
                ]} />
              )}

              {recordFormOpen && (
                <FormCard
                  title={
                    editingPayment
                      ? t.edit
                      : t.add
                  }
                >
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setRecordFormOpen(false);
                      setEditingPayment(null);
                      setPaymentForm({
                        ...emptyPayment,
                        date: getTodayInputDate(),
                      });
                    }}
                    style={{ marginBottom: "20px" }}
                  >
                    ←{" "}
                    {language === "fa"
                      ? "برگشت به لیست"
                      : "BACK TO LIST"}
                  </button>

                  <form
                    onSubmit={savePayment}
                    className="form-grid"
                  >
                    <Select
                      label={t.customer}
                      value={paymentForm.customer_id}
                      onChange={(value) =>
                        setPaymentForm({
                          ...paymentForm,
                          customer_id: value,
                        })
                      }
                      required
                    >
                      <option value="">
                        {language === "fa"
                          ? "انتخاب مشتری"
                          : "Select customer"}
                      </option>

                      {customers.map((customer) => (
                        <option
                          key={customer.id}
                          value={customer.id}
                        >
                          {customer.name}
                        </option>
                      ))}
                    </Select>

                    <Input
                      label={t.amount}
                      type="number"
                      value={paymentForm.amount}
                      onChange={(value) =>
                        setPaymentForm({
                          ...paymentForm,
                          amount: value,
                        })
                      }
                      required
                    />

                    <Select
                      label={t.type}
                      value={paymentForm.type}
                      onChange={(value) =>
                        setPaymentForm({
                          ...paymentForm,
                          type: value,
                        })
                      }
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Debt">
                        {language === "fa"
                          ? "قرض"
                          : "Debt"}
                      </option>
                    </Select>

                    <Input
                      label={t.date}
                      type="date"
                      value={paymentForm.date}
                      onChange={(value) =>
                        setPaymentForm({
                          ...paymentForm,
                          date: value,
                        })
                      }
                      required
                    />

                    <Input
                      label={t.description}
                      value={paymentForm.description}
                      onChange={(value) =>
                        setPaymentForm({
                          ...paymentForm,
                          description: value,
                        })
                      }
                    />

                    <FormButtons
                      editing={editingPayment}
                      t={t}
                      cancel={() => {
                        setEditingPayment(null);
                        setPaymentForm({
                          ...emptyPayment,
                          date: getTodayInputDate(),
                        });
                        setRecordFormOpen(false);
                      }}
                    />
                  </form>
                </FormCard>
              )}

              {!recordFormOpen && (
                <>
                  <SectionTitle title={t.payments} />

                  {searchItems(payments).length === 0 ? (
                    <Empty text={t.noData} />
                  ) : (
                    <Table
                      headers={[
                        "#",
                        t.customer,
                        t.amount,
                        t.type,
                        t.date,
                        t.description,
                        t.action,
                      ]}
                    >
                      {getNumberedRows(payments).map(
                        ({ item, serial }) => (
                          <tr key={item.id}>
                            <td>{serial}</td>
                            <td>
                              {getCustomerName(
                                customers,
                                item.customer_id
                              )}
                            </td>
                            <td>{formatMoney(item.amount)}</td>
                            <td>
                              <Status value={item.type} />
                            </td>
                            <td>
                              {formatDisplayDate(
                                item.date,
                                language
                              )}
                            </td>
                            <td>{item.description}</td>
                            <td>
                              <ActionButtons
                                edit={() => editPayment(item)}
                                remove={() => deletePayment(item.id)}
                                receipt={() => printPaymentReceipt(item)}
                                canEdit={canManageRecordsAs(currentUser, item)}
                                canDelete={canManageRecordsAs(currentUser, item)}
                                t={t}
                              />
                            </td>
                          </tr>
                        )
                      )}
                    </Table>
                  )}
                </>
              )}
            </Page>
          )}


          {/* PROJECTS */}

          {page === "projects" && (
            <Page
              title={t.projects}
              pageKey="projects"
              description={language === "fa" ? "مرور وضعیت، مسئولان و مهلت پروژه‌ها." : "Track project ownership, status, and deadlines."}
              toolbar={renderPageTools("projects")}
            >
              {!recordFormOpen && (
                <ModuleOverview items={[
                  { label: language === "fa" ? "تمام پروژه‌ها" : "All projects", value: projects.length, tone: "blue" },
                  { label: language === "fa" ? "در جریان" : "In progress", value: projects.filter((item) => item.status === "In Progress").length, tone: "teal" },
                  { label: language === "fa" ? "تکمیل‌شده" : "Completed", value: projects.filter((item) => item.status === "Completed").length, tone: "purple" },
                ]} />
              )}

              {recordFormOpen && (
                <FormCard
                  title={
                    editingProject
                      ? t.edit
                      : t.add
                  }
                >
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setRecordFormOpen(false);
                      setEditingProject(null);
                      setProjectForm(emptyProject);
                    }}
                    style={{ marginBottom: "20px" }}
                  >
                    ←{" "}
                    {language === "fa"
                      ? "برگشت به لیست"
                      : "BACK TO LIST"}
                  </button>

                  <form
                    onSubmit={saveProject}
                    className="form-grid"
                  >
                    <Input
                      label={t.title}
                      value={projectForm.title}
                      onChange={(value) =>
                        setProjectForm({
                          ...projectForm,
                          title: value,
                        })
                      }
                      required
                    />

                    <Input
                      label={t.description}
                      value={projectForm.description}
                      onChange={(value) =>
                        setProjectForm({
                          ...projectForm,
                          description: value,
                        })
                      }
                    />

                    <Select
                      label={t.assignedUser}
                      value={projectForm.user_id}
                      onChange={(value) =>
                        setProjectForm({
                          ...projectForm,
                          user_id: value,
                        })
                      }
                      required
                    >
                      <option value="">
                        {language === "fa"
                          ? "انتخاب کاربر"
                          : "Select user"}
                      </option>

                      {users.map((user) => (
                        <option
                          key={user.id}
                          value={user.id}
                        >
                          {user.name}
                        </option>
                      ))}
                    </Select>

                    <Select
                      label={t.status}
                      value={projectForm.status}
                      onChange={(value) =>
                        setProjectForm({
                          ...projectForm,
                          status: value,
                        })
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </Select>

                    <Input
                      label={t.deadline}
                      type="date"
                      value={projectForm.deadline}
                      onChange={(value) =>
                        setProjectForm({
                          ...projectForm,
                          deadline: value,
                        })
                      }
                    />

                    <Input
                      label={t.projectEmployee}
                      value={projectForm.employee}
                      onChange={(value) =>
                        setProjectForm({
                          ...projectForm,
                          employee: value,
                        })
                      }
                    />

                    <Input
                      label={t.testing}
                      value={projectForm.testing}
                      onChange={(value) =>
                        setProjectForm({
                          ...projectForm,
                          testing: value,
                        })
                      }
                    />

                    <Input
                      label={t.endDate}
                      type="date"
                      value={projectForm.end_date}
                      onChange={(value) =>
                        setProjectForm({
                          ...projectForm,
                          end_date: value,
                        })
                      }
                    />

                    <FormButtons
                      editing={editingProject}
                      t={t}
                      cancel={() => {
                        setEditingProject(null);
                        setProjectForm(emptyProject);
                        setRecordFormOpen(false);
                      }}
                    />
                  </form>
                </FormCard>
              )}

              {!recordFormOpen && (
                <>
                  {searchItems(projects).length === 0 ? (
                    <Empty text={t.noData} />
                  ) : (
                    <Table
                      headers={[
                        "#",
                        t.title,
                        t.assignedUser,
                        t.status,
                        t.deadline,
                        t.projectEmployee,
                        t.testing,
                        t.endDate,
                        t.action,
                      ]}
                    >
                      {getNumberedRows(projects).map(
                        ({ item, serial }) => (
                          <tr key={item.id}>
                            <td>{serial}</td>
                            <td>{item.title}</td>
                            <td>
                              {item.user_name ||
                                getUserName(users, item.user_id)}
                            </td>
                            <td>
                              <Status value={item.status} />
                            </td>
                            <td>
                              {formatDisplayDate(
                                item.deadline,
                                language
                              )}
                              {deadlineInfo(item.deadline)}
                            </td>
                            <td>{item.employee}</td>
                            <td>{item.testing}</td>
                            <td>
                              {formatDisplayDate(
                                item.end_date,
                                language
                              )}
                            </td>
                            <td>
                              <ActionButtons
                                edit={() => editProject(item)}
                                remove={() => deleteProject(item.id)}
                                canEdit={canManageRecordsAs(currentUser, item)}
                                canDelete={canManageRecordsAs(currentUser, item)}
                                t={t}
                              />
                            </td>
                          </tr>
                        )
                      )}
                    </Table>
                  )}
                </>
              )}
            </Page>
          )}


          {page === "my-account" && (
            <Page
              title={t.account}
              pageKey="my-account"
              description={language === "fa" ? "اطلاعات شخصی و امنیت حساب کاربری شما." : "Manage your personal profile and account security."}
            >
              <div className="account-grid">
                <section className="settings-card">
                  <div className="settings-header">
                    <div>
                      <h2>{t.accountInformation}</h2>
                      <p>{t.account}</p>
                    </div>
                  </div>
                  <div className="account-profile-summary">
                    <span className="account-avatar" aria-hidden="true">
                      {(currentUser?.name || currentUser?.username || "U")
                        .trim()
                        .slice(0, 1)
                        .toUpperCase()}
                    </span>
                    <div className="account-profile-copy">
                      <strong>
                        {currentUser?.name || currentUser?.username || "User"}
                      </strong>
                      <span>{currentUser?.username || ""}</span>
                      {currentUser?.email && (
                        <span className="account-profile-contact">{currentUser.email}</span>
                      )}
                      {currentUser?.phone && (
                        <span className="account-profile-contact">{currentUser.phone}</span>
                      )}
                    </div>
                  </div>

                  <form onSubmit={saveAccount} className="form-grid">
                    <Input
                      label={t.name}
                      value={accountForm.name}
                      onChange={(value) =>
                        setAccountForm({ ...accountForm, name: value })
                      }
                      required
                    />
                    <label className="field">
                      <span>{t.username}</span>
                      <input
                        type="text"
                        value={currentUser?.username || ""}
                        readOnly
                      />
                    </label>
                    <Input
                      label={t.email}
                      type="email"
                      value={accountForm.email}
                      onChange={(value) =>
                        setAccountForm({ ...accountForm, email: value })
                      }
                    />
                    <Input
                      label={t.phone}
                      value={accountForm.phone}
                      onChange={(value) =>
                        setAccountForm({ ...accountForm, phone: value })
                      }
                    />
                    <button className="primary-button" type="submit">
                      {t.saveChanges}
                    </button>
                  </form>

                  <div className="account-role">
                    <strong>{t.role}</strong>
                    <span className="account-role-badge">
                      {isSuperAdminRole(currentUser?.role)
                        ? language === "fa" ? "سوپر ادمین" : "Super Admin"
                        : isAdminRole(currentUser?.role)
                          ? language === "fa" ? "مدیر" : "Admin"
                          : language === "fa" ? "کاربر" : "User"}
                    </span>
                  </div>

                </section>

                <section className="settings-card">
                  <div className="settings-header">
                    <div>
                      <h2>{t.changePassword}</h2>
                      <p>{t.currentPassword}</p>
                    </div>
                  </div>
                  <form onSubmit={changePassword} className="form-grid">
                    <Input
                      label={t.currentPassword}
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(value) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: value,
                        })
                      }
                      required
                    />
                    <Input
                      label={t.newPassword}
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(value) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: value,
                        })
                      }
                      required
                    />
                    <button className="primary-button" type="submit">
                      {t.changePassword}
                    </button>
                  </form>
                </section>
              </div>
            </Page>
          )}

          {/* SETTINGS */}

          {page === "settings" && (
            <Page
              title={t.settings}
              pageKey="settings"
              description={language === "fa" ? "تنظیمات نمایش و ترجیحات برنامه." : "Configure display preferences and application settings."}
            >

              <div className="settings-card">

                <div className="settings-header">

                  <div>
                    <h2>
                      {t.settings}
                    </h2>

                    <p>
                      {t.systemDescription}
                    </p>
                  </div>

                  <span className="settings-icon">
                    ⚙
                  </span>

                </div>

                <div className="settings-tabs" role="tablist" aria-label={language === "fa" ? "بخش‌های تنظیمات" : "Settings sections"}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={settingsTab === "general"}
                    className={settingsTab === "general" ? "selected" : ""}
                    onClick={() => setSettingsTab("general")}
                  >
                    {language === "fa" ? "عمومی" : "General"}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={settingsTab === "appearance"}
                    className={settingsTab === "appearance" ? "selected" : ""}
                    onClick={() => setSettingsTab("appearance")}
                  >
                    {language === "fa" ? "زبان و نمایش" : "Language & appearance"}
                  </button>
                </div>

                {settingsTab === "general" && (
                  <section className="settings-section" role="tabpanel">
                    <div className="settings-section-heading">
                      <h3>{language === "fa" ? "ویژگی‌های سیستم" : "System features"}</h3>
                      <p>{language === "fa" ? "ویژگی‌های فعال دفتر را مدیریت کنید." : "Manage which office features are available."}</p>
                    </div>
                    {Object.entries(DEFAULT_SETTINGS).map(([key]) => {

                  const labels = {
                    notifications:
                      t.notifications,

                    deadlineAlerts:
                      t.deadlineAlerts,

                    currency:
                      t.currency,

                    dateTime:
                      t.dateTime,

                    dashboardStats:
                      t.dashboardStats,

                    overdueWarning:
                      t.overdueWarning,

                    employeeAutoBackup:
                      t.employeeAutoBackup,
                  };

                  return (
                    <div
                      className="setting-row"
                      key={key}
                    >

                      <div>
                        <strong>
                          {labels[key]}
                        </strong>

                        <small>
                          {key
                            .replace(
                              /([A-Z])/g,
                              " $1"
                            )
                            .toUpperCase()}
                        </small>
                      </div>

                      <label
                        className={
                          settings[key]
                            ? "setting-check checked"
                            : "setting-check"
                        }
                      >
                        <input
                          type="checkbox"
                          checked={!!settings[key]}
                          onChange={() =>
                            toggleSetting(key)
                          }
                        />
                        <span className="check-box">
                          {settings[key] ? "✓" : ""}
                        </span>
                        <strong>
                          {settings[key]
                            ? t.on
                            : t.off}
                        </strong>
                      </label>

                    </div>
                  );
                    })}
                  </section>
                )}

                {settingsTab === "appearance" && (
                  <section className="settings-section settings-appearance" role="tabpanel">
                    <div className="settings-section-heading">
                      <h3>{language === "fa" ? "زبان و نمایش" : "Language & appearance"}</h3>
                      <p>{language === "fa" ? "زبان و حالت نمایش مورد علاقه را انتخاب کنید." : "Choose the preferred language and display mode."}</p>
                    </div>
                    <div className="setting-row">
                      <div>
                        <strong>{t.language}</strong>
                        <small>{language === "fa" ? "زبان سیستم" : "System language"}</small>
                      </div>
                      <div className="language-choice">
                        <button
                          type="button"
                          className={language === "en" ? "selected" : ""}
                          aria-pressed={language === "en"}
                          onClick={() => setLanguage("en")}
                        >
                          ENGLISH
                        </button>
                        <button
                          type="button"
                          className={language === "fa" ? "selected" : ""}
                          aria-pressed={language === "fa"}
                          onClick={() => setLanguage("fa")}
                        >
                          فارسی
                        </button>
                      </div>
                    </div>
                    <div className="setting-row">
                      <div>
                        <strong>{t.theme}</strong>
                        <small>{language === "fa" ? "حالت روشن یا تاریک" : "Light or dark interface"}</small>
                      </div>
                      <div className="theme-choice">
                        <button
                          type="button"
                          className={theme === "day" ? "selected" : ""}
                          aria-pressed={theme === "day"}
                          onClick={() => setTheme("day")}
                        >
                          ☀ {t.dayMode}
                        </button>
                        <button
                          type="button"
                          className={theme === "night" ? "selected" : ""}
                          aria-pressed={theme === "night"}
                          onClick={() => setTheme("night")}
                        >
                          ☾ {t.nightMode}
                        </button>
                      </div>
                    </div>
                  </section>
                )}

              </div>

             

            </Page>
          )}

        </main>

        {/* TOAST */}

        {toast && (
          <div className="toast" role="status" aria-live="polite">
            <span>{toast}</span>
            <button
              type="button"
              className="toast-dismiss"
              onClick={() => setToast("")}
              aria-label={language === "fa" ? "بستن پیام" : "Dismiss notification"}
            >
              ×
            </button>
          </div>
        )}

      </div>
    </>
  );
}

/* ================================================= */
/* ================= DASHBOARD ===================== */
/* ================================================= */

const CURRENCY_INFO = {
  AFN: { name: "افغانستان — افغانی", nameEn: "Afghanistan — Afghani", symbol: "؋" },
  USD: { name: "امریکا — دالر آمریکا", nameEn: "United States — US Dollar", symbol: "$" },
  EUR: { name: "اتحادیه اروپا — یورو", nameEn: "European Union — Euro", symbol: "€" },
  GBP: { name: "بریتانیا — پوند", nameEn: "United Kingdom — Pound", symbol: "£" },
};

function currencyLabel(code, language) {
  const info = CURRENCY_INFO[code];
  if (!info) return code;
  return language === "fa"
    ? `${info.name} (${code})`
    : `${info.nameEn} (${code})`;
}

function Dashboard({
  t,
  language,
  customers,
  employees,
  showUserManagementAction,
  showUsersCount,
  users,
  attendance,
  payments,
  projects,
  instructions,
  financeIncome,
  financeExpenses,
  income,
  expense,
  balance,
  now,
  settings,
  currencyAmount,
  setCurrencyAmount,
  currencyFrom,
  setCurrencyFrom,
  currencyTo,
  setCurrencyTo,
  convertedAmount,
  setPage,
}) {
  const activeProjects =
    projects.filter(
      (project) =>
        project.status !== "Completed" &&
        project.status !== "Cancelled"
    );

  const todayDate = getTodayKabulInputDate();
  const todayAttendance = attendance.filter(
    (item) => String(item.date || "").slice(0, 10) === todayDate
  );
  const financialChartData = [
    ...financeIncome.map((item) => ({
      id: `income-${item.id}`,
      label: item.source || t.income,
      amount: Number(item.amount || 0),
      date: item.date,
      kind: "income",
      kindLabel: t.income,
    })),
    ...financeExpenses.map((item) => ({
      id: `expense-${item.id}`,
      label: item.title || t.expense,
      amount: Number(item.amount || 0),
      date: item.date,
      kind: "expense",
      kindLabel: t.expense,
    })),
  ]
    .filter((item) => Number.isFinite(item.amount))
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, 8);
  const maxChartAmount = Math.max(
    ...financialChartData.map((item) => item.amount),
    0
  );

  const recentActivities = [
    ...instructions.map((item) => ({
      id: `instruction-${item.id}`,
      title: item.title,
      detail: t.instructions,
      date: item.created_at,
      kind: "instruction",
    })),
    ...projects.map((item) => ({
      id: `project-${item.id}`,
      title: item.title,
      detail: t.projects,
      date: item.created_at,
      kind: "project",
    })),
    ...payments.map((item) => ({
      id: `payment-${item.id}`,
      title: item.description || formatMoney(item.amount),
      detail: t.payments,
      date: item.created_at || item.date,
      kind: "payment",
    })),
  ]
    .filter((item) => item.title && item.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 5);

  const overdueProjects =
    projects.filter((project) => {
      if (!project.deadline) {
        return false;
      }

      if (
        project.status === "Completed" ||
        project.status === "Cancelled"
      ) {
        return false;
      }

      return (
        new Date(project.deadline) <
        new Date()
      );
    });

  return (
    <section className="content" data-page="dashboard">

      <div className="page-heading-row">
        <div className="page-title">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <span>OFFICE MANAGEMENT</span>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{t.dashboard}</span>
          </nav>
          <h1>{t.dashboard}</h1>
          <p>{t.overview}</p>
        </div>
        <div className="dashboard-header-meta">
          {settings.dashboardStats && (
            <span className="dashboard-attendance">
              <span aria-hidden="true" />
              {todayAttendance.length} {t.attendanceToday}
            </span>
          )}
          {settings.dateTime && (
            <div className="dashboard-date">
              <span>{language === "fa" ? "امروز" : "Today"}</span>
              <strong>{formatDate(now, language)}</strong>
              <time>{formatTime(now)}</time>
            </div>
          )}
        </div>
      </div>

      {settings.dashboardStats && (
        <div className={`stats-grid dashboard-stat-grid ${showUsersCount ? "has-users-kpi" : ""}`}>
          <Stat
            number={customers.length}
            label={t.customers}
            code="CU"
          />
          <Stat
            number={employees.length}
            label={t.employee}
            code="EM"
          />
          <Stat
            number={projects.length}
            label={t.projects}
            code="PR"
          />
          <Stat
            number={payments.length}
            label={t.payments}
            code="PY"
          />
          {showUsersCount && (
            <Stat
              number={users.length}
              label={t.users}
              code="US"
            />
          )}
        </div>
      )}

      {settings.dashboardStats && (
        <section className="dashboard-attendance-summary" aria-label={t.attendanceToday}>
          <SectionTitle title={t.attendanceToday} />
          <div className="stats-grid dashboard-attendance-stats">
            <Stat
              number={todayAttendance.filter((item) => String(item.status).toLowerCase() === "present").length}
              label={t.present}
              code="PR"
            />
            <Stat
              number={todayAttendance.filter((item) => String(item.status).toLowerCase() === "absent").length}
              label={t.absent}
              code="AB"
            />
            <Stat
              number={todayAttendance.filter((item) => String(item.status).toLowerCase() === "late").length}
              label={t.late}
              code="LT"
            />
          </div>
        </section>
      )}

      <section className="dashboard-finances" aria-label={t.finance}>
        <SectionTitle title={language === "fa" ? "نمای کلی مالی" : "FINANCIAL OVERVIEW"} />
        <div className="payment-summary dashboard-financial-summary">
        <Stat
          number={formatMoney(income)}
          label={t.income}
          code="IN"
        />

        <Stat
          number={formatMoney(expense)}
          label={t.expense}
          code="EX"
        />

        <Stat
          number={formatMoney(balance)}
          label={t.balance}
          code="BL"
        />
        </div>
      </section>

      {settings.currency && (
        <div className="currency-card dashboard-currency-card">
          <div>
            <small>{t.currencyConverter}</small>
            <h2>
              {currencyAmount || 0} {currencyFrom}{" = "}{convertedAmount} {currencyTo}
              <small className="currency-summary-label">
                {" — "}{currencyLabel(currencyFrom, language)}{" → "}{currencyLabel(currencyTo, language)}
              </small>
            </h2>
          </div>
          <div className="currency-controls">
            <label className="currency-field">
              <span>{t.amount}</span>
              <input type="number" value={currencyAmount} onChange={(e) => setCurrencyAmount(e.target.value)} />
            </label>
            <label className="currency-field">
              <span>{t.from}</span>
              <select aria-label={t.from} value={currencyFrom} onChange={(e) => setCurrencyFrom(e.target.value)}>
                {Object.keys(RATES).map((currency) => (
                  <option key={currency} value={currency}>{currencyLabel(currency, language)}</option>
                ))}
              </select>
            </label>
            <span className="currency-direction" aria-hidden="true">→</span>
            <label className="currency-field">
              <span>{t.to}</span>
              <select aria-label={t.to} value={currencyTo} onChange={(e) => setCurrencyTo(e.target.value)}>
                {Object.keys(RATES).map((currency) => (
                  <option key={currency} value={currency}>{currencyLabel(currency, language)}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      {settings.overdueWarning &&
        overdueProjects.length > 0 && (
          <div className="warning-card">
            <div>
              <strong>{t.projectWarning}</strong>
              <p>{overdueProjects.length} {t.overdue}</p>
            </div>
            <button type="button" onClick={() => setPage("projects")}>
              {language === "fa" ? "مشاهده" : "VIEW"}
            </button>
          </div>
        )}

      <div className="dashboard-main-grid">
        <section className="dashboard-panel expense-chart-panel dashboard-chart">
          <SectionTitle title={language === "fa" ? "نمودار مالی" : "FINANCIAL ACTIVITY"} />
          {financialChartData.length === 0 ? (
            <Empty text={t.noData} />
          ) : (
            <div className="expense-chart-list">
              {financialChartData.map((item) => {
                const width = maxChartAmount > 0
                  ? Math.max(4, (item.amount / maxChartAmount) * 100)
                  : 0;
                return (
                  <div className={`expense-chart-row chart-${item.kind}`} key={item.id}>
                    <div className="expense-chart-head">
                      <strong>{item.label}</strong>
                      <span className="financial-chart-value">
                        <small>{item.kindLabel}</small>
                        {formatMoney(item.amount)}
                      </span>
                    </div>
                    <div className="expense-chart-track">
                      <div className="expense-chart-bar" style={{ width: `${width}%` }} />
                    </div>
                    <time>{formatDisplayDate(item.date, language)}</time>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="dashboard-panel dashboard-quick-actions">
          <SectionTitle title={t.quickActions} />
          <div className="quick-buttons">
            <button type="button" onClick={() => setPage("customers")}>＋ {t.customers}</button>
            {showUserManagementAction && (
              <button type="button" onClick={() => setPage("users")}>＋ {t.users}</button>
            )}
            <button type="button" onClick={() => setPage("payments")}>＋ {t.payments}</button>
            <button type="button" onClick={() => setPage("projects")}>＋ {t.projects}</button>
          </div>
        </aside>
      </div>

      <div className="dashboard-activity">
        <section className="dashboard-panel">
          <SectionTitle title={t.recentProjects} />
          {activeProjects.slice(0, 5).map((project) => (
            <div className="recent-row" key={project.id}>
              <div>
                <strong>{project.title}</strong>
                <small>{project.employee || "—"}</small>
              </div>
              <Status value={project.status} />
            </div>
          ))}
          {activeProjects.length === 0 && <Empty text={t.noData} />}
        </section>
        <section className="dashboard-panel">
          <SectionTitle title={t.recentPayments} />
          {payments.slice(0, 5).map((payment) => (
            <div className="recent-row" key={payment.id}>
              <div>
                <strong>{formatMoney(payment.amount)}</strong>
                <small>{payment.description || t.payments}</small>
              </div>
              <Status value={payment.type} />
            </div>
          ))}
          {payments.length === 0 && <Empty text={t.noData} />}
        </section>
        <section className="dashboard-panel dashboard-office-activities">
          <SectionTitle title={language === "fa" ? "فعالیت‌های اخیر دفتر" : "RECENT OFFICE ACTIVITIES"} />
          {recentActivities.map((activity) => (
            <div className="recent-row" key={activity.id}>
              <div>
                <strong>{activity.title}</strong>
                <small>{activity.detail}</small>
              </div>
              <time>{formatDisplayDate(activity.date, language)}</time>
            </div>
          ))}
          {recentActivities.length === 0 && <Empty text={t.noData} />}
        </section>
      </div>

    </section>
  );
}

/* ================================================= */
/* ================= COMPONENTS ==================== */
/* ================================================= */

function PageTools({
  t,
  language,
  page,
  search,
  setSearch,
  onCreate,
  onPrint,
  onExcel,
  showExcel,
  filters,
}) {
  return (
    <div className="page-tools" data-page-tools={page}>
      <div className="page-search">
        <span>⌕</span>

        <input
          type="text"
          placeholder={`${t.search}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filters}

      <div className="page-tool-actions">
        <button
          type="button"
          className="new-record-button"
          onClick={onCreate}
        >
          ＋ {t.createNew}
        </button>

        <button
          type="button"
          className="tool-button"
          onClick={onPrint}
          title={language === "fa" ? "چاپ" : "PRINT"}
        >
          🖨 {language === "fa" ? "چاپ" : "PRINT"}
        </button>

        {showExcel && (
          <button
            type="button"
            className="tool-button"
            onClick={onExcel}
          >
            📊 EXCEL
          </button>
        )}
      </div>
    </div>
  );
}

function Page({
  title,
  pageKey,
  description,
  toolbar,
  children,
}) {
  return (
    <section className="content page-content" data-page={pageKey}>
      <header className="page-heading-row">
        <div className="page-title">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <span>OFFICE MANAGEMENT</span>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{title}</span>
          </nav>
          <h1>{title}</h1>
          {description && <p className="page-description">{description}</p>}
        </div>
        {toolbar}
      </header>
      <div className="page-body">
        {children}
      </div>
    </section>
  );
}

function AdminDashboard({
  t,
  language,
  attendance,
  employees,
  instructions,
  now,
  setPage,
  startNewRecord,
}) {
  const recentInstructions = instructions.slice(0, 4);
  const todayRecords = attendance.filter(
    (item) => String(item.date || "").slice(0, 10) === getTodayKabulInputDate()
  );
  const dashboardMeta = (
    <div className="dashboard-header-meta">
      <span className="dashboard-attendance">
        <span aria-hidden="true" />
        {todayRecords.length} {t.attendanceToday}
      </span>
      <div className="dashboard-date">
        <span>{language === "fa" ? "امروز" : "Today"}</span>
        <strong>{formatDate(now, language)}</strong>
        <time>{formatTime(now)}</time>
      </div>
    </div>
  );

  return (
    <Page title={t.dashboard} pageKey="dashboard" toolbar={dashboardMeta}>
      <p className="dashboard-intro">
        {language === "fa"
          ? "نمای کلی حاضری و دستورهای دفتر."
          : "A focused overview of office attendance and instructions."}
      </p>

      <div className="stats-grid admin-stats">
        <Stat
          number={todayRecords.length}
          label={t.attendance}
          code="AT"
        />
        <Stat
          number={employees.length}
          label={t.employee}
          code="EM"
        />
        <Stat
          number={instructions.length}
          label={t.instructions}
          code="OR"
        />
      </div>

      <section className="dashboard-attendance-summary" aria-label={t.attendanceToday}>
        <SectionTitle title={t.attendanceToday} />
        <div className="stats-grid dashboard-attendance-stats">
          <Stat number={todayRecords.filter((item) => String(item.status).toLowerCase() === "present").length} label={t.present} code="PR" />
          <Stat number={todayRecords.filter((item) => String(item.status).toLowerCase() === "absent").length} label={t.absent} code="AB" />
          <Stat number={todayRecords.filter((item) => String(item.status).toLowerCase() === "late").length} label={t.late} code="LT" />
        </div>
      </section>

      <section className="dashboard-panel admin-dashboard-panel">
        <SectionTitle title={t.instructions} />
        {recentInstructions.length === 0 ? (
          <Empty text={t.noData} />
        ) : (
          <div className="admin-instruction-list">
            {recentInstructions.map((instruction) => (
              <article className="admin-instruction-row" key={instruction.id}>
                <strong>{instruction.title}</strong>
                <span>{instruction.description || "—"}</span>
                {instruction.created_at && (
                  <small>{formatDisplayDate(instruction.created_at, language)}</small>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="admin-dashboard-actions">
        <button
          type="button"
          className="primary-button"
          onClick={() => startNewRecord("attendance")}
        >
          + {language === "fa" ? "ثبت حاضری" : "Record attendance"}
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => setPage("instructions")}
        >
          {language === "fa" ? "مشاهده دستورها" : "View instructions"}
        </button>
      </div>
    </Page>
  );
}

function NavButton({
  label,
  icon,
  active,
  onClick,
}) {
  const iconShapes = {
    "⌂": (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9M9 20v-6h6v6" />
      </>
    ),
    "◉": (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 3 4.5v1" />
      </>
    ),
    "♙": (
      <>
        <circle cx="12" cy="7" r="3.5" />
        <path d="M5 21v-1a7 7 0 0 1 14 0v1" />
      </>
    ),
    "▤": (
      <>
        <path d="M5 3h10l4 4v14H5z" />
        <path d="M14 3v5h5M8 12h8M8 16h8" />
      </>
    ),
    "✓": (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    "₣": (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18M7 15h4M16 14v2" />
      </>
    ),
    "▣": (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M8 4v16M8 9h13M8 14h13" />
      </>
    ),
    "⚙": (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" />
      </>
    ),
  };

  return (
    <button
      className={
        active
          ? "nav-button active"
          : "nav-button"
      }
      onClick={onClick}
      title={label}
    >
      <span className="nav-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {iconShapes[icon] || <circle cx="12" cy="12" r="8" />}
        </svg>
      </span>

      <span className="nav-label">
        {label}
      </span>
    </button>
  );
}

function ProfileIcon() {
  return (
    <svg
      className="header-account-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.7-3.1 3.2-5 7-5s6.3 1.9 7 5" />
    </svg>
  );
}

function EyeIcon({ off = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {off ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 4.2A10.4 10.4 0 0 1 12 4c5.5 0 9.3 4.7 10 6a17.5 17.5 0 0 1-3.2 3.6" />
          <path d="M6.1 6.1C3.7 7.7 2.4 10 2 10c.7 1.3 4.5 6 10 6 1 0 2-.2 2.9-.5" />
        </>
      ) : (
        <>
          <path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.5" />
        </>
      )}
    </svg>
  );
}

function PhotoInput({
  label,
  value,
  onChange,
}) {
  return (
    <label className="field photo-field">
      <span>{label}</span>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => onChange(String(reader.result || ""));
          reader.readAsDataURL(file);
        }}
      />
      {value && (
        <div className="photo-preview">
          <img src={value} alt="preview" />
        </div>
      )}
    </label>
  );
}

function AvatarPhoto({ src }) {
  if (!src) {
    return <span className="avatar-placeholder">—</span>;
  }

  return (
    <img
      src={src}
      alt=""
      className="table-avatar"
    />
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <label className="field">

      <span>
        {label}
      </span>

      <input
        type={type}
        value={value ?? ""}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        required={required}
      />

    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
  required = false,
}) {
  return (
    <label className="field">

      <span>
        {label}
      </span>

      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        required={required}
      >
        {children}
      </select>

    </label>
  );
}

function FormCard({
  title,
  children,
}) {
  return (
    <div className="form-card a4-form-page">

      <div className="form-card-title">
        <span>{title}</span>
      </div>

      <div className="a4-form-body">
        {children}
      </div>

    </div>
  );
}

function FormButtons({
  editing,
  t,
  cancel,
}) {
  return (
    <div className="form-actions">

      <button
        type="submit"
        className="primary-button"
      >
        {editing
          ? t.save
          : t.add}
      </button>

      {editing && (
        <button
          type="button"
          className="secondary-button"
          onClick={cancel}
        >
          {t.cancel}
        </button>
      )}

    </div>
  );
}

function ActionButtons({
  edit,
  remove,
  receipt,
  t,
  canEdit = true,
  canDelete = true,
}) {
  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    edit();
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await remove();
  };

  if (!canEdit && !canDelete && !receipt) {
    return null;
  }

  return (
    <div
      className="action-buttons"
      onClick={(e) => e.stopPropagation()}
    >
      {canEdit && (
        <button
          type="button"
          className="edit-button"
          onClick={handleEdit}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label={t.edit}
        >
          {t.edit}
        </button>
      )}

      {receipt && (
        <button
          type="button"
          className="receipt-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            receipt();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Receipt"
        >
          🧾
        </button>
      )}

      {canDelete && (
        <button
          type="button"
          className="delete-button"
          onClick={handleDelete}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label={t.delete}
        >
          {t.delete}
        </button>
      )}
    </div>
  );
}

function Table({
  headers,
  children,
}) {
  return (
    <div className="table-card">

      <div className="table-scroll">

        <table>

          <thead>
            <tr>
              {headers.map(
                (header, index) => (
                  <th key={index}>
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {children}
          </tbody>

        </table>

      </div>

    </div>
  );
}

function Status({
  value,
}) {
  const text =
    String(value || "—");

  return (
    <span
      className={`status ${text
        .toLowerCase()
        .replace(
          /\s+/g,
          "-"
        )}`}
    >
      {text}
    </span>
  );
}

function Stat({
  number,
  label,
  code,
}) {
  return (
    <div className="stat">

      <span>
        {code}
      </span>

      <div>

        <small>
          {label}
        </small>

        <strong>
          {number}
        </strong>

      </div>

    </div>
  );
}

function ModuleOverview({ items }) {
  return (
    <div className="module-overview" aria-label="Page summary">
      {items.map((item) => (
        <article className={`module-summary tone-${item.tone || "blue"}`} key={item.label}>
          <span className="module-summary-marker" aria-hidden="true" />
          <small>{item.label}</small>
          <strong>{item.value}</strong>
        </article>
      ))}
    </div>
  );
}

function SectionTitle({
  title,
}) {
  return (
    <div className="section-title">

      <h2>
        {title}
      </h2>

      <span />

    </div>
  );
}

function Empty({
  text,
}) {
  return (
    <div className="empty">
      {text}
    </div>
  );
}

/* ================================================= */
/* ================= HELPERS ======================= */
/* ================================================= */

function getUserName(
  users,
  id
) {
  const user = users.find(
    (item) =>
      String(item.id) ===
      String(id)
  );

  return user?.name || "—";
}

function getCustomerName(
  customers,
  id
) {
  const customer =
    customers.find(
      (item) =>
        String(item.id) ===
        String(id)
    );

  return customer?.name || "—";
}

function formatMoney(value) {
  return (
    Number(value || 0)
      .toLocaleString() +
    " AFN"
  );
}

function formatInputDate(
  value
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value).slice(
      0,
      10
    );
  }

  return date
    .toISOString()
    .slice(0, 10);
}

function formatDisplayDate(
  value,
  language
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    language === "fa"
      ? "fa-AF"
      : "en-US"
  );
}

function formatDate(
  date,
  language
) {
  return date.toLocaleDateString(
    language === "fa"
      ? "fa-AF"
      : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }
  );
}

function formatTime(
  date
) {
  return date.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  );
}

function deadlineInfo(
  deadline
) {
  if (!deadline) {
    return null;
  }

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const target =
    new Date(deadline);

  target.setHours(
    0,
    0,
    0,
    0
  );

  const difference =
    Math.ceil(
      (target - today) /
        (1000 *
          60 *
          60 *
          24)
    );

  if (difference < 0) {
    return (
      <span className="deadline-danger">
        OVERDUE
      </span>
    );
  }

  if (difference === 0) {
    return (
      <span className="deadline-warning">
        TODAY
      </span>
    );
  }

  if (difference <= 3) {
    return (
      <span className="deadline-warning">
        {difference} DAYS
      </span>
    );
  }

  return null;
}

/* ================================================= */
/* ================= CSS =========================== */
/* ================================================= */

const styles = `
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family:
    Inter,
    Arial,
    sans-serif;

  background:
    #08111f;

  color: #e8eef6;
}

button,
input,
select,
textarea {
  font-family: inherit;
}

button {
  cursor: pointer;
}

.app {
  min-height: 100vh;

  display: flex;

  background:
    radial-gradient(
      circle at 15% 10%,
      rgba(67,91,125,.13),
      transparent 30%
    ),
    #08111f;
}

.rtl {
  direction: rtl;
}

.sidebar {
  width: 245px;

  min-height: 100vh;

  position: fixed;

  left: 0;
  top: 0;
  bottom: 0;

  padding: 22px 15px;

  background:
    rgba(10,21,36,.96);

  border-right:
    1px solid
    rgba(185,200,220,.20);

  z-index: 20;
}

.rtl .sidebar {
  left: auto;
  right: 0;

  border-right: none;

  border-left:
    1px solid
    rgba(185,200,220,.20);
}

.brand {
  display: flex;

  align-items: center;

  gap: 11px;

  padding:
    0 8px 24px;

  border-bottom:
    1px solid
    rgba(185,200,220,.18);
}

.brand-logo,
.login-logo {
  width: 43px;
  height: 43px;

  border-radius: 12px;

  display: grid;

  place-items: center;

  background:
    linear-gradient(
      135deg,
      #182b43,
      #263b57
    );

  border:
    1px solid
    rgba(205,220,240,.22);

  font-weight: 900;

  letter-spacing: 1px;
}

.brand strong {
  display: block;

  font-size: 13px;

  letter-spacing: 2px;
}

.brand small {
  display: block;

  margin-top: 3px;

  color: #8392a5;

  font-size: 8px;

  letter-spacing: 2px;
}

nav {
  margin-top: 20px;

  display: flex;

  flex-direction: column;

  gap: 6px;
}

.nav-button {
  width: 100%;

  border: 1px solid transparent;

  background: transparent;

  color: #8493a7;

  padding:
    12px 13px;

  border-radius: 10px;

  display: flex;

  align-items: center;

  gap: 11px;

  text-align: left;

  font-size: 10px;

  font-weight: 700;

  letter-spacing: .7px;

  transition: .2s;
}

.rtl .nav-button {
  text-align: right;
}

.nav-button span {
  width: 24px;

  text-align: center;

  font-size: 15px;
}

.nav-button:hover {
  color: #e8eef6;

  background:
    rgba(120,145,175,.08);

  border-color:
    rgba(185,200,220,.12);
}

.nav-button.active {
  color: #edf3fa;

  background:
    rgba(65,88,117,.28);

  border:
    1px solid
    rgba(185,205,230,.20);

  box-shadow:
    inset 0 0 18px
    rgba(120,150,190,.05);
}

.logout-button {
  position: absolute;

  bottom: 20px;

  left: 15px;
  right: 15px;

  padding: 11px;

  border-radius: 10px;

  border:
    1px solid
    rgba(185,200,220,.16);

  background:
    rgba(120,145,175,.06);

  color: #9eacbd;

  font-size: 9px;

  font-weight: 800;
}

.main {
  width: calc(100% - 245px);

  margin-left: 245px;

  min-height: 100vh;
}

.rtl .main {
  margin-left: 0;
  margin-right: 245px;
}

.topbar {
  height: 72px;

  padding:
    0 28px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  border-bottom:
    1px solid
    rgba(185,200,220,.16);

  background:
    rgba(8,17,31,.76);

  backdrop-filter:
    blur(12px);

  position: sticky;

  top: 0;

  z-index: 10;
}

.top-label {
  display: block;

  color: #748397;

  font-size: 8px;

  letter-spacing: 1.6px;

  margin-bottom: 4px;
}

.topbar strong {
  font-size: 13px;
}

.top-actions {
  display: flex;

  align-items: center;

  gap: 9px;
}

.clock {
  color: #9baabd;

  font-size: 9px;

  padding: 8px 10px;

  border:
    1px solid
    rgba(185,200,220,.16);

  border-radius: 8px;

  background:
    rgba(130,150,180,.05);
}

.refresh-button {
  width: 34px;
  height: 34px;

  border-radius: 9px;

  border:
    1px solid
    rgba(185,200,220,.18);

  background:
    rgba(120,145,175,.08);

  color: #dce5ef;

  font-size: 17px;
}

.content {
  padding: 28px;
  max-width: 1600px;
  margin: auto;
}

.page-title {
  margin-bottom: 22px;
}

.page-title h1 {
  margin: 0;

  font-size: 23px;

  letter-spacing: 1px;
}

.page-title p {
  margin:
    6px 0 0;

  color: #728197;

  font-size: 8px;

  letter-spacing: 1.5px;
}

/* SEARCH */

.global-search {
  margin:
    18px 28px 0;

  position: relative;
}

.global-search input {
  width: 100%;

  height: 39px;

  padding:
    0 40px 0 14px;

  border-radius: 9px;

  border:
    1px solid
    rgba(185,200,220,.19);

  background:
    #0c1828;

  color: #edf3fa;

  outline: none;

  font-size: 10px;
}

.rtl .global-search input {
  padding:
    0 14px 0 40px;
}

.global-search span {
  position: absolute;

  right: 13px;

  top: 10px;

  color: #728197;
}

.rtl .global-search span {
  right: auto;
  left: 13px;
}

/* WELCOME */

.welcome-card {
  padding: 24px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 20px;

  border:
    1px solid
    rgba(185,200,220,.18);

  border-radius: 15px;

  background:
    linear-gradient(
      120deg,
      rgba(19,34,54,.88),
      rgba(18,29,46,.72)
    );
}

.welcome-card small {
  color: #74859a;

  font-size: 8px;

  letter-spacing: 2px;
}

.welcome-card h2 {
  margin:
    7px 0;

  font-size: 19px;
}

.welcome-card p {
  margin: 0;

  color: #8998ab;

  max-width: 620px;

  line-height: 1.7;

  font-size: 10px;
}

.dashboard-date {
  min-width: 210px;

  text-align: right;

  padding: 13px;

  border:
    1px solid
    rgba(185,200,220,.15);

  border-radius: 10px;

  background:
    rgba(8,18,31,.45);
}

.rtl .dashboard-date {
  text-align: left;
}

.dashboard-date strong {
  display: block;

  font-size: 10px;

  color: #b7c3d2;
}

.dashboard-date span {
  display: block;

  margin-top: 7px;

  font-size: 18px;

  font-weight: 800;
}

/* STATS */

.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 13px;

  margin-top: 14px;
}

.stat {
  min-height: 92px;

  padding: 15px;

  display: flex;

  align-items: center;

  gap: 13px;

  border:
    1px solid
    rgba(185,200,220,.17);

  border-radius: 12px;

  background:
    rgba(15,28,45,.80);
}

.stat > span {
  width: 38px;
  height: 38px;

  border-radius: 10px;

  display: grid;

  place-items: center;

  background:
    rgba(90,115,145,.15);

  border:
    1px solid
    rgba(185,200,220,.17);

  color: #aab8c9;

  font-size: 8px;

  font-weight: 900;
}

.stat small {
  display: block;

  color: #718095;

  font-size: 8px;

  margin-bottom: 5px;

  text-transform: uppercase;
}

.stat strong {
  font-size: 20px;
}

/* PAYMENT */

.payment-summary {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 13px;

  margin-top: 14px;
}

/* CURRENCY */

.currency-card {
  margin-top: 14px;

  padding: 12px 15px;

  min-height: 58px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  border:
    1px solid
    rgba(185,200,220,.17);

  border-radius: 11px;

  background:
    rgba(14,27,44,.78);
}

.currency-card small {
  display: block;

  color: #718095;

  font-size: 7px;

  letter-spacing: 1px;
}

.currency-card h2 {
  margin: 4px 0 0;

  font-size: 11px;

  font-weight: 800;
}

.currency-controls {
  display: flex;

  align-items: center;

  gap: 6px;
}

.currency-controls input,
.currency-controls select {
  width: 78px;

  height: 30px;

  padding: 0 7px;

  border-radius: 7px;

  border:
    1px solid
    rgba(185,200,220,.18);

  background:
    #0b1727;

  color: #dfe7f0;

  outline: none;

  font-size: 8px;
}

.currency-controls select {
  width: 65px;
}

.currency-controls span {
  color: #76879a;

  font-size: 12px;
}

/* WARNING */

.warning-card {
  margin-top: 14px;

  padding: 13px 16px;

  display: flex;

  justify-content: space-between;

  align-items: center;

  border:
    1px solid
    rgba(200,150,100,.24);

  border-radius: 11px;

  background:
    rgba(70,50,30,.18);
}

.warning-card strong {
  font-size: 10px;
}

.warning-card p {
  margin: 4px 0 0;

  color: #9b8b7d;

  font-size: 8px;
}

.warning-card button {
  border:
    1px solid
    rgba(190,170,145,.22);

  background:
    rgba(150,120,90,.10);

  color: #c4b29e;

  padding: 7px 11px;

  border-radius: 7px;

  font-size: 8px;
}

/* DASHBOARD PANELS */

.dashboard-grid {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 14px;

  margin-top: 15px;
}

.dashboard-panel,
.quick-actions {
  padding: 17px;

  border:
    1px solid
    rgba(185,200,220,.17);

  border-radius: 13px;

  background:
    rgba(14,27,44,.76);
}

.recent-row {
  display: flex;

  justify-content: space-between;

  align-items: center;

  padding: 10px 0;

  border-bottom:
    1px solid
    rgba(185,200,220,.10);
}

.recent-row:last-child {
  border-bottom: none;
}

.recent-row strong {
  display: block;

  font-size: 9px;
}

.recent-row small {
  display: block;

  margin-top: 4px;

  color: #718095;

  font-size: 7px;
}

.quick-actions {
  margin-top: 14px;
}

.quick-buttons {
  display: flex;

  flex-wrap: wrap;

  gap: 8px;
}

.quick-buttons button {
  border:
    1px solid
    rgba(185,200,220,.18);

  background:
    rgba(110,135,165,.07);

  color: #b9c6d5;

  padding: 9px 12px;

  border-radius: 8px;

  font-size: 8px;
}

/* SECTION */

.section-title {
  display: flex;

  align-items: center;

  gap: 10px;

  margin:
    20px 0 12px;
}

.section-title h2 {
  margin: 0;

  font-size: 12px;

  letter-spacing: .5px;
}

.section-title span {
  height: 1px;

  flex: 1;

  background:
    rgba(185,200,220,.15);
}

/* FORM */

.form-card {
  padding: 19px;

  border:
    1px solid
    rgba(185,200,220,.18);

  border-radius: 14px;

  background:
    rgba(14,27,44,.80);
}

.form-card-title {
  margin-bottom: 15px;

  font-size: 10px;

  font-weight: 800;

  color: #aebccc;
}

.form-grid {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 12px;
}

.field {
  display: flex;

  flex-direction: column;

  gap: 6px;
}

.field > span {
  color: #718095;

  font-size: 8px;

  text-transform: uppercase;

  letter-spacing: .7px;
}

.field input,
.field select,
.field textarea {
  width: 100%;

  border:
    1px solid
    rgba(185,200,220,.19);

  background:
    #0b1727;

  color: #e5edf6;

  outline: none;

  border-radius: 8px;

  padding:
    10px;

  font-size: 9px;

  transition: .2s;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color:
    rgba(190,210,235,.38);

  box-shadow:
    0 0 0 2px
    rgba(120,150,190,.06);
}

.field textarea {
  min-height: 135px;

  resize: vertical;
}

.form-actions {
  display: flex;

  align-items: end;

  gap: 7px;

  min-height: 57px;
}

.primary-button,
.secondary-button {
  border-radius: 8px;

  padding:
    10px 16px;

  font-size: 8px;

  font-weight: 800;

  border:
    1px solid
    rgba(185,200,220,.20);
}

.primary-button {
  background:
    #1c3049;

  color: #e8eef5;
}

.primary-button:hover {
  background:
    #243d5b;
}

.secondary-button {
  background:
    rgba(110,135,165,.07);

  color: #9eacbd;
}

/* TABLE */

.table-card {
  border:
    1px solid
    rgba(185,200,220,.18);

  border-radius: 13px;

  overflow: hidden;

  background:
    rgba(13,26,43,.78);
}

.table-scroll {
  width: 100%;

  overflow-x: auto;
}

table {
  width: 100%;

  border-collapse: collapse;

  min-width: 760px;
}

th,
td {
  padding:
    12px 13px;

  text-align: left;

  border-bottom:
    1px solid
    rgba(185,200,220,.13);

  font-size: 8px;

  white-space: nowrap;
}

.rtl th,
.rtl td {
  text-align: right;
}

th {
  background:
    rgba(100,125,155,.08);

  color: #91a1b4;

  font-size: 7px;

  letter-spacing: 1px;
}

td {
  color: #bdc8d5;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover td {
  background:
    rgba(120,145,175,.035);
}

/* ACTION */

.action-buttons {
  display: flex;

  gap: 5px;
}

.edit-button,
.delete-button {
  padding:
    6px 8px;

  border-radius: 6px;

  font-size: 7px;

  border:
    1px solid
    rgba(185,200,220,.17);
}

.edit-button {
  background:
    rgba(100,130,165,.08);

  color: #9fb2c7;
}

.delete-button {
  background:
    rgba(130,80,80,.08);

  color: #b99b9b;
}

/* STATUS */

.status {
  display: inline-block;

  padding:
    5px 7px;

  border-radius: 6px;

  background:
    rgba(110,135,165,.09);

  border:
    1px solid
    rgba(185,200,220,.13);

  color: #aebdcd;

  font-size: 7px;

  font-weight: 800;
}

.status.completed {
  color: #b4c0ce;
}

.status.pending {
  color: #b3bdca;
}

.status.in-progress {
  color: #a9b9cb;
}

.status.paid {
  color: #b5c2d0;
}

.status.unpaid {
  color: #bca9a9;
}

.deadline-danger {
  display: block;

  margin-top: 5px;

  color: #ba9898;

  font-size: 6px;

  font-weight: 800;
}

.deadline-warning {
  display: block;

  margin-top: 5px;

  color: #b8a68e;

  font-size: 6px;

  font-weight: 800;
}

/* EMPTY */

.empty {
  padding: 35px;

  text-align: center;

  color: #68778b;

  border:
    1px solid
    rgba(185,200,220,.12);

  border-radius: 12px;

  background:
    rgba(14,27,44,.50);

  font-size: 9px;
}

/* SETTINGS */

.settings-card {
  border:
    1px solid
    rgba(185,200,220,.18);

  border-radius: 14px;

  overflow: hidden;

  background:
    rgba(14,27,44,.80);
}

.settings-header {
  padding: 20px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  border-bottom:
    1px solid
    rgba(185,200,220,.14);
}

.settings-header h2 {
  margin: 0;

  font-size: 15px;
}

.settings-header p {
  margin:
    6px 0 0;

  color: #718095;

  font-size: 8px;
}

.settings-icon {
  width: 40px;
  height: 40px;

  border-radius: 10px;

  display: grid;

  place-items: center;

  background:
    rgba(100,125,155,.09);

  border:
    1px solid
    rgba(185,200,220,.16);
}

.setting-row {
  padding:
    15px 20px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  border-bottom:
    1px solid
    rgba(185,200,220,.12);
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-row strong {
  display: block;

  font-size: 9px;
}

.setting-row small {
  display: block;

  margin-top: 4px;

  color: #68788c;

  font-size: 6px;

  letter-spacing: 1px;
}

.toggle {
  min-width: 62px;

  height: 29px;

  border-radius: 15px;

  border:
    1px solid
    rgba(185,200,220,.18);

  background:
    rgba(90,110,135,.08);

  color: #758498;

  position: relative;

  font-size: 7px;

  padding-left: 22px;
}

.toggle span {
  position: absolute;

  width: 17px;
  height: 17px;

  border-radius: 50%;

  left: 5px;
  top: 5px;

  background:
    #5b6b7e;
}

.toggle.on {
  background:
    rgba(70,100,130,.25);

  color: #c3d0dd;
}

.toggle.on span {
  left: 38px;

  background:
    #aebdcd;
}

/* LANGUAGE */

.language-choice {
  display: flex;

  gap: 6px;
}

.language-choice button,
.login-language button {
  border:
    1px solid
    rgba(185,200,220,.17);

  background:
    rgba(100,125,155,.06);

  color: #8392a5;

  padding:
    7px 10px;

  border-radius: 7px;

  font-size: 7px;
}

.language-choice button.selected,
.login-language button.selected {
  background:
    rgba(100,130,165,.18);

  color: #dbe4ed;

  border-color:
    rgba(185,205,230,.26);
}

/* TRANSLATOR */

.translator-card {
  margin-top: 15px;

  padding: 19px;

  border:
    1px solid
    rgba(185,200,220,.18);

  border-radius: 14px;

  background:
    rgba(14,27,44,.80);
}

.translator-controls {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 12px;

  margin-bottom: 14px;
}

.translator-grid {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 12px;
}

/* LOGIN */

.login-page {
  min-height: 100vh;

  display: grid;

  place-items: center;

  padding: 20px;

  background:
    radial-gradient(
      circle at 50% 30%,
      rgba(60,85,120,.18),
      transparent 35%
    ),
    #07111f;
}

.login-box {
  width: 390px;

  max-width: 100%;

  padding: 32px;

  border:
    1px solid
    rgba(185,200,220,.21);

  border-radius: 18px;

  background:
    rgba(12,25,42,.90);

  box-shadow:
    0 25px 80px
    rgba(0,0,0,.32);
}

.login-logo {
  margin:
    0 auto 17px;

  width: 55px;
  height: 55px;

  font-size: 16px;
}

.login-box h1 {
  text-align: center;

  margin: 0;

  font-size: 19px;

  letter-spacing: 1px;
}

.login-box > p {
  text-align: center;

  color: #718095;

  font-size: 8px;

  margin:
    7px 0 23px;
}

.login-box form {
  display: flex;

  flex-direction: column;

  gap: 12px;
}

.login-button {
  width: 100%;

  margin-top: 5px;

  height: 40px;
}

.login-language {
  display: flex;

  justify-content: center;

  gap: 7px;

  margin-top: 20px;
}

/* TOAST */

.toast {
  position: fixed;

  right: 25px;
  bottom: 25px;

  z-index: 100;

  padding:
    11px 15px;

  border-radius: 9px;

  background:
    #17283e;

  border:
    1px solid
    rgba(195,210,230,.23);

  color: #dce5ee;

  font-size: 8px;

  box-shadow:
    0 12px 35px
    rgba(0,0,0,.30);
}

.rtl .toast {
  right: auto;
  left: 25px;
}

/* RESPONSIVE */

@media (max-width: 1100px) {

  .form-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .stats-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

}

@media (max-width: 800px) {

  .sidebar {
    width: 205px;
  }

  .main {
    width: calc(100% - 205px);

    margin-left: 205px;
  }

  .rtl .main {
    margin-left: 0;

    margin-right: 205px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .currency-card {
    align-items: flex-start;

    flex-direction: column;
  }

}

@media (max-width: 650px) {

  .sidebar {
    position: relative;

    width: 100%;

    min-height: auto;

    border: none;

    border-bottom:
      1px solid
      rgba(185,200,220,.18);
  }

  .app {
    display: block;
  }

  .main {
    width: 100%;

    margin: 0 !important;
  }

  .rtl .sidebar {
    border: none;

    border-bottom:
      1px solid
      rgba(185,200,220,.18);
  }

  nav {
    display: grid;

    grid-template-columns:
      repeat(2, 1fr);
  }

  .logout-button {
    position: static;

    width: 100%;

    margin-top: 12px;
  }

  .topbar {
    padding: 0 15px;
  }

  .content {
    padding: 17px;
  }

  .global-search {
    margin:
      15px 17px 0;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid,
  .payment-summary {
    grid-template-columns: 1fr;
  }

  .welcome-card {
    flex-direction: column;

    align-items: flex-start;
  }

  .dashboard-date {
    width: 100%;

    text-align: left;
  }

  .rtl .dashboard-date {
    text-align: right;
  }

  .translator-grid,
  .translator-controls {
    grid-template-columns: 1fr;
  }

  .login-box {
    padding: 25px 20px;
  }

}

/* =========================================================
   PREMIUM UI / DAY + NIGHT MODE OVERRIDES
   ========================================================= */

:root {
  color-scheme: dark;
}

html,
body,
#root {
  min-height: 100%;
}

body {
  overflow-x: hidden;
  transition: background .25s ease, color .25s ease;
}

button,
input,
select,
textarea {
  transition: background .2s ease, border-color .2s ease, color .2s ease, box-shadow .2s ease, transform .15s ease;
}

button:not(:disabled):hover {
  transform: translateY(-1px);
}

button:disabled {
  cursor: not-allowed;
  opacity: .65;
}

.app {
  min-height: 100vh;
  background:
    radial-gradient(circle at 85% 0%, rgba(72, 112, 168, .10), transparent 28%),
    radial-gradient(circle at 0% 100%, rgba(43, 91, 145, .08), transparent 32%),
    #07111f;
}

.app.day,
.login-page.day {
  background:
    radial-gradient(circle at 90% 0%, rgba(74, 125, 190, .12), transparent 30%),
    #f3f6fa;
  color: #172033;
}

.app.day .sidebar {
  background: rgba(255,255,255,.94);
  border-color: #dbe3ec;
  box-shadow: 8px 0 35px rgba(30, 50, 80, .06);
}

.app.day .brand strong,
.app.day .brand small,
.app.day .nav-button,
.app.day .topbar strong,
.app.day .page-title h1,
.app.day .form-card-title,
.app.day .section-title h2,
.app.day .settings-header h2,
.app.day .setting-row strong,
.app.day .stat strong,
.app.day .recent-row strong {
  color: #182234;
}

.app.day .nav-button {
  color: #647086;
}

.app.day .nav-button:hover,
.app.day .nav-button.active {
  background: #e9f0f8;
  color: #17304d;
  border-color: #cfdae7;
}

.app.day .main {
  background: transparent;
}

.app.day .topbar {
  background: rgba(255,255,255,.84);
  border-color: #dbe3ec;
  box-shadow: 0 8px 28px rgba(30, 50, 80, .04);
}

.app.day .top-label,
.app.day .page-title p,
.app.day .field > span,
.app.day .settings-header p,
.app.day .setting-row small,
.app.day .recent-row small,
.app.day .stat small,
.app.day .section-title span {
  color: #718096;
}

.app.day .clock,
.app.day .refresh-button,
.app.day .theme-button,
.app.day .global-search,
.app.day .form-card,
.app.day .table-card,
.app.day .settings-card,
.app.day .translator-card,
.app.day .dashboard-panel,
.app.day .currency-card,
.app.day .stat,
.app.day .welcome-card,
.app.day .empty {
  background: rgba(255,255,255,.92);
  border-color: #dbe3ec;
  color: #263348;
  box-shadow: 0 10px 35px rgba(37, 55, 80, .045);
}

.app.day .global-search input,
.app.day .field input,
.app.day .field select,
.app.day .field textarea {
  background: #fff;
  color: #172033;
  border-color: #d4dee9;
}

.app.day th {
  background: #edf2f7;
  color: #607086;
  border-color: #dbe3ec;
}

.app.day td {
  color: #39475b;
  border-color: #e5ebf1;
}

.app.day tr:hover td {
  background: #f7f9fb;
}

.app.day .primary-button {
  background: #173a61;
  color: #fff;
  border-color: #173a61;
}

.app.day .secondary-button,
.app.day .quick-buttons button,
.app.day .language-choice button,
.app.day .theme-choice button {
  background: #f5f7fa;
  color: #536177;
  border-color: #d7e0ea;
}

.app.day .language-choice button.selected,
.app.day .theme-choice button.selected {
  background: #e5edf7;
  color: #183a60;
  border-color: #b9cbe0;
}

.app.day .status {
  background: #f0f4f8;
  color: #42536a;
  border-color: #d9e2ec;
}

.app.day .toggle {
  background: #edf1f5;
  border-color: #d5dee8;
  color: #6a788b;
}

.app.day .toggle span {
  background: #8b98a9;
}

.app.day .toggle.on {
  background: #dfeaf5;
  color: #244668;
}

.app.day .toggle.on span {
  background: #244d76;
}

.theme-button,
.refresh-button {
  width: 42px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  cursor: pointer;
}

.theme-button {
  border: 1px solid rgba(185,200,220,.18);
  background: rgba(100,125,155,.08);
  color: #d8e1eb;
  font-size: 16px;
}

.app.day .theme-button {
  background: #f5f7fa;
  color: #344760;
  border-color: #d7e0ea;
}

.theme-choice {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.theme-choice button {
  border: 1px solid rgba(185,200,220,.17);
  background: rgba(100,125,155,.06);
  color: #8392a5;
  padding: 9px 12px;
  border-radius: 9px;
  font-size: 10px;
  cursor: pointer;
}

.theme-choice button.selected {
  background: rgba(100,130,165,.18);
  color: #e3ebf4;
  border-color: rgba(185,205,230,.28);
}

/* Larger, clearer dashboard */
.content {
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
  padding: 30px 34px 50px;
}

.page-title h1 {
  font-size: 28px;
  line-height: 1.15;
  letter-spacing: -.4px;
}

.page-title p {
  font-size: 13px;
  margin-top: 8px;
}

.welcome-card {
  min-height: 155px;
  padding: 28px 30px;
  border-radius: 20px;
  border: 1px solid rgba(185,200,220,.18);
  box-shadow: 0 18px 55px rgba(0,0,0,.16);
}

.welcome-card h2 {
  font-size: 26px;
  margin: 8px 0 10px;
  letter-spacing: .3px;
}

.welcome-card p {
  font-size: 13px;
  line-height: 1.9;
  max-width: 760px;
}

.dashboard-date strong {
  font-size: 14px;
}

.dashboard-date span {
  font-size: 28px;
  font-weight: 800;
  margin-top: 7px;
}

.stats-grid {
  gap: 18px;
  margin-top: 20px;
}

.stat {
  min-height: 132px;
  padding: 22px;
  border-radius: 17px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(185,200,220,.16);
}

.stat > span {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  background: rgba(115,145,180,.12);
  font-size: 20px;
  font-weight: 800;
}

.stat small {
  font-size: 11px;
}

.stat strong {
  font-size: 30px;
  line-height: 1.1;
  margin-top: 5px;
}

.payment-summary {
  gap: 18px;
  margin-top: 18px;
}

.payment-box {
  min-height: 125px;
  padding: 22px;
  border-radius: 17px;
}

.payment-box small {
  font-size: 11px;
}

.payment-box strong {
  font-size: 25px;
  margin-top: 9px;
}

.dashboard-grid {
  gap: 20px;
  margin-top: 20px;
}

.dashboard-panel,
.currency-card {
  border-radius: 17px;
  border: 1px solid rgba(185,200,220,.16);
  padding: 21px;
}

.section-title {
  margin: 8px 0 16px;
}

.section-title h2 {
  font-size: 15px;
}

.recent-row {
  padding: 15px 4px;
}

.recent-row strong {
  font-size: 13px;
}

.recent-row small {
  font-size: 10px;
}

.quick-actions {
  margin-top: 24px;
}

.quick-buttons {
  gap: 10px;
}

.quick-buttons button {
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 11px;
  cursor: pointer;
}

/* Forms and tables are readable instead of tiny */
.form-card,
.settings-card,
.translator-card {
  border-radius: 17px;
}

.form-card {
  padding: 24px;
}

.form-card-title {
  font-size: 14px;
}

.form-grid {
  gap: 16px;
}

.field > span {
  font-size: 10px;
}

.field input,
.field select,
.field textarea {
  padding: 12px 13px;
  border-radius: 10px;
  font-size: 12px;
}

.primary-button,
.secondary-button {
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 11px;
  cursor: pointer;
}

table {
  min-width: 900px;
}

th,
td {
  padding: 14px 15px;
  font-size: 11px;
}

th {
  font-size: 9px;
}

.edit-button,
.delete-button {
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 10px;
  cursor: pointer;
}

.status {
  padding: 6px 9px;
  border-radius: 8px;
  font-size: 9px;
}

.settings-header {
  padding: 24px;
}

.settings-header h2 {
  font-size: 20px;
}

.settings-header p {
  font-size: 11px;
}

.setting-row {
  padding: 18px 24px;
}

.setting-row strong {
  font-size: 12px;
}

.setting-row small {
  font-size: 8px;
}

.language-choice button,
.login-language button {
  padding: 9px 13px;
  border-radius: 9px;
  font-size: 10px;
  cursor: pointer;
}

.translator-controls,
.translator-grid {
  gap: 16px;
}

/* Sidebar and topbar */
.sidebar {
  width: 250px;
}

.main {
  width: calc(100% - 250px);
  margin-left: 250px;
}

.rtl .main {
  margin-right: 250px;
  margin-left: 0;
}

.brand strong {
  font-size: 14px;
}

.brand small {
  font-size: 8px;
}

.nav-button {
  min-height: 46px;
  padding: 0 14px;
  border-radius: 11px;
  font-size: 11px;
}

.topbar {
  min-height: 78px;
  padding: 0 30px;
}

.top-label {
  font-size: 10px;
}

.topbar strong {
  font-size: 15px;
  margin-top: 4px;
}

.top-actions {
  gap: 9px;
}

.clock {
  padding: 10px 13px;
  border-radius: 10px;
  font-size: 11px;
}

.global-search {
  margin: 20px 34px 0;
  max-width: 720px;
}

.global-search input {
  padding: 13px 15px;
  font-size: 12px;
}

/* Login */
.login-page {
  padding: 24px;
}

.login-box {
  width: 440px;
  padding: 38px;
  border-radius: 22px;
}

.login-box h1 {
  font-size: 25px;
}

.login-box > p {
  font-size: 11px;
}

.login-box .field input {
  font-size: 13px;
  padding: 13px;
}

.login-button {
  height: 46px;
  font-size: 12px;
}

@media (max-width: 900px) {
  .sidebar {
    width: 220px;
  }
  .main {
    width: calc(100% - 220px);
    margin-left: 220px;
  }
  .rtl .main {
    margin-right: 220px;
    margin-left: 0;
  }
  .content {
    padding: 24px 20px 40px;
  }
  .welcome-card h2 {
    font-size: 22px;
  }
}

@media (max-width: 650px) {
  .sidebar {
    width: 100%;
  }
  .main,
  .rtl .main {
    width: 100%;
    margin: 0 !important;
  }
  .content {
    padding: 20px 15px 35px;
  }
  .page-title h1 {
    font-size: 23px;
  }
  .topbar {
    padding: 0 15px;
  }
  .global-search {
    margin: 15px;
  }
  .theme-choice {
    justify-content: flex-start;
  }
}


/* ================= LARGE / READABLE UI ================= */
html, body, #root {
  min-height: 100%;
}

body {
  font-size: 16px !important;
}

.sidebar {
  width: 255px !important;
}

.main {
  width: calc(100% - 255px) !important;
  margin-left: 255px !important;
}

.rtl .main {
  width: calc(100% - 255px) !important;
  margin-right: 255px !important;
  margin-left: 0 !important;
}

.content {
  padding: 34px 34px 55px !important;
}

.topbar {
  min-height: 76px !important;
  padding: 0 28px !important;
}

.page-title h1 {
  font-size: 30px !important;
}

.page-title p {
  font-size: 13px !important;
}

.form-card, .table-card, .section-card, .welcome-card {
  font-size: 15px !important;
}

.field label, .form-label {
  font-size: 12px !important;
}

.field input, .field select, .field textarea, input, select, textarea {
  min-height: 46px !important;
  font-size: 15px !important;
  padding: 12px 14px !important;
}

.primary-button, .secondary-button, .edit-button, .delete-button {
  min-height: 42px !important;
  padding: 10px 17px !important;
  font-size: 13px !important;
  cursor: pointer !important;
}

.table-card {
  width: 100% !important;
  overflow: hidden !important;
}

.table-scroll {
  overflow-x: auto !important;
  overflow-y: visible !important;
}

table {
  min-width: 1000px !important;
  font-size: 14px !important;
}

th {
  font-size: 12px !important;
  padding: 14px 12px !important;
}

td {
  font-size: 14px !important;
  padding: 13px 12px !important;
}

.action-buttons {
  display: flex !important;
  gap: 8px !important;
  align-items: center !important;
  justify-content: center !important;
  white-space: nowrap !important;
}

.action-buttons button {
  position: relative !important;
  z-index: 10 !important;
  pointer-events: auto !important;
}

nav button, nav a {
  min-height: 44px !important;
  font-size: 13px !important;
}

@media (max-width: 900px) {
  .sidebar {
    width: 225px !important;
  }
  .main, .rtl .main {
    width: calc(100% - 225px) !important;
    margin-left: 225px !important;
    margin-right: 0 !important;
  }
  .rtl .main {
    margin-right: 225px !important;
    margin-left: 0 !important;
  }
  .content {
    padding: 26px 20px 45px !important;
  }
}

@media (max-width: 650px) {
  .sidebar {
    width: 100% !important;
  }
  .main, .rtl .main {
    width: 100% !important;
    margin: 0 !important;
  }
  .content {
    padding: 22px 14px 40px !important;
  }
}


/* ================= FINANCE ================= */
.finance-subnav {
  margin: 2px 10px 10px;
  padding: 6px;
  border-radius: 12px;
  background: rgba(255,255,255,0.05);
  display: grid;
  gap: 4px;
}
.finance-subnav button {
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  padding: 9px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
}
.rtl .finance-subnav button { text-align: right; }
.finance-subnav button:hover, .finance-subnav button.active {
  background: rgba(255,255,255,0.10);
}
.finance-summary {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.finance-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 24px;
}
.finance-card {
  border: 1px solid rgba(255,255,255,0.08);
  background: var(--card-bg, rgba(255,255,255,0.04));
  color: inherit;
  border-radius: 18px;
  padding: 22px;
  text-align: left;
  cursor: pointer;
  display: grid;
  gap: 8px;
  transition: transform .15s ease, border-color .15s ease;
}
.rtl .finance-card { text-align: right; }
.finance-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.18); }
.finance-card strong { font-size: 18px; }
.finance-card span { font-size: 30px; font-weight: 800; }
.finance-card small { opacity: .7; font-size: 12px; }
@media (max-width: 900px) {
  .finance-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .finance-cards-grid { grid-template-columns: 1fr; }
}

/* =====================================================
   GLASSMORPHISM DESIGN
   ===================================================== */

:root {
  --glass-bg: rgba(255, 255, 255, 0.07);
  --glass-bg-hover: rgba(255, 255, 255, 0.11);
  --glass-border: rgba(255, 255, 255, 0.16);
  --glass-border-light: rgba(255, 255, 255, 0.09);
  --glass-shadow:
    0 20px 55px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* ===== MAIN BACKGROUND ===== */

body {
  background:
    radial-gradient(
      circle at 10% 10%,
      rgba(90, 150, 220, 0.18),
      transparent 30%
    ),
    radial-gradient(
      circle at 90% 15%,
      rgba(150, 100, 210, 0.16),
      transparent 28%
    ),
    radial-gradient(
      circle at 75% 90%,
      rgba(60, 180, 190, 0.10),
      transparent 30%
    ),
    #07111f !important;
}

/* ===== APP ===== */

.app {
  background:
    radial-gradient(
      circle at 15% 10%,
      rgba(100, 160, 220, 0.10),
      transparent 28%
    ),
    transparent;
}

/* ===== SIDEBAR ===== */

.sidebar {
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.10),
      rgba(255, 255, 255, 0.035)
    ) !important;

  border: 1px solid var(--glass-border) !important;

  border-radius: 0 26px 26px 0 !important;

  backdrop-filter: blur(26px) saturate(145%) !important;
  -webkit-backdrop-filter: blur(26px) saturate(145%) !important;

  box-shadow:
    18px 0 55px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
}

/* ===== BRAND ===== */

.brand {
  border-bottom:
    1px solid var(--glass-border-light) !important;
}

.brand-logo,
.login-logo {
  border-radius: 20px !important;

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.16),
      rgba(255, 255, 255, 0.04)
    ) !important;

  border:
    1px solid rgba(255, 255, 255, 0.20) !important;

  backdrop-filter: blur(18px);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 12px 30px rgba(0, 0, 0, 0.18) !important;
}

/* ===== NAVIGATION ===== */

.nav-button {
  border-radius: 17px !important;

  border: 1px solid transparent !important;

  transition: all 0.25s ease !important;
}

.nav-button:hover {
  background:
    rgba(255, 255, 255, 0.075) !important;

  border-color:
    var(--glass-border-light) !important;

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.nav-button.active {
  background:
    linear-gradient(
      135deg,
      rgba(105, 155, 215, 0.22),
      rgba(145, 105, 200, 0.12)
    ) !important;

  border-color:
    rgba(190, 215, 245, 0.22) !important;

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    0 8px 25px rgba(0, 0, 0, 0.12) !important;
}

/* ===== TOPBAR ===== */

.topbar {
  background:
    rgba(7, 17, 31, 0.48) !important;

  border-bottom:
    1px solid var(--glass-border-light) !important;

  backdrop-filter:
    blur(24px) saturate(150%) !important;

  -webkit-backdrop-filter:
    blur(24px) saturate(150%) !important;

  box-shadow:
    0 10px 35px rgba(0, 0, 0, 0.10);
}

/* ===== ALL CARDS ===== */

.welcome-card,
.stat,
.payment-box,
.dashboard-panel,
.currency-card,
.form-card,
.table-card,
.settings-card,
.finance-card,
.finance-subnav,
.finance-summary,
.empty {
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.095),
      rgba(255, 255, 255, 0.035)
    ) !important;

  border:
    1px solid var(--glass-border) !important;

  border-radius:
    23px !important;

  backdrop-filter:
    blur(24px) saturate(145%) !important;

  -webkit-backdrop-filter:
    blur(24px) saturate(145%) !important;

  box-shadow:
    0 20px 55px rgba(0, 0, 0, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
}

/* ===== STAT CARDS ===== */

.stat {
  transition: all 0.25s ease;
}

.stat:hover {
  transform: translateY(-4px);

  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.10) !important;
}

/* ===== FORM ===== */

.form-card {
  padding: 28px !important;
}

.form-card-title {
  border-bottom:
    1px solid rgba(255, 255, 255, 0.09);

  padding-bottom: 18px;
}

/* ===== INPUTS ===== */

.field input,
.field select,
.field textarea {
  background:
    rgba(255, 255, 255, 0.055) !important;

  border:
    1px solid rgba(255, 255, 255, 0.15) !important;

  border-radius:
    16px !important;

  color:
    #eef5fc !important;

  backdrop-filter:
    blur(16px);

  -webkit-backdrop-filter:
    blur(16px);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05);

  transition:
    all 0.2s ease;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color:
    rgba(150, 195, 235, 0.42) !important;

  background:
    rgba(255, 255, 255, 0.09) !important;

  box-shadow:
    0 0 0 4px rgba(105, 155, 210, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* ===== BUTTONS ===== */

.primary-button {
  border-radius:
    16px !important;

  background:
    linear-gradient(
      135deg,
      rgba(105, 155, 215, 0.72),
      rgba(110, 90, 170, 0.62)
    ) !important;

  border:
    1px solid rgba(220, 235, 250, 0.22) !important;

  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
}

.secondary-button,
.edit-button,
.delete-button {
  border-radius:
    14px !important;

  background:
    rgba(255, 255, 255, 0.06) !important;

  border:
    1px solid rgba(255, 255, 255, 0.13) !important;

  backdrop-filter:
    blur(16px);
}

/* ===== TABLE ===== */

.table-card {
  overflow:
    hidden;

  border-radius:
    22px !important;
}

th {
  background:
    rgba(255, 255, 255, 0.075) !important;

  border-color:
    rgba(255, 255, 255, 0.09) !important;
}

td {
  border-color:
    rgba(255, 255, 255, 0.065) !important;
}

tr:hover td {
  background:
    rgba(255, 255, 255, 0.035) !important;
}

/* ===== SETTINGS ===== */

.settings-card {
  overflow:
    hidden;

  border-radius:
    25px !important;
}

.settings-header {
  background:
    rgba(255, 255, 255, 0.045) !important;

  border-bottom:
    1px solid rgba(255, 255, 255, 0.10);
}

.setting-row {
  transition:
    all 0.2s ease;
}

.setting-row:hover {
  background:
    rgba(255, 255, 255, 0.035);
}

/* ===== FINANCE ===== */

.finance-card {
  border-radius:
    22px !important;

  transition:
    all 0.25s ease;
}

.finance-card:hover {
  transform:
    translateY(-4px);

  border-color:
    rgba(210, 230, 250, 0.25) !important;

  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.20);
}

.finance-subnav {
  padding:
    8px !important;
}

.finance-subnav button {
  border-radius:
    14px !important;
}

.finance-subnav button.active,
.finance-subnav button:hover {
  background:
    rgba(255, 255, 255, 0.09) !important;

  border:
    1px solid rgba(255, 255, 255, 0.10);
}

/* ===== SEARCH ===== */

.global-search {
  background:
    rgba(255, 255, 255, 0.055) !important;

  border:
    1px solid rgba(255, 255, 255, 0.14) !important;

  border-radius:
    18px !important;

  backdrop-filter:
    blur(20px);

  -webkit-backdrop-filter:
    blur(20px);

  box-shadow:
    var(--glass-shadow);
}

.global-search input {
  background:
    transparent !important;

  color:
    #eef5fc !important;
}

/* ===== PAGE SEARCH / CREATE ===== */

.page-tools {
  display:
    flex;

  align-items:
    center;

  gap:
    14px;

  margin:
    0 28px 20px;

  position:
    relative;

  z-index:
    5;
}

.page-search {
  flex:
    1;

  position:
    relative;
}

.page-search input {
  width:
    100%;

  min-height:
    50px;

  padding:
    0 18px;

  border:
    1px solid var(--glass-border) !important;

  border-radius:
    18px !important;

  background:
    rgba(255, 255, 255, 0.065) !important;

  color:
    #eef5fc !important;

  backdrop-filter:
    blur(20px);

  -webkit-backdrop-filter:
    blur(20px);

  box-shadow:
    var(--glass-shadow);
}

.new-record-button {
  min-height:
    50px;

  padding:
    0 20px;

  border:
    1px solid rgba(190, 220, 250, 0.25);

  border-radius:
    17px;

  background:
    linear-gradient(
      135deg,
      rgba(105, 150, 205, 0.30),
      rgba(120, 95, 175, 0.18)
    );

  color:
    #f3f7fc;

  backdrop-filter:
    blur(18px);

  -webkit-backdrop-filter:
    blur(18px);

  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);

  font-weight:
    800;

  cursor:
    pointer;

  transition:
    all 0.22s ease;
}

.new-record-button:hover {
  transform:
    translateY(-2px);

  background:
    linear-gradient(
      135deg,
      rgba(115, 165, 225, 0.38),
      rgba(145, 115, 205, 0.24)
    );
}

/* ===== LOGIN ===== */

.login-page {
  min-height:
    100vh;

  display:
    grid;

  place-items:
    center;

  position:
    relative;

  overflow:
    hidden;

  background:
    radial-gradient(
      circle at 18% 20%,
      rgba(100, 155, 220, 0.18),
      transparent 30%
    ),
    radial-gradient(
      circle at 82% 18%,
      rgba(155, 105, 220, 0.16),
      transparent 28%
    ),
    #07111f !important;
}

.login-box {
  width:
    min(460px, calc(100vw - 32px));

  padding:
    42px !important;

  border-radius:
    32px !important;

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.13),
      rgba(255, 255, 255, 0.045)
    ) !important;

  border:
    1px solid rgba(255, 255, 255, 0.22) !important;

  backdrop-filter:
    blur(30px) saturate(160%) !important;

  -webkit-backdrop-filter:
    blur(30px) saturate(160%) !important;

  box-shadow:
    0 35px 90px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.13) !important;
}

.login-box .field input {
  min-height:
    54px !important;

  border-radius:
    17px !important;

  background:
    rgba(255, 255, 255, 0.07) !important;
}

.login-button {
  min-height:
    54px !important;

  border-radius:
    17px !important;
}

/* ===== LOGIN ERROR ===== */

.login-error {
  border-radius:
    15px !important;

  background:
    rgba(210, 75, 85, 0.12) !important;

  border:
    1px solid rgba(230, 120, 130, 0.24) !important;

  backdrop-filter:
    blur(14px);

  padding:
    12px 14px !important;
}

/* ===== PASSWORD BUTTON ===== */

.password-input-wrapper .password-toggle {
  border-radius:
    12px !important;

  background:
    rgba(255, 255, 255, 0.05) !important;

  border:
    1px solid rgba(255, 255, 255, 0.08) !important;

  color:
    #e7eef7 !important;
}

/* ===== TOP ACTION BUTTONS ===== */

.clock,
.refresh-button,
.theme-button,
.top-language,
.logout-button {
  background:
    rgba(255, 255, 255, 0.055) !important;

  border:
    1px solid rgba(255, 255, 255, 0.14) !important;

  backdrop-filter:
    blur(18px);

  -webkit-backdrop-filter:
    blur(18px);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
}

/* ===== MOBILE ===== */

@media (max-width: 700px) {
  .page-tools {
    margin:
      0 15px 16px;

    flex-direction:
      column;

    align-items:
      stretch;
  }

  .new-record-button {
    width:
      100%;
  }

  .login-box {
    width:
      calc(100vw - 24px) !important;

    padding:
      28px 20px !important;

    border-radius:
      27px !important;
  }
}



/* ================= FINAL UI ENHANCEMENTS ================= */

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.remember-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12px;
}

.remember-option input {
  width: 16px !important;
  min-height: 16px !important;
  height: 16px !important;
  margin: 0;
  padding: 0 !important;
}

.forgot-link {
  border: 0;
  background: transparent;
  color: #9dbbe0;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.forgot-link:hover {
  text-decoration: underline;
}

.forgot-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(3, 8, 15, 0.62);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.forgot-modal {
  width: min(430px, 100%);
  padding: 28px;
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,.18);
  background: linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.045));
  backdrop-filter: blur(28px) saturate(150%);
  -webkit-backdrop-filter: blur(28px) saturate(150%);
  box-shadow: 0 30px 80px rgba(0,0,0,.30);
}

.forgot-modal h2 {
  margin: 0 0 10px;
}

.forgot-modal p {
  margin: 0 0 20px;
  line-height: 1.8;
  opacity: .8;
  font-size: 13px;
}

.forgot-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.setting-check {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.setting-check input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.check-box {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255,255,255,.16);
  background: rgba(255,255,255,.05);
  font-size: 18px;
  font-weight: 900;
}

.setting-check.checked .check-box {
  background: rgba(105,155,215,.28);
  border-color: rgba(170,205,240,.34);
}

.receipt-button {
  min-width: 48px !important;
  min-height: 42px !important;
  padding: 8px 11px !important;
  border-radius: 12px !important;
  border: 1px solid rgba(255,255,255,.13) !important;
  background: rgba(255,255,255,.06) !important;
  color: inherit;
  cursor: pointer;
}

.receipt-button:hover {
  transform: translateY(-2px);
}

.expense-chart-panel {
  margin-top: 20px;
}

.expense-chart-list {
  display: grid;
  gap: 16px;
}

.expense-chart-row {
  display: grid;
  gap: 8px;
}

.expense-chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.expense-chart-head strong {
  font-size: 12px;
}

.expense-chart-head span {
  font-size: 12px;
  font-weight: 800;
}

.expense-chart-track {
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255,255,255,.06);
}

.expense-chart-bar {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(105,155,215,.75), rgba(145,115,205,.68));
  transition: width .35s ease;
}

.login-page.day .login-box {
  background: linear-gradient(145deg, rgba(255,255,255,.96), rgba(246,249,252,.92)) !important;
  border-color: #d8e1ea !important;
  box-shadow: 0 30px 80px rgba(50,70,90,.12) !important;
}

.login-page.day .login-box .field input {
  background: #fff !important;
  color: #172033 !important;
  border-color: #d3dee9 !important;
}

.login-page.day .forgot-link {
  color: #294d76;
}

@media (max-width: 700px) {
  .login-options {
    align-items: flex-start;
    flex-direction: column;
  }

  .forgot-modal {
    padding: 22px;
  }
}


/* =========================
   CLASSIC 7-COLOR BACKGROUND
   ========================= */

html,
body,
#root {
  min-height: 100%;
}

body {
  color-scheme: dark;
  background:
    radial-gradient(circle at 8% 12%, rgba(70, 94, 132, .20), transparent 22%),
    radial-gradient(circle at 26% 86%, rgba(112, 74, 96, .16), transparent 22%),
    radial-gradient(circle at 48% 18%, rgba(125, 105, 67, .13), transparent 20%),
    radial-gradient(circle at 72% 78%, rgba(76, 112, 105, .13), transparent 23%),
    radial-gradient(circle at 88% 22%, rgba(94, 83, 123, .15), transparent 20%),
    radial-gradient(circle at 60% 52%, rgba(86, 104, 139, .09), transparent 28%),
    radial-gradient(circle at 15% 55%, rgba(107, 93, 73, .08), transparent 25%),
    #07111f !important;
}

.app {
  min-height: 100vh;
  background:
    radial-gradient(circle at 8% 12%, rgba(70, 94, 132, .13), transparent 22%),
    radial-gradient(circle at 26% 86%, rgba(112, 74, 96, .10), transparent 22%),
    radial-gradient(circle at 48% 18%, rgba(125, 105, 67, .08), transparent 20%),
    radial-gradient(circle at 72% 78%, rgba(76, 112, 105, .09), transparent 23%),
    radial-gradient(circle at 88% 22%, rgba(94, 83, 123, .10), transparent 20%),
    transparent !important;
}

/* =========================
   A4 FORM PAGE
   ========================= */

.a4-form-page {
  width: min(794px, calc(100vw - 56px));
  min-height: 1123px;
  margin: 0 auto 28px;
  padding: 34px !important;
  border: 1px solid rgba(193, 208, 224, .26) !important;
  border-radius: 22px !important;
  position: relative;
}

.a4-form-page::before {
  content: "";
  position: absolute;
  inset: 14px;
  border: 1px solid rgba(190, 205, 220, .10);
  border-radius: 16px;
  pointer-events: none;
}

.a4-form-body {
  position: relative;
  z-index: 1;
}

.a4-form-page .form-card-title {
  display: flex;
  align-items: center;
  min-height: 48px;
  margin-bottom: 24px;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: .6px;
}

.a4-form-page .form-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.a4-form-page .field > span {
  font-size: 10px;
  color: #afbdd0 !important;
  font-weight: 700;
  letter-spacing: .8px;
}

.a4-form-page .field input,
.a4-form-page .field select,
.a4-form-page .field textarea {
  min-height: 50px;
  border: 1px solid rgba(180, 199, 220, .30) !important;
  border-radius: 12px !important;
  padding: 13px 14px !important;
  font-size: 13px !important;
}

.a4-form-page .field textarea {
  min-height: 150px;
}

.a4-form-page .form-actions {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.a4-form-page .secondary-button {
  margin-bottom: 20px;
}

.a4-form-page .primary-button,
.a4-form-page .secondary-button {
  min-height: 46px;
  padding: 0 20px;
  font-size: 12px;
}

.a4-form-page .password-input-wrapper {
  width: 100%;
}

.a4-form-page .password-input-wrapper .field {
  width: 100%;
}

/* =========================
   NATURAL EYE ICON
   ========================= */

.password-input-wrapper {
  position: relative;
  width: 100%;
}

.password-input-wrapper .password-toggle {
  position: absolute;
  right: 10px;
  bottom: 7px;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(190, 205, 220, .20) !important;
  border-radius: 11px !important;
  background: transparent !important;
  color: #aebed0 !important;
  cursor: pointer;
  z-index: 5;
  padding: 0;
  box-shadow: none !important;
}

.password-input-wrapper .password-toggle:hover {
  background: rgba(255, 255, 255, .07) !important;
  color: #eef5fc !important;
}

.password-input-wrapper .field input {
  padding-right: 58px !important;
}

.rtl .password-input-wrapper .password-toggle {
  right: auto;
  left: 10px;
}

.rtl .password-input-wrapper .field input {
  padding-right: 14px !important;
  padding-left: 58px !important;
}

.user-password-field {
  min-width: 0;
}

/* =========================
   CLEAR LINES / INPUT EDGES
   ========================= */

.field input,
.field select,
.field textarea,
.page-search input {
  border-color: rgba(180, 199, 220, .30) !important;
}

.field input:hover,
.field select:hover,
.field textarea:hover,
.page-search input:hover {
  border-color: rgba(191, 210, 231, .42) !important;
}

.field input:focus,
.field select:focus,
.field textarea:focus,
.page-search input:focus {
  border-color: rgba(135, 180, 225, .72) !important;
  box-shadow:
    0 0 0 3px rgba(99, 145, 192, .10),
    inset 0 1px 0 rgba(255, 255, 255, .08) !important;
}

/* =========================
   LIGHT / WHITE MODE
   ========================= */

.app.day,
.login-page.day {
  color-scheme: light;
  background:
    radial-gradient(circle at 8% 12%, rgba(78, 102, 142, .13), transparent 22%),
    radial-gradient(circle at 26% 86%, rgba(132, 87, 108, .10), transparent 22%),
    radial-gradient(circle at 48% 18%, rgba(158, 128, 68, .08), transparent 20%),
    radial-gradient(circle at 72% 78%, rgba(79, 121, 112, .08), transparent 23%),
    radial-gradient(circle at 88% 22%, rgba(101, 87, 132, .09), transparent 20%),
    radial-gradient(circle at 60% 52%, rgba(92, 112, 145, .07), transparent 28%),
    radial-gradient(circle at 15% 55%, rgba(120, 104, 83, .06), transparent 25%),
    #f7f9fc !important;
}

.app.day {
  background:
    radial-gradient(circle at 8% 12%, rgba(78, 102, 142, .10), transparent 22%),
    radial-gradient(circle at 26% 86%, rgba(132, 87, 108, .07), transparent 22%),
    radial-gradient(circle at 48% 18%, rgba(158, 128, 68, .06), transparent 20%),
    radial-gradient(circle at 72% 78%, rgba(79, 121, 112, .06), transparent 23%),
    radial-gradient(circle at 88% 22%, rgba(101, 87, 132, .07), transparent 20%),
    #f7f9fc !important;
}

.app.day .sidebar {
  background: rgba(255,255,255,.88) !important;
  border-color: #c7d2dd !important;
}

.app.day .topbar {
  background: rgba(255,255,255,.78) !important;
  border-bottom-color: #c8d3de !important;
}

.app.day .form-card,
.app.day .table-card,
.app.day .settings-card,
.app.day .dashboard-panel,
.app.day .currency-card,
.app.day .stat,
.app.day .welcome-card,
.app.day .empty,
.app.day .finance-subnav {
  background: rgba(255,255,255,.88) !important;
  border-color: #becbd7 !important;
}

.app.day .a4-form-page {
  background: rgba(255,255,255,.95) !important;
  border-color: #aebdca !important;
  box-shadow: 0 22px 60px rgba(48, 68, 90, .12) !important;
}

.app.day .a4-form-page::before {
  border-color: #d3dce5 !important;
}

.app.day .a4-form-page .form-card-title {
  border-bottom-color: #c2ced9 !important;
}

.app.day .a4-form-page .field > span {
  color: #536477 !important;
}

.app.day .a4-form-page .field input,
.app.day .a4-form-page .field select,
.app.day .a4-form-page .field textarea,
.app.day .field input,
.app.day .field select,
.app.day .field textarea {
  background: #ffffff !important;
  color: #172033 !important;
  border-color: #adbcc9 !important;
}

.app.day .a4-form-page .field input:hover,
.app.day .a4-form-page .field select:hover,
.app.day .a4-form-page .field textarea:hover,
.app.day .field input:hover,
.app.day .field select:hover,
.app.day .field textarea:hover {
  border-color: #8398ab !important;
}

.app.day .field input:focus,
.app.day .field select:focus,
.app.day .field textarea:focus,
.app.day .page-search input:focus {
  border-color: #557b9f !important;
  box-shadow:
    0 0 0 3px rgba(77, 115, 150, .12),
    inset 0 1px 0 rgba(255,255,255,.90) !important;
}

.app.day th {
  background: #edf2f6 !important;
  color: #33465a !important;
  border-color: #b9c7d3 !important;
}

.app.day td {
  color: #35475a !important;
  border-color: #ccd6df !important;
}

.app.day tr:hover td {
  background: #f5f8fa !important;
}

.app.day .section-title h2,
.app.day .form-card-title,
.app.day .page-title h1,
.app.day .setting-row strong,
.app.day .stat strong,
.app.day .recent-row strong {
  color: #172033 !important;
}

.app.day .section-title span,
.app.day .field > span,
.app.day .settings-header p,
.app.day .setting-row small,
.app.day .recent-row small,
.app.day .stat small,
.app.day .page-title p {
  color: #5f7082 !important;
}

.app.day .password-input-wrapper .password-toggle {
  color: #53677b !important;
  border-color: #b6c4d1 !important;
}

.app.day .password-input-wrapper .password-toggle:hover {
  background: #eef3f7 !important;
  color: #1d3d5d !important;
}

.app.day .page-search input {
  background: #ffffff !important;
  color: #172033 !important;
  border-color: #adbcc9 !important;
}

.app.day .finance-subnav button {
  color: #344a5f !important;
}

.app.day .finance-subnav button:hover,
.app.day .finance-subnav button.active {
  background: #eaf0f5 !important;
  border-color: #c5d0da !important;
}

.app.day .primary-button {
  color: #ffffff !important;
}

.app.day .secondary-button {
  background: #f0f4f7 !important;
  color: #32485c !important;
  border-color: #b9c6d1 !important;
}

/* =========================
   LOGIN WHITE MODE + LINES
   ========================= */

.login-page.day {
  background:
    radial-gradient(circle at 8% 12%, rgba(78, 102, 142, .13), transparent 22%),
    radial-gradient(circle at 26% 86%, rgba(132, 87, 108, .10), transparent 22%),
    radial-gradient(circle at 48% 18%, rgba(158, 128, 68, .08), transparent 20%),
    radial-gradient(circle at 72% 78%, rgba(79, 121, 112, .08), transparent 23%),
    radial-gradient(circle at 88% 22%, rgba(101, 87, 132, .09), transparent 20%),
    radial-gradient(circle at 60% 52%, rgba(92, 112, 145, .07), transparent 28%),
    #f7f9fc !important;
}

.login-page.day .login-box {
  background: rgba(255,255,255,.93) !important;
  border-color: #b4c1cd !important;
  box-shadow: 0 25px 80px rgba(44, 62, 82, .16) !important;
}

.login-page.day .login-box .field > span {
  color: #536477 !important;
}

.login-page.day .login-box .field input {
  background: #ffffff !important;
  color: #172033 !important;
  border-color: #adbcc9 !important;
}

.login-page.day .login-box .field input:focus {
  border-color: #557b9f !important;
}

.login-page.day .password-input-wrapper .password-toggle {
  color: #53677b !important;
  border-color: #b6c4d1 !important;
  background: transparent !important;
}

.login-page.day .remember-option,
.login-page.day .login-box,
.login-page.day .login-box p {
  color: #26394c !important;
}

.login-page.day .forgot-link {
  color: #315b82 !important;
}

.login-page.day .login-error {
  background: #fff1f2 !important;
  color: #a63d49 !important;
  border-color: #e2aeb6 !important;
}

.login-page.day .login-language button {
  color: #43576a !important;
  border-color: #c0ccd7 !important;
}

.login-page.day .login-language button.selected {
  background: #e8eef4 !important;
  color: #203e58 !important;
}

/* =========================
   FORGOT MODAL
   ========================= */

.forgot-modal {
  max-width: 470px !important;
  border: 1px solid rgba(190, 205, 220, .30) !important;
}

.forgot-modal .field input {
  min-height: 50px;
}

.forgot-modal-actions {
  align-items: center;
}

/* =========================
   PRINT A4
   ========================= */

@media print {
  @page {
    size: A4 portrait;
    margin: 10mm;
  }

  body {
    background: #fff !important;
  }

  .sidebar,
  .topbar,
  .page-tools,
  .secondary-button,
  .form-actions .secondary-button,
  .toast {
    display: none !important;
  }

  .main,
  .content {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    max-width: none !important;
  }

  .a4-form-page {
    width: 190mm !important;
    min-height: 277mm !important;
    max-width: none !important;
    margin: 0 auto !important;
    padding: 12mm !important;
    background: #fff !important;
    color: #111 !important;
    box-shadow: none !important;
    border: 1px solid #c3c9cf !important;
  }

  .a4-form-page::before {
    display: none !important;
  }

  .a4-form-page .field input,
  .a4-form-page .field select,
  .a4-form-page .field textarea {
    border-color: #9ca7b1 !important;
    color: #111 !important;
    background: #fff !important;
  }
}

/* =========================
   RESPONSIVE A4
   ========================= */

@media (max-width: 900px) {
  .a4-form-page {
    width: calc(100vw - 36px);
    min-height: auto;
  }
}

@media (max-width: 700px) {
  .a4-form-page {
    width: calc(100vw - 24px);
    padding: 22px !important;
  }

  .a4-form-page .form-grid {
    grid-template-columns: 1fr;
  }

  .a4-form-page .form-actions {
    grid-column: 1;
  }

  .page-tools {
    margin-left: 15px !important;
    margin-right: 15px !important;
  }
}


/* =========================
   EMPLOYEE / CONTRACT / EXPORT TOOLS
   ========================= */
.page-tool-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tool-button {
  min-height: 50px;
  padding: 0 16px;
  border-radius: 16px;
  border: 1px solid rgba(190,220,250,.20);
  background: rgba(255,255,255,.06);
  color: inherit;
  font-weight: 800;
  cursor: pointer;
}

.tool-button:hover {
  transform: translateY(-2px);
}

.photo-field input[type="file"] {
  padding: 10px !important;
}

.photo-preview {
  margin-top: 8px;
  width: 120px;
  height: 120px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(180,199,220,.35);
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.table-avatar {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid rgba(180,199,220,.35);
}

.avatar-placeholder {
  display: inline-grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  border: 1px dashed rgba(180,199,220,.35);
  opacity: .7;
}

.contract-status {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  border: 1px solid rgba(180,199,220,.25);
}

.contract-status.ending-soon {
  background: rgba(225,170,65,.16);
  border-color: rgba(225,170,65,.35);
}

.contract-status.expired {
  background: rgba(210,75,85,.15);
  border-color: rgba(210,75,85,.35);
}

.contract-status.normal {
  background: rgba(75,170,125,.14);
  border-color: rgba(75,170,125,.30);
}

html, body, #root {
  min-height: 100%;
  overflow-x: hidden;
  overflow-y: auto !important;
}

body, .app {
  overflow-y: hidden !important;
}

.main {
  min-height: 0 !important;
  height: 100vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  scrollbar-width: auto;
}

.content {
  min-height: 0 !important;
  overflow: visible !important;
}

.table-scroll {
  max-width: 100%;
  max-height: 62vh;
  overflow-x: auto !important;
  overflow-y: auto !important;
  scrollbar-width: auto;
}

.main::-webkit-scrollbar,
.table-scroll::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.main::-webkit-scrollbar-thumb,
.table-scroll::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgba(130, 150, 175, 0.45);
  border: 2px solid transparent;
  background-clip: padding-box;
}

.main::-webkit-scrollbar-track,
.table-scroll::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.04);
  border-radius: 10px;
}

.app.day .tool-button {
  background: #f2f6f9;
  color: #30465b;
  border-color: #b7c5d1;
}

@media (max-width: 700px) {
  .page-tool-actions {
    width: 100%;
  }

  .page-tool-actions > * {
    flex: 1;
  }
}

/* =====================================================
   SIDEBAR COLLAPSE + ROLE + FULL GLASSMORPHISM OVERRIDES
   ===================================================== */

.sidebar {
  width: 255px !important;
  overflow-x: hidden !important;
  transition:
    width .28s ease,
    transform .28s ease,
    border-radius .28s ease,
    box-shadow .28s ease !important;
}

.brand {
  position: relative !important;
  min-height: 54px !important;
  padding-right: 48px !important;
}

.brand-copy {
  display: flex !important;
  flex-direction: column !important;
  gap: 2px !important;
  min-width: 0 !important;
}

.sidebar-toggle {
  position: absolute !important;
  top: 8px !important;
  right: 0 !important;
  width: 38px !important;
  height: 38px !important;
  display: grid !important;
  place-items: center !important;
  border-radius: 12px !important;
  border: 1px solid rgba(255,255,255,.18) !important;
  background: linear-gradient(145deg, rgba(255,255,255,.14), rgba(255,255,255,.04)) !important;
  color: inherit !important;
  font-size: 25px !important;
  line-height: 1 !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 8px 22px rgba(0,0,0,.14) !important;
  backdrop-filter: blur(16px) saturate(145%) !important;
  -webkit-backdrop-filter: blur(16px) saturate(145%) !important;
}

.rtl .brand {
  padding-right: 8px !important;
  padding-left: 48px !important;
}

.rtl .sidebar-toggle {
  right: auto !important;
  left: 0 !important;
}

.sidebar-profile {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  margin: 16px 3px 10px !important;
  padding: 10px 11px !important;
  min-height: 62px !important;
  border-radius: 17px !important;
  border: 1px solid rgba(255,255,255,.15) !important;
  background: linear-gradient(145deg, rgba(255,255,255,.10), rgba(255,255,255,.035)) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 14px 32px rgba(0,0,0,.13) !important;
  backdrop-filter: blur(20px) saturate(145%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(145%) !important;
}

.sidebar-profile-avatar {
  width: 40px !important;
  height: 40px !important;
  flex: 0 0 40px !important;
  display: grid !important;
  place-items: center !important;
  border-radius: 13px !important;
  font-weight: 900 !important;
  color: #f3f7ff !important;
  background: linear-gradient(135deg, rgba(81,160,255,.58), rgba(177,101,235,.42)) !important;
  border: 1px solid rgba(255,255,255,.22) !important;
  box-shadow: 0 10px 24px rgba(82,122,200,.20), inset 0 1px 0 rgba(255,255,255,.16) !important;
}

.sidebar-profile-info {
  min-width: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
}

.sidebar-profile-info strong {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  font-size: 12px !important;
}

.sidebar-profile-info span {
  width: fit-content !important;
  padding: 3px 8px !important;
  border-radius: 999px !important;
  font-size: 9px !important;
  font-weight: 800 !important;
  text-transform: uppercase !important;
  letter-spacing: .7px !important;
  background: linear-gradient(135deg, rgba(109,164,235,.22), rgba(171,111,208,.16)) !important;
  border: 1px solid rgba(190,215,245,.20) !important;
}

.app.sidebar-collapsed .sidebar {
  width: 82px !important;
}

.app.sidebar-collapsed .main {
  width: calc(100% - 82px) !important;
  margin-left: 82px !important;
}

.app.sidebar-collapsed.rtl .main {
  width: calc(100% - 82px) !important;
  margin-left: 0 !important;
  margin-right: 82px !important;
}

.app.sidebar-collapsed .brand {
  justify-content: center !important;
  padding: 0 0 18px !important;
}

.app.sidebar-collapsed .brand-copy,
.app.sidebar-collapsed .sidebar-profile-info,
.app.sidebar-collapsed .nav-label,
.app.sidebar-collapsed .finance-subnav,
.app.sidebar-collapsed .logout-button {
  display: none !important;
}

.app.sidebar-collapsed .sidebar-toggle {
  top: 8px !important;
  right: -1px !important;
}

.app.sidebar-collapsed.rtl .sidebar-toggle {
  right: auto !important;
  left: -1px !important;
}

.app.sidebar-collapsed .sidebar-profile {
  justify-content: center !important;
  padding: 10px 7px !important;
}

.app.sidebar-collapsed .nav-button {
  justify-content: center !important;
  padding: 13px 8px !important;
  min-height: 48px !important;
}

.app.sidebar-collapsed .nav-button .nav-icon {
  width: 28px !important;
  font-size: 18px !important;
}

.app.sidebar-collapsed .nav-button:hover::after {
  content: attr(title);
  position: absolute;
  left: 70px;
  padding: 7px 10px;
  border-radius: 10px;
  white-space: nowrap;
  z-index: 9999;
  background: rgba(10,18,31,.90);
  border: 1px solid rgba(255,255,255,.16);
  box-shadow: 0 15px 30px rgba(0,0,0,.22);
  backdrop-filter: blur(12px);
}

.rtl.app.sidebar-collapsed .nav-button:hover::after {
  left: auto;
  right: 70px;
}

/* Every authenticated page gets the same glass/gradient surface. */
.content,
.page-title,
.page-tools,
.global-search,
.form-card,
.table-card,
.dashboard-panel,
.welcome-card,
.stat,
.payment-box,
.currency-card,
.settings-card,
.finance-card,
.finance-summary,
.empty,
.login-box,
.modal,
.modal-card,
.search-card,
.chart-card,
.quick-action,
.payment-summary {
  background:
    linear-gradient(145deg, rgba(255,255,255,.115), rgba(255,255,255,.035)) !important;
  border: 1px solid rgba(255,255,255,.15) !important;
  box-shadow:
    0 22px 60px rgba(0,0,0,.17),
    inset 0 1px 0 rgba(255,255,255,.09) !important;
  backdrop-filter: blur(24px) saturate(145%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(145%) !important;
}

.content {
  position: relative !important;
  margin: 24px 28px 40px !important;
  border-radius: 28px !important;
  overflow: visible !important;
}

.content::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  pointer-events: none !important;
  border-radius: 28px !important;
  background:
    radial-gradient(circle at 8% 12%, rgba(83,150,255,.12), transparent 22%),
    radial-gradient(circle at 90% 18%, rgba(178,103,228,.11), transparent 24%),
    radial-gradient(circle at 62% 88%, rgba(52,188,192,.07), transparent 25%) !important;
}

.page-title {
  padding: 24px 26px !important;
  margin-bottom: 18px !important;
  border-radius: 24px !important;
}

.page-tools,
.global-search {
  border-radius: 22px !important;
  padding: 10px 14px !important;
}

.field input,
.field select,
.field textarea,
.global-search input,
.page-search input,
.login-box input,
.login-box select {
  background: linear-gradient(145deg, rgba(255,255,255,.10), rgba(255,255,255,.035)) !important;
  border: 1px solid rgba(255,255,255,.16) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
}

button:not(.nav-button):not(.sidebar-toggle),
.tool-button,
.new-record-button,
.login-button,
.secondary-button {
  background-image: linear-gradient(135deg, rgba(105,155,215,.18), rgba(163,105,211,.12)) !important;
  border-color: rgba(193,217,245,.20) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 9px 24px rgba(0,0,0,.10) !important;
}

.table-card,
.form-card,
.dashboard-panel,
.finance-card,
.settings-card,
.payment-box,
.stat,
.welcome-card {
  overflow: hidden !important;
}

.sidebar,
.topbar,
.content,
.page-tools,
.global-search,
.table-card,
.form-card,
.dashboard-panel,
.stat,
.finance-card,
.settings-card,
.payment-box,
.welcome-card,
.login-box {
  animation: glassFadeIn .35s ease both;
}

@keyframes glassFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 900px) {
  .app.sidebar-collapsed .sidebar {
    width: 76px !important;
  }

  .app.sidebar-collapsed .main,
  .app.sidebar-collapsed.rtl .main {
    width: calc(100% - 76px) !important;
    margin-left: 76px !important;
    margin-right: 0 !important;
  }

  .app.sidebar-collapsed.rtl .main {
    margin-left: 0 !important;
    margin-right: 76px !important;
  }
}

@media (max-width: 650px) {
  .app.sidebar-collapsed .sidebar,
  .app.sidebar-collapsed .rtl .sidebar {
    width: 100% !important;
  }

  .app.sidebar-collapsed .main,
  .app.sidebar-collapsed.rtl .main {
    width: 100% !important;
    margin: 0 !important;
  }

  .app.sidebar-collapsed .brand-copy,
  .app.sidebar-collapsed .sidebar-profile-info,
  .app.sidebar-collapsed .nav-label,
  .app.sidebar-collapsed .finance-subnav,
  .app.sidebar-collapsed .logout-button {
    display: initial !important;
  }

  .app.sidebar-collapsed .sidebar-profile-info,
  .app.sidebar-collapsed .nav-label {
    display: inline !important;
  }
}


/* =========================================================
   FINAL SKY-BLUE + SOFT-LAVENDER GLASS THEME
   ========================================================= */

html, body, #root {
  min-height: 100% !important;
}

body {
  background:
    radial-gradient(circle at 9% 10%, rgba(143, 202, 255, .20), transparent 28%),
    radial-gradient(circle at 88% 14%, rgba(194, 168, 255, .18), transparent 27%),
    radial-gradient(circle at 78% 84%, rgba(174, 213, 255, .13), transparent 28%),
    #091527 !important;
  color: #edf5ff;
  overflow-x: hidden !important;
}

.app {
  background:
    radial-gradient(circle at 10% 12%, rgba(135, 201, 255, .11), transparent 28%),
    radial-gradient(circle at 90% 16%, rgba(192, 164, 255, .10), transparent 26%),
    radial-gradient(circle at 74% 86%, rgba(169, 210, 255, .08), transparent 28%),
    transparent !important;
  min-height: 100vh !important;
}

.app.day,
.login-page.day {
  background:
    radial-gradient(circle at 8% 12%, rgba(130, 200, 255, .28), transparent 29%),
    radial-gradient(circle at 90% 13%, rgba(199, 174, 255, .24), transparent 28%),
    radial-gradient(circle at 72% 86%, rgba(156, 214, 255, .20), transparent 29%),
    linear-gradient(135deg, #eef8ff 0%, #f5f0ff 52%, #edf6ff 100%) !important;
  color: #233b56 !important;
}

.app.day .sidebar,
.app.day .topbar,
.app.day .form-card,
.app.day .table-card,
.app.day .settings-card,
.app.day .dashboard-panel,
.app.day .currency-card,
.app.day .stat,
.app.day .welcome-card,
.app.day .empty,
.app.day .finance-subnav,
.app.day .payment-box,
.app.day .finance-card {
  background: linear-gradient(135deg, rgba(255,255,255,.78), rgba(236,246,255,.67), rgba(246,239,255,.64)) !important;
  border: 1.5px solid rgba(125, 169, 211, .52) !important;
  box-shadow: 0 18px 50px rgba(91, 135, 178, .10), inset 0 1px 0 rgba(255,255,255,.88) !important;
  backdrop-filter: blur(24px) saturate(145%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(145%) !important;
}

.app:not(.day) .sidebar,
.app:not(.day) .topbar,
.app:not(.day) .form-card,
.app:not(.day) .table-card,
.app:not(.day) .settings-card,
.app:not(.day) .dashboard-panel,
.app:not(.day) .currency-card,
.app:not(.day) .stat,
.app:not(.day) .welcome-card,
.app:not(.day) .empty,
.app:not(.day) .finance-subnav,
.app:not(.day) .payment-box,
.app:not(.day) .finance-card {
  background: linear-gradient(135deg, rgba(104, 166, 218, .13), rgba(152, 130, 216, .10), rgba(176, 218, 255, .07)) !important;
  border: 1.5px solid rgba(154, 199, 239, .27) !important;
  box-shadow: 0 20px 56px rgba(1, 8, 22, .18), inset 0 1px 0 rgba(225,241,255,.10) !important;
  backdrop-filter: blur(24px) saturate(150%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(150%) !important;
}

/* The login screen gets the same glass finish in both modes. */
.login-page {
  min-height: 100vh !important;
  background:
    radial-gradient(circle at 12% 12%, rgba(136, 203, 255, .20), transparent 29%),
    radial-gradient(circle at 86% 17%, rgba(193, 166, 255, .18), transparent 27%),
    radial-gradient(circle at 76% 88%, rgba(163, 215, 255, .13), transparent 28%),
    #091527 !important;
}

.login-page .login-box {
  background: linear-gradient(140deg, rgba(153, 205, 255, .16), rgba(193, 169, 255, .12), rgba(255,255,255,.055)) !important;
  border: 1.5px solid rgba(180, 218, 255, .36) !important;
  border-radius: 28px !important;
  box-shadow: 0 30px 90px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.18) !important;
  backdrop-filter: blur(30px) saturate(155%) !important;
  -webkit-backdrop-filter: blur(30px) saturate(155%) !important;
}

.login-page.day .login-box {
  background: linear-gradient(140deg, rgba(255,255,255,.86), rgba(225,242,255,.78), rgba(242,232,255,.75)) !important;
  border: 1.5px solid rgba(122, 166, 210, .56) !important;
  box-shadow: 0 30px 85px rgba(97, 132, 171, .18), inset 0 1px 0 rgba(255,255,255,.9) !important;
  backdrop-filter: blur(30px) saturate(155%) !important;
  -webkit-backdrop-filter: blur(30px) saturate(155%) !important;
}

/* Clearer form fields and borders. */
.field input,
.field select,
.field textarea,
.page-search input,
.global-search input,
.login-box input,
.login-box select {
  border: 1.75px solid rgba(157, 197, 235, .52) !important;
  border-radius: 13px !important;
}

.app:not(.day) .field input,
.app:not(.day) .field select,
.app:not(.day) .field textarea,
.login-page:not(.day) .login-box input {
  background: linear-gradient(135deg, rgba(180, 218, 255, .10), rgba(205, 185, 255, .08)) !important;
  color: #f2f7ff !important;
  border-color: rgba(160, 206, 250, .42) !important;
}

.app.day .field input,
.app.day .field select,
.app.day .field textarea,
.app.day .page-search input,
.login-page.day .login-box input {
  background: rgba(255,255,255,.83) !important;
  color: #253d57 !important;
  border-color: #9bbddd !important;
}

.field input:focus,
.field select:focus,
.field textarea:focus,
.page-search input:focus,
.global-search input:focus,
.login-box input:focus {
  outline: none !important;
  border-color: #8cc9ff !important;
  box-shadow: 0 0 0 4px rgba(137, 196, 255, .20), 0 0 0 1px rgba(183, 157, 255, .15) !important;
}

/* Larger, bolder buttons and visible outlines. */
.primary-button,
.secondary-button,
.new-record-button,
.tool-button,
.edit-button,
.delete-button,
.receipt-button,
.action-buttons button,
.page-tool-actions button,
.login-button,
.language-choice button,
.theme-choice button {
  min-height: 46px !important;
  padding: 11px 18px !important;
  border: 1.75px solid rgba(151, 196, 239, .56) !important;
  border-radius: 13px !important;
  font-size: 14px !important;
  font-weight: 800 !important;
  line-height: 1.35 !important;
}

.primary-button,
.new-record-button,
.login-button {
  background: linear-gradient(135deg, rgba(112, 184, 242, .76), rgba(169, 143, 232, .66)) !important;
  color: #fff !important;
  border-color: rgba(198, 225, 252, .76) !important;
  box-shadow: 0 10px 25px rgba(87, 145, 203, .16), inset 0 1px 0 rgba(255,255,255,.30) !important;
}

.secondary-button,
.tool-button,
.edit-button,
.delete-button,
.receipt-button {
  background: linear-gradient(135deg, rgba(153, 205, 255, .18), rgba(194, 172, 255, .14)) !important;
  border-color: rgba(143, 188, 230, .50) !important;
  color: inherit !important;
}

.app.day .primary-button,
.app.day .new-record-button,
.app.day .login-button {
  color: #fff !important;
}

.action-buttons {
  gap: 9px !important;
  min-width: 160px !important;
}

.action-buttons button {
  min-width: 72px !important;
  font-size: 13px !important;
  border-width: 1.75px !important;
}

/* Ensure the complete app can scroll vertically, including tall A4 forms. */
html, body, #root {
  min-height: 100% !important;
  overflow-x: hidden !important;
}

body, .app {
  overflow-y: visible !important;
}

.app {
  min-height: 100vh !important;
  height: auto !important;
}

.main {
  min-height: 100vh !important;
  height: auto !important;
  overflow: visible !important;
  overflow-x: hidden !important;
}

.content {
  overflow: visible !important;
  padding-bottom: 70px !important;
}

.form-card {
  max-height: none !important;
  overflow: visible !important;
  scroll-margin-top: 24px !important;
}

.table-scroll {
  overflow-x: auto !important;
  overflow-y: visible !important;
  scrollbar-width: auto;
}

.table-scroll::-webkit-scrollbar,
.main::-webkit-scrollbar,
body::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.table-scroll::-webkit-scrollbar-thumb,
.main::-webkit-scrollbar-thumb,
body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #9bd3ff, #c5adf6);
  border: 3px solid transparent;
  background-clip: padding-box;
  border-radius: 999px;
}

.table-scroll::-webkit-scrollbar-track,
.main::-webkit-scrollbar-track,
body::-webkit-scrollbar-track {
  background: rgba(131, 181, 224, .10);
  border-radius: 999px;
}

/* Image uploader at the top of each record form, with framed preview. */
.form-grid > .photo-field:first-child {
  grid-column: 1 / -1 !important;
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) 180px;
  align-items: center;
  gap: 8px 18px;
  padding: 17px;
  border: 1.75px dashed rgba(139, 189, 236, .60);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(150, 206, 255, .12), rgba(202, 181, 255, .10));
}

.form-grid > .photo-field:first-child > span,
.form-grid > .photo-field:first-child > input {
  grid-column: 1;
}

.photo-field input[type="file"] {
  min-height: 48px !important;
  padding: 10px !important;
  width: 100%;
  max-width: 100%;
}

.photo-preview {
  grid-column: 2;
  grid-row: 1 / span 3;
  justify-self: center;
  margin: 0 !important;
  width: 160px !important;
  height: 160px !important;
  border: 2px solid rgba(142, 192, 239, .72) !important;
  border-radius: 20px !important;
  overflow: hidden;
  padding: 4px;
  background: linear-gradient(135deg, rgba(168, 216, 255, .42), rgba(209, 190, 255, .40));
  box-shadow: 0 10px 28px rgba(89, 145, 199, .16), inset 0 1px 0 rgba(255,255,255,.55);
}

.photo-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

.table-avatar,
.avatar-placeholder {
  width: 54px !important;
  height: 54px !important;
  border: 2px solid rgba(143, 190, 234, .58) !important;
  border-radius: 15px !important;
  object-fit: cover;
}

.setting-row {
  border-bottom: 1.5px solid rgba(144, 190, 233, .22) !important;
  padding: 20px 24px !important;
  gap: 18px;
}

.setting-check {
  min-height: 42px;
  gap: 11px;
}

.check-box {
  width: 34px !important;
  height: 34px !important;
  border: 2px solid rgba(142, 189, 233, .68) !important;
  background: rgba(151, 206, 255, .12) !important;
  font-size: 20px !important;
}

.setting-check.checked .check-box {
  background: linear-gradient(135deg, rgba(117, 189, 247, .45), rgba(184, 154, 241, .40)) !important;
  border-color: #98c9f4 !important;
}

.settings-header {
  border-bottom: 1.5px solid rgba(142, 190, 235, .28) !important;
}

.app.day .settings-header,
.app.day .setting-row {
  border-color: rgba(115, 161, 204, .35) !important;
}

/* Mobile-friendly image header layout. */
@media (max-width: 650px) {
  .form-grid > .photo-field:first-child {
    grid-template-columns: 1fr !important;
  }

  .form-grid > .photo-field:first-child > span,
  .form-grid > .photo-field:first-child > input,
  .photo-preview {
    grid-column: 1 !important;
    grid-row: auto !important;
  }

  .photo-preview {
    width: 145px !important;
    height: 145px !important;
    justify-self: start;
  }

  .rtl .photo-preview {
    justify-self: end;
  }

  .primary-button,
  .secondary-button,
  .new-record-button,
  .tool-button,
  .edit-button,
  .delete-button,
  .receipt-button {
    min-height: 44px !important;
    padding: 10px 13px !important;
    font-size: 13px !important;
  }
}


/* FINAL GLOBAL REDESIGN: SKY BLUE + SOFT LAVENDER GLASS */
:root {
  color-scheme: light;
  --om-ink: #263e5b;
  --om-muted: #657d98;
  --om-border: rgba(112,157,204,.46);
  --om-shadow: 0 16px 42px rgba(76,116,164,.12);
}
html, body, #root { min-height:100% !important; width:100%; overflow-x:hidden !important; }
body:has(.app.day), body:has(.login-page.day) {
  background:
    radial-gradient(ellipse at 8% 7%, rgba(133,202,255,.46), transparent 32%),
    radial-gradient(ellipse at 91% 10%, rgba(199,177,255,.40), transparent 31%),
    radial-gradient(ellipse at 75% 88%, rgba(159,218,255,.34), transparent 32%),
    linear-gradient(135deg,#edf7ff 0%,#f6f1ff 51%,#eaf5ff 100%) !important;
  color:var(--om-ink) !important;
  overflow-y:auto !important;
}
.app.day {
  min-height:100vh !important; height:auto !important; overflow:visible !important;
  color:var(--om-ink) !important;
  background:
    radial-gradient(ellipse at 7% 9%,rgba(134,202,255,.24),transparent 30%),
    radial-gradient(ellipse at 91% 15%,rgba(198,176,255,.22),transparent 28%),
    linear-gradient(135deg,#edf7ff 0%,#f7f2ff 52%,#edf6ff 100%) !important;
}
.app.day .main,.app.day .content { background:transparent !important; color:var(--om-ink) !important; height:auto !important; min-height:100vh !important; overflow:visible !important; }
.app.day .content { margin:20px 24px 38px !important; padding:22px !important; border:1px solid rgba(133,176,220,.34) !important; border-radius:28px !important; background:rgba(255,255,255,.20) !important; box-shadow:0 16px 44px rgba(95,139,184,.07) !important; }
.app.day .sidebar,.app.day .topbar,.app.day .page-title,.app.day .page-tools,.app.day .global-search,
.app.day .form-card,.app.day .table-card,.app.day .settings-card,.app.day .dashboard-panel,.app.day .currency-card,
.app.day .stat,.app.day .welcome-card,.app.day .empty,.app.day .finance-subnav,.app.day .payment-box,
.app.day .finance-card,.app.day .payment-summary,.app.day .expense-chart-panel,.app.day .warning-card,
.app.day .forgot-modal,.app.day .modal,.app.day .modal-card,.app.day .search-card,.app.day .chart-card,
.app.day .quick-action,.app.day .quick-actions,.app.day .quick-buttons {
  color:var(--om-ink) !important;
  background:linear-gradient(135deg,rgba(255,255,255,.90),rgba(236,246,255,.82) 54%,rgba(246,239,255,.78)) !important;
  border:1.5px solid var(--om-border) !important; border-radius:22px !important;
  box-shadow:var(--om-shadow),inset 0 1px 0 rgba(255,255,255,.95) !important;
  backdrop-filter:blur(22px) saturate(140%) !important; -webkit-backdrop-filter:blur(22px) saturate(140%) !important;
}
.app.day .sidebar { background:linear-gradient(160deg,rgba(225,242,255,.97),rgba(244,238,255,.94)) !important; border-color:rgba(117,165,211,.56) !important; }
.app.day .topbar { background:rgba(246,250,255,.88) !important; }
.app.day .brand,.app.day .sidebar-profile,.app.day .settings-header,.app.day .form-card-title { border-color:rgba(123,166,207,.36) !important; }
.app.day .brand-copy strong,.app.day .brand-copy small,.app.day .sidebar-profile-info strong,.app.day .sidebar-profile-info small,
.app.day .nav-button,.app.day .nav-label,.app.day .topbar,.app.day .page-title,.app.day .page-title h1,
.app.day .page-title h2,.app.day .page-title h3,.app.day .page-title p,.app.day .section-title,.app.day .section-title h2,
.app.day .form-card-title,.app.day .settings-header,.app.day .settings-header strong,.app.day .settings-header p,
.app.day .setting-row,.app.day .setting-row strong,.app.day .setting-row small,.app.day .field,.app.day .field > span,
.app.day label,.app.day .stat strong,.app.day .stat small,.app.day .recent-row,.app.day .recent-row strong,
.app.day .recent-row small,.app.day .currency-summary-label,.app.day .expense-chart-head,.app.day .expense-chart-row,
.app.day .finance-card,.app.day .payment-summary,.app.day .warning-card,.app.day .content { color:var(--om-ink) !important; }
.app.day .page-title p,.app.day .field > span,.app.day .settings-header p,.app.day .setting-row small,
.app.day .recent-row small,.app.day .stat small,.app.day .finance-card small,.app.day .currency-summary-label { color:var(--om-muted) !important; }
.app.day .nav-button { background:rgba(255,255,255,.48) !important; border:1px solid rgba(129,171,213,.28) !important; border-radius:15px !important; color:#354f70 !important; }
.app.day .nav-button:hover { background:linear-gradient(135deg,rgba(135,201,255,.34),rgba(190,170,249,.27)) !important; border-color:rgba(117,169,219,.56) !important; }
.app.day .nav-button.active { background:linear-gradient(135deg,rgba(116,188,246,.58),rgba(184,158,243,.50)) !important; border:1.5px solid rgba(117,163,210,.60) !important; color:#203c5c !important; box-shadow:0 8px 22px rgba(98,150,201,.16),inset 0 1px 0 rgba(255,255,255,.75) !important; }
.app.day .brand-logo,.app.day .sidebar-profile-avatar,.app.day .settings-icon,.login-page.day .login-logo { background:linear-gradient(135deg,#8bcaf7,#c3aff4) !important; border:1.5px solid rgba(255,255,255,.92) !important; color:#fff !important; box-shadow:0 8px 22px rgba(114,155,208,.22),inset 0 1px 0 rgba(255,255,255,.48) !important; }
.app.day .field input,.app.day .field select,.app.day .field textarea,.app.day .page-search input,.app.day .global-search input,
.app.day input:not([type="checkbox"]):not([type="radio"]):not([type="file"]),.app.day select,.app.day textarea {
  color:#263f5d !important; background:rgba(255,255,255,.91) !important; border:1.5px solid rgba(121,166,211,.58) !important;
  border-radius:13px !important; box-shadow:inset 0 1px 2px rgba(68,103,141,.04) !important;
}
.app.day input::placeholder,.app.day textarea::placeholder { color:#8094ad !important; opacity:1 !important; }
.app.day .field input:focus,.app.day .field select:focus,.app.day .field textarea:focus,.app.day .page-search input:focus,
.app.day .global-search input:focus,.app.day input:focus,.app.day select:focus,.app.day textarea:focus {
  outline:none !important; border-color:#7dbdf2 !important; box-shadow:0 0 0 4px rgba(125,190,243,.22),0 0 0 1px rgba(185,162,242,.20) !important;
}
.app.day select option { color:#263f5d !important; background:#f8fbff !important; }
.app.day table { width:100%; color:var(--om-ink) !important; background:rgba(255,255,255,.45) !important; border-collapse:separate !important; border-spacing:0 !important; }
.app.day th { color:#294765 !important; background:linear-gradient(135deg,#deefff,#e9e2ff) !important; border-bottom:1.5px solid rgba(117,164,209,.55) !important; font-weight:800 !important; }
.app.day td { color:#304b69 !important; background:rgba(255,255,255,.68) !important; border-bottom:1px solid rgba(129,170,211,.28) !important; }
.app.day tr:hover td { background:rgba(206,231,255,.60) !important; }
.app.day .table-scroll { border:1px solid rgba(126,170,214,.36) !important; border-radius:18px !important; background:rgba(255,255,255,.42) !important; overflow-x:auto !important; }
.app.day .primary-button,.app.day .new-record-button,.app.day .login-button { color:#fff !important; background:linear-gradient(135deg,#75bdf1,#9f8de1) !important; border:1.5px solid rgba(255,255,255,.80) !important; border-radius:13px !important; box-shadow:0 9px 22px rgba(97,147,204,.20),inset 0 1px 0 rgba(255,255,255,.38) !important; font-weight:800 !important; }
.app.day .secondary-button,.app.day .tool-button,.app.day .refresh-button,.app.day .edit-button,.app.day .receipt-button,
.app.day .theme-button,.app.day .language-choice button,.app.day .theme-choice button,.app.day .login-language button {
  color:#304c6b !important; background:linear-gradient(135deg,rgba(177,218,255,.66),rgba(215,201,255,.55)) !important; border:1.5px solid rgba(123,168,212,.54) !important; border-radius:12px !important;
}
.app.day .delete-button { color:#9c3345 !important; background:linear-gradient(135deg,#fff0f2,#ffe7eb) !important; border:1.5px solid rgba(210,119,138,.56) !important; border-radius:12px !important; }
.app.day .setting-row { border-bottom:1px solid rgba(126,168,210,.30) !important; }
.app.day .check-box { background:rgba(215,235,255,.84) !important; border:1.5px solid rgba(108,159,207,.64) !important; }
.app.day .setting-check.checked .check-box { background:linear-gradient(135deg,#8bc9f4,#baa5ed) !important; border-color:#87bce9 !important; color:#fff !important; }
.app.day .toast { color:#263f5d !important; background:linear-gradient(135deg,rgba(255,255,255,.98),rgba(234,244,255,.98)) !important; border:1.5px solid rgba(126,170,214,.58) !important; box-shadow:0 16px 38px rgba(75,117,165,.18) !important; }
.app.day .forgot-modal-backdrop { background:rgba(64,91,125,.30) !important; backdrop-filter:blur(8px) !important; }
.app.day .forgot-modal { color:var(--om-ink) !important; background:linear-gradient(135deg,#fff,#edf6ff 60%,#f3edff) !important; border:1.5px solid rgba(122,169,213,.60) !important; }
.login-page.day { min-height:100vh !important; color:var(--om-ink) !important; background:radial-gradient(ellipse at 9% 10%,rgba(130,200,255,.46),transparent 31%),radial-gradient(ellipse at 90% 13%,rgba(196,172,255,.40),transparent 30%),radial-gradient(ellipse at 72% 88%,rgba(156,213,255,.34),transparent 31%),linear-gradient(135deg,#edf7ff 0%,#f7f1ff 52%,#eaf5ff 100%) !important; }
.login-page.day .login-box { color:#263f5d !important; background:linear-gradient(140deg,rgba(255,255,255,.92),rgba(231,244,255,.86),rgba(245,237,255,.86)) !important; border:1.5px solid rgba(123,169,212,.62) !important; border-radius:28px !important; box-shadow:0 26px 72px rgba(74,120,168,.17),inset 0 1px 0 rgba(255,255,255,.98) !important; backdrop-filter:blur(28px) saturate(145%) !important; -webkit-backdrop-filter:blur(28px) saturate(145%) !important; }
.login-page.day .login-box h1,.login-page.day .login-box p,.login-page.day .login-box label,.login-page.day .login-options,.login-page.day .remember-option,.login-page.day .forgot-link,.login-page.day .login-language { color:#304b69 !important; }
.login-page.day .login-box input { color:#263f5d !important; background:rgba(255,255,255,.94) !important; border:1.5px solid rgba(121,166,211,.60) !important; border-radius:13px !important; }
.login-page.day .login-box input::placeholder { color:#8398b0 !important; }
.login-page.day .login-language button { color:#304b69 !important; background:linear-gradient(135deg,rgba(175,216,255,.66),rgba(214,198,255,.58)) !important; border:1.5px solid rgba(123,168,212,.54) !important; border-radius:12px !important; }
.login-page.day .login-language button.selected { background:linear-gradient(135deg,#75bdf1,#a08ce3) !important; color:#fff !important; }
.login-page.day .login-error { color:#a92f44 !important; background:#fff0f2 !important; border:1px solid rgba(213,111,131,.54) !important; }
@media (max-width:800px) { .app.day .content { margin:12px 10px 28px !important; padding:12px !important; border-radius:20px !important; } }

.header-account-button {
  min-height: 44px;
  padding: 8px 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1.5px solid rgba(151, 196, 239, .56) !important;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(153, 205, 255, .20), rgba(194, 172, 255, .16)) !important;
  color: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 8px 22px rgba(40,90,145,.10);
}
.header-account-button:hover {
  border-color: rgba(130, 185, 238, .85) !important;
  background: linear-gradient(135deg, rgba(153, 205, 255, .32), rgba(194, 172, 255, .26)) !important;
}
.header-account-button:focus-visible {
  outline: 3px solid #78bdf4;
  outline-offset: 3px;
}
.header-account-icon {
  width: 21px;
  height: 21px;
  flex: 0 0 21px;
}
.app.day .header-account-button {
  color: #2e4a68 !important;
  border-color: rgba(123, 168, 212, .65) !important;
}
.account-verification {
  display: grid;
  gap: 16px;
}
.account-verification h1 {
  text-align: center;
}
.account-verification p {
  overflow-wrap: anywhere;
}
@media (max-width: 700px) {
  .header-account-button {
    min-height: 40px;
    padding: 7px 10px;
    gap: 6px;
    font-size: 12px;
  }
  .header-account-icon {
    width: 19px;
    height: 19px;
    flex-basis: 19px;
  }
}
`;

export default App;