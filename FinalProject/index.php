<!DOCTYPE html>
<html lang="en">

<head>
  <title>Syed's Charts</title>
  <meta charset="utf-8" />
  <meta name="description" content="Data Visualisation">
  <meta name="Syed Saqib Ahmed" content="HTML CSS, D3.JS">
  <script src="https://d3js.org/d3.v7.min.js"> </script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3-tip/0.9.1/d3-tip.min.js"></script>
  <script src="importData.js"> </script>
  <script src="manipulateGraphs.js"> </script>
  <link rel="stylesheet" href="barchart.css">
</head>

<body>
  <header>
    <h1 class="header">Emigration of Each Country</h1>
  </header>

  <div id="chart"></div>

  <select id="country-select">
  </select>

  <button id="switch-temp-dis">Show Disaster Chart</button>
</body>

</html>