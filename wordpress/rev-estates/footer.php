<?php
/**
 * footer.php — το κάτω μέρος κάθε σελίδας (υποσέλιδο) και το κλείσιμο της σελίδας.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>

<?php /* ΥΠΟΣΕΛΙΔΟ: λογότυπο, πνευματικά δικαιώματα και ένα προσωρινό κείμενο (π.χ. σύνδεσμοι πολιτικής απορρήτου) */ ?>
<footer class="foot">
  <div class="wrap foot__in">
    <img class="logo logo--foot" src="<?php echo esc_url( get_theme_file_uri( 'assets/images/logo.png' ) ); ?>" alt="Rev Estates" width="1691" height="956" loading="lazy">
    <span>© 2026 Rev Estates</span>
    <span>Lorem ipsum · Dolor sit amet</span>
  </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
