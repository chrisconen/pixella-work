# Nexus Maritime — média-generálási promptok

Minden asset a `img/` mappába kerül, **pontosan az itt megadott fájlnéven** — az oldal
azonnal a legyártott képet fogja használni, kód nem változik. A jelenlegi fájlok
ideiglenes placeholderek (a hero videókból kivágott képkockák).

Közös art direction (minden prompt végére odaértendő): sötét, mélytengeri paletta
(deep ocean blue / carbon black), ezüst fények, filmes, prémium hangulat.

**Fontos:** az oldal a kis méretű `.jpg` fájlokra hivatkozik. Ha PNG-t generáltatsz,
másold a mappába, majd futtasd rá (a 2 MB-os PNG-ből ~200 KB-os jpg lesz):
```
ffmpeg -i KEP.png -vf "scale='min(1600,iw)':-2" -q:v 4 KEP.jpg
```

---

## Képek (Midjourney v6 / Nano Banana / Firefly)

### `akademia-01.jpg` — térképasztal (álló, 3:4)
> Overhead cinematic shot of a nautical paper chart on a dark mahogany navigation
> table inside a sailing yacht, brass dividers and parallel ruler, dim red chart
> light, deep blue shadows, silver highlights, moody premium atmosphere,
> photorealistic, 8k --ar 3:4 --style raw

### `akademia-02.jpg` — kormánynál (álló, 4:5)
> Close-up of weathered hands on the carbon fiber steering wheel of a modern
> sailing yacht at blue hour, dark ocean and spray in the background, compass and
> instruments glowing softly cyan, cinematic, dark moody, photorealistic,
> 8k --ar 4:5 --style raw

### `flotta-01.jpg` — fedélzet / charter életérzés (fekvő, 16:11)
A mostani Snapshot.PNG témája jó — ha készül új:
> Sun deck of a modern 32-foot sailing yacht on open dark-blue water, white sails
> full, elegant relaxed charter lifestyle, late golden hour, cinematic color
> grade, photorealistic, 8k --ar 16:11 --style raw

### `flotta-02.jpg` — szalon belső (fekvő, 16:11)
> Interior of a luxury 32-foot sailing yacht salon, mahogany and carbon fiber
> surfaces, warm brass reading lights, navigation station with glowing
> instruments, dark moody premium yacht interior, photorealistic, 8k
> --ar 16:11 --style raw

### `flotta-03.jpg` — nyílt víz / delfinek (fekvő, 16:11)
A mostani (delfines) placeholder témája jó — ha készül új:
> Underwater cinematic shot of dolphins swimming beside the dark hull of a
> sailing yacht in deep blue open water, sun rays from the surface, photorealistic,
> 8k --ar 16:11 --style raw

### `naplo-bg.jpg` — éjszakai műszerfal háttér (fekvő, 16:9)
Nagyon sötét lehet — 16% opacitással, átfedő sötétítéssel jelenik meg.
> Night-time sailing yacht cockpit in darkness, illuminated compass card and
> navigation instruments glowing dim cyan, rain-flecked glass, very dark, moody,
> cinematic, photorealistic, 8k --ar 16:9 --style raw

### `bemutatkozas-01.jpg` — alapító kapitány portré (álló, 3:4)
> Environmental portrait of a weathered sailing captain in his 50s standing at
> the helm of a modern yacht at blue hour, salt-and-pepper beard, dark technical
> sailing jacket, confident calm expression, dark ocean behind, cinematic rim
> light, moody premium, photorealistic, 8k --ar 3:4 --style raw

### `hajo-01.jpg` — NM 32 „Uralom" (fekvő, 3:2)
> A modern 32-foot performance cruiser sailing yacht heeling under full sail on
> dark deep-blue water, bow spray, dramatic silver light breaking through clouds,
> dynamic low angle from the water, cinematic, photorealistic, 8k --ar 3:2 --style raw

### `hajo-02.jpg` — NM 40 „Horizont" (fekvő, 3:2)
> A 40-foot bluewater cruising sailing yacht at anchor in a calm dark bay at
> golden dusk, warm cabin lights glowing, glassy water reflection, distant
> Croatian islands, serene premium atmosphere, photorealistic, 8k --ar 3:2 --style raw

### `hajo-03.jpg` — NM 28 „Tanítvány" (fekvő, 3:2)
> A small 28-foot daysailer sailing yacht on silver-grey Lake Balaton water at
> dawn, soft mist, calm and minimal composition, silver light, moody cinematic,
> photorealistic, 8k --ar 3:2 --style raw

---

## Videó (Runway Gen-3 / Kling / Veo)

### `kikoto-loop.mp4` — a Kikötő szekció háttérvideója (10–15 mp, seamless loop, 16:9)
> Slow cinematic dolly across a small premium marina at dusk, sailing yacht masts
> silhouetted against deep blue sky, warm dock lamps reflecting on calm dark
> water, gentle mast sway, seamless loop, no people, moody premium color grade, 4k

Web-optimalizálás legyártás után:
```
ffmpeg -i NYERS.mp4 -an -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart kikoto-loop.mp4
```

### `flotta-loop.mp4` — a Flotta szekció háttérvideója (10–15 mp, seamless loop, 16:9)
> Slow cinematic drone glide alongside a modern 32-foot sailing yacht heeling
> under full sail on dark deep-blue open water at dusk, bow spray, silver light
> on the waves, seamless loop, no cuts, 4k, moody premium color grade

**Legyártás után web-optimalizálás** (hang ki, méret le — a mappában futtatva):
```
ffmpeg -i NYERS.mp4 -an -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart flotta-loop.mp4
```

### Hero videók (megvannak, csak csere esetén)
- `vitorlas-hero-static.mp4` → újrakódolás: `ffmpeg -i vitorlas-hero-static.mp4 -an -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart vitorlas-hero-static-web.mp4`
- `vitorlas-hero-scrub.mp4` → **kötelező** all-intra kódolás (enélkül akad a scroll-scrub): `ffmpeg -i vitorlas-hero-scrub.mp4 -an -c:v libx264 -g 1 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart vitorlas-hero-scrub-web.mp4`
