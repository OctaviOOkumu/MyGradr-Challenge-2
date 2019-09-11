const supportedCards = {
        visa, mastercard
      };

      const countries = [
        {
          code: "US",
          currency: "USD",
          currencyName: '',
          country: 'United States'
        },
        {
          code: "NG",
          currency: "NGN",
          currencyName: '',
          country: 'Nigeria'
        },
        {
          code: 'KE',
          currency: 'KES',
          currencyName: '',
          country: 'Kenya'
        },
        {
          code: 'UG',
          currency: 'UGX',
          currencyName: '',
          country: 'Uganda'
        },
        {
          code: 'RW',
          currency: 'RWF',
          currencyName: '',
          country: 'Rwanda'
        },
        {
          code: 'TZ',
          currency: 'TZS',
          currencyName: '',
          country: 'Tanzania'
        },
        {
          code: 'ZA',
          currency: 'ZAR',
          currencyName: '',
          country: 'South Africa'
        },
        {
          code: 'CM',
          currency: 'XAF',
          currencyName: '',
          country: 'Cameroon'
        },
        {
          code: 'GH',
          currency: 'GHS',
          currencyName: '',
          country: 'Ghana'
        }
      ];

      const billHype = () => {
        const billDisplay = document.querySelector('.mdc-typography--headline4');
        if (!billDisplay) return;

        billDisplay.addEventListener('click', () => {
          const billSpan = document.querySelector("[data-bill]");
          if (billSpan &&
            appState.bill &&
            appState.billFormatted &&
            appState.billFormatted === billSpan.textContent) {
            window.speechSynthesis.speak(
              new SpeechSynthesisUtterance(appState.billFormatted)
            );
          }
        });
      };

	  const appState = {};

	  const formatAsMoney = (amount, buyerCountry) => {
		  const country = countries.find(country => country.country == buyerCountry);
		  if(country){
			  return amount.toLocaleString('en-'+country.code,{style:'currency',currency:country.currency})
		  }else{
			  return amount.toLocaleString('US',{style:'currency',currency:'USD'})
		  }
	  };

	  const flagIfInvalid = (field, isValid) => {
		  isValid? field.classList.remove('is-invalid'):field.classList.add('is-invalid');
	  };

	  const expiryDateFormatIsValid = (field) => {
		  const text = field.value;
		  const format = /^([1-9]|0[1-9]|1[012])\/(\d{2})$/;
		  return format.test(text);
	  };

	  const detectCardType = (first4Digits) => {
		  let digitFour = /^4/;
		  let digitFive = /^5/;
		  let card = document.querySelector('div[data-credit-card]');
		  let cardLogo = document.querySelector('img[data-card-type]');
		  if(digitFour.test(first4Digits)){
			  card.classList.add('is-visa');
			  card.classList.remove('is-mastercard');
			  cardLogo.src = supportedCards.visa;
			  return "is-visa";
		  }else if(digitFive.test(first4Digits)){
			  card.classList.add('is-mastercard');
			  card.classList.remove('is-visa');
			  cardLogo.src = supportedCards.mastercard;
			  return "is-mastercard";
		  }
	  };

	  const validateCardExpiryDate = () => {
		  const field = document.querySelector('[data-cc-info] input:nth-child(2)');

		  let isValid = expiryDateFormatIsValid(field);
		  if(isValid){
			  const text = field.value;
			  const dateTogether = text.split('/');
			  const month = dateTogether[0];
			  const year = dateTogether[1];
			  date = new Date();
			  date.setFullYear(`${"20"+year}`,new Number(month)-1);
			  const today = new Date();
			  isValid = date > today;
			  flagIfInvalid(field,isValid);
			  return isValid;
		  }else{
			  flagIfInvalid(field,isValid);
			  return isValid;
		  }
	  };

	  const validateCardHolderName = () => {
		  const field = document.querySelector('[data-cc-info] input');
		  const validity = /^([a-zA-Z]{3,})\s([a-zA-Z]{3,})$/.test(field.value);
		  flagIfInvalid(field, validity);
		  return validity
	  };

	  const validateWithLuhn = (digits) => {
		  let value = digits.join("");
		  if(/[^0-9-\s]+/.test(value)){return false}

		  let nCheck = 0, nDigit = 0, bEven = 0;
		  value = value.replace(/\D/g, "");
		  for(let n = value.length-1; n>=0 ; n--){
			  let cDigit = value.charAt(n);
			  let nDigit = parseInt(cDigit, 10);
			  if(bEven){
				  if((nDigit*=2)>9){
					  nDigit -= 9;
				  }
			  }
			  nCheck += nDigit;
			  bEven = !bEven;
		  }
		  return (nCheck % 10) == 0;
	  };

	  const validateCardNumber = () => {
		  const digitsArray = appState.cardDigits.flat();
		  const cardValid = validateWithLuhn(digitsArray);
		  const ccDigits = document.querySelector('[data-cc-digits]');
		  if(cardValid){
			  ccDigits.classList.remove('is-invalid');
		  }else{
			  ccDigits.classList.add('is-invalid');
		  }
	  };

	  const validatePayment = () => {
		  validateCardNumber();
		  validateCardHolderName();
		  validateCardExpiryDate();
	  };

	  const acceptCardNumbers = (event,fieldIndex) => {};

	  const smartBackSpace = (event,fieldIndex,fields) => {
		  if(fields[fieldIndex].value === '' && fieldIndex > 0 && event.key == 'Backspace'){
			  fields[fieldIndex - 1].fous();
		  }
	  };

	  const smartCursor = (event,fieldIndex,fields) => {
		  if(fieldIndex < fields.length - 1){
			  if(fields[fieldIndex].value.length === Number(fields[fieldIndex].size)){
				  fields[fieldIndex + 1].focus()
			  }
		  }
	  };
	  
	  const smartInput = (event,fieldIndex,fields) => {
		  const controlKeys = ['Tab','Delete','Backspace','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Shift'];
		  const isControlKey = controlKeys.includes(event.key);
		  if(!isControlKey){
			  if(fieldIndex <= 3){
				  if(/^\d$/.test(event.key)){
					  if(appState.cardDigits[fieldIndex] === undefined){
						  appState.cardDigits[fieldIndex] = [];
					  }
					  let field = fields[fieldIndex];
					  //New Code
					  event.preventDefault();
					  const target = event.target;
					  let {selectionStart,value} = target;
					  appState.cardDigits[fieldIndex][selectionStart] = +event.key;
					  target.value = value.substr(0, selectionStart) + event.key + value.substr(selectionStart + 1);
					  setTimeout(() => {
						  appState.cardDigits[fieldIndex] = target.value.split('').map((car,i) => (car >= '0' && car <= '9') ? Number(car) : Number(appState.cardDigits[fieldIndex][i]));
						  if(fieldIndex < 3){
							   target.value = target.value.replace(/\d/g, '$');
						  }

						  smartCursor(event,fieldIndex,fields);

						  if(fieldIndex == 0 && target.value.length >= 4){
							  let first4Digits = appState.cardDigits[0];
							  detectCardType(first4Digits);
						  }
					  },500)
				  }else{
					  event.preventDefault();
				  }
			  }else if(fieldIndex == 4){
				  if(/[a-z]|\s/i.test(event.key)){
					  setTimeout(() => {
						  smartCursor(event,fieldIndex,fields);
					  },500)
				  }else{
					  event.preventDefault();
				  }
			  }else{
				  if(/\d|\//.test(event.key)){
					  setTimeout(() => {
						  smartCursor(event,fieldIndex,fields);
					  },500);
				  }else{
					  event.preventDefault();
				  }
			  }
		  }else{
			  if(event.key === 'Backspace'){
				  if(appState.cardDigits[fieldIndex].length > 0){
					  appState.cardDigits[fieldIndex].splice(-1, 1)
				  }else{}
					  smartBackSpace(event,fieldIndex,fields)
			 	  }else if(event.key == 'Delete'){
			 		  if(appState.cardDigits[fieldIndex].length > 0){
			 			  appState.cardDigits[fieldIndex].splice(1, 1)
			 		  }
			   }
		  }
	  };


	  const enableSmartTyping = () => {
		  let fields = document.querySelectorAll('[data-credit-card] input');
		  let fieldsArr = Array.from(fields);
		  fieldsArr.forEach((field,index,fields) => {
			  field.addEventListener('keydown', event => smartInput(event,index,fields));
		  })
	  };

	  const uiCanInteract = () => {
		  document.querySelector('[data-cc-digits]').focus();
		  document.querySelector('[data-pay-btn]').addEventListener('click',validatePayment);
		  billHype();
		  enableSmartTyping();
	  };
	  

	  const displayCartTotal = ({results}) => {
		  const [data,] = results;
		  const {itemsInCart, buyerCountry} = data;
		  appState.items = itemsInCart;
		  appState.country = buyerCountry;
		  appState.bill = itemsInCart.reduce((total, item) => {return total + (item.qty * item.price)},0);
		  appState.billFormatted = formatAsMoney(appState.bill,appState.country);
		  document.querySelector('[data-bill]').textContent = appState.billFormatted;
		  appState.cardDigits = [];
		  uiCanInteract(displayCartTotal);
	  };

      
	  const fetchBill = () => {
        const apiHost = 'https://randomapi.com/api';
		const apiKey = '006b08a801d82d0c9824dcfdfdfa3b3c';
		const apiEndpoint = `${apiHost}/${apiKey}`;
        fetch(apiEndpoint)
		.then(response => response.json())
		.then(data => displayCartTotal(data))
		.catch(error => console.log('Error: ', error));
      };
      
      const startApp = () => {
		  fetchBill();
      };

      startApp();
