<?php

/**
 * The default email message that will be sent to users as they are approved.
 *
 * @return string
 */
function nua_default_approve_user_message() {
	$message = __( 'Usted ha sido aprobado para acceder a {sitename} y realizar el  Diagnostico. Se le asigno una contraseña por default pero puede cambiarla editando su perfil. Por favor primero ingrese al link de login y posteriormente al link de Diagnostico.  ', 'new-user-approve' ) . "\r\n\r\n";
	$message .= "{username}\r\n";
	$message .= "{password}\r\n\r\n";
	$message .= "{login_url}\r\n";
        $message .= "http://www.mujeresdelasamericas.com/diagnostico/";
       
                   
	

	$message = apply_filters( 'new_user_approve_approve_user_message_default', $message );

	return $message;
}

/**
 * The default email message that will be sent to users as they are denied.
 *
 * @return string
 */
function nua_default_deny_user_message() {
	$message = __( 'Se le ha negado el acceso a {sitename}.', 'new-user-approve' );

	$message = apply_filters( 'new_user_approve_deny_user_message_default', $message );

	return $message;
}

/**
 * The default message that will be shown to the user after registration has completed.
 *
 * @return string
 */
function nua_default_registration_complete_message() {
	$message = sprintf( __( 'Un correo electrónico ha sido enviado a la administración del sitio. El administrador revisará la información que se ha presentado y aprobar o rechazar su solicitud.', 'new-user-approve' ) );
	$message .= ' ';
	$message .= sprintf( __( 'Usted recibirá un correo electrónico con instrucciones sobre lo que usted tendrá que hacer a continuación. Gracias por su paciencia.', 'new-user-approve' ) );

	$message = apply_filters( 'new_user_approve_pending_message_default', $message );

	return $message;
}

/**
 * The default welcome message that is shown to all users on the login page.
 *
 * @return string
 */
function nua_default_welcome_message() {
	$welcome = sprintf( __( 'Bienvenidos a {sitename}. Este sitio es accesible sólo a los usuarios autorizados. Para ser aprobado, primero debe registrarse.', 'new-user-approve' ), get_option( 'blogname' ) );

	$welcome = apply_filters( 'new_user_approve_welcome_message_default', $welcome );

	return $welcome;
}

/**
 * The default notification message that is sent to site admin when requesting approval.
 *
 * @return string
 */
function nua_default_notification_message() {
	$message = __( '{username} ({user_email}) has requested a username at {sitename}', 'new-user-approve' ) . "\n\n";
	$message .= "{site_url}\n\n";
	$message .= __( 'To approve or deny this user access to {sitename} go to', 'new-user-approve' ) . "\n\n";
	$message .= "{admin_approve_url}\n\n";

	$message = apply_filters( 'new_user_approve_notification_message_default', $message );

	return $message;
}

/**
 * The default message that is shown to the user on the registration page before any action
 * has been taken.
 *
 * @return string
 */
function nua_default_registration_message() {
	$message = __( 'Después de registrarse, su solicitud será enviada a un agente del sitio para su aprobación. A continuación, recibirá un correo electrónico con más instrucciones.', 'new-user-approve' );

	$message = apply_filters( 'new_user_approve_registration_message_default', $message );

	return $message;
}