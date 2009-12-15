function EmbeddedAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

EmbeddedAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	this.buttonModel1 = {
		buttonLabel : 'Press to play embedded video',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt1 = {
		type : Mojo.Widget.activityButton
	}

	this.controller.setupWidget('LaunchVideoButton',this.buttonAtt1,this.buttonModel1)
	Mojo.Event.listen($('LaunchVideoButton'),Mojo.Event.tap, this.handleButtonPressed.bind(this));
	this.videoObj = VideoTag.extendElement('VideoDiv');
	this.videoObj.addEventListener(
         Media.Event.X_PALM_CONNECT,
         function(evt){
            Mojo.Log.info("CONNECTED")
         },
         false);
	this.videoObj.addEventListener(
         Media.Event.ENDED,
         function(evt){
		 	Mojo.Log.info("VIDEO FINISHED")
            this.getButton = this.controller.get('LaunchVideoButton');
			this.getButton.mojo.deactivate();
         }.bind(this),
         false);
	this.videoObj.poster = Mojo.appPath + "images/pre_01.png"	 
}
EmbeddedAssistant.prototype.handleButtonPressed = function(event){
	this.videoObj.palm.audioClass = "media";
	this.videoObj.src = "http://v1.cache7.googlevideo.com/videoplayback?id=8226383f3bef8883&itag=18&ip=0.0.0.0&ipbits=0&expire=1268332110&sparams=expire%2Cip%2Cipbits%2Cid%2Citag&devKey=iO7QaD-aOibAuPdAG4mpimD9LlbsOl3qUImVMV6ramM&client=ytapi-PalmInc-PalmPre&app=youtube_gdata&signature=4EC9429E63969118272EB329F2E88C16E40CF015.C35298BB05544E95863970020DB79ED8A1C2F4C7&key=yta1"
	this.videoObj.palm.windowOrientation = 'up';
	this.videoObj.palm.fitMode = 'fit';
	this.videoObj.play();
}
EmbeddedAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


EmbeddedAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

EmbeddedAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.videoObj.stopListening(
         Media.Event.X_PALM_CONNECT,
         function(evt){
            Mojo.Log("CONNECTED")
         },
         false);
	this.videoObj.stopListening(
         Media.Event.ENDED,
         function(evt){
            this.getButton = this.controller.get('LaunchVideoButton');
			this.getButton.mojo.deactivate();
         }.bind(this),
         false);
}
