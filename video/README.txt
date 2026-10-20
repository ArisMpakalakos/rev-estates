Βάλτε εδώ το βίντεο του header:

  hero.mp4   (H.264, χωρίς ήχο, 1920x1080, 8-15 δευτερόλεπτα, loop, κάτω από ~6 MB)
  hero.webm  (προαιρετικό, μικρότερο)

Και μια φωτογραφία (frame του βίντεο) στο:  ../images/hero-poster.jpg

Παράδειγμα συμπίεσης με ffmpeg:
  ffmpeg -i input.mp4 -an -vf scale=1920:-2 -c:v libx264 -crf 28 -movflags +faststart hero.mp4
  ffmpeg -i input.mp4 -an -vf scale=1920:-2 -c:v libvpx-vp9 -crf 36 -b:v 0 hero.webm
