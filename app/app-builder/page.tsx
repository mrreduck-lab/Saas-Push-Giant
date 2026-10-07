import type { Metadata } from "next";
import "./app-builder.css";

export const metadata: Metadata = {
  title: "App Builder — превратите сайт в PWA, iOS и Android приложение",
  description:
    "Введите адрес сайта — Push Giant подготовит мобильный контур: PWA, iOS и Android приложение, push-уведомления и единое управление.",
  alternates: { canonical: "/app-builder" },
  openGraph: {
    title: "Введите адрес сайта → получите PWA, iOS и Android приложение",
    description:
      "Push Giant превращает существующий сайт в мобильный продукт без разработки нового сайта с нуля.",
    url: "https://pushgiant.ru/app-builder",
  },
};

const steps = [
  {
    number: "01",
    title: "Введите адрес сайта",
    text: "Push Giant определяет CMS, мобильную версию, manifest, API, авторизацию, каталог и доступные интеграции.",
  },
  {
    number: "02",
    title: "Платформа собирает приложение",
    text: "Контент и бизнес-логика остаются на вашем сайте. Push Giant добавляет мобильную оболочку, навигацию и нативные возможности.",
  },
  {
    number: "03",
    title: "Получите три мобильных канала",
    text: "PWA для быстрой установки, iOS-приложение для App Store и Android-приложение для Google Play.",
  },
];

const capabilities = [
  ["PWA", "Установка с сайта", "Manifest, service worker, иконка на экране и Web Push."],
  ["iOS", "Native shell", "Capacitor-оболочка, APNs, deep links, share и готовность к TestFlight."],
  ["Android", "Native shell", "Capacitor-оболочка, FCM, deep links и сборка Android App Bundle."],
  ["Push", "Одна кампания", "Web Push, APNs и FCM управляются из одного проекта Push Giant."],
  ["CMS", "Сайт остаётся источником", "WordPress/WooCommerce — первый guided flow; для других сайтов доступен universal mode."],
  ["Analytics", "Единая воронка", "Установки, устройства, подписки, открытия push и события сайта в одном проекте."],
];

const nativeFeatures = [
  "Push-уведомления",
  "Deep links",
  "Нативная навигация",
  "Share",
  "Offline / no connection screen",
  "Splash screen и иконки",
  "Профиль и авторизация",
  "Готовность к Wallet и QR",
];

export default function AppBuilderLanding() {
  return (
    <main className="ab">
      <header className="abHeader">
        <a className="abBrand" href="/">Push Giant</a>
        <nav aria-label="App Builder navigation">
          <a href="#how">Как работает</a>
          <a href="#result">Что получите</a>
          <a href="#compatibility">Совместимость</a>
          <a href="/pricing">Тарифы</a>
        </nav>
        <a className="abHeaderCta" href="/register?flow=app-builder">Ранний доступ</a>
      </header>

      <section className="abHero">
        <div className="abHeroCopy">
          <p className="abEyebrow">Push Giant App Builder · early access</p>
          <h1>
            Введите адрес сайта
            <span>→ получите PWA, iOS и Android приложение</span>
          </h1>
          <p className="abLead">
            Не создавайте второй сайт и не переносите каталог вручную. Ваш сайт остаётся источником
            контента и бизнес-логики, а Push Giant добавляет мобильный слой и единый push-канал.
          </p>

          <form className="abUrlForm" action="/register" method="get">
            <input type="hidden" name="flow" value="app-builder" />
            <label htmlFor="siteUrl">Адрес сайта</label>
            <div>
              <input
                id="siteUrl"
                name="siteUrl"
                type="url"
                inputMode="url"
                placeholder="https://example.com"
                required
              />
              <button type="submit">Создать приложение</button>
            </div>
            <small>PWA уже доступен в Push Giant. iOS и Android App Builder запускается в раннем доступе.</small>
          </form>
        </div>

        <div className="abDeviceStage" aria-label="Схема сайта и мобильных приложений">
          <div className="abSourceCard">
            <span>01 / source</span>
            <strong>your-site.ru</strong>
            <small>WordPress · WooCommerce · CMS · custom site</small>
          </div>

          <div className="abFlowLine">
            <i />
            <b>Push Giant</b>
            <i />
          </div>

          <div className="abDevices">
            <article>
              <span>PWA</span>
              <div className="abPhone">
                <small>Home Screen</small>
                <strong>PG</strong>
                <em>Install</em>
              </div>
            </article>
            <article>
              <span>iOS</span>
              <div className="abPhone">
                <small>App Store</small>
                <strong>PG</strong>
                <em>APNs</em>
              </div>
            </article>
            <article>
              <span>Android</span>
              <div className="abPhone">
                <small>Google Play</small>
                <strong>PG</strong>
                <em>FCM</em>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="how" className="abSection abHow">
        <div className="abSectionHead">
          <p className="abEyebrow">Как это работает</p>
          <h2>Один URL вместо отдельного mobile-проекта</h2>
        </div>
        <div className="abSteps">
          {steps.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="result" className="abSection abDark">
        <div className="abSectionHead">
          <p className="abEyebrow">Что получает бизнес</p>
          <h2>Не WebView-клон. Мобильный слой поверх существующего сайта.</h2>
          <p>
            Сайт продолжает управлять контентом, товарами и ценами. Приложение получает мобильную
            навигацию и функции устройства, а Push Giant связывает web, iOS и Android в один проект.
          </p>
        </div>

        <div className="abCapabilityGrid">
          {capabilities.map(([title, kicker, text]) => (
            <article key={title}>
              <span>{kicker}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="compatibility" className="abSection abCompatibility">
        <div>
          <p className="abEyebrow">Совместимость</p>
          <h2>Начинаем с WordPress. Архитектура — для любого сайта.</h2>
          <p className="abBody">
            Для WordPress и WooCommerce Push Giant может использовать наш плагин и REST API. Для
            других CMS сначала проверяем доступные API. Если API нет, приложение может работать в
            universal shell mode без хрупкого HTML-парсинга.
          </p>
          <div className="abBadges">
            <span>WordPress</span>
            <span>WooCommerce</span>
            <span>REST API</span>
            <span>Universal site</span>
          </div>
        </div>

        <div className="abNativeCard">
          <p>Native layer</p>
          {nativeFeatures.map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>

      <section className="abSection abPromise">
        <p className="abEyebrow">Продуктовое обещание</p>
        <blockquote>
          «Введите адрес сайта → получите PWA, iOS и Android приложение»
        </blockquote>
        <p>
          PWA-контур уже работает. Native App Builder развивается как следующий слой Push Giant и
          открывается первым пилотам по мере готовности сборок iOS и Android.
        </p>
        <div className="abActions">
          <a className="abPrimary" href="/register?flow=app-builder">Присоединиться к раннему доступу</a>
          <a href="/wordpress">Посмотреть WordPress-интеграцию</a>
        </div>
      </section>

      <footer className="abFooter">
        <a className="abBrand" href="/">Push Giant</a>
        <p>Website → PWA → iOS → Android</p>
        <nav>
          <a href="/register?flow=app-builder">Ранний доступ</a>
          <a href="/docs">Документация</a>
          <a href="/login">Вход</a>
        </nav>
      </footer>
    </main>
  );
}
