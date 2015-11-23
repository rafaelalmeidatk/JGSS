//======================================================================
// This snippet shows how to save a variable in a save file, process
// that is made through the DataManager
//
// @author: Rafael Almeida
// @date: 23/11/2015
//======================================================================

"use strict";

(function ($) {
	//-----------------------------------------------------------------------------
	// Variables declaration
	//

	var $.foo = null;

	//-----------------------------------------------------------------------------
	// DataManager
	//

	// Alias
	var _DataManager_makeSaveContents = DataManager.makeSaveContents;

	DataManager.makeSaveContents = function() {
		contents = _DataManager_makeSaveContents.call(this);
		// Save "bar" in the variable named foo, this will be written in the save file
		contents.foo = "bar";
		return contents;
	};

	// Alias
	var _DataManager_extractSaveContents = DataManager.extractSaveContents;

	DataManager.extractSaveContents = function(contents) {
		// At this point, $.foo == null
		_DataManager_extractSaveContents.call(this, contents);

		// Get the value of variable foo in the save file and sets in $.foo
		$.foo = contents.foo;

		// Now, $.foo == "bar"
	};
});
