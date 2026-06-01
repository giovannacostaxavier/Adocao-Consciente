const menuBtn = document.getElementById('menuBtn')
const navLinks = document.querySelector('.navLinks')

menuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('aberto')
})

// fecha o menu ao clicar num link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('aberto')
  })
})
const stats = document.querySelectorAll('.stat-num')

const valores = [1200, 350, 98, 15]
const sufixos = ['+', '+', '%', '']

function animarContador(elemento, destino, sufixo) {
  let atual = 0
  const duracao = 2000
  const incremento = destino / (duracao / 16)

  const contador = setInterval(() => {
    atual += incremento
    if (atual >= destino) {
      atual = destino
      clearInterval(contador)
    }
    elemento.textContent = Math.floor(atual).toLocaleString('pt-PT') + sufixo
  }, 16)
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      stats.forEach((stat, i) => {
        animarContador(stat, valores[i], sufixos[i])
      })
      observer.disconnect()
    }
  })
}, { threshold: 0.3 })

observer.observe(document.querySelector('.stats'))