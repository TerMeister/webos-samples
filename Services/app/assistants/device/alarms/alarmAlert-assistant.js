/* This is an assistant for the popup alert
 */
function AlarmAlertAssistant(argFromPusher){
    this.passedArguments = argFromPusher;
}


AlarmAlertAssistant.prototype.setup = function(){
	//update the scene with the message passed in when setting the alarm
	this.controller.get('info').update(this.passedArguments["message"])
	
    //set up button widget
	this.controller.setupWidget('quit-button', {}, {buttonLabel:'Close'})
    Mojo.Event.listen(this.controller.get('quit-button'), Mojo.Event.tap, this.handleQuitButton.bind(this))
}

AlarmAlertAssistant.prototype.handleQuitButton = function(){
	//close just this popupAlert stage
    Mojo.Controller.appController.closeStage(this.passedArguments.stageName);
}