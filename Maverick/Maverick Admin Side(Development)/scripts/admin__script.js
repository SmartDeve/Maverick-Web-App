'use-strict'
const stockTableBody = document.getElementById('stock_table_body');
const table = document.getElementById('stocks_table');
const socket = io('https://maverick-server.herokuapp.com');
const changePriceButton = document.getElementById('change_price');
const changeNumberButton = document.getElementById('change_number');
const select_price_company = document.getElementById('price_data');
const select_number_company = document.getElementById('number_data');
const new_stock_price = document.getElementById('new_price');
const new_stock_number= document.getElementById('new_number');
const toast_alert = document.getElementById('toast_alert');
const ph = document.getElementById('phNum');
const select_school = document.getElementById('school_data');
const BalanceBox = document.getElementById('balance');
const addParticipantButton = document.getElementById('add_party');
const uid = window.sessionStorage.getItem('uid');
const changeBalanceButton = document.getElementById('change_balance');
const schoolNameBox = document.getElementById('schoolID');
let current_rec;
let current_stock_numbers;
let current_stock_prices;
let current_self_stocks;

const body = document.getElementById('page-top');



let isFirstTime = true;
let phNumber = window.sessionStorage.getItem('number');


console.log('This is the phone number:'+ phNumber);
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




  socket.on("connect",()=>
  {

  
   console.log('connected');
    let request = {
      "PHONE":phNumber

    }
  
    
   socket.emit('check_uid',request);
  
  });
  socket.on('security_check_result',(data)=>
  {
    
      if(data.ADMIN === true)
      {
      
          body.hidden = false;
      

      }else if(data.ADMIN === false)
        {
          window.sessionStorage.setItem('UNAUTHORIZED_USER','true')
          alert('PLEASE LOGIN WITH ADMIN ACCOUNT');
          
          window.location.replace("login.html"); 
          

        }



  });
  




let database = firebase.database();
let party = database.ref('Participants');
let market = database.ref('Market');


let companyName = database.ref('Market/Companies');
companyName.on('value', (snapshot) => {
  const data = snapshot.val();
  createtable(data.split(',').length);
  updateCompanyNames(data);
});

let stocksPrice = database.ref('Market/stocksPrice');
stocksPrice.on('value', (snapshot) => {
  const data = snapshot.val();
  updateStockPrice(data);
});



let schools = database.ref('Participants');
schools.on('value',(snapshot)=>
{

  const data = snapshot.val();

  updateSchoolNames(data);
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
for(let i = 1;i<current_rec.length;i++)
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

function updateSchoolNames(data)
{

  var length = select_school.options.length;
for (i = length-1; i >= 0; i--) {
  select_school.options[i] = null;
}
  let keys =Object.keys(data);
  keys.forEach((key)=>{ 
    let partyObj = data[key];
    let sName = partyObj.SCHOOL;
    let tGroup = document.getElementById('school_options');
    


    let schoolOption = document.createElement('option');
    schoolOption.value = key;
    schoolOption.text = sName;
    tGroup.appendChild(schoolOption);
});



}
function updateCompanyNames(data)
{


  let companies = data.split(",");
  
    for(let i = 1;i<companies.length;i++)
        {
            let company_Str = companies[i -1];
            let name = document.getElementById("cell"+i+0);         
            name.innerHTML= company_Str;
            
            let bGroup = document.getElementById('price_companies');
            let sGroup = document.getElementById('number_companies');
          
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
    for(let i = 1;i<current_stock_numbers.length;i++)
        {
            let number = document.getElementById("cell"+i+3);         
            number.innerHTML= currentStocks[i-1];   
        }
}
function updateStockPrice(data)
{
    console.log(data);
    let currentStocks = data.split(",");
    current_stock_prices = currentStocks;


    for(let i = 1;i<current_stock_prices.length;i++)
        {
            let price = document.getElementById("cell"+i+1);
            price.innerHTML= ('R'+'\u00a5'+' '+currentStocks[i-1].toString().bold());
            
          
         
        }
       
}

/**************************************************** */


changePriceButton.onclick = changePriceClick;
changeNumberButton.onclick = changeNumberClick;
addParticipantButton.onclick = addParticipantClick;
function changePriceClick()
{
    
    let new_sp = new_stock_price.value;
    let company_id = select_price_company.value;

    let change_request = 
    {
      'PRICE':new_sp,
      'COMPANY':company_id,
      'UID': "None"
    } 

    
    console.log(JSON.stringify(change_request));
    socket.emit('change_price_request',change_request);


}
function changeNumberClick()
{
    
    let new_sp = new_stock_number.value;
    let company_id = select_number_company.value;
    
    let change_request = 
    {
      'NUMBER':new_sp,
      'COMPANY':company_id,
      'UID': "NONE"
    } 


    socket.emit('change_number_request',change_request);



}
function addParticipantClick()
{

    let telNum = ph.value;
    let school = schoolNameBox.value;

    let add_request =
    {
     'TEL_NUMBER':telNum,
     'SCHOOL':school
    }

    socket.emit('add_participant_request',add_request);




}


function addAdmin()
{

  let add_admin_request = {
    'PASSWORD':'HareKrishna01#',
    'UID':uid



  }
  console.log('sending...');
  socket.emit('add_admin_request',add_admin_request);


}

changeBalanceButton.onclick = changeBalance;

function changeBalance()
{

  let phNum = select_school.value;
  let amount = BalanceBox.value;
  let change_balance_request = 
  {

    'PHONE':phNum,
    'BALANCE':amount


  }


  socket.emit('change_balance_request',change_balance_request);

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