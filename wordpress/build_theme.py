"""
build_theme.py — φτιάχνει το WordPress θέμα «rev-estates» από τα αρχεία του project.

Πώς τρέχει (από τον κεντρικό φάκελο του project):
    python wordpress/build_theme.py

Τι κάνει:
  1. Διαβάζει τα index.html, styles.css, main.js και τους φακέλους fonts/ και images/.
  2. Δημιουργεί τον φάκελο wordpress/rev-estates/ (το θέμα) με αρχεία PHP.
  3. Φτιάχνει και το wordpress/rev-estates.zip, έτοιμο για ανέβασμα στο WordPress.

Κάθε φορά που αλλάζετε το index.html, το styles.css ή το main.js, τρέξτε το ξανά.
Το βίντεο ΔΕΝ μπαίνει στο θέμα (είναι βαρύ): ανεβαίνει από το Customizer ή με FTP (δείτε ΟΔΗΓΙΕΣ.txt).
"""
import os
import re
import shutil
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'wordpress', 'rev-estates')
ZIP = os.path.join(ROOT, 'wordpress', 'rev-estates.zip')


def read(name):
    with open(os.path.join(ROOT, name), encoding='utf-8') as f:
        return f.read()


def write(rel, text):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)


def between(s, start, end):
    """Επιστρέφει το κομμάτι από την αρχή του «start» έως το τέλος του «end»."""
    a = s.index(start)
    b = s.index(end, a) + len(end)
    return s[a:b]


def replace_once(s, old, new):
    assert s.count(old) == 1, 'Δεν βρέθηκε μία φορά: ' + old[:60]
    return s.replace(old, new)


def php_comments(s):
    """Μετατρέπει τα HTML σχόλια σε σχόλια PHP, ώστε να ΜΗΝ φαίνονται στον επισκέπτη (ελαφρύτερη σελίδα)."""
    return re.sub(r'<!--(.*?)-->', lambda m: '<?php /*' + m.group(1).replace('*/', '* /') + '*/ ?>', s, flags=re.S)


LOGO = "<?php echo esc_url( get_theme_file_uri( 'assets/images/logo.png' ) ); ?>"
HOME = '<?php echo $rev_home; ?>'

html = read('index.html')

# ---------------------------------------------------------------- header.php
top = between(html, '<!-- ΕΙΣΑΓΩΓΗ (1η', '<!-- ΕΠΑΝΩ ΜΠΑΡΑ')
top = top[:top.rindex('<!-- ΕΠΑΝΩ ΜΠΑΡΑ')]
top = top.replace('src="images/logo.png"', 'src="' + LOGO + '"')

bar = between(html, '<!-- ΕΠΑΝΩ ΜΠΑΡΑ', '</header>')
bar = bar.replace('src="images/logo.png"', 'src="' + LOGO + '"')
bar = replace_once(bar, '<header class="top" id="top-bar">',
                   '<header class="top<?php echo is_front_page() ? \'\' : \' is-stuck\'; ?>" id="top-bar"<?php echo is_front_page() ? \'\' : \' data-solid\'; ?>>')
bar = replace_once(bar, 'href="#top"', 'href="' + HOME + '"')
for sec in ('about', 'services', 'process', 'difference', 'properties', 'faq'):
    bar = replace_once(bar, 'href="#' + sec + '"', 'href="' + HOME + '#' + sec + '"')
bar = replace_once(bar, 'href="#contact"', 'href="' + HOME + '#contact"')

header_php = '''<?php
/**
 * header.php — το πάνω μέρος κάθε σελίδας: <head>, εισαγωγή (πόρτα), επάνω μπάρα με το μενού.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#fbfbf8">
<?php if ( ! has_site_icon() ) : ?>
<link rel="icon" href="<?php echo esc_url( get_theme_file_uri( 'assets/images/logo.png' ) ); ?>">
<?php endif; ?>
<?php /* Αποφασίζει αν θα παίξει η εισαγωγή (μόνο 1η επίσκεψη και όχι με reduced-motion) πριν φανεί οτιδήποτε. */ ?>
<script>try{if(!sessionStorage.getItem('rv-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('intro-on')}}catch(e){}</script>
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<?php $rev_home = esc_url( home_url( '/' ) ); /* η αρχική σελίδα, για τους συνδέσμους του μενού */ ?>

''' + php_comments(top) + php_comments(bar) + '\n'

# ---------------------------------------------------------------- footer.php
foot = between(html, '<!-- ΥΠΟΣΕΛΙΔΟ', '</footer>')
foot = foot.replace('src="images/logo.png"', 'src="' + LOGO + '"')
footer_php = '''<?php
/**
 * footer.php — το κάτω μέρος κάθε σελίδας (υποσέλιδο) και το κλείσιμο της σελίδας.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>

''' + php_comments(foot) + '''

<?php wp_footer(); ?>
</body>
</html>
'''

# ---------------------------------------------------------------- front-page.php
main = between(html, '<!-- ΚΥΡΙΟ ΠΕΡΙΕΧΟΜΕΝΟ -->', '</main>')

# Φόντο hero: βίντεο από το Customizer ή από τον φάκελο του θέματος
main = re.sub(r'<!-- ΦΟΝΤΟ ΤΟΥ HERO\..*?-->', '''<!-- ΦΟΝΤΟ ΤΟΥ HERO.
         Για να βάλετε βίντεο: Εμφάνιση → Προσαρμογή → Rev Estates → «Βίντεο hero» (και προαιρετικά «Φωτογραφία hero»).
         Μέχρι τότε φαίνεται το σκούρο κινούμενο φόντο παρακάτω. -->''', main, count=1, flags=re.S)
video_old = between(main, '<!-- Το βίντεο:', '</video>')
video_new = '''<?php $rev_media = rev_hero_media(); ?>
    <?php if ( $rev_media['video'] ) : ?>
    <!-- Το βίντεο: παίζει αυτόματα, χωρίς ήχο, σε loop. Το main.js το αφαιρεί σε μικρές οθόνες, με εξοικονόμηση δεδομένων ή reduced-motion -->
    <video class="hero__video" id="hero-video" autoplay muted loop playsinline preload="metadata"<?php if ( $rev_media['poster'] ) : ?> poster="<?php echo esc_url( $rev_media['poster'] ); ?>"<?php endif; ?> aria-hidden="true" tabindex="-1">
      <source src="<?php echo esc_url( $rev_media['video'] ); ?>" type="<?php echo esc_attr( $rev_media['type'] ); ?>">
    </video>
    <?php endif; ?>'''
main = main.replace(video_old, video_new)

# Στοιχεία επικοινωνίας από το Customizer
info_old = between(main, '<!-- ΒΑΛΤΕ ΕΔΩ', '</p>')
info_new = '''<!-- Τα στοιχεία επικοινωνίας αλλάζουν από: Εμφάνιση → Προσαρμογή → Rev Estates → «Στοιχεία επικοινωνίας» -->
        <p class="reveal contact__info" style="--d:2"><?php echo nl2br( esc_html( get_theme_mod( 'rev_contact_info', 'Στοιχεία επικοινωνίας: lorem ipsum dolor sit amet.' ) ) ); ?></p>'''
main = main.replace(info_old, info_new)

# Honeypot (κρυφό πεδίο κατά των ρομπότ) μέσα στη φόρμα
form_open = re.search(r'<form id="contact-form"[^>]*>', main).group(0)
main = main.replace(form_open, form_open + '''
        <!-- Κρυφό πεδίο-παγίδα για ρομπότ: οι άνθρωποι δεν το βλέπουν και δεν το συμπληρώνουν -->
        <div class="hp" aria-hidden="true"><label>Αφήστε αυτό το πεδίο κενό<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>''')

front_php = '''<?php
/**
 * front-page.php — η αρχική σελίδα (όλο το site είναι μία σελίδα).
 * Για να αλλάξετε κείμενα, επεξεργαστείτε αυτό το αρχείο (Εμφάνιση → Επεξεργαστής αρχείων θέματος).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>

''' + php_comments(main) + '''

<?php get_footer(); ?>
'''

# ---------------------------------------------------------------- index.php (όλες οι άλλες σελίδες)
index_php = '''<?php
/**
 * index.php — εφεδρικό πρότυπο για κάθε σελίδα που ΔΕΝ είναι η αρχική (π.χ. σελίδες, άρθρα, 404).
 * Δείχνει απλά τον τίτλο και το περιεχόμενο, με το ίδιο μενού και υποσέλιδο.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>

<main id="top" class="plain">
<?php if ( have_posts() ) : ?>
	<?php while ( have_posts() ) : the_post(); ?>
		<article <?php post_class(); ?>>
			<h1 class="plain__title"><?php the_title(); ?></h1>
			<div class="plain__body"><?php the_content(); ?></div>
		</article>
	<?php endwhile; ?>
<?php else : ?>
	<h1 class="plain__title">Η σελίδα δεν βρέθηκε</h1>
	<p><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Επιστροφή στην αρχική</a></p>
<?php endif; ?>
</main>

<?php get_footer(); ?>
'''

# ---------------------------------------------------------------- functions.php
functions_php = r'''<?php
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
'''

style_css = '''/*
Theme Name: Rev Estates
Description: Θέμα μίας σελίδας για την Rev Estates (διαχείριση βραχυχρόνιας μίσθωσης). Ο κύριος κώδικας CSS βρίσκεται στο assets/css/styles.css.
Version: 1.0.0
Requires at least: 6.0
Requires PHP: 7.4
Text Domain: rev-estates
*/
'''

wp_css = '''

/* ================= ΠΡΟΣΘΗΚΕΣ ΓΙΑ ΤΟ WORDPRESS ================= */
/* Όταν είστε συνδεδεμένος ο διαχειριστής, το WordPress δείχνει μια μπάρα στο πάνω μέρος: κατεβάζουμε τη δική μας μπάρα από κάτω της */
body.admin-bar .top, body.admin-bar .progress { top: 32px; }
@media (max-width: 782px) { body.admin-bar .top, body.admin-bar .progress { top: 46px; } }
@media (max-width: 600px) { body.admin-bar .top, body.admin-bar .progress { top: 0; } }
/* Κρυφό πεδίο-παγίδα της φόρμας (honeypot) */
.hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
/* Απλές σελίδες/άρθρα (index.php) */
.plain { max-width: 820px; margin: 0 auto; padding: calc(var(--head) + 3rem) var(--pad) 4rem; }
.plain__title { font-size: clamp(2rem, 4.2vw, 3.2rem); margin-bottom: 1.5rem; }
.plain__body > * + * { margin-top: 1rem; }
.plain__body a { color: var(--green); text-decoration: underline; }
'''

instructions = '''ΟΔΗΓΙΕΣ ΓΙΑ ΤΟ WORDPRESS
=========================

1. ΑΝΕΒΑΣΜΑ ΤΟΥ ΘΕΜΑΤΟΣ
   WordPress → Εμφάνιση → Θέματα → Προσθήκη νέου → Ανέβασμα θέματος → επιλέξτε το rev-estates.zip → Εγκατάσταση → Ενεργοποίηση.

2. ΟΡΙΣΜΟΣ ΑΡΧΙΚΗΣ ΣΕΛΙΔΑΣ
   Ρυθμίσεις → Ανάγνωση → «Η αρχική σελίδα σας εμφανίζει» → όποια επιλογή θέλετε. Το θέμα χρησιμοποιεί το front-page.php για την αρχική.
   (Προτείνεται: «Μια στατική σελίδα» με μια κενή σελίδα «Αρχική».)

3. EMAIL ΠΑΡΑΛΗΠΤΗ ΚΑΙ ΣΤΟΙΧΕΙΑ ΕΠΙΚΟΙΝΩΝΙΑΣ
   Εμφάνιση → Προσαρμογή → «Rev Estates»: ορίστε το email που θα λαμβάνει τα μηνύματα και το κείμενο των στοιχείων επικοινωνίας.

4. ΒΙΝΤΕΟ ΤΟΥ HEADER
   Συμπιέστε πρώτα το βίντεο (κάτω από ~6 MB, 1920x1080, χωρίς ήχο).
   Εμφάνιση → Προσαρμογή → «Rev Estates» → «Βίντεο hero»: ανεβάστε το αρχείο και (προαιρετικά) μια φωτογραφία.
   Εναλλακτικά με FTP: wp-content/themes/rev-estates/assets/video/hero.mp4

5. ΚΕΙΜΕΝΑ
   Τα κείμενα (lorem ipsum) βρίσκονται στο front-page.php: Εμφάνιση → Επεξεργαστής αρχείων θέματος → front-page.php.
   Για μεγάλες αλλαγές, επεξεργαστείτε τα αρχεία του project και τρέξτε ξανά:  python wordpress/build_theme.py

6. EMAIL
   Για να φτάνουν σίγουρα τα email της φόρμας, εγκαταστήστε το plugin «WP Mail SMTP» και συνδέστε το με το email της εταιρείας.
'''

# ---------------------------------------------------------------- Γράψιμο αρχείων
if os.path.isdir(OUT):
    shutil.rmtree(OUT)
os.makedirs(OUT)

write('style.css', style_css)
write('functions.php', functions_php)
write('header.php', header_php)
write('footer.php', footer_php)
write('front-page.php', front_php)
write('index.php', index_php)

# CSS: οι γραμματοσειρές βρίσκονται πλέον ένα επίπεδο πιο πάνω (assets/css → assets/fonts)
css = read('styles.css').replace('url("fonts/', 'url("../fonts/') + wp_css
write('assets/css/styles.css', css)
write('assets/js/main.js', read('main.js'))
write('assets/video/README.txt', 'Προαιρετικά: βάλτε εδώ το βίντεο του header ως hero.mp4 (μερικά MB, χωρίς ήχο).\n'
                                  'Προτιμήστε να το ανεβάσετε από το Customizer (Εμφάνιση → Προσαρμογή → Rev Estates).\n')
write('ΟΔΗΓΙΕΣ.txt', instructions)

for sub_dir, files in (('fonts', None), ('images', ('logo.png',))):
    src = os.path.join(ROOT, sub_dir)
    for fname in sorted(os.listdir(src)):
        if files is not None and fname not in files:
            continue
        dst = os.path.join(OUT, 'assets', sub_dir, fname)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copyfile(os.path.join(src, fname), dst)

# ---------------------------------------------------------------- Έλεγχοι
for rel in ('front-page.php', 'header.php', 'footer.php'):
    text = open(os.path.join(OUT, rel), encoding='utf-8').read()
    text = re.sub(r'<\?php /\*.*?\*/ \?>', '', text, flags=re.S)  # τα σχόλια δεν μετράνε
    for bad in ('src="images/', 'src="video/', 'url("fonts/', 'href="images/'):
        assert bad not in text, rel + ' περιέχει ακόμη ' + bad

# ---------------------------------------------------------------- ZIP
if os.path.exists(ZIP):
    os.remove(ZIP)
with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED) as z:
    for folder, _, names in os.walk(OUT):
        for n in sorted(names):
            full = os.path.join(folder, n)
            arc = 'rev-estates/' + os.path.relpath(full, OUT).replace(os.sep, '/')
            z.write(full, arc)

size = os.path.getsize(ZIP) / 1024
print('OK: ' + ZIP + ' (' + format(size, '.0f') + ' KB)')
