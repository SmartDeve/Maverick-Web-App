let number = window.sessionStorage.getItem('number');
let is_unauthorized = window.sessionStorage.getItem('UNAUTHORIZED_USER');
if((!(number === null))&& (is_unauthorized === 'true') )
    alert('PLEASE ENTER REGISTERED NUMBER');
else if(!(number === null))   
     window.location.replace("index.html"); 