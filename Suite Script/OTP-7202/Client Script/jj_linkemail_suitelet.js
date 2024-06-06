/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/*****************************************************************************************************************************************************************************************
**************************
*
*${OTP-7202 }:${Custom page for display sales order based on the status}
*
******************************************************************************************************************************************************************************************
**************************
 *
 * Author : Jobin and Jismi
 *
 * Date Created : 13-May-2024
 *
 * Created by :Gopinath M , Jobin and Jismi IT Services.
 *
 * Description : Custom page for display sales order based on the status.
 *
 *
*****************************************************************************************************************************************************************************************
******************************/

define(['N/currentRecord', 'N/record', 'N/search', 'N/url'],
    /**
     * @param{currentRecord} currentRecord
     * @param{record} record
     * @param{search} search
     * @param{serverWidget} serverWidget
     * @param{url} url
     */
    function (currentRecord, record, search, url) {

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            try {
                let subsidiaryId = scriptContext.currentRecord.getValue({
                    fieldId: 'subsidiaryname'
                });

                let customerId = scriptContext.currentRecord.getValue({
                    fieldId: 'customername'
                });

                let status = scriptContext.currentRecord.getValue({
                    fieldId: 'status'
                });
                let departmentId = scriptContext.currentRecord.getValue({
                    fieldId: 'departmentname'
                });
                //connecting suitelet script to the client and passing parameters.
                document.location = url.resolveScript({
                    scriptId: 'customscript_jj_searchfilter_status',
                    deploymentId: 'customdeploy_jj_searchfilter_status',
                    params: {
                        'clientScriptCustomer': customerId,
                        'clientScriptSubsidiary': subsidiaryId,
                        'clientScriptStatus': status,
                        'clientScriptDepartment': departmentId
                    }
                });

            } catch (e) {
                console.error('An error in client script', e)
            }
        }
        return { fieldChanged: fieldChanged };
    });