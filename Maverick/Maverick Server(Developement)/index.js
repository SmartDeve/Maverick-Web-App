const admin = require("firebase-admin");
const serviceAccount = require('./key.json');
const cors = require('cors');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://maverick-ae0b5-default-rtdb.firebaseio.com"
});
const express = require('express');
var app = express();
app.use(cors());

const http = require('http').createServer(app);
var socket = require('socket.io')(http,{
    cors: {
      origin: ["https://maverick-ae0b5.web.app/Market.html","https://maverick-ae0b5.web.app","https://maverick-ae0b5.web.app/index.html","https://maverick-admin-2k21.web.app/index.html","https://maverick-admin-2k21.web.app","https://awsome-3c64e.web.app/index.html","https://awsome-3c64e.web.app"],
      methods: ["GET", "POST"]
    }
  });
var currentStockNumbers;
var currentStockPrice;
var current_rec;
var companyNamesfromBase;
const defaultDatabase = admin.database();

socket.on('connection',(soc)=>{
    let ph = soc.handshake.query.number;
    properLog('USER','User logged in with '+ph);


    soc.on('transaction_request',handleTransaction);
    soc.on('change_price_request',changePriceRequest);
    soc.on('change_number_request',changeNumberRequest);
    soc.on('add_participant_request',addParticipantRequest);
    soc.on('add_admin_request',addAdmin);
    soc.on('check_uid',isAuthorizedToAccessMarket);
    soc.on('change_balance_request',changeBalanceRequest);
    soc.on('inc_dec_request',Inc_Dec_Request);
});


function isAuthorizedToAccessMarket(data)
{
    
    let phone = data.PHONE.toString();
    
    admin
    .auth()
    .getUserByPhoneNumber(phone)
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
        let isAdmin = userRecord.customClaims.admin;
            
            socket.emit('security_check_result',{'ADMIN':isAdmin});
    })
    .catch((error) => {
      console.log('Error fetching user data:', error);
    });




}
function addAdmin(data)
{
    let uid = data.UID;
    
    let password = 'HareKrishna01#';
    if(!(data.PASSWORD === password))
        return;

        
        admin
        .auth()
        .setCustomUserClaims(uid, { admin: true })
        .then(() => {
            properLog('ADMIN','New Admin:'+uid+':ADDED');

        });

}
function addParticipantRequest(data)
{

    
    let phoneNumber = data.TEL_NUMBER;
    let school = data.SCHOOL;
    let currentUserStocks ="";
    let currentUserAccounts ="";
    let currentUserProfits="";
 
    properLog('ADMIN','Team '+school +' is added with '+ phoneNumber);
    
    for(let i = 0;i<companyNamesfromBase.length-1;i++)
        {
            currentUserStocks = currentUserStocks + "0,";
            currentUserAccounts = currentUserAccounts + "0,"
            currentUserProfits= currentUserProfits+"0,";
        }
        currentUserStocks = currentUserStocks + "0";
        currentUserAccounts = currentUserAccounts + "0"
        currentUserProfits= currentUserProfits+"0";
    defaultDatabase.ref('Participants/'+'+91'+phoneNumber).set(
        {
            "currentAmount":"10000",
            "currentStocks":currentUserStocks,
            "currentAccounts":currentUserAccounts,
            "currentProfits":currentUserProfits,
            "SCHOOL":school,
            "PROFIT":0

        }
     
    );


}


function Inc_Dec_Request(data)
{
    let company_id = data.COMPANY;
    let newPrice = parseFloat(currentStockPrice[company_id]) + parseFloat(data.PRICE);
    properLog('ADMIN','STOCK PRICE OF COMPANY:'+company_id +' CHANGED TO ' + newPrice);
   
    let change = (parseFloat(currentStockPrice[data.COMPANY]) - parseFloat(newPrice));
    currentStockPrice[company_id] = newPrice.toFixed(2);
  
    if(change>0)
        current_rec[company_id]="down";
    else if(change<0)
        current_rec[company_id] ="up";

    defaultDatabase.ref('Market/stocksPrice').set(
        currentStockPrice.toString()
     
    );
    defaultDatabase.ref('Market/rec').set(current_rec.toString());




}


function changeBalanceRequest(data)
{
    let ph = data.PHONE;
    let newBalance = data.BALANCE;
    properLog('ADMIN','AMOUNT OF '+ph +' CHANGED TO ' + newBalance);

    defaultDatabase.ref('Participants/'+ph.toString()+'/currentAmount').set(
        newBalance.toString()
     
    );

}
function changePriceRequest(data)
{
  
    let company_id = data.COMPANY;
    let newPrice = data.PRICE;
    properLog('ADMIN','STOCK PRICE OF COMPANY:'+company_id +' CHANGED TO ' + newPrice);
   
    let change = (parseFloat(currentStockPrice[data.COMPANY]) - parseFloat(newPrice));
    currentStockPrice[company_id] = parseFloat(newPrice).toFixed(2);
  
    if(change>0)
        current_rec[company_id]="down";
    else if(change<0)
        current_rec[company_id] ="up";

    defaultDatabase.ref('Market/stocksPrice').set(
        currentStockPrice.toString()
     
    );
    defaultDatabase.ref('Market/rec').set(current_rec.toString());
       
}
function changeNumberRequest(data)
{
   // if(!(isAuthorizedToAccessMarket(data.UID) === true))
    //    return;
    let company_id = data.COMPANY;
    let newNumber = data.NUMBER;
    
    currentStockNumbers[company_id] = newNumber.toString();
    properLog('ADMIN','STOCK NUMBER OF COMPANY:'+company_id +' CHANGED TO ' + newNumber);
    defaultDatabase.ref('Market/stocksLeft').set(
        currentStockNumbers.toString()
     
    );
}

function handleTransaction(data)
{
   

    if(data.UID === null || data.UID === undefined)
        {
            properLog('USER','UNAUTHORIZED TRANSACTION BLOCKED');
            return;

        }
    if(data.TYPE === 'BUY')
        {
      
                performBuyTransaction(data,socket);

        }
    else if (data.TYPE ==='SELL')
    {
        let CPS;
        let moneyGiven =parseFloat(currentStockPrice[data.COMPANY]) * parseInt(data.NUMBER);
        
        
        CPS = currentStockPrice[data.COMPANY]; 
       
        
        
        let marObj = fluctuatePrice(parseFloat(currentStockPrice[data.COMPANY]), 'SELL', parseInt(data.NUMBER),parseInt(currentStockNumbers[data.COMPANY]));
        currentStockPrice[data.COMPANY] =marObj['PRICE'].toFixed(2);
        currentStockNumbers[data.COMPANY] = parseInt(marObj['NUMBER']).toString();
    

        current_rec[data.COMPANY] = "down";
        let balance = parseFloat(data.BALANCE);
        defaultDatabase.ref('Market/stocksPrice').set(
            currentStockPrice.toString()
         
        );
   
    defaultDatabase.ref('Market/stocksLeft').set(currentStockNumbers.toString());    
    defaultDatabase.ref('Market/rec').set(current_rec.toString());
            let newBalance = (balance + (moneyGiven - (moneyGiven*0.025))).toFixed(2)
            let success_transaction = {

                "STATUS":'SUCCESSFUL',
                "STOCKS_SOLD":data.NUMBER,
                "BALANCE_LEFT": newBalance,
                "COMPANY_ID":data.COMPANY,
                "CPS":CPS
    
            }
    
           
            socket.sockets.emit(data.UID+'sell_status',success_transaction);
            success_transaction.COMPANY_ID = companyNamesfromBase[parseInt(success_transaction.COMPANY_ID)];
            properLog('USER','STOCKS SOLD BY '+data.TEAM + JSON.stringify(success_transaction));  
    }



}







function performBuyTransaction(data,socket)
{

    let companyId = parseInt(data.COMPANY);
    let requestedStockNumbers = parseInt(data.NUMBER);
    let predictedAmount = parseFloat(data.AMOUNT);
    let team = data.TEAM;
    let CPS = currentStockPrice[companyId];
    let calculatedAmount = parseFloat(currentStockPrice[companyId]) * requestedStockNumbers;
    let uid = data.UID;
    let balance = parseFloat(data.BALANCE);
    //VERIFY UID
    
    if(parseInt(currentStockNumbers[companyId])<requestedStockNumbers)
       { 
          
         let  success_transaction = {

            "STATUS":'FAILED',
            "ERROR":'INSUFFCIENT STOCKS IN THE MARKET'
            

        }

        properLog('USER','INSUFFICENT STOCKS: THIS HAPPENS WHEN THE STOCK IS CHANGING VERY FAST. DON"T WORRY!');
        socket.sockets.emit(uid+'buy_status',success_transaction);

        }
       else if(!(calculatedAmount - predictedAmount===0))
         { 
            
            if(calculatedAmount>balance)        
                {     let  success_transaction = {

                    "STATUS":'FAILED',
                    "ERROR":'INSUFFCIENT BALANCE IN YOUR ACCOUNT'
                    
        
                }
                    socket.sockets.emit(uid+'buy_status',success_transaction);
                    
                 properLog('USER','INSUFFICENT STOCKS: THIS HAPPENS WHEN THE STOCK IS CHANGING VERY FAST. DON"T WORRY!');
                }
            
        }
        else
    {
        let marObj = fluctuatePrice(parseFloat(currentStockPrice[companyId]), 'BUY', requestedStockNumbers,parseInt(currentStockNumbers[companyId]));
        
        currentStockPrice[companyId] =marObj['PRICE'].toFixed(2);
        currentStockNumbers[companyId] = parseInt(marObj['NUMBER']).toString();

        current_rec[companyId] = "up";
        defaultDatabase.ref('Market/stocksPrice').set(
                currentStockPrice.toString()
            );

            defaultDatabase.ref('Market/stocksLeft').set(currentStockNumbers.toString());    
        defaultDatabase.ref('Market/rec').set(current_rec.toString());
        let success_transaction = {
            "STATUS":'SUCCESSFUL',
            "STOCKS_BOUGHT":requestedStockNumbers,
            "BALANCE_LEFT": (balance -(calculatedAmount+calculatedAmount*0.02)).toFixed(2),
            "COMPANY_ID":companyId,
            "CPS":CPS

        }

        
        socket.sockets.emit(uid+'buy_status',success_transaction);
        success_transaction.COMPANY_ID = companyNamesfromBase[parseInt(success_transaction.COMPANY_ID)];
        properLog('USER','STOCKS BOUGHT BY '+team + JSON.stringify(success_transaction));   
    }
}
http.listen(process.env.PORT||5000,()=>{
    console.log('listening');

    
    });

    let stocksPrice = defaultDatabase.ref('Market/stocksPrice');
stocksPrice.on('value', (snapshot) => {
  const data = snapshot.val();
  
  let currentStocks = data.split(",");
  currentStockPrice = currentStocks;

});
let stocksNumber = defaultDatabase.ref('Market/stocksLeft');
stocksNumber.on('value', (snapshot) => {
  const data = snapshot.val();
  let currentStocks = data.split(",");
  currentStockNumbers = currentStocks;
});


let companyName = defaultDatabase.ref('Market/Companies');
companyName.on('value', (snapshot) => {
  const data = snapshot.val();
  companyNamesfromBase = data.split(",");
    
});

let recStatus = defaultDatabase.ref('Market/rec');
recStatus.on('value', (snapshot) => {
  const data = snapshot.val();
  current_rec = data.split(',');
});
function properLog(Keyword, message)
{

    let log = Keyword+':'+message;

    console.log(log);

}

function fluctuatePrice(currentPrice,TYPE,N,currentStock)
{
    let k;


    if(TYPE === 'BUY')
    {
    for(let i = 0;i<N;i++)
        {

            if(currentStock>300&&currentStock<=400)
                k = 0.12;
            else if(currentStock>200&currentStock<=300)
                k = 0.13;
            else if(currentStock>100&&currentStock<=200)
                k = 0.15;
            else if(currentStock>0&&currentStock<=100)
                k = 0.2;

        
            currentPrice = currentPrice + k;      
            currentStock = currentStock - 1;
        }

        return {'PRICE':currentPrice, 'NUMBER':currentStock};

}
    else if(TYPE ==='SELL')
    {
        let copyNumber = currentStock;
        if(currentPrice === 5.00)
        {

            return {'PRICE':currentPrice, 'NUMBER':(currentStock + N)};   


        }
        for(let i = 0;i<N;i++)
        {

            
            if(copyNumber>300&&copyNumber<=400)
                k = 0.2;
            else if(copyNumber>200&copyNumber<=300)
                k = 0.15;
            else if(copyNumber>100&&copyNumber<=200)
                k = 0.13;
            else if(copyNumber>=0&&copyNumber<=100)
                k = 0.12;
           
            currentPrice = currentPrice - k;
            copyNumber = copyNumber +1;


            if(currentPrice<5)
                {

                    currentPrice = 5.00;
                    break;


                }

        }


        return {'PRICE':currentPrice, 'NUMBER':currentStock + N};   

    }
     

}