





'use-strict'
const snackbar = new mdc.snackbar.MDCSnackbar(document.querySelector('.mdc-snackbar'));

const snackbar_message = document.getElementById('not_text');
const snackbar_color = document.getElementById('s_color');
const stockData = document.getElementById('stockTable');
const stockTableBody = document.getElementById('stock_table_body');
const demat = document.getElementById('demat');
let phNumber = window.sessionStorage.getItem('number');     
const table = document.getElementById('stocks_table');
const socket = io('https://maverick-server.herokuapp.com');
const buyButton = document.getElementById('buy_button');
const select_buy_company = document.getElementById('stock_buy');
const select_sell_company = document.getElementById('stock_sell');
const n_stock_buy = document.getElementById('buy_numbers');
const n_stock_sell= document.getElementById('sell_numbers');

let teamName;
let isDisconnected = false;
const uid = window.sessionStorage.getItem('uid');
let current_rec;
let current_stock_numbers;
let current_stock_prices;
let current_self_stocks;
let current_self_accounts;
let current_self_profits;
let permissionsGranted = {};
const sellButton = document.getElementById('sell_button');


const amountBox = document.getElementById('currentAmount');

const User = document.getElementById('user');
let isFirstTime = true;






var firebaseConfig = {
    apiKey: "AIzaSyD_818rzmgf-CsoxlnGLjcvifkN2VAznH0",
    authDomain: "maverick-ae0b5.firebaseapp.com",
    databaseURL: "https://maverick-ae0b5-default-rtdb.firebaseio.com",
    projectId: "maverick-ae0b5",
    storageBucket: "maverick-ae0b5.appspot.com",
    messagingSenderId: "926763134889",
    appId: "1:926763134889:web:5f1553ae548a93ebec9eb8",
    measurementId: "G-S81LLWFHBQ"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

let database = firebase.database();
let party = database.ref('Participants');
let market = database.ref('Market');

socket.on("connect",()=>
{

 console.log('connected');



});

let permissions = database.ref('Permissions');

permissions.on('value', async (snapshot) => {
  const data = snapshot.val();
  permissionsGranted.canBuy = data.buy;
  permissionsGranted.canSell = data.sell;
  permissionsGranted.canSee = data.canSee;

  if(permissionsGranted.canSee === false)
    stockData.hidden = true;
  else if(permissionsGranted.canSee === true)
    stockData.hidden = false;

});




let companyName = database.ref('Market/Companies');
companyName.on('value', (snapshot) => {
  const data = snapshot.val();
  let nCompanies =data.split(',').length;
  createtable(nCompanies)
  CreateAccountLayout(nCompanies);
  updateCompanyNames(data);
});


let stocksPrice = database.ref('Market/stocksPrice');
stocksPrice.on('value', (snapshot) => {
  const data = snapshot.val();
  updateStockPrice(data);
});

let myStocks = database.ref("Participants/"+phNumber+"");
myStocks.on('value', (snapshot) => {
 
 if(!snapshot.exists())
  {
    
    window.sessionStorage.setItem('UNAUTHORIZED_USER','true');
    window.location.replace('login.html');


  }
  const data = snapshot.val();
  updateSelfStocks(data);
});



let stocksNumber = database.ref('Market/stocksLeft');
stocksNumber.on('value', (snapshot) => {
  const data = snapshot.val();
  updateStockNumbers(data);
});
let recStatus = database.ref('Market/rec');
recStatus.on('value', (snapshot) => {
  const data = snapshot.val();
  updateRecStatus(data);


});
function updateRecStatus(data)
{
 
  
current_rec = data.split(',');
for(let i = 1;i<=current_rec.length;i++)
{
  let price = document.getElementById("cell"+i+1);
  let status = document.getElementById("cell"+i+2);
  if(current_rec[i-1] === 'up')
  {  status.innerHTML = '\u25B2';
    status.style.color= '#00ff00';
    let price = document.getElementById("cell"+i+1);
    price.style.color='#00ff00';
  
  }

else if(current_rec[i-1] === 'down')
{
  status.innerHTML = '\u25bc';
  status.style.color='#ff0000';
  price.style.color='#ff0000';
}  

}


}


function updateCompanyNames(data)
{


  let companies = data.split(",");
  
    for(let i = 1;i<=companies.length;i++)
        {
            let company_Str = companies[i -1];
            let name = document.getElementById("cell"+i+0);         
            name.innerHTML= company_Str;
            
            let selfAccount = document.getElementById("Company"+i);
            selfAccount.innerHTML= company_Str;
            let bGroup = document.getElementById('buy_companies_group');
            let sGroup = document.getElementById('sell_companies_group');
          
            let buyOption = document.createElement('option');
            let sellOption = document.createElement('option');
            
            buyOption.value = i-1;
            buyOption.text = company_Str;
            bGroup.appendChild(buyOption);
            
            sellOption.value = i - 1;
            sellOption.text = company_Str;
            sGroup.appendChild(sellOption);
            //sGroup.appendChild(option);

        }


}
function updateStockNumbers(data)
{

    let currentStocks = data.split(",");
    current_stock_numbers = currentStocks;
    for(let i = 1;i<=currentStocks.length;i++)
        {
            let number = document.getElementById("cell"+i+3);         
            number.innerHTML= currentStocks[i-1];   
        }
}
function updateStockPrice(data)
{
  
    let currentStocks = data.split(",");
    current_stock_prices = currentStocks;


    for(let i = 1;i<=current_stock_prices.length;i++)
        {
            let price = document.getElementById("cell"+i+1);
            price.innerHTML= ('R'+'\u00a5'+' '+currentStocks[i-1]).toString().bold();
            
        }
       
}

/**************************************************** */

function updateSelfStocks(data)
{  


    amountBox.innerHTML = "&nbsp;&nbsp; Balance:"+'R'+'\u00a5'+' '+data.currentAmount+'&nbsp;&nbsp;';
    amountBox.style.color = "#1b1b28";
    amountBox.style.fontWeight='bold';
    teamName = data.SCHOOL;
    User.style.color="#1b1b28";
    User.innerHTML= teamName;
    let currentStocks = data.currentStocks.split(",");
    current_self_accounts = data.currentAccounts.split(",");
    current_self_profits = data.currentProfits.split(",");
    current_self_stocks = currentStocks;
    for(let i = 1;i<=current_self_stocks.length;i++)
        {
       

            let selfStockNumber = document.getElementById("stock"+i);  
            let selfProfit = document.getElementById("profit"+i);       
            selfStockNumber.innerHTML= "Stocks:" + currentStocks[i-1];   
           
            let profit = parseFloat(current_self_profits[i-1]);
            if(profit>0)
            { 
              selfProfit.innerHTML="Profit:  +"+'R'+'\u00a5'+' '+current_self_profits[i-1]; 
              selfProfit.style.color="#00d933"
              selfProfit.style.fontWeight='bold';

            }
            else if(profit<0)
             {  
               selfProfit.innerHTML="Loss:   -"+'R'+'\u00a5'+' '+Math.abs(parseFloat(current_self_profits[i-1])); 
               selfProfit.style.color="#ff0000"
               selfProfit.style.fontWeight='bold';
            }
            else
            {
              selfProfit.innerHTML="Profit: "+'R'+'\u00a5'+' '+current_self_profits[i-1]; 
             
         
            }
        }
}


function buyClick()
{
  
   
  let companyId= parseInt(select_buy_company.value);
  let eachStockPrice = parseFloat(current_stock_prices[companyId]);
  let totalStockNumbers = parseInt(current_stock_numbers[companyId]);
  let n_ordered_stocks = parseInt(n_stock_buy.value);
  let totalAmount = n_ordered_stocks * eachStockPrice;
  let balance = parseFloat(amountBox.innerHTML.match(/[\d\.]+/));
  n_stock_buy.value = "";

  if(totalAmount>balance)
  {
    showNotification("INSUFFICIENT BALANCE IN YOUR ACCOUNT");
    return;
  }

  if(permissionsGranted.canBuy === false)
   {  
        showNotification("PERMISSION DENIED BY THE ADMIN");
        return;
   }
  if(isNaN(n_ordered_stocks))
    {
      showNotification("ENTER NUMBER OF STOCKS");
      return;


    }
    if(!(n_ordered_stocks>0))
    
   
     {
       showNotification("INVALID NUMBER OF STOCKS");
        return;
    }
    


 


  if(n_ordered_stocks>totalStockNumbers)
   {
     showNotification("INSUFFICIENT STOCKS IN THE MARKET");
      return;
  }
   
   
   
     let num_balance = amountBox.innerHTML.match(/[\d\.]+/);
    let sendTransactionRequest = 
    {
      "TYPE": 'BUY',
      "NUMBER": n_ordered_stocks,
      "COMPANY":companyId,
      "AMOUNT": totalAmount,
      "UID": uid,
      "BALANCE":num_balance,
      "TEAM":teamName
    }

    socket.emit('transaction_request',sendTransactionRequest);

}



function sellClick()
{
   let companyId= parseInt(select_sell_company.value);
  let n_sell_stocks = parseInt(n_stock_sell.value);



  if(n_sell_stocks>current_self_stocks[companyId])
  {
  showNotification("INSUFFICIENT STOCKS IN YOUR ACCOUNT");
    return;

  } 
  if(permissionsGranted.canSell === false)
   { 
    showNotification("PERMISSION DENIED BY THE ADMIN");
     return;
  
     } 


  if(!(n_sell_stocks>0)) 
  {
    showNotification("INVALID NUMBER OF STOCKS");
     return;
 }
  if(isNaN(n_sell_stocks))
    {
      showNotification("ENTER NUMBER OF STOCKS");
      return;

    }

  n_stock_sell.value="";
  


  let num_balance = amountBox.innerHTML.match(/[\d\.]+/);
  let sendTransactionRequest=
  {
    "TYPE":"SELL",
    "NUMBER":n_sell_stocks,
    "COMPANY":companyId,
    "UID": uid,
    "BALANCE":num_balance,
    "TEAM":teamName
    
  }  
  socket.emit('transaction_request',sendTransactionRequest);


}

buyButton.onclick = buyClick;
sellButton.onclick = sellClick;

socket.on(uid+'buy_status',async(data)=>
{
  
    if((data.STATUS ==='SUCCESSFUL'))
      {
            let newRecord =  (parseInt(current_self_stocks[data.COMPANY_ID]) + parseInt(data.STOCKS_BOUGHT)).toString();

            current_self_stocks[data.COMPANY_ID] =newRecord;
            current_self_accounts[data.COMPANY_ID] = (parseFloat(current_self_accounts[data.COMPANY_ID])+(parseInt(data.STOCKS_BOUGHT) * parseFloat(data.CPS))).toFixed(2);

          //  await party.child(phNumber+"/currentAmount").set(data.BALANCE_LEFT.toString());
            await party.child(phNumber).set({
              
              "currentAmount":data.BALANCE_LEFT.toString(),
              "currentStocks":current_self_stocks.toString(),
              "currentAccounts":current_self_accounts.toString(),
              "currentProfits":current_self_profits.toString(),
              "SCHOOL":teamName
            });
      }
      else if(data.STATUS === 'FAILED')
          showNotification(data.ERROR);



});
socket.on(uid+'sell_status',async(data)=>
{ 
    if((data.STATUS ==='SUCCESSFUL'))
      {
            let newRecord = (parseInt(current_self_stocks[data.COMPANY_ID]) -parseInt(data.STOCKS_SOLD)).toString();
   
            
            
            let avgBuyPrice = parseFloat(current_self_accounts[data.COMPANY_ID])/parseInt(current_self_stocks[data.COMPANY_ID]);
            let avgCostValue =  avgBuyPrice * parseInt(data.STOCKS_SOLD);;
            let profit = parseInt(data.STOCKS_SOLD) * parseFloat(data.CPS) - avgCostValue;
            
            current_self_accounts[data.COMPANY_ID] = (parseFloat(current_self_accounts[data.COMPANY_ID]) - avgCostValue).toFixed(2);
            current_self_profits[data.COMPANY_ID] = (parseFloat(current_self_profits[data.COMPANY_ID]) + profit).toFixed(2);   
            current_self_stocks[data.COMPANY_ID] = newRecord;
            




            await party.child(phNumber).set({
              
              "currentAmount":data.BALANCE_LEFT.toString(),
              "currentStocks":current_self_stocks.toString(),
              "currentAccounts":current_self_accounts.toString(),
              "currentProfits":current_self_profits.toString(),
              "SCHOOL":teamName
            });
      }



});

function showNotification(message)
{

  snackbar.timeoutMs = 4000;
  snackbar_color.style.backgroundColor = "#ff8491"
  snackbar_message.innerHTML = message;
  snackbar.open();
  

}






//TRTYING


function CreateAccountLayout(numberOfCompanies)
{
  let id = 0;
  let rows = Math.floor((numberOfCompanies/4))+1;
  let mCols;
  for(let i = 0;i<rows;i++)
    {

      let newRow = addRow();

        if(numberOfCompanies>4)
          {
            mCols = 4;
            numberOfCompanies = numberOfCompanies - 4;
          } 
          
         else
         {
            mCols = numberOfCompanies;
            numberOfCompanies = 0;


         } 

       for(let j = 0;j<mCols;j++)
       {

          newRow.appendChild(addColumn(id+1))
          id = id+1;
       } 

      demat.appendChild(newRow);

    }

}



function addRow()
{
    let row = document.createElement('div');
    row.classList.add('row');
    return row;
}


function addColumn(id)
{
  let column = document.createElement('div');
  column.classList.add("col-md-6", "col-xl-3" ,"mb-4");
  let card = document.createElement('div');
  card.classList.add('card', 'shadow', 'border-start-primary', 'py-2');
  let cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  let cardRow1 = document.createElement('div');
  cardRow1.classList.add('row','align-items-center', 'no-gutters');
  let cardRow2 = document.createElement('div');
  cardRow2.classList.add('row');
  let cardCol = document.createElement('div');
  cardCol.classList.add('col');
  let span1 = document.createElement('span');
  span1.style.color="#424250";
  span1.style.fontWeight='bold';
  span1.id='stock'+id;
  let cardCol2 = document.createElement('div');
  cardCol2.classList.add('col','me-2');
  let cardText = document.createElement('div');
  cardText.classList.add('text-dark', 'fw-bold' ,'h5', 'mb-0');
  let span2 = document.createElement('span');
  span2.id='Company'+id;
  span2.style.fontSize='larger';
  let span3 = document.createElement('span');
  span3.id='profit'+id;  

  let cardCol3 = document.createElement('div');
  cardCol3.classList.add('col');

  let cardRow3 = document.createElement('div');
  cardRow3.classList.add('row');


  cardText.appendChild(span2);
  cardCol2.appendChild(cardText);
  cardRow1.appendChild(cardCol2);

  cardCol.appendChild(span1);
  cardRow2.appendChild(cardCol);
  
  cardCol3.appendChild(span3);
  cardRow3.appendChild(cardCol3);

  
  cardBody.appendChild(cardRow1);
  cardBody.appendChild(cardRow2);
  cardBody.appendChild(cardRow3);
  card.appendChild(cardBody);
  card.style.backgroundColor = "#d3e5ff";

  column.appendChild(card);
  return column;


}



function createtable(nCompanies)
{
  for(let i = 1;i<=nCompanies;i++)
    {
      let tRow = document.createElement('tr');

        for(let j = 0;j<4;j++)
          {

            let tCol = document.createElement('td');
            tCol.id ='cell'+i+''+j;
            tRow.appendChild(tCol);

          }
          stockTableBody.appendChild(tRow);



    }




}


window.addEventListener('offline', function(e) { 
  
  isDisconnected = true;
  snackbar.timeoutMs = 4000;
  snackbar_color.style.backgroundColor = "#ff8491"
  snackbar_message.innerHTML = "Disconnected from Internet"
  snackbar.open();



});

window.addEventListener('online', function(e) 
{
  
  if(isDisconnected === true)
  {
      
    snackbar.timeoutMs = 4000;
   snackbar_color.style.backgroundColor = "#9dffac"
    snackbar_message.innerHTML = "Connected to Internet";
    snackbar.open();
    isDisconnected = false;

    this.setTimeout(()=>
    {
        this.location.reload();


    },2000);

}
});
  


