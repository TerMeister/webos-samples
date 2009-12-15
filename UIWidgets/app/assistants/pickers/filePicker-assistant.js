function FilePickerAssistant() {
}
	
FilePickerAssistant.prototype.setup = function() {
	this.handleButtonPress = this.handleButtonPress.bind(this)
	this.handleButton1Press = this.handleButtonPress1.bind(this)
	this.handleButton2Press = this.handleButtonPress2.bind(this)
	this.handleButton3Press = this.handleButtonPress3.bind(this)
	this.handleButton4Press = this.handleButtonPress4.bind(this)
    Mojo.Event.listen(this.controller.get('push_button'),Mojo.Event.tap, this.handleButtonPress)
    Mojo.Event.listen(this.controller.get('push_button1'),Mojo.Event.tap, this.handleButtonPress1)
    Mojo.Event.listen(this.controller.get('push_button2'),Mojo.Event.tap, this.handleButtonPress2)
    Mojo.Event.listen(this.controller.get('push_button3'),Mojo.Event.tap, this.handleButtonPress3)
    Mojo.Event.listen(this.controller.get('push_button4'),Mojo.Event.tap, this.handleButtonPress4)

}

FilePickerAssistant.prototype.handleButtonPress = function(event){
	var params = {
        defaultKind: 'file',
		onSelect: function(file){
		$('selection').innerHTML = Object.toJSON(file);
		}
	}
	Mojo.FilePicker.pickFile(params, this.controller.stageController);
}

FilePickerAssistant.prototype.handleButtonPress1 = function(event){
	var params1 = {
        kinds: ['file'],
		extensions: ['pdf','doc'],
		onSelect: function(file){
		$('selection').innerHTML = Object.toJSON(file);
		}
	}
	Mojo.FilePicker.pickFile(params1, this.controller.stageController);
}

FilePickerAssistant.prototype.handleButtonPress2 = function(event){
	var params2 = {
		kinds: ['audio'],
		onSelect: function(file){
		$('selection').innerHTML = Object.toJSON(file);
		}
	}
	Mojo.FilePicker.pickFile(params2, this.controller.stageController);
}

FilePickerAssistant.prototype.handleButtonPress3 = function(event){
	var params3 = {
		kinds: ['image'],
		onSelect: function(file){
		$('selection').innerHTML = Object.toJSON(file);
		}
	}
	Mojo.FilePicker.pickFile(params3, this.controller.stageController);
}

FilePickerAssistant.prototype.handleButtonPress4 = function(event){
	var params4 = {
		kinds: ['video'],
		onSelect: function(file){
		$('selection').innerHTML = Object.toJSON(file);
		}
	}
	Mojo.FilePicker.pickFile(params4, this.controller.stageController);
}


FilePickerAssistant.prototype.activate = function(){
	/* You can show an image on startup from here if you want */
}
	
/*
* Cleanup anything we did in the activate function
*/
FilePickerAssistant.prototype.deactivate = function(){
	
}
	
/*
 * Cleanup anything we did in setup function
 */
FilePickerAssistant.prototype.cleanup = function(){
	Mojo.Event.stopListening(this.controller.get('push_button'),Mojo.Event.tap, this.handleButtonPress)
    Mojo.Event.stopListening(this.controller.get('push_button1'),Mojo.Event.tap, this.handleButtonPress1)
    Mojo.Event.stopListening(this.controller.get('push_button2'),Mojo.Event.tap, this.handleButtonPress2)
    Mojo.Event.stopListening(this.controller.get('push_button3'),Mojo.Event.tap, this.handleButtonPress3)
    Mojo.Event.stopListening(this.controller.get('push_button4'),Mojo.Event.tap, this.handleButtonPress4)
}