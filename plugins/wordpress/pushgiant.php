<?php
/**
 * Plugin Name: Push Giant
 * Description: Connects a WordPress site to Push Giant PWA and Web Push.
 * Version: 0.1.1
 * Author: Push Giant
 */

if (!defined('ABSPATH')) {
    exit;
}

define('PUSHGIANT_VERSION', '0.1.1');
define('PUSHGIANT_OPTION_PROJECT_ID', 'pushgiant_project_id');
define('PUSHGIANT_OPTION_API_KEY', 'pushgiant_api_key');
define('PUSHGIANT_OPTION_API_URL', 'pushgiant_api_url');
define('PUSHGIANT_OPTION_PROMPT_ENABLED', 'pushgiant_prompt_enabled');

add_action('admin_menu', function () {
    add_options_page('Push Giant', 'Push Giant', 'manage_options', 'pushgiant', 'pushgiant_render_settings_page');
});

add_action('admin_init', function () {
    register_setting('pushgiant', PUSHGIANT_OPTION_PROJECT_ID);
    register_setting('pushgiant', PUSHGIANT_OPTION_API_KEY);
    register_setting('pushgiant', PUSHGIANT_OPTION_API_URL);
    register_setting('pushgiant', PUSHGIANT_OPTION_PROMPT_ENABLED);
});

register_activation_hook(__FILE__, function () {
    if (get_option(PUSHGIANT_OPTION_PROMPT_ENABLED, null) === null) {
        update_option(PUSHGIANT_OPTION_PROMPT_ENABLED, '1');
    }

    pushgiant_register_service_worker_route();
    flush_rewrite_rules();
});

register_deactivation_hook(__FILE__, function () {
    flush_rewrite_rules();
});

add_action('init', 'pushgiant_register_service_worker_route');

add_filter('query_vars', function ($vars) {
    $vars[] = 'pushgiant_sw';
    return $vars;
});

add_action('template_redirect', function () {
    if ((string) get_query_var('pushgiant_sw') !== '1') {
        return;
    }

    pushgiant_service_worker_response();
    exit;
});

add_action('wp_enqueue_scripts', function () {
    $project_id = trim((string) get_option(PUSHGIANT_OPTION_PROJECT_ID));
    if ($project_id === '') {
        return;
    }

    $api_url = rtrim((string) get_option(PUSHGIANT_OPTION_API_URL, 'https://api.pushgiant.ru'), '/');
    wp_enqueue_script('pushgiant-sdk', plugins_url('sdk-loader.js', __FILE__), [], PUSHGIANT_VERSION, true);
    wp_add_inline_script(
        'pushgiant-sdk',
        sprintf(
            'window.PushGiantWP = %s;',
            wp_json_encode([
                'projectId' => $project_id,
                'apiUrl' => $api_url,
                'serviceWorkerPath' => '/pushgiant-sw.js',
                'externalSource' => 'wordpress',
                'promptEnabled' => get_option(PUSHGIANT_OPTION_PROMPT_ENABLED, '1') === '1',
                'buttonLabel' => 'Получать новости',
                'buttonNote' => 'Новые поступления и персональные предложения',
            ])
        ),
        'before'
    );
});

add_action('rest_api_init', function () {
    register_rest_route('pushgiant/v1', '/manifest', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => 'pushgiant_manifest_response',
    ]);
});

function pushgiant_render_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    ?>
    <div class="wrap">
        <h1>Push Giant</h1>
        <form method="post" action="options.php">
            <?php settings_fields('pushgiant'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="pushgiant_project_id">Project ID</label></th>
                    <td><input class="regular-text" id="pushgiant_project_id" name="<?php echo esc_attr(PUSHGIANT_OPTION_PROJECT_ID); ?>" value="<?php echo esc_attr(get_option(PUSHGIANT_OPTION_PROJECT_ID)); ?>" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="pushgiant_api_key">API key</label></th>
                    <td><input class="regular-text" id="pushgiant_api_key" name="<?php echo esc_attr(PUSHGIANT_OPTION_API_KEY); ?>" type="password" value="<?php echo esc_attr(get_option(PUSHGIANT_OPTION_API_KEY)); ?>" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="pushgiant_api_url">API URL</label></th>
                    <td><input class="regular-text" id="pushgiant_api_url" name="<?php echo esc_attr(PUSHGIANT_OPTION_API_URL); ?>" value="<?php echo esc_attr(get_option(PUSHGIANT_OPTION_API_URL, 'https://api.pushgiant.ru')); ?>" /></td>
                </tr>
                <tr>
                    <th scope="row">Prompt widget</th>
                    <td>
                        <label>
                            <input name="<?php echo esc_attr(PUSHGIANT_OPTION_PROMPT_ENABLED); ?>" type="checkbox" value="1" <?php checked(get_option(PUSHGIANT_OPTION_PROMPT_ENABLED, '1'), '1'); ?> />
                            Show subscription button on the storefront
                        </label>
                    </td>
                </tr>
            </table>
            <?php submit_button('Save Push Giant settings'); ?>
        </form>
        <p>После сохранения сайт подключит SDK, manifest endpoint, service worker route и форму подписки Push Giant.</p>
    </div>
    <?php
}

function pushgiant_register_service_worker_route() {
    add_rewrite_rule('^pushgiant-sw\.js$', 'index.php?pushgiant_sw=1', 'top');
}

function pushgiant_service_worker_response() {
    $project_id = trim((string) get_option(PUSHGIANT_OPTION_PROJECT_ID));
    $api_url = rtrim((string) get_option(PUSHGIANT_OPTION_API_URL, 'https://api.pushgiant.ru'), '/');

    header('Content-Type: application/javascript; charset=utf-8');
    header('Service-Worker-Allowed: /');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    ?>
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) { event.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch (error) {}

  var title = data.title || <?php echo wp_json_encode(get_bloginfo('name') ?: 'Push Giant'); ?>;
  var icon = data.icon || '/favicon.ico';
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    icon: icon,
    badge: icon,
    image: data.image || undefined,
    data: { url: data.url || '/', campaignId: data.campaignId || null },
    tag: data.tag || 'pushgiant-' + Date.now(),
    renotify: true
  }));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var target = new URL(event.notification.data && event.notification.data.url || '/', self.location.origin).href;
  var campaignId = event.notification.data && event.notification.data.campaignId;

  if (campaignId && <?php echo wp_json_encode($project_id); ?>) {
    fetch(<?php echo wp_json_encode($api_url); ?> + '/v1/events/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: <?php echo wp_json_encode($project_id); ?>,
        campaign_id: campaignId,
        type: 'push.open',
        payload: { source: 'wordpress-service-worker' }
      })
    }).catch(function () {});
  }

  event.waitUntil((async function () {
    var windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (var index = 0; index < windows.length; index += 1) {
      var client = windows[index];
      if ('focus' in client) {
        await client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  })());
});
    <?php
}

function pushgiant_manifest_response() {
    $name = get_bloginfo('name') ?: 'Push Giant App';
    return [
        'name' => $name,
        'short_name' => $name,
        'start_url' => '/',
        'scope' => '/',
        'display' => 'standalone',
        'theme_color' => '#111111',
        'background_color' => '#ffffff',
        'icons' => [],
    ];
}
