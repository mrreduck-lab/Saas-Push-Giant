<?php
/**
 * Plugin Name: Push Giant
 * Description: Connects a WordPress site to Push Giant PWA and Web Push.
 * Version: 0.1.0
 * Author: Push Giant
 */

if (!defined('ABSPATH')) {
    exit;
}

define('PUSHGIANT_VERSION', '0.1.0');
define('PUSHGIANT_OPTION_PROJECT_ID', 'pushgiant_project_id');
define('PUSHGIANT_OPTION_API_KEY', 'pushgiant_api_key');
define('PUSHGIANT_OPTION_API_URL', 'pushgiant_api_url');

add_action('admin_menu', function () {
    add_options_page('Push Giant', 'Push Giant', 'manage_options', 'pushgiant', 'pushgiant_render_settings_page');
});

add_action('admin_init', function () {
    register_setting('pushgiant', PUSHGIANT_OPTION_PROJECT_ID);
    register_setting('pushgiant', PUSHGIANT_OPTION_API_KEY);
    register_setting('pushgiant', PUSHGIANT_OPTION_API_URL);
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
            </table>
            <?php submit_button('Save Push Giant settings'); ?>
        </form>
        <p>После сохранения сайт подключит SDK, manifest endpoint и service worker route для пилота Raschini.</p>
    </div>
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
