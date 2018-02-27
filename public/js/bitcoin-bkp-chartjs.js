$(function(){
  
  var socket = io.connect('https://tuba.work/bitcoin');
  
  
  
  socket.emit('loadChart', {});
  
  socket.on('attBTC', function(data){
		if($("#brl").text() != data.brl){
			$("#brl").css('display', 'none').text(data.brl).fadeIn(130);
			$("#usd").css('display', 'none').text(data.usd).fadeIn(130);
		}
	});
  
  socket.on('chart', function(data){
    
    /*var x = [], y = [];
    $.each(data.chart, function(i, item) {
      x.push(data.chart[i].x);
      y.push(data.chart[i].y);
    });*/
    //console.log(JSON.stringify(data.chart));
    
    //moment("1479600000", "X");
    
    var dt = {
        datasets: [{
          data: data.chart,
					pointRadius: 0,
					pointHoverRadius: 0,
					pointHitRadius: 0,
					borderWidth: 0,
          backgroundColor: 'rgba(0,255,0,0.5)'
        }]
      };
		var opt = {
			legend: {
				display: false
			},
			title: {
				display: true,
				text: "Bitcoin Growing Chart",
				fontColor: 'rgba(0,255,0,0.5)'
			},
			responsive: false,
			scales: {
				xAxes: [{
					gridLines: {
						color: 'rgba(0,255,0,0.1)',
						zeroLineColor: 'rgba(0,255,0,0.01)',
					},
					ticks: {
						fontColor: 'rgba(0,255,0,0.5)'
					},
					type: 'time',
					time: {
						parser: 'X',
						round: 'day',
						unitStepSize: 2,
						displayFormats: {quarter: 'MMM \'YY'}
					}
				}],
				yAxes: [{
					ticks: {
						fontColor: 'rgba(0,255,0,0.5)'
					},
					gridLines: {
						color: 'rgba(0,255,0,0.1)',
						zeroLineColor: 'rgba(0,255,0,0.01)',
					}
				}]
			},
			zoom: {
				enabled: true,
				mode: 'xy',
			}
		};
    
    var ctx = document.getElementById("chart").getContext("2d");
		var myChart = Chart.Line(ctx, {data: dt, options: opt});
		
  });
});