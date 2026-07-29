(function () {
  var config = window.PushGiantWP;
  if (!config || !config.projectId || !config.apiUrl) return;

  var script = document.createElement('script');
  script.async = true;
  script.src = config.apiUrl.replace(/\/$/, '') + '/sdk/pushgiant.js';
  script.onload = function () {
    if (!window.PushGiant) return;
    window.PushGiant.init({
      projectId: config.projectId,
      apiUrl: config.apiUrl,
      serviceWorkerPath: config.serviceWorkerPath || '/pushgiant-sw.js'
    });
  };
  document.head.appendChild(script);
})();
