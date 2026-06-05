const menuBtn = document.getElementById('menuBtn')
const navLinks = document.querySelector('.navLinks')
menuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('aberto')
})
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

// PLANILHA
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRvHfRuSpxmZ0mGSD8_ii8hc_xqfTCKHXrcn4LKHHUwA9tmZiBw1KKSnm1J-Y7s6wNMlpsToVn-iYSN/pub?output=csv'

function converterLinkDrive(link) {
  const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`
  }
  return link
}

function criarCard(animal) {
  return `
    <div class="card">
      <div class="imgCG">
        <img src="${converterLinkDrive(animal.foto)}" alt="${animal.nome}">
      </div>
      <div class="descricaoBody">
        <h3>${animal.nome}</h3>
        <p>${animal.idade} · ${animal.sexo}</p>
        <a href="#" class="btnAdotar">Adotar</a>
      </div>
    </div>
  `
}

async function carregarAnimais() {
  const resposta = await fetch(CSV_URL)
  const texto = await resposta.text()
  const linhas = texto.trim().split('\n').slice(1) // remove cabeçalho

  const gatos = []
  const caes = []

  linhas.forEach(linha => {
    const colunas = linha.split(',')
    const animal = {
      nome: colunas[0].trim(),
      tipo: colunas[1].trim(),
      idade: colunas[2].trim(),
      sexo: colunas[3].trim(),
      foto: colunas[4].trim(),
      adotado: colunas[5].trim()
    }

    if (animal.adotado === 'nao') {
      if (animal.tipo === 'gato') gatos.push(animal)
      if (animal.tipo === 'cão' || animal.tipo === 'cao') caes.push(animal)
    }
  })

  document.querySelector('.secaoGatos .cards').innerHTML = gatos.map(criarCard).join('')
  document.querySelector('.secaoCaes .cards').innerHTML = caes.map(criarCard).join('')
}

carregarAnimais()
