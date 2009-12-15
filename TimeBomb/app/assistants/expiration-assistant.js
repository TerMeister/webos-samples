/*
 * This global object holds general time bomb info.  If you are using the default 
 * expiration behavior then you only need to alter the values of this object's properties.
 */
ExpGlobals = {
	expirationDate: new Date("August 12, 2009 00:00:00"), //Date your app's trial expires
	warningNotice: 30, //# of days prior to the expiration date to display a warning/upgrade notice
	appName: Mojo.appInfo.title  //Name to be displayed when the app expires & in expiration warning popup
};



/*
 * This is the scene assistant for the expiration scene as well as the expiration warning popup.
 */
function ExpirationAssistant(argument) {			
	//start by assuming this scene is being pushed due to the trial expiring
	this.inPopupStage = false;
	this.message = 'Thank you for trying ' + ExpGlobals.appName + '. This trial version has expired. Click here to get the current version from the App Catalog.';
	
	//now find out if we're being pushed from the popup alert stage & update the scene values
	if (argument != undefined){
		if (argument.inPopupStage) {
			this.inPopupStage = true;
			this.message = argument.message;	
			this.stage = argument.stage;	
		}
	}
}

ExpirationAssistant.prototype.setup = function() {
    //set up button widget
	this.controller.setupWidget('launch-catalog-button', {}, {buttonLabel:'Get Current Version'})
	
	//set up button handler
	this.buttonHandler = this.getFullApp.bind(this);	
    Mojo.Event.listen(this.controller.get('launch-catalog-button'),Mojo.Event.tap, this.buttonHandler)
}

//if they hit the button in this scene then they'll be taken to the app catalog to get the latest version
ExpirationAssistant.prototype.getFullApp = function(){
    this.controller.serviceRequest("palm://com.palm.applicationManager", {
        method: "open",
        parameters: {
            id: 'com.palm.app.findapps',
            params: {
				//open to this app's page - functionality coming soon
            }
        }
    });
	
	//if this scene was pushed in a popup alert warning then handle the cleanup needed.
	if (this.inPopupStage) {
		//remove the event listener & close the stage
		Mojo.Event.stopListening(this.controller.get('launch-catalog-button'), Mojo.Event.tap, this.buttonHandler);
		Mojo.Controller.appController.closeStage(this.stage);
	}
}

ExpirationAssistant.prototype.activate = function(event) {
		this.controller.get('info').update(this.message)
}

ExpirationAssistant.prototype.cleanup = function(event) {
	//remove the event listener
	Mojo.Event.stopListening(this.controller.get('launch-catalog-button'),Mojo.Event.tap,this.buttonHandler);
}





/*
 * This function creates a timebomb object to handle the expiration logic.
 */
function TimeBomb() {
}

TimeBomb.prototype.trialExpired = function() {
	var days_til_expiration = this.diffInDays(ExpGlobals.expirationDate);
			
	if (days_til_expiration <= ExpGlobals.warningNotice) {
		//check if we've already shown the warning
		var warningShown = new Mojo.Model.Cookie('warningShown')		
		Mojo.Log.info(Object.toJSON(warningShown.get()))
		
		//if not, show a popup alert warning
		if (warningShown.get() == undefined) {
			var appController = Mojo.Controller.getAppController();
			var stageName = "warningPopupStage";
			var theMessage = "This trial version of " + ExpGlobals.appName + " will expire in " 
				+ days_til_expiration + " day" + ((days_til_expiration > 1)?"s":"") + ". To keep using " 
				+ ExpGlobals.appName + ", click here to get the current version from the App Catalog.";
			
			//if the trial has expired then give them the expired message (but we let them use the app this last time).
			if (days_til_expiration <= 0) {
			  theMessage = 'Thank you for trying ' + ExpGlobals.appName + '. This trial version has expired. Click here to get the current version from the App Catalog.';
			}
			
			var f = function(stageController){
				stageController.pushScene({
					name: "expiration",
					sceneTemplate: "expiration/warningPopup-scene"
				}, {
					message: theMessage,
					inPopupStage: true,
					stage: stageName
				});
			};
			appController.createStageWithCallback({
				name: stageName,
				height: 250,
				lightweight: true
			}, f, 'popupalert');
			
			//store today as the date we showed the warning so it doesn't happen again
			var today = new Date();
			warningShown.put({date: today.toDateString()});
			
			return false;
		}
		else{
			//if they've gotten a warning & it's past the expiration date then the app no longer works
			if (days_til_expiration <= 0) {
				return true;
			}
		}
	}

	//if they made it here then the trial hasn't expired yet
	return false;	
}

//calculate the difference between the passed in date & today, return the number of days
TimeBomb.prototype.diffInDays = function(date){
	var today = new Date();
	var milli_d1 = today.getTime();
	var milli_d2 = date.getTime();
	var diff = milli_d2 - milli_d1;
	var num_days = (((diff / 1000) / 60) / 60) / 24;
	return Math.ceil(num_days)
}