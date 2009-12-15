function DatePickerAssistant() {
}
	
DatePickerAssistant.prototype.setup = function() {
	
	var todayDate = new Date()
	this.attributes = {
		label:	'Date',
		modelProperty:	'value'
	    };
	this.model = {
		value : todayDate,
	}
	
	this.controller.setupWidget('date_field', this.attributes, this.model);
	this.propertyChanged = this.propertyChanged.bindAsEventListener(this)
	Mojo.Event.listen(this.controller.get('date_field'),Mojo.Event.propertyChange,this.propertyChanged);
}

DatePickerAssistant.prototype.propertyChanged = function(event){
	/* log the text field value when the value changes */
		this.showDialogBox("Date changed", "The value of the Date field is now: " + (event.value.getMonth()+1) + "/" + event.value.getDate() + "/" + (event.value.getYear()+1900));
}

DatePickerAssistant.prototype.activate = function(){
	
}
	
/*
 * Cleanup anything we did in the activate function
 */
DatePickerAssistant.prototype.deactivate = function(){
	
}
	
/*
 * Cleanup anything we did in setup function
 */
DatePickerAssistant.prototype.cleanup = function(){
	Mojo.Event.stopListening(this.controller.get('date_field'),Mojo.Event.propertyChange,this.propertyChanged);
}

// This function will popup a dialog, displaying the message passed in.
DatePickerAssistant.prototype.showDialogBox = function(title,message){
		this.controller.showAlertDialog({
		onChoose: function(value) {},
		title:title,
		message:message,
		choices:[ {label:'OK', value:'OK', type:'color'} ]
	});
}