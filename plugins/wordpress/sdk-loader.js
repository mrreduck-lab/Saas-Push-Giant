(function () {
  var config = window.PushGiantWP;
  if (!config || !config.projectId || !config.apiUrl) return;

  var script = document.createElement('script');
  script.async = true;
  script.src = config.apiUrl.replace(/\/$/, '') + '/sdk/pushgiant.js';
  script.onload = function () {
    if (!window.PushGiant) return;
    var client = window.PushGiant.init({
      projectId: config.projectId,
      apiUrl: config.apiUrl,
      serviceWorkerPath: config.serviceWorkerPath || '/pushgiant-sw.js',
      externalSource: config.externalSource || 'wordpress'
    });

    if (config.promptEnabled !== false) {
      renderPrompt(client, config);
    }
  };
  document.head.appendChild(script);

  function renderPrompt(client, config) {
    if (!client || !client.isSupported || !client.isSupported()) return;
    if (window.Notification && Notification.permission === 'denied') return;
    if (document.querySelector('[data-pushgiant-prompt]')) return;

    var button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('data-pushgiant-prompt', 'true');
    button.innerHTML = '<span></span><small></small>';
    button.querySelector('span').textContent = config.buttonLabel || 'Получать новости';
    button.querySelector('small').textContent = config.buttonNote || 'Уведомления о новых поступлениях';

    var style = document.createElement('style');
    style.textContent = [
      '[data-pushgiant-prompt]{position:fixed;z-index:2147483000;right:18px;bottom:max(18px,env(safe-area-inset-bottom));max-width:320px;padding:14px 17px;border:1px solid rgba(155,120,68,.42);border-radius:0;background:rgba(246,241,234,.96);color:#17130f;text-align:left;box-shadow:0 12px 38px rgba(0,0,0,.14);cursor:pointer}',
      '[data-pushgiant-prompt] span{display:block;font-family:Georgia,serif;font-size:18px;line-height:1.1}',
      '[data-pushgiant-prompt] small{display:block;margin-top:6px;font-size:10px;line-height:1.4;letter-spacing:.08em;text-transform:uppercase;color:#826b4d}',
      '[data-pushgiant-prompt][disabled]{opacity:.68;cursor:wait}',
      '@media(max-width:600px){[data-pushgiant-prompt]{left:14px;right:14px;bottom:max(14px,env(safe-area-inset-bottom));max-width:none}}'
    ].join('');

    button.addEventListener('click', function () {
      button.disabled = true;
      button.querySelector('span').textContent = 'Подключаем...';
      button.querySelector('small').textContent = '';

      client.subscribe().then(function (result) {
        if (result.status === 'subscribed') {
          button.querySelector('span').textContent = 'Уведомления включены';
          button.querySelector('small').textContent = 'Спасибо, всё готово';
          setTimeout(function () { button.remove(); }, 1800);
          return;
        }

        button.disabled = false;
        button.querySelector('span').textContent = result.status === 'denied' ? 'Разрешение отклонено' : 'Не поддерживается';
        button.querySelector('small').textContent = result.status === 'denied' ? 'Можно включить в настройках браузера' : 'Этот браузер не принимает web push';
      }).catch(function () {
        button.disabled = false;
        button.querySelector('span').textContent = 'Не удалось подключить';
        button.querySelector('small').textContent = 'Попробуйте ещё раз';
      });
    });

    document.head.appendChild(style);
    document.body.appendChild(button);
  }
})();