<?php
/**
 * functions.php — ρυθμίσεις του θέματος Rev Estates:
 *  1. φόρτωση CSS και JS, 2. Customizer (email, στοιχεία επικοινωνίας, βίντεο), 3. αποστολή της φόρμας επικοινωνίας.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

/* ---------------------------------------------------------------
 * 1. ΒΑΣΙΚΕΣ ΡΥΘΜΙΣΕΙΣ ΚΑΙ ΑΡΧΕΙΑ
 * ------------------------------------------------------------- */

// Το WordPress φροντίζει τον τίτλο της καρτέλας (title-tag).
add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'html5', array( 'style', 'script', 'gallery', 'caption' ) );
} );

// Φόρτωση του CSS και του JS. Το filemtime αλλάζει τον αριθμό έκδοσης όταν αλλάξει το αρχείο, ώστε να μην μένει παλιά έκδοση στο cache.
add_action( 'wp_enqueue_scripts', function () {
	$css = get_theme_file_path( 'assets/css/styles.css' );
	$js  = get_theme_file_path( 'assets/js/main.js' );

	wp_enqueue_style( 'rev-styles', get_theme_file_uri( 'assets/css/styles.css' ), array(), file_exists( $css ) ? filemtime( $css ) : null );
	wp_enqueue_script( 'rev-main', get_theme_file_uri( 'assets/js/main.js' ), array(), file_exists( $js ) ? filemtime( $js ) : null, true );

	// Δίνουμε στο main.js τη διεύθυνση που δέχεται τη φόρμα (admin-ajax.php).
	wp_add_inline_script( 'rev-main', 'window.revEstates = ' . wp_json_encode( array( 'ajaxUrl' => admin_url( 'admin-ajax.php' ) ) ) . ';', 'before' );
}, 20 );

// Στην αρχική δεν χρειάζονται τα έτοιμα στυλ των μπλοκ του WordPress: τα αφαιρούμε για πιο ελαφριά σελίδα.
add_action( 'wp_enqueue_scripts', function () {
	if ( is_front_page() ) {
		wp_dequeue_style( 'wp-block-library' );
		wp_dequeue_style( 'wp-block-library-theme' );
		wp_dequeue_style( 'global-styles' );
		wp_dequeue_style( 'classic-theme-styles' );
	}
}, 100 );

// Προφόρτωση των βασικών γραμματοσειρών, ώστε το κείμενο να εμφανίζεται γρήγορα.
add_action( 'wp_head', function () {
	foreach ( array( 'commissioner-greek', 'notoserifdisplay-greek' ) as $font ) {
		printf( '<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n", esc_url( get_theme_file_uri( 'assets/fonts/' . $font . '.woff2' ) ) );
	}
}, 2 );

// Περιγραφή για τη Google (meta description). Αν έχετε plugin SEO (Yoast, Rank Math, AIOSEO) αυτό παραλείπεται, για να μην υπάρχουν διπλές.
add_action( 'wp_head', function () {
	if ( defined( 'WPSEO_VERSION' ) || class_exists( 'RankMath' ) || defined( 'AIOSEO_VERSION' ) ) {
		return;
	}
	if ( is_front_page() ) {
		$description = 'Η Rev Estates αναλαμβάνει τη διαχείριση της βραχυχρόνιας μίσθωσης του ακινήτου σας. Στείλτε μας μήνυμα για να μιλήσουμε.';
	} else {
		$description = get_bloginfo( 'description' );
	}
	if ( $description ) {
		printf( '<meta name="description" content="%s">' . "\n", esc_attr( $description ) );
	}
}, 3 );

/* ---------------------------------------------------------------
 * 2. CUSTOMIZER: Εμφάνιση → Προσαρμογή → «Rev Estates»
 * ------------------------------------------------------------- */
add_action( 'customize_register', function ( $wp_customize ) {
	$wp_customize->add_section( 'rev_estates', array(
		'title'    => 'Rev Estates',
		'priority' => 30,
	) );

	// Email που λαμβάνει τα μηνύματα της φόρμας.
	$wp_customize->add_setting( 'rev_contact_email', array( 'default' => '', 'sanitize_callback' => 'sanitize_email' ) );
	$wp_customize->add_control( 'rev_contact_email', array(
		'section'     => 'rev_estates',
		'label'       => 'Email που λαμβάνει τα μηνύματα της φόρμας',
		'description' => 'Αν μείνει κενό, χρησιμοποιείται το email διαχειριστή του site.',
		'type'        => 'email',
	) );

	// Κείμενο στοιχείων επικοινωνίας (δίπλα στη φόρμα).
	$wp_customize->add_setting( 'rev_contact_info', array(
		'default'           => 'Στοιχεία επικοινωνίας: lorem ipsum dolor sit amet.',
		'sanitize_callback' => 'sanitize_textarea_field',
	) );
	$wp_customize->add_control( 'rev_contact_info', array(
		'section'     => 'rev_estates',
		'label'       => 'Στοιχεία επικοινωνίας',
		'description' => 'Π.χ. τηλέφωνο, email, διεύθυνση. Κάθε γραμμή εμφανίζεται σε νέα γραμμή.',
		'type'        => 'textarea',
	) );

	// Βίντεο του header (από τη Βιβλιοθήκη πολυμέσων).
	$wp_customize->add_setting( 'rev_hero_video', array( 'default' => '', 'sanitize_callback' => 'esc_url_raw' ) );
	$wp_customize->add_control( new WP_Customize_Upload_Control( $wp_customize, 'rev_hero_video', array(
		'section'     => 'rev_estates',
		'label'       => 'Βίντεο hero (mp4 ή webm, χωρίς ήχο, λίγα MB)',
		'description' => 'Αν μείνει κενό, φαίνεται το σκούρο κινούμενο φόντο.',
		'mime_type'   => 'video',
	) ) );

	// Φωτογραφία που φαίνεται όσο φορτώνει το βίντεο.
	$wp_customize->add_setting( 'rev_hero_poster', array( 'default' => '', 'sanitize_callback' => 'esc_url_raw' ) );
	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'rev_hero_poster', array(
		'section' => 'rev_estates',
		'label'   => 'Φωτογραφία hero (εμφανίζεται πριν παίξει το βίντεο)',
	) ) );
} );

/**
 * Επιστρέφει το βίντεο και τη φωτογραφία του hero.
 * Προτεραιότητα: Customizer → αρχεία μέσα στο θέμα (assets/video/hero.mp4, assets/images/hero-poster.jpg|webp|png).
 */
function rev_hero_media() {
	$video = get_theme_mod( 'rev_hero_video', '' );
	if ( ! $video && file_exists( get_theme_file_path( 'assets/video/hero.mp4' ) ) ) {
		$video = get_theme_file_uri( 'assets/video/hero.mp4' );
	}

	$poster = get_theme_mod( 'rev_hero_poster', '' );
	if ( ! $poster ) {
		foreach ( array( 'jpg', 'webp', 'png' ) as $ext ) {
			if ( file_exists( get_theme_file_path( 'assets/images/hero-poster.' . $ext ) ) ) {
				$poster = get_theme_file_uri( 'assets/images/hero-poster.' . $ext );
				break;
			}
		}
	}

	$type = 'video/mp4';
	if ( $video ) {
		$path = (string) wp_parse_url( $video, PHP_URL_PATH );
		if ( '.webm' === strtolower( substr( $path, -5 ) ) ) {
			$type = 'video/webm';
		}
	}

	return array( 'video' => $video, 'poster' => $poster, 'type' => $type );
}

/* ---------------------------------------------------------------
 * 3. ΦΟΡΜΑ ΕΠΙΚΟΙΝΩΝΙΑΣ: λήψη, έλεγχος και αποστολή email
 *    Το main.js στέλνει τη φόρμα στο admin-ajax.php με action=rev_contact.
 * ------------------------------------------------------------- */
add_action( 'wp_ajax_nopriv_rev_contact', 'rev_contact_handler' ); // για επισκέπτες
add_action( 'wp_ajax_rev_contact', 'rev_contact_handler' );        // για συνδεδεμένους χρήστες

function rev_contact_handler() {
	// 1. Κρυφό πεδίο-παγίδα: αν συμπληρωθεί, είναι ρομπότ. Απαντάμε "επιτυχία" χωρίς να στείλουμε τίποτα.
	if ( ! empty( $_POST['website'] ) ) {
		wp_send_json_success( array( 'message' => 'Λάβαμε το μήνυμά σας. Θα επικοινωνήσουμε σύντομα.' ) );
	}

	// 2. Όριο: το πολύ 5 μηνύματα ανά ώρα από την ίδια διεύθυνση IP (κατά του spam).
	$ip_key = 'rev_rl_' . md5( isset( $_SERVER['REMOTE_ADDR'] ) ? $_SERVER['REMOTE_ADDR'] : 'x' );
	$count  = (int) get_transient( $ip_key );
	if ( $count >= 5 ) {
		wp_send_json_error( array( 'message' => 'Έχετε στείλει πολλά μηνύματα. Δοκιμάστε ξανά αργότερα.' ), 429 );
	}

	// 3. Καθαρισμός των δεδομένων.
	$name    = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '';
	$phone   = isset( $_POST['phone'] ) ? sanitize_text_field( wp_unslash( $_POST['phone'] ) ) : '';
	$email   = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	$area    = isset( $_POST['area'] ) ? sanitize_text_field( wp_unslash( $_POST['area'] ) ) : '';
	$message = isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '';
	$consent = ! empty( $_POST['consent'] );

	// 4. Έλεγχος (το ίδιο με το main.js, για ασφάλεια και από την πλευρά του server).
	$digits = preg_replace( '/\D/', '', $phone );
	if ( strlen( $name ) < 2 || strlen( $digits ) < 8 || strlen( $area ) < 2 || ( $email && ! is_email( $email ) ) || ! $consent ) {
		wp_send_json_error( array( 'message' => 'Ελέγξτε τα πεδία της φόρμας και δοκιμάστε ξανά.' ), 422 );
	}

	// 5. Παραλήπτης: το email από το Customizer ή του διαχειριστή.
	$to = sanitize_email( get_theme_mod( 'rev_contact_email', '' ) );
	if ( ! $to || ! is_email( $to ) ) {
		$to = get_option( 'admin_email' );
	}

	// 6. Σύνθεση και αποστολή.
	$site    = wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES );
	$subject = sprintf( '[%s] Νέο μήνυμα από τη φόρμα επικοινωνίας', $site );
	$body    = "Ονοματεπώνυμο: {$name}\n"
		. "Τηλέφωνο: {$phone}\n"
		. 'Email: ' . ( $email ? $email : '-' ) . "\n"
		. "Περιοχή ακινήτου: {$area}\n\n"
		. "Μήνυμα:\n" . ( $message ? $message : '-' ) . "\n\n"
		. 'Συγκατάθεση για επικοινωνία: ναι' . "\n";

	$headers = array( 'Content-Type: text/plain; charset=UTF-8' );
	if ( $email ) {
		$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
	}

	$sent = wp_mail( $to, $subject, $body, $headers );

	if ( $sent ) {
		set_transient( $ip_key, $count + 1, HOUR_IN_SECONDS );
		wp_send_json_success( array( 'message' => 'Λάβαμε το μήνυμά σας. Θα επικοινωνήσουμε σύντομα.' ) );
	}

	wp_send_json_error( array( 'message' => 'Το μήνυμα δεν στάλθηκε. Δοκιμάστε ξανά ή επικοινωνήστε μαζί μας τηλεφωνικά.' ), 500 );
}
