function WebViewAssistant(link) {
  this.link = 'www.palm.com';
}

WebViewAssistant.prototype.setup = function() {
  this.controller.setupWidget('web-view', {url:this.link});

  this.reloadModel = {
    label: $L('Reload'),
    icon: 'refresh',
    command: 'refresh'
  };

  this.stopModel = {
    label: $L('Stop'),
    icon: 'load-progress',
    command: 'stop'
  };

  this.cmdMenuModel = {
    visible: true,
    items: [ {} ]
  };
//mojo-event-webViewLoadProgress           
//mojo-event-webViewLoadStarted
//mojo-event-webViewLoadStopped
//mojo-event-webViewLoadFailed
//mojo-event-webViewDownloadFinished
//mojo-event-webViewLinkClicked
//mojo-event-webViewDownloadFinished
//mojo-event-webViewTitleUrlChanged
//mojo-event-webViewTitleChanged
//mojo-event-webViewUrlChanged
//mojo-event-webViewCreatePage
//mojo-event-webViewTapRejected
//mojo-event-webViewScrollAndScaleChanged
//mojo-event-webViewEditorFocused
//mojo-event-webViewUpdateHistory
//mojo-event-webViewSetMainDocumentError
//mojo-event-webViewServerConnect
//mojo-event-webViewServerDisconnect
//mojo-event-webViewResourceHandoff
//mojo-event-webViewFirstPaintComplete
//mojo-event-webViewUrlRedirect
//mojo-event-webViewModifierTap
//mojo-event-webViewMimeNotSupported
//mojo-event-webViewMimeHandoff
  this.progress = this.progress.bind(this);
  this.started = this.started.bind(this);
  this.stopped = this.stopped.bind(this);
  this.finished = this.finished.bind(this);
  
  
  Mojo.Event.listen(this.controller.get('web-view'), Mojo.Event.webViewLoadProgress, this.progress);
  Mojo.Event.listen(this.controller.get('web-view'), Mojo.Event.webViewLoadStarted, this.started);
  Mojo.Event.listen(this.controller.get('web-view'), Mojo.Event.webViewLoadStopped, this.stopped);
  Mojo.Event.listen(this.controller.get('web-view'), Mojo.Event.webViewLoadFailed, this.stopped);
  Mojo.Event.listen(this.controller.get('web-view'), Mojo.Event.webViewDidFinishDocumentLoad, this.stopped);
  Mojo.Event.listen(this.controller.get('web-view'), Mojo.Event.webViewDownloadFinished, this.finished);
  this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass:'no-fade'}, this.cmdMenuModel);
}

WebViewAssistant.prototype.activate = function(event) {

}

WebViewAssistant.prototype.started = function(event) {
  this.cmdMenuModel.items.pop(this.reloadModel);
  this.cmdMenuModel.items.push(this.stopModel);

  this.controller.modelChanged(this.cmdMenuModel);

  this.currLoadProgressImage = 0;
}

WebViewAssistant.prototype.stopped = function(event) {
  this.cmdMenuModel.items.pop(this.stopModel);
  this.cmdMenuModel.items.push(this.reloadModel);
  this.controller.modelChanged(this.cmdMenuModel);
}

WebViewAssistant.prototype.finished = function(event) {

}

WebViewAssistant.prototype.deactivate = function(event) {

}

WebViewAssistant.prototype.cleanup = function(event) {
  Mojo.Event.stopListening(this.controller.get('web-view'), Mojo.Event.webViewLoadProgress, this.progress);
  Mojo.Event.stopListening(this.controller.get('web-view'), Mojo.Event.webViewLoadStarted, this.started);
  Mojo.Event.stopListening(this.controller.get('web-view'), Mojo.Event.webViewLoadStopped, this.stopped);
  Mojo.Event.stopListening(this.controller.get('web-view'), Mojo.Event.webViewLoadFailed, this.stopped);
  Mojo.Event.stopListening(this.controller.get('web-view'), Mojo.Event.webViewDidFinishDocumentLoad, this.stopped);
  Mojo.Event.stopListening(this.controller.get('web-view'), Mojo.Event.webViewDownloadFinished, this.finished);
}

WebViewAssistant.prototype.progress = function(event) {
  var percent = event.progress;

  try {
    if (percent > 100) {
      percent = 100;
    }
    else if (percent < 0) {
      percent = 0;
    }
		
		// Update the percentage complete
    this.currLoadProgressPercentage = percent;
		
		// Convert the percentage complete to an image number
    // Image must be from 0 to 23 (24 images available)
    var image = Math.round(percent / 4.1);
    if (image > 23) {
      image = 23;
    }
		
		// Ignore this update if the percentage is lower than where we're showing
    if (image < this.currLoadProgressImage) {
      return;
    }
		
		// Has the progress changed?
    if (this.currLoadProgressImage != image) {
      var icon = this.controller.select('div.load-progress')[0];
      if (icon) {
        this.loadProgressAnimator = Mojo.Animation.animateValue(Mojo.Animation.queueForElement(icon), "linear", this._updateLoadProgress.bind(this), {
          from: this.currLoadProgressImage,
          to: image,
          duration: 0.5
        });
      }
    }
  }
  catch (e) {
    Mojo.Log.logException(e, e.description);
  }
};
WebViewAssistant.prototype._updateLoadProgress = function(image) {
  // Find the progress image
  image = Math.round(image);
	// Don't do anything if the progress is already displayed
  if (this.currLoadProgressImage == image) {
    return;
  }
  var icon = this.controller.select('div.load-progress');
  if (icon && icon[0]) {
    icon[0].setStyle({'background-position': "0px -" + (image * 48) + "px"});
  }
  this.currLoadProgressImage = image;
};

WebViewAssistant.prototype.handleCommand = function(event) {
  if (event.type == Mojo.Event.command) {
//    switch (event.command) {
//      case 'refresh':
//        this.controller.get('web-view').mojo.reloadPage();
//        break;
//      case 'stop':
//        this.controller.get('web-view').mojo.stopLoad();
//        break;
//    }

	this.controller.get('web-view').mojo.getHistoryState(this.temp);
	//console.log("temp" + temp);
  }
};
WebViewAssistant.prototype.temp = function(event){
	console.log("In htere" + event);
}
