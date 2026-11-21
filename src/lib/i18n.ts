import { usePos, type Language } from "./pos-store";

// Built-in English/Arabic dictionary. Stored data (order types, categories, statuses)
// stays in English; only on-screen labels are translated.
const en = {
  cashier: "Cashier", activeOrders: "Active Orders", customerDisplay: "Customer Display", inventory: "Inventory",
  by: "by", connected: "Connected", offline: "Offline", toggleConnection: "Toggle connection (demo)",
  admin: "Admin", settingsReports: "POS Settings / Reports", reports: "Reports", language: "العربية",
  storageError: "Changes cannot be saved in this browser. Check available storage.",
  searchProduct: "Search product or scan barcode…", soldOut: "Sold out", left: "{n} left", noProducts: "No products match.",
  currentOrder: "Current order", items: "{n} items", orderType: "Order Type", pagerNo: "Pager No.", optional: "(optional)",
  held: "Held #{n}", tapToAdd: "Tap a product to add", itemNote: "Special Request / Item Note", specialRequestFor: "Special Request for {name}",
  specialRequest: "Special Request", decrease: "Decrease", increase: "Increase", remove: "Remove",
  seniorDiscount: "Senior/PWD 20%", vat12: "VAT 12%", vat: "VAT", subtotal: "Subtotal", discount: "Discount", tax: "Tax", total: "Total",
  hold: "Hold", cancel: "Cancel", selectOrderType: "Select an order type to continue.", charge: "Charge",
  notSpecified: "Not specified", "Dine In": "Dine In", "Take Out": "Take Out", Delivery: "Delivery",
  All: "All", Coffee: "Coffee", "Non-Coffee": "Non-Coffee", Pastries: "Pastries", Meals: "Meals", Retail: "Retail",
  paymentSuccessful: "Payment successful", sentToKitchen: "Order #{n} sent to kitchen", change: "Change", newSale: "New sale",
  close: "Close", cashTendered: "Cash tendered", payment: "{m} payment", confirmPayment: "Confirm payment",
  Cash: "Cash", Card: "Card", GCash: "GCash",
  Pending: "Pending", Preparing: "Preparing", Ready: "Ready", start: "Start", markReady: "Mark ready", tapDone: "Tap to done",
  min: "{n} min", noOrders: "No orders",
  yourOrder: "Your order", welcome: "Welcome!", itemsAppear: "Your items will appear here.", amountDue: "Amount due", thankYou: "Thank you for choosing us!",
  products: "Products", lowStock: "Low stock", stockValue: "Stock value", product: "Product", category: "Category", barcode: "Barcode", price: "Price", stock: "Stock",
  decreaseStock: "Decrease stock", increaseStock: "Increase stock",
  reportsTitle: "Reports & Transactions", reportSections: "Report sections", latestTransactions: "Latest Transactions", endOfDay: "End of Day", calendarHistory: "Calendar History",
  eodIssued: "EOD report issued", printEod: "End of Day / Print Report", printReport: "Print report", totalTransactions: "Total transactions",
  grossSales: "Gross sales", collected: "Collected", transactionLog: "Transaction log", transactions: "{n} transactions", order: "Order #{n}",
  noTransactions: "No transactions for this period",
  adminAccess: "Admin access", pin: "4-digit PIN", wrongPin: "Incorrect PIN. Try again.", unlock: "Unlock admin", administration: "Administration", adminSections: "Admin sections",
  "Store Details": "Store Details", "Product Details & Inventory": "Product Details & Inventory", "POS Settings": "POS Settings", "Staffs Management": "Staffs Management", "Customer Details": "Customer Details",
  storeName: "Store Name", ownerName: "Owner Name", logo: "Logo URL/Path", address: "Address", contactNumber: "Contact Number", instagram: "Instagram handle",
  saveStore: "Save store details", saved: "Saved", stockReport: "Inventory Stock Report", unitsInStock: "Units in stock", lowOut: "Low / out of stock", retailValue: "Stock retail value",
  backToProducts: "Back to products", productName: "Product name", productSymbol: "Product symbol", saveProduct: "Save product", searchInventory: "Search inventory…", addProduct: "Add product",
  actions: "Actions", noBarcode: "No barcode", edit: "Edit {name}", editProduct: "Edit product", removeName: "Remove {name}", removeProduct: "Remove product", removeConfirm: "Remove this product?", keep: "Keep",
  noProductsYet: "No products", barcodeTaken: "Barcode is already assigned to another product.", productSaved: "Product saved.",
  paymentError: "Add at least one payment option. Names must be unique and not empty.", itemDiscounts: "Item Discounts", currency: "Currency", paymentOptions: "Payment Options",
  paymentOption: "Payment option {n}", removePaymentOption: "Remove payment option {n}", addPaymentOption: "Add payment option", saveSettings: "Save POS settings",
  cashierName: "Cashier name", customerName: "Customer name", contactEmail: "Contact / email", addStaff: "Add staff", addCustomer: "Add customer",
  cashiers: "{n} cashiers", customers: "{n} customers", search: "Search…", noCashiers: "No cashiers yet", noCustomers: "No customers yet", removeStaff: "Remove staff", removeCustomer: "Remove customer",
};
export type TKey = keyof typeof en;
const ar: Record<TKey, string> = {
  cashier: "الكاشير", activeOrders: "الطلبات النشطة", customerDisplay: "شاشة العميل", inventory: "المخزون",
  by: "من", connected: "متصل", offline: "غير متصل", toggleConnection: "تبديل الاتصال (تجريبي)",
  admin: "الإدارة", settingsReports: "إعدادات نقطة البيع / التقارير", reports: "التقارير", language: "English",
  storageError: "لا يمكن حفظ التغييرات في هذا المتصفح. تحقق من مساحة التخزين.",
  searchProduct: "ابحث عن منتج أو امسح الباركود…", soldOut: "نفد", left: "متبقي {n}", noProducts: "لا توجد منتجات مطابقة.",
  currentOrder: "الطلب الحالي", items: "{n} عناصر", orderType: "نوع الطلب", pagerNo: "رقم جهاز النداء", optional: "(اختياري)",
  held: "معلّق #{n}", tapToAdd: "اضغط على منتج لإضافته", itemNote: "طلب خاص / ملاحظة الصنف", specialRequestFor: "طلب خاص لـ {name}",
  specialRequest: "طلب خاص", decrease: "إنقاص", increase: "زيادة", remove: "إزالة",
  seniorDiscount: "خصم كبار السن/ذوي الإعاقة 20%", vat12: "ضريبة القيمة المضافة 12%", vat: "الضريبة", subtotal: "المجموع الفرعي", discount: "الخصم", tax: "الضريبة", total: "الإجمالي",
  hold: "تعليق", cancel: "إلغاء", selectOrderType: "اختر نوع الطلب للمتابعة.", charge: "الدفع",
  notSpecified: "غير محدد", "Dine In": "محلي", "Take Out": "سفري", Delivery: "توصيل",
  All: "الكل", Coffee: "قهوة", "Non-Coffee": "مشروبات بدون قهوة", Pastries: "معجنات", Meals: "وجبات", Retail: "منتجات للبيع",
  paymentSuccessful: "تم الدفع بنجاح", sentToKitchen: "تم إرسال الطلب #{n} للتحضير", change: "الباقي", newSale: "عملية بيع جديدة",
  close: "إغلاق", cashTendered: "المبلغ المستلم نقدًا", payment: "دفع {m}", confirmPayment: "تأكيد الدفع",
  Cash: "نقدًا", Card: "بطاقة", GCash: "GCash",
  Pending: "قيد الانتظار", Preparing: "قيد التحضير", Ready: "جاهز", start: "ابدأ", markReady: "تحديد كجاهز", tapDone: "اضغط للإنهاء",
  min: "{n} د", noOrders: "لا توجد طلبات",
  yourOrder: "طلبك", welcome: "أهلاً وسهلاً!", itemsAppear: "ستظهر أصنافك هنا.", amountDue: "المبلغ المستحق", thankYou: "شكرًا لاختيارك لنا!",
  products: "المنتجات", lowStock: "مخزون منخفض", stockValue: "قيمة المخزون", product: "المنتج", category: "الفئة", barcode: "الباركود", price: "السعر", stock: "المخزون",
  decreaseStock: "إنقاص المخزون", increaseStock: "زيادة المخزون",
  reportsTitle: "التقارير والمعاملات", reportSections: "أقسام التقارير", latestTransactions: "أحدث المعاملات", endOfDay: "نهاية اليوم", calendarHistory: "سجل التقويم",
  eodIssued: "تم إصدار تقرير نهاية اليوم", printEod: "نهاية اليوم / طباعة التقرير", printReport: "طباعة التقرير", totalTransactions: "إجمالي المعاملات",
  grossSales: "إجمالي المبيعات", collected: "المحصّل", transactionLog: "سجل المعاملات", transactions: "{n} معاملات", order: "الطلب #{n}",
  noTransactions: "لا توجد معاملات لهذه الفترة",
  adminAccess: "دخول الإدارة", pin: "رمز PIN من 4 أرقام", wrongPin: "رمز PIN غير صحيح. حاول مرة أخرى.", unlock: "فتح الإدارة", administration: "الإدارة", adminSections: "أقسام الإدارة",
  "Store Details": "بيانات المتجر", "Product Details & Inventory": "المنتجات والمخزون", "POS Settings": "إعدادات نقطة البيع", "Staffs Management": "إدارة الموظفين", "Customer Details": "بيانات العملاء",
  storeName: "اسم المتجر", ownerName: "اسم المالك", logo: "رابط/مسار الشعار", address: "العنوان", contactNumber: "رقم التواصل", instagram: "حساب إنستغرام",
  saveStore: "حفظ بيانات المتجر", saved: "تم الحفظ", stockReport: "تقرير المخزون", unitsInStock: "الوحدات المتوفرة", lowOut: "منخفض / نافد", retailValue: "قيمة المخزون بسعر البيع",
  backToProducts: "العودة للمنتجات", productName: "اسم المنتج", productSymbol: "رمز المنتج", saveProduct: "حفظ المنتج", searchInventory: "ابحث في المخزون…", addProduct: "إضافة منتج",
  actions: "إجراءات", noBarcode: "بدون باركود", edit: "تعديل {name}", editProduct: "تعديل المنتج", removeName: "إزالة {name}", removeProduct: "إزالة المنتج", removeConfirm: "إزالة هذا المنتج؟", keep: "إبقاء",
  noProductsYet: "لا توجد منتجات", barcodeTaken: "الباركود مستخدم لمنتج آخر.", productSaved: "تم حفظ المنتج.",
  paymentError: "أضف خيار دفع واحدًا على الأقل. يجب أن تكون الأسماء فريدة وغير فارغة.", itemDiscounts: "خصومات الأصناف", currency: "العملة", paymentOptions: "خيارات الدفع",
  paymentOption: "خيار الدفع {n}", removePaymentOption: "إزالة خيار الدفع {n}", addPaymentOption: "إضافة خيار دفع", saveSettings: "حفظ الإعدادات",
  cashierName: "اسم الكاشير", customerName: "اسم العميل", contactEmail: "التواصل / البريد", addStaff: "إضافة موظف", addCustomer: "إضافة عميل",
  cashiers: "{n} كاشير", customers: "{n} عملاء", search: "بحث…", noCashiers: "لا يوجد كاشير بعد", noCustomers: "لا يوجد عملاء بعد", removeStaff: "إزالة الموظف", removeCustomer: "إزالة العميل",
};
export const dictionaries: Record<Language, Record<TKey, string>> = { en, ar };

export function translate(lang: Language, key: TKey, vars?: Record<string, string | number>) {
  let s = dictionaries[lang][key] ?? en[key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}
/** Translate a stored English value (order type, category, status, payment name) if known. */
export function translateValue(lang: Language, value: string) {
  return value in en ? translate(lang, value as TKey) : value;
}
export function useT() {
  const lang = usePos((s) => s.language);
  const t = (key: TKey, vars?: Record<string, string | number>) => translate(lang, key, vars);
  const tv = (value: string) => translateValue(lang, value);
  return { t, tv, lang, dir: lang === "ar" ? "rtl" as const : "ltr" as const };
}
