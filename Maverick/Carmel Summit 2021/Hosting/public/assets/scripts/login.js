var firebaseConfig={apiKey:"AIzaSyD_818rzmgf-CsoxlnGLjcvifkN2VAznH0",authDomain:"maverick-ae0b5.firebaseapp.com",databaseURL:"https://maverick-ae0b5-default-rtdb.firebaseio.com",projectId:"maverick-ae0b5",storageBucket:"maverick-ae0b5.appspot.com",messagingSenderId:"926763134889",appId:"1:926763134889:web:5f1553ae548a93ebec9eb8",measurementId:"G-S81LLWFHBQ"};firebase.initializeApp(firebaseConfig);
var uiConfig={signInFlow:"popup",callbacks:{signInSuccessWithAuthResult:function(a,b){window.sessionStorage.setItem("number",a.user.phoneNumber);window.sessionStorage.setItem("uid",a.user.uid);return!0}},signInSuccessUrl:"index.html",signInOptions:[{provider:firebase.auth.PhoneAuthProvider.PROVIDER_ID,recaptchaParameters:{type:"image",size:"normal",badge:"bottomleft"},defaultCountry:"IN",defaultNationalNumber:"1234567890",loginHint:"+11234567890"}],tosUrl:"<your-tos-url>",privacyPolicyUrl:function(){window.location.assign("<your-privacy-policy-url>")}},
ui=new firebaseui.auth.AuthUI(firebase.auth());ui.start("#firebaseui-auth-container",uiConfig);