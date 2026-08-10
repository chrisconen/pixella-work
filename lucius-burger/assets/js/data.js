/* LUCIUS BURGER — Inhalte (de-AT). Die einzige Datei, die für Namen, Preise
   und Texte bearbeitet werden muss. lucius.js und shop.js sind sprachneutral. */
"use strict";

/* Kategorien für den Speisekarten-Filter. */
const CATEGORIES = [
  { id: "all", label: "Alle" },
  { id: "burger", label: "Burger" },
  { id: "bbq", label: "BBQ Pit" },
  { id: "dog", label: "Hot Dogs" },
  { id: "combo", label: "Menüs" },
  { id: "side", label: "Beilagen" },
  { id: "drink", label: "Getränke & Dessert" },
];

/* price = Cent. img = media/menu/<img>.webp — fehlt die Datei, greift der Platzhalter.
   tags: 'spicy' | 'veg' | 'new' | 'best' | 'sharing' */
const MENU = [
  // ---- SIGNATURE BURGER ----
  { id: "kingpin", cat: "burger", name: "The Kingpin", img: "burger-kingpin",
    desc: "Doppelt 200 g argentinischer Angus, zweifach geräucherter Cheddar, Bacon-Marmelade, Zwiebelkonfit, 24-Stunden-Brioche.",
    price: 1890, rating: 4.9, votes: 312, tags: ["best"], hero: true },
  { id: "smoke-bourbon", cat: "burger", name: "Smoke & Bourbon", img: "burger-smoke-bourbon",
    desc: "Bourbon-Melasse-BBQ-Glasur, knuspriger Zwiebelvorhang, geräucherter Provolone, scharfe Gurken.",
    price: 1690, rating: 4.8, votes: 247, tags: [], hero: true },
  { id: "pampas-prime", cat: "burger", name: "The Pampas Prime", img: "burger-pampas-prime",
    desc: "Weiderind aus Argentinien, taggleich gerührtes Chimichurri, Piquillo-Paprika, geschmolzener Provoleta.",
    price: 1990, rating: 5.0, votes: 189, tags: ["best"], hero: true },
  { id: "angus-noir", cat: "burger", name: "Black Angus Noir", img: "burger-angus-noir",
    desc: "Sepia-Brioche, 45 Tage trockengereifter Patty, schwarze Knoblauch-Aioli, Trüffel.",
    price: 2290, rating: 4.9, votes: 156, tags: ["new"] },
  { id: "butchers-daughter", cat: "burger", name: "The Butcher's Daughter", img: "burger-butchers-daughter",
    desc: "Trockengereifte Mischung, schmelzende Markbutter, karamellisierte Schalotten, Brunnenkresse.",
    price: 2090, rating: 4.8, votes: 134, tags: [] },
  { id: "rio-grande", cat: "burger", name: "Rio Grande", img: "burger-rio-grande",
    desc: "Pepper Jack, Chipotle-Mayo, gegrillte Jalapeños, zerdrückte Avocado, Tortilla-Splitter.",
    price: 1690, rating: 4.7, votes: 201, tags: ["spicy"] },
  { id: "sunrise-ranch", cat: "burger", name: "Sunrise Ranch", img: "burger-sunrise-ranch",
    desc: "Laufendes Spiegelei, Ahorn-Bacon, Rösti-Taler, gereifter Cheddar, Ranch.",
    price: 1590, rating: 4.7, votes: 98, tags: [] },
  { id: "cluckin-legend", cat: "burger", name: "Cluckin' Legend", img: "burger-cluckin-legend",
    desc: "In Buttermilch eingelegtes Brathendl, Honig-Chili-Glasur, Dillgurken-Turm, Salat.",
    price: 1550, rating: 4.8, votes: 176, tags: ["spicy"] },
  { id: "widowmaker", cat: "burger", name: "The Widowmaker", img: "burger-widowmaker",
    desc: "Drei Patties, Ghost-Pepper-Marmelade, drei Käse. Unterschrift erforderlich.",
    price: 2490, rating: 4.6, votes: 87, tags: ["spicy"] },
  { id: "heirloom", cat: "burger", name: "The Heirloom", img: "burger-heirloom",
    desc: "Gegrillter Halloumi, alte Paradeisersorten, Basilikumpesto, Rucola, im Kohlebrötchen.",
    price: 1490, rating: 4.7, votes: 112, tags: ["veg"] },

  // ---- BBQ PIT ----
  { id: "brisket", cat: "bbq", name: "Low & Slow Brisket", img: "bbq-brisket",
    desc: "14 Stunden Hickory-Rauch, mahagonifarbene Kruste, ein Zentimeter Rauchring. 250 g, mit Essig-Slaw.",
    price: 2290, rating: 4.9, votes: 223, tags: ["best"] },
  { id: "ribs", cat: "bbq", name: "St. Louis Rib Rack", img: "bbq-ribs",
    desc: "Halbe Rippenleiter, Bourbon-Glasur Schicht für Schicht, dazu eingelegte Zwiebeln und Cornbread.",
    price: 2090, rating: 4.9, votes: 198, tags: [] },
  { id: "burnt-ends", cat: "bbq", name: "Burnt Ends Bowl", img: "bbq-burnt-ends",
    desc: "Karamellisierte Brisket-Würfel, klebrige Glasur, grob gemahlener schwarzer Pfeffer.",
    price: 1750, rating: 5.0, votes: 145, tags: ["best"] },
  { id: "carolina", cat: "bbq", name: "The Carolina", img: "bbq-pulled-pork",
    desc: "Pulled Pork aus dem Rauch, Essig-Krautsalat, weiches Erdäpfelweckerl.",
    price: 1490, rating: 4.7, votes: 167, tags: [] },
  { id: "wings", cat: "bbq", name: "Bourbon Smoked Wings", img: "bbq-wings",
    desc: "8 Stück. Erst Rauch, dann heißes Öl, zuletzt Bourbon-Glasur und Sesam.",
    price: 1350, rating: 4.8, votes: 254, tags: [] },
  { id: "corn-ribs", cat: "bbq", name: "Smoked Corn Ribs", img: "bbq-corn-ribs",
    desc: "Geviertelter Kukuruz von der Glut, Chipotle-Butter, Cotija, Limette.",
    price: 690, rating: 4.6, votes: 91, tags: ["veg"] },

  // ---- HOT DOGS ----
  { id: "coney-baron", cat: "dog", name: "The Coney Baron", img: "dog-coney-baron",
    desc: "30 cm geräucherte Rindswurst, Chili con Carne, geschmolzener Cheddar, rohe Zwiebel.",
    price: 1290, rating: 4.6, votes: 121, tags: [] },
  { id: "manhattan-dog", cat: "dog", name: "Manhattan Dog", img: "dog-manhattan",
    desc: "Handgeschnittenes geräuchertes Pastrami, Körnersenf, Dillgurken, Kümmel.",
    price: 1350, rating: 4.7, votes: 94, tags: [] },
  { id: "texas-ripper", cat: "dog", name: "Texas Ripper", img: "dog-texas-ripper",
    desc: "Frittiert, aufgeplatzte Haut, Jalapeño-Relish, Röstzwiebeln, scharfes Ketchup.",
    price: 1190, rating: 4.5, votes: 78, tags: ["spicy"] },

  // ---- MENÜS ----
  { id: "classic-run", cat: "combo", name: "The Classic Run", img: "combo-classic-run",
    desc: "Ein Kingpin, eine Portion Rindertalg-Pommes, eiskalte Cola. Der sichere Treffer.",
    price: 2390, rating: 4.9, votes: 402, tags: ["best"] },
  { id: "full-throttle", cat: "combo", name: "The Full Throttle", img: "combo-full-throttle",
    desc: "Burger + Pommes + Buttermilch-Zwiebelringturm + Krügerl Amber Ale.",
    price: 2890, rating: 4.8, votes: 288, tags: [] },
  { id: "sunset-duo", cat: "combo", name: "Sunset Duo", img: "combo-sunset-duo",
    desc: "Zwei Burger, zwei Pommes, zwei dicke Shakes. Fürs Date, ohne Diskussion.",
    price: 4990, rating: 4.9, votes: 133, tags: ["sharing"] },
  { id: "pitmaster-board", cat: "combo", name: "The Pit Master Board", img: "combo-pitmaster-board",
    desc: "Brisket, halbe Rippenleiter, Burnt Ends, Cornbread, Slaw, Eingelegtes, zwei Bourbon Sour. Für zwei.",
    price: 6490, rating: 5.0, votes: 96, tags: ["sharing", "best"] },
  { id: "tailgate", cat: "combo", name: "The Tailgate", img: "combo-tailgate",
    desc: "Wings, drei Hot Dogs, Käse-Nachos, vier Flaschen Craft Beer. Für vier.",
    price: 8990, rating: 4.8, votes: 71, tags: ["sharing"] },
  { id: "kids-pit", cat: "combo", name: "Kids Pit Stop", img: "combo-kids",
    desc: "Mini-Smash-Burger, kleine Pommes, Apfelspalten, Erdbeershake.",
    price: 990, rating: 4.7, votes: 64, tags: [] },

  // ---- BEILAGEN ----
  { id: "fries", cat: "side", name: "Beef Fat Fries", img: "side-fries",
    desc: "Dreifach frittiert, in Rindertalg, mit grobem Meersalz.", price: 520, rating: 4.9, votes: 511, tags: ["best"] },
  { id: "truffle-fries", cat: "side", name: "Truffle Parm Fries", img: "side-truffle-fries",
    desc: "Trüffelöl, geriebener Parmesan, Petersilie.", price: 790, rating: 4.8, votes: 219, tags: ["veg"] },
  { id: "onion-rings", cat: "side", name: "Buttermilk Onion Rings", img: "side-onion-rings",
    desc: "Dicke Ringe, in Buttermilch mariniert, knusprige Panier.", price: 650, rating: 4.7, votes: 244, tags: ["veg"] },
  { id: "mac-bites", cat: "side", name: "Mac & Cheese Bites", img: "side-mac-bites",
    desc: "Frittierte Käse-Makkaroni-Würfel, endloser Käsefaden.", price: 690, rating: 4.6, votes: 158, tags: ["veg"] },
  { id: "cornbread", cat: "side", name: "Skillet Cornbread", img: "side-cornbread",
    desc: "Im Gusseisen gebackenes Maisbrot, schmelzende Honigbutter.", price: 520, rating: 4.7, votes: 103, tags: ["veg"] },
  { id: "slaw", cat: "side", name: "Slaw Blanco", img: "side-slaw",
    desc: "Knackiges Weißkraut, Mohn-Dressing, in der eiskalten Schale.", price: 390, rating: 4.4, votes: 88, tags: ["veg"] },

  // ---- GETRÄNKE & DESSERT ----
  { id: "pecan-pie", cat: "drink", name: "Bourbon Pecan Pie", img: "dessert-pecan-pie",
    desc: "Warme Pekannusstarte, Bourbon-Karamell, schmelzendes Vanilleeis.", price: 790, rating: 4.9, votes: 176, tags: ["veg"] },
  { id: "caramel-shake", cat: "drink", name: "Salted Caramel Shake", img: "drink-caramel-shake",
    desc: "Dick, kalt, gesalzenes Karamell rinnt außen herunter.", price: 690, rating: 4.8, votes: 231, tags: ["veg"] },
  { id: "freakshake", cat: "drink", name: "Oreo Freakshake", img: "drink-freakshake",
    desc: "Keks, Brownie, Schlagobersturm. Wir schämen uns nicht.", price: 850, rating: 4.7, votes: 142, tags: ["veg"] },
  { id: "coke-float", cat: "drink", name: "Cherry Coke Float", img: "drink-coke-float",
    desc: "Cola, Vanilleeis, Kirschen, beschlagenes Glas.", price: 590, rating: 4.6, votes: 97, tags: ["veg"] },
  { id: "amber-ale", cat: "drink", name: "Lucius Amber Ale", img: "drink-amber-ale",
    desc: "Eigenes Etikett, bernsteinfarben, dichte Krone. 0,5 l.", price: 520, rating: 4.7, votes: 188, tags: [] },
  { id: "bourbon-sour", cat: "drink", name: "Bourbon Sour", img: "drink-bourbon-sour",
    desc: "Bourbon, Zitrone, Angostura-Muster auf dem Schaum, ein großer Eiswürfel.", price: 990, rating: 4.8, votes: 121, tags: [] },
  { id: "lemonade", cat: "drink", name: "Hausgemachte Limonade", img: "drink-lemonade",
    desc: "Frisch gepresst, mit Rosmarin oder Himbeere.", price: 450, rating: 4.5, votes: 74, tags: ["veg"] },
];

/* Tagesmenü. day: 0=Sonntag … 6=Samstag (Date.getDay()) */
const DAILY = [
  { day: 1, code: "Mo", name: "Smash Monday", desc: "Doppelter Smash-Burger, Rindertalg-Pommes, hausgemachte Limonade.", price: 1190, img: "combo-classic-run" },
  { day: 2, code: "Di", name: "Brisket Tuesday", desc: "Drei Brisket-Tacos, Slaw, hausgemachte Limonade.", price: 1290, img: "bbq-brisket" },
  { day: 3, code: "Mi", name: "Wing Wednesday", desc: "Acht Bourbon-Wings, Pommes, Krügerl Bier oder Limo.", price: 1250, img: "bbq-wings" },
  { day: 4, code: "Do", name: "Pulled Thursday", desc: "The Carolina, Zwiebelringe, hausgemachte Limonade.", price: 1190, img: "bbq-pulled-pork" },
  { day: 5, code: "Fr", name: "Rib Friday", desc: "Halbe Rippenleiter, Cornbread, ein Krügerl Lucius Amber Ale.", price: 1490, img: "bbq-ribs" },
  { day: 6, code: "Sa", name: "Weekend Pit", desc: "Das Pit Master Board mit 20 % Rabatt, bis 14:00 Uhr.", price: 5190, img: "combo-pitmaster-board" },
  { day: 0, code: "So", name: "Weekend Pit", desc: "Das Pit Master Board mit 20 % Rabatt, bis 14:00 Uhr.", price: 5190, img: "combo-pitmaster-board" },
];

const STORY = [
  { n: "01", kicker: "Argentinien · Provinz Buenos Aires", title: "Der Rohstoff",
    body: "Zwölftausend Kilometer. So weit reist das Fleisch, bevor es den Rost berührt. Weiderind, Black Angus von der Estancia La Pampa, fünfundvierzig Tage Trockenreifung in unserem eigenen Kühlraum. Nicht weil es exotisch ist. Sondern weil wir es einmal probiert haben und danach nicht mehr zurückkonnten.",
    img: "story-01-pampas" },
  { n: "02", kicker: "260 °C · Hickory und Eiche", title: "Das Feuer",
    body: "Wir haben keinen einzigen Gasbrenner. Scheitholz kommt auf das Glutbett, und wenn das Thermometer 260 zeigt, fangen wir an. Acht Minuten, einmal wenden. Den Rest erledigt das Feuer — und das Feuer hat es nicht eilig.",
    img: "story-02-fire" },
  { n: "03", kicker: "14 Stunden · ab zwei Uhr früh", title: "Der Rauch",
    body: "Das Brisket geht um zwei Uhr früh hinein. Ben steht dann auf und lässt es vierzehn Stunden lang nicht allein. Um sieben ist die Kruste gerade erst dunkel. Zu Mittag wird daraus das, wofür die Gäste wiederkommen. Man kann es nicht beschleunigen. Wir haben es versucht.",
    img: "story-03-smokehouse" },
  { n: "04", kicker: "11 Menschen · 1 Rost", title: "Die Hand",
    body: "Die gesprungene Gusseisenplatte steht bis heute mitten in der Küche. LVCIVS — das war eingraviert, als wir sie '98 im Hof einer geschlossenen Parrilla fanden. Das Feuer hat uns den Namen gegeben. Wir haben es nur nicht ausgehen lassen.",
    img: "story-04-hands" },
  { n: "05", kicker: "Glutgasse 14 · 74 Plätze", title: "Der Raum",
    body: "Schwarzer Stahl, geräucherte Eiche, rote Lederboxen und Edison-Lampen. Die Küche ist offen, weil es nichts zu verstecken gibt — von jedem Platz siehst du die Flamme und hörst, wie das Fleisch auf den Rost kommt. Vierundsiebzig Plätze, achtzehn Tische. Einen davon halten wir für dich frei.",
    img: "story-05-diningroom" },
];

const PILLARS = [
  { k: "01", t: "Source", d: "Wir nennen jeden Lieferanten beim Namen. Könnten wir ihn nicht an die Wand schreiben, würden wir dort nicht einkaufen." },
  { k: "02", t: "Fire", d: "Kein Küchengerät läuft bei uns mit Strom, wenn es auch mit Feuer geht. Langsamer. Besser." },
  { k: "03", t: "No Shortcuts", d: "Die Brioche 24 Stunden. Das Brisket 14. Die Sauce 6. Ist das Tagesmenü zu Mittag aus, wird an dem Tag nichts mehr nachgelegt." },
];

const STATS = [
  { v: 45, s: "", l: "Tage Reifung" },
  { v: 14, s: "", l: "Stunden Rauch" },
  { v: 260, s: "°C", l: "Glut" },
  { v: 11, s: "", l: "Menschen in der Küche" },
  { v: 8214, s: "", l: "Gäste heuer" },
  { v: 4.9, s: "★", l: "Durchschnittsbewertung" },
];

const SUPPLIERS = [
  { c: "AR", n: "Estancia La Pampa", d: "Weiderind, Black Angus, fünfundvierzig Tage gereift.", img: "sup-pampa" },
  { c: "BR", n: "Fazenda Boa Vista", d: "Nelore × Angus aus dem brasilianischen Hochland.", img: "sup-brazil" },
  { c: "AT", n: "Bäckerei Nr. 7, Wien", d: "24-Stunden-Sauerteig-Brioche, jeden Morgen um fünf.", img: "sup-bakehouse" },
  { c: "AT", n: "Käserei Hinteregg", d: "12 Monate gereifter Bergcheddar, von Hand gewendet.", img: "sup-cheese" },
  { c: "AT", n: "Gärtnerei Marchfeld", d: "Alte Paradeisersorten, Salat und Zwiebeln aus Niederösterreich.", img: "sup-farm" },
  { c: "US", n: "Ashwood & Hickory Co.", d: "Amerikanisches Hickory- und Eichenscheitholz. Keine Briketts.", img: "sup-wood" },
];

const TEAM = [
  { n: "Lucius Bereczki", r: "Gründer & Pitmaster", q: "Das Feuer hat es nicht eilig. Ich auch nicht.", img: "team-lucius" },
  { n: "Sofia Márquez", r: "Head Chef · Buenos Aires", q: "Chimichurri kann man nicht verderben. Aber respektieren.", img: "team-sofia" },
  { n: "Jonas Reiter", r: "Grill Captain", q: "Acht Minuten. Ich wende einmal.", img: "team-denes" },
  { n: "Hanna Gruber", r: "Pastry & Shakes", q: "Dessert ist kein nachträglicher Einfall.", img: "team-hanna" },
  { n: "Ben Whitaker", r: "Smoke Engineer", q: "Ich stehe um zwei Uhr früh auf. Ich beschwere mich nicht.", img: "team-ben" },
];

const REVIEWS = [
  { n: "Katharina Huber", d: "28. Juli 2026", s: 5, t: "Wegen des Pampas Prime sind wir zum dritten Mal da. Das Chimichurri allein wäre den Weg wert. Service flott, das Lokal hat eine brutale Stimmung." },
  { n: "Markus Steiner", d: "19. Juli 2026", s: 5, t: "Vierzehn Stunden Rauch — man schmeckt sie. So ein Brisket habe ich in Wien noch nicht gegessen. Der Rauchring wie aus dem Lehrbuch." },
  { n: "Lena Bauer", d: "11. Juli 2026", s: 4, t: "Der vegetarische Heirloom wird wirklich ernst genommen, kein Alibi-Gericht. Einen Stern Abzug fürs Warten am Freitagabend." },
  { n: "Tobias Wagner", d: "30. Juni 2026", s: 5, t: "The Widowmaker. Aufgegessen. Ich lebe. Empfehlung, aber nimm jemanden mit, der dich heimbringt." },
  { n: "Julia Moser", d: "22. Juni 2026", s: 5, t: "Firmenessen zu zwölft am Long Table. Alle sind zufrieden heimgegangen, und das ist bei uns selten." },
  { n: "Stefan Gruber", d: "14. Juni 2026", s: 5, t: "Die Lieferung war in 32 Minuten da, die Pommes haben noch geknuspert. Keine Ahnung, wie sie das machen, aber sie machen es." },
];

/* Tische für den Grundriss. x/y/w/h = SVG-Koordinaten (viewBox 0 0 1000 620), r = runder Tisch */
const TABLES = [
  { id: "T1", zone: "Pit Side", seats: 2, x: 118, y: 132, r: 30 },
  { id: "T2", zone: "Pit Side", seats: 2, x: 118, y: 236, r: 30 },
  { id: "T3", zone: "Pit Side", seats: 4, x: 118, y: 348, r: 38 },
  { id: "T4", zone: "Pit Side", seats: 4, x: 250, y: 132, r: 38 },
  { id: "T5", zone: "Pit Side", seats: 2, x: 250, y: 250, r: 30 },
  { id: "B1", zone: "Booths", seats: 4, x: 620, y: 96, w: 150, h: 74 },
  { id: "B2", zone: "Booths", seats: 4, x: 620, y: 194, w: 150, h: 74 },
  { id: "B3", zone: "Booths", seats: 6, x: 620, y: 292, w: 150, h: 92 },
  { id: "B4", zone: "Booths", seats: 4, x: 620, y: 408, w: 150, h: 74 },
  { id: "B5", zone: "Booths", seats: 6, x: 400, y: 408, w: 150, h: 92 },
  { id: "B6", zone: "Booths", seats: 4, x: 400, y: 96, w: 150, h: 74 },
  { id: "L1", zone: "Long Table", seats: 12, x: 388, y: 232, w: 176, h: 140 },
  { id: "P1", zone: "Terrace", seats: 2, x: 890, y: 126, r: 26 },
  { id: "P2", zone: "Terrace", seats: 2, x: 890, y: 206, r: 26 },
  { id: "P3", zone: "Terrace", seats: 4, x: 890, y: 300, r: 34 },
  { id: "P4", zone: "Terrace", seats: 4, x: 890, y: 396, r: 34 },
  { id: "P5", zone: "Terrace", seats: 2, x: 890, y: 478, r: 26 },
  { id: "P6", zone: "Terrace", seats: 2, x: 890, y: 546, r: 26 },
];

const ZONE_NOTE = {
  "Pit Side": "Zwei Meter von der offenen Glut. Es ist heiß. Es zahlt sich aus.",
  "Booths": "Lederboxen, eigene Lampe, die leisere Ecke.",
  "Long Table": "Zwölf Plätze an einer Eichentafel. Liebling der Firmenessen.",
  "Terrace": "Überdachter, beheizter Gastgarten. Hundefreundlich.",
};

/* Lieferzonen: PLZ-Bereich -> Gebühr (Cent) */
const DELIVERY_ZONES = [
  { from: 1010, to: 1090, name: "Zone I · Innere Bezirke", fee: 390 },
  { from: 1100, to: 1190, name: "Zone II · Gürtel & Umgebung", fee: 390 },
  { from: 1200, to: 1230, name: "Zone III · Außenbezirke", fee: 590 },
];
const FREE_DELIVERY_OVER = 4000;

const OPENING = [
  { day: 1, label: "Montag", open: "11:30", close: "23:00" },
  { day: 2, label: "Dienstag", open: "11:30", close: "23:00" },
  { day: 3, label: "Mittwoch", open: "11:30", close: "23:00" },
  { day: 4, label: "Donnerstag", open: "11:30", close: "23:00" },
  { day: 5, label: "Freitag", open: "11:30", close: "00:30" },
  { day: 6, label: "Samstag", open: "11:30", close: "00:30" },
  { day: 0, label: "Sonntag", open: "11:30", close: "22:00" },
];

const SLOGANS = [
  "Fire-born since 2016",
  "Nimm dir die Serviette. Du wirst sie brauchen.",
  "Kein Fastfood. Langsames Feuer.",
  "48 Stunden Reifung. 8 Minuten Glut. 1 Bissen.",
  "Wir kennen den Namen des Rindes.",
  "Rinnt es dir nicht den Ellbogen hinunter, nehmen wir es zurück.",
];


/* ═══ LOKALISIERUNG ════════════════════════════════════════════════
   Alle sichtbaren Texte und länderspezifischen Einstellungen. lucius.js
   und shop.js sind sprachneutral — für einen anderen Markt genügt es,
   diese Datei auszutauschen.
   ═══════════════════════════════════════════════════════════════ */

const LOCALE = {
  lang: "de-AT",
  /* Preise sind in Cent gespeichert — so bleibt die Geldrechnung ganzzahlig. */
  money: n => (Math.round(n) / 100).toLocaleString("de-AT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €",
  num: (n, d = 0) => n.toLocaleString("de-AT", { minimumFractionDigits: d, maximumFractionDigits: d }),
  phoneRe: /^(\+43|0)[\s-]?\d{1,4}[\s-]?\d{3,4}[\s-]?\d{3,4}$/,
  phoneHint: "+43 664 123 4567",
  street: "Glutgasse 14",
  city: "Wien",
  postalCode: "1070",
  phone: "+43-1-555-0116",
  email: "pit@luciusburger.at",
  orderPrefix: "LB-2026-",
  resPrefix: "LB-R-",
};

const SEO = {
  description: "Premium-Angus-Burger aus Argentinien und Hickory-BBQ. Weiderind, 45 Tage trockengereift, offene Glut.",
  cuisine: ["American", "Barbecue", "Burger"],
  payment: "Bar, Bankomatkarte, Kreditkarte",
  menuName: "Speisekarte",
  country: "AT",
};

const T = {
  starsAria: v => `${v} / 5 Sterne`,
  tags: { best: "Liebling", spicy: "Scharf", veg: "Vegetarisch", new: "Neu", sharing: "Zum Teilen" },
  addToCart: "In den Warenkorb",
  inCart: "Im Warenkorb ✓",
  today: "heute",
  dailyWindow: "11:30 &ndash; 15:00 Uhr, solange der Vorrat reicht",
  dailySuffix: "Tagesmenü",

  open: {
    now: "Jetzt geöffnet", soon: "Öffnet bald", closed: "Geschlossen",
    until: h => `bis ${h} Uhr`,
    todayFrom: h => `heute ab ${h} Uhr`,
    tomorrowFrom: h => `morgen ab ${h} Uhr`,
    titleOpen: h => `Heute haben wir bis ${h} Uhr geöffnet.`,
    titleClosed: n => `Wir öffnen ${n}.`,
  },

  steps: [
    { label: "Warenkorb", title: "Deine Bestellung", next: "Weiter zur Bestellung" },
    { label: "1/3 Daten", title: "Wohin liefern wir?", next: "Weiter zur Zeit" },
    { label: "2/3 Zeitpunkt", title: "Wann darf es sein?", next: "Weiter zur Zahlung" },
    { label: "3/3 Zahlung", title: "Zusammenfassung", next: "Jetzt bestellen" },
  ],

  cart: {
    less: n => `${n} — eines weniger`,
    more: n => `${n} — eines mehr`,
    upsellAdd: (n, p) => `${n} hinzufügen — ${p}`,
    added: n => `„${n}" liegt im Warenkorb.`,
    waiting: n => `${n} Artikel warten in deinem Warenkorb.`,
    subtotal: "Zwischensumme",
    pickupFree: "Abholung vor Ort",
    delivery: "Lieferung",
    free: "gratis",
    freeOver: t => `Gratis ab ${t}`,
    stillNeeded: t => `noch ${t}`,
    total: "Gesamt",
  },

  zone: {
    ok: (name, fee, isFree) => `${name} — Lieferung ${fee}${isFree ? " (bei dir gratis)" : ""}.`,
    bad: "Dorthin liefern wir leider noch nicht.",
    swap: street => `Ich hole selbst ab — ${street} &rarr;`,
    blocked: "Zu dieser Postleitzahl liefern wir noch nicht — wähle bitte Abholung.",
  },

  form: {
    missing: label => `Fehlt oder ist fehlerhaft: ${label}.`,
    phoneBad: hint => `Die Telefonnummer passt nicht (z. B. ${hint}).`,
    pickSlot: "Bitte wähle ein Zeitfenster.",
    acceptTerms: "Bitte bestätige, dass dir klar ist: das ist eine Demo.",
  },

  slots: {
    free: (n, tail) => `${n} freie Zeitfenster an diesem Tag. ${tail}`,
    tailPickup: "Letzte Abholung eine halbe Stunde vor Sperrstunde.",
    tailDelivery: "Die letzte Bestellung nehmen wir eine Stunde vor Sperrstunde an.",
    none: "An diesem Tag ist kein Zeitfenster mehr frei — wähle einen anderen Tag.",
    eta: (min, at) => `≈ ${min} Minuten (ca. ${at} Uhr)`,
  },

  pay: { cash: "Bar bei der Zustellung", card: "Karte bei der Zustellung", online: "Online (Demo)" },

  summary: {
    pickup: "Abholung", pickupValue: street => `Selbstabholung &middot; ${street}`,
    address: "Adresse", namePhone: "Name / Telefon", time: "Zeitpunkt", note: "Anmerkung",
    subtotal: "Zwischensumme", delivery: "Lieferung", free: "gratis", due: "Zu zahlen",
  },

  thanks: {
    orderKicker: "Bestellung erfasst",
    orderTitle: "Danke!",
    ledePickup: "Das liegt jetzt wirklich auf der Glut. Wir schreiben dir per SMS, sobald du abholen kannst.",
    ledeDelivery: "Das liegt jetzt wirklich auf der Glut. Sobald es fertig ist, ruft der Fahrer an.",
    orderNo: "Bestellnummer",
    readyAt: "Abholbereit", arrival: "Ankunft",
    pickupAt: "Abholung", addressAt: "Adresse",
    payment: "Zahlung",
    resKicker: "Tisch reserviert",
    resTitle: "Reservierung steht!",
    resLede: "Wir haben dir eine Bestätigung geschickt. Den Tisch halten wir ab der Reservierungszeit 15 Minuten frei.",
    resCode: "Reservierungscode", resTable: "Tisch", resWhen: "Wann", resGuests: "Personen",
  },

  fp: {
    grill: "Offener Grill", bar: "Bar", entrance: "Eingang",
    pax: n => `${n} Pers.`,
    taken: "belegt", tooSmall: "zu klein für die Personenzahl", free: "frei",
    capacity: "Kapazität", date: "Datum", time: "Uhrzeit", guests: "Personen",
    book: id => `Reservieren &mdash; ${id}`,
    hold: "Nach der Reservierung halten wir den Tisch 15 Minuten frei.",
    pickPrompt: "Wähle einen Tisch im Grundriss.",
    pickFirst: "Wähle zuerst einen Tisch im Grundriss.",
    pickThenData: "Wähle einen Tisch im Grundriss — dann kommen die Daten.",
  },
};
