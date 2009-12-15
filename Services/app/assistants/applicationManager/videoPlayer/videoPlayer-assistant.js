var myassistant = null;
function VideoPlayerAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

VideoPlayerAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Luna.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	myassistant = this;
	this.buttonModel1 = {
		buttonLabel : 'Open video app',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt1 = {
		type : Mojo.Widget.activityButton
	}
	this.buttonModel2 = {
		buttonLabel : 'Open video scene',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt2 = {
		type : Mojo.Widget.activityButton
	}
	this.buttonModel3 = {
		buttonLabel : 'Launch video app',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt3 = {
		type : Mojo.Widget.activityButton
	}
	this.buttonModel4 = {
		buttonLabel : 'Embedded video',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt4 = {}

	this.controller.setupWidget('OpenVideoButton',this.buttonAtt1,this.buttonModel1)
	this.controller.setupWidget('OpenSceneButton',this.buttonAtt2,this.buttonModel2)
	this.controller.setupWidget('LaunchVideoButton',this.buttonAtt3,this.buttonModel3)
	this.controller.setupWidget('EmbeddedButton',this.buttonAtt4,this.buttonModel4)
	Mojo.Event.listen(this.controller.get('OpenVideoButton'),Mojo.Event.tap, this.handleButtonPressed.bind(this));
	Mojo.Event.listen(this.controller.get('OpenSceneButton'),Mojo.Event.tap, this.handleButton2Pressed.bind(this));
	Mojo.Event.listen(this.controller.get('LaunchVideoButton'),Mojo.Event.tap, this.handleButton3Pressed.bind(this));
	Mojo.Event.listen(this.controller.get('EmbeddedButton'),Mojo.Event.tap, this.handleButton4Pressed.bind(this));
}
	


VideoPlayerAssistant.prototype.handleButton4Pressed = function(event) {
	this.controller.stageController.assistant.showScene("applicationManager/videoPlayer/embedded","embedded")

}
VideoPlayerAssistant.prototype.handleButtonPressed = function(event) {
	
	this.controller.serviceRequest(	'palm://com.palm.applicationManager',
	{
		method: 'open',
		parameters: {
			title : unescape("Movie trailer"), 
			target : "http://v1.cache7.googlevideo.com/videoplayback?id=8226383f3bef8883&itag=18&ip=0.0.0.0&ipbits=0&expire=1268332110&sparams=expire%2Cip%2Cipbits%2Cid%2Citag&devKey=iO7QaD-aOibAuPdAG4mpimD9LlbsOl3qUImVMV6ramM&client=ytapi-PalmInc-PalmPre&app=youtube_gdata&signature=4EC9429E63969118272EB329F2E88C16E40CF015.C35298BB05544E95863970020DB79ED8A1C2F4C7&key=yta1",
			//target : Mojo.appPath + "videos/elephants.mp4"
		},
		onSuccess: function(status){
            $('area-to-update').update(Object.toJSON(status));
        },
        onFailure: function(status){
        	$('area-to-update').update(Object.toJSON(status));							
        },
		onComplete: function(){
			this.getButton = myassistant.controller.get('LaunchVideoButton');
			this.getButton.mojo.deactivate();
		}
	});
}
VideoPlayerAssistant.prototype.handleButton2Pressed = function(event) {
	var args = {
		appId: "com.palm.app.videoplayer",
		name: "nowplaying"
    }
    var params = {};
    params.target = "http://v1.cache7.googlevideo.com/videoplayback?id=8226383f3bef8883&itag=18&ip=0.0.0.0&ipbits=0&expire=1268332110&sparams=expire%2Cip%2Cipbits%2Cid%2Citag&devKey=iO7QaD-aOibAuPdAG4mpimD9LlbsOl3qUImVMV6ramM&client=ytapi-PalmInc-PalmPre&app=youtube_gdata&signature=4EC9429E63969118272EB329F2E88C16E40CF015.C35298BB05544E95863970020DB79ED8A1C2F4C7&key=yta1",
	//params.target = Mojo.appPath + "videos/elephants.mp4"
    params.title = "some title";
    params.initialPos = 0;
    params.thumbUrl = "images/generic-thumb-video.png";
    params.videoID = undefined;
    this.controller.stageController.pushScene(args, params);
}
VideoPlayerAssistant.prototype.handleButton3Pressed = function(event) {
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
		method:'launch', 
		parameters: {
			id : 'com.palm.app.videoplayer',
			params: {
				target : "http://v1.cache7.googlevideo.com/videoplayback?id=8226383f3bef8883&itag=18&ip=0.0.0.0&ipbits=0&expire=1268332110&sparams=expire%2Cip%2Cipbits%2Cid%2Citag&devKey=iO7QaD-aOibAuPdAG4mpimD9LlbsOl3qUImVMV6ramM&client=ytapi-PalmInc-PalmPre&app=youtube_gdata&signature=4EC9429E63969118272EB329F2E88C16E40CF015.C35298BB05544E95863970020DB79ED8A1C2F4C7&key=yta1",
				//target : Mojo.appPath + "videos/elephants.mp4",
				videoTitle : "Video Title"
			}
		},
		onSuccess: function(status){
            $('area-to-update').update(Object.toJSON(status));
        },
        onFailure: function(status){
        	$('area-to-update').update(Object.toJSON(status));							
        },
		onComplete: function(){
			this.getButton = myassistant.controller.get('EmbeddedButton');
			this.getButton.mojo.deactivate();
		}
	});
}
VideoPlayerAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


VideoPlayerAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	  this.getButton = myassistant.controller.get('OpenSceneButton');
			this.getButton.mojo.deactivate();
}

VideoPlayerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening($('OpenVideoButton'),Mojo.Event.tap, this.handleButtonPressed.bind(this));
	this.controller.stopListening($('OpenSceneButton'),Mojo.Event.tap, this.handleButton2Pressed.bind(this));
	this.controller.stopListening($('LaunchVideoButton'),Mojo.Event.tap, this.handleButton3Pressed.bind(this));
	this.controller.stopListening($('EmbeddedButton'),Mojo.Event.tap, this.handleButton3Pressed.bind(this));
}
