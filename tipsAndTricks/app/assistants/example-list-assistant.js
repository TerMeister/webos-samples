function ExampleListAssistant() {
    this.dataModel = new ExampleModel(101);
    Mojo.Log.info("Example List Init");
}

ExampleListAssistant.prototype.setup = function() {
    Mojo.Log.info("Example List Setup");
    this.controller.setupWidget("listEl", {
        itemTemplate: "example-list/item-template",
        onItemRendered: this.itemRenderedCallback.bind(this),
    }, this.dataModel);
};

ExampleListAssistant.prototype.itemRenderedCallback = function(widget, itemModel, itemNode) {
    var sibling = itemNode,
        index = 0;
    while (sibling = sibling.previousSibling) {
        index++;
    }
    Mojo.Log.info("Rendered index: %d number: %d", index, itemModel.number);
};
