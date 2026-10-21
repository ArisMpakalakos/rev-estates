<?php
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

<?php /* ΕΙΣΑΓΩΓΗ (1η επίσκεψη ανά συνεδρία): πρώτα φαίνεται το λογότυπο, μετά μπαίνει μια πόρτα (δύο φύλλα) και ανοίγει,
     αποκαλύπτοντας τη σελίδα. Η κίνηση γίνεται με CSS (styles.css → ".intro"), το main.js την αφαιρεί όταν τελειώσει. */ ?>
<div class="intro" id="intro" aria-hidden="true">
  <?php /* 1. Η οθόνη με το λογότυπο */ ?>
  <div class="intro__logo"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/logo.png' ) ); ?>" alt="" width="1691" height="956"></div>
  <?php /* 2. Τα δύο φύλλα της πόρτας */ ?>
  <div class="intro__door intro__door--l"></div>
  <div class="intro__door intro__door--r"></div>
</div>

<?php /* Σύνδεσμος για χρήστες πληκτρολογίου/αναγνώστη οθόνης: πηγαίνει κατευθείαν στη φόρμα */ ?>
<a class="skip" href="#contact">Μετάβαση στη φόρμα επικοινωνίας</a>
<?php /* Λεπτή γραμμή προόδου κύλισης στο πάνω μέρος της σελίδας */ ?>
<div class="progress" aria-hidden="true"></div>

<?php /* ΚΟΙΝΗ ΕΙΚΟΝΟΓΡΑΦΗΣΗ για το slider «Πριν / Μετά» (ενότητα «Η διαφορά»).
     Ορίζεται μία φορά εδώ και χρησιμοποιείται δύο φορές με <use href="#street">: μία "σβηστή" (πριν) και μία "αναμμένη" (μετά).
     Περιέχει τρία κτίρια με παράθυρα (τα ορθογώνια με κλάση "w"). */ ?>
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
        <?php /* Φόντο ουρανού και ήλιος */ ?>
        <symbol id="street" viewBox="0 0 960 420" preserveAspectRatio="xMidYMid slice">
          <rect width="960" height="420" class="f-pale"/>
          <circle cx="840" cy="70" r="30" class="f-mid"/>
          <?php /* Κτίριο 1 (αριστερά) και τα παράθυρά του */ ?>
          <rect class="f-bone s" x="60" y="120" width="220" height="260"/><rect class="w s" style="--k:0" x="82" y="144" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:5" x="150" y="144" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:10" x="218" y="144" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:4" x="82" y="194" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:9" x="150" y="194" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:3" x="218" y="194" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:8" x="82" y="244" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:2" x="150" y="244" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:7" x="218" y="244" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:1" x="82" y="294" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:6" x="150" y="294" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:0" x="218" y="294" width="40" height="36" rx="2"/>
          <?php /* Κτίριο 2 (στη μέση, ψηλό) και τα παράθυρά του */ ?>
          <rect class="f-bone s" x="320" y="70" width="260" height="310"/><rect class="w s" style="--k:4" x="342" y="94" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:9" x="400" y="94" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:3" x="458" y="94" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:8" x="516" y="94" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:2" x="342" y="144" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:7" x="400" y="144" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:1" x="458" y="144" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:6" x="516" y="144" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:0" x="342" y="194" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:5" x="400" y="194" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:10" x="458" y="194" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:4" x="516" y="194" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:9" x="342" y="244" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:3" x="400" y="244" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:8" x="458" y="244" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:2" x="516" y="244" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:7" x="342" y="294" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:1" x="400" y="294" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:6" x="458" y="294" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:0" x="516" y="294" width="40" height="36" rx="2"/>
          <?php /* Κτίριο 3 (δεξιά) και τα παράθυρά του */ ?>
          <rect class="f-bone s" x="620" y="150" width="260" height="230"/><rect class="w s" style="--k:2" x="642" y="174" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:7" x="700" y="174" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:1" x="758" y="174" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:6" x="816" y="174" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:0" x="642" y="224" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:5" x="700" y="224" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:10" x="758" y="224" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:4" x="816" y="224" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:9" x="642" y="274" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:3" x="700" y="274" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:8" x="758" y="274" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:2" x="816" y="274" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:7" x="642" y="324" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:1" x="700" y="324" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:6" x="758" y="324" width="40" height="36" rx="2"/>
          <rect class="w s" style="--k:0" x="816" y="324" width="40" height="36" rx="2"/>
          <?php /* Έδαφος και δέντρα */ ?>
          <rect y="380" width="960" height="40" class="f-sage"/>
          <path class="s" d="M0 380h960"/>
          <circle cx="30" cy="360" r="26" class="f-sage s"/><circle cx="930" cy="364" r="22" class="f-sage s"/>
        </symbol>
</defs></svg>

<?php /* ΕΠΑΝΩ ΜΠΑΡΑ: λογότυπο αριστερά, μενού δεξιά. Μένει σταθερή στην κορυφή (position: fixed) */ ?>
<header class="top<?php echo is_front_page() ? '' : ' is-stuck'; ?>" id="top-bar"<?php echo is_front_page() ? '' : ' data-solid'; ?>>
  <?php /* Λογότυπο: κλικ = επιστροφή στην κορυφή. Αντικαθιστάτε το images/logo.png με νεότερη έκδοση όταν χρειαστεί */ ?>
  <a class="mark" href="<?php echo $rev_home; ?>" aria-label="Rev Estates, αρχική">
    <img class="logo" src="<?php echo esc_url( get_theme_file_uri( 'assets/images/logo.png' ) ); ?>" alt="Rev Estates" width="1691" height="956">
  </a>
  <?php /* Μενού: κάθε σύνδεσμος πηγαίνει στην ενότητα με το αντίστοιχο id. Το data-nav χρησιμοποιεί το main.js για να υπογραμμίζει την τρέχουσα ενότητα */ ?>
  <nav class="nav" aria-label="Κύρια πλοήγηση">
    <a href="<?php echo $rev_home; ?>#about" data-nav="about">Σχετικά</a>
    <a href="<?php echo $rev_home; ?>#services" data-nav="services">Υπηρεσίες</a>
    <a href="<?php echo $rev_home; ?>#process" data-nav="process">Διαδικασία</a>
    <a href="<?php echo $rev_home; ?>#difference" data-nav="difference">Η διαφορά</a>
    <a href="<?php echo $rev_home; ?>#properties" data-nav="properties">Ακίνητα</a>
    <a href="<?php echo $rev_home; ?>#faq" data-nav="faq">Ερωτήσεις</a>
    <?php /* Το κουμπί "Επικοινωνία" (το μόνο που μένει στο κινητό) */ ?>
    <a class="nav__cta" href="<?php echo $rev_home; ?>#contact">Επικοινωνία</a>
  </nav>
</header>
