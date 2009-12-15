function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	if ((new TimeBomb()).trialExpired()){
		this.controller.pushScene('expiration', {inPopupStage:false});		
	}
	else {
		this.controller.pushScene('main');
	}
}
