/* Copyright 2010 Palm, Inc. All rights reserved. */

/**
 * Widget implementing a list UI for DataModelBase implementations.
 * 
 * The model is expected to be an instance of DataModelBase.
 * 
 * Events:
 *   See Mojo.Widget.List
 * 
 * Methods:
 *   - noticeUpdateItems(offset, count) :
 *            Used to signal that the dataset as changed for the given indexes. When called
 *            this method will requery the data source and rerender the elements (as necessary).
 *
 *   - modelChanged
 *            Used to signal that the model has changed and all elements should be rerendered.
 * 
 * List Widget Methods (See Mojo.Widget.List documentation)
 *   - focusItem
 *   - getNodeByIndex
 *   - getLoadedItemRange
 *   - getMaxLadedItems
 *   - revealItem
 */
Mojo.Widget.PagedList = Class.create({
    setup : function() {
        Mojo.assert(this.controller.element, "Mojo.Widget.FilterList requires an element");
        Mojo.assert(this.controller.attributes.itemTemplate, "Mojo.Widget.FilterList requires a template");

        this.initializeDefaultValues();
        this.renderWidget();

        this.controller.scene.watchModel(this.controller.model, this, this.modelChanged.bind(this));

        var listDelegates = ['focusItem', 'getNodeByIndex', 'getLoadedItemRange', 'getMaxLoadedItems', 'revealItem', 'getItemByNode'],
            self = this;
        listDelegates.forEach(function(x) {
            self[x] = function() { return this.pagedList.mojo[x].apply(this.pagedList.mojo, arguments); };
        });
        this.controller.exposeMethods(listDelegates);
        this.controller.exposeMethods(['noticeUpdatedItems', 'modelChanged']);
    },

    initializeDefaultValues: function() {
        this.dataModel = this.controller.model;
        this.divPrefix = Mojo.View.makeUniqueId() + this.controller.scene.sceneId + this.controller.element.id;
        this.listId = this.divPrefix + '-paged-list';
        this.spinnerId = this.divPrefix + '-refresh-spinner';
    },

    noticeUpdatedItems: function(offset, count) {
        // This should pull from the cache
        var dataModel = this.dataModel;
        dataModel.getRange(
            offset, count,
            this.itemsLoaded.bind(this),
            function(result) {
                Mojo.Log.error("Failed to update items: %j", result);
            });
    },

    renderWidget: function() {
        var listAttributes = this.controller.attributes,
            content;

        listAttributes.itemsCallback = this.itemLoadCallback.bind(this)

        content = Mojo.View.render({object: { divPrefix: this.divPrefix }, template: "paged-list/paged-list"});
        Element.insert(this.controller.element, content); //draw this area into the div

        this.pagedList = this.controller.get(this.listId);
        this.refreshContainer = this.controller.element.querySelector(".refresh-cont");

        this.controller.scene.setupWidget(this.listId, listAttributes, {});
        this.controller.scene.setupWidget(this.spinnerId, {size: 'small'}, {spinning: true});

        this.controller.instantiateChildWidgets(this.controller.element);
    },

    itemLoadCallback: function(widget, offset, count) {
        var dataModel = this.dataModel;
        if (!dataModel.isComplete()) {
            this.showRefreshIndicator();
        }

        // Limit the data that we collect to maxItems if set
        var maxItems = this.controller.attributes.maxItems;
        if (maxItems) {
            count = Math.min(offset + count, maxItems) - offset;
            if (count <= 0) {
                return;
            }
        }

        // This must be defered as the setLength will cause duplicate rendering of the
        // items being rendered 
        (function () {
            dataModel.getRange(
                offset, count,
                this.itemsLoaded.bind(this),
                function(result) {
                    Mojo.Log.error("pagedList : Failed to load data: %j", result);
                    if (result && result.reponseText) {
                        Mojo.Log.error("pagedList : ReponseText: %s", result.responseText);
                    }
                });
        }).bind(this).defer();
    },
    itemsLoaded: function(offset, count, results) {
        var listMojo = this.pagedList.mojo,
            dataModel = this.dataModel,
            listLen = listMojo.getLength(),
            knownSize = dataModel.getKnownSize();

        var maxItems = this.controller.attributes.maxItems;
        if (maxItems) {
            knownSize = Math.min(knownSize, maxItems);

            var len = Math.max(Math.min(offset + results.length, maxItems) - offset, 0);
            if (len < results.length) {
                results = results.slice(0, len);
            }
        }

        listMojo.noticeUpdatedItems(offset, results);

        // We want to run this each time incase we can not determine that
        // the model is complete until we get a zero-length response.
        if (dataModel.isComplete()) {
            this.hideRefreshIndicator();
        }

        if (listLen < knownSize) {
            if (dataModel.isComplete()) {
                // We need to invalidate on the last element to force a refresh. Without this the 
                // list may have blank space at the end that will not render the proper elements
                // until a scroll event occurs.
                listMojo.setLengthAndInvalidate(knownSize);
            } else {
                listMojo.setLength(knownSize);
            }
        }
    },

    modelChanged: function() {
        var knownSize = this.dataModel.getKnownSize(),
            maxItems = this.controller.attributes.maxItems;
        if (maxItems) {
            knownSize = Math.min(knownSize, maxItems);
        }

        this.pagedList.mojo.setLengthAndInvalidate(knownSize);
    },

    showRefreshIndicator: function() {
        this.refreshContainer.removeClassName("hidden");
    },
    hideRefreshIndicator: function() {
        this.refreshContainer.addClassName("hidden");
    }
});
