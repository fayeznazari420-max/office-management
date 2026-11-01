import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.DEV ? "http://localhost:5000" : "";

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

function getTodayInputDate() {
  const now = new Date();
  const local = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 10);
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
  photo: "",
};

const emptyAttendance = {
  employee_id: "",
  date: todayInputDate,
  check_in: "",
  check_out: "",
  status: "Present",
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

  const [page, setPage] = useState("dashboard");

  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
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
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("office_logged_in");
        localStorage.removeItem("office_token");
        localStorage.removeItem("office_user");
        sessionStorage.removeItem("office_logged_in");
        sessionStorage.removeItem("office_token");
        sessionStorage.removeItem("office_user");
        setLoggedIn(false);
        setCurrentUser(null);
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

  async function fetchUsers() {
    const data = await api("/users");
    setUsers(data);
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
      if (data.length === 0 && cached.length > 0) {
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
      // The cached data stays visible if the backend is temporarily unavailable.
      setEmployees(cached);
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
      if (data.length === 0 && cached.length > 0) {
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
      await Promise.all([
        fetchCustomers(),
        fetchUsers(),
        fetchEmployees(),
        fetchContracts(),
        fetchAttendance(),
        fetchPayments(),
        fetchProjects(),
        fetchFinanceIncome(),
        fetchFinanceExpenses(),
        fetchFinanceDebts(),
      ]);

      showToast(
        language === "fa"
          ? "اطلاعات تازه شد"
          : "Data refreshed"
      );
    } catch (error) {
      showToast(error.message);
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
      const isPendingApproval = String(error?.message || "")
        .toLowerCase()
        .includes("pending approval");
      const message = isPendingApproval
        ? language === "fa"
          ? "حساب شما ساخته شده و منتظر تأیید مدیر است."
          : "Your account is waiting for administrator approval."
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
          ? "حساب ساخته شد. پس از تأیید مدیر می‌توانید وارد شوید."
          : "Account created. You can sign in after an administrator approves it."
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
    setPage("dashboard");
    setRecordFormOpen(false);
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
        date: getTodayInputDate(),
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
        date: getTodayInputDate(),
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

  /* ================= LOGIN PAGE ================= */

  if (!loggedIn) {
    return (
      <>
        <style>{styles}</style>

        <div className={`login-page ${theme}`}>
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
                    ? "حساب تازه پس از تأیید مدیر سیستم فعال می‌شود."
                    : "New accounts are activated after administrator approval."}
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
      `}</style>

      <div
        className={`app ${language === "fa" ? "rtl" : ""} ${theme} ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
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

          <div className="sidebar-profile">
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
              <span>
                {currentUser?.role || "user"}
              </span>
            </div>
          </div>

          <nav>

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

            {openMenu === "users" && (
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
                  onClick={() =>
                    startNewRecord("attendance")
                  }
                >
                  ＋{" "}
                  {language === "fa"
                    ? "ثبت حاضری جدید"
                    : "NEW ATTENDANCE"}
                </button>
              </div>
            )}

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

          </nav>

          <button
            className="logout-button"
            onClick={logout}
          >
            ⇥ {t.logout}
          </button>

        </aside>

        {/* MAIN AREA */}

        <main className="main">

          {/* TOPBAR */}

          <header className="topbar">

            <div>
              <span className="top-label">
                {t.welcome}
              </span>

              <strong>
                {currentUser?.name ||
                  currentUser?.username ||
                  "User"}
              </strong>
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

          {/* PAGE TOOLS */}

          {[
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
          ].includes(page) &&
          !recordFormOpen && (
            <PageTools
              t={t}
              language={language}
              search={search}
              setSearch={setSearch}
              onCreate={() =>
                startNewRecord(page)
              }
              onPrint={() => printVisibleTable(page)}
              onExcel={() => downloadExcelBackup(page)}
            />
          )}

          {/* DASHBOARD */}

          {page === "dashboard" && (
            <Dashboard
              t={t}
              customers={customers}
              users={users}
              attendance={attendance}
              payments={payments}
              projects={projects}
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
            <Page title={t.customers}>

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
                    className="form-grid"
                  >
                    <PhotoInput
                      label={language === "fa" ? "عکس مشتری" : "CUSTOMER PHOTO"}
                      value={customerForm.photo}
                      onChange={(photo) =>
                        setCustomerForm({ ...customerForm, photo })
                      }
                    />

                    <Input
                      label={t.name}
                      value={customerForm.name}
                      onChange={(value) =>
                        setCustomerForm({
                          ...customerForm,
                          name: value,
                        })
                      }
                      required
                    />

                    <Input
                      label={t.phone}
                      value={customerForm.phone}
                      onChange={(value) =>
                        setCustomerForm({
                          ...customerForm,
                          phone: value,
                        })
                      }
                    />

                    <Input
                      label={t.shopName}
                      value={customerForm.shop_name}
                      onChange={(value) =>
                        setCustomerForm({
                          ...customerForm,
                          shop_name: value,
                        })
                      }
                    />

                    <Input
                      label={t.shopNumber}
                      value={customerForm.shop_number}
                      onChange={(value) =>
                        setCustomerForm({
                          ...customerForm,
                          shop_number: value,
                        })
                      }
                    />

                    <Input
                      label={t.address}
                      value={customerForm.address}
                      onChange={(value) =>
                        setCustomerForm({
                          ...customerForm,
                          address: value,
                        })
                      }
                    />

                    <Input
                      label={t.contractId}
                      value={customerForm.contract_id}
                      onChange={(value) =>
                        setCustomerForm({
                          ...customerForm,
                          contract_id: value,
                        })
                      }
                    />

                    <Input
                      label={t.dateId}
                      value={customerForm.date_id}
                      onChange={(value) =>
                        setCustomerForm({
                          ...customerForm,
                          date_id: value,
                        })
                      }
                    />

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
                  <SectionTitle title={t.customers} />

                  {getCustomerRows(customers).length === 0 ? (
                    <Empty text={t.noData} />
                  ) : (
                    <Table
                      headers={[
                        "#",
                        t.name,
                        t.phone,
                        t.shopName,
                        t.shopNumber,
                        t.address,
                        t.contractId,
                        language === "fa" ? "عکس" : "PHOTO",
                        t.action,
                      ]}
                    >
                      {getCustomerRows(customers).map(
                        ({ item, serial }) => (
                          <tr key={item.id}>
                            <td>{serial}</td>
                            <td>{item.name}</td>
                            <td>{item.phone}</td>
                            <td>{item.shop_name}</td>
                            <td>{item.shop_number}</td>
                            <td>{item.address}</td>
                            <td>{item.contract_id}</td>
                            <td><AvatarPhoto src={item.photo || getStoredPhoto("customer", item.id)} /></td>
                            <td>
                              <ActionButtons
                                edit={() => editCustomer(item)}
                                remove={() => deleteCustomer(item.id)}
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
            <Page title={language === "fa" ? "کارمندان" : "EMPLOYEES"}>
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
                          <td><ActionButtons edit={() => editEmployee(item)} remove={() => deleteEmployee(item.id)} t={t} /></td>
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
            <Page title={language === "fa" ? "قراردادها" : "CONTRACTS"}>
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
                            <td><ActionButtons edit={() => editContract(item)} remove={() => deleteContract(item.id)} t={t} /></td>
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

          {page === "users" && (
            <Page title={t.users}>

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
                      <option value="pending">
                        {language === "fa" ? "در انتظار تأیید" : "Pending approval"}
                      </option>
                      <option value="admin">
                        {language === "fa" ? "مدیر (Admin)" : "Admin"}
                      </option>
                      <option value="manager">
                        {language === "fa" ? "مدیر اجرایی (Manager)" : "Manager"}
                      </option>
                      <option value="user">
                        {language === "fa" ? "کاربر (User)" : "User"}
                      </option>
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
                            <td>{item.role || "user"}</td>
                            <td><AvatarPhoto src={item.photo || getStoredPhoto("user", item.id)} /></td>
                            <td>
                              <ActionButtons
                                edit={() => editUser(item)}
                                remove={() => deleteUser(item.id)}
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
            <Page title={t.attendance}>

              {recordFormOpen && (
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
                      <option value="holiday">Holiday</option>
                      <option value="Late">Late</option>
                    </Select>

                    <FormButtons
                      editing={editingAttendance}
                      t={t}
                      cancel={() => {
                        setEditingAttendance(null);
                        setAttendanceForm({
                          ...emptyAttendance,
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
                  <SectionTitle title={t.attendance} />

                  {searchItems(attendance).length === 0 ? (
                    <Empty text={t.noData} />
                  ) : (
                    <Table
                      headers={[
                        "#",
                        t.employee,
                        t.date,
                        t.checkIn,
                        t.checkOut,
                        t.status,
                        t.action,
                      ]}
                    >
                      {getNumberedRows(attendance).map(
                        ({ item, serial }) => (
                          <tr key={item.id}>
                            <td>{serial}</td>
                            <td>
                              {item.employee_name ||
                                employees.find((employee) =>
                                  String(employee.id) === String(item.employee_id)
                                )?.name || "—"}
                            </td>
                            <td>
                              {formatDisplayDate(
                                item.date,
                                language
                              )}
                            </td>
                            <td>{item.check_in || "-"}</td>
                            <td>{item.check_out || "-"}</td>
                            <td>
                              <Status value={item.status} />
                            </td>
                            <td>
                              <ActionButtons
                                edit={() => editAttendance(item)}
                                remove={() => deleteAttendance(item.id)}
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


          {/* FINANCE OVERVIEW */}
          {page === "finance" && (
            <Page title={t.finance}>
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
            <Page title={t.incomeRecords}>

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
            <Page title={t.expenses}>

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
            <Page title={t.debts}>

              {!recordFormOpen && (
                <div className="payment-summary">
                  <Stat
                    number={formatMoney(financeReceivableTotal)}
                    label={t.financeReceivable}
                    code="DR"
                  />
                </div>
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
            <Page title={t.payments}>

              {!recordFormOpen && (
                <div className="payment-summary">
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
            <Page title={t.projects}>

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
                  <SectionTitle title={t.projects} />

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


          {/* SETTINGS */}

          {page === "settings" && (
            <Page title={t.settings}>

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

                {Object.entries(
                  DEFAULT_SETTINGS
                ).map(([key]) => {

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

                {/* LANGUAGE */}

                <div className="setting-row">

                  <div>
                    <strong>
                      {t.language}
                    </strong>

                    <small>
                      SYSTEM LANGUAGE
                    </small>
                  </div>

                  <div className="language-choice">

                    <button
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

                {/* THEME */}
                <div className="setting-row">
                  <div>
                    <strong>{t.theme}</strong>
                    <small>LIGHT / DARK INTERFACE</small>
                  </div>

                  <div className="theme-choice">
                    <button
                      className={theme === "day" ? "selected" : ""}
                      onClick={() => setTheme("day")}
                    >
                      ☀ {t.dayMode}
                    </button>
                    <button
                      className={theme === "night" ? "selected" : ""}
                      onClick={() => setTheme("night")}
                    >
                      ☾ {t.nightMode}
                    </button>
                  </div>
                </div>

              </div>

             

            </Page>
          )}

        </main>

        {/* TOAST */}

        {toast && (
          <div className="toast">
            {toast}
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
  users,
  attendance,
  payments,
  projects,
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

  const expenseChartData =
    [...financeExpenses]
      .sort(
        (a, b) =>
          Number(b.amount || 0) -
          Number(a.amount || 0)
      )
      .slice(0, 6);

  const maxChartExpense = Math.max(
    ...expenseChartData.map((item) =>
      Number(item.amount || 0)
    ),
    1
  );

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
    <section className="content">

      <div className="page-title">

        <h1>
          {t.dashboard}
        </h1>

        <p>
          {t.overview}
        </p>

      </div>

      {/* WELCOME */}

      <div className="welcome-card">

        <div>
          <small>
            {t.welcome}
          </small>

          <h2>
            OFFICE MANAGEMENT
          </h2>

          <p>
            {t.welcomeText}
          </p>
        </div>

        {settings.dateTime && (
          <div className="dashboard-date">

            <strong>
              {formatDate(
                now,
                "en"
              )}
            </strong>

            <span>
              {formatTime(now)}
            </span>

          </div>
        )}

      </div>

      {/* STATS */}

      {settings.dashboardStats && (
        <div className="stats-grid">

          <Stat
            number={customers.length}
            label={t.customers}
            code="CU"
          />

          <Stat
            number={users.length}
            label={t.users}
            code="US"
          />

          <Stat
            number={attendance.length}
            label={t.attendance}
            code="AT"
          />

          <Stat
            number={projects.length}
            label={t.projects}
            code="PR"
          />

        </div>
      )}

      {/* MONEY */}

      <div className="payment-summary">

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

      {/* CURRENCY SMALL */}

      {settings.currency && (
        <div className="currency-card">

          <div>
            <small>
              {t.currencyConverter}
            </small>

            <h2>
              {currencyAmount || 0}{" "}
              {currencyFrom}
              {" = "}
              {convertedAmount}{" "}
              {currencyTo}
              <small className="currency-summary-label">
                {" — "}{currencyLabel(currencyFrom, language)}
                {" → "}{currencyLabel(currencyTo, language)}
              </small>
            </h2>
          </div>

          <div className="currency-controls">

            <input
              type="number"
              value={
                currencyAmount
              }
              onChange={(e) =>
                setCurrencyAmount(
                  e.target.value
                )
              }
            />

            <select
              value={currencyFrom}
              onChange={(e) =>
                setCurrencyFrom(
                  e.target.value
                )
              }
            >
              {Object.keys(RATES).map(
                (currency) => (
                  <option
                    key={currency}
                    value={currency}
                  >
                    {currencyLabel(currency, language)}
                  </option>
                )
              )}
            </select>

            <span>
              →
            </span>

            <select
              value={currencyTo}
              onChange={(e) =>
                setCurrencyTo(
                  e.target.value
                )
              }
            >
              {Object.keys(RATES).map(
                (currency) => (
                  <option
                    key={currency}
                    value={currency}
                  >
                    {currencyLabel(currency, language)}
                  </option>
                )
              )}
            </select>

          </div>

        </div>
      )}

      {/* DEADLINE WARNING */}

      {settings.overdueWarning &&
        overdueProjects.length > 0 && (
          <div className="warning-card">

            <div>
              <strong>
                {t.projectWarning}
              </strong>

              <p>
                {overdueProjects.length}{" "}
                {t.overdue}
              </p>
            </div>

            <button
              onClick={() =>
                setPage("projects")
              }
            >
              VIEW
            </button>

          </div>
        )}

      {/* RECENT */}

      <div className="dashboard-grid">

        <div className="dashboard-panel">

          <SectionTitle
            title={t.recentProjects}
          />

          {activeProjects
            .slice(0, 5)
            .map((project) => (
              <div
                className="recent-row"
                key={project.id}
              >

                <div>
                  <strong>
                    {project.title}
                  </strong>

                  <small>
                    {project.employee ||
                      "—"}
                  </small>
                </div>

                <Status
                  value={
                    project.status
                  }
                />

              </div>
            ))}

          {activeProjects.length ===
            0 && (
            <Empty
              text={t.noData}
            />
          )}

        </div>

        <div className="dashboard-panel">

          <SectionTitle
            title={t.recentPayments}
          />

          {payments
            .slice(0, 5)
            .map((payment) => (
              <div
                className="recent-row"
                key={payment.id}
              >

                <div>
                  <strong>
                    {formatMoney(
                      payment.amount
                    )}
                  </strong>

                  <small>
                    {payment.description ||
                      "Payment"}
                  </small>
                </div>

                <Status
                  value={
                    payment.type
                  }
                />

              </div>
            ))}

          {payments.length ===
            0 && (
            <Empty
              text={t.noData}
            />
          )}

        </div>

      </div>

      {/* EXPENSES CHART */}

      <div className="dashboard-panel expense-chart-panel">
        <SectionTitle
          title={
            language === "fa"
              ? "نمودار مصارف"
              : "EXPENSES CHART"
          }
        />

        {expenseChartData.length === 0 ? (
          <Empty text={t.noData} />
        ) : (
          <div className="expense-chart-list">
            {expenseChartData.map((item) => {
              const amount =
                Number(item.amount || 0);

              const width = Math.max(
                6,
                (amount / maxChartExpense) * 100
              );

              return (
                <div
                  className="expense-chart-row"
                  key={item.id}
                >
                  <div className="expense-chart-head">
                    <strong>
                      {item.title ||
                        (language === "fa"
                          ? "مصرف"
                          : "Expense")}
                    </strong>
                    <span>
                      {formatMoney(amount)}
                    </span>
                  </div>

                  <div className="expense-chart-track">
                    <div
                      className="expense-chart-bar"
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK ACTIONS */}

      <div className="quick-actions">

        <SectionTitle
          title={t.quickActions}
        />

        <div className="quick-buttons">

          <button
            onClick={() =>
              setPage("customers")
            }
          >
            + {t.customers}
          </button>

          <button
            onClick={() =>
              setPage("users")
            }
          >
            + {t.users}
          </button>

          <button
            onClick={() =>
              setPage("payments")
            }
          >
            + {t.payments}
          </button>

          <button
            onClick={() =>
              setPage("projects")
            }
          >
            + {t.projects}
          </button>

        </div>

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
  search,
  setSearch,
  onCreate,
  onPrint,
  onExcel,
}) {
  return (
    <div className="page-tools">
      <div className="page-search">
        <span>⌕</span>

        <input
          type="text"
          placeholder={`${t.search}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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

        <button
          type="button"
          className="tool-button"
          onClick={onExcel}
        >
          📊 EXCEL
        </button>
      </div>
    </div>
  );
}

function Page({
  title,
  children,
}) {
  return (
    <section className="content">

      <div className="page-title">

        <h1>{title}</h1>

        <p>
          OFFICE MANAGEMENT
        </p>

      </div>

      {children}

    </section>
  );
}

function NavButton({
  label,
  icon,
  active,
  onClick,
}) {
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
        {icon}
      </span>

      <span className="nav-label">
        {label}
      </span>
    </button>
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

  return (
    <div
      className="action-buttons"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="edit-button"
        onClick={handleEdit}
        onMouseDown={(e) => e.stopPropagation()}
        aria-label={t.edit}
      >
        {t.edit}
      </button>

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

      <button
        type="button"
        className="delete-button"
        onClick={handleDelete}
        onMouseDown={(e) => e.stopPropagation()}
        aria-label={t.delete}
      >
        {t.delete}
      </button>
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

`;

export default App;