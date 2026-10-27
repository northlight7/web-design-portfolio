'use strict'

const previews = [...document.querySelectorAll('[data-preview]')]
let active = null

function stop(figure) {
  figure.dataset.playing = 'false'
  figure.classList.remove('is-playing-video')
  const video = figure.querySelector('video')
  video.pause()
  const poster = figure.querySelector('.poster')
  poster.src = `assets/previews/${figure.dataset.preview}-poster.webp`
  const button = figure.querySelector('button')
  button.setAttribute('aria-pressed', 'false')
  button.setAttribute('aria-label', button.dataset.playLabel)
  button.querySelector('.button-label').textContent = 'Play preview'
  button.querySelector('.play-icon').textContent = '▷'
  if (active === figure) active = null
}

function useGif(figure) {
  if (figure.dataset.playing !== 'true') return
  figure.classList.remove('is-playing-video')
  figure.querySelector('video').pause()
  figure.querySelector('.poster').src = `assets/previews/${figure.dataset.preview}.gif`
}

for (const figure of previews) {
  const button = figure.querySelector('button')
  const video = figure.querySelector('video')
  const status = figure.querySelector('.preview-status')
  button.dataset.playLabel = button.getAttribute('aria-label')
  button.hidden = false
  video.addEventListener('error', () => useGif(figure))
  figure.querySelector('.poster').addEventListener('error', () => {
    if (figure.dataset.playing === 'true') {
      stop(figure)
      status.textContent = 'Preview unavailable. Use the Visit site link to explore the project.'
    }
  })
  button.addEventListener('click', async () => {
    if (figure.dataset.playing === 'true') {
      stop(figure)
      return
    }
    if (active) stop(active)
    active = figure
    figure.dataset.playing = 'true'
    button.setAttribute('aria-pressed', 'true')
    button.setAttribute('aria-label', button.dataset.playLabel.replace('Play ', 'Stop '))
    button.querySelector('.button-label').textContent = 'Stop preview'
    button.querySelector('.play-icon').textContent = '□'
    status.textContent = ''
    if (!video.canPlayType('video/mp4; codecs="avc1.4d401e"')) {
      useGif(figure)
      return
    }
    if (!video.src) video.src = video.dataset.src
    video.currentTime = 0
    try {
      await video.play()
      if (figure.dataset.playing === 'true') figure.classList.add('is-playing-video')
      else video.pause()
    } catch {
      useGif(figure)
    }
  })
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting && entry.target.dataset.playing === 'true') stop(entry.target)
    }
  })
  previews.forEach(figure => observer.observe(figure))
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden && active) stop(active)
})
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
  if (active) stop(active)
})
