async function drawHeatMap() {

	// 1. Access data
	
	const dataset = await d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json");
	console.log(dataset);

	const mVar = dataset.monthlyVariance;
//	console.log(mVar);
	
	const baseTemp = dataset.baseTemperature;
	const xAccessor = d => d.year;
//	console.log(xAccessor(mVar[0]), typeof xAccessor(mVar[0]));
	
	const yAccessor = d => d.month;
//	console.log(yAccessor(mVar[200]), typeof yAccessor(mVar[200]));
	
	const varAccessor = d => d.variance;
	
	// 2. Create dimensions
	
	const width = 1800;
	const height = 900;

	let dimensions = {
		width: width,
		height: height,
		margin: {
			top: 100,
			bottom: 100,
			left: 100,
			right: 10,
		},
	};

	dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
	dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;

	// 3. Draw canvas
	
	const canvas = d3.select("main")
		.append("svg")
		.attr("height", dimensions.height)
		.attr("width", dimensions.width);

	const graph = canvas.append("g")
		.style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`);

	// 4. Create scales
	
	const xmm = d3.extent(mVar, xAccessor)
	const xdomain = [];
	for( let i = xmm[0]; i <= xmm[1]; i++ )
	{
		xdomain.push(i);
	}
	console.log(xdomain);
	const xScale = d3.scaleBand()
		.domain([...xdomain])
		.range([0, dimensions.boundedWidth])
		.paddingInner(0)
		.paddingOuter(0);

	const ymm = d3.extent(mVar, yAccessor);
//	console.log(ymm);
	const ydomain = [];
	for( let i = ymm[0]; i <= ymm[1]; i++ )
	{
		ydomain.push(i);
	}
	
	const yScale = d3.scaleBand()
		.domain([...ydomain])
		.range([0, dimensions.boundedHeight])
		.paddingInner(0);

//	console.log(d3.extent(mVar, varAccessor));
	const colorScale = d3.scaleThreshold()
		.domain([-5.0, -3.0, -1.0, 1.0, 3.0, 5.0])
		.range(["#2166ac", "#67a9cf", "#d1e5f0", "#f7f7f7", "#fddbc7", "#ef8a62", "#b2182b"]);

	// 5. Draw data
	
	const barWidth = dimensions.boundedWidth / xdomain.length;
	const barHeight = dimensions.boundedHeight / ydomain.length;
	graph.selectAll("rect")
		.data(mVar)
		.enter()
		.append("rect")
		.attr("x", d => xScale(xAccessor(d)))
		.attr("y", d => yScale(yAccessor(d)))
		.attr("height", barHeight)
		.attr("width", barWidth)
		.attr("fill", d => colorScale(varAccessor(d)))

	// 6. Draw peripherals
	
	const xticks = [];
	const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	for( let i = 0; i < xdomain.length; i++ )
	{
		if(xdomain[i] % 5 == 0)
			xticks.push(xdomain[i]);
	}
	const xAxisGenerator = d3.axisBottom()
		.scale(xScale)
		.tickSize(10)
		.tickValues([...xticks]);

	const xAxis = graph.append("g")
		.call(xAxisGenerator)
		.style("transform", `translateY(${dimensions.boundedHeight}px)`);

	const xAxisLabel = xAxis.append("text")
		.attr("x", dimensions.boundedWidth / 2)
		.attr("y", dimensions.margin.bottom - 45)
		.attr("fill", "black")
		.text("Year")
		.style("font-size", "1.75em")

	const yAxisGenerator = d3.axisLeft()
		.scale(yScale)
		.tickFormat(i => months[i - 1])
		.tickSize(10);

	const yAxis = graph.append("g")
		.call(yAxisGenerator);

	const yAxisLabel = yAxis.append("text")
		.attr("x", -dimensions.boundedHeight / 2)
		.attr("y", -dimensions.margin.left + 40)
		.attr("fill", "black")
		.text("Months")
		.style("transform", "rotate(-90deg)")
		.style("text-anchor", "middle")
		.style("font-size", "1.75em");

	const legendGroup = canvas.append("g")
		.style("transform", `translate(100px, 10px)`);

	const legendScale = d3.scaleLinear()
		.domain([1, colorScale.range().length - 1])
		.rangeRound([50, 300]);

	legendGroup.selectAll("rect")
		.data(colorScale.range())
		.enter()
		.append("rect")
		.attr("height", 50)
		.attr("x", (d, i) => legendScale(i))
		.attr("width", 50)
		.attr("fill", d => d);

	const legendAxisGen = d3.axisBottom()
		.scale(legendScale)
		.tickValues(d3.range(1, colorScale.range().length))
		.tickFormat(i => colorScale.domain()[i - 1])
		.tickSize(13);

	const legendAxis = legendGroup.append("g")
		.call(legendAxisGen)
		.style("transform", `translateY(50px)`);

	const title = canvas.append("text")
		.attr("x", dimensions.width / 2)
		.attr("y", 40)
		.style("text-anchor", "middle")
		.text("Monthly Global Land-Surface Temperature Deviation")
		.style("font-size", "2em");

	const desc = canvas.append("text")
		.attr("x", dimensions.width / 2)
		.attr("y", 65)
		.style("text-anchor", "middle")
		.html("1753-2015: base temperature 8.66&deg;C")
		.style("font-size", "1.5em")


}

drawHeatMap();
