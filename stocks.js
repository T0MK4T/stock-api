const stockKey ='SRCQ8KMX4C613TRO';
const newsKey = '72f9d35e3fde4f82b0de3f8e0996280a';
const newsURL = 'https://newsapi.org/v2/top-headlines';
const symbolURL = 'https://api.iextrading.com/1.0/ref-data/symbols';
const stockURL = 'https://www.alphavantage.co/query';
const wikiURL = 'https://en.wikipedia.org/w/api.php';
const stockDay = {json: 'Time Series (Daily)', path: 'TIME_SERIES_DAILY'};
const symList = new Object;
let initData = [{"date":["2018-04-01","2018-05-01","2018-06-01","2018-07-01","2018-08-01"],"data":[123,145,134,167,189]},{"date":["2018-04-01","2018-05-01","2018-06-01","2018-07-01","2018-08-01"],"data":[134,146,161,164,175]},{"date":["2018-04-01","2018-05-01","2018-06-01","2018-07-01","2018-08-01"],"data":[134,23,156,89,75]},{"date":["2018-04-01","2018-05-01","2018-06-01","2018-07-01","2018-08-01"],"data":[134,123,101,84,55]}];
let stockChart;
let loopGraph;
let i=1;
let graphLabels;
let graphData;

function renderError(strAPI,element){
    let html = `
            <h1 class="company-name">We seem to be having some technical difficulties</h1>
            <p class="card-style">The ${strAPI} appears to be down or not functioning</p>
        `;
    $(element).html(html);
}
function renderNoResult(sym){
 let html = `
            <div class="price-header">
                    <span class="current-symbol col-12 centered">No results found for "${sym}", please try a different symbol</span>
                </div>
                `;
    $('.price-text').html(html);
}
function renderWiki(data){
	let html;

    if(!data.extract || data.extract.length<100){
        html = "<h1>No Wiki Information found</h1>";
    }else{
        if(data.thumbnail === undefined || data.thumbnail === null){
            html = `
			    <h1 class="company-name">About ${data.title}</h1>
                   <a target="_blank" href = ${data.url}>
                        <div class="wiki-article card-style">
                            <p class="company-about">
                                ${data.extract}
                            </p>
                        </div>
                    </a>
	        `;
        }else {
            html = `
			    <h1 class="company-name">About ${data.title}</h1>
                    <a target="_blank" href = ${data.url}>
                        <div class="wiki-article card-style">
                            <img class = "company-img" src=${data.thumbnail.source} alt=${data.title}/>
                            <p class="company-about">
                                ${data.extract}
                            </p>
                        </div>
                    </a>
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
                    <span class="current-price col-6">$${todayData.close}</span>
                </div>
                <div class="price-details">
                    <table>
                        <tr>
                            <th>High: </th>
                            <td>$${todayData.high}</td>
                        </tr>
                        <tr>
                            <th>Low: </th>
                            <td>$${todayData.low}</td>
                        </tr>
                    </table>
                    <table>
                        <tr>
                            <th>52 Wk High: </th>
                            <td>$${todayData.thigh}</td>
                        </tr>
                        <tr>
                            <th>52 Wk Low: </th>
                            <td>$${todayData.tlow}</td>
                        </tr>
                    </table>
                </div>
	`;
	$('.price-text').html(html);
}

function getStock(q){
	let query = {
		symbol: q,
		function: stockDay.path,
		outputsize: 'full',
		apikey: stockKey
	};
	$.getJSON(stockURL,query,function(data) {
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
        graphLabels ={'1W': [], '1M': [], '3M': [], '1Y': [], '5Y': []};
        graphData ={'1W': [], '1M': [], '3M': [], '1Y': [], '5Y': []};
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
        $(".time-button:contains('1M')").addClass('graph-select');
        $(".graph").addClass('load');
    })
    .fail(function() { renderError('Stock API','.price-text'); hideGraph();});
}

function getNews(q){
	let query = {
		apiKey: newsKey,
		country: 'us',
        q: q
	};
	$.getJSON(newsURL,query,function(data){
	    renderNews(data);
	})
    .fail(function() { renderError('News API','.company-news');});
}

function getWiki(q){
	let query = {
		origin: '*',
		action: 'query',
		format: 'json',
		prop: 'extracts|pageimages',
		indexpageids: 1,
		redirects: 1,
		exchars: 400,
		// explaintext: 1,
		exsectionformat: 'plain',
		piprop: 'name|thumbnail|original',
		pithumbsize: 250,
		titles: q

	}
	$.getJSON(wikiURL,query,function(data){
		let wikiObj = data.query.pages[data.query.pageids[0]];
		wikiObj['url'] = "https://en.wikipedia.org/wiki/" + wikiObj.title;
		renderWiki(wikiObj);
	})
    .fail(function() { renderError('Wiki API','.company-wiki'); });
}

function handleSearch(){
	$('.search-form').on('submit',(function(event){
		event.preventDefault();
		clearInterval(loopGraph); //stop the looping of initial data
		let query = $('.search-bar').val();
		let userSearch = matchSymbol(query);
        $('.search-bar').val("");
        if(userSearch.symbol!=-1) {
            getStock(userSearch.symbol);
            getNews(userSearch.name);
            getWiki(userSearch.name);
        }else{
            renderNoResult(query);
        }
	}))
}

function handleGraph(){
    $('.time-button').on('click',function(event){
        $('.time-button').removeClass('graph-select');
        let timeScale = $(this).text();
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
	}else{
	    returnObj['symbol'] = -1;
    }
	return returnObj;
}

function getSymbols(lis){
	$.getJSON(symbolURL,{},function(data){
		data.forEach(function(ele){
			lis[ele.symbol] = ele.name;
		});
	})
    .fail(function() { renderError('Stock API','.price-text'); hideGraph();});
}

function hideGraph(){
    $(".graph").removeClass('load');
}

function renderGraph(chart, label, data) {
    chart.data.labels = label;
    chart.data.datasets.forEach((dataset) => {
    	dataset.data = data;
    });
    chart.update();

}

function initGraph(){

    stockChart = new Chart(
			$(".chart-js"),
			{"type":"line",
				"data":{"labels":initData[0].date, //array of labels
					"datasets":[
						{"label":"Symbol",
							"data":initData[0].data, //array of data
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
			            yAxes:[{
			               ticks:{
			                   fontColor:"white"
                           }
                        }],
						xAxes:[{
						    type: 'time',
                            distribution: 'series',
                            bounds: 'data',
							ticks: {
						        fontColor:"white",
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
    loopGraph = setInterval(introGraph,6000);
}
function introGraph(){
    renderGraph(stockChart,initData[i].date,initData[i].data);
        i++;
        if(i>=initData.length){
            i=0;
        }
}

function handlePage(){
	getSymbols(symList); //pull array of symbols and company names
	splashIntro();
	handleGraph();
	handleSearch();
}
$(handlePage);
