function AccountsAssistant(accountRequest) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  	
	  //if this scene was pushed from the calendar or contacts examples & they've requested an 
	  //account to use then take note of it with this.accountRequest so that when an account is
	  //selected from the list of accounts we return that account id for use.
	  if (accountRequest != undefined){
	  	this.accountRequest = accountRequest;
	  }
}

AccountsAssistant.prototype.setup = function() {

	/* this function is for setup tasks that have to happen when the scene is first created */
        
        this.innerListAttrs = {
            listTemplate: 'device/accounts/accounts/listcontainer',
            itemTemplate: 'device/accounts/accounts/listItem',
			emptyTemplate: 'device/contacts/list/empty',
			addItemLabel:$L("Add...")
        };
		
		this.contactList = []
		this.listModel = {listTitle:$L('Accounts List'), items:this.contactList};
        
		
        this.controller.setupWidget('account_list', this.innerListAttrs, this.listModel);
        
        Mojo.Event.listen(this.controller.get('account_list'),Mojo.Event.listTap, this.listClickHandler.bind(this))
        Mojo.Event.listen(this.controller.get('account_list'), Mojo.Event.listAdd, this.createAccount.bindAsEventListener(this));
		//Mojo.Event.listen($('create_button'),Mojo.Event.tap, this.createAccount.bind(this))
		
}
AccountsAssistant.prototype.createAccount = function(event){
	this.controller.stageController.assistant.showScene('device/accounts/createaccount','createaccount');
}	
AccountsAssistant.prototype.getList = function(event){
	this.controller.serviceRequest('palm://com.palm.accounts/crud', {
		     method:   'listAccounts',
		     parameters: {},
		     onSuccess: function(response){
			 	var mycontactList = [];
				if(response.list.length > 0){					
		            response.list.each(function(item){
			   			mycontactList.push({
		            		account: item.displayName,
					    	accountId: item.accountId					   
		           		});			   						   			
				 	});
					this.listModel.items = mycontactList;
				    this.controller.modelChanged(this.listModel);
					this.controller.get('info_area').update('');
				 }else{
				 	this.controller.get('info_area').update('<center>There are no accounts</center>');
				 }
				
			 }.bind(this),
		     onFailure: function(errResp){
			 	this.controller.get('info_area').update("Error: " + errResp)
			 }.bind(this)			 
		});
}

AccountsAssistant.prototype.listClickHandler = function(event){
	//this.accountRequest will be defined if this scene was pushed from the calendar or contacts examples &
	//they've requested an account to use
	if (this.accountRequest != undefined){
		Mojo.Controller.stageController.popScene(event.item.accountId);
	}
	else{
		Mojo.Log.info("ACCOUNTID : " + event.item.accountId)
		this.controller.stageController.assistant.showScene('device/accounts/editaccount','editaccount',event.item.accountId);
	}
}
AccountsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	Mojo.Log.info("SCENE ACTIVATED")
	this.getList();  
}


AccountsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

AccountsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
