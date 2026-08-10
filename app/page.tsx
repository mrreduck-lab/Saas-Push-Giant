import type { Metadata } from "next";

import { integrationCards, marketingNav, pricingPlans, productSections } from "./product-data";
import "./marketing.css";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Push Giant",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://pushgiant.ru",
  description: "SaaS-платформа для PWA-приложений, web push-уведомлений, сегментации и аналитики.",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "0",
    highPrice: "45000",
    priceCurrency: "RUB",
    offerCount: "4",
  },
};

const launchSteps = [
  "Регистрация и trial",
  "Создание проекта",
  "Установка WordPress plugin",
  "Первый подписчик",
  "Первая push-рассылка"
];

const installSteps = [
  ["1", "Откройте с телефона", "Начните с регистрации или demo-кабинета, чтобы увидеть сценарий как будущий клиент."],
  ["2", "Добавьте на экран Домой", "iPhone: Поделиться -> На экран Домой. Android: меню браузера -> Установить приложение."],
  ["3", "Запустите с иконки", "Для iPhone push работает только в установленном PWA, а не в обычной Safari-вкладке."],
  ["4", "Разрешите уведомления", "Сначала покажем понятный текст согласия, потом появится стандартный системный popup."],
  ["5", "Отправьте push себе", "Кабинет создаст временную тестовую подписку, отправит один push и сразу сбросит её."]
];

const buildSha = process.env.NEXT_PUBLIC_GIT_SHA?.slice(0, 7) ?? "local";

export default function PushGiantHome() {
  return (
    <main className="pg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="pgHeader">
        <a className="pgBrand" href="/">Push Giant</a>
        <nav>
          {marketingNav.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          <a href="/login">Вход</a>
        </nav>
        <a className="pgHeaderCta" href="/register">Начать trial</a>
      </header>

      <section className="pgHero">
        <div>
          <p className="pgKicker">PWA push platform</p>
          <h1>Мобильный маркетинг поверх любого сайта</h1>
          <p className="pgLead">
            Push Giant добавляет PWA, установку на главный экран, web push, аналитику и CMS-плагины
            без переписывания существующего сайта.
          </p>
          <div className="pgActions">
            <a className="pgPrimary" href="#install-test">Установить и протестировать</a>
            <a href="/dashboard">Открыть кабинет</a>
            <a href="/downloads/pushgiant-wordpress.zip">Скачать WordPress ZIP</a>
          </div>
        </div>
        <div className="pgConsole" aria-label="Возможности платформы">
          <span>Единая платформа</span>
          <strong>PWA, push, аналитика и интеграции</strong>
          <small>Один кабинет для установки приложения, подписчиков и персональных рассылок.</small>
          <div>
            <b>readyz</b>
            <code>{`{"database":true,"redis":true}`}</code>
          </div>
        </div>
      </section>

      <section id="install-test" className="pgInstallTest">
        <div className="pgInstallIntro">
          <p className="pgKicker">Install and test</p>
          <h2>PWA показывает бизнесу эффект до интеграции</h2>
          <p>
            PWA превращает сайт в приложение на экране телефона: пользователь открывает его с иконки,
            остаётся в брендированном интерфейсе и может получать web push без App Store и Google Play.
            Для бизнеса это быстрый канал повторных касаний, возврата клиентов и персональных предложений.
          </p>
          <div className="pgActions">
            <a className="pgPrimary" href="/register?flow=install-test">Регистрация и тест</a>
            <a href="/dashboard?flow=install-test">Открыть demo кабинет</a>
          </div>
        </div>
        <div className="pgInstallSteps">
          {installSteps.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <small>{text}</small>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="pgBand">
        <p className="pgKicker">MVP scope</p>
        <h2>Путь владельца сайта за 15-20 минут</h2>
        <div className="pgSteps">
          {launchSteps.map((step, index) => (
            <article key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="pgGrid">
        {productSections.map((section) => (
          <article key={section.title}>
            <h3>{section.title}</h3>
            <p>{section.text}</p>
          </article>
        ))}
      </section>

      <section className="pgSplit">
        <div>
          <p className="pgKicker">Client dashboard</p>
          <h2>Кабинет, админка и отправка push в одном интерфейсе</h2>
          <p>
            Текущий кабинет подключается к Core API, показывает подписчиков, создаёт кампанию и ставит
            её в BullMQ. Новые вкладки закрывают сегменты, геопуш, тариф, команду и настройки.
          </p>
          <a className="pgPrimary" href="/dashboard">Перейти в кабинет</a>
        </div>
        <div className="pgChecklist">
          {["Подписчики", "Рассылки", "Сегменты", "Геопуш", "PWA", "Интеграции", "Тарифы"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="pgBand">
        <p className="pgKicker">Pricing</p>
        <h2>Тарифы для запуска и роста</h2>
        <div className="pgPricing">
          {pricingPlans.slice(0, 4).map((plan) => (
            <article key={plan.name}>
              <span>{plan.name}</span>
              <strong>{plan.price}</strong>
              <small>{plan.note}</small>
              <a href="/pricing">Подробнее</a>
            </article>
          ))}
        </div>
      </section>

      <section className="pgGrid pgIntegrations">
        {integrationCards.map(([name, status, text]) => (
          <article key={name}>
            <span>{status}</span>
            <h3>{name}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <footer className="pgFooter">
        <div>
          <strong>Push Giant</strong>
          <small>main {buildSha} · deploy check 0807-3</small>
        </div>
        <nav>
          <a href="/register">Регистрация</a>
          <a href="/pricing">Тарифы</a>
          <a href="/wordpress">WordPress</a>
          <a href="/docs">Документация</a>
        </nav>
      </footer>

    </main>
  );
}
