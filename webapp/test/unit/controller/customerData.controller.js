/*global QUnit*/

sap.ui.define([
	"comsapuploadProgram/upload/controller/customerData.controller"
], function (Controller) {
	"use strict";

	QUnit.module("customerData Controller");

	QUnit.test("I should test the customerData controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
