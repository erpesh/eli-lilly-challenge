const express = require('express')
const path = require('path')
const stocks = require('./stocks')

const app = express()
app.use(express.static(path.join(__dirname, 'static')))

app.get('/stocks', async (req, res) => {
  try {
    const stockSymbols = await stocks.getStocks()
    res.send({ stockSymbols })
  }
  catch (error) {
    console.error('Error fetching stock symbols: ', error.message);
    res.status(500).send({ error: error.message });
  }
})

app.get('/stocks/:symbol', async (req, res) => {
  try {
    const { params: { symbol } } = req
    const data = await stocks.getStockPoints(symbol, new Date())
    res.send(data)
  }
  catch (error) {
    console.error('Error while fetching stock points: ', error.message);

    // Ideally status code should be 404 when the symbol is not found but as I can't change stock.js
    // there's no proper way of doing it because error type is the same for both errors.
    res.status(500).send([])
  }
})

app.listen(3000, () => console.log('Server is running!'))
