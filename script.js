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
	
	// 2. Create dimensions
	
	const width = 1200;
	const height = 900;

	let dimensions = {
		width: width,
		height: height,
		margin: {
			top: 100,
			bottom: 100,
			left: 50,
			right: 25,
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
		.range([0, dimensions.boundedWidth]);

	const yScale = d3.scaleBand()
		.domain

	// 5. Draw data
	
	graph.selectAll("rect")
		.data(mVar)
		.enter()
		.append("rect")
		.attr("x", d => xScale(xAccessor(d)))
}

drawHeatMap();
