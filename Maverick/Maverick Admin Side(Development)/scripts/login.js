
    
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
// Initialize Firebase


// FirebaseUI config.
var uiConfig = {
	
	 signInFlow: 'popup',
    callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
		 let phNumber = authResult.user.phoneNumber;
     
		 window.sessionStorage.setItem('number',phNumber);
		 window.sessionStorage.setItem('uid',authResult.user.uid);
		 console.log('Logged in As:' + phNumber);
	 // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      return true;
    }
  },
	
  signInSuccessUrl: 'index.html',
  signInOptions: [
  {
      provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      recaptchaParameters: {
        type: 'image', // 'audio'
        size: 'normal', // 'invisible' or 'compact'
        badge: 'bottomleft' //' bottomright' or 'inline' applies to invisible.
      },
      defaultCountry: 'IN', // Set default country to the United Kingdom (+44).
      // For prefilling the national number, set defaultNationNumber.
      // This will only be observed if only phone Auth provider is used since
      // for multiple providers, the NASCAR screen will always render first
      // with a 'sign in with phone number' button.
      defaultNationalNumber: '1234567890',
      // You can also pass the full phone number string instead of the
      // 'defaultCountry' and 'defaultNationalNumber'. However, in this case,
      // the first country ID that matches the country code will be used to
      // populate the country selector. So for countries that share the same
      // country code, the selected country may not be the expected one.
      // In that case, pass the 'defaultCountry' instead to ensure the exact
      // country is selected. The 'defaultCountry' and 'defaultNationaNumber'
      // will always have higher priority than 'loginHint' which will be ignored
      // in their favor. In this case, the default country will be 'GB' even
      // though 'loginHint' specified the country code as '+1'.
      loginHint: '+11234567890'
    }
  ],
  // tosUrl and privacyPolicyUrl accept either url string or a callback
  // function.
  // Terms of service url/callback.
  tosUrl: '<your-tos-url>',
  // Privacy policy url/callback.
  privacyPolicyUrl: function() {
    window.location.assign('<your-privacy-policy-url>');
  }
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);
