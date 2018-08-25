const stockKey ='SRCQ8KMX4C613TRO';
const newsKey = '72f9d35e3fde4f82b0de3f8e0996280a';
const newsURL = 'https://newsapi.org/v2/top-headlines';
const symbolURL = 'https://api.iextrading.com/1.0/ref-data/symbols';
const stockURL = 'https://www.alphavantage.co/query';
const wikiURL = 'https://en.wikipedia.org/w/api.php';
const stockDay = {json: 'Time Series (Daily)', path: 'TIME_SERIES_DAILY'};
const stockWeek = {json:'Weekly Time Series',path: 'TIME_SERIES_WEEKLY'};
const stockMonth = {json: 'Monthly Time Series',path:'TIME_SERIES_MONTHLY'};
const symList = new Object;
let initData = [123,34,45,45,46,56,57,5,45,356,45,6,67,56];
let myChart;

function getToday(){
	let date = new Date();
	let dd = date.getDate();
	let mm = date.getMonth()+1;
	let yyyy = date.getFullYear();

	if(dd<10){
		dd = '0'+dd;
	}
	if(mm<10){
		mm = '0'+mm;
	}
	let today = `${yyyy}-${mm}-${dd}`
	return today;
}

function renderWiki(data){
	let html = `
			<img class = "company-img" src=${data.thumbnail.source} alt="company pic?"/>
                <p class="company-about">
					${data.extract}
                </p>
	`;
	$('.company-about').html(html);
}

function renderNews(data){
	let html = `
		${data.articles};
	`;
	$('.company-news').html(html);
}

function renderTable(sym,todayData){
	let html = `
				<h1 class='current-symbol'>${sym}</h1>
                <h2 class="current-price">${todayData.close}</h2>
                <h2>${todayData.tlow}</h2>
                <p>52 Week Low</p>
                <h2>${todayData.thigh}</h2>
                </p>52 Week High</p>
	`
	$('.price-text').html(html);
}

function getStock(q){
	let query = {
		symbol: q,
		function: stockWeek.path,
		outputsize: 'full',
		apikey: stockKey
	};
	$.getJSON(stockURL,query,function(data){
		console.log(data);
		let fullData = data[stockWeek.json];
		let arrayData = [];

		Object.keys(fullData).map(function(key){
			let obj = new Object;
			obj = fixKeys(fullData[key]);
			obj['date'] = key;
			arrayData.push(obj);
		});
		let todayData = arrayData[0];

		//get 52 week high and lows
		let arrayLow = [];
		let arrayHigh = [];
		let arrayVol = 0;
		for (let i=0;i<52 && i<arrayData.length;i++){
			arrayLow.push(parseInt(arrayData[i].low));
			arrayHigh.push(parseInt(arrayData[i].high));
			arrayVol += parseInt(arrayData[i].volume);
		}
		todayData['tlow'] = Math.min.apply(null,arrayLow);
		todayData['thigh'] = Math.max.apply(null,arrayLow);
		todayData['tVol'] = arrayVol/arrayData.length;

		console.log(arrayData);
		let graphLabels = ["one","two","three"];
		let graphData = [1,2,3];
		renderTable(q,todayData);
		renderGraph(myChart,graphLabels,graphData);
	});
}

function getNews(q){
	let query = {
		apiKey: newsKey,
		country: 'us',
		category: 'technology'
	};

	if(q in symList) {
        query['q'] = symList[q].split(' ')[0];
    }
	else{
		query['q'] = q
	}
	query['q'] = 'google';
	$.getJSON(newsURL,query,function(data){
		renderNews(data);

	});
}

function getWiki(q){
	let query = {
		origin: '*',
		action: 'query',
		format: 'json',
		prop: 'extracts|pageimages',
		indexpageids: 1,
		redirects: 1,
		exchars: 1200,
		// explaintext: 1,
		exsectionformat: 'plain',
		piprop: 'name|thumbnail|original',
		pithumbsize: 250,
		titles: q

	}
	$.getJSON(wikiURL,query,function(data){
		console.log(data);
		let wikiObj = data.query.pages[data.query.pageids[0]];
		wikiObj['url'] = "https://en.wikipedia.org/wiki/";
		renderWiki(wikiObj);
	});
}

function handleSearch(){
	$('.search-form').on('submit',(function(event){
		event.preventDefault();
		let query = $('.search-bar').val();
		let userSearch = matchSymbol(query);
		getStock(userSearch.symbol);
		getNews(userSearch.name);
		getWiki(userSearch.name);
	}))
}

function handleTime(){
	$('.time-button').on('click',(function(event){
		console.log($(this).text());
	}))
}

function fixKeys(obj){
	Object.keys(obj).forEach(function(key){
		let newName = key.split('.')[1].trim();
		obj[newName] = obj[key];
		delete obj[key];
	});
	return obj;
}

function matchSymbol(query){
	let returnObj = new Object;
	query = query.toUpperCase();
	if(query in symList){
		returnObj['symbol'] = query;
		returnObj['name'] = symList[query];
	}
	return returnObj;
}

function getSymbols(lis){
	$.getJSON(symbolURL,{},function(data){
		data.forEach(function(ele){
			lis[ele.symbol] = ele.name;
		});
	console.log(lis);
	});
}

function renderGraph(chart, label, data) {
    chart.data.labels = label;
    chart.data.datasets.forEach((dataset) => {
    	dataset.data = data;
    });
    chart.update();
}

function graphStock(data){
	myChart = new Chart(
			$(".chart-js"),
			{"type":"line",
				"data":{"labels":["January","February","March","April","May","June","July"],
					"datasets":[
						{"label":"Symbol",
							"data":data,
							"fill":false,
							"borderColor":"rgb(75, 192, 192)",
							"lineTension":0.1}
							]},
				"options":{
					legend:{
						display: false
					},
					scales:{
						xAxes:[{
							ticks: {
                                display: true //set to false to remove x axis labels
                            }
						}]
					}}
			});

	//myChart.data.datasets[0].data[1] = 75;
	//myChart.update({easing: 'easeOutBounce'});
}

function handlePage(){
	getSymbols(symList); //pull array of symbols and company names
	graphStock(initData);
	handleSearch();
	handleTime();
}
$(handlePage);
