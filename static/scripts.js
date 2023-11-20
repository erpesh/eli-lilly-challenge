const canvas = document.getElementById('chart')
const ctx = canvas.getContext('2d')

async function getStockData() {
  try {
    const response = await fetch('/stocks');
    const data = await response.json();

    const stockDetails = await getStockDetails(data.stockSymbols);

    const symbolsDiv = document.getElementById('symbols');
    data.stockSymbols.forEach(item => {
      const button = document.createElement('button');
      button.textContent = item;
      button.onclick = () => drawChart(stockDetails[item]);
      button.disabled = stockDetails[item].length === 0;
      symbolsDiv.appendChild(button);
    })
  }
  catch (error) {
    console.error('Error fetching stock symbols:', error);
    const errorDiv = document.createElement('div');
    errorDiv.innerText = 'Error fetching stock symbols';
    errorDiv.style.color = 'red';
    errorDiv.style.fontSize = '28px';
    document.body.appendChild(errorDiv);
  }
  finally {
    // Remove loading spinner
    const spinner = document.getElementById('spinner');
    spinner.remove();
  }
}

// Fetch data on page load
window.onload = getStockData;

async function getStockDetails(stockSymbols) {
  // Fetch all symbols using Promise.all
  const promise = Promise.all(
      stockSymbols.map(symbol => {
        return fetch(`/stocks/${symbol}`)
            .then(res => res.json())
      })
  )

  const data = await promise;

  // Format data into an object of type Record<string, array>
  let result = {}
  for (let i = 0; i < stockSymbols.length; i++) {
    result[stockSymbols[i]] = data[i];
  }
  console.log(result);

  return result;
}

// Scales value from stock values range to Y axis range
function scaleValue(value, oldMin, oldMax, newMin, newMax) {
  return newMax - ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin);
}

// Draws base of the chart
function drawBase() {
  // Clears chart before drawing axes
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawLine([50, 50], [50, 550])
  drawTriangle([35, 50], [65, 50], [50, 35])

  drawLine([50, 550], [950, 550])
  drawTriangle([950, 535], [950, 565], [965, 550])
}

function drawChart(stockDetails) {
  // const sortedStockDetails = stockDetails.sort((a, b) => a.timestamp - b.timestamp)

  drawBase();

  const minStockValue = Math.min(...stockDetails.map(item => item.value));
  const maxStockValue = Math.max(...stockDetails.map(item => item.value));

  const minY = 100;
  const maxY = 500;

  const minX  = 100;
  const maxX = 900;

  const stepX = (maxX - minX) / stockDetails.length;

  let x = minX;

  for (let i = 0; i < stockDetails.length - 1; i++) {
    const dateTime = new Date(stockDetails[i].timestamp);
    const formattedTime = `${dateTime.getHours()}:${dateTime.getMinutes()}`;

    const startValue = stockDetails[i].value;
    const endValue = stockDetails[i + 1].value;

    const startX = x;
    const endX = startX + stepX;

    const startY = scaleValue(startValue, minStockValue, maxStockValue, minY, maxY);
    const endY = scaleValue(endValue, minStockValue, maxStockValue, minY, maxY);

    console.log(startX, endX, startY, endY)

    drawLine([startX, startY], [endX, endY], 'blue');

    // Add labels for the X and Y axes
    ctx.fillStyle = 'black';
    ctx.fillText(formattedTime, startX, maxY + 20); // X axis label
    ctx.fillText(startValue.toFixed(2), minX - 40, startY); // Y axis label
    x += stepX;
  }
}

function drawLine (start, end, style) {
  ctx.beginPath()
  ctx.strokeStyle = style || 'black'
  ctx.moveTo(...start)
  ctx.lineTo(...end)
  ctx.stroke()
}

function drawTriangle (apex1, apex2, apex3) {
  ctx.beginPath()
  ctx.moveTo(...apex1)
  ctx.lineTo(...apex2)
  ctx.lineTo(...apex3)
  ctx.fill()
}
