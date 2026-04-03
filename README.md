# AirDraw ✨

AirDraw is an interactive, browser-based application that allows you to draw in the air using your webcam and hand gestures. Built with TypeScript and MediaPipe, it features a highly responsive, immersive full-screen camera background and a beautiful glassmorphism-style floating toolbar with dynamic neon glow effects.

## 🌟 Features

- **Hand Tracking in Real-Time:** Utilizes Google's MediaPipe Hands for accurate and low-latency gesture recognition and finger tracking.
- **Neon Glow Drawing Engine:** Draw smooth, glowing lines on an HTML5 Canvas that overlay directly on top of your webcam feed.
- **Glassmorphism UI:** A sleek, floating vertical toolbar with a transparent glass effect and modern aesthetics.
- **Immersive Full-Screen Experience:** The app covers the full window width and height to give a seamless AR-like drawing experience.
- **Color & Size Control:** Dynamically change brush colors, sizes, and clear the canvas with simple interface controls.

## 🛠️ Tech Stack

- **Frontend:** Vanilla TypeScript, HTML5, CSS3 / Vanilla CSS
- **Computer Vision:** [@mediapipe/hands](https://google.github.io/mediapipe/solutions/hands.html)
- **Tooling:** [Vite](https://vitejs.dev/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed in your environment.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/frhnkhn/AirDraw.git
   ```

2. **Navigate to the project directory:**
   ```bash
   cd AirDraw
   ```

3. **Install the dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173` (or the URL provided in your console) to view the app!

*Note: You must grant your browser permission to access the webcam for the hand tracking to function properly.*

## 🎨 How to Use

- Ensure you are in a well-lit environment and your camera can clearly see your hand.
- Use your index finger to draw lines over the screen.
- Interact with the floating toolbar on the side to change your brush color, adjust the stroke size, or clear your artwork.

## 📄 License

This project is open-source and available for all developers to build on top of.
