const puppeteer = require('puppeteer')
const fs = require('fs')

const productosArray = []

const scrapper = async (url) => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await page.goto(url)
  await page.setViewport({ width: 1080, height: 1024 })

  await repeat(page, browser)
  await browser.close()
}

const repeat = async (page, browser) => {
  const arrayDivs = await page.$$('.item-container')
  for (const divProductos of arrayDivs) {
    let precio = 0
    let titulo = await divProductos.$eval('.item-title', (el) => el.textContent)
    let img = await divProductos.$eval('img', (el) => el.src)

    try {
      const strongValue = await divProductos.$eval(
        '.price-current strong',
        (el) => parseFloat(el.textContent.replace(/,/g, ''))
      )

      const supValue = await divProductos.$eval('.price-current sup', (el) =>
        parseFloat(el.textContent)
      )

      precio = parseFloat((strongValue + supValue * 0.01).toFixed(2))
    } catch (error) {
      precio = 0
    }

    const productos = {
      img,
      titulo,
      precio
    }
    productosArray.push(productos)
  }
  try {
    const nextButton = await page.$("[title='Next']")
    if (nextButton) {
      await nextButton.click()
      await page.waitForNavigation()
      console.log('OK NEXT')
      console.log(`llevamos ${productosArray.length} datos`)
      await repeat(page, browser)
    } else {
      console.log('No hay más páginas.')
      write(productosArray)
    }
  } catch (error) {
    write(productosArray)
    await browser.close()
  }
}

const write = (productosArray) => {
  fs.writeFile(
    'productos.json',
    JSON.stringify(productosArray, null, 2),
    () => {
      console.log('Archivo Escrito')
    }
  )
}

scrapper(
  'https://www.newegg.com/p/pl?N=100006616&cm_sp=shop-all-products-_-tab-_-Gaming-VR-bottom'
)
