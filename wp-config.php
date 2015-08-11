<?php
/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, and ABSPATH. You can find more information by visiting
 * {@link http://codex.wordpress.org/Editing_wp-config.php Editing wp-config.php}
 * Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'i1215109_wp1');

/** MySQL database username */
define('DB_USER', 'i1215109_wp1');

/** MySQL database password */
define('DB_PASSWORD', 'X*z02POCki14)(7');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'K0theSFuCWSO453Txe73JZ1yXzQQ9LOPe3ohNGrsvwzP0mQvl7RgHTO3sB6a8pN1');
define('SECURE_AUTH_KEY',  'WRfbr9YBWO30qc3jISmiX1rkZzJk1kzIIPBqfNU0P8e35iTGlA7VikOsHhjEDJVA');
define('LOGGED_IN_KEY',    '0Gw0CPrI7owLkIF5AIMKrh11yEHJXIIJQ4cW2DnaszriopsR3TPe2JFZPFssbSO2');
define('NONCE_KEY',        'BOFA8JxIaaHZuFze1U2BOWhAGv5O9HSSAXyIOwDegJ9LvYUw6n8Re7nJSmFqia9a');
define('AUTH_SALT',        'zSZ1bq2fOZ15lUie22ewasziYGRGFgWyvgGydXjlhnUUjAVTuXNW7hZeyIW6K92m');
define('SECURE_AUTH_SALT', 'it3Gfr8Y84yiUvrBK7itM1wEnLeeuAkQyl9JwzCTlM8rD7koro1682jI7YfJ4rHY');
define('LOGGED_IN_SALT',   'RPDQZqmF9RpWetIg4MoXSsg1i7supsqvbY5fDIkwhgxo6f01maJ3Tkz0jZ5eLKx8');
define('NONCE_SALT',       'FF7gzDUwS5WtShNw3UsXN1YrrPbACtXXRESIHR77bNwqBJQIynIzHQ76Vi7bj4gU');

/**
 * Other customizations.
 */
define('FS_METHOD','direct');define('FS_CHMOD_DIR',0755);define('FS_CHMOD_FILE',0644);
define('WP_TEMP_DIR',dirname(__FILE__).'/wp-content/uploads');

/**
 * Turn off automatic updates since these are managed upstream.
 */
define('AUTOMATIC_UPDATER_DISABLED', true);


/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
