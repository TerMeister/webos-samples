function ListAssistant() {
	this.accountId = null;
}	
	
ListAssistant.prototype.setup = function(){
	this.innerListAttrs = {
		listTemplate: 'device/contacts/list/listcontainer',
		itemTemplate: 'device/contacts/list/listItem',
		emptyTemplate: 'device/contacts/list/empty',
		addItemLabel:$L("Add...")
	};
	
	this.listModel = {
		listTitle: $L('Contacts'),
		items: []
	};	
	
	this.controller.setupWidget('contacts_list', this.innerListAttrs, this.listModel);
	
	Mojo.Event.listen(this.controller.get('contacts_list'), Mojo.Event.listTap, this.listClickHandler.bind(this))
	Mojo.Event.listen(this.controller.get('contacts_list'), Mojo.Event.listAdd, this.AddContact.bindAsEventListener(this));
	this.controller.serviceRequest('palm://com.palm.accounts/crud', {
			method: 'createAccount',
			parameters: {
				username: 'PalmDTS',
				domain: 'com.palmdts',
				displayName: 'Palm DTS',
				icons: {
					largeIcon: undefined,
					smallIcon: undefined
				},
				dataTypes: ["CONTACTS"],
				isDataReadOnly: false
			},
			onSuccess: function(response){
				this.accID = response.accountId
			}.bind(this),
			onFailure: function(resp){
				console.log(resp.errorText)
			},
			onerror: function(resp){
				console.log(resp.errorText)
			}
		});
}
ListAssistant.prototype.getContactsList = function(){
	this.controller.serviceRequest('palm://com.palm.contacts/crud', {
	     method:   'listContacts',
	     parameters: {
	         accountId: this.accID,
			 offset: 0,
	         limit: 100
     	 },
	     onSuccess: this.handleListResponse.bind(this),
	     onFailure: function(errResp){
		 	//this.controller.get('info_area').update("Error: " + errResp.errorText)
			Mojo.Log.info(errResp.errorText)
		 }.bind(this),
		 onerror: function(errResp){
		 	Mojo.Log.info(errResp.errorText)
		 	//this.controller.get('info_area').update("Error: " + errResp.errorText)
		 }.bind(this)
	});
}

ListAssistant.prototype.handleListResponse = function(response){ 
    var contactList = [];
	var aid = this.accID;
	    if (response.list.length > 0) {
        response.list.each(function(item){
            contactList.push({
                accountId: aid,
                contactId: item.id,
                firstName: item.firstName,
                lastName: item.lastName
            });
        });
    	this.controller.get('info_area').update('');
	}else {
        this.controller.get('info_area').update('<center>There are no contacts</center>');
    }
    
    this.listModel.items = contactList;
    this.controller.modelChanged(this.listModel);
}    
ListAssistant.prototype.listClickHandler = function(event){
    if (event.originalEvent.target.hasClassName('contact')) {
    	this.controller.stageController.assistant.showScene('device/contacts/contactdetail','contactdetail',event.item);
    }        
}
    
ListAssistant.prototype.AddContact = function(event){
	this.controller.stageController.assistant.showScene('device/contacts/add','add',this.accID);
}

ListAssistant.prototype.activate = function(event) {
	
	if(this.accID){
		this.getContactsList();
	}
}

ListAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

ListAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}