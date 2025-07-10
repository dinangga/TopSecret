// Add interactive reactions
document.querySelectorAll('.reaction-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const emoji = btn.innerHTML.split(' ')[0];
    btn.innerHTML = `${emoji} ${Math.floor(Math.random() * 1000) + 1}K`;
  });
});

// Optional: Fullscreen video on click
document.querySelector('video')?.addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.querySelector('video').requestFullscreen();
  }
});
