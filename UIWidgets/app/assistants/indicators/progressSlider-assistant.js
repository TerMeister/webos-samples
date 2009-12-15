function ProgressSliderAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
 }
    

ProgressSliderAssistant.prototype.setup = function() {		
		this.attributes = {
				property:		'value', //what property this is tied to; default for this is 'value' if not supplied
				minimumValue: 0,	//what value slider return values start at
				maximumValue: 10, //	what value slider return values end at
				round: true,//			boolean; round the value sent back to the nearest integer,
				labels: ['one', 'two','three','four','five'],// 		optional; 
				/*	array of strings used when breaking a slider into distinct areas; 
					the slider will "snap" to the closest one;
					ex: ['one', 'two','three','four','five'] 
							will have a slider with the left end labelled 'one', 
							the right end labelled 'five' and 3 labelled increments in the middle
					ex: ['one', '','','','five'] 
							will have a slider with the left end labelled 'one',
							the right end labelled 'five' and 3 unlabelled increments in the middle
					ex: ['one','five'] 
							will have a slider with the left end labelled 'one', 
							the right end labelled 'five' and no increments in the middle*/
			cancellable:	false,
			title: 'Title'//			title to show on download bar
			//image: 			image to show on download bar
		};
		this.model = {
			'value': .5
		};
		this.progress = 0;
     	this.controller.setupWidget('sliderdiv', this.attributes, this.model);
		this.propertyChanged = this.propertyChanged.bind(this)
		Mojo.Event.listen(this.controller.get('sliderdiv'),Mojo.Event.propertyChange, this.propertyChanged);
    	this.updater = window.setInterval(this.updateProgress.bind(this), 600);

}
    
    
ProgressSliderAssistant.prototype.reset = function(){
		this.controller.get('sliderdiv').mojo.reset();
}

ProgressSliderAssistant.prototype.updateProgress = function(){
	if (this.progress > 1) {
		window.clearInterval(this.updater);
	}else{
		this.model.value = this.progress;
		this.controller.modelChanged(this.model);
		this.progress += .2;
	}

}

ProgressSliderAssistant.prototype.propertyChanged = function(event){
	Mojo.Log.info("***********new value " + this.model.value + " from event " + event.value);
}


ProgressSliderAssistant.prototype.buttonClicked = function(){
	if (this.model.value == 20 || this.model.value == 50) {
		this.model.value = 50;
		this.controller.modelChanged(this.model);
	}
}

ProgressSliderAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


ProgressSliderAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

ProgressSliderAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  window.clearInterval(this.updater);
	  Mojo.Event.stopListening(this.controller.get('sliderdiv'),Mojo.Event.propertyChange, this.propertyChanged);
}
