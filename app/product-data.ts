export const marketingNav = [
  { href: "/#features", label: "Возможности" },
  { href: "/pricing", label: "Тарифы" },
  { href: "/wordpress", label: "WordPress" },
  { href: "/bitrix", label: "Bitrix" },
  { href: "/docs", label: "Документация" }
];

export const productSections = [
  {
    title: "PWA за 15 минут",
    text: "Manifest, service worker, установка на экран телефона и честная инструкция для iOS без переделки сайта."
  },
  {
    title: "Web Push",
    text: "Подписка, heartbeat, статусы устройств, очередь отправки, retries и статистика доставок."
  },
  {
    title: "Кабинет клиента",
    text: "Подписчики, рассылки, сегменты, PWA-настройки, интеграции, тариф и команда в одном месте."
  },
  {
    title: "Интеграции",
    text: "WordPress-плагин уже в MVP, Bitrix и RetailCRM заложены как следующие коннекторы."
  }
];

export const pricingPlans = [
  {
    name: "Trial",
    price: "0 ₽",
    note: "14 дней или 100 push",
    features: ["Организация и проект", "API key", "WordPress plugin", "Базовая аналитика"]
  },
  {
    name: "Start",
    price: "5 000 ₽/мес",
    note: "для первого сайта",
    features: ["До 10 000 push", "1 проект", "PWA install", "Email support"]
  },
  {
    name: "Business",
    price: "15 000 ₽/мес",
    note: "для e-commerce",
    features: ["До 100 000 push", "Сегменты", "WooCommerce события", "Приоритетная поддержка"]
  },
  {
    name: "Pro",
    price: "45 000 ₽/мес",
    note: "для сети проектов",
    features: ["До 500 000 push", "Geo push", "Mindbox/RetailCRM", "Команда и роли"]
  },
  {
    name: "Enterprise",
    price: "по договору",
    note: "on-premise и SLA",
    features: ["Выделенный контур", "Бэкапы и мониторинг", "Интеграции под ТЗ", "SLA и аудит"]
  }
];

export const dashboardSections = [
  "Обзор",
  "Подписчики",
  "Рассылки",
  "Сегменты",
  "Геопуш",
  "PWA",
  "Интеграции",
  "Аналитика",
  "Тариф",
  "Команда",
  "Настройки"
];

export const integrationCards = [
  ["WordPress", "Готовый ZIP", "Настройки API key, SDK loader, manifest и service worker route."],
  ["Bitrix", "Следующий модуль", "Публичный план подключения каталога, корзины, заказов и auth user."],
  ["Universal JS", "Работает через SDK", "Для любых сайтов без CMS: init, subscribe, heartbeat, track, geo."]
];
