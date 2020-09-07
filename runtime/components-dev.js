class MediaRatingQuestion {
    constructor(currentQuestion, mediaOptions) {
        this.question = currentQuestion;
        this.options = mediaOptions;
        this.checks = 0;
        this.sliderMoved = false;
        // not in use yet; for future adaptation of the question depending on the screen orientation
        //this.screenOrientation = this.getOrientation();
        this.videoDuration = 0;
        this.devErrors = [];
        this.init();
    }

    init() {
        this.devErrors = this.checkRequiredOptions();
        if (this.devErrors.length > 0) {
            //$('#' + currentQuestion.id).html('<div style="color: red;">' + errorsForDeveloper.join('<br />') + '</div>');
            console.log(this.devErrors);
        } else {
            this.setDefaultOptions();
            this.renderVideoRatingQuestion();
        }
    }

    checkRequiredOptions() {
        if (!this.options.hasOwnProperty("src")) {
            this.devErrors.push("Option \"src\" is required");
        }

        return this.devErrors;
    }

    setDefaultOptions() {
        if (!this.options.hasOwnProperty("poster")) {
            this.options.poster = "";
        }
        if (!this.options.hasOwnProperty("countdown")) {
            this.options.countdown = 3;
        }
        if (!this.options.hasOwnProperty("timecheck")) {
            this.options.timecheck = 5;
        }
        if (!this.options.hasOwnProperty("width")) {
            this.options.width = 640;
        }
        if (!this.options.hasOwnProperty("sliderPosition")) {
            this.options.sliderPosition = "bottom";
        }
        if (!this.options.hasOwnProperty("scaleMin")) {
            this.options.scaleMin = -50;
        }
        if (!this.options.hasOwnProperty("scaleMax")) {
            this.options.scaleMax = 50;
        }
        if (!this.options.hasOwnProperty("scaleStart")) {
            this.options.scaleStart = 0;
        }
        if (!this.options.hasOwnProperty("warningsAmount")) {
            this.options.warningsAmount = 1;
        }
        if (!this.options.hasOwnProperty("playButtonText")) {
            this.options.playButtonText = "Play";
        }
        if (!this.options.hasOwnProperty("mediaType")) {
            this.options.mediaType = "video";
        }
        if (!this.options.hasOwnProperty("showSparklie")) {
            this.options.showSparklie = true;
        }
    }

    renderVideoRatingQuestion() {
        var object = this;
        // add markup
        var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (this.options.sliderPosition == 'left') {
            $('#' + this.question.id + ' .cf-question__content').addClass('slider-left');
        }
        var notificationIos = '';
        if (iOS) {
            notificationIos = '<div id="apple-warning"><span style="text-transform:capitalize;">' + this.options.mediaType + '</span> is loading and will start shortly.</div>';
        }
        $('#' + this.question.id + ' .cf-question__content').prepend('' +
            notificationIos +
            '<div class="video-slider-container">' +
            '<div class="button-container"></div>' +
            '<div id="counter"></div>' +
            '<div class="video-container"  style="max-width: ' + this.options.width + 'px;"></div>' +
            '<div class="slider-container" style="max-width: ' + this.options.width + 'px;">' +
            '<div id="slider" class="uiColorSchemeFaded">' +
            '<div id="custom-handle" class="ui-slider-handle uiColorScheme"></div>' +
            '</div></div></div>'+
            '');

        //hide countdown
        $('#counter').hide();

        var selectedBackground = $(".cf-navigation-next").css("background-color");
        var selectedForeground = $(".cf-navigation-next").css("color");
        var selectedLight = selectedBackground;
        if (selectedLight.indexOf("#") > -1) {
            selectedLight = this.adjustHexOpacity(selectedLight , 0.5);
        } else {
            selectedLight = selectedLight.replace('rgb','rgba').replace(')',',0.5)')
        }

        $("head").append('<style>.uiColorScheme{ background-color: ' + selectedBackground + '!important; color: ' + selectedForeground + '!important; } .uiColorSchemeFaded{ background-color: ' + selectedLight + ';} </style>');

        //add video
        var videoHTML = '<video id="' + this.question.id + '-rate-video" class="video-frame" style="width: 100%; height:auto;"><source src="' + this.options.src + '" type = "video/mp4" /><p class="vjs-no-js">To play this ' + this.options.mediaType + ' please enable JavaScript, and consider upgrading to a web browser that<a href="https://videojs.com/html5-video-support/" target = "_blank"> supports HTML5 video </a></p></video>';
        $(".video-container").append(videoHTML);

        //video settings
        var controlsVal = false;
        if (iOS) {
            controlsVal = false;
        }
        //console.log(this.question.id);
        var myPlayer = videojs(this.question.id + '-rate-video', {
            controls: controlsVal,
            autoplay: false,
            playsinline: true,
            preload: 'auto',
            responsive: true,
            poster: this.options.poster,
            fill: true
        });

        myPlayer.one("loadedmetadata", function(){ changeCounterDisplay(object) });

        //Changing duration to use a Math.round function
        function changeCounterDisplay(obj) {
            var counterMinutes = obj.setCounterMinutesDisplay(Math.floor(myPlayer.duration()));
            $('.video-container').prepend('<div class="videoTiming clearfix"><span class="videoTimingTitle"><span id="timeRemain">00:00</span>&nbsp;/&nbsp;<span id="videoLength">' + counterMinutes + ' </span></span><div id="spark"></div><div id="play-wrapper"><button type="button" class="uiColorScheme" id="startVideo">' + obj.options.playButtonText + '</button></div></div>');
            obj.videoDuration = Math.floor(myPlayer.duration());
            obj.generateSparklines(Math.floor(myPlayer.duration()));
        };

        //add slider
        var mySlider;
        var sliderHeight = '20px';

        $('.slider-container').css('height', sliderHeight);
        var orientation = 'horizontal';
        if (this.options.sliderPosition == 'left') {
            orientation = 'vertical';
        }
        var handle = $('#custom-handle');
        mySlider = $('#slider').slider({
            min: this.options.scaleMin,
            max: this.options.scaleMax,
            value: this.options.scaleStart,
            orientation: orientation,
            disabled: true,
            create: function () {
                handle.text($(this).slider('value'));
            },
            slide: function (event, ui) {
                handle.text(ui.value);
                this.sliderMoved = true;
            }
        });

        var nextBtn = $('.cf-navigation-next');
        nextBtn.attr('disabled', true);

        //countdown
        $(document).on('click', '#startVideo', function () { startVideo(object); });

        function startVideo(obj) {
            myPlayer.play();
            myPlayer.pause();
            obj.playerCycle(myPlayer, mySlider);
            $('#startVideo').attr({ 'disabled': true });
        }
    }

    adjustHexOpacity(color, opacity) {
        var r = parseInt(color.slice(1, 3), 16);
        var g = parseInt(color.slice(3, 5), 16);
        var b = parseInt(color.slice(5, 7), 16);
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
    }

    setCounterMinutesDisplay(seconds) {
        var minutes = 0;
        var remainingSeconds = 0;
        if (seconds >= 60) {
            minutes = seconds / 60;
        }
        minutes = Math.floor(minutes);
        remainingSeconds = seconds % 60;
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (remainingSeconds < 10) {
            remainingSeconds = "0" + remainingSeconds;
        }
        return minutes + ":" + remainingSeconds;
    }

    generateSparklines(seconds) {
        if (this.options.showSparkline == true) {

            var lines = "";
            var width = $("#spark").width() / seconds;
            var pcWidth = (width / $("#spark").width()) * 100;
            for (var i = 0; i < seconds; i++) {
                lines += '<span style="width:' + pcWidth + '%;" class="spark-line" id="spark-' + i + '"></span>';
            }
            $("#spark").html(lines);
        }
    }

    playerCycle(player, sliderObj) {
        //$('#counter').show();
        var object = this;
        var timeleft = this.options.countdown;
        var startTimer = setInterval(function () {
            if (timeleft <= 0) {
                clearInterval(startTimer);
                //$('#counter').hide();
                $('#startVideo').text("Play");
                player.play();
                sliderObj.slider({ disabled: false });
                //var videoLength = Math.floor(player.duration()) + 1;
                var videoLength = Math.round(player.duration());
                object.collectData(player, videoLength, sliderObj);
                if (object.checks <= object.options.warningsAmount) {
                    object.checkActivity(player, sliderObj);
                }
            }
            //$('#counter').html(timeleft);
            $('#startVideo').text(timeleft);
            timeleft -= 1;
        }, 1000);
    }

    checkActivity(player, sliderObj) {
        var object = this;
        //TO DO: why not used?
        var timecheck = object.options.timecheck - 1;
        var moved = false;
        if (object.checks <= object.options.warningsAmount) {
            player.on('timeupdate', function () {
                var second = Math.floor(player.currentTime());
                if (sliderObj.slider('value') !== object.options.scaleStart) {
                    moved = true;
                }
                if (object.checks <= object.options.warningsAmount && second === object.options.timecheck && !moved) {
                    //restart video
                    player.pause();
                    sliderObj.slider({ disabled: true });
                    $('#counter').html('');
                    $('#popup-content').html('' +
                        '<p>You don\'t seem to have moved your slider. Please click ‘Reset’ to restart this task again.</p>' +
                        '<button type="button" id="restartVideo">Reset</button>');
                    $('#popup').removeClass('hide');
                    $('body').css('overflow', 'hidden');
                }
            });
            if (!moved) {
                object.checks++;
            }
        }

        $('body').on('click', '#restartVideo', function () {
            object.closePopup();
            $('#startVideo').text("Play");
            object.generateSparklines(object.videoDuration);
            object.restartVideo(player, sliderObj);
        });
    }

    closePopup() {
        $('#popup').addClass('hide');
        $('body').css('overflow', 'auto');
    }

    //restart video
    restartVideo(player, sliderObj) {
        player.currentTime(0);
        this.playerCycle(player, sliderObj)
    }

    //setInterval(function, milliseconds, param1, param2, ...)
    //var startDataTimer;
    collectData(player, videoLength, sliderObj) {
        //console.log('collectData started');
        var videoAsnwers = [];
        var object = this;
        player.on('timeupdate', function () {
            var second = Math.floor(player.currentTime());
            //console.log(second + " == " + sliderObj.slider('value'));
            if (second >= 1) {
                videoAsnwers[second - 1] = sliderObj.slider('value');
                var val = sliderObj.slider('value');
                if(val > 0) {
                    var pc = (val / object.options.scaleMax) * 10;
                    $("#spark-" + (second - 1)).css({
                        "height":pc+"px",
                        "margin-bottom":"10px",
                        "background-color":"green"
                    });
                } else if (val < 0){
                    var pc = (val / object.options.scaleMin) * 10;
                    $("#spark-" + (second - 1)).css({
                        "height": pc + "px",
                        "margin-bottom": (10 - pc) + "px",
                        "background-color": "red"
                    });
                } else {

                    $("#spark-" + (second - 1)).css({
                        "height": "2px",
                        "margin-bottom": "9px",
                        "background-color": "grey"
                    });
                }


            }
            $('#timeRemain').html(object.setCounterMinutesDisplay(second));

        });
        player.on('ended', function () {
            $('.cf-navigation-next').attr('disabled', false);
            var data = this.checks + "|" + videoAsnwers;
            console.log(data);
            object.setQuestionValue(data, this);
        })
    }

    getOrientation() {
        var orientation = window.innerWidth > window.innerHeight ? "landscape" : "portrait";
        return orientation;
    }

    setQuestionValue(value, obj) {
        obj.question.validationCompleteEvent.on(
            function () {
                obj.question.setValue(value);
            }
        );
    }
}

/* global register */
(function () {
    console.log("dev mode");
    const question = Confirmit.page.questions[0];
    const customQuestionSettings = {
        src: "https://vjs.zencdn.net/v/oceans.mp4"
    };
    $(document).ready(function () {
        new MediaRatingQuestion(question, customQuestionSettings);
    });
})();