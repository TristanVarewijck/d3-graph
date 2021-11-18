// With the help of: https://www.udemy.com/course/masteringd3js/learn/lecture/9441246?start=75#content

// default margins 
const margin = {
    left: 150,
    top: 10,
    right: 10,
    bottom: 250
}

//  default sizes
const width = 600;
const height = 400;

// options to select from deciding wich data to show
const select = document.getElementById('filter');
let optionValue = !select.options[select.selectedIndex].value;

// append a svg in the chart area container and the preffered size
const svg = d3.select('#chart-area').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', width + margin.top + margin.bottom)


// append a g item, the svg works as a container for multiple svg items
const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

// define settings for the xAxis, use d3.scaleBand for barcharts because you use text values
const x = d3.scaleBand()
    .range([0, width])
    .paddingOuter(0.3)
    .paddingInner(0.2);

// define settings for the yAxis, use d3.scaleLinear for linear numeric values
const y = d3.scaleLinear() // * 
    .range([height, 0]);


// default xAxis container
const xAxisGroup = g.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height})`)
    .attr('color', '#8395a7')

// define the bottom label
g.append('text')
    .attr('class', 'label x axis')
    .attr('transform', `translate(${width}, ${height + 125})`)
    .attr('text-anchor', 'end')
    .attr('font-size', '20px')
    // .attr('font-family', 'sans-serif')
    .text("Bluezilla Projects")

// default yAxis container
const yAxisGroup = g.append('g')
    .attr('class', 'y axis')
    .attr('color', '#8395a7')

// define the left yAxis label 
const yLabel = g.append('text')
    .attr('class', 'label y axis')
    .attr('transform', `translate(${-125}, ${(height) + margin.top}) rotate(-90)`)
    .attr('text-anchor', 'center')
    .attr('font-size', '20px')
    // .attr('font-family', 'sans-serif')
    .text("Revenue (€)")

// make the tooltip wich is suppose to show data when hovering over the bars 
const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'd3-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('padding', '10px')
    .style('background', 'rgba(50, 52, 66, .6)')
    .style('border-radius', '4px')
    .style('color', '#fff')
const staticColor = '#1888FB';
const hoverColor = '#89C2FA';


// Get the data
d3.json('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethpad%2C%20velas%2C%20adapad%2C%20gamezone%2C%20pulsepad%2C%20tronpad%2C%20nftlaunch%2C%20kccpad%2C%20bscpad&order=market_cap_desc%2C%20volume_desc&sparkline=false&price_change_percentage=1h').then(data => {

    // Interval to update the data each .5 seconcs 
    d3.interval(() => {
            select.onchange = function () {
                optionValue = !optionValue // swich between the option in the filter
            }
            update(data)
        },
        500)

    update(data)
})

// update function contains all elements/pieces that should be updated 
function update(data) {
    const t = d3.transition().duration(500).ease(d3.easeLinear); // set a basic transition
    const value = optionValue ? 'market_cap' : 'total_volume' // else if - for showing the value of true or false
    x.domain(data.map(d => d.id)) // The xAxis should go from the first id name till the last
    y.domain([0, d3.max(data, d => d[value])]) // The yAxis should go form 0 till the max value in the dataset


    // the Axis call where the xAxisgroup, scale, and transition are being called
    const xAxisCall = d3.axisBottom(x)
    xAxisGroup.transition(t).call(xAxisCall)

    // the Axis call where the yAxisgroup, scale, and transition are being called
    const yAxisCall = d3.axisLeft(y)
        .ticks(10)
        .tickSize(-width)
        .tickFormat(d => '€' +
            d + ',-')
    yAxisGroup.transition(t).call(yAxisCall)

    // ticks that show as lines from each value point
    d3.selectAll('g.tick')

        .select('line') //grab the tick line
        .style('stroke-width', 1)
        .style("stroke-dasharray", ("3, 3"))

    //  JOIN new data with old / standard elements
    const rectangles = g.selectAll('rect')
        .data(data);

    //  EXIT old elements not present in new data
    rectangles.exit().remove()

    //  ENTER new elements present in new data
    rectangles.enter().append('rect')
        .attr('y', (d, i) => y(0))
        .attr("height", 0)
        .attr('fill', staticColor)
        .on('mouseover', function (d, i) { // tooltip on mousover with additional data attacheted in the update function
            tooltip
                .html(
                    `<div>Month: ${d.id}</div><div>Market Cap: ${d.market_cap}</div><div>Total Volume: ${d.total_volume}</div>`
                )
                .style('visibility', 'visible');
            d3.select(this).transition().attr('fill', hoverColor);
        })

        .on('mousemove', function () {
            tooltip
                .style('top', d3.event.pageY - 10 + 'px')
                .style('left', d3.event.pageX + 10 + 'px');
        })
        .on('mouseout', function () {
            tooltip.html(``).style('visibility', 'hidden');
            d3.select(this).transition().attr('fill', staticColor);
        })
        //  UPDATE old elements present in new data 
        .merge(rectangles) // old elements that get updated with a transition
        .transition(t)
        .attr('rx', 2)
        .attr('x', (d, i) => x(d.id))
        .attr('y', (d, i) => y(d[value]))
        .attr('width', x.bandwidth)
        .attr("height", d => height - y(d[value]))

    rectangles.enter().append('image') // image for each value on the xAxis
        .attr('xlink:href', (d, i) => d.image)
        .attr("width", x.bandwidth())
        .attr('x', (d, i) => x(d.id))
        .attr('y', height + margin.top + 20)

        .attr("preserveAspectRatio", "none");

    const text = optionValue ? "marketCap ($)" : "volume ($)"
    yLabel.text(text)

}