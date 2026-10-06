# AI Vision Detector

A real-time, browser-based computer vision application built with React, TypeScript, Vite, and Google MediaPipe Tasks Vision. It performs on-device detection of human faces, eyes, hands, fingers, and 3D landmarks directly from your webcam with zero server-side transmission.

---

## Features

- **Face Detection**: Real-time bounding boxes, confidence scoring, face centroid, and feature tracking.
- **Eye Tracking**: Left and right eye landmark contours and pupil centers with verified visibility.
- **Facial Landmarks**: High-resolution facial mesh highlighting silhouette, nose bridge, and mouth contours.
- **Hand Detection**: Supports tracking up to 2 simultaneous hands with left/right hand anatomical classification.
- **Hand Skeleton**: 21 3D joint landmarks connected by articulated bone segments.
- **Finger Landmark Identification**: Individual tracking and extension state for Thumb, Index, Middle, Ring, and Pinky.
- **Geometric Finger Counting**: Accurately counts raised fingers (0 to 10) using joint angle and distance geometry, with automatic "Uncertain" detection if a hand is clipped or occluded.
- **Intelligent Mirroring**: Automatically mirrors front selfie camera previews while keeping labels and text readably oriented.
- **Zero-Latency Client-Side Inference**: Runs locally via WebAssembly and WebGL/GPU acceleration; no camera frames are sent to any server.

---

## Getting Started

### Prerequisites

- Node.js (version 18 or newer recommended)
- A webcam or camera device connected to your computer/phone

### Installation

```bash
# Clone the repository and install dependencies
npm install
```

### Running Locally

```bash
# Start the Vite development server
npm run dev
```

Visit `http://localhost:3000` in your web browser.

### Production Build

```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Browser Requirements

- **Chromium Browsers**: Chrome 90+, Edge 90+, Brave, Opera
- **Firefox**: Firefox 95+ (with WebGL enabled)
- **Safari**: Safari 15+ (macOS & iOS)
- **Permissions**: Requires user permission to access camera media streams (`navigator.mediaDevices.getUserMedia`).
- **Context**: Must be served over `https://` or `http://localhost` (Secure Context required by browser MediaDevices API).

---

## Camera Permissions

When you first click **Start Camera**, your browser will present a permission dialog asking for access to your camera.

1. Click **Allow**.
2. If blocked by accident:
   - **Chrome / Edge**: Click the camera icon or site settings icon in the address bar, select **Allow**, and refresh.
   - **Safari**: Go to Safari > Settings > Websites > Camera, and set this site to **Allow**.
   - **Firefox**: Click the permissions icon next to the URL and clear the blocked permission.

---

## Vision Model Setup

AI Vision Detector utilizes official Google MediaPipe Tasks Vision models:
- **Face Landmarker**: Float16 lightweight mesh model (`face_landmarker.task`)
- **Hand Landmarker**: Float16 joint tracking model (`hand_landmarker.task`)

Models and WebAssembly binaries are stored locally in `/public/models` and `/public/wasm` for instant offline-capable loading, with automatic fallback to Google's content delivery network (CDN) if local files cannot be reached.

---

## Troubleshooting

| Problem | Cause | Resolution |
| :--- | :--- | :--- |
| **"Camera Access Denied"** | Browser permission rejected or blocked in OS settings | Reset camera permission in browser address bar and reload. |
| **"No Camera Found"** | No webcam connected or device drivers inactive | Verify your webcam is plugged in and recognized in your operating system. |
| **"Camera is in use"** | Another tab (Zoom, Meet, Teams) has locked the webcam | Close any other tabs or applications currently using your webcam. |
| **Low FPS / Stutter** | Hardware acceleration disabled in browser | Ensure "Use graphics acceleration when available" is enabled in browser settings. |
| **"Uncertain" Finger Count** | Hand is held too far, partially off-screen, or fingers are occluded | Bring your hand fully into the camera view with fingers facing forward. |

---

## Privacy & Security

Camera frames are processed strictly inside your device's browser memory via WebAssembly. Neither video streams nor individual image frames are recorded, stored, or transmitted over the network.
