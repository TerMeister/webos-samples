function LazyListAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */		
}

LazyListAssistant.prototype.setup = function() {

	/* this function is for setup tasks that have to happen when the scene is first created */
        
        this.ListAttrs = {
			renderLimit:20,
			lookahead: 15,
			listTemplate: 'lists/lazy-list/listcontainer',
			itemTemplate: 'lists/lazy-list/listItem',
			itemsCallback:this.itemsCallback.bind(this)
        };
		
		this.list = []
		this.maxListLength = 2000;
		
        	this.controller.setupWidget('lazy_list', this.ListAttrs);		
		this.listWidget = $('lazy_list')
		
		//populate the list with some initial items - a real apps items might be coming from a server
		if (this.list.length == 0) {
			this.list.push.apply(this.list, this.makeItems(100, 0));
		}
}

LazyListAssistant.prototype.itemsCallback = function(listWidget, offset, count) {	
	
		Mojo.Log.info($L("offset = ") + offset)
		Mojo.Log.info($L("count = ") + count)		
		Mojo.Log.info($L("list length = ") + this.list.length)		

		//everytime there is a request to get a # of items out of the list's model - add that many more to it
		//as long as we haven't retrieved the maximum # of items (or maybe your list doesn't have a max...)
		//***This could be substituted with a remote call to a server to get more items...		
		if ((offset > 50) && (this.list.length < this.maxListLength)) {
			this.list.push.apply(this.list, this.makeItems(count, this.list.length));
		}
			
		
		// We delay returning the items by .1 seconds in order to more accurately simulate 
		// data being returned from an async service request.
		// If the data is available immediately, it's fine to call 'updateItems' from within this function.
		this.updateListWithNewItems.delay(.1, this.listWidget, offset, this.list.slice(offset, offset+count));
		//callback(offset, this.loremList.slice(offset, offset+count), this.loremList.length);
		
		// It's okay to call this every time, but only the first call will have any affect.
		listWidget.mojo.setLength(this.list.length);
}
	
LazyListAssistant.prototype.updateListWithNewItems = function(listWidget, offset, items) {
		
		listWidget.mojo.noticeUpdatedItems(offset, items);
		
}
	
	// Generates an array of simple items.
LazyListAssistant.prototype.makeItems = function(howMany, offset) {
		var i;
		var items = [];
		
		for(i=0; i < howMany; i++) {
			items.push({id:i+offset});
		}
		
		return items;
}

//Call the readList service whenever this scene is activated (whether through a push or pop) to update the 
//displayed contacts
LazyListAssistant.prototype.activate = function(event) {
	
}

LazyListAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

LazyListAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}