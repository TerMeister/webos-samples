function SpinnerAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
 }
    

SpinnerAssistant.prototype.setup = function() {	
		//set up the spinner widget
				
		this.spinnerLAttrs = {
			spinnerSize: 'large'
		}

		this.spinnerSAttrs = {
			spinnerSize: 'small'
		}

		this.spinnerCAttrs = {
			spinnerSize: 'small',
			mainFrameCount: 11,
			finalFrameCount: 7,
			fps: 10
		}

		this.spinnerModel = {
			spinning: false
		}
		this.controller.setupWidget('large-activity-spinner', this.spinnerLAttrs, this.spinnerModel);
		this.controller.setupWidget('small-activity-spinner', this.spinnerSAttrs, this.spinnerModel);
		this.controller.setupWidget('custom-activity-spinner', this.spinnerCAttrs, this.spinnerModel);
			
		//set up button handlers
		this.spinOn = this.spinOn.bindAsEventListener(this);
		this.spinOff = this.spinOff.bindAsEventListener(this);
        Mojo.Event.listen(this.controller.get('spinner-on'),Mojo.Event.tap, this.spinOn)
        Mojo.Event.listen(this.controller.get('spinner-off'),Mojo.Event.tap, this.spinOff)
}    
    
SpinnerAssistant.prototype.spinOn = function(){
			this.spinnerModel.spinning = true;
			this.controller.modelChanged(this.spinnerModel);       
}

SpinnerAssistant.prototype.spinOff = function(){
			this.spinnerModel.spinning = false;
			this.controller.modelChanged(this.spinnerModel);	      
}

SpinnerAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


SpinnerAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

SpinnerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  Mojo.Event.stopListening(this.controller.get('spinner-on'),Mojo.Event.tap, this.spinOn)
      Mojo.Event.stopListening(this.controller.get('spinner-off'),Mojo.Event.tap, this.spinOff)
}
