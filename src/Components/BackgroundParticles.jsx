import { useCallback } from "react";
import { loadFull } from "tsparticles";
import Particles from "react-tsparticles";

const BackgroundParticles = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const particlesOptions = {
    background: {
      color: { value: "#ffffff" },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        resize: true,
      },
      modes: {
        repulse: { distance: 100, duration: 0.6 }, // slightly larger repulse area
      },
    },
    particles: {
      color: { value: ["#2E7D32", "#66BB6A", "#C8E6C9"] },
      links: {
        enable: true,
        color: "#A5D6A7",
        distance: 140, // more airy distance
        opacity: 0.15, // softer lines
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.6, // slower, smoother
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "bounce" },
      },
      number: {
        value: 70, // fewer particles for subtlety
        density: { enable: true, area: 900 },
      },
      opacity: {
        value: 0.5,
        random: { enable: true, minimumValue: 0.2 },
        anim: { enable: true, speed: 1, opacity_min: 0.2, sync: false },
      },
      shape: {
        type: ["circle", "triangle"], // add triangles for organic feel
      },
      size: {
        value: { min: 3, max: 7 },
        random: true,
        anim: { enable: true, speed: 4, size_min: 3, sync: false },
      },
    },
    detectRetina: true,
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={particlesOptions}
      className="absolute top-0 left-0 w-full h-full"
    />
  );
};

export default BackgroundParticles;
