/* Copyright 2010 Palm, Inc. All rights reserved. */
/**
 * A simple widget that combines a textbox and drawer containing submit and cancel buttons.
 * 
 * This must be in the Mojo.Widget package and elements that wish to use this widget must use
 * the name "SubmitText" for their x-mojo-element attribute.
 * 
 * See custom-widget/README for more info
 */
Mojo.Widget.SubmitText = Class.create({
    initialize: function() {
        // Pre bind all of our listeners
        this.statusClickHandler = this.statusClick.bindAsEventListener(this);
        this.onStatusTypingHandler = this.onStatusTyping.bindAsEventListener(this);
        this.submitStatusHandler = this.submitStatus.bindAsEventListener(this);
        this.closeHandler = this.close.bindAsEventListener(this);
    },

    /**
     * Renders and binds the widget.
     * 
     * This is called once per widget on widget creation.
     */
    setup: function() {
        this.initializeDefaultValues();
        this.renderWidget();

        this.setupTextBox();
        this.setupSubPanel();

        // Expose the open and close methods from the widget's mojo object.
        this.controller.exposeMethods(['open', 'close']);
    },
    /**
     * Cleans any objects created by the widget.
     * 
     * This is called once per widget on widget destruction.
     */
    cleanup: function() {
        this.cleanupSubPanel();
        this.cleanupTextBox();
    },

    /**
     * Performs data member tracking.
     */
    initializeDefaultValues: function() {
        // The data model that was passed in to the 
        this.dataModel = this.controller.model;

        // Uniquify the ids of our subwidgets to prevent conflicts with other instances
        // In general we try to use this.controller.element.querySelector and classes rather than IDs
        // when possible.
        this.divPrefix = Mojo.View.makeUniqueId() + this.controller.scene.sceneId + this.controller.element.id;
        this.textInputId = this.divPrefix + "-update-status-text";
        this.submitId = this.divPrefix + "-update-status-submit";
        this.cancelId = this.divPrefix + "-update-status-cancel";
        this.drawerId = this.divPrefix + "-update-status-drawer";
    },

    /**
     * Renders the widget's HTML and initializes any children
     */
    renderWidget: function() {
        var content = Mojo.View.render({object: { divPrefix: this.divPrefix }, template: "submit-text/submit-text"});
        Element.insert(this.controller.element, content);

        // Setup all child widgets
        this.controller.scene.setupWidget(this.textInputId, {
                hintText: $L("What's on your mind?"),
                multiline: true,
                changeOnKeyPress: true,
                limitResize: true,
                enterSubmits: true
            },
            this.dataModel);
        this.controller.scene.setupWidget(this.submitId, {}, {
                buttonLabel: $L('Update')
            });
        this.controller.scene.setupWidget(this.cancelId, {}, {
                buttonClass: 'secondary',
                buttonLabel: $L('Cancel')
            });

        this.controller.scene.setupWidget(this.drawerId, {modelProperty: "open", unstyled: true}, {open: false});

        // Notify the framework that we have new widgets that need to be setup.
        // This is necessary as when this code is executing the framework assumes
        // that all widgets have already been setup.
        this.controller.instantiateChildWidgets(this.controller.element);
    },

    /*
     * External API
     */
    open: function(seed) {
        // Alter our data model and inform any listeners of this change.
        this.dataModel.value = seed || "";
        this.controller.modelChanged(this.dataModel, this);

        this.drawerEl.mojo.setOpenState(true);

        this.textInputEl.mojo.focus();
    },
    close: function() {
        this.dataModel.value = "";
        this.controller.modelChanged(this.dataModel, this);

        this.drawerEl.mojo.setOpenState(false);
    },

    /*
     * Activation UI Section
     */
    setupTextBox: function() {
        this.textInputEl = this.controller.get(this.textInputId);
        this.controller.listen(this.textInputEl, "click", this.statusClickHandler);
        this.controller.listen(this.textInputEl, Mojo.Event.propertyChange, this.onStatusTypingHandler);
    },
    statusClick: function(event) {
        if (!this.drawerEl.mojo.getOpenState()) {
            this.open();
            event.preventDefault();
        }
    },
    onStatusTyping: function(event) {
        if (event.originalEvent && event.originalEvent.type == "keyup" && event.value && event.value.length > 0) {
            if (event.originalEvent.keyCode == 13) {
                this.submitStatusHandler();
            }
        }
    },
    cleanupTextBox: function() {
        this.controller.stopListening(this.textInputEl, Mojo.Event.tap, this.statusClickHandler);
        this.controller.stopListening(this.textInputEl, Mojo.Event.propertyChange, this.onStatusTypingHandler);
    },

    /*
     * Subpanel
     */
    setupSubPanel: function() {
        this.drawerEl = this.controller.get(this.drawerId);
        this.submitEl = this.controller.get(this.submitId);
        this.cancelEl = this.controller.get(this.cancelId);

        this.controller.listen(this.submitEl, Mojo.Event.tap, this.submitStatusHandler);
        this.controller.listen(this.cancelEl, Mojo.Event.tap, this.closeHandler);
    },
    submitStatus: function() {
        // Inform anyone who cares that the user has submitted the text.
        // Clients of this widget can subscribe to the submitEvent using
        // any of the standard HTML event subscription methods.
        var event = Mojo.Event.send(
                this.controller.element,
                Mojo.Widget.SubmitText.submitEvent,
                { value: this.dataModel.value });
        if (!event.defaultPrevented) {
            this.close();
        }
    },
    cleanupSubPanel: function() {
        this.controller.stopListening(this.submitEl, Mojo.Event.tap, this.submitStatusHandler);
        this.controller.stopListening(this.cancelEl, Mojo.Event.tap, this.closeHandler);
    },
});

Mojo.Widget.SubmitText.submitEvent = "com.palm.sample.submitText";
