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
    return `https://lh3.googleusercontent.com/d/${match[1]}`
  }
  return link
}

function parsearLinha(linha) {
  const colunas = []
  let atual = ''
  let dentroAspas = false
  for (let i = 0; i < linha.length; i++) {
    const char = linha[i]
    if (char === '"') {
      dentroAspas = !dentroAspas
    } else if (char === ',' && !dentroAspas) {
      colunas.push(atual.trim())
      atual = ''
    } else {
      atual += char
    }
  }
  colunas.push(atual.trim())
  return colunas
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

function criarCarrossel(animais, secao) {
  const cardsContainer = secao.querySelector('.cards')
  let indice = 0
  const porVez = 3

  function renderizar() {
    cardsContainer.innerHTML = animais
      .slice(indice, indice + porVez)
      .map(criarCard)
      .join('')
    cardsContainer.style.opacity = '1'
    btnAnterior.disabled = indice === 0
    btnProximo.disabled = indice + porVez >= animais.length
    btnAnterior.style.opacity = indice === 0 ? '0.3' : '1'
    btnProximo.style.opacity = indice + porVez >= animais.length ? '0.3' : '1'
  }

  function animar(direcao, callback) {
    cardsContainer.style.transition = 'opacity 0.3s, transform 0.3s'
    cardsContainer.style.opacity = '0'
    cardsContainer.style.transform = direcao === 'proximo' ? 'translateX(-30px)' : 'translateX(30px)'
    setTimeout(() => {
      callback()
      cardsContainer.style.transform = direcao === 'proximo' ? 'translateX(30px)' : 'translateX(-30px)'
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          cardsContainer.style.opacity = '1'
          cardsContainer.style.transform = 'translateX(0)'
        })
      })
    }, 300)
  }

  const controles = document.createElement('div')
  controles.classList.add('carrossel-controles')

  const btnAnterior = document.createElement('button')
  btnAnterior.classList.add('btn-seta')
  btnAnterior.innerHTML = '&#8592;'

  const btnProximo = document.createElement('button')
  btnProximo.classList.add('btn-seta')
  btnProximo.innerHTML = '&#8594;'

  btnAnterior.addEventListener('click', () => {
    if (indice > 0) {
      animar('anterior', () => {
        indice -= porVez
        renderizar()
      })
    }
  })

  btnProximo.addEventListener('click', () => {
    if (indice + porVez < animais.length) {
      animar('proximo', () => {
        indice += porVez
        renderizar()
      })
    }
  })

  controles.appendChild(btnAnterior)
  controles.appendChild(btnProximo)
  secao.appendChild(controles)

  let touchStartX = 0
  cardsContainer.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX
  })
  cardsContainer.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0 && indice + porVez < animais.length) {
        animar('proximo', () => { indice += porVez; renderizar() })
      } else if (diff < 0 && indice > 0) {
        animar('anterior', () => { indice -= porVez; renderizar() })
      }
    }
  })

  renderizar()
}

async function carregarAnimais() {
  const resposta = await fetch(CSV_URL)
  const texto = await resposta.text()
  const linhas = texto.trim().replace(/\r/g, '').split('\n').slice(1)

  const gatos = []
  const caes = []

  linhas.forEach(linha => {
    const colunas = parsearLinha(linha)
    const animal = {
      nome: colunas[0].trim(),
      tipo: colunas[1].trim().toLowerCase(),
      idade: colunas[2].trim(),
      sexo: colunas[3].trim(),
      foto: colunas[4].trim(),
      adotado: colunas[5].trim().toLowerCase()
    }

    if (animal.adotado === 'nao') {
      if (animal.tipo === 'gato') gatos.push(animal)
      if (animal.tipo === 'cao') caes.push(animal)
    }
  })

  criarCarrossel(gatos, document.querySelector('.secaoGatos'))
  criarCarrossel(caes, document.querySelector('.secaoCaes'))
}

carregarAnimais()
