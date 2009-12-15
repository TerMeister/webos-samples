function AudioObjectAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

AudioObjectAssistant.prototype.setup = function () {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	//Set up button handlers
	this.buttonModel1 = {
		buttonLabel : 'Play',
		buttonClass : 'affirmative',
		disable : false
	};
	this.buttonAtt1 = {
		type : Mojo.Widget.activityButton
	};
	
	//Set up button handlers
	this.buttonModel2 = {
		buttonLabel : 'Pause',
		buttonClass : 'dismiss',
		disable : false
	};
	this.buttonAtt2 = {
		type : Mojo.Widget.activityButton
	};
	
	this.controller.setupWidget('PlayButton', this.buttonAtt1, this.buttonModel1);
	this.controller.setupWidget('PauseButton', this.buttonAtt2, this.buttonModel2);
	Mojo.Event.listen(this.controller.get('PlayButton'), Mojo.Event.tap, this.handlePlayButton.bind(this));
	Mojo.Event.listen(this.controller.get('PauseButton'), Mojo.Event.tap, this.handlePauseButton.bind(this));
	Mojo.Event.listen(this.controller.get('StopButton'), Mojo.Event.tap, this.handleStopButton.bind(this));
	Mojo.Event.listen(this.controller.get('BackButton'), Mojo.Event.tap, this.handleBackButton.bind(this));
};


AudioObjectAssistant.prototype.activate = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
      
};
AudioObjectAssistant.prototype.handlePlayButton = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	 example, key handlers that are observing the document */
	this.mybutton = this.controller.get('PauseButton');
	this.mybutton.mojo.deactivate();
	try {
		if (this.paused && !this.stopped) {
			this.paused = false;
			this.playing = true;	
			this.audioPlayer.play();
		} else {
			if (!this.playing) {
				this.paused = false;
				this.playing = true;	
				this.stopped = false;
				this.audioPlayer = new Audio();
				var file = Mojo.appPath + 'audio/conan06.wav';
				if (this.audioPlayer.palm) {
					this.audioPlayer.mojo.audioClass = "media";
				}
				this.myCueHandler(file);
			}
		}
		$('area-to-update').update("Playing...");
	}catch (err) {
		this.showDialogBox('error', err); 
	}
};
AudioObjectAssistant.prototype.handlePauseButton = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	this.paused = true;	
	if (this.playing) {
		this.playing = false;
		this.stopped = false;
		this.mybutton = this.controller.get('PlayButton');
		this.mybutton.mojo.deactivate();
		this.controller.get('area-to-update').update("Paused!!");
		this.audioPlayer.pause();
	} else {
		this.playing = false;	
		this.paused = false;
		this.stopped = true;
		this.mybutton = this.controller.get('PauseButton');
		this.mybutton.mojo.deactivate();
	}
};
AudioObjectAssistant.prototype.handleStopButton = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */	
	this.mybutton = this.controller.get('PauseButton');
	this.mybutton.mojo.deactivate();
	this.mybutton = this.controller.get('PlayButton');
	this.mybutton.mojo.deactivate();
	this.audioPlayer.pause();	
	this.audioPlayer.src = null;
	this.playing = false;	
	this.paused = false;
	this.stopped = true;
	$('area-to-update').update("Stopped...");
};
AudioObjectAssistant.prototype.handleBackButton = function (event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */	
	this.controller.stageController.popScene();
};

AudioObjectAssistant.prototype.deactivate = function (event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

AudioObjectAssistant.prototype.cleanup = function (event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
AudioObjectAssistant.prototype.myCueHandler = function (url) {
	console.log("In cue handler");
	// Set the src URL (file:, http: or rtsp: protocols)
	this.audioPlayer.src = url;

	// Prevent playback starting immediately.  Must be called *after* setting the src URL
	//this.audioPlayer.autoplay = false;
	this.myPlayHandler();
};
AudioObjectAssistant.prototype.myPlayHandler = function () {
	// Register this handler so we know when the play is finished
	this.audioPlayer.addEventListener('end', this.myCueIterator, false);

	// Register this handler so we know if there was a problem with playback of the sound file.
	this.audioPlayer.addEventListener('error', this.myCueIterator, false);
	// Start playback of the audio file
	try {
		this.audioPlayer.play();
	} catch (err) {
		this.showDialogBox('error', err);
	}
};


AudioObjectAssistant.prototype.myCueIterator = function (event) {
	// Remove the two event handlers.  
	this.audioPlayer.removeEventListener('end', myCueIterator, false);
	this.audioPlayer.removeEventListener('error', myCueIterator, false);
	
	if (event.type === 'error') {
		// You're on your own ;-)
		console.log("Error");
	} else {
		this.audioPlayer.pause();	
		this.audioPlayer.src = null;
		this.paused = false;
		this.stopped = true;
		//var nextUrl = _figure_out_what_to_play_next();
		
		// Cue handler defined earlier is used to change the content to be played next 
		// time play() is called on the audio object.
		//myCueHandler(nextUrl);
	}
};
AudioObjectAssistant.prototype.showDialogBox = function (title, message) {
	this.controller.showAlertDialog({
		onChoose: function (value) {},
		title: title,
		message: message,
		choices: [ {label: 'OK', value: 'OK', type: 'color'} ]
	});
};

