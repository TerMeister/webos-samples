function LoggingAssistant() {

}

LoggingAssistant.prototype.setup = function(){
	Mojo.Event.listen($('log-info'),Mojo.Event.tap, this.logInfo.bind(this))
    Mojo.Event.listen($('add-logging'),Mojo.Event.tap, this.addLogging.bind(this))
    Mojo.Event.listen($('log-properties'),Mojo.Event.tap, this.logProperties.bind(this))
    Mojo.Event.listen($('properties-as-string'),Mojo.Event.tap, this.propertiesAsString.bind(this))
}

LoggingAssistant.prototype.logInfo = function() {
    Mojo.Log.info("I have", 3, "eggs.");
	
    var favoriteColor = 'blue';
    Mojo.Log.info("My favorite color is %s.", favoriteColor);
}
	
LoggingAssistant.prototype.addLogging = function() {
    Mojo.Log.addLoggingMethodsToPrototype(LoggingAssistant);
    this.info("Welcome to the dollhouse.");

}
	
LoggingAssistant.prototype.logProperties = function() {
    function myTestFunc () {
		//do something
	}

	var temp = {
				prop1:'this is property 1', 
				prop2:'this is property 2', 
				function1:myTestFunc
				}
				
	Mojo.Log.logProperties(temp,"tempObject",false)
}

/*This is to demonstrate the Mojo.Log.propertiesAsString function which is not supposed to
 *log function properties.
*/
LoggingAssistant.prototype.propertiesAsString = function(event) {
    function myTestFunc () {
		//do something
	}

	var temp = {
				prop1:'this is property 1', 
				prop2:'this is property 2', 
				function1:myTestFunc
				}
				
	Mojo.Log.logProperties(temp,false)
}