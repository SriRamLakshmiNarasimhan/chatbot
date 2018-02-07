(function () {

    var chat = {
        messageToSend: '',
        messageResponses: [
          "https://www.google.com"
        ],
        init: function () {
            this.cacheDOM();
            this.bindEvents();
            this.render();
        },
        cacheDOM: function () {
            this.$chatHistory = $('.chat-history');
            this.$button = $('button');
            this.$textarea = $('#message-to-send');
            this.$chatHistoryList = this.$chatHistory.find('ul');
        },
        bindEvents: function () {
            this.$button.on('click', this.addMessage.bind(this));
            this.$textarea.on('keyup', this.addMessageEnter.bind(this));
        },
              luisCall: function (value) {
				   var params = {
			"subscription-key":CryptoJS.AES.decrypt("U2FsdGVkX19Glask4Gxi9ajZUYLuGmcnz/1RW/mL3jV9V66raqG6U/s3ZiCHg/96GzMinXRj5G8cHXzF18blIw==", "Sre").toString(CryptoJS.enc.Utf8),
			"verbose": "true",
            "timezoneOffset": "0",
			"q":value,
        };
            var _this = this;
			 $.ajax({
            url: "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/340cf197-e7e6-476f-a4d1-8d2939eb7d04?" + $.param(params),
            type: "GET",
            data: "{body}",
        })
        .done(function(data) {
			var templateResponse = Handlebars.compile( $("#message-response-template").html());
			var contextResponse = { 
						response: _this.chatResponse(data),
						time: _this.getCurrentTime()
			};
			setTimeout(function() {
				_this.$chatHistoryList.append(templateResponse(contextResponse));
				_this.scrollToBottom();
			}.bind(_this), 1500); 
        })
        .fail(function() {
           alert("Technical error: Check internet connection or retry after sometime");
        })
			  },
        render: function () {
            this.scrollToBottom();
            if (this.messageToSend.trim() !== '') {
                var template = Handlebars.compile($("#message-template").html());
                var context = {
                    messageOutput: this.messageToSend,
                    time: this.getCurrentTime()
                };
				this.$chatHistoryList.append(template(context));
				this.scrollToBottom();
				this.luisCall(this.$textarea.val());
				this.$textarea.val('');
            }
        },
        addMessage: function () {
            this.messageToSend = this.$textarea.val()
            this.render();
        },
        addMessageEnter: function (event) {
            if (event.keyCode === 13) {
                this.addMessage();
            }
        },
        scrollToBottom: function () {
            this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
        },
        getCurrentTime: function () {
            return new Date().toLocaleTimeString().
                    replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
        },
        getRandomItem: function (arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        },
		capitalizeFirstLetter: function (string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		},
		chatResponse: function(jsonData){
			var outputMessage;
			switch(jsonData.topScoringIntent.intent){
				case "greetings":
					outputMessage = "Hey, I am CricBot! You can ask me for cricket news. Wanna know more? Ask more!";
					break;
				case "player_info_games_played":
					if(jsonData.entities.length > 0){
						var name = this.capitalizeFirstLetter(jsonData.entities[0].resolution.values[0]);
							switch(name){
								case "MS Dhoni":
									outputMessage = name + " has played 90 test, 312 ODI and 131 FC matches"
									break;
								case "Sachin Tendulkar":
									outputMessage = name + " has played 200 test, 463 ODI and 310 FC matches"
									break;
								case "Shane Watson":
									outputMessage = name + " has played 59 test 190 ODI, 58 T20 International matches"
									break;
								case "Steve Smith":
									outputMessage = name + " has played 61 test, 103 ODI and 110 FC matches"
									break;
								default:
									outputMessage = "It is a yorker to ask on "+name+"! I am trained to answer only about MS Dhoni, Sachin Tendulkar, Shane Watson and Steve Smith."
									break;
							}
						break;
					}
					else{
						outputMessage = "Can you be more specific? You can ask for the number of matches Steven Smith have played so far";
						break;
					}
					break;
				case "player_info_sixes":
					outputMessage = "Question on number of sixes. I don't have data yet.";
					break;
				case "player_info_fours":
					outputMessage = "Question on number of fours. I don't have data yet.";
					break;
				case "player_info_duck":
					outputMessage = "Question on number of duck out. I don't have data yet.";
					break;
				case "stadium_info":
					if(jsonData.entities.length > 0){
						var type = jsonData.entities[0].resolution.values[0];
						switch(type){
								case "biggest":
									outputMessage = "With a capacity of 100,024, Melbourne Cricket Ground is the biggest in the world."
									break;
								case "highest":
									outputMessage = "At an altitude of 2144m, Dharamsala, (Chail, India) is the highest cricket ground in the world."
									break;
								case "smallest":
									outputMessage = "The Carisbrook (Dunedin, New Zealand) is regarded as one of the smallest grounds in the world."
									break;
								default:
									outputMessage = "Can you please rephrase? You can ask for the biggest cricket ground in the world"
									break;
							}
					}
					else{
						outputMessage = "Can you be more specific? You can ask for the biggest cricket ground in the world";
						break;
					}
					break;
				case "other_info_cricket_news":
					outputMessage = "";
					break;
				case "purchase_tickets":
					outputMessage = "Watching match in live is a great experience in itself! Buy tickets at https://www.cricket.com.au/tickets?state=all&type=All";
					break;
				case "purchase_accessories":
					outputMessage = "New items are available for sale. Check out at https://shop.cricket.com.au/";
					break;
				case "something":
					if(jsonData.entities.length > 0){
						var name = this.capitalizeFirstLetter(jsonData.entities[0].entity);
						outputMessage = "Hey "+ name + "!\nHow're you doing?";
						break;
					}
					else{
						outputMessage = "Hmm..\nHow're you doing?";
						break;
					}
				default:
					if(jsonData.topScoringIntent.intent == "None"){
						outputMessage = "I'm afraid if I understood the context. You can ask for my introduction or about this chatbot.";
					}
					else {
						outputMessage = jsonData.topScoringIntent.intent+"\nAs I'm still under training, I am unable to answer at this point of time. Please try again later.";
					}
					break;
			}
			return outputMessage;
		}
    };
    chat.init();
})();
$(document).ready(function (e) {
    $("#toggle1").click(function () {
        $('#box1').toggleClass('minimize');
        if ($('#box1').hasClass('minimize')) {
            $('#box1').css({ height: '50px', transition: "linear 0.5s" });
        } else {
            $('#box1').css({ height: '530px' });
        }

    })
});
