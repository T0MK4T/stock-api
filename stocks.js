const apikey ='SRCQ8KMX4C613TRO';
const url = 'https://alphavantage.co/query?function=TIME_SERIES&symbol=MSFT&apikey=' + apikey;

$.getJSON(url,{},function(data){
    console.log(data);
    debugger;
});