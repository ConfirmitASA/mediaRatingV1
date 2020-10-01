class MediaRatingQuestion {
    constructor(currentQuestion, mediaOptions) {
        this.question = currentQuestion;
        this.options = mediaOptions;
        this.checks = 0;
        this.sliderMoved = false;
        // not in use yet; for future adaptation of the question depending on the screen orientation
        //this.screenOrientation = this.getOrientation();
        this.primaryBackground = $(".cf-navigation-next").css("background-color");
        this.videoDuration = 0;
        this.currentLanguage = String(Confirmit.page.surveyInfo.language);
        this.devErrors = [];
        this.init();
    }

    init() {
        this.devErrors = this.checkRequiredOptions();
        if (this.devErrors.length > 0) {
            document.getElementById(this.question.id).innerHTML = '<div style="color: red;">' + this.devErrors.join('<br />') + '</div>';
        } else {
            //document.getElementById(this.question.id).querySelectorAll('.cf-open-answer')[0].style.display = 'none';
            this.setDefaultOptions();
            $('body').prepend('<div id="popup" class="hide"><div id="popup-content"></div></div>');
            this.renderVideoRatingQuestion();
        }
    }

    checkRequiredOptions() {
        if (!this.options.hasOwnProperty("src") || (this.options.hasOwnProperty("src") && this.options.src == "")) {
            this.devErrors.push("Option \"src\" is required");
        }
        return this.devErrors;
    }

    setDefaultOptions() {
        if (!this.options.hasOwnProperty("type") || (this.options.hasOwnProperty("type") && this.options.type == "")) {
            this.options.type = "video";
        }
        if (!this.options.hasOwnProperty("width") || (this.options.hasOwnProperty("width") && this.options.width == "")) {
            this.options.width = 640;
        }
        if (!this.options.hasOwnProperty("poster") || (this.options.hasOwnProperty("poster") && this.options.poster == "")) {
            this.options.poster = "";
        }
        if (!this.options.hasOwnProperty("sliderPosition") || (this.options.hasOwnProperty("sliderPosition") && this.options.sliderPosition == "")) {
            this.options.sliderPosition = "bottom";
        }
        if (!this.options.hasOwnProperty("scaleMin") || (this.options.hasOwnProperty("scaleMin") && this.options.scaleMin == "")) {
            this.options.scaleMin = -50;
        }
        if (!this.options.hasOwnProperty("scaleMax") || (this.options.hasOwnProperty("scaleMax") && this.options.scaleMax == "")) {
            this.options.scaleMax = 50;
        }
        if (!this.options.hasOwnProperty("scaleStart") || (this.options.hasOwnProperty("scaleStart") && this.options.scaleStart == "")) {
            this.options.scaleStart = 0;
        }
        if (!this.options.playButtonText.hasOwnProperty(this.currentLanguage) || (this.options.playButtonText.hasOwnProperty(this.currentLanguage) && this.options.playButtonText[this.currentLanguage] == "")) {
            this.options.playButtonText[this.currentLanguage] = "Play";
        }
        if (!this.options.hasOwnProperty("playButtonColor") || (this.options.hasOwnProperty("playButtonColor") && this.options.playButtonColor == "")) {
            this.options.playButtonColor = this.primaryBackground;
        }
        if (!this.options.hasOwnProperty("countdown") || (this.options.hasOwnProperty("countdown") && this.options.countdown == "")) {
            this.options.countdown = 3;
        }
        if (!this.options.hasOwnProperty("timecheck") || (this.options.hasOwnProperty("timecheck") && this.options.timecheck == "")) {
            this.options.timecheck = 5;
        }
        if (!this.options.hasOwnProperty("warningsAmount") || (this.options.hasOwnProperty("warningsAmount") && this.options.warningsAmount == "")) {
            this.options.warningsAmount = 1;
        }
        if (!this.options.resetBtnText.hasOwnProperty(this.currentLanguage) || (this.options.resetBtnText.hasOwnProperty(this.currentLanguage) && this.options.resetBtnText[this.currentLanguage] == "")) {
            this.options.resetBtnText[this.currentLanguage] = "Reset";
        }
        if (!this.options.warningReset.hasOwnProperty(this.currentLanguage) || (this.options.warningReset.hasOwnProperty(this.currentLanguage) && this.options.warningReset[this.currentLanguage] == "")) {
            this.options.warningReset[this.currentLanguage] = "You don't seem to have moved your slider. Please click ‘Reset’ to restart this task again.";
        }
        if (!this.options.warningIOS.hasOwnProperty(this.currentLanguage) || (this.options.warningIOS.hasOwnProperty(this.currentLanguage) && this.options.warningIOS[this.currentLanguage] == "")) {
            this.options.warningIOS[this.currentLanguage] = "Media is loading and will start shortly.";
        }
    }

    renderVideoRatingQuestion() {
        var object = this;
        // add standard question markup
        document.getElementById(this.question.id).innerHTML = '<div class="cf-question__text" id="' + this.question.id + '_text">' + this.question.text + '</div>' +
            '<div class="cf-question__instruction" id="' + this.question.id + '_instruction">' + this.question.instruction + '</div>' +
            '<div class="cf-question__error cf-error-block cf-error-block--bottom cf-error-block--hidden" id="' + this.question.id + '_error" role="alert" aria-labelledby="' + this.question.id + '_error_list">' +
            '<ul class="cf-error-list" id="' + this.question.id + '_error_list"></ul></div>' +
            '<div class="cf-question__content cf-question__content--no-padding"><div class="video-slider-container"></div></div>';
        // add specific question markup
        var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (this.options.sliderPosition == 'left' || this.options.sliderPosition == 'right') {
            $('#' + this.question.id + ' .cf-question__content').addClass('slider-' + this.options.sliderPosition);
        }
        var notificationIos = '';
        if (iOS) {
            //<span style="text-transform:capitalize;">' + this.options.mediaType + '</span>
            notificationIos = '<div id="apple-warning">' + this.options.warningIOS[this.currentLanguage] + '</div>';
        }

        $('#' + this.question.id + ' .cf-question__content').prepend('' +
            notificationIos +
            '<div class="video-slider-container"><div class="video-container" style="width: ' + this.options.width + 'px; max-width: 82%;">' +
            '<div class="button-container"><button style="background: ' + this.options.playButtonColor + ';" type="button" id="startVideo">' + this.options.playButtonText[this.currentLanguage] + '</buttonsty></div>' +
            '<div id="counter"></div>' +
            '</div>' +
            '<div class="slider-container">' +
            '<div id="slider">' +
            '<div id="custom-handle" class="ui-slider-handle"></div>' +
            '</div></div></div>');

        //hide countdown
        $('#counter').hide();

        //add video
        var video = document.createElement('video');
        video.setAttribute('id', this.question.id + '-rate-video');
        video.setAttribute('class', 'video-js');
        video.innerHTML = '<source src="' + this.options.src + '" type = "video/mp4" /><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href = "https://videojs.com/html5-video-support/" target = "_blank"> supports HTML5 video </a></p>';
        document.getElementById(this.question.id).querySelectorAll('.video-container')[0].appendChild(video);

        //video settings
        var controlsVal = false;
        if (iOS) {
            controlsVal = false;
        }

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
            $('.video-container').append('<div class="videoTiming clearfix" style="background: ' + obj.primaryBackground + ';"><span class="videoTimingTitle"><span id="timeRemain">00:00</span>&nbsp;/&nbsp;<span id="videoLength">' + counterMinutes + ' </span></span></div>');
            obj.videoDuration = Math.floor(myPlayer.duration());
            obj.generateSparklines(Math.floor(myPlayer.duration()));
        };

        //add slider
        var mySlider;
        var sliderHeight = ($('.video-container').height() + 100) + 'px';

        var orientation = 'horizontal';
        if (this.options.sliderPosition == 'left' || this.options.sliderPosition == 'right') {
            orientation = 'vertical';
            $('.slider-container').css({ 'height': sliderHeight });
        } else {
            $('.slider-container').css({ 'width': this.options.width + 'px', 'max-width': '82%' });
        }
        var handle = $('#custom-handle');
        handle.css('background', this.primaryBackground);
        mySlider = $('#slider').slider({
            min: parseInt(this.options.scaleMin),
            max: parseInt(this.options.scaleMax),
            value: parseInt(this.options.scaleStart),
            orientation: orientation,
            create: function () {
                handle.text($(this).slider('value'));
            },
            slide: function (event, ui) {
                handle.text(ui.value);
                this.sliderMoved = true;
            }
        });

        var nextBtn = $('.cf-navigation-next');
        nextBtn.attr('disabled', this.question.required);

        //countdown
        $(document).on('click', '#startVideo', function () { startVideo(object); });

        function startVideo(obj) {
            myPlayer.play();
            myPlayer.pause();
            mySlider.slider({ disabled: true });
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
        var object = this;
        var timeleft = parseInt(object.options.countdown);
        var startTimer = setInterval(function () {
            if (timeleft <= 0) {
                clearInterval(startTimer);
                $('#startVideo').text(object.options.playButtonText[object.currentLanguage]);
                sliderObj.slider({ disabled: false });
                player.play();
                var videoLength = Math.round(player.duration());
                object.collectData(player, videoLength, sliderObj);
                if (object.checks <= object.options.warningsAmount) {
                    object.checkActivity(player, sliderObj);
                }
            }
            if (timeleft === 0) {
                $('#startVideo').text(object.options.playButtonText[object.currentLanguage]);
            } else {
                $('#startVideo').text(timeleft);
            }
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
                if (sliderObj.slider('value') != object.options.scaleStart) {
                    moved = true;
                }
                if (object.checks <= object.options.warningsAmount && second === parseInt(object.options.timecheck) && !moved) {
                    //restart video
                    player.pause();
                    sliderObj.slider({ disabled: true });
                    $('#startVideo').text(object.options.playButtonText[object.currentLanguage]);
                    // $('#counter').html('');
                    $('#popup-content').html('' +
                        '<p>' + object.options.warningReset[object.currentLanguage] + '</p>' +
                        '<button type="button" id="restartVideo" style="background: ' + object.options.playButtonColor + ';">' + object.options.resetBtnText[object.currentLanguage] + '</button>');
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
            $('#startVideo').text(object.options.playButtonText[object.currentLanguage]);
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

    //get evaluation values every second of the media
    collectData(player, videoLength, sliderObj) {
        var videoAsnwers = [];
        var object = this;
        player.on('timeupdate', function () {
            var second = Math.floor(player.currentTime());
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
            var data = object.checks + "|" + videoAsnwers;
            object.setQuestionValue(data, object);
        })
    }

    //screen orientation
    getOrientation() {
        var orientation = window.innerWidth > window.innerHeight ? "landscape" : "portrait";
        return orientation;
    }

    setQuestionValue(value, obj) {
        obj.question.setValue(value);
        // to be sure that it won't be changed manually in dev tools somehow
        obj.question.validationCompleteEvent.on(
            function () {
                obj.question.setValue(value);
            }
        );
    }
}

/* global register */
register(function (question, customQuestionSettings, questionViewSettings) {
    new MediaRatingQuestion(question, customQuestionSettings);
});