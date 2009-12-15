function RichtextAssistant(argFromPusher) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}
    
RichtextAssistant.prototype.setup = function() {		
    /* set the widget up here */
		this.controller.setupWidget(Mojo.Menu.appMenu, {richTextEditMenu: true}, {});
		
		this.controller.setupWidget("richtexteditId",
		     this.attributes = {

		     },
		     this.model = {
		         value: "This be some text"
		});

		this.controller.setupWidget('richtexteditId', this.attributes, this.model);
}

RichtextAssistant.prototype.handleUpdate = function(event){
	/* write the value of the text field */
	console.log(event + " : " + this.model.value);
}
RichtextAssistant.prototype.handleButton = function(event){
	/* write the value of the text field */
	this.controller.get('richtexteditId').focus();
	this.controller.get('richtexteditId').select();
	this.controller.document.execCommand("bold", false, null);
}    
RichtextAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


RichtextAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

RichtextAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}