/* See LICENSE */
function CustomWidgetAssistant() {
    this.submitTextHandler = this.submitText.bindAsEventListener(this);

    this.textModel = {};
}

CustomWidgetAssistant.prototype.setup = function() {
    this.controller.setupWidget("testWidget", {}, this.textModel);

    this.controller.listen("testWidget", Mojo.Widget.SubmitText.submitEvent, this.submitTextHandler);
};
CustomWidgetAssistant.prototype.cleanup = function() {
    this.controller.stopListening("testWidget", Mojo.Widget.SubmitText.submitEvent, this.submitTextHandler);
};

CustomWidgetAssistant.prototype.submitText = function(event) {
    this.controller.sceneElement.querySelector(".status-output").innerHTML = this.textModel.value;
};
