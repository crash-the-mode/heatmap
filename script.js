async function drawHeatMap() {

	// 1. Access data
	
	const dataset = await d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json");
//	console.log(dataset);

	const mVar = dataset.monthlyVariance;
//	console.log(mVar);
	
	const baseTemp = dataset.baseTemperature;
	const xAccessor = d => d.year;
//	console.log(xAccessor(mVar[0]), typeof xAccessor(mVar[0]));
	
	const yAccessor = d => d.month;
//	console.log(yAccessor(mVar[200]), typeof yAccessor(mVar[200]));
	
	const varAccessor = d => d.variance;
	const tempAccessor = d => d.temperature;

	const monthFormater = d3.timeFormat("%B");
	const monthParser = d3.timeParse("%m");

	// 2. Create dimensions
	
	const width = 1600;
	const height = 900;

	let dimensions = {
		width: width,
		height: height,
		margin: {
			top: 100,
			bottom: 50,
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
//	console.log(xdomain);
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
		ydomain.push(i - 1);
	}
	
	const yScale = d3.scaleBand()
		.domain([...ydomain])
		.range([0, dimensions.boundedHeight])
		.paddingInner(0);

//	console.log(d3.extent(mVar, varAccessor));
	const colorScale = d3.scaleThreshold()
		.domain([-6.0, -4.8, -3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6, 4.8])
		.range(["#08519c", "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#eff3ff", "#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"]);
	// 5. Draw data
	
	for( let i = 0; i < mVar.length; i++ )
	{
		mVar[i].temperature = Number((baseTemp + varAccessor(mVar[i])).toFixed(3));
	}
	
	const barWidth = dimensions.boundedWidth / xdomain.length;
	const barHeight = dimensions.boundedHeight / ydomain.length;
	graph.selectAll("rect")
		.data(mVar)
		.enter()
		.append("rect")
		.attr("x", d => xScale(xAccessor(d)))
		.attr("y", d => yScale(yAccessor(d) - 1))
		.attr("height", barHeight)
		.attr("width", barWidth)
		.attr("fill", d => colorScale(varAccessor(d)))
		.attr("class", "cell")
		.attr("data-year", d => xAccessor(d))
//		.attr("data-month", d => monthFormater(monthParser(yAccessor(d))))
		.attr("data-month", d => yAccessor(d) - 1)
		.attr("data-temp", d => tempAccessor(d));

	// 6. Draw peripherals
	
	const xticks = [];
	const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	for( let i = 0; i < xdomain.length; i++ )
	{
		if(xdomain[i] % 10 == 0)
			xticks.push(xdomain[i]);
	}
	const xAxisGenerator = d3.axisBottom()
		.scale(xScale)
		.tickSize(10)
		.tickValues([...xticks]);

	const xAxis = graph.append("g")
		.attr("id", "x-axis")
		.call(xAxisGenerator)
		.style("transform", `translateY(${dimensions.boundedHeight}px)`);

	const xAxisLabel = xAxis.append("text")
		.attr("x", dimensions.boundedWidth / 2)
		.attr("y", dimensions.margin.bottom)
		.attr("fill", "black")
		.text("Year")
		.style("font-size", "1.75em")

	const yAxisGenerator = d3.axisLeft()
		.scale(yScale)
		.tickFormat(i => months[i])
		.tickSize(10);

	const yAxis = graph.append("g")
		.attr("id", "y-axis")
		.call(yAxisGenerator);

	const yAxisLabel = yAxis.append("text")
		.attr("x", -dimensions.boundedHeight / 2)
		.attr("y", -dimensions.margin.left + 40)
		.attr("fill", "black")
		.text("Months")
		.style("transform", "rotate(-90deg)")
		.style("text-anchor", "middle")
		.style("font-size", "1.75em");

	const legendWidth = 330;
	const legendBox = legendWidth / colorScale.range().length;
	
	const legendGroup = canvas.append("g")
		.style("transform", `translate(100px, ${legendBox / 2}px)`)
		.attr("id", "legend");

	const legendScale = d3.scaleLinear()
		.domain([1, colorScale.range().length - 1])
		.rangeRound([legendBox, legendWidth - legendBox]);

	legendGroup.selectAll("rect")
		.data(colorScale.range())
		.enter()
		.append("rect")
		.attr("height", legendBox)
		.attr("x", (d, i) => legendScale(i))
		.attr("width", legendBox)
		.attr("fill", d => d);

	const legendAxisGen = d3.axisBottom()
		.scale(legendScale)
		.tickValues(d3.range(1, colorScale.range().length))
		.tickFormat(i => colorScale.domain()[i - 1])
		.tickSize(13);

	const legendAxis = legendGroup.append("g")
		.call(legendAxisGen)
		.style("transform", `translateY(${legendBox - 1}px)`);

	const title = canvas.append("text")
		.attr("x", dimensions.width / 2)
		.attr("y", 40)
		.style("text-anchor", "middle")
		.text("Monthly Global Land-Surface Temperature Deviation")
		.style("font-size", "2em")
		.attr("id", "title");

	const desc = canvas.append("text")
		.attr("x", dimensions.width / 2)
		.attr("y", 65)
		.style("text-anchor", "middle")
		.html("1753-2015: base temperature 8.66&deg;C")
		.style("font-size", "1.5em")
		.attr("id", "description");

	// 7. Set up interactions
	graph.selectAll("rect")
		.on("mouseenter", onMouseEnter)
		.on("mouseleave", onMouseLeave);

	const tooltip = d3.select("#tooltip");
	function onMouseEnter(e, datum) {
//		console.log(e);
//		console.log(datum);
		const x = xScale(xAccessor(datum)) + dimensions.margin.left;
		const y = yScale(yAccessor(datum) - 1) + dimensions.margin.top;
		tooltip.style("opacity", 1);
		tooltip.select("#year-month")
			.text(`${xAccessor(datum)} - ${monthFormater(monthParser(yAccessor(datum)))}`);
		tooltip.select("#temp")
			.html(`${d3.format(".1f")(tempAccessor(datum))}&deg;C`);
		tooltip.select("#variance")
			.html(`${d3.format(".1f")(varAccessor(datum))}&deg;C`);
		tooltip.style("transform", `translate(calc(-50% + ${x}px), calc(-100% + ${y}px))`);
		tooltip.attr("data-year", xAccessor(datum));
	}
	function onMouseLeave(e, datum) {
		tooltip.style("opacity", 0)
	}

}

drawHeatMap();
