/* ============================================================================
   PORTFOLIO DATA  —  edit this file only
   ----------------------------------------------------------------------------
   CONFIG  : identity, contact links, availability, and the featured hero unit.
   PROJECTS: one object per project. Reorder / add / remove freely — filters,
             counters, grid numbers and the index table all rebuild themselves.

   videoUrl accepts:
       https://www.youtube.com/watch?v=XXXX     ┐
       https://youtu.be/XXXX                    ├─> YouTube iframe player
       https://youtube.com/shorts/XXXX          ┘   (normalised to /embed/ID)
       https://vimeo.com/XXXX                   -> Vimeo iframe player
       "media/example.mp4"                      -> native <video> + custom controls
       any other embed URL (Bunny, Mux, ...)     -> used as an iframe src as-is

   thumbnail : "assets/stills/still-01.jpg"  — 16:9 file, 1600x900 ideal.
               Drop your exported frame in with the same name and it replaces
               the placeholder. A missing file falls back to .svg automatically.

   letterbox : true  -> the still is NOT cropped to fill; it is centred inside
               the 16:9 frame (use for vertical 9:16 and square 1:1 work).
               Omit the key or set false for normal 16:9 stills.

   hook / pacing / software are OPTIONAL — leave them empty ("", "", []) and
   the matching block simply does not appear in the project modal.
   ========================================================================== */

const CONFIG = {
  name: "Mara Voss",
  role: "Video Editor / Post-Production",
  email: "hello@maravoss.studio",
  timezone: "UTC+01:00 — Lisbon",
  availability: "Available — Q4 2026",
  availabilityShort: "AVAILABLE",
  location: "Lisbon, PT",
  cv: "assets/cv.pdf",
  socials: [
    { label: "Vimeo",    url: "https://vimeo.com" },
    { label: "LinkedIn", url: "https://linkedin.com" },
    { label: "YouTube",  url: "https://youtube.com" }
  ],

  /* Hero unit — section title doubles as the nav label. */
  showreel: {
    label: "Featured",
    meta: "SELECTED WORK — 2026 EDITION",
    playLabel: "Play Video",
    title: "Cards Combat",
    videoUrl: "https://youtu.be/-JloIxDOgcs",
    thumbnail: "assets/stills/still-reel.jpg",
    duration: "01:33",
    resolution: "1920 × 1080",
    fps: "30 FPS",
    audio: "AAC / 44.1 kHz",
    codec: "H.264",
    year: "2026"
  }
};

const PROJECTS = [
  {
    id: "cards-combat",
    title: "Cards Combat",
    client: "Independent",
    category: "Trailer",
    role: "Edit / Motion",
    year: "2026",
    runtime: "01:33",
    resolution: "1920 × 1080",
    fps: "30 FPS",
    codec: "H.264",
    audio: "AAC / 44.1 kHz",
    videoUrl: "https://youtu.be/-JloIxDOgcs",
    thumbnail: "assets/stills/still-01.jpg",
    hook: "",
    pacing: "",
    software: []
  },
  {
    id: "trailer-fusee",
    title: "Trailer Fusée",
    client: "Independent",
    category: "Trailer",
    role: "Edit",
    year: "2026",
    runtime: "00:16",
    resolution: "1080 × 1920",
    fps: "24 FPS",
    codec: "H.264",
    audio: "AAC / 44.1 kHz",
    videoUrl: "https://youtube.com/shorts/FDJASIY7YLM",
    thumbnail: "assets/stills/still-02.jpg",
    letterbox: true,
    hook: "",
    pacing: "",
    software: []
  },
  {
    id: "trailer-enigme",
    title: "Trailer Enigme",
    client: "Independent",
    category: "Trailer",
    role: "Edit",
    year: "2026",
    runtime: "01:12",
    resolution: "1920 × 1080",
    fps: "15 FPS",
    codec: "H.264",
    audio: "AAC / 44.1 kHz",
    videoUrl: "https://youtu.be/DEhB8QWW_EE",
    thumbnail: "assets/stills/still-03.jpg",
    hook: "",
    pacing: "",
    software: []
  },
  {
    id: "logo-animation",
    title: "Logo Animation",
    client: "Independent",
    category: "Logo Animation",
    role: "Motion / Edit",
    year: "2026",
    runtime: "00:09",
    resolution: "2000 × 2000",
    fps: "30 FPS",
    codec: "VP9",
    audio: "AAC / 44.1 kHz",
    videoUrl: "https://youtube.com/shorts/RAYlTjG0lxw",
    thumbnail: "assets/stills/still-04.jpg",
    letterbox: true,
    hook: "",
    pacing: "",
    software: []
  },
  {
    id: "motion-design-website",
    title: "Motion Design AD for Website",
    client: "Independent",
    category: "Motion Design",
    role: "Motion",
    year: "2026",
    runtime: "00:30",
    resolution: "1080 × 1920",
    fps: "24 FPS",
    codec: "H.264",
    audio: "AAC / 44.1 kHz",
    videoUrl: "https://youtube.com/shorts/B4cfkeyUREE",
    thumbnail: "assets/stills/still-05.jpg",
    letterbox: true,
    hook: "",
    pacing: "",
    software: []
  },
  {
    id: "silversurfer",
    title: "SilverSurfer over the Earth",
    client: "Independent",
    category: "Experimental",
    role: "Edit / VFX",
    year: "2026",
    runtime: "00:21",
    resolution: "1080 × 1920",
    fps: "24 FPS",
    codec: "H.264",
    audio: "AAC / 44.1 kHz",
    videoUrl: "https://youtube.com/shorts/Q3jrU2bt37k",
    thumbnail: "assets/stills/still-06.jpg",
    letterbox: true,
    hook: "",
    pacing: "",
    software: []
  }
];
