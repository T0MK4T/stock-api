const stockKey ='SRCQ8KMX4C613TRO';
const newsKey = '72f9d35e3fde4f82b0de3f8e0996280a';
const newsURL = 'https://newsapi.org/v2/top-headlines';
const symbolURL = 'https://api.iextrading.com/1.0/ref-data/symbols';
const stockURL = 'https://www.alphavantage.co/query';
const symList = [];


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
	today = `${yyyy}-${mm}-${dd}`
	return today;
}
function renderDashboard(sym,current,low,high){
	let html = `
				<h1 class='big-symbol col-12'>${sym}</h1>
                <h2>${current}</h2>
                <p>Current Price</p>
                <h2>${low}</h2>
                <p>52 Week Low</p>
                <h2>${high}</h2>
                </p>52 Week High</p>
	`
	$('.big-text').html(html);
}

function getStock(q){
	let query = {
		function: 'TIME_SERIES_WEEKLY',
		symbol: q,
		outputsize: 'compact',
		apikey: stockKey
	};
	$.getJSON(stockURL,query,function(data){
		console.log(data['Weekly Time Series']);
		let todayData = data['Weekly Time Series'][getToday()];
		let close = todayData['4. close'];
		let high = todayData['2. high'];
		let low = todayData['3. low'];

		let data52 = data['Weekly Time Series']
		Object.keys(data52).forEach(function(key){
			//console.log(key);
		});


		renderDashboard(q,close,low,high);
	});
}

function getNews(q){
	let query = {
		q: q,
		apiKey: newsKey
	};

	$.getJSON(newsURL,query,function(data){
		console.log(data);

	});
}

function handleSearch(){
	$('.search-form').on('submit',(function(event){
		event.preventDefault();
		let userSearch = $('.search-bar').val();
		getStock(userSearch);
		getNews(userSearch);
	}))
}

function getSymbols(lis){
	$.getJSON(symbolURL,{},function(data){
		data.forEach(function(ele){
			let obj = new Object;
			obj[ele.symbol] = ele.name;
			lis.push(obj);
		});
	console.log(lis);
	});
}

function handlePage(){
	getSymbols(symList); //pull array of symbols and company names
	handleSearch();
}
$(handlePage);
