function LazylistlazywidgetsAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	
	this.openStateById = $H(); // map of <model.id> => <open_state>
}

LazylistlazywidgetsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	var thelist = this.controller.get('thelist');
	
	this.controller.setupWidget('thelist', {
		itemsCallback: function(listWidget, offset, length) {
			// generate fake items
			var list= $R(offset, offset+length).collect(function(num) {
				var sublist = $R(0,3).collect(function(i) { return {name:i}; });
				return {id: num, name:"item "+num, items:sublist};
			});
			listWidget.mojo.noticeUpdatedItems(offset, list);
			listWidget.mojo.setLength(1000);
		},
		swipeToDelete: true,
		itemTemplate:'lazylistlazywidgets/listitem',
		onItemRendered: function(listWidget, itemModel, itemNode) {
			if ( this.openStateById.get(itemModel.id) ) {
				
				// set model before creating the drawer so it doesn't animate open
				itemModel.open = true;
				itemNode._ignoreSwipeToDelete = true; // workaround for https://jira.palm.com/browse/NOV-77934
				this.controller.modelChanged(itemModel);
				
				this._addDrawerToItem(itemNode, itemModel);
			}
		}.bind(this)
	});
	
	this.controller.setupWidget('rowdrawer');
	
	this.controller.setupWidget('sublist', {
		itemTemplate:'lazylistlazywidgets/subitem',
		swipeToDelete: true
	});
	
	thelist.observe(Mojo.Event.listDelete, function() {
		Mojo.Log.info("swiping to delete");
	});
	
	/* add event handlers to listen to events from widgets */
	thelist.observe(Mojo.Event.listTap, function(event) {
		// grab the list item. Note that this will be fixed in 1.5 as event.target will be this list item
		var list_element = Mojo.View.findParentByAttribute(event.originalEvent.target, event.target, "list-row-element");
		var model = event.item;
		if ( list_element ) {
			
			this._addDrawerToItem(list_element, model);
			
			// toggle drawer
			model.open = ! model.open;
			list_element._ignoreSwipeToDelete = model.open; // workaround for https://jira.palm.com/browse/NOV-77934
			this.openStateById.set(model.id, model.open);
			this.controller.modelChanged(model);
			Event.stop(event);
			
			// uncomment this block to auto-close all other items when one is opened
			/*if ( model.open ) {
				var range = thelist.mojo.getLoadedItemRange();
				for (var idx=range.offset, length=(range.offset+range.limit); idx < length; idx++) {
					var rowmodel = thelist.mojo.getItemByNode(thelist.mojo.getNodeByIndex(idx));
					if ( rowmodel && rowmodel.id != model.id && rowmodel.open ) {
						rowmodel.open = false;
						this.controller.modelChanged(rowmodel);
					}
				}
				this.openStateById = $H(); // reset
				this.openStateById.set(model.id, true);
			}*/
		}
	}.bindAsEventListener(this));
};

LazylistlazywidgetsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};


LazylistlazywidgetsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

LazylistlazywidgetsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};


// helper method adds a drawer to the list item if one doesn't exist
LazylistlazywidgetsAssistant.prototype._addDrawerToItem = function(itemNode, itemModel) {
	if ( ! itemNode._rowDrawerAdded ) {
		itemNode._rowDrawerAdded = true;
		var template = Mojo.View.convertToNode('<div name="rowdrawer" class="thedrawer" x-mojo-element="Drawer"> \
													<div name="sublist" x-mojo-element="List"></div> \
									  			</div>', document);
		itemNode.appendChild(template);
		
		this.controller.instantiateChildWidgets(itemNode, itemModel);
		this.controller.showWidgetContainer(itemNode);
	}
};
