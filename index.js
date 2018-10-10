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
				  //var decrypted = CryptoJS.AES.decrypt("U2FsdGVkX19Glask4Gxi9ajZUYLuGmcnz/1RW/mL3jV9V66raqG6U/s3ZiCHg/96GzMinXRj5G8cHXzF18blIw==", "Sre");
				   var params = {
            // These are optional request parameters. They are set to their default values.
			"subscription-key":CryptoJS.AES.decrypt("U2FsdGVkX19Glask4Gxi9ajZUYLuGmcnz/1RW/mL3jV9V66raqG6U/s3ZiCHg/96GzMinXRj5G8cHXzF18blIw==", "Sre").toString(CryptoJS.enc.Utf8),
			"verbose": "true",
            "timezoneOffset": "0",
			"q":value,
        };
            var _this = this;
			 $.ajax({
            url: "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/88cfdca1-3702-49fe-9aa6-210e6828529e?" + $.param(params),
/*             beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","key=");
            }, */
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
           alert("Technical error: Check internet connection or notify at sriramnarasimhan1990@gmail.com");
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
            //Enter key event
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
				case "Generic Greetings":
					outputMessage = "Hey! What's your good name?";
					break;
				case "Generic Good Answer":
					outputMessage = "That's great!\nYou can ask for my intro to know more..";
					break;
				case "Generic Bad Answer":
					outputMessage = "Hmm..\nMay be you can ask for my intro, if you're interested.";
					break;
				case "Generic Good Wishes":
					outputMessage = "Cool!";
					break;
				case "Generic Bad Wishes":
					outputMessage = "I'm sorry!";
					break;
				case "Generic Good Bye":
					outputMessage = "Good Bye!\nHave a nice day :)";
					break;
				case "Generic Unscoped":
					outputMessage = "Hush hush! I am not going to answer this.";
					break;
				case "Introduction Self":
					if(jsonData.entities.length > 0){
						var name = this.capitalizeFirstLetter(jsonData.entities[0].entity);
						outputMessage = "Hey "+ name + "!\nHow're you doing?";
						break;
					}
					else{
						outputMessage = "Hmm..\nHow're you doing?";
						break;
					}
				case "Introduction Question":
					outputMessage = "This is Sri Ram, a post-graduate in Applied Mathematics.\nWorking as Sr. Software Engineer in Accenture Solutions Pvt Ltd, I'm passionate about cycling, writing Tamil peoms and learning to write awesome code.\nYou can ask specific questions to know more.";
					break;
				case "Education General":
					outputMessage = "I did my schooling was from Sri Vidya Mandir (Salem, IN) and chose Mathematics for college studies.\nTo know more, you can ask specific questions on school or college education or extra curricular activities.";
					break;
				case "Education School":
					outputMessage = "With interests in Science and Mathematics, I passed my class 12 from Sri Vidya Mandir (Salem, IN) in the year 2008 and class 10 in the year 2006.";
					break;
				case "Education College":
					outputMessage = "From Agurchand Manmull Jain College (affiliated to Madras University, Chennai, IN), with Statistics and Mechanics as allied subjects, I completed Bachelor of Science in Mathematics in the year 2011.\nWith interest in Analysis and Abstract Algebra and inspired by Prof. Nandagopal, I studied Master of Science in Applied Mathematics from Madras Institute of Technology (Anna University, Chennai, IN).";
					break;
				case "Education Other Activities":
					outputMessage = "Apart from regular studies I learnt Karate (brown belt - 2nd kyu), Hindi, pagged 1st prizes in Bhagavath Gita chanting and an active Scout member (Rajyapuraskar scout).\nI'm also a department topper during college.\nAlbum for the same is available at https://photos.app.goo.gl/1ZCND12rkoFoX2jA3.";
					break;
				case "Education Unscoped":
					outputMessage = "Can you please rephrase? You can ask about school or college education for more details.";
					break;
				case "Hobby General":
					outputMessage = "I am passionate about cycling in my Hero Octane and sometimes swim too and write peoms in Tamil too.\nI also focus on building awesome programs and learning and trying to make wonders with Arduino UNO that helps people in someway.\nSome of my peoms and baby steps in Arduino UNO can be seen here https://photos.app.goo.gl/aCAULA1vzwpHuW1A2";
					break;
				case "Hobby Unscoped":
					outputMessage = "Can you please rephrase? You can ask about hobby for more details.";
					break;
				case "Career General":
					outputMessage = "I strongly believe that Mathematics is not just about blackboard and chalk piece and I chose to join Accenture in August 2013 right after my post-graduation.\nMy initial role was in testing where I verified BI services and CRMs.\nI moved towards automation testing using Selenium both with Java and C# and I'm slowly stepping into AI/ML.\nYou can ask specific questions on skillset or awards or certifications to know more.";
					break;
				case "Career Awards":
					outputMessage = "I received Accenture Stellar award during Q4 of FY14 for compatibility testing and for driving scrum.\nI also received Accenture APEX award for driving Remote Desktop to Citrix VDESK transition for entire team and I'm awarded Accenture Celebrates Excellence (ACE) twice for performance testing and for codeless automation solution.";
					break;
				case "Career Office":
					outputMessage = "I'm working  for Accenture Solutions Pvt Ltd (Chennai, IN) since August 2013.";
					break;
				case "Career Skillset":
					outputMessage = "My skillset includes - BI testing, AMDOCS & Salesforce CRM testing, Selenium with Java & C#, programming in C# - WinForms, WPF, MVC, WebAPI solutions, setting up and handling Microsoft & Google AI services and CMU Sphinx. I am also equipping with Python.";
					break;
				case "Career Certifications":
					outputMessage = "Having started my career as tester, I'm ISTQB certified Foundation and Agile tester and also Vskill's Certified Selenium Professional.\nI'll soon be Microsoft Technology Associate in Python";
					break;
				case "Career Change":
					outputMessage = "Forseeing future with neural networks and artificial intelligence, I'm open to taking challenges if it is for serving a cause.\nAnd 10 years down the line, I want to see myself as a building block for the cause";
					break;
				case "Career Unscoped":
					outputMessage = "Can you please rephrase? You can ask about career for more details.";
					break;
				case "Chatbot":
					outputMessage = "Written in JavaScript, the chatbot is powered by Microsoft Language Understanding Intelligent Services.\nCode can be modified as needed and can be cloned from https://github.com/SriRamLakshmiNarasimhan/chatbot. \nFor more details on Microsoft LUIS, please check https://www.luis.ai/home.";
					break;
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
