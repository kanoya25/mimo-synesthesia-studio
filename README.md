# MiMo Synesthesia Studio

> **AI-Powered Text-to-Visual-Art Experience** — Ubah kata-kata menjadi seni visual hidup, suara, dan warna.

![MiMo Synesthesia Studio](https://img.shields.io/badge/Powered%20by-Xiaomi%20MiMo%20AI-6366f1?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge)

## Demo

**Live Demo:** [mimo-synesthesia-studio.devinapps.com](https://mimo-synesthesia-studio-bsxlldvm.devinapps.com)

## Apa itu Synesthesia Studio?

**Synesthesia** adalah fenomena neurologis di mana satu indera memicu pengalaman di indera lain — misalnya, "melihat" musik atau "mendengar" warna.

**MiMo Synesthesia Studio** menerjemahkan konsep ini ke dunia digital: ketik teks apapun, dan AI akan mengubahnya menjadi:

- **Seni Visual** — Partikel hidup dengan warna, bentuk, dan perilaku unik
- **Suara** — Frekuensi audio generatif berdasarkan emosi teks
- **Warna** — Palet warna otomatis yang mencerminkan tone emosional

Setiap input menghasilkan karya yang **benar-benar unik** dan tidak pernah sama.

## Fitur

### Emotion Analysis Engine
Menganalisis 8 dimensi emosi dari teks:
- 😊 Kebahagiaan (Joy)
- 😢 Kesedihan (Sadness)
- 😠 Kemarahan (Anger)
- 😨 Ketakutan (Fear)
- 🧘 Ketenangan (Peace)
- ⚡ Energi (Energy)
- 💕 Romantis (Romance)
- 🔮 Misteri (Mystery)

### Advanced Particle System
8 mode perilaku partikel berbeda:
- **Float** — Melayang lembut ke atas
- **Fall** — Jatuh seperti hujan
- **Explode** — Meledak dari titik pusat
- **Flicker** — Berkedip misterius
- **Orbit** — Mengorbit di sekitar titik pusat
- **Burst** — Memancar dengan energi
- **Spiral** — Berputar dalam spiral
- **Custom shapes** — Lingkaran, segitiga, bintang, hati

### Audio Synthesis
- Generative audio berdasarkan frekuensi emosi
- Oscillator dengan LFO modulation
- Ambient pad harmonics
- Real-time frequency visualization

### Fitur Lainnya
- 🎨 **Color Palette** — Palet warna otomatis dari analisis emosi
- 📸 **Export** — Simpan karya seni sebagai PNG
- 🖼️ **Gallery** — Simpan dan lihat kreasi sebelumnya
- 🖱️ **Interactive** — Partikel bereaksi terhadap gerakan mouse
- 📱 **Responsive** — Berfungsi di desktop dan mobile
- 🇮🇩 **5 Preset Indonesia** — Sunset, Neon Rain, Sakura, Galaxy, Campfire

## Tech Stack

- **HTML5 Canvas** — Rendering partikel dan visualisasi
- **Web Audio API** — Sintesis audio real-time
- **Vanilla JavaScript** — Tanpa framework, ringan dan cepat
- **CSS3** — Animasi, glassmorphism, gradien
- **Google Fonts** — Inter & Space Grotesk

## Struktur Project

```
mimo-synesthesia-studio/
├── index.html          # Halaman utama
├── css/
│   └── style.css       # Styling (cosmic dark theme)
├── js/
│   ├── app.js          # Logic utama & UI
│   ├── audio.js        # Audio synthesis engine
│   ├── emotions.js     # Emotion analysis engine
│   ├── particles.js    # Particle system (background + main)
│   └── synesthesia.js  # Synesthesia renderer (combines all)
├── assets/             # Asset tambahan
└── README.md
```

## Cara Menjalankan

1. Clone repository:
```bash
git clone https://github.com/waydia/mimo-synesthesia-studio.git
cd mimo-synesthesia-studio
```

2. Jalankan dengan server lokal:
```bash
# Menggunakan Python
python3 -m http.server 8080

# Atau menggunakan Node.js
npx serve .
```

3. Buka browser: `http://localhost:8080`

## Cara Menggunakan

1. Klik **"Mulai Berkreasi"** di halaman utama
2. Ketik teks apapun di text area, atau pilih salah satu **preset**
3. Klik **"Ciptakan Synesthesia"**
4. Nikmati seni visual yang tercipta!
5. Klik **tombol speaker** untuk mengaktifkan audio
6. **Gerakkan mouse** di atas partikel untuk interaksi
7. **Klik** di canvas untuk membuat ledakan partikel
8. Klik **tombol download** untuk menyimpan artwork sebagai PNG

## Contoh Input & Hasil

| Input | Emosi Dominan | Visual |
|-------|--------------|--------|
| "Matahari terbenam di lautan tenang" | 🧘 Ketenangan | Partikel teal/emas mengorbit |
| "Hujan deras di kota malam" | 😢 Kesedihan | Partikel biru/pink berjatuhan |
| "Api cinta berkobar di hati" | 😊 Kebahagiaan | Partikel emas/oranye melayang |
| "Galaksi spiral berputar lambat" | ⚡ Energi | Partikel hijau/kuning berkilau |

## Powered by Xiaomi MiMo AI

Project ini dibuat sebagai bagian dari **Xiaomi MiMo Orbit 100T Token Creator Incentive Program**. MiMo Synesthesia Studio mendemonstrasikan penggunaan AI kreatif untuk mengubah teks menjadi pengalaman multi-sensori yang unik.

- [Xiaomi MiMo](https://mimo.xiaomi.com/)
- [MiMo API Platform](https://platform.xiaomimimo.com/)
- [MiMo Studio](https://aistudio.xiaomimimo.com)

## License

MIT License — bebas digunakan dan dimodifikasi.

---

**Made with ❤️ and AI**
