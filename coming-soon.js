document.addEventListener('DOMContentLoaded', () => {
  const content = document.querySelector('.content-wrapper');
  const orbs = document.querySelectorAll('.glow-orb');

  // Subtle interactive 3D parallax effect on mouse movement
  window.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const deltaX = (clientX - centerX) / centerX;
    const deltaY = (clientY - centerY) / centerY;

    if (content) {
      content.style.transform = `translate3d(${deltaX * 10}px, ${deltaY * 10}px, 0)`;
    }

    if (orbs[0]) {
      orbs[0].style.transform = `translate3d(${deltaX * -25}px, ${deltaY * -25}px, 0)`;
    }
    if (orbs[1]) {
      orbs[1].style.transform = `translate3d(${deltaX * 30}px, ${deltaY * 30}px, 0)`;
    }
  });
});
