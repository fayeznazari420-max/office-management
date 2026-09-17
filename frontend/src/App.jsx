import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000";

/* ================= SETTINGS ================= */

const DEFAULT_SETTINGS = {
  notifications: true,
  deadlineAlerts: true,
  currency: true,
  dateTime: true,
  dashboardStats: true,
  overdueWarning: true,
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
    dashboard: "DASHBOARD",
    customers: "CUSTOMERS",
    users: "USERS / EMPLOYEES",
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
    dashboard: "داشبورد",
    customers: "مشتریان",
    users: "کاربران / کارمندان",
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

/* ================= EMPTY FORMS ================= */

const emptyCustomer = {
  name: "",
  phone: "",
  shop_name: "",
  shop_number: "",
  address: "",
  contract_id: "",
  date_id: "",
};

const emptyUser = {
  name: "",
  email: "",
  username: "",
  password: "",
};

const emptyAttendance = {
  user_id: "",
  date: "",
  check_in: "",
  check_out: "",
  status: "Present",
};

const emptyPayment = {
  customer_id: "",
  amount: "",
  type: "Paid",
  date: "",
  description: "",
};

const emptyIncome = {
  source: "",
  amount: "",
  date: "",
  description: "",
};

const emptyExpense = {
  title: "",
  amount: "",
  category: "",
  date: "",
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

/* ================= APP ================= */

function App() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("office_logged_in") === "true" &&
    !!localStorage.getItem("office_token")
  );

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("office_user") || "null"
      );
    } catch {
      return null;
    }
  });

  const [language, setLanguage] = useState(
    localStorage.getItem("office_language") || "en"
  );

  const [theme, setTheme] = useState(
    localStorage.getItem("office_theme") || "night"
  );

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
  const [financeOpen, setFinanceOpen] = useState(false);

  const [toast, setToast] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [now, setNow] = useState(new Date());

  /* LOGIN */

  const [loginForm, setLoginForm] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [loginLoading, setLoginLoading] = useState(false);

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
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(
      "office_settings",
      JSON.stringify(settings)
    );
  }, [settings]);

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
    const token = localStorage.getItem("office_token");

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

  async function fetchAttendance() {
    const data = await api("/attendance");
    setAttendance(data);
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

  /* ================= TOAST ================= */

  function showToast(message) {
    setToast(message);
  }

  /* ================= LOGIN ================= */

  async function handleLogin(e) {
    e.preventDefault();

    setLoginLoading(true);

    try {
      const data = await api("/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });

      localStorage.setItem(
        "office_logged_in",
        "true"
      );

      localStorage.setItem(
        "office_token",
        data.token
      );

      localStorage.setItem(
        "office_user",
        JSON.stringify(data.user)
      );

      setCurrentUser(data.user);
      setLoggedIn(true);

      setLoginForm({
        email: "",
        username: "",
        password: "",
      });

      showToast(
        language === "fa"
          ? "ورود موفقانه بود"
          : "Login successful"
      );
    } catch (error) {
      showToast(error.message);
    }

    setLoginLoading(false);
  }

  function logout() {
    localStorage.removeItem("office_logged_in");
    localStorage.removeItem("office_token");
    localStorage.removeItem("office_user");

    setLoggedIn(false);
    setCurrentUser(null);
    setPage("dashboard");
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

  /* ================= CUSTOMER ================= */

  async function saveCustomer(e) {
    e.preventDefault();

    try {
      if (editingCustomer) {
        await api(
          `/customers/${editingCustomer}`,
          {
            method: "PUT",
            body: JSON.stringify(customerForm),
          }
        );

        showToast(
          language === "fa"
            ? "مشتری ویرایش شد"
            : "Customer updated"
        );
      } else {
        await api("/customers", {
          method: "POST",
          body: JSON.stringify(customerForm),
        });

        showToast(
          language === "fa"
            ? "مشتری اضافه شد"
            : "Customer added"
        );
      }

      setCustomerForm(emptyCustomer);
      setEditingCustomer(null);

      await fetchCustomers();
    } catch (error) {
      showToast(error.message);
    }
  }

  function editCustomer(item) {
    setEditingCustomer(item.id);

    setCustomerForm({
      name: item.name || "",
      phone: item.phone || "",
      shop_name: item.shop_name || "",
      shop_number: item.shop_number || "",
      address: item.address || "",
      contract_id: item.contract_id || "",
      date_id: item.date_id || "",
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
      if (editingUser) {
        await api(`/users/${editingUser}`, {
          method: "PUT",
          body: JSON.stringify(userForm),
        });

        showToast(
          language === "fa"
            ? "کاربر ویرایش شد"
            : "User updated"
        );
      } else {
        await api("/users", {
          method: "POST",
          body: JSON.stringify(userForm),
        });

        showToast(
          language === "fa"
            ? "کاربر اضافه شد"
            : "User added"
        );
      }

      setUserForm(emptyUser);
      setEditingUser(null);

      await fetchUsers();
    } catch (error) {
      showToast(error.message);
    }
  }

  function editUser(item) {
    setEditingUser(item.id);

    setUserForm({
      name: item.name || "",
      email: item.email || "",
      username: item.username || "",
      password: "",
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

    try {
      if (editingAttendance) {
        await api(
          `/attendance/${editingAttendance}`,
          {
            method: "PUT",
            body: JSON.stringify(
              attendanceForm
            ),
          }
        );
      } else {
        await api("/attendance", {
          method: "POST",
          body: JSON.stringify(
            attendanceForm
          ),
        });
      }

      setAttendanceForm(emptyAttendance);
      setEditingAttendance(null);

      await fetchAttendance();

      showToast(
        language === "fa"
          ? "حاضری ذخیره شد"
          : "Attendance saved"
      );
    } catch (error) {
      showToast(error.message);
    }
  }

  function editAttendance(item) {
    setEditingAttendance(item.id);

    setAttendanceForm({
      user_id: item.user_id || "",
      date: formatInputDate(item.date),
      check_in: item.check_in || "",
      check_out: item.check_out || "",
      status: item.status || "Present",
    });

    focusEditForm();
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

      setPaymentForm(emptyPayment);
      setEditingPayment(null);

      await fetchPayments();

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

  /* ================= FINANCE ================= */

  async function saveIncome(e) {
    e.preventDefault();
    try {
      if (editingIncome) {
        await api(`/finance/income/${editingIncome}`, {
          method: "PUT",
          body: JSON.stringify(incomeForm),
        });
      } else {
        await api("/finance/income", {
          method: "POST",
          body: JSON.stringify(incomeForm),
        });
      }
      setIncomeForm(emptyIncome);
      setEditingIncome(null);
      await fetchFinanceIncome();
      showToast(language === "fa" ? "درآمد ذخیره شد" : "Income saved");
    } catch (error) { showToast(error.message); }
  }

  function editIncome(item) {
    setEditingIncome(item.id);
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
      if (editingExpense) {
        await api(`/finance/expenses/${editingExpense}`, {
          method: "PUT",
          body: JSON.stringify(expenseForm),
        });
      } else {
        await api("/finance/expenses", {
          method: "POST",
          body: JSON.stringify(expenseForm),
        });
      }
      setExpenseForm(emptyExpense);
      setEditingExpense(null);
      await fetchFinanceExpenses();
      showToast(language === "fa" ? "مصرف ذخیره شد" : "Expense saved");
    } catch (error) { showToast(error.message); }
  }

  function editExpense(item) {
    setEditingExpense(item.id);
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
      await fetchFinanceDebts();
      showToast(language === "fa" ? "قرض ذخیره شد" : "Debt saved");
    } catch (error) { showToast(error.message); }
  }

  function editDebt(item) {
    setEditingDebt(item.id);
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

      await fetchProjects();

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
              {t.loginTitle}
            </h1>

            <p>
              {t.loginSubtitle}
            </p>

            <form onSubmit={handleLogin}>

              <Input
                label={t.email}
                type="email"
                value={loginForm.email}
                onChange={(value) =>
                  setLoginForm({
                    ...loginForm,
                    email: value,
                  })
                }
                required
              />

              <Input
                label={t.username}
                value={loginForm.username}
                onChange={(value) =>
                  setLoginForm({
                    ...loginForm,
                    username: value,
                  })
                }
                required
              />

              <Input
                label={t.password}
                type="password"
                value={loginForm.password}
                onChange={(value) =>
                  setLoginForm({
                    ...loginForm,
                    password: value,
                  })
                }
                required
              />

              <button
                className="primary-button login-button"
                disabled={loginLoading}
              >
                {loginLoading
                  ? "..."
                  : t.login}
              </button>

            </form>

            <div className="login-language">
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
        className={`app ${language === "fa" ? "rtl" : ""} ${theme}`}
      >

        {/* SIDEBAR */}

        <aside className="sidebar">

          <div className="brand">
            <div className="brand-logo">
              OM
            </div>

            <div>
              <strong>
                OFFICE
              </strong>

              <small>
                MANAGEMENT
              </small>
            </div>
          </div>

          <nav>

            <NavButton
              label={t.dashboard}
              icon="⌂"
              active={page === "dashboard"}
              onClick={() =>
                setPage("dashboard")
              }
            />

            <NavButton
              label={t.customers}
              icon="◉"
              active={page === "customers"}
              onClick={() =>
                setPage("customers")
              }
            />

            <NavButton
              label={t.users}
              icon="♙"
              active={page === "users"}
              onClick={() =>
                setPage("users")
              }
            />

            <NavButton
              label={t.attendance}
              icon="✓"
              active={page === "attendance"}
              onClick={() =>
                setPage("attendance")
              }
            />

            <NavButton
              label={t.finance}
              icon="₣"
              active={financeOpen || ["finance", "payments", "income", "expenses", "debts"].includes(page)}
              onClick={() => {
                setFinanceOpen((value) => !value);
                setPage("finance");
              }}
            />

            {financeOpen && (
              <div className="finance-subnav">
                <button type="button" className={page === "finance" ? "active" : ""} onClick={() => setPage("finance")}>▸ {t.financeOverview}</button>
                <button type="button" className={page === "payments" ? "active" : ""} onClick={() => setPage("payments")}>▸ {t.payments}</button>
                <button type="button" className={page === "income" ? "active" : ""} onClick={() => setPage("income")}>▸ {t.incomeRecords}</button>
                <button type="button" className={page === "expenses" ? "active" : ""} onClick={() => setPage("expenses")}>▸ {t.expenses}</button>
                <button type="button" className={page === "debts" ? "active" : ""} onClick={() => setPage("debts")}>▸ {t.debts}</button>
              </div>
            )}


            <NavButton
              label={t.projects}
              icon="▣"
              active={page === "projects"}
              onClick={() =>
                setPage("projects")
              }
            />

            <NavButton
              label={t.settings}
              icon="⚙"
              active={page === "settings"}
              onClick={() =>
                setPage("settings")
              }
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
                className="refresh-button"
                onClick={refreshAll}
              >
                {refreshing
                  ? "..."
                  : "↻"}
              </button>

            </div>

          </header>

          {/* SEARCH */}

          {page !== "dashboard" &&
            page !== "settings" && (
              <div className="global-search">

                <input
                  placeholder={`${t.search}...`}
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

                <span>⌕</span>

              </div>
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

              <FormCard
                title={
                  editingCustomer
                    ? t.edit
                    : t.add
                }
              >

                <form
                  onSubmit={saveCustomer}
                  className="form-grid"
                >

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
                    value={
                      customerForm.shop_name
                    }
                    onChange={(value) =>
                      setCustomerForm({
                        ...customerForm,
                        shop_name: value,
                      })
                    }
                  />

                  <Input
                    label={t.shopNumber}
                    value={
                      customerForm.shop_number
                    }
                    onChange={(value) =>
                      setCustomerForm({
                        ...customerForm,
                        shop_number: value,
                      })
                    }
                  />

                  <Input
                    label={t.address}
                    value={
                      customerForm.address
                    }
                    onChange={(value) =>
                      setCustomerForm({
                        ...customerForm,
                        address: value,
                      })
                    }
                  />

                  <Input
                    label={t.contractId}
                    value={
                      customerForm.contract_id
                    }
                    onChange={(value) =>
                      setCustomerForm({
                        ...customerForm,
                        contract_id: value,
                      })
                    }
                  />

                  <Input
                    label={t.dateId}
                    value={
                      customerForm.date_id
                    }
                    onChange={(value) =>
                      setCustomerForm({
                        ...customerForm,
                        date_id: value,
                      })
                    }
                  />

                  <FormButtons
                    editing={
                      editingCustomer
                    }
                    t={t}
                    cancel={() => {
                      setEditingCustomer(
                        null
                      );
                      setCustomerForm(
                        emptyCustomer
                      );
                    }}
                  />

                </form>

              </FormCard>

              <SectionTitle
                title={t.customers}
              />

              {getCustomerRows(customers)
                .length === 0 ? (
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
                    t.action,
                  ]}
                >
                  {getCustomerRows(customers).map(
                    ({ item, serial }) => (
                      <tr key={item.id}>

                        <td>
                          {serial}
                        </td>

                        <td>
                          {item.name}
                        </td>

                        <td>
                          {item.phone}
                        </td>

                        <td>
                          {item.shop_name}
                        </td>

                        <td>
                          {item.shop_number}
                        </td>

                        <td>
                          {item.address}
                        </td>

                        <td>
                          {item.contract_id}
                        </td>

                        <td>
                          <ActionButtons
                            edit={() =>
                              editCustomer(
                                item
                              )
                            }
                            remove={() =>
                              deleteCustomer(
                                item.id
                              )
                            }
                            t={t}
                          />
                        </td>

                      </tr>
                    )
                  )}
                </Table>
              )}

            </Page>
          )}

          {/* USERS */}

          {page === "users" && (
            <Page title={t.users}>

              <FormCard title={t.add}>

                <form
                  onSubmit={saveUser}
                  className="form-grid"
                >

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
                    value={
                      userForm.username
                    }
                    onChange={(value) =>
                      setUserForm({
                        ...userForm,
                        username: value,
                      })
                    }
                    required
                  />

                  <Input
                    label={t.password}
                    type="password"
                    value={
                      userForm.password
                    }
                    onChange={(value) =>
                      setUserForm({
                        ...userForm,
                        password: value,
                      })
                    }
                    required={!editingUser}
                  />

                  <FormButtons
                    editing={editingUser}
                    t={t}
                    cancel={() => {
                      setEditingUser(null);
                      setUserForm(
                        emptyUser
                      );
                    }}
                  />

                </form>

              </FormCard>

              <SectionTitle title={t.users} />

              {searchItems(users)
                .length === 0 ? (
                <Empty text={t.noData} />
              ) : (
                <Table
                  headers={[
                    "#",
                    t.name,
                    t.email,
                    t.username,
                    t.action,
                  ]}
                >
                  {getNumberedRows(users).map(
                    ({ item, serial }) => (
                      <tr key={item.id}>

                        <td>
                          {serial}
                        </td>

                        <td>
                          {item.name}
                        </td>

                        <td>
                          {item.email}
                        </td>

                        <td>
                          {item.username}
                        </td>

                        <td>
                          <ActionButtons
                            edit={() =>
                              editUser(
                                item
                              )
                            }
                            remove={() =>
                              deleteUser(
                                item.id
                              )
                            }
                            t={t}
                          />
                        </td>

                      </tr>
                    )
                  )}
                </Table>
              )}

            </Page>
          )}

          {/* ATTENDANCE */}

          {page === "attendance" && (
            <Page title={t.attendance}>

              <FormCard title={t.add}>

                <form
                  onSubmit={saveAttendance}
                  className="form-grid"
                >

                  <Select
                    label={t.employee}
                    value={
                      attendanceForm.user_id
                    }
                    onChange={(value) =>
                      setAttendanceForm({
                        ...attendanceForm,
                        user_id: value,
                      })
                    }
                    required
                  >
                    <option value="">
                      Select employee
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

                  <Input
                    label={t.date}
                    type="date"
                    value={
                      attendanceForm.date
                    }
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
                    value={
                      attendanceForm.check_in
                    }
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
                    value={
                      attendanceForm.check_out
                    }
                    onChange={(value) =>
                      setAttendanceForm({
                        ...attendanceForm,
                        check_out: value,
                      })
                    }
                  />

                  <Select
                    label={t.status}
                    value={
                      attendanceForm.status
                    }
                    onChange={(value) =>
                      setAttendanceForm({
                        ...attendanceForm,
                        status: value,
                      })
                    }
                  >
                    <option value="Present">
                      Present
                    </option>

                    <option value="Absent">
                      Absent
                    </option>

                    <option value="Late">
                      Late
                    </option>
                  </Select>

                  <FormButtons
                    editing={
                      editingAttendance
                    }
                    t={t}
                    cancel={() => {
                      setEditingAttendance(
                        null
                      );
                      setAttendanceForm(
                        emptyAttendance
                      );
                    }}
                  />

                </form>

              </FormCard>

              <SectionTitle
                title={t.attendance}
              />

              {searchItems(attendance)
                .length === 0 ? (
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

                        <td>
                          {serial}
                        </td>

                        <td>
                          {item.employee_name ||
                            getUserName(
                              users,
                              item.user_id
                            )}
                        </td>

                        <td>
                          {formatDisplayDate(
                            item.date,
                            language
                          )}
                        </td>

                        <td>
                          {item.check_in}
                        </td>

                        <td>
                          {item.check_out}
                        </td>

                        <td>
                          <Status
                            value={
                              item.status
                            }
                          />
                        </td>

                        <td>
                          <ActionButtons
                            edit={() =>
                              editAttendance(
                                item
                              )
                            }
                            remove={() =>
                              deleteAttendance(
                                item.id
                              )
                            }
                            t={t}
                          />
                        </td>

                      </tr>
                    )
                  )}
                </Table>
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
              <div className="payment-summary"><Stat number={formatMoney(financeIncomeTotal)} label={t.financeTotalIncome} code="IN" /></div>
              <FormCard title={editingIncome ? t.edit : t.recordIncome}>
                <form onSubmit={saveIncome} className="form-grid">
                  <Input label={t.source} value={incomeForm.source} onChange={(value) => setIncomeForm({ ...incomeForm, source: value })} required />
                  <Input label={t.amount} type="number" value={incomeForm.amount} onChange={(value) => setIncomeForm({ ...incomeForm, amount: value })} required />
                  <Input label={t.date} type="date" value={incomeForm.date} onChange={(value) => setIncomeForm({ ...incomeForm, date: value })} required />
                  <Input label={t.description} value={incomeForm.description} onChange={(value) => setIncomeForm({ ...incomeForm, description: value })} />
                  <FormButtons editing={editingIncome} t={t} cancel={() => { setEditingIncome(null); setIncomeForm(emptyIncome); }} />
                </form>
              </FormCard>
              <SectionTitle title={t.incomeRecords} />
              {getNumberedRows(financeIncome).length === 0 ? <Empty text={t.noData} /> : (
                <Table headers={["#", t.source, t.amount, t.date, t.description, t.action]}>
                  {getNumberedRows(financeIncome).map(({ item, serial }) => (
                    <tr key={item.id}><td>{serial}</td><td>{item.source}</td><td>{formatMoney(item.amount)}</td><td>{formatDisplayDate(item.date, language)}</td><td>{item.description}</td><td><ActionButtons edit={() => editIncome(item)} remove={() => deleteIncome(item.id)} t={t} /></td></tr>
                  ))}
                </Table>
              )}
            </Page>
          )}

          {/* EXPENSES */}
          {page === "expenses" && (
            <Page title={t.expenses}>
              <div className="payment-summary"><Stat number={formatMoney(financeExpenseTotal)} label={t.financeTotalExpense} code="EX" /></div>
              <FormCard title={editingExpense ? t.edit : t.recordExpense}>
                <form onSubmit={saveExpense} className="form-grid">
                  <Input label={t.expenseTitle} value={expenseForm.title} onChange={(value) => setExpenseForm({ ...expenseForm, title: value })} required />
                  <Input label={t.amount} type="number" value={expenseForm.amount} onChange={(value) => setExpenseForm({ ...expenseForm, amount: value })} required />
                  <Input label={t.category} value={expenseForm.category} onChange={(value) => setExpenseForm({ ...expenseForm, category: value })} />
                  <Input label={t.date} type="date" value={expenseForm.date} onChange={(value) => setExpenseForm({ ...expenseForm, date: value })} required />
                  <Input label={t.description} value={expenseForm.description} onChange={(value) => setExpenseForm({ ...expenseForm, description: value })} />
                  <FormButtons editing={editingExpense} t={t} cancel={() => { setEditingExpense(null); setExpenseForm(emptyExpense); }} />
                </form>
              </FormCard>
              <SectionTitle title={t.expenses} />
              {getNumberedRows(financeExpenses).length === 0 ? <Empty text={t.noData} /> : (
                <Table headers={["#", t.expenseTitle, t.amount, t.category, t.date, t.description, t.action]}>
                  {getNumberedRows(financeExpenses).map(({ item, serial }) => (
                    <tr key={item.id}><td>{serial}</td><td>{item.title}</td><td>{formatMoney(item.amount)}</td><td>{item.category}</td><td>{formatDisplayDate(item.date, language)}</td><td>{item.description}</td><td><ActionButtons edit={() => editExpense(item)} remove={() => deleteExpense(item.id)} t={t} /></td></tr>
                  ))}
                </Table>
              )}
            </Page>
          )}

          {/* DEBTS / RECEIVABLES */}
          {page === "debts" && (
            <Page title={t.debts}>
              <div className="payment-summary"><Stat number={formatMoney(financeReceivableTotal)} label={t.financeReceivable} code="DR" /></div>
              <FormCard title={editingDebt ? t.edit : t.recordDebt}>
                <form onSubmit={saveDebt} className="form-grid">
                  <Select label={t.customer} value={debtForm.customer_id} onChange={(value) => setDebtForm({ ...debtForm, customer_id: value })} required>
                    <option value="">{language === "fa" ? "انتخاب مشتری" : "Select customer"}</option>
                    {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                  </Select>
                  <Input label={t.amount} type="number" value={debtForm.amount} onChange={(value) => setDebtForm({ ...debtForm, amount: value })} required />
                  <Input label={t.paidAmount} type="number" value={debtForm.paid_amount} onChange={(value) => setDebtForm({ ...debtForm, paid_amount: value })} />
                  <Input label={t.dueDate} type="date" value={debtForm.due_date} onChange={(value) => setDebtForm({ ...debtForm, due_date: value })} />
                  <Select label={t.status} value={debtForm.status} onChange={(value) => setDebtForm({ ...debtForm, status: value })}>
                    <option value="Pending">{t.pending}</option><option value="Partially Paid">{t.partiallyPaid}</option><option value="Settled">{t.settled}</option>
                  </Select>
                  <Input label={t.description} value={debtForm.description} onChange={(value) => setDebtForm({ ...debtForm, description: value })} />
                  <FormButtons editing={editingDebt} t={t} cancel={() => { setEditingDebt(null); setDebtForm(emptyDebt); }} />
                </form>
              </FormCard>
              <SectionTitle title={t.debts} />
              {getNumberedRows(financeDebts).length === 0 ? <Empty text={t.noData} /> : (
                <Table headers={["#", t.customer, t.amount, t.paidAmount, t.remaining, t.dueDate, t.status, t.description, t.action]}>
                  {getNumberedRows(financeDebts).map(({ item, serial }) => { const remaining = Math.max(0, Number(item.amount || 0) - Number(item.paid_amount || 0)); return (
                    <tr key={item.id}><td>{serial}</td><td>{item.customer_name || getCustomerName(customers, item.customer_id)}</td><td>{formatMoney(item.amount)}</td><td>{formatMoney(item.paid_amount)}</td><td>{formatMoney(remaining)}</td><td>{formatDisplayDate(item.due_date, language)}</td><td><Status value={item.status} /></td><td>{item.description}</td><td><ActionButtons edit={() => editDebt(item)} remove={() => deleteDebt(item.id)} t={t} /></td></tr>
                  ); })}
                </Table>
              )}
            </Page>
          )}

          {/* PAYMENTS */}

          {page === "payments" && (
            <Page title={t.payments}>

              <div className="payment-summary">

                <Stat
                  number={formatMoney(
                    income
                  )}
                  label={t.income}
                  code="IN"
                />

                <Stat
                  number={formatMoney(
                    expense
                  )}
                  label={t.expense}
                  code="EX"
                />

                <Stat
                  number={formatMoney(
                    balance
                  )}
                  label={t.balance}
                  code="BL"
                />

              </div>

              <FormCard title={t.add}>

                <form
                  onSubmit={savePayment}
                  className="form-grid"
                >

                  <Select
                    label={t.customer}
                    value={
                      paymentForm.customer_id
                    }
                    onChange={(value) =>
                      setPaymentForm({
                        ...paymentForm,
                        customer_id: value,
                      })
                    }
                    required
                  >
                    <option value="">
                      Select customer
                    </option>

                    {customers.map(
                      (customer) => (
                        <option
                          key={customer.id}
                          value={customer.id}
                        >
                          {customer.name}
                        </option>
                      )
                    )}
                  </Select>

                  <Input
                    label={t.amount}
                    type="number"
                    value={
                      paymentForm.amount
                    }
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
                    value={
                      paymentForm.type
                    }
                    onChange={(value) =>
                      setPaymentForm({
                        ...paymentForm,
                        type: value,
                      })
                    }
                  >
                    <option value="Paid">
                      Paid
                    </option>

                    <option value="Unpaid">
                      Unpaid
                    </option>
                  </Select>

                  <Input
                    label={t.date}
                    type="date"
                    value={
                      paymentForm.date
                    }
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
                    value={
                      paymentForm.description
                    }
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
                      setEditingPayment(
                        null
                      );
                      setPaymentForm(
                        emptyPayment
                      );
                    }}
                  />

                </form>

              </FormCard>

              <SectionTitle
                title={t.payments}
              />

              {searchItems(payments)
                .length === 0 ? (
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

                        <td>
                          {serial}
                        </td>

                        <td>
                          {getCustomerName(
                            customers,
                            item.customer_id
                          )}
                        </td>

                        <td>
                          {formatMoney(
                            item.amount
                          )}
                        </td>

                        <td>
                          <Status
                            value={item.type}
                          />
                        </td>

                        <td>
                          {formatDisplayDate(
                            item.date,
                            language
                          )}
                        </td>

                        <td>
                          {item.description}
                        </td>

                        <td>
                          <ActionButtons
                            edit={() =>
                              editPayment(
                                item
                              )
                            }
                            remove={() =>
                              deletePayment(
                                item.id
                              )
                            }
                            t={t}
                          />
                        </td>

                      </tr>
                    )
                  )}
                </Table>
              )}

            </Page>
          )}

          {/* PROJECTS */}

          {page === "projects" && (
            <Page title={t.projects}>

              <FormCard title={t.add}>

                <form
                  onSubmit={saveProject}
                  className="form-grid"
                >

                  <Input
                    label={t.title}
                    value={
                      projectForm.title
                    }
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
                    value={
                      projectForm.description
                    }
                    onChange={(value) =>
                      setProjectForm({
                        ...projectForm,
                        description:
                          value,
                      })
                    }
                  />

                  <Select
                    label={t.assignedUser}
                    value={
                      projectForm.user_id
                    }
                    onChange={(value) =>
                      setProjectForm({
                        ...projectForm,
                        user_id: value,
                      })
                    }
                    required
                  >
                    <option value="">
                      Select user
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
                    value={
                      projectForm.status
                    }
                    onChange={(value) =>
                      setProjectForm({
                        ...projectForm,
                        status: value,
                      })
                    }
                  >
                    <option value="Pending">
                      Pending
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>
                  </Select>

                  <Input
                    label={t.deadline}
                    type="date"
                    value={
                      projectForm.deadline
                    }
                    onChange={(value) =>
                      setProjectForm({
                        ...projectForm,
                        deadline: value,
                      })
                    }
                  />

                  <Input
                    label={t.projectEmployee}
                    value={
                      projectForm.employee
                    }
                    onChange={(value) =>
                      setProjectForm({
                        ...projectForm,
                        employee: value,
                      })
                    }
                  />

                  <Input
                    label={t.testing}
                    value={
                      projectForm.testing
                    }
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
                    value={
                      projectForm.end_date
                    }
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
                      setEditingProject(
                        null
                      );
                      setProjectForm(
                        emptyProject
                      );
                    }}
                  />

                </form>

              </FormCard>

              <SectionTitle
                title={t.projects}
              />

              {searchItems(projects)
                .length === 0 ? (
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

                        <td>
                          {serial}
                        </td>

                        <td>
                          {item.title}
                        </td>

                        <td>
                          {item.user_name ||
                            getUserName(
                              users,
                              item.user_id
                            )}
                        </td>

                        <td>
                          <Status
                            value={
                              item.status
                            }
                          />
                        </td>

                        <td>
                          {formatDisplayDate(
                            item.deadline,
                            language
                          )}

                          {deadlineInfo(
                            item.deadline
                          )}
                        </td>

                        <td>
                          {item.employee}
                        </td>

                        <td>
                          {item.testing}
                        </td>

                        <td>
                          {formatDisplayDate(
                            item.end_date,
                            language
                          )}
                        </td>

                        <td>
                          <ActionButtons
                            edit={() =>
                              editProject(
                                item
                              )
                            }
                            remove={() =>
                              deleteProject(
                                item.id
                              )
                            }
                            t={t}
                          />
                        </td>

                      </tr>
                    )
                  )}
                </Table>
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

                      <button
                        className={
                          settings[key]
                            ? "toggle on"
                            : "toggle"
                        }
                        onClick={() =>
                          toggleSetting(key)
                        }
                      >
                        <span />

                        {settings[key]
                          ? t.on
                          : t.off}
                      </button>

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
    >
      <span>
        {icon}
      </span>

      {label}
    </button>
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
    <div className="form-card">

      <div className="form-card-title">
        {title}
      </div>

      {children}

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

`;

export default App;