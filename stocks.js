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
//let initData = {"AMZN":[],"APPL":[],"GOOG":[],"MSFT":[],"NFLX":[],"TSLA":[]}
let initData = {"AMZN":[]};
let stockChart;
let graphLabels ={'1W': [], '1M': [], '3M': [], '1Y': [], '5Y': []};
let graphData ={'1W': [], '1M': [], '3M': [], '1Y': [], '5Y': []};


function renderWiki(data){
	let html;

	console.log(data);
    if(!data.extract || data.extract.length<100){
        html = "<h1>No Wiki Information found</h1>";
    }else{
        if(data.thumbnail === undefined || data.thumbnail === null){
            html = `
			    <h1 class="company-name">About ${data.title}</h1>
                    <div class="wiki-article card-style">
                        <p class="company-about">
                            ${data.extract}
                        </p>
                    </div>
	        `;
        }else {
            html = `
			    <h1 class="company-name">About ${data.title}</h1>
                    <div class="wiki-article card-style">
                        <img class = "company-img" src=${data.thumbnail.source} alt=${data.title}/>
                        <p class="company-about">
                            ${data.extract}
                        </p>
                    </div>
	        `;
        }
    }

	$('.company-wiki').html(html);
}

function renderNews(data){
	let html;

	if(data.totalResults>0){
	   let articles = data.articles;
	   html = "<h1>Recent News</h1>";
	   articles.forEach(function(ele){
	      html += `
                    <a class="news-article card-style" href = ${ele.url}>
                        <div class="article-about">
                            <h2 class="article-title">${ele.title}</h2>
                            <ul>
                                <li>${ele.source.name}</li>
                                <li>${ele.publishedAt}</li>
                            </ul>
                        </div>
                    </a> 
                    `;
       });
    }else{
        html = `
	        <h1 class="center"> No Recent Articles Found</h1>
	  `;
    }
	$('.company-news').html(html);
}

function renderTable(sym,todayData){
	let html = `
            <div class="price-header">
                    <span class="current-symbol col-6">${sym}</span>
                    <span class="current-price col-6">${todayData.close}</span>
                </div>
                <div class="price-details">
                    <table>
                        <tr>
                            <td>High: </td>
                            <td>${todayData.high}</td>
                        </tr>
                        <tr>
                            <td>Low: </td>
                            <td>${todayData.low}</td>
                        </tr>
                    </table>
                    <table>
                        <tr>
                            <td>52 Wk High: </td>
                            <td>${todayData.thigh}</td>
                        </tr>
                        <tr>
                            <td>52 Wk Low: </td>
                            <td>${todayData.tlow}</td>
                        </tr>
                    </table>
                </div>
	`;
	$('.price-text').html(html);
}

function getStock2(q,callback){
	let query = {
		symbol: q,
		function: stockDay.path,
		outputsize: 'full',
		apikey: stockKey
	};
	$.getJSON(stockURL,query,callback);
}

function manData(data) {
    console.log(data);
    let fullData = data[stockDay.json];
    let arrayData = [];

    //put results into an array of objects
    Object.keys(fullData).map(function (key) {
        let obj = new Object;
        obj = fixKeys(fullData[key]);
        obj['date'] = key;
        arrayData.push(obj);
    });
    return ["testing",arrayData];
}
function getStock(q){
	let query = {
		symbol: q,
		function: stockDay.path,
		outputsize: 'full',
		apikey: stockKey
	};
	$.getJSON(stockURL,query,function(data) {
        console.log(data);
        let fullData = data[stockDay.json];
        let arrayData = [];

        //put results into an array of objects
        Object.keys(fullData).map(function (key) {
            let obj = new Object;
            obj = fixKeys(fullData[key]);
            obj['date'] = key;
            arrayData.push(obj);
        });
        let todayData = arrayData[0];

        for(let i=0;i<arrayData.length;i++){
            if(moment(arrayData[i].date).isAfter(moment().subtract(1,'week').format("YYYY-MM-DD"))){
                graphLabels['1W'].unshift(arrayData[i].date);
                graphData['1W'].unshift(arrayData[i].close);
           }
            if(moment(arrayData[i].date).isAfter(moment().subtract(1,'months').format("YYYY-MM-DD"))){
                graphLabels['1M'].unshift(arrayData[i].date);
                graphData['1M'].unshift(arrayData[i].close);
           }
           if(moment(arrayData[i].date).isAfter(moment().subtract(3,'months').format("YYYY-MM-DD"))){
                graphLabels['3M'].unshift(arrayData[i].date);
                graphData['3M'].unshift(arrayData[i].close);
           }
            if(moment(arrayData[i].date).isAfter(moment().subtract(1,'years').format("YYYY-MM-DD"))){
                graphLabels['1Y'].unshift(arrayData[i].date);
                graphData['1Y'].unshift(arrayData[i].close);
           }
            if(moment(arrayData[i].date).isAfter(moment().subtract(5,'years').format("YYYY-MM-DD"))){
                graphLabels['5Y'].unshift(arrayData[i].date);
                graphData['5Y'].unshift(arrayData[i].close);
           }
        }

        //get 52 week high and lows
        let arrayLow = [];
        let arrayHigh = [];
        let arrayVol = 0;
        for (let i = 0; i < 365 && i < arrayData.length; i++) {
            arrayLow.push(parseInt(arrayData[i].low));
            arrayHigh.push(parseInt(arrayData[i].high));
            arrayVol += parseInt(arrayData[i].volume);
        }
        todayData['tlow'] = Math.min.apply(null, arrayLow);
        todayData['thigh'] = Math.max.apply(null, arrayLow);
        todayData['tVol'] = arrayVol / arrayData.length;
        renderTable(q, todayData);
        renderGraph(stockChart,graphLabels['1M'],graphData['1M']);
    });
}

function getNews(q){
	let query = {
		apiKey: newsKey,
		country: 'us',
        q: q
	};
	$.getJSON(newsURL,query,function(data){
	    console.log(data);
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
		exchars: 800,
		// explaintext: 1,
		exsectionformat: 'plain',
		piprop: 'name|thumbnail|original',
		pithumbsize: 250,
		titles: q

	}
	$.getJSON(wikiURL,query,function(data){
		console.log(data);
		let wikiObj = data.query.pages[data.query.pageids[0]];
		wikiObj['url'] = "https://en.wikipedia.org/wiki/" + wikiObj.title;
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

function handleGraph(){
    $('.time-button').on('click',function(event){
        $('.time-button').removeClass('graph-select');
        let timeScale = $(this).text();
        console.log(timeScale);
        $(this).addClass('graph-select');

        renderGraph(stockChart,graphLabels[timeScale],graphData[timeScale]);
    });
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
    //chart.update({easing: 'easeOutBounce'});
    chart.update();
}

function initGraph(){

    stockChart = new Chart(
			$(".chart-js"),
			{"type":"line",
				"data":{"labels":["2018-04-01","2018-05-01","2018-06-01","2018-07-01","2018-08-01"], //array of labels
					"datasets":[
						{"label":"Symbol",
							"data":[123,145,134,167,189], //array of data
							"fill":false,
							"borderColor":"rgb(255, 255, 255)",
							"lineTension":0.1}
							]},
				"options":{
			        elements:{
			          point:{
			              radius: 0
                      }
                    },
					legend:{
						display: false
					},
					scales:{
						xAxes:[{
						    type: 'time',
                            distribution: 'series',
                            bounds: 'data',
							ticks: {
                                source: 'data',
						        display: true //set to false to remove x axis labels
                            }
						}]
					}}
			});
}

function splashIntro(){
    $(".price-text").addClass('load');
    initGraph();
    $(".graph").addClass('load');
    $(".company-info").addClass('load');
}

function handlePage(){
	getSymbols(symList); //pull array of symbols and company names
	splashIntro();
	handleGraph();
	handleSearch();
}
$(handlePage);
