$(function(){
  
  var socket = io('/treasure');
  
  socket.on('attBTC', function(data){
		if($("#brl").text() != data.brl){
			$("#brl").css('display', 'none').text(data.brl).fadeIn(130);
			$("#usd").css('display', 'none').text(data.usd).fadeIn(130);
		}
	});
  
  socket.on('chart', function(data){
    var chart = c3.generate({
			bindto: '#chart',
			data: {json: data.chart, keys: {x: 'x', value: ['y']}},
			axis: {
				x: {
					type: 'timeseries',
					tick: {format: function (x) { 
            return 1+(new Date(x*1000)).getMonth()+"/"+(new Date(x*1000)).getFullYear(); 
          }, count: 15}
				}
			},
			color: {pattern: ['#00FF00']},
			zoom:{enabled: true},
			legend:{show:false},
			point:{	r:0.5	},
			tooltip:{
				format:{
					name: function (name, ratio, id, index){return '';},
					title: function (d) { return (new Date(d*1000)).getDate()+"/"+
            (1+(new Date(d*1000)).getMonth())+"/"+(new Date(d*1000)).getFullYear(); },
					value: d3.format('$.2f')
				}
			}
		});
  });
  
});