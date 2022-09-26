sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/odata/v2/ODataModel",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox, ODataModel, exportLibrary, Spreadsheet) {
        "use strict";

        //var oModel = new ODataModel(),
        var EdmType = exportLibrary.EdmType;
        return Controller.extend("com.sap.uploadProgram.upload.controller.customerData", {
            onInit: function () {
                var that = this;
                var sServiceUrl, oModel, oObject;
                sServiceUrl = "/sap/opu/odata/sap/ZRTRUI_RATING_SB;v=0001/"; //Fill Service URL here
                this.oModel = new ODataModel(sServiceUrl);
                that.getView().setModel(oModel);
                // if(oModel) {
                //     that.getView().byId("customerDataTable").setVisible(true);
                // } else {
                //     that.getView().byId("customerDataTable").setVisible(false);
                // }        
            },

            /* Function to define actions after value change in file uploader */
            handleValueChange: function (oEvent) {
                var oFileUploader = this.byId("FileUploaderid");
                this.buttonVisibility(oFileUploader);
            },

            /* Funtion to make button visible */
            buttonVisibility: function (file) {
                if (file.getValue()) {
                    this.getView().byId("submit").setVisible(true);
                    //this.getView().byId("testRun").setVisible(true);
                } else {
                    this.getView().byId("submit").setVisible(false);
                    //this.getView().byId("testRun").setVisible(false);
                }
            },

            /* Function to check Upload of the file*/
            handleUploadComplete: function (oEvent) {
                //var sResponse = oEvent.getParameter("response"),
                var sResponse = oEvent.getParameter("status"),
                    responseRaw = oEvent.getParameter("responseRaw"),
                    sMessage;

                if (sResponse) {
                    sMessage = sResponse === 200 ? responseRaw + " (Upload Success)" : responseRaw + " (Upload Error)";
                    MessageBox.information(sMessage);
                }
            },

            /* Function to handle file type mismatch*/
            handleTypeMissmatch: function (oEvent) {
                var aFileTypes = oEvent.getSource().getFileType();
                aFileTypes.map(function (sType) {
                    return "*." + sType;
                });
                MessageBox.error("The file type *." + oEvent.getParameter("fileType") +
                    " is not supported. Choose one of the following types: " +
                    aFileTypes.join(", "));
            },

            /* Function to upload data to back end*/
            // submitFile: function () {
            //     var that = this;

            //     //
            //     var tmpModel = new ODataModel("/sap/opu/odata/sap/ZRTRUI_RATING_SB;v=0001/", true);
            //     tmpModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
            //     tmpModel.setUseBatch(true);
            //     this.getView().setModel(tmpModel, "tmpModel");
            //     tmpModel.setDeferredGroups(["foo"]);
            //     var mParameters = { partner: "00000001", grademethod: "300", success: function (odata, resp) { console.log(resp); }, error: function (odata, resp) { console.log(resp); } };

            //     // for (var m = 0; m < oPayload.length; m++) {
            //         var oPayload = [];
            //         tmpModel.update("/FsRating(partner='00000001', grademethod='300')", oPayload[0], mParameters);
            //     // }
            //     tmpModel.submitChanges(mParameters);
            //     //
            //     var oFileUploader = this.byId("FileUploaderid");
            //     // var oFileJSON = oFileUploader.getModel();
            //     // var oModel = ODataModel;
            //     // var batchChanges = [];

            //     // var oEntry = {};
            //     // oEntry.partner = "00000001";
            //     // oEntry.grademethod = "300";

            //     // batchChanges.push(oModel.create("/FsRating", "POST", oEntry, null));
            //     // oModel.addBatchChangeOperations(batchChanges);
            //     // oModel.setUseBatch(true);
            //     // oModel.submitChanges(batchChanges);

            //     oFileUploader.checkFileReadable().then(function () {
            //         oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
            //             name: "x-csrf-token",
            //             //value: oModel.getSecurityToken()
            //             value: that.tmpModel
            //         }));
            //         oFileUploader.setSendXHR(true);
            //         oFileUploader.upload();
            //     }, function (error) {
            //         MessageBox.information("The file cannot be read. It may have changed.");
            //     }).then(function () {
            //         oFileUploader.clear();
            //         that.buttonVisibility(oFileUploader);
            //     });
            // },

            submitFile: function () {
                var oModel = this.getView().getModel();
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                var oFileUploader = this.byId("FileUploaderid");
                var sMsg = "";

                //check file has been entered
                var sFile = oFileUploader.getValue();
                if (!sFile) {
                    sMsg = "Please select a file first";
                    sap.m.MessageToast.show(sMsg);
                    return;
                }
                else {
                    var that = this;
                    that._addTokenToUploader();
                    oFileUploader.upload();
                    // that.importDialog.close();
                }
            },

            _addTokenToUploader: function () {
                //Add header parameters to file uploader.
                var oDataModel = this.getView().getModel();
                var sServiceUrl = "/sap/opu/odata/sap/ZRTRUI_RATING_SB";
                var sTokenForUpload = oDataModel.getSecurityToken();
                var oFileUploader = this.byId("FileUploaderid");
                var oHeaderParameter = new sap.ui.unified.FileUploaderParameter({
                    name: "X-CSRF-Token",
                    value: sTokenForUpload
                });
         
                var sFile = oFileUploader.getValue();
                var oHeaderSlug = new sap.ui.unified.FileUploaderParameter({
                    name: "SLUG",
                    value: sFile
                });
         
                //Header parameter need to be removed then added.
                oFileUploader.removeAllHeaderParameters();
                oFileUploader.addHeaderParameter(oHeaderParameter);
         
                oFileUploader.addHeaderParameter(oHeaderSlug);
                //set upload url
                var sUrl = sServiceUrl + "/FsRating";
                oFileUploader.setUploadUrl(sUrl);
            },
         
            _parseResponse: function (sResponse, iOffset) {
                var sTempStr, iIndexS, iIndexE;
                //var oParseResults = {};
                var sMessage;
                iIndexS = sResponse.indexOf("<message");
                iIndexE = sResponse.indexOf("</message>");
                if (iIndexS !== -1 && iIndexE !== -1) {
                    sTempStr = sResponse.slice(iIndexS + iOffset, iIndexE);
                    sMessage = sTempStr;
                }
                return sMessage;
         
            },

            /* Function for export functionality */
            onExport: function () {
                var aCols, oRowBinding, oSettings, oSheet, oTable;

                if (!this._oTable) {
                    this._oTable = this.byId('customerDataTable');
                }

                oTable = this._oTable;
                oRowBinding = oTable.getBinding('items');
                aCols = this.createColumnConfig();

                oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: 'Customer Data.xlsx',
                    worker: false // We need to disable worker because we are using a MockServer as OData Service
                };

                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            },

            createColumnConfig: function () {
                var aCols = [];

                aCols.push({
                    label: 'Customer No',
                    property: 'CustomerNo',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Rating Procedure',
                    property: 'RatingProcedure',
                    type: EdmType.String,
                });

                aCols.push({
                    label: 'Rating',
                    property: 'Rating',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Trends',
                    property: 'Trends',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'ID',
                    property: 'ID',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Text',
                    property: 'Text',
                    type: EdmType.String
                });
                return aCols;
            }
        });
    });
