# Zora Labs — Inżynieria Obrazu i Narracji Krótkometrażowej

Autorska, responsywna strona internetowa poświęcona platformie **Zora Labs** ([zora-labs.com](https://zora-labs.com)), zaprojektowana w estetyce nowoczesnego scrollytellingu 3D (*industrial dark cinema & Swiss grid*).

- **Opublikowana strona (GitHub Pages):** [https://nexisx281.github.io/aplikacje-internetowe/](https://nexisx281.github.io/aplikacje-internetowe/)
- **Repozytorium źródłowe:** [https://github.com/NexisX281/aplikacje-internetowe](https://github.com/NexisX281/aplikacje-internetowe)

---

## Wykorzystane technologie

- **HTML5** — semantyczna struktura dokumentu (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<figure>`, `<aside>`, `<footer>`), hierarchia nagłówków (`h1` → `h2` → `h3`), atrybuty dostępności `ARIA` (`aria-expanded`, `aria-live`, `role="dialog"`, `skip-link`) oraz opisy alternatywne `alt` wszystkich obrazów.
- **CSS3** — autorski system zmiennych CSS (`Custom Properties`) obsługujący dwa motywy kolorystyczne (*Onyx* — ciemne studio oraz *Papier* — jasny motyw archiwalny), układy `CSS Grid` i `Flexbox`, płynna typografia (`clamp()`), maski wierszowe (`line-mask`), portale `clip-path` oraz pełna responsywność (`@media`) dla ekranów komputerowych (`1366 px+`) i mobilnych (`375–390 px`).
- **JavaScript (ES6+)** — autorska logika interaktywna (`js/main.js`) połączona ze sceną trójwymiarową **WebGL (`Three.js` + fallback 2D Canvas)**, płynnym przewijaniem inercyjnym (**`Lenis`**) oraz wieloaktową choreografią osi czasu (**`GSAP + ScrollTrigger`**).

---

## Zaimplementowane funkcjonalności i animacje JavaScript

1. **Żyjąca rzeźba optyczna 3D WebGL (`js/webgl-scene.js`):** pełnoekranowa scena `Three.js` (36 przestrzennych bramek kadru, pierścienie kalibracyjne i 1650 cząsteczek helikalnych) reagująca na postęp przewijania (`0% → 100%`), prędkość scrolla oraz ruch kursora.
2. **Akt I — Przypięta transformacja kadru (`16:9` → `9:16`):** zsynchronizowana ze sceną 3D centralna przysłona wideo, która podczas przewijania fizycznie zmienia proporcje z szerokiego strumienia studyjnego `16:9` w pionowy monolit `9:16`.
3. **Akt II — Manifest rozświetlany słowo po słowie i portal pełnoekranowy:** sekwencyjne rozjaśnianie słów podczas czytania, wielowarstwowa paralaksa oraz okno wideo rozszerzające się za pomocą `clip-path` do pełnego ekranu.
4. **Akt III — Talia kart 3D z filtrowaniem i wyszukiwarką na żywo (`#archiwum`):** karty studiów przypadków (`0 0 1` – `0 0 4`) nakładające się w perspektywie 3D, wyposażone w dynamiczny filtr kategorii, wyszukiwarkę tekstową oraz przeliczanie osi czasu `ScrollTrigger`.
5. **Pełnoekranowy inspektor klatki i wideo (Modal / Lightbox):** podgląd rzeczywistych sekwencji wideo z dźwiękiem oraz zrzutów interfejsu z obsługą klawiatury (`Escape`).
6. **Akt IV — Poziomy tor stołu montażowego (`#system`) i symulator przepustowości:** pionowy scroll napędza poziomy ruch przez 5 warstw Zora Studio z rysującą się linią sygnałową SVG, a interaktywny kalkulator oblicza liczbę klipów, czas renderu i oszczędność czasu zespołu.
7. **Przełącznik motywu kolorystycznego (*Onyx* / *Papier*):** zmiana motywu z trwałą pamięcią w `localStorage` (`js/boot.js` + `js/main.js`).
8. **Rozwijane menu mobilne, płynny akordeon FAQ (`#specyfikacja`) oraz formularz z walidacją (`#kontakt`):** walidacja danych wejściowych po stronie klienta wraz z automatycznym zapisem szkicu wiadomości w `localStorage`.

---

## Struktura projektu

```text
.
├── index.html                  # Główny dokument HTML5
├── css/
│   └── style.css               # Arkusz stylów CSS3 (Grid, Flexbox, motywy, RWD)
├── js/
│   ├── boot.js                 # Wczesny odczyt motywu przed renderowaniem
│   ├── webgl-scene.js          # Scena 3D WebGL (Three.js) z fallbackiem 2D Canvas
│   ├── animations.js           # Choreografia Lenis + GSAP + ScrollTrigger
│   ├── main.js                 # Autorskie interakcje UI, filtry, modal, kalkulator, walidacja
│   └── vendor/                 # Lokalne biblioteki (three.min.js, gsap.min.js, ScrollTrigger, lenis)
├── assets/
│   ├── fonts/                  # Czcionki WOFF2 (Space Grotesk, Roboto Flex)
│   ├── img/                    # Logotyp i sygnet Zora Labs (SVG)
│   └── media/                  # Rzeczywiste materiały wideo MP4 i zrzuty Zora Studio
└── README.md                   # Dokumentacja projektu
```

---

## Uruchomienie lokalne

Projekt jest w pełni statyczny i nie wymaga procesu budowania. Aby uruchomić go lokalnie:

```bash
python -m http.server 8080
```

Następnie otwórz w przeglądarce adres `http://127.0.0.1:8080`.
