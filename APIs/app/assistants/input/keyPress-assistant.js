function KeyPressAssistant() {

}

KeyPressAssistant.prototype.setup = function(){
	this.div = this.controller.get('echo');
	this.controller.listen(this.controller.sceneElement, Mojo.Event.keyup, this.handleKeyUpEvent.bindAsEventListener(this));
	this.controller.listen(this.controller.sceneElement, Mojo.Event.keydown, this.handleKeyDownEvent.bindAsEventListener(this));
	this.controller.listen(this.controller.sceneElement, Mojo.Event.keypress, this.handleKeyPressEvent.bindAsEventListener(this));
}


KeyPressAssistant.prototype.handleKeyUpEvent = function(event){
	var eventModel = {
		eventType: event.type,
		eventKeyCode: event.originalEvent.keyCode,
		eventChar: String.fromCharCode(event.originalEvent.keyCode)
	};
	var content = Mojo.View.render({template: "input/keyPress/evententry", object: eventModel});
	this.div.insert(content);
}


KeyPressAssistant.prototype.handleKeyDownEvent = function(event){
	var eventModel = {
		eventType: event.type,
		eventKeyCode: event.originalEvent.keyCode,
		eventChar: String.fromCharCode(event.originalEvent.keyCode)
	};
	var content = Mojo.View.render({template: "input/keyPress/evententry", object: eventModel});
	this.div.insert(content);
}


KeyPressAssistant.prototype.handleKeyPressEvent = function(event){
	var eventModel = {
		eventType: event.type,
		eventKeyCode: event.originalEvent.keyCode,
		eventChar: String.fromCharCode(event.originalEvent.keyCode)
	};
	var content = Mojo.View.render({template: "input/keyPress/evententry", object: eventModel});	
	this.div.insert(content);
}