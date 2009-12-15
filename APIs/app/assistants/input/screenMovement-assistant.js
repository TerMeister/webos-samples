function ScreenMovementAssistant() {

}

ScreenMovementAssistant.prototype.setup = function(){
    //enable drag handlers
	this.dragStartHandler = this.dragStart.bindAsEventListener(this);
	this.draggingHandler = this.dragging.bindAsEventListener(this);
	this.dragEndHandler = this.dragEnd.bindAsEventListener(this);
	this.flickHandler = this.flick.bindAsEventListener(this);
		
	//listen for drag starts & flicks
	this.trackingArea = this.controller.get('tracking-area');
	Element.observe(this.trackingArea, Mojo.Event.dragStart, this.dragStartHandler);  
	Element.observe(this.trackingArea, Mojo.Event.flick, this.flickHandler); 	
}

ScreenMovementAssistant.prototype.dragStart = function(event) {
	$('tracking-output').update("x = " + Event.pointerX(event.down))
	$('tracking-output').insert("<br>")
	$('tracking-output').insert("y = " + Event.pointerY(event.down))
	Element.observe(this.trackingArea, Mojo.Event.dragging, this.draggingHandler);
	Element.observe(this.trackingArea, Mojo.Event.dragEnd, this.dragEndHandler);
	Event.stop(event);
}
	
ScreenMovementAssistant.prototype.dragging = function(event) {
	$('tracking-output').update("x = " + Event.pointerX(event.move))
	$('tracking-output').insert("<br>")
	$('tracking-output').insert("y = " + Event.pointerY(event.move))
    Event.stop(event);
}
	
ScreenMovementAssistant.prototype.dragEnd = function(event) {
	Element.stopObserving(this.trackingArea, Mojo.Event.dragging, this.draggingHandler);
	Element.stopObserving(this.trackingArea, Mojo.Event.dragEnd, this.dragEndHandler);
	Event.stop(event);
}

ScreenMovementAssistant.prototype.flick = function(event) {
	$('tracking-output').update("flick velocity x = " + event.velocity.x)
	$('tracking-output').insert("<br>")
	$('tracking-output').insert("flick velocity y = " + event.velocity.y)
	Event.stop(event);
}