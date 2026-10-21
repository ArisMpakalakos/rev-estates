<?php
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
